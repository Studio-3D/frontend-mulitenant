import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AutocompleteMultipleDes = ({
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
  const actualValueKey = valueKey || choiceKey;
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Sync with external value changes
 // Better synchronization with external value changes
  useEffect(() => {
    if (!Array.isArray(value)) {
      setSelectedOptions([]);
      return;
    }

    const newSelected = value
      .map(val => {
        if (typeof val == 'object') {
          return options.find(opt => 
            String(opt[actualValueKey]) === String(val[actualValueKey])
          ) || val;
        }
        return options.find(opt => 
          String(opt[actualValueKey]) == String(val)
        );
      })
      .filter(Boolean);

    setSelectedOptions(newSelected);
  }, [value, options, actualValueKey]);
  // Filter options to exclude currently selected ones
  const availableOptions = options.filter(option => 
    !selectedOptions.some(selected => 
      String(selected[actualValueKey]) === String(option[actualValueKey])
    )
  );

  // Filter based on search input
  const filteredOptions = inputValue.trim() === '' 
    ? availableOptions 
    : availableOptions.filter(opt => {
        const fullName = `${opt.client?.nom||opt.nom || ''} ${opt.client?.prenom ||opt.prenom|| ''}`.toLowerCase();
        return fullName.includes(inputValue.toLowerCase());
      });

  // Handle option selection
  const handleSelect = (option) => {
    const newSelected = [...selectedOptions, option];
    setSelectedOptions(newSelected);
    onChange(newSelected);
    setInputValue('');
    setIsDropdownOpen(false);
  };

  // Handle option removal
  const handleRemove = (option) => {
    const newSelected = selectedOptions.filter(
      item => String(item[actualValueKey]) !== String(option[actualValueKey])
    );
    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const formatDisplay = (opt) => {
    if (opt.client) {
      return `${opt.client.nom} ${opt.client.prenom}`;
    }
    else if (opt.nom && opt.prenom) {
      return `${opt.nom} ${opt.prenom}`;
    }
    else {
      return opt[choiceKey] || opt.toString();
    }
  };

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className={`flex flex-wrap items-center gap-2 p-2 border rounded-md bg-white min-h-[42px] ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}>
          {selectedOptions.map(option => (
            <div key={option[actualValueKey]} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {formatDisplay(option)}
              <button 
                type="button" 
                onClick={() => handleRemove(option)}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          ))}
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            className="flex-grow min-w-[120px] outline-none"
          />
          
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 cursor-pointer transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">Aucune option disponible</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option[actualValueKey]}
                  className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelect(option)}
                >
                  {formatDisplay(option)}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
      {backendErrors[name] && <p className="mt-1 text-sm text-red-600">{backendErrors[name][0]}</p>}
    </div>
  );
};

export default AutocompleteMultipleDes;