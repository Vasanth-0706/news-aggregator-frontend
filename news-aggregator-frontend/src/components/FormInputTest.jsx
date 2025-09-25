import React, { useState } from 'react';
import FormInput from './FormInput';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

const FormInputTest = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400">FormInput Test</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Testing enhanced form inputs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ maxWidth: '100%' }}>
          <FormInput
            id="fullName"
            type="text"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            error={errors.fullName}
            icon={UserIcon}
            required
          />

          <FormInput
            id="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            icon={EnvelopeIcon}
            required
          />

          <FormInput
            id="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            icon={LockClosedIcon}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Test Validation
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormInputTest;