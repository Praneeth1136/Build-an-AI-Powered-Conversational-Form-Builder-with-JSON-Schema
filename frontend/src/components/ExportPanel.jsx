import { useState } from 'react';
import { Download, Copy, CheckCircle2 } from 'lucide-react';

export default function ExportPanel({ schema }) {
  const [copiedStates, setCopiedStates] = useState({
    json: false,
    react: false,
    curl: false
  });

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const codeSnippet = `
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const schema = ${JSON.stringify(schema, null, 2)};

export default function GenForm() {
  return (
    <Form
      schema={schema}
      validator={validator}
      onSubmit={(data) => console.log(data)}
    />
  );
}
  `.trim();

  const curlSnippet = `
curl -X POST http://localhost:8080/api/form/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Generate a form..."}'
  `.trim();

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm" data-testid="export-panel">
      <h2 className="text-xl font-bold text-slate-800 mb-6 font-sans">Export & Integration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* React Code Export */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 text-sm">React Code</h3>
            <button 
              data-testid="copy-code-button"
              onClick={() => handleCopy(codeSnippet, 'react')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedStates.react ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedStates.react ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-4 bg-slate-900 flex-1 overflow-auto">
            <pre className="text-xs font-mono text-sky-300">{codeSnippet}</pre>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
           {/* JSON Schema Export */}
           <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="px-5 py-4 flex flex-col gap-3">
               <h3 className="font-semibold text-slate-700">Raw JSON Schema</h3>
               <p className="text-sm text-slate-500 leading-relaxed">Copy the active schema to use via API, database validation, or dynamic form engines.</p>
               <button 
                 data-testid="export-json-button"
                 onClick={() => handleCopy(JSON.stringify(schema, null, 2), 'json')}
                 className="mt-2 w-full py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-700 rounded-xl text-sm font-semibold text-slate-600 flex items-center justify-center gap-2 transition-colors shadow-sm"
               >
                 {copiedStates.json ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                 {copiedStates.json ? 'Exported to Clipboard' : 'Copy JSON'}
               </button>
             </div>
           </div>

           {/* cURL Snippet */}
           <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1">
             <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
               <h3 className="font-semibold text-slate-700 text-sm">API Standard curl</h3>
               <button 
                 data-testid="copy-curl-button"
                 onClick={() => handleCopy(curlSnippet, 'curl')}
                 className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-1.5 transition-colors shadow-sm"
               >
                 {copiedStates.curl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                 {copiedStates.curl ? 'Copied' : 'Copy'}
               </button>
             </div>
             <div className="p-4 bg-slate-900 flex-1 overflow-auto">
               <pre className="text-xs font-mono text-emerald-400">{curlSnippet}</pre>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
