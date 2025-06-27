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
        setError(null);
        
        // Validate dates
        const isValidDate = (d) => d instanceof Date && !isNaN(d);
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
          throw new Error('Invalid date range');
        }

        // Format dates
        const formattedStart = format(startDate, 'yyyy-MM-dd');
        const formattedEnd = format(endDate, 'yyyy-MM-dd');

        // Check if project is selected
        if (!selectedProjet?.id) {
          throw new Error('No project selected');
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
              projet_id: selectedProjet.id,
              with_details: true // Ensure the API returns detailed cancellation data
            }
          }
        );
        console.log('API Response:', response.data);
        setDashboardData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate, selectedProjet, accesstoken]);

  // Default values if data is not loaded yet
  const {
    sum_penalites: penalties = 0,
    nb_biens_vendu: Bien_vendu = 0,
    sum_encaissements: encaissement = 0,
    nb_visites: visits = 0,
    nb_prospects: prospects = 0,
    nb_appels: Appels = 0,
    encaissements = [],
    visites = {},
    array_type_date_desistement: cancellationsRaw = [],
    chartData_sources = [],
  } = dashboardData || {};

  // Visit categories data
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

  // Process visit data
  const visitData = visitCategories.map(category => ({
    name: category.name,
    value: visites[category.id] || 0,
    color: category.color
  })).filter(item => item.value > 0);

  // User sources data
  const userSourcesData = [
  { id: '0', name: 'Avito', color: '#3B82F6' },
  { id: '1', name: 'Kekemonos', color: '#8B5CF6' },
  { id: '2', name: 'Palissade', color: '#EC4899' },
  { id: '3', name: 'Panneaux 4*3', color: '#10B981' },
  { id: '4', name: 'Flyer', color: '#F59E0B' },
  { id: '5', name: 'Caravane', color: '#10B981' },
  { id: '6', name: 'Bouche à Oreille', color: '#06B6D4' }, // Note the accent
  { id: '7', name: 'Site Web', color: '#FCD34D' },
  { id: '8', name: 'Facebook', color: '#EF4444' },
  { id: '9', name: 'Smsing', color: '#FBBF24' },
  { id: '10', name: 'Phoning BDD', color: '#A78BFA' },
  { id: '11', name: 'Youtube', color: '#F472B6' },
  { id: '12', name: 'Partenaire', color: '#34D399' },
  { id: '13', name: 'Sarouty', color: '#F59E0B' }
];

const sourceData = chartData_sources
  .map(([name, value]) => {
    // Find matching source definition
    const source = userSourcesData.find(s => 
      s.name.toLowerCase() === name.toLowerCase().replace(' a ', ' à ')
    );
    
    return source ? {
      name: source.name,
      value,
      color: source.color
    } : null;
  })
  .filter(Boolean) // Remove null entries
  .filter(item => item.value > 0); // Only show sources with data

  // Cancellation categories
  const cancellationCategories = [
    { id: '1', name: 'Désistement Définitif', color: '#EF4444' },
    { id: '2', name: 'Désistements Au Profit', color: '#F59E0B' },
    { id: '3', name: 'Changement de Bien', color: '#3B82F6' },
    { id: '4', name: 'Autre motif', color: '#6B7280' }
  ];

// Process cancellation data to include dates and proper formatting
const cancellations = (cancellationsRaw || []).map(item => {
  const category = cancellationCategories.find(cat => cat.id === item[2]);
  return {
    date: new Date(item[0]), // Assuming item[0] is the date string
    reason: category ? category.name : 'Unknown',
    count: 1,
    color: category ? category.color : '#6B7280',
    // Include any other relevant data from the item array
  };
}).filter(item => !isNaN(item.date.getTime())); // Filter out invalid dates

const filteredCancellations = cancellations.filter(item => {
  return item.date >= startDate && item.date <= endDate;
});

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

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
          <div className="flex gap-3 min-w-max">
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Pénalité"
                value={penalties.toLocaleString()}
                change="+12.5%"
                isPositive={false}
                icon={<AlertCircleIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-red-400 to-red-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Bien Vendu"
                value={Bien_vendu.toLocaleString()}
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
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Visites"
                value={visits.toLocaleString()}
                change="+1.1%"
                isPositive={true}
                icon={<UsersIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-purple-400 to-purple-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Prospects"
                value={prospects.toLocaleString()}
                change="+2.3%"
                isPositive={true}
                icon={<UserPlusIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-orange-400 to-orange-500"
              />
            </div>
            <div className="xl:w-[255px] sm:w-auto snap-start">
              <StatCard
                title="Appels"
                value={Appels.toLocaleString()}
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
            data={sourceData} 
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
            Encaissements - Remboursement
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
    <div className="flex items-center">
      <span className="text-sm text-gray-500 mr-2">
        Période: {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
      </span>
      <span className="text-sm font-medium text-gray-800">
        {filteredCancellations.length} cas
      </span>
    </div>
  </div>
  
  {filteredCancellations.length > 0 ? (
    <div className="space-y-3">
      {filteredCancellations
        .sort((a, b) => b.date - a.date) // Newest first
        .map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <ArrowDownIcon
                  className="w-5 h-5"
                  style={{ color: item.color }}
                />
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.reason}
                </p>
                <p className="text-xs text-gray-500">
                  {format(item.date, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <div className="ml-4 text-right flex-shrink-0">
              <p className="text-sm font-medium text-gray-800">
                {item.count} cas
              </p>
            </div>
          </div>
        ))}
    </div>
  ) : (
    <div className="text-center py-6 text-gray-500">
      <AlertCircleIcon className="w-8 h-8 mx-auto mb-2" />
      <p>Aucun désistement enregistré pour cette période</p>
    </div>
  )}
</div>
      </div>
  );
};