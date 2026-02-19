'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { isAdmin, isComptable, isSuperAdmin } from '@/configs/enum';
import format from 'date-fns/format';
import FacturesManager from '@/components/comptabilite/FacturesManager';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

const DecomptesDetailsPage = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [decompteDetails, setDecompteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)&& !isComptable(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  const fetchDecompteDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/decomptes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDecompteDetails(response.data.decompte);
    } catch (error) {
      console.error('Error fetching decompte details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedProjet) {
      fetchDecompteDetails();
    }
  }, [id, selectedProjet, fetchDecompteDetails, refreshTrigger]);

  // Callback function to refresh decompte details
  const handleRefreshDecompte = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  if (!user || !selectedProjet || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  if (!decompteDetails) {
    return <div className="p-6 text-center">Décompte non trouvé</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={'/comptabilite?tab=decomptes'}
          step={`Détail décompte`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Détail Décompte</h2>
          <hr className="my-3 border-t border-blue-500" />

          <div className="space-y-3">
            <div>
              <span className="text-gray-600 font-medium">Date:</span>
              <span className="font-semibold ml-2">
                {decompteDetails.date &&
                  format(new Date(decompteDetails.date), 'dd/MM/yyyy')}
              </span>
            </div>

            <div>
              <span className="text-gray-600 font-medium">Numéro:</span>
              <span className="font-semibold ml-2">
                {decompteDetails.numero}
              </span>
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
                {decompteDetails.factures_sum_montant
                  ? decompteDetails.factures_sum_montant.toLocaleString()
                  : 0}{' '}
                DH
              </span>
            </div>

            <div>
              <span className="text-gray-600 font-medium">Reste:</span>
              <span className="font-semibold ml-2 !text-red-600">
                {decompteDetails.factures_sum_montant
                  ? (
                      decompteDetails.montant -
                      decompteDetails.factures_sum_montant
                    ).toLocaleString()
                  : decompteDetails.montant.toLocaleString()}{' '}
                DH
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <FacturesManager
            userRole={user.role}
            decompteId={id}
            montantDecompte={decompteDetails.montant}     // Change from montant_decompte
            montantPaye={decompteDetails.factures_sum_montant} // Change from montant_paye
            onFactureChange={handleRefreshDecompte} // Pass the callback
          />
        </div>
      </div>
    </div>
  );
};

export default DecomptesDetailsPage;
