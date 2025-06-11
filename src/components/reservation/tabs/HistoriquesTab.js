import React from 'react';
import { Typography, Card, CardContent, Chip, Box, Avatar } from '@mui/material';
import { CalendarIcon, UserIcon, FileIcon, ClockIcon } from 'lucide-react';

// Mock data for historiques
const historiqueData = [
  {
    id: 1,
    date: '12/06/2023',
    type: 'Création',
    description: 'Création de la réservation',
    user: 'Marie Dupont',
    time: '14:30'
  },
  {
    id: 2,
    date: '14/06/2023',
    type: 'Modification',
    description: 'Mise à jour des informations client',
    user: 'Jean Martin',
    time: '09:15'
  },
  {
    id: 3,
    date: '18/06/2023',
    type: 'Document',
    description: "Ajout de pièce d'identité",
    user: 'Marie Dupont',
    time: '16:45'
  },
  {
    id: 4,
    date: '22/06/2023',
    type: 'Rendez-vous',
    description: 'Planification de la visite technique',
    user: 'Pierre Lemoine',
    time: '11:20'
  },
  {
    id: 5,
    date: '25/06/2023',
    type: 'Paiement',
    description: 'Réception du premier acompte',
    user: 'Sophie Bernard',
    time: '10:30'
  }
];

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'Création':
      return 'success';
    case 'Modification':
      return 'warning';
    case 'Document':
      return 'info';
    case 'Rendez-vous':
      return 'primary';
    case 'Paiement':
      return 'secondary';
    default:
      return 'default';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'Création':
      return <CalendarIcon size={16} />;
    case 'Modification':
      return <UserIcon size={16} />;
    case 'Document':
      return <FileIcon size={16} />;
    case 'Rendez-vous':
      return <CalendarIcon size={16} />;
    case 'Paiement':
      return <ClockIcon size={16} />;
    default:
      return <ClockIcon size={16} />;
  }
};

export const HistoriquesTab = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Historique des modifications
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {historiqueData.map((item, index) => (
          <Card key={item.id} variant="outlined" sx={{ position: 'relative' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                {/* Timeline indicator */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minWidth: 'fit-content'
                }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: `${getTypeBadgeClass(item.type)}.main`,
                    color: `${getTypeBadgeClass(item.type)}.contrastText`
                  }}>
                    {getTypeIcon(item.type)}
                  </Avatar>
                  {index < historiqueData.length - 1 && (
                    <Box sx={{ 
                      width: 2, 
                      height: 30, 
                      bgcolor: 'divider', 
                      mt: 1 
                    }} />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip 
                      label={item.type}
                      color={getTypeBadgeClass(item.type)}
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {item.date} à {item.time}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UserIcon size={14} />
                    <Typography variant="body2" color="textSecondary">
                      Par {item.user}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {historiqueData.length === 0 && (
        <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ClockIcon size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Aucun historique
            </Typography>
            <Typography variant="body2" color="textSecondary">
              L'historique des modifications apparaîtra ici au fur et à mesure des actions effectuées.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};