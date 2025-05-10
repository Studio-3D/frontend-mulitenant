"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import {
  MdOutlineHome,
  MdBuild,
  MdDateRange,
  MdCheckCircle,
  MdErrorOutline,
  MdAttachFile,
} from "react-icons/md";
import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpin from '@/components/LoadingSpin';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button'; // adjust the path as needed
import { IconButton, Tooltip } from '@mui/material';

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}


function getStatutLabel(statut) {
  switch (statut) {
    case 1:
      return (
        <Chip
          label="En Attente"
          color="primary"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 2:
      return (
        <Chip
          label="En Cours"
          color="warning"
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 3:
      return (
        <Chip
          label="Résolue"
          color="success"
          icon={<MdCheckCircle />}
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
    case 4:
    return (
      <Chip
        label="Non Résolue"
        icon={<MdErrorOutline />}
        color="error"
        sx={{ fontWeight: "bold", fontSize: 14 }}
      />
    );
    default:
      return (
        <Chip
          label="Inconnu"
          color="default"
          icon={<MdErrorOutline />}
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      );
  }
}

export default function ViewReclamationFullPage({ reclamationId }) {
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  const getFileUrl = (fichier) => {
      return `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/reclamations/${fichier}`;
  };

  useEffect(() => {
    if (!reclamationId) return;
    setLoading(true);
    axios
      .get(`${APIURL.ReclamationsSav}/${reclamationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      .then((res) => setDetails(res.data.reclamation))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [reclamationId]);

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin /> 
        </div>
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
          bgcolor: "linear-gradient(135deg, #E3F0FF 0%, #FAFCFF 100%)",
        }}
      >
        <Typography variant="h5" color="error">
          Réclamation introuvable ou erreur de chargement.
        </Typography>
      </Box>
    );
  }

  const { bien, client, prestataire, service, piece_jointe } = Details;

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
          {/* Client */}
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
              {client?.nom?.[0] || "?"}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "#009FFF", fontWeight: "bold" }}>
                {client?.nom} {client?.prenom}
              </Typography>
              <Typography variant="body1" sx={{ color: "#ec2F4B", fontWeight: 600 }}>
                {client?.email || client?.telephone_num1 || "-"}
              </Typography>
              <Box sx={{ mt: 1 }}>{getStatutLabel(Details.statut)}</Box>
            </Box>
          </Box>

          <Divider />

          {/* Bien */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdOutlineHome color="#009FFF" size={26} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <b>Bien :</b> {bien?.propriete_dite_bien || "-"} (N° {bien?.numero || "-"}) - Bloc {bien?.bloc?.nom || "-"}
            </Typography>
          </Box>

          {/* Prestataire */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdBuild color="#009FFF" size={26} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <b>Prestataire :</b> {prestataire?.civilite || "-"} {prestataire?.nom || "-"} {prestataire?.prenom || "-"} ({prestataire?.telephone || "-"})
            </Typography>
          </Box>

          {/* Service */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdBuild color="#ec2F4B" size={26} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <b>Service :</b> {service?.nom || "-"}
            </Typography>
          </Box>

          {/* Problèmes */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdErrorOutline color="#ec2F4B" size={26} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <b>Emplacement(s) :</b> {Details.emplacements || "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MdErrorOutline color="#ec2F4B" size={26} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              <b>Problème(s) :</b> {Details.problemes || "-"}
            </Typography>
          </Box>

          {/* Pièces jointes */}
          {Details?.piece_jointe && Details?.piece_jointe.length > 0 && (
            <>
              <Divider />
              <Typography variant="h6" sx={{ color: "#009FFF", fontWeight: "bold", mb: 1 }}>
                Pièce(s) jointe(s) :
              </Typography>
              <Stack direction="row" spacing={1}>
                {Details.piece_jointe.map((pj, i) => (
                  <Tooltip title={`Pièce ${i + 1}`} key={i}>
                    <IconButton
                      onClick={() => window.open(getFileUrl(pj.fichier), '_blank')}
                      color="primary"
                    >
                      <MdAttachFile />{i + 1}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
                      </>
                    )}
        </Paper>

        {/* Colonne droite - Dates et commentaires */}
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
          <Typography variant="h6" sx={{ color: "#009FFF", fontWeight: "bold", mb: 2 }}>
            Dates & Commentaires
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MdDateRange color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date réclamation :</b> {formatDate(Details.date_reclamation)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MdDateRange color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date intervention :</b> {formatDate(Details.date_intervention)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MdDateRange color="#009FFF" size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <b>Date fin intervention :</b> {formatDate(Details.date_fin_intervention)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                <b>Commentaire traitement :</b>
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#444" }}>
                {Details.commentaires  || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                <b>Commentaire Resolution :</b>
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#444" }}>
                {Details.commentaire_trait || "-"}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
      <Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "center",
    gap: 2,
  }}
>
  <Button type="button" onClick={() => router.back()}>
    Retour
  </Button>

  <Button
   type="submit"
    onClick={() => { router.push(`${ENDPOINTS.ReclamationsSav}?id=${reclamationId}&action=edit`);
    }}
  >
    Modifier
  </Button>
</Box>

    </Box>
    
  );
}
