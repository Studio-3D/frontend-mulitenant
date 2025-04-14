import React, { useState } from 'react';

const Autocomplete = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  choix = 'nom', // The field to display in the dropdown options
  loading = false,
  width = 'w-full',
  height = 'h-10',
  required = false, // Add required prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option[choix].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearchQuery(option[choix]);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    if (inputValue === '') {
      onChange(null);
    }
    setIsOpen(true);
  };

  return (
    <div className={`relative ${width}`}>
      {/* Label with red asterisk if required */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative mt-1">
        <input
          type="text"
          value={searchQuery || (value ? value[choix] : '')}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
          placeholder={placeholder}
          className={`w-full ${height} p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          required={required}
        />

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
    </div>
  );
};

export default Autocomplete;
