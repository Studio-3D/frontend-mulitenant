import React, { useState } from 'react';

export default function DesistementsCard({
  desistements = [],
  itemsPerPage = 6,
}) {
  const [activeTab, setActiveTab] = useState('DD');
  const [currentPages, setCurrentPages] = useState({
    DD: 1,
    'DP PROCHE': 1,
    'DP CO': 1,
    'DP PARTIEL': 1,
    CHANGE: 1,
  });

  const getType = (type, type_dp) => {
    const typeNum = parseInt(type);
    const typeDpNum = type_dp ? parseInt(type_dp) : null;

    if (typeNum == 1) return 1;
    if (typeNum == 3) return 5;
    if (typeNum == 2) {
      if (typeDpNum == 1) return 2;
      if (typeDpNum == 2) return 3;
      if (typeDpNum == 3) return 4;
    }
    return 0;
  };

  const categorizedData = {
    1: desistements.filter((item) => getType(item.type, item.type_dp) === 1),
    2: desistements.filter((item) => getType(item.type, item.type_dp) === 2),
    3: desistements.filter((item) => getType(item.type, item.type_dp) === 3),
    4: desistements.filter((item) => getType(item.type, item.type_dp) === 4),
    5: desistements.filter((item) => getType(item.type, item.type_dp) === 5),
  };

  // Tab configuration
  const tabs = [
    { id: 'DD', label: 'DD', color: 'text-red-500' },
    { id: 'DP PROCHE', label: 'DP PROCHE', color: 'text-orange-500' },
    { id: 'DP CO', label: 'DP CO', color: 'text-yellow-500' },
    { id: 'DP PARTIEL', label: 'DP PARTIEL', color: 'text-green-500' },
    { id: 'CHANGE', label: 'CHANGE', color: 'text-blue-500' },
  ];

  const tabToDataMap = {
    DD: 1,
    'DP PROCHE': 2,
    'DP CO': 3,
    'DP PARTIEL': 4,
    CHANGE: 5,
  };

  const chipColors = [
    'bg-green-100 !text-green-800',
    'bg-red-100 !text-red-800',
    'bg-blue-100 !text-blue-800',
    'bg-yellow-100 !text-yellow-800',
    'bg-purple-100 text-purple-800',
  ];

  const parentes = [
    'Lien_parente',
    'Lien_parente',
    'Lien_parente',
    'Lien_parente',
    'Autre',
  ];

  // Get current items for active tab
  const currentData = categorizedData[tabToDataMap[activeTab]] || [];
  const currentPage = currentPages[activeTab] || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPages({
      ...currentPages,
      [activeTab]: page,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="">
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border-2 border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  activeTab === tab.id ? '!text-blue-600' : '!text-gray-600'
                }`}
              >
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
                    <th className="py-2 text-left text-sm font-semibold ">
                      Code Réservation
                    </th>
                    <th className="py-2 text-left text-sm font-semibold ">
                      Bien
                    </th>
                    <th className="py-2 text-left text-sm font-semibold ">
                      Motif
                    </th>
                    <th className="py-2 text-left text-sm font-semibold ">
                      Pénalité
                    </th>
                  </>
                )}
                {(activeTab === 'DP PROCHE' ||
                  activeTab === 'DP CO' ||
                  activeTab === 'DP PARTIEL') && (
                  <>
                    <th className="py-2 text-left text-sm font-semibold ">
                      Bien
                    </th>
                    <th className="py-2 text-left text-sm font-medium ">
                      Lien de Parenté
                    </th>
                    <th className="py-2 text-left text-sm font-medium ">
                      Pénalité
                    </th>
                  </>
                )}
                {activeTab === 'CHANGE' && (
                  <>
                    <th className="py-2 text-left text-sm font-semibold">
                      Ancien Bien
                    </th>
                    <th className="py-2 text-left text-sm font-semibold">
                      Nouveau Bien
                    </th>
                    <th className="py-2 text-left text-sm font-semibold">
                      Montant à Ajouter
                    </th>
                    <th className="py-2 text-left text-sm font-semibold">
                      Pénalité
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b">
                  {activeTab === 'DD' && (
                    <>
                      <td className="py-3 text-sm">{item.code_reservation}</td>
                      <td className="py-3 text-sm">
                        {item.bien}{' '}
                        {item.tranche_nom ? `-${item.tranche_nom}` : ''}
                        {item.bloc_nom ? `-${item.bloc_nom}` : ''}
                        {item.immeuble_nom ? `-${item.immeuble_nom}` : ''}
                      </td>
                      <td className="py-3">
                        <span
                          className={`${
                            chipColors[index % chipColors.length]
                          } text-xs px-2 py-1 rounded-full`}
                        >
                          Incapacité Financière
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 !text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}

                  {(activeTab === 'DP PROCHE' ||
                    activeTab === 'DP CO' ||
                    activeTab === 'DP PARTIEL') && (
                    <>
                      <td className="py-3 text-sm">{item.bien}</td>
                      <td className="py-3">
                        <span
                          className={`${
                            chipColors[index % chipColors.length]
                          } text-xs px-2 py-1 rounded-full`}
                        >
                          {parentes[index % parentes.length]}
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 !text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}

                  {activeTab === 'CHANGE' && (
                    <>
                      <td className="py-3 text-sm">
                        {item.bien}{' '}
                        {item.tranche_nom ? `-${item.tranche_nom}` : ''}
                        {item.bloc_nom ? `-${item.bloc_nom}` : ''}
                        {item.immeuble_nom ? `-${item.immeuble_nom}` : ''}
                      </td>
                      <td className="py-3 text-sm">
                        {item.new_bien}{' '}
                        {item.new_tranche_nom ? `-${item.new_tranche_nom}` : ''}
                        {item.new_bloc_nom ? `-${item.new_bloc_nom}` : ''}
                        {item.new_immeuble_nom
                          ? `-${item.new_immeuble_nom}`
                          : ''}
                      </td>
                      <td className="py-3">
                        <span className="bg-green-100 !text-green-800 text-xs px-2 py-1 rounded-full">
                          {item.montant_a_ajouter} DH
                        </span>
                      </td>
                      <td className="py-3">
                        {item.penalite && (
                          <span className="bg-red-100 !text-red-800 text-xs px-2 py-1 rounded-full">
                            {item.penalite} DH
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      activeTab === 'CHANGE' ? 4 : activeTab === 'DD' ? 4 : 3
                    }
                    className="py-4 text-center !text-gray-500"
                  >
                    Aucun désistement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for desistements */}
        {currentData.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page ? 'bg-blue-500 text-white' : 'border'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
