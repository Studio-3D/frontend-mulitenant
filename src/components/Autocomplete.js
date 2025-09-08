import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from "lucide-react";

const Autocomplete = ({
  label,
  options = [],
  value, // Can be either the full object or just the ID
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
  const dropdownRef = useRef(null);

  // Find the selected option based on the value
  const selectedOption = typeof value === 'object' 
    ? value 
    : options.find(opt => opt.id === value);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle both errors and backendErrors
  const getErrorMessage = () => {
    if (errors && errors[name]) {
      return errors[name]?.message || (typeof errors[name] === 'string' ? errors[name] : '');
    }
    if (backendErrors && backendErrors[name]) {
      return backendErrors[name]?.message || (typeof backendErrors[name] === 'string' ? backendErrors[name] : '');
    }
    return '';
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const errorMessage = getErrorMessage();
  const hasError = Boolean(errorMessage);

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      {/* Label */}
      <label className="block font-medium !text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field (now just a display for selected value) */}
      <div className="relative">
        <div
          className={`w-full ${height} p-2 border ${
            hasError ? 'border-red-500' : 'border-gray-300'
          } rounded-md flex items-center cursor-pointer bg-white ${
            hasError ? 'focus:ring-red-500' : 'focus:border-gray-500'
          } pr-8`}
          onClick={toggleDropdown}
        >
          {selectedOption ? selectedOption[choix] : placeholder}
        </div>
        
        {/* Dropdown Toggle Icon */}
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={toggleDropdown}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 m-2 !text-gray-400 rotate-180" />
          ) : (
            <ChevronDown className="h-4 w-4 m-2 !text-gray-400" />
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
            ) : options.length === 0 ? (
              <div className="p-2 !text-gray-500">No options available</div>
            ) : (
              options.map((option) => (
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
      {hasError && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default Autocomplete;