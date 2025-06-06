'use client';
import React, { useState, useEffect } from 'react';
import { ReservationHeader } from '../../../../../components/reservation/ReservationHeader';
import { TabNavigation } from '../../../../../components/reservation/TabNavigation';
import { DetailTab } from '../../../../../components/reservation/tabs/DetailTab';
import { HistoriquesTab } from '../../../../../components/reservation/tabs/HistoriquesTab';
import { AcquereursTab } from '../../../../../components/reservation/tabs/AcquereursTab';
import { PiecesJointesTab } from '../../../../../components/reservation/tabs/PiecesJointesTab';
import { AvancesTab } from '../../../../../components/reservation/tabs/AvancesTab';
import { RendezVousTab } from '../../../../../components/reservation/tabs/RendezVousTab';
import { CompromisVentesTab } from '../../../../../components/reservation/tabs/CompromisVentesTab';
import { ContractTab } from '../../../../../components/reservation/tabs/ContractTab';
import { APIURL } from '../../../../../configs/api';
import axios from 'axios';
import { useParams } from 'next/navigation';

const Res_Show = () => {
  const [activeTab, setActiveTab] = useState('detail');
  const [reservationData, setReservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reservationId } = useParams();

  
  const fetchData = async () => {
    try {
      if (!reservationId) {
        setError('No reservation ID provided');
        return;
      }

      setLoading(true);
      setError(null);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Construct the proper API URL
      const apiUrl = `http://localhost:8000/api/v1/reservations/${reservationId}`;
      console.log('Making request to:', apiUrl); // Debug log

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Response data:', response.data); // Debug log

      setReservationData(response.data);
    } catch (error) {
      console.error('Full error details:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'No additional info'}`);
      } else if (error.request) {
        setError('No response received from server');
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };


 useEffect(() => {
    // Verify reservationId is correct before fetching
    if (reservationId && typeof reservationId === 'string') {
      console.log('Fetching data for reservation ID:', reservationId);
      fetchData();
    } else {
      console.error('Invalid reservationId:', reservationId);
      setError('Invalid reservation ID');
    }
  }, [reservationId]);

  const renderTabContent = () => {
    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!reservationData) return <div className="p-6">No data available</div>;

    switch (activeTab) {
      case 'detail':
        return <DetailTab reservationData={reservationData} />;
      case 'historiques':
        return <HistoriquesTab reservationData={reservationData} />;
      case 'acquereurs':
        return <AcquereursTab reservationData={reservationData} />;
      case 'piecesJointes':
        return <PiecesJointesTab reservationData={reservationData} />;
      case 'avances':
        return <AvancesTab reservationData={reservationData} />;
      case 'rendezVous':
        return <RendezVousTab reservationData={reservationData} />;
      case 'compromisVentes':
        return <CompromisVentesTab reservationData={reservationData} />;
      case 'contract':
        return <ContractTab reservationData={reservationData} />;
      default:
        return <DetailTab reservationData={reservationData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {loading && !reservationData ? (
        <div className="flex justify-center items-center h-screen">
          <div>Loading reservation data...</div>
        </div>
      ) : error ? (
        <div className="p-6 text-red-500">{error}</div>
      ) : (
        <>
          <ReservationHeader reservationData={reservationData} />
          <div className="bg-white rounded-lg shadow-md mt-6">
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              counts={reservationData?.menuCounts || {}} 
            />
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Res_Show;