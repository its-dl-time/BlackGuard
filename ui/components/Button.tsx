import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  isLoading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3.5 font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Primary: Black background, White text
    primary: "bg-black text-white hover:bg-neutral-800 border border-transparent shadow-xl shadow-neutral-200",
    // Secondary: White background, Black border
    secondary: "bg-white text-black border border-neutral-300 hover:border-black hover:bg-neutral-50",
    // Danger: White with Red Text/Border
    danger: "bg-white text-red-600 border border-red-200 hover:border-red-500 hover:bg-red-50",
    // Ghost: Subtle Text
    ghost: "text-neutral-400 hover:text-black border border-transparent"
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
      )}
      {children || 'Action'}
    </button>
  );
};

export default Button;