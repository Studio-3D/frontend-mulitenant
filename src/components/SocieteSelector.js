"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSociete } from "../context/SocieteContext";
import { FaBuilding } from "react-icons/fa";

export default function SocieteSelector({ returnPath = "/" }) {
  const { societes, selectSociete, loading } = useSociete();
  const [selectedId, setSelectedId] = useState("");
  const [switching, setSwitching] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    const societe = societes.find(s => s.id.toString() === selectedId);
    if (!societe) return;

    setSwitching(true);
    const success = await selectSociete(societe);
    setSwitching(false);
    
    if (success) {
      router.push(returnPath);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Chargement des sociétés...</div>;
  }

  if (!societes || societes.length === 0) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
        <p className="text-amber-700">Aucune société disponible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-center">Sélectionner une société</h3>
      
      <div className="mb-4">
        <label htmlFor="societe" className="block text-sm font-medium text-gray-700 mb-1">
          Société
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="societe"
            className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            <option value="">Sélectionnez une société</option>
            {societes.map((societe) => (
              <option key={societe.id} value={societe.id}>
                {societe.nom || societe.raison_sociale}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!selectedId || switching}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          !selectedId || switching ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {switching ? 'Chargement...' : 'Continuer'}
      </button>
    </form>
  );
}
