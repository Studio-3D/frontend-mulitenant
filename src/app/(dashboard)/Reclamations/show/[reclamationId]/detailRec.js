"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import {
  Home,
  Wrench,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSociete } from "@/context/SocieteContext";
import LoadingSpin from "@/components/LoadingSpin";
import PieceJointeViewer from "@/components/PieceJointeViewer";
import { RESOURCE_URL } from "@/configs/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function getStatutLabel(statut) {
  switch (statut) {
    case 0:
      return (
        <Chip
          label="En Attente"
          color="primary"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 1:
      return (
        <Chip
          label="En Cours"
          color="warning"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 2:
      return (
        <Chip
          label="Traité"
          color="success"
          icon={<CheckCircle size={16} />}
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 3:
      return (
        <Chip
          label="Non Traité"
          icon={<AlertCircle size={16} />}
          color="error"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    default:
      return (
        <Chip
          label="Inconnu"
          color="default"
          icon={<AlertCircle size={16} />}
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
  }
}

export default function ReclamationFullPage({ reclamationId }) {
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedSociete } = useSociete();

  useEffect(() => {
    const storedData = sessionStorage.getItem("reclamationData");
    if (storedData) {
      setDetails(JSON.parse(storedData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpin />
      </Box>
    );
  }

  if (!Details) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" color="error">
          Réclamation introuvable ou erreur de chargement.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #E3F0FF 0%, #FAFCFF 100%)",
        p: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Titre */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#009FFF",
          mb: 4,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Détails de la Réclamation
      </Typography>

      {/* Conteneur principal en deux colonnes */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          height: "100%",
        }}
      >
        {/* Colonne gauche - Infos principales */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 4,
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,159,255,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #009FFF 0%, #ec2F4B 100%)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 28,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          textTransform: "uppercase",
                          boxShadow: "0 4px 12px #009FFF66",
                        }}
                      >
                        {Details?.client_nom?.[0] || "?"}
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ color: "#009FFF", fontWeight: "bold" }}>
                          {Details?.client_nom} {Details?.client_prenom}
                        </Typography>
                        <Box sx={{ mt: 1 }}>{getStatutLabel(Details.etat)}</Box>
                        
                      </Box>
                    </Box>
          
          

          <Divider sx={{ my: 2 }} />

          
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              N° Dossier:
            </Typography>
            <Typography variant="body1">{Details.dossier_id || "-"}</Typography>
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Code Réservation :
            </Typography>
            <Typography variant="body1">{Details.code_reservation || "-"}</Typography>
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Service :
            </Typography>
            <Typography variant="body1">{Details.nom_service || "-"}</Typography>
          </Box>

         

          {/* Traité par */}
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Traité par :
            </Typography>
            <Typography variant="body1">
              {Details.users_traite_nom} {Details.users_traite_prenom}
            </Typography>
          </Box>

          {/* Pièce jointe */}
          {Details.piece_jointe && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Pièce jointe :
              </Typography>
              <PieceJointeViewer
                url={`${RESOURCE_URL.DOCS}/${selectedSociete?.raison_sociale_concatene || 'default'}_${selectedSociete?.id || 0}/reclamations/${Details.piece_jointe}`}
                filename={Details.piece_jointe}
              />
            </Box>
          )}
        </Paper>

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 4,
            borderRadius: 3,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,159,255,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#009FFF", fontWeight: "bold", mb: 2 }}
          >
            Dates & Commentaires
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date réclamation :</b> {formatDate(Details.created_at)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date Traitement :</b> {formatDate(Details.date_traitement)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date Fin Traitement :</b> {formatDate(Details.date_fin_traitement)}
              </Typography>
            </Box>

            

            <Divider />

            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                <b>Commentaire traitement :</b>
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-line", color: "#444" }}
              >
                {Details.commentaire|| "-"}
              </Typography>
            </Box>

            
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Objet :
          </Typography>
          <Typography variant="body1">{Details.objet || "-"}</Typography>

          {/* Message */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
            Message :
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {Details.message || "-"}
          </Typography>
          </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
