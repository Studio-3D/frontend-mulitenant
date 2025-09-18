
import React from 'react';

export default function RemboursementsCard({ remboursements = [] }) {
  return (
    <div className="">
      {/*<div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">Remboursements</div>
        <div className="text-lg font-bold text-indigo-600">{sumRemb} DH</div>
      </div>*/}
      
      <div className="px-6 pt-4 pb-2">
        <div className="flex justify-between mb-4 text-sm font-medium border-b pb-2">
          <div>Propriété dite Bien</div>
          <div>Montant à Rembourser</div>
        </div>
        
        <div className="space-y-4">
          {remboursements.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="font-medium">{item.propriete_dite_bien}</div>
                <div className="text-xs !text-gray-500">
                  {item.tranche_nom ? item.tranche_nom : ''}
                  {item.bloc_nom ? '-' + item.bloc_nom : ''}
                  {item.immeuble_nom ? '-' + item.immeuble_nom : ''}
                </div>
              </div>
              
              <div className="bg-red-100 !text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                {item.montant_a_rembourser} DH
              </div>
            </div>
          ))}
          
          {remboursements.length === 0 && (
            <div className="text-center py-4 !text-gray-500">
              Aucun remboursement
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

