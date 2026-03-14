import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Bot, User } from 'lucide-react';

export default function ChatPane({ onNewSchema, conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/form/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Got a server error');
      }

      if (data.status === 'clarification_needed') {
        const questionsText = data.questions.join('\n• ');
        setMessages(prev => [...prev, { 
          text: `I need a bit more detail to build this perfectly:\n• ${questionsText}`, 
          sender: 'ai',
          isClarification: true
        }]);
        // Clarification doesn't update the form
        return;
      }

      // Valid schema received
      setMessages(prev => [...prev, { 
        text: `Form generated successfully (v${data.version}). I've updated the preview on the right.`, 
        sender: 'ai' 
      }]);
      onNewSchema(data.schema, data.conversationId);

    } catch (error) {
      setMessages(prev => [...prev, { 
        text: `Error: ${error.message}`, 
        sender: 'error' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
        {messages.length === 0 && (
          <div className="mt-auto mb-auto bg-indigo-50/50 p-6 rounded-2xl text-center border border-indigo-100/50">
            <Bot className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-80" />
            <h3 className="font-semibold text-indigo-900 mb-2">AI Architect Ready</h3>
            <p className="text-sm text-indigo-600/80 leading-relaxed">
              Describe the data you want to collect, and I'll generate a dynamic, validated form instantly.
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
          >
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 
                  msg.sender === 'error' ? 'bg-rose-100 text-rose-500' : 'bg-indigo-100 text-indigo-600'}`
              }>
                {msg.sender === 'user' ? <User size={16} /> : 
                 msg.sender === 'error' ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed relative
                ${msg.sender === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : msg.sender === 'error'
                    ? 'bg-rose-50 border border-rose-200/50 text-rose-700 font-medium rounded-tl-none'
                    : msg.isClarification
                      ? 'bg-amber-50 border border-amber-200/50 text-amber-800 rounded-tl-none'
                      : 'bg-white border border-slate-200/60 text-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex max-w-[85%] flex-row items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-200/60 text-slate-500 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="E.g., A registration form with an email & password..."
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all placeholder-slate-400 text-[15px]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
