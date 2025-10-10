/**
 * Validation utility functions for form fields
 */

export const validationRules = {
  email: {
    required: (value) => !value ? 'Email is required' : null,
    format: (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
    }
  },
  
  password: {
    required: (value) => !value ? 'Password is required' : null,
    minLength: (value, minLength = 6) => {
      if (!value) return null;
      return value.length < minLength ? `Password must be at least ${minLength} characters` : null;
    },
    strength: (value) => {
      if (!value) return null;
      if (value.length < 8) return 'Password should be at least 8 characters for better security';
      return null;
    }
  },
  
  confirmPassword: {
    required: (value) => !value ? 'Please confirm your password' : null,
    match: (value, originalPassword) => {
      if (!value) return null;
      return value !== originalPassword ? 'Passwords do not match' : null;
    }
  },
  
  fullName: {
    required: (value) => !value ? 'Full name is required' : null,
    minLength: (value, minLength = 2) => {
      if (!value) return null;
      return value.length < minLength ? `Full name must be at least ${minLength} characters` : null;
    },
    format: (value) => {
      if (!value) return null;
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      return !nameRegex.test(value) ? 'Please enter a valid name' : null;
    }
  }
};

/**
 * Validates a single field with multiple rules
 * @param {string} fieldName - The name of the field to validate
 * @param {string} value - The value to validate
 * @param {Object} additionalData - Additional data needed for validation (e.g., password for confirmPassword)
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldName, value, additionalData = {}) => {
  const rules = validationRules[fieldName];
  if (!rules) return null;
  
  // Check each rule for the field
  for (const [ruleName, ruleFunction] of Object.entries(rules)) {
    let error = null;
    
    switch (ruleName) {
      case 'match':
        error = ruleFunction(value, additionalData.originalPassword);
        break;
      case 'minLength':
        error = ruleFunction(value, additionalData.minLength);
        break;
      default:
        error = ruleFunction(value);
        break;
    }
    
    if (error) return error;
  }
  
  return null;
};

/**
 * Validates multiple fields at once
 * @param {Object} formData - Object containing all form field values
 * @param {Array} fieldsToValidate - Array of field names to validate
 * @returns {Object} - Object containing errors for each field
 */
export const validateForm = (formData, fieldsToValidate) => {
  const errors = {};
  
  fieldsToValidate.forEach(fieldName => {
    const additionalData = {
      originalPassword: formData.password,
      minLength: fieldName === 'password' ? 6 : 2
    };
    
    const error = validateField(fieldName, formData[fieldName], additionalData);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * Debounce function to limit validation frequency
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};