const { GoogleGenAI } = require('@google/genai');
const { v4: uuidv4 } = require('uuid');
const { validateSchema } = require('./schemaValidator');

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });
const conversations = new Map();

const SYSTEM_PROMPT = `You are a helpful UI/UX assistant that generates JSON Schema (Draft 7) for web forms based on user requests.
Your response MUST be ONLY a valid JSON object representing the JSON Schema. No markdown, no explanations. 
If the user's request is ambiguous (e.g., "Make a form for booking a meeting room" without specifying fields), you must instead respond with a JSON object asking for clarification matching exactly this structure:
{
  "status": "clarification_needed",
  "questions": ["Question 1?", "Question 2?"]
}

The schema must use standard Draft 7 properties.
For conditional logic, use the custom property 'x-show-when' on the field to be conditionally shown.
Example of x-show-when:
"emailFrequency": {
  "type": "string",
  "title": "Email Frequency",
  "x-show-when": { "field": "sendNewsletter", "equals": true }
}
`;

function getHistoryContext(history) {
    if (!history || history.length === 0) return '';
    return "Previous conversation context:\n" + history.map(msg => `${msg.role}: ${msg.content}`).join('\n') + "\n\n";
}

async function generateFormSchema(prompt, conversationId, retryCount = 0) {
    let id = conversationId || uuidv4();
    let convState = conversations.get(id) || { version: 0, history: [] };

    let messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...convState.history,
        { role: 'user', content: prompt }
    ];

    try {
        const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: messages.map(m => m.content).join('\n') // Simplified for Gemini API or adapt appropriately
        });

        let text = response.text;
        if(text.startsWith('```json')) {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const parsedOutput = JSON.parse(text);

        if (parsedOutput.status === 'clarification_needed') {
             // Store the ambiguity turn
             convState.history.push({ role: 'user', content: prompt });
             convState.history.push({ role: 'assistant', content: text });
             conversations.set(id, convState);
             return { ...parsedOutput, conversationId: id };
        }

        const validation = validateSchema(parsedOutput);
        
        if (!validation.valid) {
            if (retryCount < 2) {
                console.log(`Validation failed, retrying (${retryCount + 1}/2)...`, validation.errors);
                const retryPrompt = `Your previous attempt failed validation. Create a valid schema. Error: ${JSON.stringify(validation.errors)}. Original prompt: ${prompt}`;
                return generateFormSchema(retryPrompt, id, retryCount + 1);
            } else {
                throw new Error("Failed to generate valid schema after multiple attempts.");
            }
        }

        convState.version += 1;
        convState.schema = parsedOutput;
        convState.history.push({ role: 'user', content: prompt });
        convState.history.push({ role: 'assistant', content: JSON.stringify(parsedOutput) });
        conversations.set(id, convState);

        return {
            formId: id,
            version: convState.version,
            schema: parsedOutput,
            conversationId: id
        };

    } catch (error) {
        console.error("LLM Generation Error:", error);
        
        if (error.message.includes("Failed to generate valid schema after multiple attempts.")) {
             throw error; 
        }

        // Hard fallback for unparseable JSON on retry
        if (error instanceof SyntaxError && retryCount < 2) {
            console.log(`Syntax error, retrying (${retryCount + 1}/2)...`);
            const retryPrompt = `Your previous attempt did not return valid JSON. Ensure your output is purely a JSON object without any markup. Original prompt: ${prompt}`;
            return generateFormSchema(retryPrompt, id, retryCount + 1);
        }

        throw new Error("Internal Server Error");
    }
}

module.exports = { generateFormSchema };
