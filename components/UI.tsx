
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-card p-5 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-brand-textPrimary mb-4">{title}</h3>}
    {children}
  </div>
);

export const Button: React.FC<{ 
  variant?: 'primary' | 'secondary' | 'danger', 
  children: React.ReactNode, 
  onClick?: () => void,
  className?: string,
  type?: 'button' | 'submit'
}> = ({ variant = 'primary', children, onClick, className = "", type = 'button' }) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold transition-all duration-150 flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-brand-secondary hover:bg-brand-primary text-white",
    secondary: "bg-white border border-brand-secondary text-brand-secondary hover:bg-brand-bgLight",
    danger: "bg-brand-error hover:bg-red-700 text-white"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'available': case 'paid': case 'active':
        return 'bg-green-100 text-brand-success';
      case 'occupied': case 'unpaid': case 'inactive':
        return 'bg-red-100 text-brand-error';
      case 'pending':
        return 'bg-orange-100 text-brand-warning';
      default:
        return 'bg-gray-100 text-brand-textSecondary';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColors()}`}>
      {status}
    </span>
  );
};

export const Input: React.FC<{ 
  label: string, 
  error?: string, 
  placeholder?: string, 
  type?: string,
  value?: string | number,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  required?: boolean
}> = ({ label, error, placeholder, type = "text", value, onChange, onKeyDown, required }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium text-brand-textSecondary">{label}{required && '*'}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-all ${error ? 'border-brand-error' : 'border-gray-300'}`}
    />
    {error && <span className="text-xs text-brand-error">{error}</span>}
  </div>
);

export const Select: React.FC<{ 
  label: string, 
  options: { label: string, value: string }[],
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium text-brand-textSecondary">{label}</label>
    <select 
      value={value}
      onChange={onChange}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-all bg-white"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);