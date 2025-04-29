import React, { useState, useEffect } from 'react';

const Autocomplete = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Choisissez un élément',
  choix = 'nom',
  loading = false,
  width = 'w-full',
  height = 'h-10',
  required = false,
  errors,
  backendErrors,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions =
    String(searchQuery || '') === ''
      ? options
      : options.filter((option) => {
          const targetValue = option[choix];
          const stringValue =
            targetValue !== null && targetValue !== undefined
              ? String(targetValue)
              : '';

          return stringValue
            .toLowerCase()
            .includes(String(searchQuery).toLowerCase());
        });

  // Effect to clear input when no options match
  useEffect(() => {
    if (!loading && filteredOptions.length === 0 && searchQuery) {
      setSearchQuery(''); // Clear search query
      onChange(null); // Notify parent of cleared value
    }
  }, [filteredOptions, loading, searchQuery, onChange]);

  // Handle selecting an option from the dropdown
  const handleSelect = (option) => {
    onChange(option); // Notify parent with selected option
    setSearchQuery(option[choix]); // Update input value with selected option
    setIsOpen(false); // Close dropdown
  };

  // Handle input changes
  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    if (inputValue === '') {
      onChange(null); // Clear parent value if input is empty
    }
    setIsOpen(true); // Open dropdown on input
  };

  // Handle errors passed via props
  const rawError = errors[name] || backendErrors[name];
  const errorMessage =
    rawError?.message ??
    (typeof rawError === 'string' ? rawError : '');

  return (
    <div className={`relative ${width}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative mt-1">
        <input
          type="text"
          value={searchQuery || (value ? value[choix] : '')}
          onChange={handleChange}
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery(''); // Force display of all options
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay closing dropdown to allow clicks
          placeholder={placeholder}
          className={`w-full ${height} p-2 border ${
            errorMessage ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 ${
            errorMessage ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
          }`}
          required={required}
        />

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-4 h-4 border-2 border-t-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                <span>Loading...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="p-2 cursor-pointer hover:bg-indigo-100"
                  onClick={() => handleSelect(option)}
                >
                  {option[choix]}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default Autocomplete;
