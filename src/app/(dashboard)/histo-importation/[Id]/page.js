'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';

export default function ImportDetail() {
  const params = useParams();
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-blue-600 font-semibold">
          Chargement des informations...
        </p>
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
  const ligneEchouee = importInfo.ligne_echou ? Number(importInfo.ligne_echou) : null;

  // Calculate lines processed based on import status
  let lignesTraitees, lignesRestantes;

  if (importInfo.statut === '2') {
    // Import successful - all lines processed
    lignesTraitees = totalLignes;
    lignesRestantes = 0;
  } else if (importInfo.statut === '3' && ligneEchouee) {
    // Import failed - lines processed up to the error
    lignesTraitees = ligneEchouee - 1;
    lignesRestantes = totalLignes - lignesTraitees;
  } else {
    // Import pending or in progress
    lignesTraitees = 0;
    lignesRestantes = totalLignes;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Détails de {"l'"}import
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4"></div>
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
              : 'Échoué'}
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
          <div
            role="alert"
            className="bg-orange-100 border border-red-400 px-4 py-3 rounded relative mb-6"
          >
            <p className="text-black-900 font-bold mb-1">
              Message {"d'"}erreur :
            </p>
            <p className="text-red-800 whitespace-pre-line">
              {importInfo.message_echou || "Aucun message d'erreur disponible."}
            </p>
          </div>
        )}

        {/* Lignes traitées et restantes */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 bg-blue-200 p-4 rounded-md text-center">
            <p className="text-black-900 font-semibold">Lignes traitées</p>
            <p className="text-2xl font-bold text-blue-900">
              {lignesTraitees} / {totalLignes}
            </p>
          </div>
          <div className="flex-1 bg-yellow-200 p-4 rounded-md text-center">
            <p className="text-yellow-900 font-semibold">Lignes restantes</p>
            <p className="text-2xl font-bold text-yellow-900">
              {lignesRestantes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
