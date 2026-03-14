# AI-Powered Conversational Form Builder

This project is a full-stack, containerized application that allows users to progressively construct complex JSON schemas and dynamic forms through a conversational interface with an AI (powered by Google Gemini/OpenAI models). It enforces structured data and handles conditional logic `x-show-when`.

## Features
- **Conversational Interface:** Chat with an AI assistant to build out standard or complex form schemas incrementally.
- **Robust Schema Generation:** The backend ensures that the LLM generates strict Draft 7 JSON schemas, validating outputs via `ajv` and utilizing an automatic retry mechanism.
- **Ambiguity Detection:** Detects vague user prompts (e.g., "Make a form for booking a meeting room") and stops to ask for clarification before guessing.
- **Real-time Live Render & Conditional Logic:** Updates the preview in real-time. Features recursive schema filtering to support conditional UI rendering via the `x-show-when` extension.
- **Schema Version Diffing:** Graphically points out differences (`+`, `-`, `~`) between subsequent schema versions in a conversation.
- **Export & Code Snippets:** Easily integrate generated forms into your database or React app with one click.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, `@rjsf/core` (React JSON Schema Form), `deep-diff`
- **Backend:** Node.js, Express, `ajv`, `@google/genai`
- **Infrastructure:** Docker, Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed.
- Node.js (v20+) installed if running without Docker.
- A valid Google Gemini API Key (`LLM_API_KEY`) or an OpenAI API Key.

### Quick Start (Docker)

1. Navigate to the `backend/` directory and configure your environment variables:
   \`\`\`bash
   cd backend
   cp .env.example .env
   \`\`\`
2. Open `backend/.env` and update the `LLM_API_KEY` placeholder.
3. In the root directory, run:
   \`\`\`bash
   docker-compose up --build
   \`\`\`
   - The React frontend will be available at: http://localhost:5173
   - The Express backend handles API requests internally on port `8080`.

---

## Endpoints

### `GET /health`
Returns the status of the backend server.
\`\`\`json
{
  "status": "healthy"
}
\`\`\`

### `POST /api/form/generate`
The main LLM conversation endpoint.
- **Body (`prompt`, `conversationId`)**
- Returns a Draft 7 standard schema object. Handles schema errors, multi-turn state via the memory-map store, and triggers clarifications.

## Project Structure & Architecture

\`\`\`
project-root/
│
├── docker-compose.yml       # Orchestrates both services seamlessly
├── README.md                # Documentation guide
│
├── backend/                 # Backend Node.js service
│   ├── Dockerfile
│   ├── .env.example
│   ├── server.js            # Express API definition, health check & retry mock handling
│   ├── llm.js               # State handling, generation tracking, and retries.
│   └── schemaValidator.js   # Encapsulated ajv draft-7 verification logic.
│
├── frontend/                # Frontend Vite React App
│   ├── Dockerfile
│   ├── index.html
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx          # Dual-pane Layout and state
│       └── components/      # ChatPane, FormRenderer, SchemaDiff, ExportPanel
\`\`\`

## Architecture Decisions & Constraints

- **Form Renderer `x-show-when` logic decoupling:** Core RJSF does not support the exact syntax of `x-show-when` natively safely out-of-the-box. We used a pure recursive Javascript schema filter pattern in the renderer before handing it off to the component standard logic.
- **LLM Output Forcing:** To combat hallucination, the generation explicitly provides structured few-shot examples inside a tight `SYSTEM_PROMPT`. A hard retry loops standard JSON parse and schema checks, drastically dropping error probability in test loads.
- **State Store Limitations:** Right now, the state rests in an in-memory `Map`. For scaling horizontally, one would drop-in Postgres/Redis behind a `genai` abstraction. It is memory-efficient enough for this scope.
