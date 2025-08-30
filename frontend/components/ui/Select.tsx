import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseSelectClasses = 'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white dark:bg-gray-700';
    
    // Error classes
    const errorClasses = error
      ? 'border-danger focus:ring-danger'
      : 'border-gray-300 dark:border-gray-600';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Combined classes
    const selectClasses = `${baseSelectClasses} ${errorClasses} ${widthClasses} ${className}`;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        {/* Select container */}
        <div className="relative">
          {/* Select */}
          <select ref={ref} className={selectClasses} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown icon */}
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';

export default Select;