import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from "@/context/AuthContext";
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '../../configs/api';
import { DateSelector } from './DateSelector';
import { MetricsCard } from './MetricsCard';
import { EncaissementChart } from './EncaissementChart';
import { VentesChart } from './VentesChart';
import { VisitesChart } from './VisitesChart';
import { AppelsChart } from './charts/AppelsChart';
import { DesistementChart } from './charts/DesistementChart';
import {UsersIcon, UserPlusIcon, CalendarCheckIcon, AlertOctagonIcon, CreditCardIcon, PhoneIcon } from 'lucide-react';

export const Dashboard = () => {
  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("cette année");


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
    };
  
    fetchData();
  }, [selectedProjet, accesstoken]);


  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Aperçu de projet
          </h1>
          <div className="px-4 py-1.5 bg-cyan-50 rounded-md text-gray-800 font-medium">
            {selectedProjet?.nom || JSON.parse(localStorage.getItem('selectedProjet'))?.nom}
          </div>
        </div>
        <DateSelector selected={dateRange} onSelect={setDateRange} />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricsCard
          title="Clients"
          value={data?.nb_clients}
          icon={<UsersIcon className="h-6 w-6 text-blue-500" />}
          color="blue"
        />
        <MetricsCard
          title="Prospects"
          value={data?.nb_prospects}
          icon={<UserPlusIcon className="h-6 w-6 text-green-500" />}
          color="green"
        />
        <MetricsCard
          title="Visites"
          value={data?.nb_visites}
          icon={<CalendarCheckIcon className="h-6 w-6 text-purple-500" />}
          color="purple"
        />
        <MetricsCard
          title="Pénalités"
          value={data?.sum_penalites}
          icon={<AlertOctagonIcon className="h-6 w-6 text-red-500" />}
          color="red"
        />
        <MetricsCard
          title="Remboursement"
          value={data?.sum_remboursements}
          icon={<CreditCardIcon className="h-6 w-6 text-amber-500" />}
          color="amber"
        />
        <MetricsCard
          title="Appels"
          value={data?.nb_appels}
          icon={<PhoneIcon className="h-6 w-6 text-indigo-500" />}
          color="indigo"
        />
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Main Charts */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-50">
            <EncaissementChart dateRange={dateRange} data={data} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-50">
            <VentesChart dateRange={dateRange} data={data} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-50">
            <VisitesChart dateRange={dateRange} data={data} />
          </div>
        </div>

        {/* Right Column - Appels and Désistement */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-indigo-500 rounded-md mr-3"></span>
              Appels
            </h2>
            <AppelsChart dateRange={dateRange} data={data} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded-md mr-3"></span>
              Désistement
            </h2>
            <DesistementChart dateRange={dateRange} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};