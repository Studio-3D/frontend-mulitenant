import React from 'react';

export function NavigationBar({ activeModel, onModelChange }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col">
        {/* Model Selection */}
        <div className="border-b">
          <div className="flex overflow-x-auto px-4 py-2">
            <button
              className={`px-4 py-2 font-medium rounded-md mr-2 ${activeModel == 'Desistement_Definitif' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => onModelChange('Desistement_Definitif')}
            >
              Désistement Définitif
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-md mr-2 ${activeModel == 'Desistement_Au_Profit' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => onModelChange('Desistement_Au_Profit')}
            >
             Désistement Au Profit
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-md mr-2 ${activeModel == 'Changement_De_Bien' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => onModelChange('Changement_De_Bien')}
            >
              Changement De Bien
            </button>
            
          </div>
        </div>
       
      </div>
    </div>
  );
}