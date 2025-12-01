'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APIURL, RESOURCE_URL ,ENDPOINTS} from '@/configs/api';
import { ArrowLeft } from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '../../navigation/BreadCrumb';

export default function ImportDetail() {
  const params = useParams();
  const router = useRouter();
  const [importInfo, setImportInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    async function fetchImport() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${APIURL.ROOTV1}/histo_importation/${params.Id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) setError('Non autorisé');
          else setError('Erreur lors de la récupération des données');
          setImportInfo(null);
          return;
        }

        const json = await res.json();
        setImportInfo(json.import);
      } catch (err) {
        setError('Erreur réseau');
        setImportInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchImport();
  }, [params.Id]);

  const handleFileClick = (file) => {
    if (!user?.societe) {
      alert('Informations société non disponibles');
      return;
    }
    const url = `${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/Import_fichier/${file}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!importInfo) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 text-lg">
          Aucune information disponible pour cette importation.
        </p>
      </div>
    );
  }

  const totalLignes = importInfo.data?.length || 0;

  // Parse error information if available
  let errorInfo = null;
  if (importInfo.message_echou) {
    try {
      errorInfo = JSON.parse(importInfo.message_echou);
    } catch (e) {
      // If it's not JSON, treat as old format
      errorInfo = null;
    }
  }

  // Calculate lines processed based on import status
  let lignesTraitees,
    lignesRestantes,
    lignesEchouees = 0;

  if (importInfo.statut === '2') {
    // Import successful - all lines processed
    lignesTraitees = totalLignes;
    lignesRestantes = 0;
  } else if (importInfo.statut === '3') {
    if (errorInfo && errorInfo.lignes_reussies !== undefined) {
      // New format with detailed error info
      lignesTraitees = errorInfo.lignes_reussies;
      lignesEchouees = errorInfo.lignes_echouees;
      lignesRestantes = 0; // All lines were processed
    } else {
      // Old format - lines processed up to the error
      const ligneEchouee = importInfo.ligne_echou
        ? Number(importInfo.ligne_echou)
        : null;
      lignesTraitees = ligneEchouee ? ligneEchouee - 1 : 0;
      lignesRestantes = totalLignes - lignesTraitees;
      lignesEchouees = lignesRestantes;
    }
  } else {
    // Import pending or in progress
    lignesTraitees = 0;
    lignesRestantes = totalLignes;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Back button */}
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.HISTOIMPORTATION}
            step={`Détail Import`}
          />
        </div>
        <h1 className="text-3xl font-bold text-blue-700">
          Détails de {"l'"}import
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div
            className={`ml-auto px-4 py-1 rounded-full font-semibold text-sm ${
              importInfo.statut === '0'
                ? 'bg-gray-200 text-gray-900'
                : importInfo.statut === '1'
                ? 'bg-yellow-200 text-yellow-900'
                : importInfo.statut === '2'
                ? 'bg-green-200 text-green-900'
                : 'bg-red-200 text-red-900'
            }`}
          >
            {importInfo.statut === '0'
              ? 'En Attente'
              : importInfo.statut === '1'
              ? 'En Cours'
              : importInfo.statut === '2'
              ? 'Importé'
              : errorInfo && errorInfo.lignes_reussies > 0
              ? 'Importé avec erreurs'
              : 'Échec complet'}
          </div>
        </div>

        <hr className="border-gray-500" />

        {/* Fichier importé */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Fichier importé
          </h2>
          <button
            onClick={() => handleFileClick(importInfo.fichier)}
            className="text-blue-700  hover:text-blue-900 transition "
            title="Ouvrir le fichier importé"
          >
            {importInfo.fichier}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Date {"d'"}import
          </h2>
          <p className="text-gray-900 font-medium">
            {new Date(importInfo.created_at).toLocaleString()}
          </p>
        </div>

        {importInfo.statut === '3' && (
          <div className="space-y-4">
            {errorInfo ? (
              // New format with detailed error information
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">
                  Résumé de l{"'"}import
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-100 p-3 rounded text-center">
                    <p className="text-green-800 font-semibold">
                      Lignes réussies
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {errorInfo.lignes_reussies}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded text-center">
                    <p className="text-red-800 font-semibold">
                      Lignes échouées
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {errorInfo.lignes_echouees}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded text-center">
                    <p className="text-blue-800 font-semibold">Total lignes</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {errorInfo.total_lignes}
                    </p>
                  </div>
                </div>

                {errorInfo.erreurs && errorInfo.erreurs.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-orange-800 mb-3">
                      Détails des erreurs :
                    </h4>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full bg-white rounded shadow text-sm">
                        <thead className="bg-red-500 text-white sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Ligne</th>
                            <th className="px-4 py-2 text-left">Erreur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errorInfo.erreurs.map((error, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }
                            >
                              <td className="px-4 py-2 font-medium">
                                {error.ligne}
                              </td>
                              <td className="px-4 py-2 text-red-700">
                                {error.message}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Old format fallback
              <div
                role="alert"
                className="bg-orange-100 border border-red-400 px-4 py-3 rounded relative mb-6"
              >
                <p className="text-black-900 font-bold mb-1">
                  Message {"d'"}erreur :
                </p>
                <p className="text-red-800 whitespace-pre-line">
                  {importInfo.message_echou ||
                    "Aucun message d'erreur disponible."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lignes traitées et restantes - Only show if not using new error format */}
        {!(importInfo.statut === '3' && errorInfo) && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 bg-green-200 p-4 rounded-md text-center">
              <p className="text-green-900 font-semibold">Lignes réussies</p>
              <p className="text-2xl font-bold text-green-900">
                {lignesTraitees}
              </p>
            </div>
            {lignesEchouees > 0 && (
              <div className="flex-1 bg-red-200 p-4 rounded-md text-center">
                <p className="text-red-900 font-semibold">Lignes échouées</p>
                <p className="text-2xl font-bold text-red-900">
                  {lignesEchouees}
                </p>
              </div>
            )}
            {lignesRestantes > 0 && (
              <div className="flex-1 bg-yellow-200 p-4 rounded-md text-center">
                <p className="text-yellow-900 font-semibold">
                  Lignes restantes
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {lignesRestantes}
                </p>
              </div>
            )}
            <div className="flex-1 bg-blue-200 p-4 rounded-md text-center">
              <p className="text-blue-900 font-semibold">Total lignes</p>
              <p className="text-2xl font-bold text-blue-900">{totalLignes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
