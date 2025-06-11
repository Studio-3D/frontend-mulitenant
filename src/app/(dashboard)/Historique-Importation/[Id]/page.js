"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { APIURL, RESOURCE_URL } from "@/configs/api";

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

        const res = await fetch(`${APIURL.ROOTV1}/histo_importation/${params.Id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 401) setError("Non autorisé");
          else setError("Erreur lors de la récupération des données");
          setImportInfo(null);
          return;
        }

        const json = await res.json();
        setImportInfo(json.import);
      } catch (err) {
        setError("Erreur réseau");
        setImportInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchImport();
  }, [params.Id]);

  const handleFileClick = (file) => {
    if (!user?.societe) {
      alert("Informations société non disponibles");
      return;
    }
    const url = `${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/Import_fichier/${file}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-blue-600 font-semibold">Chargement des informations...</p>
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
        <p className="text-gray-500 text-lg">Aucune information disponible pour cette importation.</p>
      </div>
    );
  }

  const ligneEchouee = Number(importInfo.ligne_echou);
  const totalLignes = importInfo.data?.length || 0;
  const lignesTraitees = ligneEchouee - 1;
  const lignesRestantes = totalLignes - lignesTraitees;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-blue-700">Détails de l'importation</h1>

        {/* Ligne de statut large et claire */}
<div
  className={`w-full px-6 py-3 rounded-lg font-semibold text-center text-lg ${
    importInfo.statut === "2"
      ? "bg-red-600 text-white"
      : "bg-green-600 text-white"
  }`}
>
  {importInfo.statut === "2" ? "Importation échouée" : "Importation réussie"}
</div>


<hr className="border-gray-400" />

{/* Fichier importé */}
<div>
  <h2 className="text-xl font-semibold text-gray-800 mb-2">Fichier importé</h2>
  <button
    onClick={() => handleFileClick(importInfo.fichier)}
    className="text-orange-700 underline hover:text-orange-900 transition"
    title="Ouvrir le fichier importé"
  >
    {importInfo.fichier}
  </button>
</div>

{/* Dates */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
  <div className="flex items-center space-x-3">
    <svg className="w-6 h-6 text-orange-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {/* ... */}
    </svg>
    <div>
      <p className="text-sm text-gray-800">Date d'importation</p>
      <p className="text-gray-900 font-medium">{new Date(importInfo.created_at).toLocaleString()}</p>
    </div>
  </div>

  <div className="flex items-center space-x-3">
    <svg className="w-6 h-6 text-orange-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {/* ... */}
    </svg>
    <div>
      <p className="text-sm text-gray-800">Date de l'échec</p>
      <p className={`font-medium ${importInfo.statut === "2" ? "text-red-500" : "text-gray-900"}`}>
        {importInfo.date_echou
          ? new Date(new Date(importInfo.date_echou).getTime() + 60 * 60 * 1000).toLocaleString()
          : "N/A"}
      </p>
    </div>
  </div>
</div>

{/* Message d'erreur */}
{importInfo.statut === "2" && (
  <div
    role="alert"
    className="bg-orange-100 border border-red-700 text-red-500 px-4 py-3 rounded relative my-6"
  >
    <strong className="font-bold">Message d'erreur :
    <span className="whitespace-pre-line">
      {importInfo.message_echou || "Aucun message d'erreur disponible."}
    </span>
    </strong>
  </div>
)}


{/* Lignes traitées et restantes */}
<div className="flex flex-col sm:flex-row gap-6 mt-6">
  <div className="flex-1 bg-orange-100 p-4 rounded-md text-center">
    <p className="text-gray-900 font-semibold">Lignes traitées</p>
    <p className="text-2xl font-bold text-orange-800">
      {lignesTraitees} / {totalLignes}
    </p>
  </div>
  <div className="flex-1 bg-yellow-200 p-4 rounded-md text-center">
    <p className="text-gray-900 font-semibold">Lignes restantes</p>
    <p className="text-2xl font-bold text-yellow-800">{lignesRestantes}</p>
  </div>
</div>
</div>
</div>

  );
}
