import { useState } from 'react';

const BienAutocomplete = ({
  biens,
  user,
  value,
  onChange,
  errors,
  name,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const getLabel = (bien) => {
    const isProposedByUser = bien.is_proposed?.user_id === user.id;
    const base = bien.propriete_dite_bien;
    if (bien.etat === 'ENCOURS_DE_PROPOSITION') {
      if (bien.is_proposed) {
        return isProposedByUser
          ? `${base} - Proposé par Moi Même`
          : `${base} - Proposé par ${bien.is_proposed.user.name} ${bien.is_proposed.user.prenom}`;
      }
    }
    return base;
  };

  const isDisabled = (bien) => {
    const isProposedByUser = bien.is_proposed?.user_id === user.id;
    return (
      (bien.etat === 'ENCOURS_DE_PROPOSITION' &&
        bien.is_proposed != null &&
        !isProposedByUser) ||
      bien.disabled
    );
  };

  const filteredBiens = biens.filter((bien) =>
    getLabel(bien).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full sm:w-96 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Bien {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="text"
        className="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Choisissez un bien"
        value={search || (value ? getLabel(value) : '')}
        onChange={(e) => {
          const inputValue = e.target.value;
          setSearch(inputValue);
          setIsOpen(true);
        
          // If input is cleared, also clear the selected value
          if (inputValue === '') {
            onChange(null);
          }
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        required={required}
      />

      {isOpen && (
        <div className="absolute z-10 w-full bg-white shadow-lg border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">
          {filteredBiens.length === 0 ? (
            <div className="p-2 text-gray-500">Aucun bien trouvé</div>
          ) : (
            filteredBiens.map((bien) => (
              <div
                key={bien.id}
                className={`p-2 cursor-pointer hover:bg-indigo-100 ${
                  isDisabled(bien) ? 'text-gray-400 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  if (!isDisabled(bien)) {
                    onChange(bien);
                    setSearch(getLabel(bien));
                    setIsOpen(false);
                  }
                }}
              >
                {getLabel(bien)}
              </div>
            ))
          )}
        </div>
      )}

      {errors?.[name] && (
        <span className="text-red-500 text-sm">{errors[name].message}</span>
      )}
    </div>
  );
};

export default BienAutocomplete;
