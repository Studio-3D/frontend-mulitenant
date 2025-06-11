import React, { useState } from 'react';

export default function VentesCard({ ventes = [], sumVentes = 0, avances = [], sumAvances = 0 }) {
  const [activeTab, setActiveTab] = useState('ventes');
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">
          {activeTab === 'ventes' ? 'Ventes' : 'Paiements'}
        </div>
        <div className="text-xl font-bold !text-green-600">
          {activeTab === 'ventes' ? sumVentes : sumAvances} DH
        </div>
      </div>
      
      <div className="px-6 pt-4 pb-2">
        <div className="flex mb-4 border-b">
          <button 
            onClick={() => setActiveTab('ventes')} 
            className={`pb-2 px-4 ${activeTab === 'ventes' ? 'border-b-2 border-blue-500 font-medium !text-blue-600' : '!text-gray-500'}`}
          >
            Ventes
          </button>
          <button 
            onClick={() => setActiveTab('avances')} 
            className={`pb-2 px-4 ${activeTab === 'avances' ? 'border-b-2 border-blue-500 font-medium !text-blue-600' : '!text-gray-500'}`}
          >
            Paiements
          </button>
        </div>
        
        {activeTab === 'ventes' ? (
          <>
            <div className="flex justify-between mb-4 !text-gray-500 text-sm font-medium">
              <div>Propriété dite Bien</div>
              <div>Montant</div>
            </div>
            
            <div className="space-y-4">
              {ventes.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <div className="font-medium">{item.propriete_dite_bien}</div>
                    <div className="text-sm !text-gray-500">
                      {item.tranche_nom ? item.tranche_nom : ''}
                      {item.bloc_nom ? '-' + item.bloc_nom : ''}
                      {item.immeuble_nom ? '-' + item.immeuble_nom : ''}
                    </div>
                  </div>
                  
                  <div className="bg-green-100 !text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {item.montant} DH
                  </div>
                </div>
              ))}

              {ventes.length === 0 && (
                <div className="text-center py-4 !text-gray-500">
                  Aucune vente trouvée
                </div>
              )}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
