'use client';

export default function Input({ 
  label, 
  type, 
  name, 
  value, 
  placeholder, 
  onChange, 
  error, 
  children,
  readOnly,
  required,
}) {
  return (
    <div className="flex flex-col w-full"> {/* Default to full width */}
      <label className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full
            ${
              readOnly 
                ? 'cursor-default bg-gray-50 border-[#b7daf6]' 
                : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
            }
            ${error ? 'border-red-500 focus:border-red-500 hover:border-red-500' : ''}
          `}
          placeholder={placeholder}
        />
        {children && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            {children}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {typeof error === 'string' ? error : 'Ce champ est obligatoire'}
        </p>
      )}
    </div>
  );
}