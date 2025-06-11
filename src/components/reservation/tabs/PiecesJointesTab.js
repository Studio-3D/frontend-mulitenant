import React from 'react';
import { Typography, Card, CardContent, Button, IconButton } from '@mui/material';
import { FileIcon, DownloadIcon, EyeIcon, PlusIcon } from 'lucide-react';

// Mock data for pièces jointes
const piecesJointesData = [
  {
    id: 1,
    nom: 'Contrat de réservation signé.pdf',
    type: 'application/pdf',
    taille: '2.4 MB',
    date: '15/06/2023',
    url: '/documents/contrat-reservation.pdf'
  },
  {
    id: 2,
    nom: 'Pièce d\'identité client 1.jpg',
    type: 'image/jpeg',
    taille: '1.2 MB',
    date: '16/06/2023',
    url: '/documents/piece-identite-1.jpg'
  },
  {
    id: 3,
    nom: 'Justificatif de revenus.pdf',
    type: 'application/pdf',
    taille: '0.8 MB',
    date: '18/06/2023',
    url: '/documents/justificatif-revenus.pdf'
  }
];

export const PiecesJointesTab = () => {
  const handleViewDocument = (url) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="font-semibold text-gray-800">
          Pièces jointes
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />}
          size="small"
        >
          Ajouter un document
        </Button>
      </div>

      {piecesJointesData.length > 0 ? (
        <div className="space-y-3">
          {piecesJointesData.map((document) => (
            <Card key={document.id} variant="outlined">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="body1" className="font-medium">
                      {document.nom}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {document.taille} • Ajouté le {document.date}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDocument(document.url)}
                    title="Voir le document"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadDocument(document.url, document.nom)}
                    title="Télécharger"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="outlined" className="border-dashed">
          <CardContent className="text-center py-12">
            <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" color="textSecondary" className="mb-2">
              Aucun document
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-4">
              Aucune pièce jointe n'a été ajoutée à cette réservation.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />}
              size="small"
            >
              Ajouter le premier document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};