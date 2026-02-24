import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="input-group" style={{ marginBottom: '1rem' }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--neutral-gray-900)' }}
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={clsx('form-input', className)}
                    style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: `1px solid ${error ? 'var(--danger-red)' : 'var(--neutral-gray-300)'}`,
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-teal)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = error ? 'var(--danger-red)' : 'var(--neutral-gray-300)'}
                    {...props}
                />
                {error && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--danger-red)' }}>{error}</p>
                )}
                {helperText && !error && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
