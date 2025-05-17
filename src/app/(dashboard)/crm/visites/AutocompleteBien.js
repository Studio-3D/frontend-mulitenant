import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const AutocompleteBien = ({ x, i, user, biensByProjet, handleinputchange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null); // Ref for the dropdown container

  // Initialize with the current selected value
  useEffect(() => {
    const selectedOption = biensByProjet?.find((b) => b.id === x.bien_id);
    setInputValue(selectedOption?.propriete_dite_bien || '');
  }, [x.bien_id, biensByProjet]);

  // Close dropdown when clicking outside
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

  const filteredOptions = biensByProjet?.filter((option) =>
    option.propriete_dite_bien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    handleinputchange(
      {
        target: {
          name: 'bien_id',
          value: option.id,
        },
      },
      i
    );
    setInputValue(option.propriete_dite_bien);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);
    setSearchQuery(inputValue);
    setIsOpen(true);
    if (inputValue === '') {
      handleinputchange(
        {
          target: {
            name: 'bien_id',
            value: '',
          },
        },
        i
      );
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery(''); // Clear search when opening dropdown
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block font-medium text-gray-700">
        Bien <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Sélectionner un bien"
          className="w-full cursor-pointer h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 text-[15px] pr-8"
          required
        />

        {/* Dropdown toggle icon */}
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={toggleDropdown}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 m-2 text-gray-400 rotate-180" />
          ) : (
            <ChevronDown className="h-4 w-4 m-2 text-gray-400" />
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-300 z-10">
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              </div>
            ) : filteredOptions?.length === 0 ? (
              <div className="p-2 text-gray-500 text-[15px]">Aucun bien trouvé</div>
            ) : (
              filteredOptions?.map((option) => {
                const isDisabled =
                  option.etat === 'ENCOURS_DE_PROPOSITION' &&
                  option.is_proposed !== null &&
                  user.id !== option.is_proposed.user_id;

                const labelText =
                  option.propriete_dite_bien +
                  (option.etat === 'ENCOURS_DE_PROPOSITION'
                    ? option?.is_proposed !== null
                      ? user.id !== option?.is_proposed?.user_id
                        ? ` Proposé par ${option?.is_proposed?.user?.name} ${option?.is_proposed?.user?.prenom}`
                        : ' Proposé par Moi Même'
                      : ''
                    : '');

                return (
                  <div
                    key={option.id}
                    className={`p-2 text-[15px] m-2 rounded-md cursor-pointer hover:bg-indigo-50 ${
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
      </div>
    </div>
  );
};

export default AutocompleteBien;