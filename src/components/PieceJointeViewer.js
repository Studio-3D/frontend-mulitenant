import React, { useState } from 'react';
import { Box, Stack, Typography, Divider, Tooltip, Dialog, IconButton } from '@mui/material';
import { X, Download } from "lucide-react";

const PieceJointeViewer = ({ Details, getFileUrl, url }) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Détermine la liste des fichiers à afficher selon les props
  const files = url
    ? [url] // Un seul fichier passé via url
    : Details?.piece_jointe && Array.isArray(Details.piece_jointe)
      ? Details.piece_jointe.map(pj => getFileUrl ? getFileUrl(pj.fichier || pj) : pj)
      : [];

  const handleOpen = (fileUrl) => {
    setSelectedImage(fileUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  if (files.length === 0) {
    return null; // Rien à afficher
  }

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ color: "#009FFF", fontWeight: "bold", mb: 1 }}>
        Pièce(s) jointe(s) :
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {files.map((fileUrl, i) => (
          <Tooltip title={`Pièce ${i + 1}`} key={i}>
            <Box
              component="img"
              src={fileUrl}
              alt={`Pièce ${i + 1}`}
              onClick={() => handleOpen(fileUrl)}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 2,
                cursor: 'pointer',
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Tooltip>
        ))}
      </Stack>

      <Dialog open={open} onClose={handleClose} >
        <Box sx={{ position: 'relative', p: 1 }}>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
            aria-label="fermer"
          >
            <X size={24} />
          </IconButton>

          <IconButton
            component="a"
            href={selectedImage}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ position: 'absolute', top: 8, right: 48, zIndex: 10 }}
            aria-label="télécharger"
          >
            <Download size={24} />
          </IconButton>

          <Box
            component="img"
            src={selectedImage}
            alt="Aperçu"
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'block',
              margin: 'auto',
              borderRadius: 2,
            }}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default PieceJointeViewer;
