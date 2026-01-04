import React from 'react';

const VARIANTS = {
  primary: 'bg-blue-500 text-white hover:bg-blue-400 dark:hover:bg-blue-600',
  ghost: 'text-slate-600 bg-transparent hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const baseClass = 'px-4 py-2 rounded-md transition font-medium';

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
