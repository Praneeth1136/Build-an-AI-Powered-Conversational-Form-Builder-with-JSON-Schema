const Ajv = require('ajv');
const ajv = new Ajv({ strict: false }); // Draft 7 meta-schema is often used

// Simple Draft 7 meta-schema for validation (we can rely on simple checks or ajv default)
function validateSchema(schema) {
  try {
    const valid = ajv.validateSchema(schema);
    if (!valid) {
      return { valid: false, errors: ajv.errors };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: [{ message: error.message }] };
  }
}

module.exports = { validateSchema };
