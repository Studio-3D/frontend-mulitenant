import { useState } from 'react';

const AutocompleteBien = ({ x, i, user, biensByProjet, handleinputchange ,loading}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setSearchQuery(option.propriete_dite_bien);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
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
    setIsOpen(true);
  };

  const selectedOption = biensByProjet?.find((b) => b.id === x.bien_id);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium mb-1">
        Bien <span className="text-red-500">*</span>
      </label>

      <input
        type="text"
        value={searchQuery || selectedOption?.propriete_dite_bien || ''}
        onChange={handleChange}
        onFocus={() => {
          setIsOpen(true);
          setSearchQuery(''); // <- Vide le champ pour forcer l'affichage de toutes les options
        }} 
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        placeholder="Sélectionner un bien"
        className="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        required
      />

      {isOpen && (
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            </div>
          ) : filteredOptions?.length === 0 ? (
            <div className="p-2 text-gray-500 text-sm">Aucun bien trouvé</div>
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
    </div>
  );
};

export default AutocompleteBien;
