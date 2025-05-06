import { useState, useEffect } from 'react';

const AutocompleteStatut_ModeRelance_Biens = ({
  label = null,
  name = null,
  placeholder = '',
  options = [],
  value,
  onChange,
  required = false,
  showAllOnFocus = true,
  width = 'w-full',
  height = 'h-[38px]',
  code = 'code',
  labelKey = 'label',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option[labelKey]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the selected option based on the provided value
  const selectedOption = options.find((opt) => opt[code] === value);

  // Handle input focus
  const handleFocus = () => {
    if (showAllOnFocus) setSearchQuery('');
    setIsOpen(true);
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option[code],
      },
    });
    setSearchQuery(option[labelKey]); // Set input field to selected label
    setIsOpen(false); // Close dropdown
  };

  // Handle input change
  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);

    // Clear the input if it's empty
    if (inputValue === '') {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }

    setIsOpen(true); // Show dropdown
  };

  // Effect to clear input when no options match
  useEffect(() => {
    if (filteredOptions.length === 0 && searchQuery) {
      setSearchQuery(''); // Clear input
      onChange({
        target: {
          name,
          value: '',
        },
      }); // Notify parent that value is cleared
    }
  }, [filteredOptions, searchQuery, onChange, name]);

  return (
    <div className={`relative ${width}`}>
      {label && (
        <label className="block font-medium text-gray-700 ">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type="text"
        name={name}
        value={searchQuery || (selectedOption ? selectedOption[labelKey] : '')}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)} // Delay closing dropdown to allow clicks
        placeholder={placeholder}
        className={`w-full ${height} p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500`}
        required={required}
      />

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-gray-500 text-[15px]">Aucun résultat trouvé</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option[code]}
                className="p-2 text-[15px] cursor-pointer m-2 hover:bg-indigo-50 rounded-md"
                onClick={() => handleSelect(option)}
              >
                {option[labelKey]}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteStatut_ModeRelance_Biens;
