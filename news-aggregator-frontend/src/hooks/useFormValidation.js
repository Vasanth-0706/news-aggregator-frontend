import { useState, useCallback, useRef } from 'react';
import { validateField, validateForm, debounce } from '../utils/validation';

/**
 * Custom hook for form validation with real-time feedback
 * @param {Object} initialData - Initial form data
 * @param {Array} fieldsToValidate - Array of field names to validate
 * @param {Object} options - Configuration options
 * @returns {Object} - Form state and handlers
 */
export const useFormValidation = (initialData, fieldsToValidate, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceDelay = 300,
    enableRealTimeValidation = true
  } = options;

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Keep track of validation announcements for screen readers
  const [validationAnnouncements, setValidationAnnouncements] = useState([]);
  const announcementTimeouts = useRef({});

  // Debounced validation function
  const debouncedValidateField = useCallback(
    debounce((fieldName, value, formData) => {
      const additionalData = {
        originalPassword: formData.password,
        minLength: fieldName === 'password' ? 6 : 2
      };
      
      const error = validateField(fieldName, value, additionalData);
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }, debounceDelay),
    [debounceDelay]
  );

  // Handle field changes
  const handleChange = useCallback((fieldName) => (e) => {
    const value = e.target.value;
    
    setFormData(prev => {
      const newFormData = { ...prev, [fieldName]: value };
      return newFormData;
    });

    // Clear error when user starts typing (immediate feedback)
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));

    // Perform real-time validation if enabled and field has been touched
    setTouched(currentTouched => {
      if (validateOnChange && currentTouched[fieldName] && enableRealTimeValidation) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          setFormData(currentFormData => {
            debouncedValidateField(fieldName, value, { ...currentFormData, [fieldName]: value });
            return currentFormData;
          });
        }, 0);
      }
      return currentTouched;
    });
  }, [validateOnChange, debouncedValidateField, enableRealTimeValidation]);

  // Handle field blur
  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    if (validateOnBlur) {
      setFormData(currentFormData => {
        // Only validate on blur if the field has a value or was previously valid
        // This prevents showing "required" errors immediately on blur of empty fields
        const fieldValue = currentFormData[fieldName];
        const shouldValidate = fieldValue && fieldValue.trim().length > 0;
        
        if (shouldValidate) {
          const additionalData = {
            originalPassword: currentFormData.password,
            minLength: fieldName === 'password' ? 6 : 2
          };
          
          const error = validateField(fieldName, fieldValue, additionalData);
          
          setErrors(prev => ({
            ...prev,
            [fieldName]: error
          }));
        } else {
          // Clear any existing error for empty fields on blur
          setErrors(prev => ({
            ...prev,
            [fieldName]: null
          }));
        }
        
        return currentFormData; // Don't change form data
      });
    }
  }, [validateOnBlur]);

  // Handle validation errors for accessibility announcements
  const handleValidationError = useCallback((fieldName, errorMessage) => {
    if (!errorMessage) return;
    
    // Clear any existing timeout for this field
    if (announcementTimeouts.current[fieldName]) {
      clearTimeout(announcementTimeouts.current[fieldName]);
    }
    
    // Add announcement
    const announcement = {
      id: `${fieldName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      fieldName
    };
    
    setValidationAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 3 seconds
    announcementTimeouts.current[fieldName] = setTimeout(() => {
      setValidationAnnouncements(prev => 
        prev.filter(item => item.id !== announcement.id)
      );
    }, 3000);
  }, []);

  // Validate entire form
  const validateAllFields = useCallback(() => {
    const formErrors = validateForm(formData, fieldsToValidate);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = fieldsToValidate.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(formErrors).length === 0;
  }, [formData, fieldsToValidate]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit, options = {}) => async (e) => {
    e.preventDefault();
    
    const { successMessage: customSuccessMessage = 'Operation completed successfully!' } = options;
    
    // Get current form data and validate
    let currentFormData;
    let isValid = false;
    
    setFormData(data => {
      currentFormData = data;
      const formErrors = validateForm(data, fieldsToValidate);
      setErrors(formErrors);
      
      // Mark all fields as touched
      const allTouched = fieldsToValidate.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      
      isValid = Object.keys(formErrors).length === 0;
      
      if (!isValid) {
        const errorFields = Object.keys(formErrors).filter(key => formErrors[key]);
        if (errorFields.length > 0) {
          const errorMessage = `Form has ${errorFields.length} error${errorFields.length > 1 ? 's' : ''}. Please correct the highlighted fields.`;
          handleValidationError('form', errorMessage);
        }
      }
      
      return data; // Don't change form data
    });
    
    if (!isValid) return;

    setIsSubmitting(true);
    setIsSuccess(false);
    
    // Announce loading state for screen readers
    const loadingAnnouncement = {
      id: `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: 'Form is being submitted, please wait.',
      fieldName: 'form'
    };
    setValidationAnnouncements(prev => [...prev, loadingAnnouncement]);
    
    try {
      await onSubmit(currentFormData);
      
      // Show success state
      setIsSuccess(true);
      setSuccessMessage(customSuccessMessage);
      
      // Announce success for screen readers
      const successAnnouncement = {
        id: `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: customSuccessMessage,
        fieldName: 'form'
      };
      setValidationAnnouncements(prev => [...prev, successAnnouncement]);
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Announce error for screen readers
      const errorAnnouncement = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: 'Form submission failed. Please try again.',
        fieldName: 'form'
      };
      setValidationAnnouncements(prev => [...prev, errorAnnouncement]);
    } finally {
      setIsSubmitting(false);
      
      // Clear loading announcement
      setTimeout(() => {
        setValidationAnnouncements(prev => 
          prev.filter(item => item.id !== loadingAnnouncement.id)
        );
      }, 1000);
    }
  }, [fieldsToValidate, handleValidationError]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSuccess(false);
    setSuccessMessage('');
    setValidationAnnouncements([]);
    
    // Clear all timeouts
    Object.values(announcementTimeouts.current).forEach(clearTimeout);
    announcementTimeouts.current = {};
  }, [initialData]);

  // Hide success message
  const hideSuccessMessage = useCallback(() => {
    setIsSuccess(false);
    setSuccessMessage('');
  }, []);

  // Check if form is valid
  const isFormValid = Object.keys(errors).length === 0 && 
                     fieldsToValidate.every(field => touched[field]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    successMessage,
    isFormValid,
    validationAnnouncements,
    handleChange,
    handleBlur,
    handleSubmit,
    handleValidationError,
    validateAllFields,
    resetForm,
    hideSuccessMessage,
    setFormData,
    setErrors,
    setIsSubmitting
  };
};