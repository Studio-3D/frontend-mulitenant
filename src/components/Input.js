'use client';

import { Controller } from 'react-hook-form';

export default function Input({
  label,
  type = 'text',
  name,
  value, // Only for uncontrolled components
  defaultValue,
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
  multiline = false, // Ajout du support multiline
}) {

  // Ensure value is never null
  const safeValue = value == null ? '' : value;


  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => {
          const fieldValue = field.value === null ? '' : field.value;
          const combinedError = fieldState.error?.message || error || backendErrors;

          return (
            <div className="flex flex-col w-full">
              <label className="font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                {multiline ? (
                  <textarea
                    {...field}
                    value={fieldValue}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    disabled={disabled}
                    required={required}
                    inputMode={inputMode}
                    className={`text-[15px] px-4 py-2 outline-none border rounded-md w-full min-h-[100px]
                      ${
                        readOnly || disabled
                          ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                          : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
                      }
                      ${
                        combinedError
                          ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                          : ''
                      }
                    `}
                    onChange={(e) => {
                      field.onChange(e);
                      onChange?.(e);
                    }}
                  />
                ) : (
                  <input
                    {...field}
                    value={fieldValue}
                    type={type}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    disabled={disabled}
                    required={required}
                    inputMode={inputMode}
                    className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full
                      ${
                        readOnly || disabled
                          ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                          : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
                      }
                      ${
                        combinedError
                          ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                          : ''
                      }
                    `}
                    onChange={(e) => {
                      field.onChange(e);
                      onChange?.(e);
                    }}
                  />
                )}

                {children && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                    {children}
                  </div>
                )}
              </div>
              {combinedError && (
                <p className="text-red-500 text-sm mt-1">{combinedError}</p>
              )}
            </div>
          );
        }}
      />
    );
  }

  // Uncontrolled input
  return (
    <div className="flex flex-col w-full">
      <label className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            name={name}
            value={safeValue}
            defaultValue={defaultValue}
            onChange={onChange}
            readOnly={readOnly}
            disabled={disabled}
            required={required}
            inputMode={inputMode}
            placeholder={placeholder}
            className={`text-[15px] px-4 py-2 outline-none border rounded-md w-full min-h-[100px]
              ${
                readOnly || disabled
                  ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                  : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
              }
              ${
                error || backendErrors
                  ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                  : ''
              }
            `}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={safeValue}
            defaultValue={defaultValue}
            onChange={onChange}
            readOnly={readOnly}
            disabled={disabled}
            required={required}
            inputMode={inputMode}
            placeholder={placeholder}
            className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full
              ${
                readOnly || disabled
                  ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                  : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
              }
              ${
                error || backendErrors
                  ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                  : ''
              }
            `}
          />
        )}

        {children && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            {children}
          </div>
        )}
      </div>
      {(error || backendErrors) && (
        <p className="text-red-500 text-sm mt-1">
          {error || backendErrors || 'Ce champ est obligatoire'}
        </p>
      )}
    </div>
  );
}
