import React, { useState, useEffect } from 'react';
import { FaChevronDown } from "react-icons/fa";


const Autocomplete = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Choisissez un élément',
  choix = 'nom',
  loading = false,
  width = 'w-full',
  height = 'h-[38px]',
  required = false,
  errors,
  backendErrors,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize searchQuery with the current value
  useEffect(() => {
    if (value && value[choix]) {
      setSearchQuery(value[choix]);
    }
  }, [value, choix]);

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
      setSearchQuery('');
      onChange(null);
    }
  }, [filteredOptions, loading, searchQuery, onChange]);

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const rawError = errors[name] || backendErrors[name];
  const errorMessage =
    rawError?.message ??
    (typeof rawError === 'string' ? rawError : '');

  return (
    <div className={`relative ${width}`}>
      {/* Label */}
      <label className="block font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery || ''}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={`w-full  ${height} p-2 border ${
            errorMessage ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:outline-none ${
            errorMessage ? 'focus:ring-red-500' : 'focus:border-gray-500'
          } pr-8`}  // Added pr-8 for icon spacing
          required={required}
        />
        
        {/* Dropdown Toggle Icon */}
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={toggleDropdown}
        >
          {isOpen ? (
            <FaChevronDown className="h-4 w-4 m-2 text-gray-400 rotate-180" />
          ) : (
            <FaChevronDown className="h-4 w-4 m-2 text-gray-400" />
          )}
        </div>

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
                  className="p-2 cursor-pointer hover:bg-indigo-50 m-1 rounded-md"
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