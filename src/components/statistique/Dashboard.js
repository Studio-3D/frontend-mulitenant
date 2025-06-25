import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { DateFilter } from './DateFilter';
import { AreaChart } from './charts/AreaCharts';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { startOfMonth, endOfMonth, format, subDays } from 'date-fns';
import { AlertCircleIcon, ThumbsUpIcon, BanknoteIcon, UsersIcon, UserPlusIcon, PhoneCallIcon, ArrowDownIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '../../configs/api';

export const Dashboard = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(startOfMonth(today));
  const [endDate, setEndDate] = useState(endOfMonth(today));
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Validate dates
        const isValidDate = (d) => d instanceof Date && !isNaN(d);
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
          setError('Invalid date range');
          return;
        }

        // Format dates
        const formattedStart = format(startDate, 'yyyy-MM-dd');
        const formattedEnd = format(endDate, 'yyyy-MM-dd');

        // Check if project is selected
        if (!selectedProjet?.id) {
          setError('No project selected');
          return;
        }

        const response = await axios.get(
          `${APIURL.ROOTV1}/statistiques_admin/${selectedProjet.id}/${formattedStart}/${formattedEnd}`,
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
            params: {
              start_date: formattedStart,
              end_date: formattedEnd,
              projet_id: selectedProjet.id
            }
          }
        );
        console.log('API Response:', response.data);
        
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate, selectedProjet, accesstoken]);

  

  const {
    penalties = dashboardData?.sum_penalites ?? 0, // Use 'penalities' from response if available
    Bien_vendu = dashboardData?.nb_biens_vendu ?? 0,
    encaissement = dashboardData?.sum_encaissements ?? 0,
    visits = dashboardData?.nb_visites ?? 0,
    prospects = dashboardData?.nb_prospects ?? 0,
    Appels = dashboardData?.nb_appels ?? 0,
    encaissements = [],
    userSources = [],
    visites = dashboardData?.visites ?? 0,
  } = dashboardData || {};

  // In your Dashboard component

const visitCategories = [
  { id: 0, name: 'Réceptif', color: '#3B82F6' },
  { id: 1, name: 'Pré Réservation', color: '#8B5CF6' },
  { id: 2, name: 'Pré Réservation Perdu', color: '#EF4444' },
  { id: 3, name: 'Pré Réservation Vendu', color: '#10B981' },
  { id: 4, name: 'Vente 1er visite', color: '#F59E0B' },
  { id: 5, name: 'Vente En n visite', color: '#06B6D4' },
  { id: 6, name: 'Vente Perdu', color: '#F43F5E' },
  { id: 7, name: 'Perdu', color: '#6B7280' }
];

const visitData = visitCategories.map(category => ({
  name: category.name,
  value: visites[category.id] || 0,
  color: category.color
})).filter(item => item.value > 0); // Only show categories with visits 

const cancellationCategories = [
  { id: '1', name: 'Désistement Définitif', color: '#EF4444' }, // Red
  { id: '2', name: 'Désistements Au Profit', color: '#F59E0B' }, // Orange
  { id: '3', name: 'Changement de Bien', color: '#3B82F6' }, // Blue
  { id: '4', name: 'Autre motif', color: '#6B7280' } // Gray
];

// Process the cancellation data from API
const processCancellationData = (rawData) => {
  const counts = rawData?.reduce((acc, item) => {
    const type = item[2]; // The cancellation type is at index 2
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return cancellationCategories.map(category => ({
    reason: category.name,
    count: counts?.[category.id] || 0,
    change: 0, // You can calculate changes if you have historical data
    color: category.color
  })).filter(item => item.count > 0); // Only show categories with cancellations
};

const cancellations = processCancellationData(dashboardData?.array_type_date_desistement) || [];

  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Aperçu Général
        </h2>
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
      </div>
      
      <div className="relative mb-6">
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x scrollbar-none">
          <div className="flex gap-3  min-w-max">
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Pénalité"
                value={penalties.toString()}
                change="+12.5%"
                isPositive={false}
                icon={<AlertCircleIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-red-400 to-red-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Bien Vendu"
                value={Bien_vendu.toString()}
                change="+8.2%"
                isPositive={true}
                icon={<ThumbsUpIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-green-400 to-green-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Encaissement"
                value={`${encaissement.toLocaleString()} dh`}
                change="+4.4%"
                isPositive={true}
                icon={<BanknoteIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-blue-400 to-blue-500"
              />
            </div>
            <div className=" xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Visites"
                value={visits.toString()}
                change="+1.1%"
                isPositive={true}
                icon={<UsersIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-purple-400 to-purple-500"
              />
            </div>
            <div className=" xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Prospects"
                value={prospects.toString()}
                change="+2.3%"
                isPositive={true}
                icon={<UserPlusIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-orange-400 to-orange-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Appels"
                value={Appels.toString()}
                change="+5.7%"
                isPositive={true}
                icon={<PhoneCallIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-teal-400 to-teal-500"
              />
            </div>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-4 bg-gradient-to-t from-gray-50 pointer-events-none sm:hidden"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Nombre de Biens Vendus
          </h3>
          <AreaChart 
            data={encaissements} 
            startDate={startDate} 
            endDate={endDate} 
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Utilisateurs par Source
          </h3>
          <BarChart 
            data={userSources} 
            startDate={startDate} 
            endDate={endDate} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Visites</h3>
          <div className="h-80">
            <PieChart 
              data={visitData} 
              startDate={startDate} 
              endDate={endDate} 
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Enaissements - Remboursement
          </h3>
          <AreaChart 
            data={encaissements} 
            startDate={startDate} 
            endDate={endDate} 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-gray-800">Désistement</h3>
    <span className="text-sm text-gray-500">
      Total: {cancellations.reduce((sum, item) => sum + item.count, 0)} cas
    </span>
  </div>
  <div className="space-y-4">
    {cancellations.map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${item.color}20` }} // 20% opacity
          >
            <ArrowDownIcon
              className="w-5 h-5"
              style={{ color: item.color }}
            />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-800">
              {item.reason}
            </p>
            <p className="text-xs text-gray-500">
              {format(subDays(new Date(), index + 1), 'PPp')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">
            {item.count} cas
          </p>
          <p
            className={`text-xs ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {item.change > 0 ? '+' : ''}{item.change}%
          </p>
        </div>
      </div>
    ))}
    {cancellations.length === 0 && (
      <div className="text-center py-4 text-gray-500">
        Aucun désistement enregistré
      </div>
    )}
  </div>
</div>
    </div>
  );
}