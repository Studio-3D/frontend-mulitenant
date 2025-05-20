'use client';

import { Controller } from 'react-hook-form';

export default function Input({
  label,
  multi = false,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  error,
  backendErrors,
  control,
  children,
  readOnly,
  disabled,
  required,
  inputMode,
}) {
  // For uncontrolled components, we'll use defaultValue internally if value is undefined
  const isControlled = value !== undefined;
  const inputValue = isControlled ? (value == null ? '' : value) : undefined;

  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <div className="flex flex-col w-full">
            <label className="font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                {...field}
                type={type}
                value={field.value == null ? '' : field.value}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
                required={required}
                inputMode={inputMode}
                accept={type == 'file' ? 'image/*,application/pdf' : undefined}
                className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full
                  ${
                    readOnly || disabled
                      ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                      : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
                  }
                  ${
                    error
                      ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                      : ''
                  }
                  ${type == 'file' ? 'p-0 border-none' : ''}
                `}
                onChange={(e) => {
                  if (type == 'file') {
                    const files = e.target.files;
                    field.onChange(files);
                    onChange?.(e, files);
                  } else {
                    field.onChange(e);
                    onChange?.(e);
                  }
                }}
              />
              {children && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                  {children}
                </div>
              )}
            </div>
            {(error || backendErrors) && (
              <p className="text-red-500 text-sm mt-1">
                {error?.message || backendErrors || 'Ce champ est obligatoire'}
              </p>
            )}
          </div>
        )}
      />
    );
  }

  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={inputValue}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          inputMode={inputMode}
          accept={type == 'file' ? 'image/*,application/pdf' : undefined}
          className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full
            ${
              readOnly || disabled
                ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
            }
            ${
              error
                ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                : ''
            }
            ${type == 'file' ? 'p-0 border-none' : ''}
          `}
          placeholder={placeholder}
        />
        {children && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            {children}
          </div>
        )}
      </div>
      {(error || backendErrors) && (
        <p className="text-red-500 text-sm mt-1">
          {typeof error == 'string' ? error : 'Ce champ est obligatoire'}
        </p>
      )}
    </div>
  );
}