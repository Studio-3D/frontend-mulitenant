 import React from 'react';
 const Inputs_des_Profit = ({
    label,
    value,
    onChange,
    name,
    type = 'text',
    required = false,
    disabled = false,
    placeholder = '',
    errors = null,
    helperText = '',
    size = 'small',
    fullWidth = true,
  }) => {
    // Size classes
    const sizeClasses = {
      small: 'py-1 px-3 text-sm',
      medium: 'py-2 px-4 text-base',
      large: 'py-3 px-5 text-lg',
    };

    return (
      <div className={`flex flex-col ${fullWidth ? 'w-full' : 'w-auto'}`}>
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              required
                ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                : ''
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`h-[38px]
            ${sizeClasses[size]}
            ${fullWidth ? 'w-full' : 'w-auto'}
            rounded-md border
            ${errors ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'}
            shadow-sm
            focus:outline-none
            focus:ring-1
            ${errors ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}
            ${errors ? 'focus:border-red-500' : 'focus:border-indigo-500'}
            transition-colors
            duration-200
          `}
          />
        </div>

        {(helperText || errors) && (
          <p
            className={`mt-1 text-sm ${
              errors ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {errors || helperText}
          </p>
        )}
      </div>
    );
  };
  export default Inputs_des_Profit;