import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import FormInput from '../components/FormInput';
import ValidationAnnouncer from '../components/ValidationAnnouncer';
import LoadingButton from '../components/LoadingButton';
import SuccessMessage from '../components/SuccessMessage';
import { useFormValidation } from '../hooks/useFormValidation';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    successMessage,
    validationAnnouncements,
    handleChange,
    handleBlur,
    handleSubmit,
    handleValidationError,
    hideSuccessMessage
  } = useFormValidation(
    { email: '', password: '' },
    ['email', 'password'],
    {
      validateOnChange: true,
      validateOnBlur: true,
      debounceDelay: 300,
      enableRealTimeValidation: true
    }
  );

  const onSubmit = async (formData) => {
    try {
      await login(formData.email, formData.password);
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      // The error will be handled by the useAuth hook and displayed in the form
      throw error;
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #e0e7ff 100%)',
        padding: '0.5rem',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '400px',
        maxHeight: '95vh',
        overflow: 'hidden', // Prevent scrollbar during loading
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Welcome Text - Outside Form */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280', margin: '0' }}>Please sign in to your account</p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f3f4f6',
          padding: '2rem 1.25rem 1.25rem 1.25rem',
          margin: 0,
          boxSizing: 'border-box'
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                padding: '12px',
                marginRight: '12px'
              }}>
                <NewspaperIcon style={{
                  width: '32px',
                  height: '32px',
                  color: 'white'
                }} />
              </div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0'
              }}>
                NewsAggregator
              </h1>
            </div>
          </div>
          <form 
            ref={formRef}
            onSubmit={handleSubmit(onSubmit, { 
              successMessage: 'Successfully signed in! Welcome back.' 
            })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSubmitting) {
                e.preventDefault();
                if (formRef.current) {
                  formRef.current.requestSubmit();
                }
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Email Field */}
            <FormInput
              id="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              icon={EnvelopeIcon}
              onValidationError={(error) => handleValidationError('email', error)}
              autoComplete="email"
              required
            />

            {/* Password Field */}
            <FormInput
              id="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={errors.password}
              icon={LockClosedIcon}
              onValidationError={(error) => handleValidationError('password', error)}
              autoComplete="current-password"
              required
            />

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.875rem',
                  color: '#2563eb',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Signing In..."
            >
              Sign In
            </LoadingButton>
          </form>

          {/* Validation Announcer for Screen Readers */}
          <ValidationAnnouncer announcements={validationAnnouncements} />
          {/* Sign Up Link */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#2563eb',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#1d4ed8';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#2563eb';
                  e.target.style.textDecoration = 'none';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Success Message */}
        <SuccessMessage 
          message={successMessage}
          show={isSuccess}
          onHide={hideSuccessMessage}
        />
      </div>
    </div>
  );
}