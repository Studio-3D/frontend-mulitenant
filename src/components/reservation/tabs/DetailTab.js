import React from 'react';
import { Grid, Typography, Card, CardContent, Chip, Divider } from '@mui/material';

export const DetailTab = ({ reservationData }) => {
  // Add null checks and default values
  if (!reservationData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography color="textSecondary">Aucune donnée disponible</Typography>
      </div>
    );
  }

  // Destructure the nested reservation object
  const { reservation } = reservationData;
  const lastUpdated = reservation?.updated_at 
    ? new Date(reservation.updated_at).toLocaleDateString('fr-FR') 
    : 'N/A';

  const details = [
    {
      label: 'Code réservation',
      value: reservation?.code_reservation || 'N/A'
    },
    {
      label: 'Date de réservation',
      value: reservation?.date_reservation 
        ? new Date(reservation.date_reservation).toLocaleDateString('fr-FR')
        : 'N/A'
    },
    {
      label: 'Statut',
      value: reservation?.statut || 'En cours',
      type: 'chip'
    },
    {
      label: 'Mode de financement',
      value: reservation?.mode_financement || 'N/A'
    },
    {
      label: 'Prix total',
      value: reservation?.prix 
        ? `${reservation.prix.toLocaleString('fr-FR')} €`
        : 'N/A'
    },
    {
      label: 'Prix remisé',
      value: reservation?.prix_remise 
        ? `${reservation.prix_remise.toLocaleString('fr-FR')} €`
        : 'N/A'
    },
    {
      label: 'Prix forfaitaire',
      value: reservation?.prix_forfetaire 
        ? `${reservation.prix_forfetaire.toLocaleString('fr-FR')} €`
        : 'N/A'
    },
    {
      label: 'Commentaire',
      value: reservation?.commentaire || 'Aucun commentaire',
      type: 'text'
    },
    {
      label: 'Dernière mise à jour',
      value: lastUpdated
    }
  ];

  return (
    <div className="space-y-6">
      <Typography variant="h6" className="font-semibold text-gray-800">
        Informations détaillées
      </Typography>
      
      <Grid container spacing={3}>
        {details.map((detail, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card variant="outlined" className="h-full">
              <CardContent>
                <Typography variant="caption" color="textSecondary" className="mb-1 block">
                  {detail.label}
                </Typography>
                {detail.type === 'chip' ? (
                  <Chip 
                    label={detail.value}
                    color={detail.value === 'Validé' ? 'success' : 'warning'}
                    size="small"
                  />
                ) : detail.type === 'text' ? (
                  <Typography variant="body2" className="break-words">
                    {detail.value}
                  </Typography>
                ) : (
                  <Typography variant="body1" className="font-medium">
                    {detail.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider />

      <div>
        <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
          Informations sur le bien
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Propriété
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {reservation?.bien?.propriete_dite_bien || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Prix unitaire
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {reservation?.bien?.prix_unitaire 
                    ? `${reservation.bien.prix_unitaire.toLocaleString('fr-FR')} €`
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Superficie habitable
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {reservation?.bien?.superficie_habitable 
                    ? `${reservation.bien.superficie_habitable} m²`
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Avance minimale
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {reservation?.bien?.avance_minimale 
                    ? `${reservation.bien.avance_minimale.toLocaleString('fr-FR')} €`
                    : 'N/A'
                  }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};