import React from 'react';
import { Controller } from 'react-hook-form';

const TextField = ({
  label,
  name,
  type = 'text',
  multi = false,
  required = false,
  disabled = false,
  onChange: customOnChange = () => {},
  control,
  value,
  defaultValue = '',
  errors,
  backendErrors,
  width = 'w-full',
  height = 'h-[38px]',
  min = null,
  max = null,
  accept = null,
}) => {
  // Common props for all input types
  const commonProps = {
    id: name,
    name,
    required,
    disabled,
    className: `block ${width} ${height} px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
      disabled ? 'bg-gray-100 cursor-not-allowed' : ''
    } ${errors?.[name] || backendErrors?.[name] ? 'border-red-500' : ''}`,
  };

  // Handle non-controlled input (when control is false)
  if (control === false) {
    const inputValue = value == null ? '' : value;
    
    if (multi) {
      return (
        <div className="mb-2">
          <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            {...commonProps}
            rows={4}
            value={inputValue}
            onChange={customOnChange}
          />
        </div>
      );
    } else if (type === 'file') {
      return (
        <div className="mb-2">
          <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <label className={`${commonProps.className} cursor-pointer`}>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={customOnChange}
            />
            <span className="text-gray-700">
              {value?.name || 'Choisir un fichier'}
            </span>
          </label>
        </div>
      );
    } else {
      return (
        <div className="mb-2">
          <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
            value={inputValue}
            onChange={customOnChange}
          />
        </div>
      );
    }
  }

  // Original Controller-based implementation
  return (
    <div className="mb-2">
      <label htmlFor={name} className="block text-[15px] font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { value, onChange, ...field } }) => {
          const inputValue = value == null ? '' : value;
          
          if (multi) {
            return (
              <textarea
                {...field}
                {...commonProps}
                rows={4}
                value={inputValue}
                onChange={(event) => {
                  onChange(event);
                  customOnChange(event);
                }}
              />
            );
          } else if (type === 'file') {
            return (
              <label className={`${commonProps.className} cursor-pointer`}>
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    onChange(file);
                    customOnChange(event);
                  }}
                  {...field}
                />
                <span className="text-gray-700">
                  {value?.name || 'Choisir un fichier'}
                </span>
              </label>
            );
          } else {
            return (
              <input
                {...field}
                {...commonProps}
                type={type}
                min={min}
                max={max}
                value={inputValue}
                onChange={(event) => {
                  onChange(event);
                  customOnChange(event);
                }}
              />
            );
          }
        }}
      />

      {/* Error messages */}
      {errors?.[name]?.message && (
        <div className="mt-1 text-xs text-red-600">
          <p style={{ color: 'red' }}>{errors[name].message}</p>
        </div>
      )}
      {backendErrors?.[name] && backendErrors[name].length > 0 && (
        <div className="mt-1 text-xs text-red-600">
          <p style={{ color: 'red' }}>{backendErrors[name][0]}</p>
        </div>
      )}
    </div>
  );
};

export default TextField;