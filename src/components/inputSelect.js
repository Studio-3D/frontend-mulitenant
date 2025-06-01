'use client';

import Select from 'react-select';

export default function InputSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  isLoading,
  isMulti=false,
  isClearable = true,
  readOnly = false,
  isDisabled=false,
}) {
  return (
    <div className="flex flex-col w-full">
        <label htmlFor={name} className="font-medium text-gray-700 text-[15px]">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>

      <div className="relative">
        <Select
          inputId={name}
          isClearable={isClearable}
          value={
            isMulti
              ? options.filter(opt => Array.isArray(value) && value.includes(opt.value))
              : options.find(opt => opt.value === value) || null
          }
          
          onChange={(selected) => {
            if (isMulti) {
              onChange(selected || []); // retourne un tableau d'objets [{value, label}]
            } else {
              onChange(selected || null); // retourne un objet {value, label}
            }
          }}
          options={options}
          placeholder={placeholder}
          isLoading={isLoading}
          isDisabled={readOnly}
          isMulti={isMulti}
          classNamePrefix="react-select"
          className="react-select-container"
          styles={{
            control: (base, state) => ({
              ...base,
              height: 38,
              minHeight: 38,
              fontSize: 15,
              borderRadius: 6,
              borderColor: error
                ? '#ef4444'
                : state.isFocused
                ? '#6b7280'
                : '#d1d5db',
              boxShadow: 'none',
              '&:hover': {
                borderColor: error ? '#ef4444' : '#6b7280',
              },
              backgroundColor: readOnly ? '#f9fafb' : 'white',
              cursor: readOnly ? 'default' : 'default',
            }),
            placeholder: (base) => ({
              ...base,
              color: '#9ca3af',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#374151',
            }),
            menu: (base) => ({
              ...base,
              zIndex: 50,
            }),
          }}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {typeof error === 'string' ? error : 'Ce champ est obligatoire'}
        </p>
      )}
    </div>
  );
}
