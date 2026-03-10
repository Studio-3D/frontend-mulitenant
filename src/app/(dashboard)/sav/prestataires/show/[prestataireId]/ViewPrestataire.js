"use client";

import { useEffect, useState } from 'react';
import ReclamationTable from '../../../reclamations/ReclamationTable';
import LoadingSpin from '@/components/LoadingSpin';
import PrestataireDetail from './PrestataireDetail';
import { APIURL } from '@/configs/api';
import axios from 'axios';

const ViewPrestataire = ({ prestataireId }) => {
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prestataireId) return;

    console.log('Fetching prestataireId:', prestataireId);
    axios.get(`${APIURL.Prestataires}/${prestataireId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
    .then(res => {
      console.log('Résultat API', res.data);
      setDetails(res.data.prestataire);
    })
    .catch(err => console.error('Erreur API', err))
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
    <div className="flex mb-3">
      <span className="text-[#009FFF] font-semibold min-w-[110px]">{label} :</span>
      <span className="font-medium text-gray-800">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <PrestataireDetail Details={Details} />
      <ReclamationTable prestataire_id={prestataireId} />
    </div>
  );
};

export default ViewPrestataire;