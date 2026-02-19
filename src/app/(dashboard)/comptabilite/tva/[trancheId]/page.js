'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isComptable, isSuperAdmin } from '@/configs/enum';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import { toast } from 'react-hot-toast';
import LoadingSpin from '@/components/LoadingSpin';

// Update to proper params handling for Next.js
const TvaTrancheDetailPage = ({ params }) => {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const trancheId = unwrappedParams.trancheId;
  
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const [trancheDetails, setTrancheDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)&& !isComptable(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  // Fetch tranche details
  useEffect(() => {
    const fetchTrancheDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.ROOT}/v1/tranches/${trancheId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTrancheDetails(response.data.tranche);
      } catch (error) {
        console.error('Error fetching tranche details:', error);
        toast.error('Erreur lors du chargement des détails de la tranche');
      } finally {
        setLoading(false);
      }
    };

    if (trancheId && selectedProjet) {
      fetchTrancheDetails();
    }
  }, [trancheId, selectedProjet]);

  if (!user || !selectedProjet || loading) {
 return (
         <div className="flex items-center justify-center min-h-screen">
           <LoadingSpin /> {/* Use your loading spinner here */}
         </div>
       );  }

  if (!trancheDetails) {
    return <div className="p-6 text-center">Tranche non trouvée</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Détails TVA - Tranche {trancheDetails.nom}</h1>
      
      <ComptabiliteTabsNav />

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {/* Display tranche details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Information Tranche</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Coefficient:</span> 
                <span className="ml-2">{trancheDetails.coefficient_tranche?.coefficient || '-'}</span>
              </div>
              <div>
                <span className="font-medium">QP Terrain Bati:</span> 
                <span className="ml-2">{trancheDetails.qp_bati?.toLocaleString() || '-'}</span>
              </div>
              <div>
                <span className="font-medium">QP en %:</span> 
                <span className="ml-2">
                  {trancheDetails.qp_terrain_tranche_percent 
                    ? `${(trancheDetails.qp_terrain_tranche_percent * 100).toFixed(2)}%` 
                    : '-'}
                </span>
              </div>
              <div>
                <span className="font-medium">QP en Valeur:</span> 
                <span className="ml-2">
                  {trancheDetails.qp_terrain_tranche_valeur?.toLocaleString() || '-'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Valeurs Calculées</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Prix {'d\''}Acquisition:</span> 
                <span className="ml-2">{selectedProjet.prix_acquisition?.toLocaleString() || '-'} DH</span>
              </div>
              <div>
                <span className="font-medium">Valeur Terrain Réévaluée:</span> 
                <span className="ml-2">{trancheDetails.valeur_terrain_reevalue?.toLocaleString() || '-'} DH</span>
              </div>
              <div>
                <span className="font-medium">Surface Terrain:</span> 
                <span className="ml-2">{selectedProjet.surface_terrain?.toLocaleString() || '-'} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvaTrancheDetailPage;
