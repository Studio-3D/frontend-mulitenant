import React, { useState, useEffect } from 'react';
import { getModePaiementLabel } from '@/configs/enum';
import format from 'date-fns/format';

export function Changement_De_Bien({
  formData,
  bien_ancien,
  sum_avances_valides,
  banques,
  user,
  code_reservation,
}) {
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);
  const [montant_a_ajouter, set_montant_a_ajouter] = useState(0);
  const [new_bien_id, set_new_bien_id] = useState(0);
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;

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
      const fileUrl = `${FileUrl}/Docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/paiements/${code_reservation}/${file.fichier}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
      {/* Ancien Bien Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5">
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
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <p className="text-sm font-semibold text-indigo-500 mb-1">Bien</p>
            <p className="text-gray-800 font-medium text-lg">{bien_ancien}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <p className="text-sm font-semibold text-indigo-500 mb-1">
              Somme Avances
            </p>
            <p className="text-gray-800 font-medium text-lg">
              <span className="text-indigo-700">
                {sum_avances_valides.toLocaleString()}
              </span>{' '}
              DH
            </p>
          </div>
        </div>
      </div>

      {/* Nouveau Bien Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-5">
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
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
            <p className="text-sm font-semibold text-teal-500 mb-1">Bien</p>
            <p className="text-gray-800 font-medium text-lg">
              {NomBienComplet(formData?.bien_nouveau)}
            </p>
          </div>

          {new_bien_id != 0 && (
            <>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-sm font-semibold text-teal-500 mb-1">
                  Avance
                </p>
                <p className="text-gray-800 font-medium text-lg">
                  <span className="text-teal-700">
                    {formData?.bien_nouveau?.avance_minimale.toLocaleString()}
                  </span>{' '}
                  DH
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-sm font-semibold text-teal-500 mb-1">
                  Montant à Ajouter
                </p>
                <p className="text-gray-800 font-medium text-lg">
                  <span className="text-teal-700">
                    {formData?.montant_a_ajouter.toLocaleString()}
                  </span>{' '}
                  DH
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paiement Section */}
      {montant_a_ajouter > 0 && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5">
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-blue-500 mb-1">Sr</p>
              <p className="text-gray-800 font-medium text-lg">
                {formData?.sr ? (
                  <span className="text-green-500 font-bold">Oui</span>
                ) : (
                  <span className="text-gray-500">Non</span>
                )}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-blue-500 mb-1">
                Mode de Paiement
              </p>
              <p className="text-gray-800 font-medium text-lg">
                {getModePaiementLabel(formData?.mode_paiement)}
              </p>
            </div>

            {formData?.mode_paiement && formData?.mode_paiement !== 1 && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold text-blue-500 mb-1">
                    N° Paiement
                  </p>
                  <p className="text-gray-800 font-medium text-lg">
                    {formData?.numero_paiement || 'Non spécifié'}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold text-blue-500 mb-1">
                    Banque
                  </p>
                  <p className="text-gray-800 font-medium text-lg">
                    {getBanqueLabel(formData?.banque_id)}
                  </p>
                </div>

                {formData?.mode_paiement &&
                  ![1, 5, 6].includes(formData?.mode_paiement) && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-semibold text-blue-500 mb-1">
                        Échéance
                      </p>
                      <p className="text-gray-800 font-medium text-lg">
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

          {/* Files Section */}
          {selectedFiles_avc.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
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
                    className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
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
                      <p className="text-sm font-medium text-gray-700 hover:text-blue-500 truncate">
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
          )}
        </div>
      )}
    </div>
  );
}
