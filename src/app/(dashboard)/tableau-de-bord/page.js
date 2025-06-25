'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from "@/context/AuthContext";
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '../../../configs/api';
import { VentesChart } from '../../../components/TableauDeBord/VentesChart'
import { VisitesChart } from '../../../components/TableauDeBord/VisitesChart'
import { AppelsChart } from '../../../components/TableauDeBord/AppelsChart'
import { Desistement } from '../../../components/TableauDeBord/Desistement'
import { EncaissementChart } from '@/components/TableauDeBord/EncaissementChart'
import { startOfMonth, endOfMonth, format, subDays } from 'date-fns';
import { DateFilter } from '@/components/TableauDeBord/DateSelector';
import { Dashboard } from '@/components/TableauDeBord/Dashboard';

const DashboardPage = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(startOfMonth(today));
  const [endDate, setEndDate] = useState(endOfMonth(today));
  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
  const fetchData = async () => {
    if (!accesstoken || !selectedProjet?.id) {
      setError('Missing authentication or project selection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');

      const response = await axios.get(`${APIURL.ROOTV1}/dashboard/${selectedProjet.id}/null/null`, {
        headers: {
          Authorization: `Bearer ${accesstoken}`
        }
      });
      
      setData(response.data);
      console.log('Dashboard data:', response.data);
    } catch (err) {
      const errorDetails = err.response?.data?.message || err.message;
      setError(`Failed to fetch dashboard data: ${errorDetails}`);
      console.error('API Error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [selectedProjet, accesstoken, startDate, endDate]);

  return (
    // <div className=''>
    //   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
    //       Aperçu Général
    //     </h2>
    //     <DateFilter
    //       startDate={startDate}
    //       endDate={endDate}
    //       onChange={handleDateChange}
    //     />
    //   </div>
      
    //   {/* Loading and error states */}
    //   {loading && <div className="p-4 text-center">Chargement des données...</div>}
    //   {error && (
    //     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    //       {error} - {selectedProjet ? `Projet: ${selectedProjet.nom}` : 'Aucun projet sélectionné'}
    //     </div>
    //   )}
      
    //   {/* Main grid layout */}
    //   <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
    //     {/* Left column (2/3 width on lg screens) */}
    //     <div className='lg:col-span-2 space-y-4'>
    //       {/* Encaissement Chart */}
    //       <div className=''>
    //         <EncaissementChart  />
    //       </div>
    //       {/* Ventes Chart */}
    //       <div className=''>
    //         <VentesChart  />
    //       </div>
          
    //       {/* Visites Chart */}
    //       <div className=''>
    //         <VisitesChart  />
    //       </div>
    //     </div>

    //     {/* Right column (1/3 width on lg screens) */}
    //     <div className='flex flex-col gap-6 '>
    //       {/* Stats Section */}
    //       <div className=''>
    //         <div className='flex flex-col gap-6'>
    //           {/* Penalties */}
    //           <div className='bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-[#2CAFFE] pl-3'>
    //             <h3 className='lg:text-2xl font-semibold lg:pb-4'>Penalités</h3>
    //             <p className='text-lg lg:text-3xl lg:pb-4 font-bold'>
    //               $ 
    //               <span className='text-green-500 text-sm lg:text-base'>+% ↑</span>
    //             </p>
    //             <p className='text-xs lg:text-lg !text-gray-400'>comparé à </p>
    //           </div>
              
    //           {/* Remboursement */}
    //           <div className='bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-[#2CFE7F] pl-3'>
    //             <h3 className='lg:text-2xl font-semibold lg:pb-4'>Remboursement</h3>
    //             <p className='text-lg lg:text-3xl lg:pb-4 font-bold'>
    //               $ 
    //               <span className='text-green-500 text-sm lg:text-base'>+% ↑</span>
    //             </p>
    //             <p className='text-xs lg:text-lg !text-gray-400'>comparé à </p>
    //           </div>
    //         </div>
    //       </div>
          
    //       {/* Appels Chart */}
    //       <div className='flex justify-between lg:h-[100%] bg-white rounded-lg shadow-md p-4 '>
    //         <AppelsChart  />
    //       </div>
          
    //       {/* Desistement Chart */}
    //       <div className='flex justify-between lg:h-[100%] bg-white rounded-lg shadow-md p-4 '>
    //         <Desistement  />
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <Dashboard
      
      />
  )
}

export default DashboardPage