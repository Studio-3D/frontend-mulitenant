import React from 'react';

export default function AvancesCard({ avances = [], sumAvances = 0, commercial = 'tous' }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b">
        <div className="text-lg font-semibold">Paiements</div>
      </div>
      
      <div className="px-6 pt-4 pb-2">
        <div className="text-xl font-bold mb-4 !text-blue-600">
          {sumAvances} DH
        </div>
        
        <div className="flex justify-between mb-4 !text-gray-500 text-sm font-medium">
          <div>Propriété dite Bien</div>
          <div>Avances</div>
        </div>
        
        <div className="space-y-4">
          {avances.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="font-medium">{item.propriete_dite_bien}</div>
                <div className="text-sm !text-gray-500">
                  {item.tranche_nom ? item.tranche_nom : ''}
                  {item.bloc_nom ? '-' + item.bloc_nom : ''}
                  {item.immeuble_nom ? '-' + item.immeuble_nom : ''}
                </div>
              </div>
              
              <div className="bg-blue-100 !text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {item.montant} DH
              </div>
            </div>
          ))}

          {avances.length === 0 && (
            <div className="text-center py-4 !text-gray-500">
              Aucun paiement trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
