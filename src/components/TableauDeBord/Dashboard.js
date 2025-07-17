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
import { UsersIcon, UserPlusIcon, CalendarCheckIcon, AlertOctagonIcon, CreditCardIcon, PhoneIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSociete } from '@/context/SocieteContext';
import SocieteModal from '../SocieteDialog';
import ProjetDialog from '../../components/ProjetDialog';
import { User_roles, decryptUserType } from "../../configs/enum";

export const Dashboard = () => {
  const { token, user } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet, projets } = useProjet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("cette année");
  const [showProjetDialog, setShowProjetDialog] = useState(false);
  const router = useRouter();
  const { selectedSociete, societes } = useSociete();
  const [showSocieteModal, setShowSocieteModal] = useState(false);
  const [selectedSocieteId, setSelectedSocieteId] = useState(null);


  // Proper role checking
  const userRole = decryptUserType(user?.role);
  const isSuperAdmin = userRole === User_roles.ROLE_SUPER_ADMIN;

  const getDateRangeParams = (range) => {
    const today = new Date();
    
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (range) {
      case "aujourd'hui":
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(todayStart),
          end_date: formatLocalDate(todayEnd)
        };

      case "cette semaine":
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(weekStart),
          end_date: formatLocalDate(weekEnd)
        };

      case "ce mois":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(monthStart),
          end_date: formatLocalDate(monthEnd)
        };

      case "cette année":
        const yearStart = new Date(today.getFullYear(), 0, 1);
        yearStart.setHours(0, 0, 0, 0);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(yearStart),
          end_date: formatLocalDate(yearEnd)
        };

      case "dernière année":
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        lastYearStart.setHours(0, 0, 0, 0);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        lastYearEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(lastYearStart),
          end_date: formatLocalDate(lastYearEnd)
        };

      default:
        const defaultStart = new Date();
        defaultStart.setHours(0, 0, 0, 0);
        const defaultEnd = new Date();
        defaultEnd.setHours(23, 59, 59, 999);
        return {
          start_date: formatLocalDate(defaultStart),
          end_date: formatLocalDate(defaultEnd)
        };
    }
  };

  // Check which dialogs to show on initial render
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if we need to show societe modal
    if (isSuperAdmin && !selectedSociete && !showSocieteModal) {
      setShowSocieteModal(true);
      return;
    }

    // Check if we need to show projet modal (only after societe is selected for super admin)
    if (!selectedProjet && !localStorage.getItem("selectedProjet") && !showProjetDialog) {
      // For super admin, only show projet dialog if societe is already selected
      if (!isSuperAdmin || (isSuperAdmin && selectedSociete)) {
        setShowProjetDialog(true);
      }
    }
  }, [user, selectedSociete, selectedProjet, isSuperAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accesstoken) {
        router.push('/login');
        setLoading(false);
        return;
      }

      // Don't fetch data if we're showing modals
      if (showSocieteModal || showProjetDialog) {
        setLoading(false);
        return;
      }

      // Don't fetch data if no projet is selected
      const hasSelectedProjet = selectedProjet || localStorage.getItem("selectedProjet");
      if (!hasSelectedProjet) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const dateParams = getDateRangeParams(dateRange);
        const projetId = selectedProjet?.id || JSON.parse(localStorage.getItem("selectedProjet"))?.id;

        const response = await axios.get(`${APIURL.ROOTV1}/dashboard/${projetId}/${dateParams.start_date}/${dateParams.end_date}`, {
          headers: {
            Authorization: `Bearer ${accesstoken}`
          },
        });
        
        setData(response.data);
      } catch (err) {
        setError(`Failed to fetch dashboard data: ${err.message}`);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedProjet, accesstoken, dateRange, showSocieteModal, showProjetDialog]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  
  // Show SocieteDialog first for superadmin if needed
if (isSuperAdmin && showSocieteModal) {
  return (
    <SocieteModal
      open={showSocieteModal}
      onClose={() => {
        setShowSocieteModal(false);
        // If they close without selecting, redirect to home
        router.push('/');
      }}
      selectedId={selectedSocieteId}
      setSelectedId={setSelectedSocieteId}
      societes={societes} // Add this line
      onConfirm={() => {  // Changed from onSelect to onConfirm to match your modal
        setShowSocieteModal(false);
        // After selecting societe, show projet dialog if needed
        if (!selectedProjet && !localStorage.getItem("selectedProjet")) {
          setShowProjetDialog(true);
        }
      }}
    />
  );
}

  // Show ProjetDialog if needed
  if (showProjetDialog) {
    return (
      <ProjetDialog
        open={showProjetDialog}
        onClose={() => {
          setShowProjetDialog(false);
          // If they close without selecting, redirect to home
          router.push('/');
        }}
        projets={projets}
        onSelect={() => setShowProjetDialog(false)}
      />
    );
  }

  // Only show dashboard content if all required selections are made
  const canShowDashboard = (!isSuperAdmin || selectedSociete) && (selectedProjet || localStorage.getItem("selectedProjet"));

  if (!canShowDashboard) {
    return <div className="flex justify-center items-center h-64">Preparing dashboard...</div>;
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
          value={data?.sum_remboursements?.toFixed(2)}
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
            <EncaissementChart 
              dateRange={dateRange}
              data={data?.array_encaissement} 
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-50">
            <VentesChart 
              dateRange={dateRange} 
              data={data?.array_ventes} 
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-50">
            <VisitesChart 
              dateRange={dateRange} 
              data={data?.array_visite_interet_et_date} 
            />
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