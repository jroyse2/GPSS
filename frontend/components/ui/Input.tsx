import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseInputClasses = 'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
    
    // Error classes
    const errorClasses = error
      ? 'border-danger focus:ring-danger'
      : 'border-gray-300 dark:border-gray-600';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Icon padding classes
    const iconPaddingClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    // Combined classes
    const inputClasses = `${baseInputClasses} ${errorClasses} ${widthClasses} ${iconPaddingClasses} ${className}`;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input ref={ref} className={inputClasses} {...props} />
          
          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message or helper text */}
        {error ? (
          <p className="mt-1 text-sm text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;