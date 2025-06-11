import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);

  // Initialize with current value
  useEffect(() => {
    const selected = options.find((opt) => opt[code] === value);
    setInputValue(selected ? selected[labelKey] : '');
    setSearchQuery('');
  }, [value, options, code, labelKey]);

  // Click outside handler
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

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option[labelKey]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && showAllOnFocus) {
      setSearchQuery('');
    }
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option[code],
      },
    });
    setInputValue(option[labelKey]);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Handle input change
  const handleChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    setSearchQuery(inputValue);
    setIsOpen(true);

    if (inputValue === '') {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (showAllOnFocus) {
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      {label && (
        <label className="block font-medium !text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full ${height} p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 pr-8`}
          required={required}
        />

        {/* Dropdown toggle icon */}
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

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {filteredOptions.length === 0 ? (
              <div className="p-2 !text-gray-500 text-[15px]">Aucun résultat trouvé</div>
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
    </div>
  );
};

export default AutocompleteStatut_ModeRelance_Biens;