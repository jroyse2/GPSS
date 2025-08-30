import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors duration-200';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60 dark:bg-primary dark:hover:bg-primary-dark dark:disabled:bg-primary/60',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark disabled:bg-secondary/60 dark:bg-secondary dark:hover:bg-secondary-dark dark:disabled:bg-secondary/60',
    success: 'bg-success text-white hover:bg-success/90 disabled:bg-success/60 dark:bg-success dark:hover:bg-success/90 dark:disabled:bg-success/60',
    danger: 'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/60 dark:bg-danger dark:hover:bg-danger/90 dark:disabled:bg-danger/60',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white disabled:border-primary/60 disabled:text-primary/60 disabled:hover:bg-transparent disabled:hover:text-primary/60 dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white dark:disabled:border-primary/60 dark:disabled:text-primary/60 dark:disabled:hover:bg-transparent dark:disabled:hover:text-primary/60',
    link: 'text-primary hover:text-primary-dark underline disabled:text-primary/60 dark:text-primary dark:hover:text-primary-dark dark:disabled:text-primary/60',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;