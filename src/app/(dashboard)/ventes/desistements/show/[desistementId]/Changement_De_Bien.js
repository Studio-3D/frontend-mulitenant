import React, { useState, useEffect } from 'react';
import { getModePaiementLabel } from '@/configs/enum';
import format from 'date-fns/format';

export function Changement_De_Bien({
  formData,
  bien_ancien,
  sum_avances_valides,
  banques,
}) {
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);
  const [montant_a_ajouter, set_montant_a_ajouter] = useState(0);
  const [new_bien_id, set_new_bien_id] = useState(0);

  useEffect(() => {
    if (formData) {
      setSelectedFiles_avc(
        formData?.piece_jointes_des_montant_a_ajouter
          ? formData.piece_jointes_des_montant_a_ajouter
          : []
      );
      set_new_bien_id(formData.bien_id_new);
      set_montant_a_ajouter(formData.montant_a_ajouter);
    }
  }, [formData]);

  function NomBienComplet(bien) {
    if (!bien) return '';
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    noms.push(bien.propriete_dite_bien);
    return noms.join(' - ');
  }

  const getBanqueLabel = (id) => {
    const found = banques.find((b) => b.id === id);
    return found ? found.nom : 'Non spécifié';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleFileClick = (file) => {
    if (file.fichier) {
      // Construct the full URL to your file
      const fileUrl = `${APIURL.ROOTV1}/storage/${file.fichier}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Ancien Bien Card - Indigo Theme */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-md overflow-hidden border-l-4 border-indigo-400">
          <div className="p-5 bg-indigo-600">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Ancien Bien
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-semibold text-indigo-600 mb-1">Bien</p>
              <p className="text-gray-800 font-medium">{bien_ancien}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-semibold text-indigo-600 mb-1">
                Somme Avances
              </p>
              <p className="text-gray-800 font-medium">
                {sum_avances_valides.toLocaleString() + ' DH'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nouveau Bien Card - Amber Theme */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-md overflow-hidden border-l-4 border-amber-400">
          <div className="p-5 bg-amber-500">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Nouveau Bien
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-semibold text-amber-600 mb-1">Bien</p>
              <p className="text-gray-800 font-medium">
                {NomBienComplet(formData?.bien_nouveau)}
              </p>
            </div>

            {new_bien_id != 0 && (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-amber-600 mb-1">
                    Avance
                  </p>
                  <p className="text-gray-800 font-medium">
                    {(formData?.bien_nouveau?.avance_minimale).toLocaleString() +
                      ' DH'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-amber-600 mb-1">
                    Montant à Ajouter
                  </p>
                  <p className="text-gray-800 font-medium">
                    {formData?.montant_a_ajouter.toLocaleString() + ' DH'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Paiement Section - Blue Theme */}
      {montant_a_ajouter > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-md overflow-hidden border-l-4 border-blue-400">
            <div className="p-5 bg-blue-500">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Modalité de Paiement
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-semibold text-blue-500 mb-1">Sr</p>
                <p className="text-gray-800 font-medium">
                  {formData?.sr ? 'Oui' : 'Non'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-semibold text-blue-500 mb-1">
                  Mode de Paiement
                </p>
                <p className="text-gray-800 font-medium">
                  {getModePaiementLabel(formData?.mode_paiement)}
                </p>
              </div>

              {formData?.mode_paiement && formData?.mode_paiement !== 1 && (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-blue-500 mb-1">
                      N° Paiement
                    </p>
                    <p className="text-gray-800 font-medium">
                      {formData?.numero_paiement || 'Non spécifié'}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-blue-500 mb-1">
                      Banque
                    </p>
                    <p className="text-gray-800 font-medium">
                      {getBanqueLabel(formData?.banque_id)}
                    </p>
                  </div>

                  {formData?.mode_paiement &&
                    ![1, 5, 6].includes(formData?.mode_paiement) && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold text-blue-500 mb-1">
                          Échéance
                        </p>
                        <p className="text-gray-800 font-medium">
                          {formData?.echeance
                            ? format(
                                new Date(formData?.echeance),
                                'dd/MM/yyyy ',
                                {
                                  timeZone: 'UTC',
                                }
                              )
                            : ''}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>

            {/* Files Section with clickable links */}
            {selectedFiles_avc.length > 0 && (
              <div className="px-6 pb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center border-b pb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Fichiers joints ({selectedFiles_avc.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedFiles_avc.map((data, index) => (
                      <div
                        key={data.id || index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleFileClick(data)}
                      >
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-500 hover:text-blue-800 truncate">
                            {data.fichier || data.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(data.size)}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
