import React, { useState, useEffect, useRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const FormInput = ({
    id,
    type = 'text',
    label,
    value,
    onChange,
    error,
    icon: Icon,
    required = false,
    disabled = false,
    className = '',
    onValidationError,
    autoComplete,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [shouldShake, setShouldShake] = useState(false);
    const [previousError, setPreviousError] = useState(null);
    const onValidationErrorRef = useRef(onValidationError);
    const hasValue = value && value.length > 0;
    const isFloating = isFocused || hasValue;

    // Update the ref when the callback changes
    useEffect(() => {
        onValidationErrorRef.current = onValidationError;
    }, [onValidationError]);

    // Trigger shake animation when a new error appears
    useEffect(() => {
        if (error && error !== previousError && error.trim().length > 0) {
            setShouldShake(true);
            // Announce error to screen readers
            if (onValidationErrorRef.current) {
                onValidationErrorRef.current(error);
            }
            // Remove shake class after animation completes
            const timer = setTimeout(() => setShouldShake(false), 500);
            setPreviousError(error);
            return () => clearTimeout(timer);
        } else if (error !== previousError) {
            setPreviousError(error);
        }
    }, [error, previousError]);

    return (
        <div 
            style={{ position: 'relative', width: '100%', marginBottom: '0.5rem' }}
            className={shouldShake ? 'animate-shake' : ''}
        >
            {/* Input Container */}
            <div style={{ position: 'relative' }}>
                {/* Icon */}
                {Icon && (
                    <Icon
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '18px',
                            height: '18px',
                            color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#9ca3af',
                            transition: 'color 0.2s ease',
                            pointerEvents: 'none',
                            zIndex: 2
                        }}
                    />
                )}

                {/* Input Field */}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        if (props.onBlur) props.onBlur(e);
                    }}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        height: '44px',
                        paddingLeft: Icon ? '40px' : '12px',
                        paddingRight: '12px',
                        paddingTop: isFloating ? '18px' : '12px',
                        paddingBottom: isFloating ? '6px' : '12px',
                        border: `1px solid ${error ? '#ef4444' : isFocused ? '#3b82f6' : '#d1d5db'}`,
                        borderRadius: '6px',
                        backgroundColor: error ? '#fef2f2' : '#ffffff',
                        color: error ? '#dc2626' : '#111827',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
                        boxSizing: 'border-box'
                    }}
                    placeholder=""
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${id}-error` : undefined}
                    aria-required={required}
                    autoComplete={autoComplete}
                    {...props}
                />

                {/* Floating Label */}
                <label
                    htmlFor={id}
                    style={{
                        position: 'absolute',
                        left: Icon ? '40px' : '12px',
                        top: isFloating ? '6px' : '50%',
                        transform: isFloating ? 'translateY(0) scale(0.8)' : 'translateY(-50%) scale(1)',
                        transformOrigin: 'left center',
                        color: error && isFloating ? '#ef4444' : isFloating ? '#3b82f6' : '#6b7280',
                        fontSize: isFloating ? '11px' : '14px',
                        fontWeight: isFloating ? '500' : '400',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        backgroundColor: isFloating ? '#ffffff' : 'transparent',
                        padding: isFloating ? '0 3px' : '0',
                        zIndex: 3
                    }}
                >
                    {label}
                    {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    id={`${id}-error`}
                    style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#dc2626'
                    }}
                    role="alert"
                >
                    <ExclamationCircleIcon
                        style={{
                            width: '16px',
                            height: '16px',
                            marginRight: '8px',
                            flexShrink: 0
                        }}
                    />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FormInput;