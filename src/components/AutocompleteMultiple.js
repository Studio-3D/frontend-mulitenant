import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AutocompleteMultiple = ({
  label,
  name,
  required,
  options = [],
  choiceKey,
  value = [],
  valueKey = null,
  onChange,
  placeholder = '',
  errors = {},
  backendErrors = {},
  loading = false,
}) => {
  // Determine which key to match values against (fallback to choiceKey)
  const actualValueKey = valueKey || choiceKey;

  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Sync external `value` to selectedOptions
  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      const matched = options.filter(opt =>
        value.some(val => {
          // extract primitive value: if val is object, use its actualValueKey, else use val directly
          const valPrimitive = val && typeof val === 'object'
            ? val[actualValueKey]
            : val;
          return String(opt[actualValueKey]).toLowerCase() ===
                 String(valPrimitive).toLowerCase();
        })
      );
      setSelectedOptions(matched);
    }
  }, [value, options, actualValueKey]);

  // Handle typing in the input
  const handleInputChange = event => {
    const val = event.target.value;
    setInputValue(val);

    if (val.trim() === '') {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter(opt =>
          opt[choiceKey].toLowerCase().includes(val.toLowerCase())
      ),
      );
    }
    setIsDropdownOpen(true);
  };

  // Add an option
  const handleOptionSelect = option => {
    if (!selectedOptions.some(sel => sel[choiceKey] === option[choiceKey])) {
      const updated = [...selectedOptions, option];
      setSelectedOptions(updated);
      onChange(updated);
    }
    setInputValue('');
    setFilteredOptions(options);
    setIsDropdownOpen(false);
  };

  // Remove an option
  const handleRemoveOption = option => {
    const updated = selectedOptions.filter(
      sel => sel[choiceKey] !== option[choiceKey]
    );
    setSelectedOptions(updated);
    onChange(updated);
  };

  // Show all options on focus
  const handleInputFocus = () => {
    setFilteredOptions(options);
    setIsDropdownOpen(true);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = e => {
    if (!e.target.closest(`#dropdown-${name}`)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div id={`dropdown-${name}`} className="w-full relative">
      {label && (
        <label htmlFor={name} className="block font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`flex items-center gap-2 p-2 border rounded-md bg-white h-[38px] w-full overflow-hidden ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <div className="flex flex-nowrap ">
            {selectedOptions.map((opt, idx) => (
              <span
                key={idx}
                className="flex-shrink-0 z-10 flex items-center px-2 py-1 text-sm text-white bg-[rgb(61,129,156)] rounded mr-2"
              >
                {opt[choiceKey]}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt)}
                  className=" text-gray-100 hover:text-gray-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id={name}
            type="text"
            value={inputValue}
            placeholder={inputValue.length === 0 && selectedOptions.length === 0 ? placeholder : ''}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="flex-grow  outline-none "
          />
          
          {/* Dropdown Toggle Icon */}
          <div 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={toggleDropdown}
          >
            {isDropdownOpen ? (
              <ChevronDown className="h-4 w-4 m-2 text-gray-400 rotate-180" />
            ) : (
              <ChevronDown className="h-4 w-4 m-2 text-gray-400" />
            )}
          </div>
        </div>

        {loading && (
          <div className="absolute top-full left-0 w-full mt-1 text-center">
            <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isDropdownOpen && (
          <div className="absolute z-30 w-full max-w-[600px] bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className={`p-2 text-sm cursor-pointer ${
                    selectedOptions.some(
                      sel => sel[choiceKey] === opt[choiceKey]
                    )
                      ? 'bg-gray-200 text-gray-500'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                  onClick={() => handleOptionSelect(opt)}
                >
                  {opt[choiceKey]}
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">Aucun résultat trouvé</div>
            )}
          </div>
        )}
      </div>

      {errors[name] && (
        <div className="mt-1 text-xs text-red-600">{errors[name]}</div>
      )}
      {backendErrors[name] && backendErrors[name].length > 0 && (
        <div className="mt-1 text-xs text-red-600">
          {backendErrors[name][0]}
        </div>
      )}
    </div>
  );
};

export default AutocompleteMultiple;