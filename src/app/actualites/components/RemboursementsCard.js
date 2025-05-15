import React from 'react';

export default function RemboursementsCard({ remboursements = [], sumRemb = 0 }) {
  // Array of avatar images
  const avatarSources = ['/images/immobilie.png', '/images/imm.png', '/images/fav.jpg'];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b">
        <div className="text-lg font-semibold">Remboursements</div>
      </div>
      
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center mb-4">
          <div className="text-xl font-bold text-indigo-600 mr-2">
            {sumRemb} DH
          </div>
          <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
            -{(sumRemb * 100 / 10000).toFixed(0)}%
          </div>
        </div>
        
        <div className="flex justify-between mb-4 text-sm font-medium border-b pb-2">
          <div>Propriété dite Bien</div>
          <div>Montant à Rembourser</div>
        </div>
        
        <div className="space-y-4">
          {remboursements.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="bg-gray-100 rounded-lg w-12 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                <img 
                  src={avatarSources[index % avatarSources.length]} 
                  alt="Property" 
                  className="w-5 h-5"
                />
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{item.propriete_dite_bien}</div>
                <div className="text-xs text-gray-500">
                  {item.tranche_nom ? item.tranche_nom : ''}
                  {item.bloc_nom ? '-' + item.bloc_nom : ''}
                  {item.immeuble_nom ? '-' + item.immeuble_nom : ''}
                </div>
              </div>
              
              <div className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                {item.montant_a_rembourser} DH
              </div>
            </div>
          ))}
          
          {remboursements.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Aucun remboursement
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
