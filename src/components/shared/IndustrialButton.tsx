import React from 'react';

interface IndustrialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'safety' | 'danger' | 'sos' | 'secondary';
  size?: 'md' | 'lg' | 'xl' | 'massive';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const IndustrialButton: React.FC<IndustrialButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  icon,
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const sizeStyles = {
    md: 'py-2 px-4 text-xs min-h-[44px]',
    lg: 'py-3.5 px-6 text-sm min-h-[52px]',
    xl: 'py-4 px-8 text-base min-h-[60px]',
    massive: 'py-6 px-10 text-xl min-h-[76px]',
  };

  const variantStyles = {
    primary:
      'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold border border-amber-400 active:translate-y-0.5 shadow-sm',
    safety:
      'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold border border-emerald-600 active:translate-y-0.5 shadow-sm',
    danger:
      'bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white font-bold border border-rose-500 active:translate-y-0.5 shadow-sm',
    sos:
      'bg-rose-700 hover:bg-rose-600 active:scale-98 text-white font-black tracking-widest border-2 border-white shadow-md active:translate-y-0.5',
    secondary:
      'bg-[#121824] hover:bg-[#182232] text-slate-200 font-bold border border-[#283446] hover:border-slate-500 active:translate-y-0.5 shadow-sm',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      disabled={isBtnDisabled}
      className={`relative inline-flex items-center justify-center font-display tracking-wider uppercase rounded-xl transition-transform duration-75 select-none ${
        isBtnDisabled
          ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500'
          : variantStyles[variant]
      } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="mr-2.5 shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
