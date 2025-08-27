"use client";
import { useState } from "react";
import { useProjet } from "@/context/ProjetContext";
import { useRouter } from "next/navigation";
import { Autocomplete, TextField } from "@mui/material";
import Link from "next/link";

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
    if (returnPath) router.push(returnPath);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white xl:w-[530px] rounded-xl">
        {/* Header */}
        <div className="bg-[#009FFF] text-white p-4 rounded-t-xl">
          <h2 className="xl:text-xl text-center">Veuillez sélectionner un projet</h2>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center pt-2">
          <Autocomplete
            className="xl:w-[450px] p-4 rounded-lg"
            options={projets}
            getOptionLabel={(option) => option.nom || "—"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Projet"
                variant="outlined"
                margin="normal"
              />
            )}
            value={projets.find((p) => p.id === selectedId) || null}
            onChange={(event, newValue) => {
              setSelectedId(newValue?.id || "");
              setError(null);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2 px-4 pb-4">
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

        {/* Create project link */}
        <div className="text-center pb-4">
          <Link 
            href="/Projets/addProject" 
            className="text-[#009FFF] hover:underline text-sm"
            onClick={onClose} // Close the dialog when clicking the link
          >
            Créer un nouveau projet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjetDialog;