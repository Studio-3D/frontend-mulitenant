"use client";

import { useProjet } from "@/context/ProjetContext";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

    // Stocker dans le contexte
    selectProjet(selectedProjet);

    // Stocker aussi dans le localStorage
    localStorage.setItem("selectedProjet", JSON.stringify(selectedProjet));

    // Appeler callback si fourni
    if (onSelect) {
      onSelect(selectedProjet);
    }

    // Petite pause simulée
    await new Promise((res) => setTimeout(res, 400));
    setLoading(false);

    // Fermer le modal
    onClose();

    // Redirection si `returnPath` est fourni
    if (returnPath) {
      router.push(returnPath); // Redirige
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
        Veuillez sélectionner un projet
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
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
          fullWidth
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedId || loading}
          variant="contained"
          sx={{
            backgroundColor: "#009FFF",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {loading ? "Chargement..." : "Confirmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjetDialog;
