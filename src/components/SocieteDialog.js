"use client";
import { useState } from "react";
import { useSociete } from "../context/SocieteContext";
import SelectInput from "./SelectInput"; // Adjust the import path as needed

const SocieteModal = ({
  open,
  onClose,
  societes,
  selectedId,
  setSelectedId,
  returnPath = "/",
  onConfirm,
}) => {
  const { selectSociete } = useSociete();
  const [switching, setSwitching] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;

    const selectedSociete = societes.find((s) => s.id === selectedId);

    if (!selectedSociete) return;

    setSwitching(true);
    const success = await selectSociete(selectedSociete);
    setSwitching(false);

    if (success) {
      onConfirm();
      onClose();
    }
  };

  // Convert societes to SelectInput options format
  const selectOptions = societes.map((societe) => ({
    value: societe.id,
    label: societe.nom || societe.raison_sociale || "—",
  }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white xl:w-[550px] xl:h-[250px] rounded-xl ">
        {/* Header */}
        <div className="bg-[#009FFF] text-white p-4 rounded-t-xl">
          <h2 className="xl:text-xl text-center">Veuillez choisir une Société</h2>
        </div>

        {/* Content */}
        <div className="text-gray-500"> {/* ← ADD THIS WRAPPER */}

        <div className="flex flex-col items-center justify-center pt-6 px-4">
          <SelectInput
            label="Société"
            placeholder="Sélectionnez une société"
            options={selectOptions}
            value={selectedId}
            onChange={setSelectedId}
            width="xl:w-[450px]"
            required={true}
          />
        </div>
       

        {/* Actions */}
        <div className="flex justify-center gap-2 px-4 mt-4">
          <button
            onClick={onClose}
            color="inherit"
            disabled={switching}
            className="text-gray-500 xl:text-md font-medium px-4 py-2 rounded-lg bg-gray-200"
          >
            Annuler
          </button>
          <button
            className="bg-[#009FFF] xl:text-md text-white font-medium px-4 py-2 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-opacity-50"
            onClick={handleConfirm}
            variant="contained"
            disabled={!selectedId || switching}
          >
            {switching ? "Chargement..." : "Confirmer"}
          </button>
        </div>
         </div>
      </div>
    </div>
  );
};

export default SocieteModal;