'use client'
import React, { useState, useEffect } from 'react';
import { SideBar } from './SideBar';
import { NavigationBar } from './NavigationBar';
import { Desistement_Definitif } from './Desistement_Definitif';
import { Desistement_Au_Profit } from './Desistement_Au_Profit';
import { Changement_De_Bien } from './Changement_De_Bien';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.reservationId;
  
  const [loading, setLoading] = useState({ form: false, submit: false });
  const [accessToken, setAccessToken] = useState('');
  const [activeModel, setActiveModel] = useState('Desistement_Definitif');
  const [formData, setFormData] = useState({});

  // Get access token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAccessToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));

    const formDataToSend = new FormData();
    formDataToSend.append('modelType', activeModel);
    formDataToSend.append('reservationId', reservationId); // Include reservation ID
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, String(value));
      }
    });

    try {
      const response = await axios.post(APIURL.DESISTEMENT, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        // Redirect to desistements list with success message
        router.push('/ventes/desistements?success=created');
      }
    } catch (error) {
      console.error('Error creating desistement:', error);
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
      />
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow mt-4">
        {activeModel == 'Changement_De_Bien' && (
          <Changement_De_Bien formData={formData} updateFormData={updateFormData} />
        )}
        {activeModel == 'Desistement_Au_Profit' && (
          <Desistement_Au_Profit formData={formData} updateFormData={updateFormData} />
        )}
        {activeModel == 'Desistement_Definitif' && (
          <Desistement_Definitif formData={formData} updateFormData={updateFormData} />
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
                Enregistrer
              </span>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}