'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Chip,
  Button,
  IconButton,
  Grid
} from '@mui/material';
import { 
  ArrowLeftIcon,
  EditIcon
} from 'lucide-react';
import { TabNavigation } from '../../../../../components/reservation/TabNavigation';
import { ReservationHeader } from '../../../../../components/reservation/ReservationHeader';
import { DetailTab } from '../../../../../components/reservation/tabs/DetailTab';
import { AcquereursTab } from '../../../../../components/reservation/tabs/AcquereursTab';
import { PiecesJointesTab } from '../../../../../components/reservation/tabs/PiecesJointesTab';
import { AvancesTab } from '../../../../../components/reservation/tabs/AvancesTab';
import { RendezVousTab } from '../../../../../components/reservation/tabs/RendezVousTab';
import { HistoriquesTab } from '../../../../../components/reservation/tabs/HistoriquesTab';
import { CompromisVentesTab } from '../../../../../components/reservation/tabs/CompromisVentesTab';
import { ContractTab } from '../../../../../components/reservation/tabs/ContractTab';

const ReservationDetailPage = () => {
  const params = useParams();
  const reservationId = params.id;
  const [activeTab, setActiveTab] = useState('detail');
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [error, setError] = useState(null);

  // Get API configuration from environment or use defaults
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const tabs = [
    { id: 'detail', label: 'Détails', component: DetailTab },
    { id: 'acquereurs', label: 'Acquéreurs', component: AcquereursTab },
    { id: 'pieces-jointes', label: 'Pièces jointes', component: PiecesJointesTab },
    { id: 'avances', label: 'Avances', component: AvancesTab },
    { id: 'rendez-vous', label: 'Rendez-vous', component: RendezVousTab },
    { id: 'compromis', label: 'Compromis', component: CompromisVentesTab },
    { id: 'contrat', label: 'Contrat', component: ContractTab },
    { id: 'historiques', label: 'Historiques', component: HistoriquesTab },
  ];

  useEffect(() => {
    if (reservationId && accessToken) {
      fetchReservationData();
    }
  }, [reservationId, accessToken]);

  const fetchReservationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the same API endpoint structure as your existing code
      const response = await axios.get(`${apiUrl}/v1/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setReservationData(response.data);
    } catch (error) {
      console.error('Error fetching reservation data:', error);
      if (error.response?.status === 401) {
        setError('Non autorisé. Veuillez vous reconnecter.');
      } else if (error.response?.status === 404) {
        setError('Réservation non trouvée.');
      } else {
        setError('Erreur lors du chargement des données de la réservation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleEdit = () => {
    // Use the same edit logic as your existing code
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('step_res_edit', '0');
      const editUrl = `${window.location.origin}/reservations/home/?id=${reservationId}&action=edit`;
      window.open(editUrl, '_blank');
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 1:
        return 'success'; // Validé
      case 2:
        return 'error';   // Rejeté
      case 3:
        return 'warning'; // En attente
      default:
        return 'default';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 1:
        return 'Validé';
      case 2:
        return 'Rejeté';
      case 3:
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          Chargement des données de la réservation...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography color="error" variant="h6" gutterBottom>
            Erreur
          </Typography>
          <Typography color="textSecondary" paragraph>
            {error}
          </Typography>
          <Button onClick={handleBack} variant="outlined">
            Retour
          </Button>
        </Card>
      </Box>
    );
  }

  if (!reservationData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh'
      }}>
        <Typography variant="h6" color="textSecondary">
          Aucune donnée de réservation trouvée
        </Typography>
      </Box>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxShadow: 1
      }}>
        <Box sx={{ 
          maxWidth: '1200px', 
          mx: 'auto', 
          px: { xs: 2, sm: 3, lg: 4 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: 64 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={handleBack}
                sx={{ mr: 2 }}
                aria-label="Retour"
              >
                <ArrowLeftIcon size={20} />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Réservation #{reservationData?.reservation?.code_reservation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={getStatusLabel(reservationData?.reservation?.statut)}
                color={getStatusColor(reservationData?.reservation?.statut)}
                size="small"
              />
              {reservationData?.reservation?.statut === 1 && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon size={16} />}
                  onClick={handleEdit}
                  size="small"
                >
                  Modifier
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        maxWidth: '1200px', 
        mx: 'auto', 
        px: { xs: 2, sm: 3, lg: 4 }, 
        py: 4 
      }}>
        {/* Reservation Header */}
        <ReservationHeader reservationData={reservationData} />

        {/* Tab Navigation */}
        <Box sx={{ mt: 4 }}>
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </Box>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {ActiveTabComponent && (
                <ActiveTabComponent 
                  reservationData={reservationData}
                  onDataUpdate={fetchReservationData}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ReservationDetailPage;
