'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';

// Reuse the same components from ajouter_desistement
import { SideBar } from '../../ajouter_desistement/[reservationId]/SideBar';
import { NavigationBar } from '../../ajouter_desistement/[reservationId]/NavigationBar';
import { Desistement_Definitif } from '../../ajouter_desistement/[reservationId]/Desistement_Definitif';
import { Desistement_Au_Profit } from '../../ajouter_desistement/[reservationId]/Desistement_Au_Profit';
import { Changement_De_Bien } from '../../ajouter_desistement/[reservationId]/Changement_De_Bien';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const desistementId = params.desistementId;
  const isEditing = true; // Always true for correction page

  const [loading, setLoading] = useState({ form: true, submit: false });
  const [accessToken, setAccessToken] = useState('');
  const [activeModel, setActiveModel] = useState('Desistement_Definitif');
  const [formData, setFormData] = useState({});

  // Get access token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAccessToken(token);
  }, []);

  // Fetch existing desistement data
  useEffect(() => {
    if (desistementId && accessToken) {
      axios.get(`${APIURL.DESISTEMENT}/${desistementId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
        //  router.back();
          return;
        }

        const desistement = res.data.desistement;
        
        // Utility function to handle null/undefined values
        const getValue = (field) => 
          field !== null && field !== undefined ? field : '';

        // Set form data with existing values
        setFormData({
          type: getValue(desistement.type),
          motif: getValue(desistement.motif),
          remboursement: getValue(desistement.remboursement),
          dateRemboursement: getValue(desistement.dateRemboursement),
          modeRemboursement: getValue(desistement.modeRemboursement),
          numeroPaiement: getValue(desistement.numeroPaiement),
          pourCompte: getValue(desistement.pourCompte),
          avecPenalite: getValue(desistement.avecPenalite),
          avecPiecesJointes: getValue(desistement.avecPiecesJointes),
          // Add other fields as needed
        });

        // Set the active model based on the fetched data
        setActiveModel(desistement.type || 'Desistement_Definitif');
      })
      .catch((error) => {
        console.error('Error fetching desistement:', error);
       // router.back();
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, form: false }));
      });
    }
  }, [desistementId, accessToken, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));

    const formDataToSend = new FormData();
    formDataToSend.append('modelType', activeModel);
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, String(value));
      }
    });

    try {
      const response = await axios.put(`${APIURL.DESISTEMENTS}/${desistementId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        // Redirect or show success message
        router.push('/ventes/desistements');
      }
    } catch (error) {
      console.error('Error updating desistement:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  if (loading.form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100 p-4">
      <div className="w-full bg-white shadow-lg rounded-lg mb-4">
        <SideBar />
      </div>
      <NavigationBar 
        activeModel={activeModel} 
        onModelChange={setActiveModel}  
        isEditing={isEditing}
      />
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow mt-4">
        {activeModel == 'Changement_De_Bien' && (
          <Changement_De_Bien 
            formData={formData} 
            updateFormData={updateFormData} 
            isEditing={isEditing} 
          />
        )}
        {activeModel == 'Desistement_Au_Profit' && (
          <Desistement_Au_Profit 
            formData={formData} 
            updateFormData={updateFormData} 
            isEditing={isEditing}
          />
        )}
        {activeModel == 'Desistement_Definitif' && (
          <Desistement_Definitif 
            formData={formData} 
            updateFormData={updateFormData} 
            isEditing={isEditing}
          />
        )}
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 mr-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading.submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.submit ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mettre à jour
              </span>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}