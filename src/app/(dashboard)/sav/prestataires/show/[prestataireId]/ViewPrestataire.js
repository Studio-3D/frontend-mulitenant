'use client';

import {
  Card,
  CardContent,
  Divider,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ReclamationTable from '../../../reclamations/ReclamationTable';
import LoadingSpin from '@/components/LoadingSpin';
import PrestataireDetail from './PrestataireDetail';
import { APIURL } from '@/configs/api';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { useRouter } from 'next/navigation';

const ViewService = ({ prestataireId }) => {
  const { selectedProjet } = useProjet();
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/sav/prestataires');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  useEffect(() => {
    if (!prestataireId) return;

    console.log('Fetching prestataireId:', prestataireId);
    axios
      .get(`${APIURL.Prestataires}/${prestataireId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        console.log('Résultat API', res.data);
        setDetails(res.data.prestataire);
      })
      .catch((err) => console.error('Erreur API', err))
      .finally(() => setLoading(false));
  }, [prestataireId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  // Ligne info stylée
  const InfoLine = ({ label, value }) => (
    <Box display="flex" mb={1.2}>
      <Typography sx={{ color: '#009FFF', fontWeight: 600, minWidth: 110 }}>
        {label} :
      </Typography>
      <Typography sx={{ fontWeight: 500, color: '#222' }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <div className=" space-y-2">
      <PrestataireDetail Details={Details} />
      <ReclamationTable prestataire_id={prestataireId} />
    </div>
  );
};

export default ViewService;
