import React, { useState, useEffect } from 'react';

const AutocompleteClient = ({
  label = "Choisir un client si déjà exist *",
  options = [],
  value,
  onChange,
  placeholder = "Choisissez un Client",
  loading = false,
  width = "w-full",
  height = "h-10",
  required = true,
  errors,
  backendErrors,
  name = "id",
  index,
  selectedClient,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine the current value
  const currentValue = selectedClient && index === 0 ? selectedClient : value || '';

  // Find the selected client object
  const selectedOption = options.find(option => option.id === currentValue);

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(option => {
        if (!option) return false;
        
        const nom = option.nom ? String(option.nom) : '';
        const prenom = option.prenom ? String(option.prenom) : '';
        const fullName = `${nom} ${prenom}`.toLowerCase().trim();
        
        return fullName.includes(searchQuery.toLowerCase().trim());
      })
    : options;

  // Handle selecting an option
  const handleSelect = (option) => {
    // Don't select if option is disabled or if it's the selectedClient in another field
    if (option.disabled || (selectedClient && option.id === selectedClient && index !== 0)) {
      return;
    }
    onChange({ target: { name: 'id', value: option.id } }, index, 'select_client');
    setSearchQuery(`${option.nom} ${option.prenom}`);
    setIsOpen(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
    if (e.target.value === '') {
      onChange({ target: { name: 'id', value: '' } }, index, 'select_client');
    }
  };

  // Set initial search query when value changes
  useEffect(() => {
    if (selectedOption) {
      setSearchQuery(`${selectedOption.nom} ${selectedOption.prenom}`);
    } else {
      setSearchQuery('');
    }
  }, [currentValue, options]);

  // Handle errors
  const rawError = errors?.[name] || backendErrors?.[name];
  const errorMessage = rawError?.message ?? (typeof rawError === 'string' ? rawError : '');

  return (
    <div className={`relative ${width} mb-2`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={`${width} px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'
          } ${errorMessage ? 'border-red-500' : ''}`}
          required={required}
        />

        {/* Dropdown Options */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-4 h-4 border-2 border-t-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                <span>Loading...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500">Aucun client trouvé</div>
            ) : (
              filteredOptions.map((option) => {
                // Determine if the option should be disabled
                const isOptionDisabled = option.disabled || 
                  (selectedClient && option.id === selectedClient && index !== 0);
                
                return (
                  <div
                    key={option.id}
                    className={`p-2 ${
                      isOptionDisabled 
                        ? 'opacity-50 cursor-not-allowed text-gray-400' 
                        : 'cursor-pointer hover:bg-blue-100'
                    }`}
                    onClick={() => !isOptionDisabled && handleSelect(option)}
                  >
                    {option.nom} {option.prenom}
                  </div>
                );
              })
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

export default AutocompleteClient;