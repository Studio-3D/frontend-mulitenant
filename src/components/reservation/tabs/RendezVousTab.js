import React from 'react';
import { Typography, Card, CardContent, Button, Chip, IconButton } from '@mui/material';
import { CalendarIcon, ClockIcon, UserIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

// Mock data for rendez-vous
const rendezVousData = [
  {
    id: 1,
    date: '2023-06-25',
    heure: '10:00',
    type: 'Visite du bien',
    statut: 'Confirmé',
    responsable: 'Marie Dubois',
    commentaire: 'Première visite avec les clients'
  },
  {
    id: 2,
    date: '2023-07-02',
    heure: '14:30',
    type: 'Signature compromis',
    statut: 'Planifié',
    responsable: 'Jean Martin',
    commentaire: 'Rendez-vous pour la signature du compromis de vente'
  }
];

export const RendezVousTab = () => {
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Confirmé':
        return 'success';
      case 'Planifié':
        return 'warning';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEdit = (id) => {
    console.log('Modifier rendez-vous:', id);
  };

  const handleDelete = (id) => {
    console.log('Supprimer rendez-vous:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="font-semibold text-gray-800">
          Rendez-vous
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<PlusIcon className="h-4 w-4" />}
          size="small"
        >
          Planifier un rendez-vous
        </Button>
      </div>

      {rendezVousData.length > 0 ? (
        <div className="space-y-4">
          {rendezVousData.map((rdv) => (
            <Card key={rdv.id} variant="outlined">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        <Typography variant="body1" className="font-medium">
                          {new Date(rdv.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-green-500" />
                        <Typography variant="body2">
                          {rdv.heure}
                        </Typography>
                      </div>
                      <Chip 
                        label={rdv.statut}
                        color={getStatusColor(rdv.statut)}
                        size="small"
                      />
                    </div>

                    <Typography variant="h6" className="font-semibold">
                      {rdv.type}
                    </Typography>

                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="body2" color="textSecondary">
                        Responsable: {rdv.responsable}
                      </Typography>
                    </div>

                    {rdv.commentaire && (
                      <Typography variant="body2" color="textSecondary">
                        {rdv.commentaire}
                      </Typography>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rdv.id)}
                      title="Modifier"
                    >
                      <EditIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rdv.id)}
                      title="Supprimer"
                      color="error"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="outlined" className="border-dashed">
          <CardContent className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" color="textSecondary" className="mb-2">
              Aucun rendez-vous
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-4">
              Aucun rendez-vous n'a été planifié pour cette réservation.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="h-4 w-4" />}
              size="small"
            >
              Planifier le premier rendez-vous
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};