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
  defaultValues,
  errors,
  backendErrors,
  width = 'w-full', // Default width is 'w-full' for full width
  height = 'h-10', // Default height is 'h-10' (input height)
  min = null,
  max = null,
}) => {
  return (
    <div className="mb-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue={
          defaultValues?.[name] === null ? '' : defaultValues?.[name] || ''
        }
        render={({ field }) =>
          multi ? (
            <textarea
              {...field}
              id={name}
              name={name}
              className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${errors[name] || backendErrors[name] ? 'border-red-500' : ''}`}
              required={required}
              disabled={disabled}
              rows={4}
              value={field.value === null ? '' : field.value}
              onChange={(event) => {
                field.onChange(event); // Make sure react-hook-form handles the change
                customOnChange(event); // Also invoke customOnChange
              }}
            />
          ) : (
            <input
              {...field}
              min={min}
              max={max}
              id={name}
              name={name}
              type={type}
              className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${errors[name] || backendErrors[name] ? 'border-red-500' : ''}`}
              required={required}
              disabled={disabled}
              value={field.value === null ? '' : field.value}
              onChange={(event) => {
                field.onChange(event); // Make sure react-hook-form handles the change
                customOnChange(event); // Also invoke customOnChange
              }}
            />
          )
        }
      />
      {/* Display validation error message */}
      {errors[name]?.message && (
        <div className="mt-1 text-xs text-red-600">
          <p style={{ color: 'red' }}>{errors[name].message}</p>
        </div>
      )}

      {/* Display backend errors */}
      {backendErrors[name] && backendErrors[name].length > 0 && (
        <div className="mt-1 text-xs text-red-600">
          <p style={{ color: 'red' }}>{backendErrors[name][0]}</p>
          {/* Display backend error message */}
        </div>
      )}
    </div>
  );
};

export default TextField;
