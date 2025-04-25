"use client";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";
import { useState } from "react";
import { useSociete } from "../context/SocieteContext"; // ton context

const SocieteDialog = ({
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

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedId(selectedValue);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;

    const selectedSociete = societes.find((s) => s.id === selectedId);

    if (!selectedSociete) return;

    setSwitching(true);
    const success = await selectSociete(selectedSociete);
    setSwitching(false);

    if (success) {
      onConfirm(); // This ensures that the next step is triggered (show Projet Dialog)
      onClose(); // Close Societe Dialog
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: "#009FFF",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Veuillez choisir une Société
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
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
          fullWidth
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={switching}>
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: "#009FFF",
            color: "white",
            fontWeight: "bold",
          }}
          disabled={!selectedId || switching}
        >
          {switching ? "Chargement..." : "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SocieteDialog;
