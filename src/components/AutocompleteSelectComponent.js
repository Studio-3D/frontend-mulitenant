import React, { useState, useEffect } from 'react';

const AutocompleteSelectComponent = ({
  label,
  name,
  options,
  required = false,
  onChange,
  value = null, // <-- Selected value (code)
  defaultValue = null, // Default value (code)
  width = 'w-full',
  height = 'h-10',
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const optionsArray = Object.values(options); // Convert options object to array

  useEffect(() => {
    // Pre-fill input with the selected option's label
    const matchedOption = optionsArray.find((opt) => opt.code === value);
    if (matchedOption) {
      setSearchQuery(matchedOption.label);
    } else {
      setSearchQuery('');
    }
  }, [value]);

  const filteredOptions = searchQuery
    ? optionsArray.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : optionsArray;

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);

    const matchedOption = optionsArray.find(
      (option) => option.label.toLowerCase() === inputValue.toLowerCase()
    );

    if (matchedOption) {
      onChange(matchedOption.code); // Send back the matched option's code
    } else {
      onChange(null); // Clear the value in parent if no match
    }

    setIsOpen(Boolean(inputValue)); // Open dropdown if input is not empty
  };

  const handleOptionClick = (option) => {
    if (disabled) return; // Do nothing if disabled

    onChange(option.code); // Send selected option's code to parent
    setSearchQuery(option.label); // Update input with selected label
    setIsOpen(false); // Close dropdown
  };

  useEffect(() => {
    // Clear input field if no matching options found
    if (filteredOptions.length === 0) {
      setSearchQuery('');
      onChange(null); // Send a clear signal to the parent
    }
  }, [filteredOptions]);

  return (
    <div className={`relative ${width}`}>
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Delay closing to allow option click
          placeholder="Choisissez un élément"
          className={`
            ${width} ${height} p-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}
          `}
          disabled={disabled}
          required={required}
        />

        {/* Dropdown Options */}
        {isOpen && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.code}
                  className={`p-2 text-sm cursor-pointer hover:bg-indigo-100`}
                  onClick={() => handleOptionClick(option)}
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
