import { useMemo } from 'react';
import { diff } from 'deep-diff';
import { Layers } from 'lucide-react';

export default function SchemaDiff({ oldSchema, newSchema }) {
  const differences = useMemo(() => {
    if (!oldSchema || !newSchema) return null;
    return diff(oldSchema, newSchema);
  }, [oldSchema, newSchema]);

  if (!differences || differences.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center" data-testid="schema-diff-panel">
         <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
         <p className="text-slate-500 font-medium">No structural changes detected.</p>
      </div>
    );
  }

  const renderDiffItem = (d, idx) => {
    const path = d.path ? d.path.join('.') : 'root';
    
    // N: newly added property
    // D: deleted property
    // E: edited property
    // A: array change
    
    let kind = d.kind;
    let text = '';
    let bgColor = '';
    let textColor = '';
    let icon = '';

    switch (kind) {
      case 'N':
        text = `+ ${path}: added new value ${JSON.stringify(d.rhs)}`;
        bgColor = 'bg-emerald-50';
        textColor = 'text-emerald-700';
        icon = '+';
        break;
      case 'D':
        text = `- ${path}: removed`;
        bgColor = 'bg-rose-50';
        textColor = 'text-rose-700';
        icon = '-';
        break;
      case 'E':
        text = `~ ${path}: changed from ${JSON.stringify(d.lhs)} to ${JSON.stringify(d.rhs)}`;
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-700';
        icon = '~';
        break;
      case 'A':
        text = `~ ${path}[${d.index}]: array modified`;
        bgColor = 'bg-sky-50';
        textColor = 'text-sky-700';
        icon = '[]';
        break;
      default:
        text = `? ${path}: unknown change`;
        bgColor = 'bg-slate-50';
        textColor = 'text-slate-700';
        icon = '?';
    }

    return (
      <div key={idx} className={`p-4 rounded-xl flex items-start gap-3 border ${bgColor.replace('bg-', 'border-').replace('50', '200')} ${bgColor}`}>
        <div className={`mt-0.5 font-bold font-mono text-sm w-5 text-center ${textColor}`}>
          {icon}
        </div>
        <div className={`font-mono text-sm break-all ${textColor}`}>
          {text}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" data-testid="schema-diff-panel">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
         <Layers className="w-5 h-5 text-indigo-500" /> Version Changes
      </h3>
      <div className="space-y-3">
        {differences.map((d, i) => renderDiffItem(d, i))}
      </div>
    </div>
  );
}
