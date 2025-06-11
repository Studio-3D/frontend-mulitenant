"use client";
import { useState } from "react";
import { useSociete } from "../context/SocieteContext";
import {
  Autocomplete,
  TextField
} from "@mui/material";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white xl:w-[530px] xl:h-[250px] rounded-xl ">
        {/* Header */}
        <div className="bg-[#009FFF] text-white p-4 rounded-t-xl">
          <h2 className="xl:text-xl text-center">Veuillez choisir une Société</h2>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center pt-2">
          <Autocomplete
            className="xl:w-[450px] p-4 rounded-lg "
            options={societes}
            getOptionLabel={(option) =>
              option.nom || option.raison_sociale || "—"
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Société"
                variant="outlined"
                margin="normal"
              />
            )}
            value={societes.find((s) => s.id === selectedId) || null}
            onChange={(event, newValue) => {
              setSelectedId(newValue?.id || "");
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2 px-4 ">
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
  );
};

export default SocieteModal;