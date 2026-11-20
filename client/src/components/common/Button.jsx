import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
    icon: 'p-2 rounded-lg',
  };

  const variantStyles = {
    primary: 'bg-[#7657E8] hover:bg-[#6544D7] text-white focus:ring-[#7657E8]/40 shadow-sm shadow-[#7657E8]/20',
    secondary: 'bg-[#F0EDFF] hover:bg-[#E5DFFF] text-[#7657E8] dark:bg-[#282440] dark:hover:bg-[#342F54] dark:text-[#F1EFFF]',
    outline: 'border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] hover:bg-[#F8F7FF] dark:hover:bg-[#232038] text-[#242039] dark:text-[#F1EFFF]',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500/40',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
