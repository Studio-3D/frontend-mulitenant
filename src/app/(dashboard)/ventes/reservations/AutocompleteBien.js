import { useState, useEffect } from 'react';

const AutocompleteBien = ({
  label = 'Bien',
  name = 'bien_id',
  user,
  biensByProjet = [],
  value = null,
  onChange,
  disabled = false,
  loading = false,
  error = false,
}) => {
    const [isTyping, setIsTyping] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = biensByProjet?.find(b => b.id === value);

  useEffect(() => {
    if (selectedOption) {
      setSearchQuery(selectedOption.propriete_dite_bien); // Keep the selected value in the input
    } else {
      setSearchQuery('');
    }
  }, [value, biensByProjet,selectedOption]);

  const filteredOptions = !isTyping
  ? biensByProjet // 👈 Show all if not typing
  : biensByProjet?.filter(option => {
      const labelText = option.propriete_dite_bien.toLowerCase();
      return labelText.includes(searchQuery.toLowerCase());
    });

  const handleSelect = (option) => {
    if (onChange) {
      onChange(null, option); // Send full Bien object like MUI
    }
    setSearchQuery(option.propriete_dite_bien); // Keep the selected value in the input
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    setIsTyping(true); // 👈 User is typing
  
    if (!inputValue) {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }
  
    setIsOpen(true);
  };
  

  const handleFocus = () => {
    setIsOpen(true);
    setIsTyping(false); // 👈 Reset typing on focus
  };
  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      <input
        type="text"
        value={searchQuery || (selectedOption ? selectedOption.propriete_dite_bien : '')} // Display selected value or search query
        onChange={handleInputChange}
        onFocus={handleFocus} // This is where we show all options
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        placeholder="Sélectionner un bien"
        disabled={disabled}
        className={`w-full h-10 p-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        required
      />

      {isOpen && filteredOptions?.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
          {loading ? (
            <div className="p-4 flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : (
            filteredOptions.map(option => {
              const isDisabled =
                option.etat === 'ENCOURS_DE_PROPOSITION' &&
                option.is_proposed !== null &&
                user?.id !== option.is_proposed.user_id;

              const labelText =
                option.propriete_dite_bien +
                (option.etat === 'ENCOURS_DE_PROPOSITION'
                  ? option.is_proposed
                    ? user?.id !== option.is_proposed.user_id
                      ? ` Proposé par ${option.is_proposed.user?.name} ${option.is_proposed.user?.prenom}`
                      : ' Proposé par Moi Même'
                    : ''
                  : '');

              return (
                <div
                  key={option.id}
                  className={`p-2 text-sm cursor-pointer hover:bg-indigo-100 ${
                    isDisabled ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={() => !isDisabled && handleSelect(option)}
                >
                  {labelText}
                </div>
              );
            })
          )}
        </div>
      )}

      {isOpen && !loading && filteredOptions?.length === 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 z-10 rounded-md mt-1 p-2 text-sm text-gray-500">
          Aucun bien trouvé
        </div>
      )}
    </div>
  );
};

export default AutocompleteBien;
