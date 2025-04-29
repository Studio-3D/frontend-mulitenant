// Fichier : components/Autocomplete.jsx

import React, { useState, useEffect } from 'react';

const Autocomplete = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Choisissez un élément',
  choix = 'nom',
  getOptionLabel,
  loading = false,
  width = 'w-full',
  height = 'h-10',
  required = false,
  errors = {},
  backendErrors = {},
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (value && !searchQuery) {
      const label = getOptionLabel ? getOptionLabel(value) : value[choix];
      setSearchQuery(label || '');
    }
  }, [value, getOptionLabel, choix, searchQuery]);

  const filteredOptions = String(searchQuery || '') === ''
    ? options
    : options.filter(option => {
        const label = getOptionLabel ? getOptionLabel(option) : option[choix];
        return String(label || '').toLowerCase().includes(String(searchQuery).toLowerCase());
      });

  const handleSelect = (option) => {
    onChange(option);
    setSearchQuery(getOptionLabel ? getOptionLabel(option) : option[choix]);
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

  const rawError = errors[name] || backendErrors[name];
  const errorMessage = rawError?.message ?? (typeof rawError === 'string' ? rawError : '');

  return (
    <div className={`relative ${width}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative mt-1">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={`w-full ${height} p-2 border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${errorMessage ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}`}
          required={required}
        />

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-4 h-4 border-2 border-t-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                <span>Chargement...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500">Aucune option trouvée</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="p-2 cursor-pointer hover:bg-indigo-100"
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel ? getOptionLabel(option) : option[choix]}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default Autocomplete;