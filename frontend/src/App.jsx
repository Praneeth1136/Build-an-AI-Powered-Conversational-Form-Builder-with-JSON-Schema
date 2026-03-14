import { useState, useEffect } from 'react';
import ChatPane from './components/ChatPane';
import FormRenderer from './components/FormRenderer';
import SchemaDiff from './components/SchemaDiff';
import ExportPanel from './components/ExportPanel';
import { Layers, Code, PlaySquare, Settings, LayoutTemplate } from 'lucide-react';

function App() {
  const [schema, setSchema] = useState(null);
  const [previousSchema, setPreviousSchema] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'json', 'diff', 'export'

  const handleNewSchema = (newSchema, id) => {
    if (schema) {
      setPreviousSchema(schema);
    }
    setSchema(newSchema);
    setConversationId(id);
    
    if (schema) {
      setIsDiffVisible(true);
      setActiveTab('diff');
    } else {
      setActiveTab('preview');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* LEFT PANE - Chat */}
      <div 
        className="w-1/3 min-w-[350px] max-w-[500px] border-r border-slate-200 bg-white flex flex-col shadow-sm z-10"
        data-testid="chat-pane"
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-inner">
            <LayoutTemplate className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight">AI Form Builder</h1>
            <p className="text-xs text-slate-500 font-medium">Conversational schema generation</p>
          </div>
        </div>
        <ChatPane 
          onNewSchema={handleNewSchema} 
          conversationId={conversationId} 
        />
      </div>

      {/* RIGHT PANE - Form Renderer & Tools */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {schema ? (
          <>
            <div className="flex px-6 pt-4 border-b border-slate-200 bg-white shadow-sm gap-6">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <PlaySquare className="w-4 h-4" /> Form Preview
              </button>
              <button 
                onClick={() => setActiveTab('json')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'json' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Code className="w-4 h-4" /> JSON Schema
              </button>
              {previousSchema && (
                <button 
                  onClick={() => setActiveTab('diff')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'diff' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Layers className="w-4 h-4" /> Schema Diff
                </button>
              )}
              <button 
                onClick={() => setActiveTab('export')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ml-auto ${activeTab === 'export' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Settings className="w-4 h-4" /> Export
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 relative">
              <div className="absolute top-0 right-0 p-32 pointer-events-none opacity-[0.03]">
                 <LayoutTemplate className="w-[400px] h-[400px]" />
              </div>

              {activeTab === 'preview' && (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative z-10" data-testid="form-renderer-pane">
                  <FormRenderer schema={schema} />
                </div>
              )}
              {activeTab === 'json' && (
                <div className="max-w-4xl mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-lg p-6 relative z-10">
                   <pre className="text-sm font-mono text-green-400 overflow-auto">{JSON.stringify(schema, null, 2)}</pre>
                </div>
              )}
              {activeTab === 'diff' && previousSchema && (
                <div className="max-w-4xl mx-auto relative z-10">
                   <SchemaDiff oldSchema={previousSchema} newSchema={schema} />
                </div>
              )}
              {activeTab === 'export' && (
                <div className="max-w-4xl mx-auto relative z-10">
                   <ExportPanel schema={schema} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center" data-testid="form-renderer-pane">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
               <LayoutTemplate className="w-10 h-10 text-indigo-300 relative z-10 group-hover:text-indigo-500 transition-colors duration-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No Form Generated Yet</h2>
            <p className="max-w-md text-slate-500 leading-relaxed">
              Start by describing the form you want to build in the chat. <br/>
              e.g., <i>"Create a newsletter signup form with name and email"</i>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
