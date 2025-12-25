import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'floating';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative font-semibold transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-50 dark:focus:ring-offset-deep-950 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.97]";
  
  const variants = {
    // Primary: Deep Blue gradient for Light mode, Pale Mint for Dark mode
    primary: "px-6 py-3 rounded-2xl bg-gradient-to-r from-deep-800 to-deep-900 hover:from-deep-700 hover:to-deep-800 text-white dark:from-pale-300 dark:to-pale-400 dark:text-deep-950 dark:hover:from-pale-200 dark:hover:to-pale-300 shadow-lg shadow-deep-900/20 dark:shadow-pale-300/20",
    
    // Accent: Used for AI features, gradients
    accent: "px-6 py-3 rounded-2xl bg-gradient-to-r from-pale-300 to-pale-400 hover:from-pale-200 hover:to-pale-300 text-deep-900 shadow-glow hover:shadow-glow-hover border border-pale-200/50",
    
    // Secondary: Glassy surface
    secondary: "px-6 py-3 rounded-2xl bg-white hover:bg-deep-50 text-deep-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-deep-100 border border-deep-200 dark:border-white/10 backdrop-blur-md",
    
    // Danger
    danger: "px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20",
    
    // Ghost
    ghost: "px-4 py-2 rounded-xl bg-transparent hover:bg-deep-100/50 dark:hover:bg-white/5 text-deep-600 dark:text-deep-300",
    
    // Floating Action Button (FAB)
    floating: "w-14 h-14 rounded-full bg-pale-300 hover:bg-pale-200 text-deep-900 shadow-glow hover:shadow-glow-hover z-50 flex items-center justify-center"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
      
      {/* Subtle shine effect for primary/accent */}
      {(variant === 'primary' || variant === 'accent') && !isLoading && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
      )}
    </button>
  );
};