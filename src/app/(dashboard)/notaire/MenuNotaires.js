// MenuNotaires.jsx (nouveau composant)
import React, { useState } from 'react';

const MenuNotaires = ({ notaires, selectedNotaire, onSelectNotaire, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Sélectionner un notaire</h3>
      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectNotaire(null)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedNotaire === null 
                ? 'bg-blue-600 text-white font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous les notaires
          </button>
          
          {notaires.map((notaire) => (
            <button
              key={notaire.id}
                 onClick={() => onSelectNotaire(notaire.id, `${notaire.name} ${notaire.prenom}`)} // Passer le nom ici
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedNotaire === notaire.id 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {notaire.name} {notaire.prenom}
            </button>
          ))}
          
          {notaires.length === 0 && !loading && (
            <div className="text-gray-500 italic">Aucun notaire disponible</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuNotaires;