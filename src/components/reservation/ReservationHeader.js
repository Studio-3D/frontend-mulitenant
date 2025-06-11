'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { 
  HomeIcon, 
  CalendarIcon, 
  EuroIcon, 
  UserIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react';

export const ReservationHeader = ({ reservationData }) => {
  if (!reservationData) return null;

  const { reservation } = reservationData;
  const totalPrice = reservation?.prix || 0;
  const advancesPaid = reservation?.avances_sum_montant || 0;
  const remaining = totalPrice - advancesPaid;
  const progressPercentage = totalPrice > 0 ? (advancesPaid / totalPrice) * 100 : 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HomeIcon size={20} style={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Bien
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {reservation?.bien?.propriete_dite_bien || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon size={20} style={{ color: '#2e7d32' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Date de réservation
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(reservation?.date_reservation)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <UserIcon size={20} style={{ color: '#7b1fa2' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Conseiller commercial
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {reservation?.user?.name && reservation?.user?.prenom 
                      ? `${reservation.user.name} ${reservation.user.prenom}`
                      : 'N/A'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Financial Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                bgcolor: 'primary.light', 
                borderRadius: 1,
                color: 'primary.contrastText'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EuroIcon size={20} />
                  <Box>
                    <Typography variant="caption">
                      Prix total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalPrice)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                bgcolor: 'success.light', 
                borderRadius: 1,
                color: 'success.contrastText'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon size={20} />
                  <Box>
                    <Typography variant="caption">
                      Avances payées
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(advancesPaid)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                p: 2, 
                bgcolor: 'error.light', 
                borderRadius: 1,
                color: 'error.contrastText'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingDownIcon size={20} />
                  <Box>
                    <Typography variant="caption">
                      Reste à payer
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(remaining)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Progression du paiement
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {progressPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: '100%', 
                  bgcolor: 'grey.200', 
                  borderRadius: 1, 
                  height: 8 
                }}>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    height: 8, 
                    borderRadius: 1,
                    width: `${Math.min(progressPercentage, 100)}%`,
                    transition: 'width 0.3s ease-in-out'
                  }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};