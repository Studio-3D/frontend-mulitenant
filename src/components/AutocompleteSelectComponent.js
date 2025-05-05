import React, { useState, useEffect } from 'react';

const AutocompleteSelectComponent = ({
  label,
  name,
  options,
  required = false,
  onChange,
  value = null, // <-- Accept selected value
  defaultValue = null,
  width = 'w-full',
  height = 'h-[38px]',
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const optionsArray = Object.values(options);

  useEffect(() => {
    // Pre-fill search input when value changes externally
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
  const selectedOption = options[value] || null;

  return (
    <div className={`relative ${width}`}>
      {/* Label */}
      <label htmlFor={name} className="block font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          type="text"
          // value={searchQuery}

          value={searchQuery || (selectedOption ? selectedOption.label : '')}
          onChange={(e) => {
            const inputValue = e.target.value;
            setSearchQuery(inputValue);
            if (!inputValue) {
              setIsOpen(false);
              onChange(null);
            } else {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery(''); // <- Vide le champ pour forcer l'affichage de toutes les options
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Choisissez un élément"
          className={`
               w-full ${height} p-2 border border-gray-300 rounded-md 
                focus:outline-none 'focus:border-gray-500 
               ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}
             `}
          disabled={disabled} // <-- new
          required={required}
        />

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.code}
                  className={`p-2 m-1 cursor-pointer hover:bg-indigo-50 rounded-md `}
                  onClick={() => {
                    if (disabled) return;

                    onChange(option.code); // <-- Send back the code only
                    setSearchQuery(option.label);
                    setIsOpen(false);
                  }}
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