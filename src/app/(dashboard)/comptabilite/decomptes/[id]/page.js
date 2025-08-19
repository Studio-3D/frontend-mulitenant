'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import format from 'date-fns/format';
import FacturesManager from '@/components/comptabilite/FacturesManager';
import LoadingSpin from '@/components/LoadingSpin';

const DecomptesDetailsPage = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [decompteDetails, setDecompteDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  useEffect(() => {
    const fetchDecompteDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.ROOT}/v1/decomptes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDecompteDetails(response.data.decompte);
      } catch (error) {
        console.error('Error fetching decompte details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && selectedProjet) {
      fetchDecompteDetails();
    }
  }, [id, selectedProjet]);

  if (!user || !selectedProjet || loading) {
 return (
         <div className="flex items-center justify-center min-h-screen">
           <LoadingSpin /> {/* Use your loading spinner here */}
         </div>
       );  }

  if (!decompteDetails) {
    return <div className="p-6 text-center">Décompte non trouvé</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Comptabilité - Détails du Décompte</h1>
      
      <ComptabiliteTabsNav />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Détail Décompte</h2>
          <hr className="my-3 border-t border-blue-500" />
          
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 font-medium">Date:</span>
              <span className="font-semibold ml-2">
                {decompteDetails.date && format(new Date(decompteDetails.date), 'dd/MM/yyyy')}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Numéro:</span>
              <span className="font-semibold ml-2">{decompteDetails.numero}</span>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Montant:</span>
              <span className="font-semibold ml-2 !text-blue-600">
                {decompteDetails.montant.toLocaleString()} DH
              </span>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Montant Payé:</span>
              <span className="font-semibold ml-2 !text-green-600">
                {decompteDetails.factures_sum_montant ? decompteDetails.factures_sum_montant.toLocaleString() : 0} DH
              </span>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Reste:</span>
              <span className="font-semibold ml-2 !text-red-600">
                {decompteDetails.factures_sum_montant
                  ? (decompteDetails.montant - decompteDetails.factures_sum_montant).toLocaleString()
                  : decompteDetails.montant.toLocaleString()
                } DH
              </span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <FacturesManager 
            userRole={user.role} 
            decompteId={id} 
            montant_decompte={decompteDetails.montant} 
            montant_paye={decompteDetails.factures_sum_montant} 
          />
        </div>
      </div>
    </div>
  );
};

export default DecomptesDetailsPage;
