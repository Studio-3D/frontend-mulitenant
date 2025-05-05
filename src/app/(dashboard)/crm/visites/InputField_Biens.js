import React from 'react';

const InputField_Biens = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  multi = false,
  required = false,
  disabled = false,
  width = 'w-full',
  height = 'h-[38px]',
  min = null,
  max = null,
  placeholder = '',
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-[15px] font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {multi ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={4}
          className={`block ${width} px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none  hover:border-gray-500 focus:border-gray-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value !== undefined && value !== null ? value : ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`block ${width} ${height} px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none  hover:border-gray-500 focus:border-gray-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      )}
    </div>
  );
};

export default InputField_Biens;
