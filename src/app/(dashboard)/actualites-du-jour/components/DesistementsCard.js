import React, { useState } from 'react';

export default function DesistementsCard({ desistements = [], sumPenalites = 0, sumMontantAAjouter = 0 }) {
  const [activeTab, setActiveTab] = useState('DD');
  

  const getType = (type, type_dp) => {
    if (type === 1) return 1;
    if (type === 3) return 5;
    if (type === 2) {
      if (type_dp === 1) return 2;
      if (type_dp === 2) return 3;
      if (type_dp === 3) return 4;
    }
    return 0;
  };
  

  const categorizedData = {
    1: desistements.filter(item => getType(item.type, item.type_dp) === 1),
    2: desistements.filter(item => getType(item.type, item.type_dp) === 2),
    3: desistements.filter(item => getType(item.type, item.type_dp) === 3),
    4: desistements.filter(item => getType(item.type, item.type_dp) === 4),
    5: desistements.filter(item => getType(item.type, item.type_dp) === 5)
  };


  // Tab configuration
  const tabs = [
    { id: 'DD', label: 'DD', color: 'text-red-500' },
    { id: 'DP PROCHE', label: 'DP PROCHE', color: 'text-orange-500' },
    { id: 'DP CO', label: 'DP CO', color: 'text-yellow-500' },
    { id: 'DP PARTIEL', label: 'DP PARTIEL', color: 'text-green-500' },
    { id: 'CHANGE', label: 'CHANGE', color: 'text-blue-500' }
  ];


  const tabToDataMap = {
    'DD': 1,
    'DP PROCHE': 2,
    'DP CO': 3,
    'DP PARTIEL': 4,
    'CHANGE': 5
  };


  const chipColors = [
    'bg-green-100 text-green-800',
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800'
  ];
  

  const parentes = ['Lien_parente', 'Lien_parente', 'Lien_parente', 'Lien_parente', 'Autre'];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b">
        <div className="text-lg font-semibold">Désistements</div>
      </div>
      
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'border-2 border-gray-200'
              }`}
            >
              <span className={`text-xs font-medium ${activeTab === tab.id ? '!text-blue-600' : '!text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                {activeTab === 'DD' && (
                  <>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Code Réservation</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Bien</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Motif</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Pénalité</th>
                  </>
                )}
                {(activeTab === 'DP PROCHE' || activeTab === 'DP CO' || activeTab === 'DP PARTIEL') && (
                  <>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Bien</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Lien de Parenté</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Pénalité</th>
                  </>
                )}
                {activeTab === 'CHANGE' && (
                  <>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Ancien Bien</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Nouveau Bien</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Montant à Ajouter</th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Pénalité</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {categorizedData[tabToDataMap[activeTab]].map((item, index) => (
                <tr key={index} className="border-b">
                  {activeTab === 'DD' && (
                    <>
                      <td className="py-3 text-sm">{item.code_reservation}</td>
                      <td className="py-3 text-sm">{item.bien}</td>
                      <td className="py-3">
                        <span className={`${chipColors[index % chipColors.length]} text-xs px-2 py-1 rounded-full`}>
                          Incapacité Financière
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}
                  
                  {(activeTab === 'DP PROCHE' || activeTab === 'DP CO' || activeTab === 'DP PARTIEL') && (
                    <>
                      <td className="py-3 text-sm">{item.bien}</td>
                      <td className="py-3">
                        <span className={`${chipColors[index % chipColors.length]} text-xs px-2 py-1 rounded-full`}>
                          {parentes[index % parentes.length]}
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'CHANGE' && (
                    <>
                      <td className="py-3 text-sm">{item.bien}</td>
                      <td className="py-3 text-sm">{item.new_bien}</td>
                      <td className="py-3">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {item.montant_a_ajouter} DH
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              
              {categorizedData[tabToDataMap[activeTab]].length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'CHANGE' ? 4 : activeTab === 'DD' ? 4 : 3} className="py-4 text-center text-gray-500">
                    Aucun désistement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
