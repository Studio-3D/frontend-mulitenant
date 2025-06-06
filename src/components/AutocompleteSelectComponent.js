import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AutocompleteSelectComponent = ({
  label,
  name,
  options,
  required = false,
  onChange,
  value = null,
  width = 'w-full',
  height = 'h-[38px]',
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const optionsArray = Object.values(options);

  useEffect(() => {
    // Only set input value if there's a valid value provided
    if (value !== null) {
      const matchedOption = optionsArray.find(
        (opt) => opt.code == value || opt.id == value
      );
      setInputValue(matchedOption ? matchedOption.label : '');
    } else {
      setInputValue(''); // Ensure it's blank when value is null
    }
    setSearchQuery('');
  }, [value]);

  const filteredOptions = searchQuery
    ? optionsArray.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : optionsArray;

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery(''); // Start fresh when opening
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);
    setIsOpen(true);
    if (!val) {
      onChange(null); // Clear selection if input is empty
    }
  };

  const handleSelect = (option) => {
    const selectedValue = option.code !== undefined ? option.code : option.id;
    onChange(selectedValue);
    setInputValue(option.label);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${width}`}>
      <label htmlFor={name} className="block font-medium !text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (disabled) return;
            setIsOpen(true);
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Choisissez un élément"
          className={`
            w-full ${height} p-2 border border-gray-300 rounded-md 
            focus:outline-none hover:border-gray-500 focus:border-gray-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}
            pr-8
          `}
          disabled={disabled}
          required={required}
        />

        {!disabled && (
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
        )}

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {filteredOptions.length === 0 ? (
              <div className="p-2 !text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.code || option.id}
                  className="p-2 m-1 cursor-pointer hover:bg-indigo-50 rounded-md"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteSelectComponent;
