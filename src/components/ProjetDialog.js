"use client";
import { useState } from "react";
import { useProjet } from "@/context/ProjetContext";
import { useRouter } from "next/navigation";
import SelectInput from "./SelectInput";
import Link from "next/link";
import { isCommercial } from '../configs/enum';
import { useAuth } from '../context/AuthContext';

const ProjetDialog = ({
  open,
  onClose,
  projets = [],
  returnPath,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { selectProjet } = useProjet();
  const { user } = useAuth();

  const handleConfirm = async () => {
    const selectedProjet = projets.find((p) => p.id == selectedId);

    if (!selectedProjet) {
      setError("Veuillez sélectionner un projet valide.");
      return;
    }

    setError(null);
    setLoading(true);
    
    selectProjet(selectedProjet);
    localStorage.setItem("selectedProjet", JSON.stringify(selectedProjet));
    onSelect?.(selectedProjet);

    await new Promise((res) => setTimeout(res, 400));
    setLoading(false);
    onClose();
     // Check for redirect URL in this priority:
  // 1. redirectAfterLogin (from login flow)
  // 2. returnPath (passed as prop)
  // 3. Default to dashboard
  
  const redirectUrl = localStorage.getItem('redirectAfterLogin');
  if (redirectUrl) {
    router.push(redirectUrl);
  } else if (returnPath) {
    router.push(returnPath);
  } else {
    router.push('/tableau-de-bord');
  }
   // if (returnPath) router.push(returnPath);
  };

  if (!open) return null;

  // Check if user is commercial using your existing function
  const userIsCommercial = isCommercial(user?.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white xl:w-[550px] rounded-xl">
        {/* Header */}
        <div className="bg-[#009FFF] text-white p-4 rounded-t-xl">
          <h2 className="xl:text-xl text-center">Veuillez sélectionner un projet</h2>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center pt-6 px-4">
          <SelectInput
            label="Projet:"
            name="projet"
            value={selectedId}
            required={true}
            options={projets.map(projet => ({
              value: projet.id,
              label: projet.nom || "—"
            }))}
            onChange={(value) => {
              setSelectedId(value || "");
              setError(null);
            }}
            error={error}
            placeholder="Sélectionnez un projet"
            width="xl:w-[450px]"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2 px-4 pb-4 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 xl:text-md font-medium px-4 py-2 rounded-lg bg-gray-200"
          >
            Annuler
          </button>
          <button
            className="bg-[#009FFF] xl:text-md text-white font-medium px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-opacity-50"
            onClick={handleConfirm}
            disabled={!selectedId || loading}
          >
            {loading ? "Chargement..." : "Confirmer"}
          </button>
        </div>

        {/* Show "Créer un projet" link only if user is NOT commercial */}
        {!userIsCommercial && (
          <div className="text-center pb-4">
            <Link 
              href="/Projets/addProject" 
              className="text-[#009FFF] hover:underline text-sm"
              onClick={onClose} 
            >
              Créer un nouveau projet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjetDialog;