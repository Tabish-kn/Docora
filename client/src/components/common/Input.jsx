import React from 'react';

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#77738B] dark:text-[#A39EBC] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-[#242039] dark:text-[#F1EFFF] placeholder-[#77738B]/60 text-sm py-2 px-3 transition-colors focus:outline-none focus:border-[#7657E8] focus:ring-1 focus:ring-[#7657E8] ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${error ? 'border-rose-500' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#77738B] dark:text-[#A39EBC] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};

export default Input;
