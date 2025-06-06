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
  width = 'w-full',
  height = 'h-[38px]',
  min = null,
  max = null,
  accept = null,
}) => {
  return (
    <div className="mb-2">
      <label htmlFor={name} className="block text-[15px] font-medium !text-gray-700">

        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        defaultValue={
          defaultValues?.[name] === null ? '' : defaultValues?.[name] || ''
        }
        render={({ field: { value, onChange, ...field } }) => {
          if (multi) {
            return (
              <textarea
                {...field}
                id={name}
                name={name}
                className={`block ${width} ${height} px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors[name] || backendErrors[name] ? 'border-red-500' : ''}`}
                required={required}
                disabled={disabled}
                rows={4}
                value={value == null ? '' : value}
                onChange={(event) => {
                  onChange(event);
                  customOnChange(event);
                }}
              />
            );
          } else if (type == 'file') {
            return (
              <>
                <label className={`block ${width} ${height} px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors[name] || backendErrors[name] ? 'border-red-500' : ''} cursor-pointer`}>
                  <input
                    id={name}
                    type="file"
                    className="hidden"
                    accept={accept}
                    required={required}
                    disabled={disabled}
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
              </>
            );
          } else {
            return (
              <input
                {...field}
                min={min}
                max={max}
                id={name}
                name={name}
                type={type}
                className={`block ${width} ${height} px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors[name] || backendErrors[name] ? 'border-red-500' : ''}`}
                required={required}
                disabled={disabled}
                value={value == null ? '' : value}
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
      {errors[name]?.message && (
        <div className="mt-1 text-xs !text-red-600">
          <p style={{ color: 'red' }}>{errors[name].message}</p>
        </div>
      )}
      {backendErrors[name] && backendErrors[name].length > 0 && (
        <div className="mt-1 text-xs !text-red-600">
          <p style={{ color: 'red' }}>{backendErrors[name][0]}</p>
        </div>
      )}
    </div>
  );
};

export default TextField;