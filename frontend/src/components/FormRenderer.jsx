import { useMemo, useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

// Recursive function to filter out fields based on x-show-when
function evaluateCondition(condition, formData) {
  if (!condition) return true;
  const { field, equals } = condition;
  return formData[field] === equals;
}

function processSchema(schema, formData) {
    if (!schema || typeof schema !== 'object') return schema;
    
    // Deep clone to avoid mutating original
    const newSchema = JSON.parse(JSON.stringify(schema));
    
    if (newSchema.properties) {
        Object.keys(newSchema.properties).forEach(key => {
            const prop = newSchema.properties[key];
            if (prop['x-show-when']) {
                // Determine if it should be shown
                const shouldShow = evaluateCondition(prop['x-show-when'], formData);
                if (!shouldShow) {
                    delete newSchema.properties[key];
                    // remove from required array if necessary
                    if (newSchema.required) {
                        newSchema.required = newSchema.required.filter(r => r !== key);
                    }
                }
            } else if (prop.type === 'object') {
                newSchema.properties[key] = processSchema(prop, formData[key] || {});
            }
        });
    }
    return newSchema;
}

function CustomFieldTemplate(props) {
  const { id, classNames, label, help, required, description, errors, children, schema } = props;
  
  // Custom testing ID based on the property name
  // Format for requirements testing: data-testid="field-[name]"
  const fieldName = id.replace('root_', '');
  
  return (
    <div className={`${classNames} mb-6`} data-testid={`field-${fieldName}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {description && <div className="text-sm text-slate-500 mb-2 leading-relaxed">{description}</div>}
      <div className="relative">
         {children}
      </div>
      {errors && <div className="text-sm text-rose-500 mt-1.5 font-medium">{errors}</div>}
      {help && <div className="text-sm text-slate-400 mt-1">{help}</div>}
    </div>
  );
}

export default function FormRenderer({ schema }) {
  const [formData, setFormData] = useState({});

  // Process the schema dynamically on every render based on current form data
  const processedSchema = useMemo(() => {
     return processSchema(schema, formData);
  }, [schema, formData]);

  const onChange = (e) => {
      setFormData(e.formData);
  };

  return (
    <div className="form-renderer form-container">
       <div className="mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{processedSchema.title || 'Dynamic Form'}</h2>
          {processedSchema.description && <p className="text-slate-500 mt-2 text-[15px]">{processedSchema.description}</p>}
       </div>
       <Form 
         schema={processedSchema}
         validator={validator}
         formData={formData}
         onChange={onChange}
         templates={{ FieldTemplate: CustomFieldTemplate }}
         className="space-y-6"
         uiSchema={{
            "ui:submitButtonOptions": {
               "props": {
                  "className": "w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 mt-4"
               }
            }
         }}
       />
       
       <style>{`
          /* Quick CSS injection for generic RJSF inputs */
          .form-container input:not([type="checkbox"]):not([type="radio"]), 
          .form-container select, 
          .form-container textarea {
             width: 100%;
             padding: 0.75rem 1rem;
             border-radius: 0.75rem;
             border: 1px solid #e2e8f0;
             background-color: #f8fafc;
             color: #1e293b;
             transition: all 0.2s;
             outline: none;
             font-size: 0.875rem;
          }
          .form-container input:not([type="checkbox"]):not([type="radio"]):focus, 
          .form-container select:focus, 
          .form-container textarea:focus {
             background-color: #ffffff;
             border-color: #818cf8;
             box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }
          .form-container input[type="checkbox"], .form-container input[type="radio"] {
             width: 1.125rem;
             height: 1.125rem;
             margin-right: 0.6rem;
             accent-color: #4f46e5;
             cursor: pointer;
             position: relative;
             top: 2px;
          }
          .form-container .checkbox label, .form-container .radio label {
             display: flex;
             align-items: center;
             font-size: 0.9rem;
             color: #334155;
             cursor: pointer;
          }
       `}</style>
    </div>
  );
}
