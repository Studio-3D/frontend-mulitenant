'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { APIURL } from '../../../../../../configs/api';

// Components
import { SideBar } from '../../ajouter_desistement/[reservationId]/SideBar';
import { NavigationBar } from '../../ajouter_desistement/[reservationId]/NavigationBar';
import { Desistement_Definitif } from '../../ajouter_desistement/[reservationId]/Desistement_Definitif';
import { Desistement_Au_Profit } from '../../ajouter_desistement/[reservationId]/Desistement_Au_Profit';
import { Changement_De_Bien } from '../../ajouter_desistement/[reservationId]/Changement_De_Bien';
import LoadingSpin from '@/components/LoadingSpin';

// Schemas
import {
  desistementDefinitifSchema,
  desistementAuProfitSchema,
  changementDeBienSchema,
} from '../../ajouter_desistement/[reservationId]/schemas';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const desistementId = params.desistementId;
  const isEditing = true;
  const [loading, setLoading] = useState({ form: true, submit: false });
  const [accessToken, setAccessToken] = useState('');
  const [activeModel, setActiveModel] = useState(null);
  const [reservationData, setReservationData] = useState(null);

  // Initialize form
  const methods = useForm({
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  // Get access token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAccessToken(token);
  }, []);

  // Fetch existing desistement data
  useEffect(() => {
    if (!desistementId || !accessToken) return;

    const fetchDesistement = async () => {
      try {
        const response = await axios.get(`${APIURL.DESISTEMENT}/${desistementId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status !== 200) {
          router.back();
          return;
        }

        const { desistement, reservation } = response.data;
        
        // Set the active model based on desistement type
        setActiveModel(desistement.type);
        setReservationData(reservation);

        // Prepare form data based on desistement type
        const formData = {
          ...desistement,
          dateOperation: desistement.dateOperation || new Date().toISOString(),
        };

        // Set the appropriate schema based on desistement type
        let schema;
        switch(desistement.type) {
          case 'Desistement_Definitif':
            schema = desistementDefinitifSchema;
            break;
          case 'Desistement_Au_Profit':
            schema = desistementAuProfitSchema;
            break;
          case 'Changement_De_Bien':
            schema = changementDeBienSchema;
            break;
          default:
            schema = desistementDefinitifSchema;
        }

        // Update form methods with the correct schema
        methods.reset(formData);
        methods.register('desistementId', { value: desistementId });
      } catch (error) {
        console.error('Error fetching desistement:', error);
        router.back();
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    };

    fetchDesistement();
  }, [desistementId, accessToken, router, methods]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const formData = new FormData();
      formData.append('_method', 'PUT'); // For Laravel backend

      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(
        `${APIURL.DESISTEMENT}/${desistementId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        router.push('/ventes/desistements?success=updated');
      }
    } catch (error) {
      console.error('Error updating desistement:', error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  if (loading.form) {
    return <LoadingSpin />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col w-full min-h-screen bg-gray-100 p-4">
        <div className="w-full bg-white shadow-lg rounded-lg mb-4">
          {reservationData && (
            <SideBar
              code_reservation={reservationData.codeRes}
              bien={reservationData.bien}
              prix={reservationData.prix}
              sum_avances_valides={reservationData.sumAvances}
              date_reservation={reservationData.dateRes}
              respo={reservationData.respo}
              desisteurs={reservationData.desisteurs}
            />
          )}
        </div>

        <NavigationBar 
          activeModel={activeModel} 
          onModelChange={setActiveModel}
          isEditing={isEditing}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow mt-4">
          {activeModel === 'Changement_De_Bien' && (
            <Changement_De_Bien
              isEditing={isEditing}
              formData={reservationData}
            />
          )}
          
          {activeModel === 'Desistement_Au_Profit' && (
            <Desistement_Au_Profit
              isEditing={isEditing}
              formData={reservationData}
            />
          )}
          
          {activeModel === 'Desistement_Definitif' && (
            <Desistement_Definitif
              isEditing={isEditing}
              formData={reservationData}
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
              {loading.submit ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}