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
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subDays,
  format
} from 'date-fns';

export const Dashboard = () => {
  const { token, user } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet, projets } = useProjet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(startOfYear(new Date()));
  const [endDate, setEndDate] = useState(endOfYear(new Date()));
  const [showProjetDialog, setShowProjetDialog] = useState(false);
  const router = useRouter();
  const { selectedSociete, societes } = useSociete();
  const [showSocieteModal, setShowSocieteModal] = useState(false);
  const [selectedSocieteId, setSelectedSocieteId] = useState(null);

  // Proper role checking
  const userRole = decryptUserType(user?.role);
  const isSuperAdmin = userRole === User_roles.ROLE_SUPER_ADMIN;

  const getDateRangeParams = (startDate, endDate) => {
    const formatLocalDate = (date) => {
      return format(date, 'yyyy-MM-dd');
    };

    return {
      start_date: formatLocalDate(startDate),
      end_date: formatLocalDate(endDate)
    };
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

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

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

        const dateParams = getDateRangeParams(startDate, endDate);
        const projetId = selectedProjet?.id || JSON.parse(localStorage.getItem("selectedProjet"))?.id;
        const response = await axios.get(`${APIURL.ROOTV1}/dashboard/${projetId}/${dateParams.start_date}/${dateParams.end_date}`, {
          headers: {
            Authorization: `Bearer ${accesstoken}`
          },
        });
        console.log("Dashboard data response:", response.data); // Debug log
        setData(response.data);
      } catch (err) {
        setError(`Failed to fetch dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [selectedProjet, accesstoken, startDate, endDate, showSocieteModal, showProjetDialog]);

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
        }}
        selectedId={selectedSocieteId}
        setSelectedId={setSelectedSocieteId}
        societes={societes}
        onConfirm={() => {
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
        }}
        projets={projets}
        onSelect={() => setShowProjetDialog(false)}
      />
    );
  }

  // Helper component for empty state messages
  const EmptyStateMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-50 p-4">
      <div className="text-gray-500 text-lg font-medium text-center">
        {message}
      </div>
    </div>
  );

  // Check if we should show societe selection message (for super admin only)
  const shouldShowSocieteMessage = isSuperAdmin && !selectedSociete;
  // Check if we should show projet selection message
  const shouldShowProjetMessage = !selectedProjet && !localStorage.getItem("selectedProjet");

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-5 rounded-xl shadow-sm">
        <div className="flex flex-col w-full md:flex-row md:items-center md:justify-between gap-3">
          {/* Left side - Title and project name (stacked on mobile, inline on xl) */}
          <div className="flex items-center xl:flex-row xl:items-center gap-3 w-full md:w-auto">
            <h1 className="text-xl xl:text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Aperçu de projet :
            </h1>
            {selectedProjet || localStorage.getItem("selectedProjet") ? (
              <div className="px-4 py-1.5 bg-cyan-50 rounded-md text-gray-800 font-medium w-fit">
                {selectedProjet?.nom || JSON.parse(localStorage.getItem('selectedProjet'))?.nom}
              </div>
            ) : (
              <div className="px-4 py-1.5 bg-red-50 rounded-md text-red-500 font-medium w-fit">
                Aucun projet sélectionné
              </div>
            )}
          </div>

          {/* Right side - Date selector (full width on mobile, auto on larger screens) */}
          <div className="w-full xl:w-auto mt-2 xl:mt-0">
            <DateSelector 
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              disabled={shouldShowSocieteMessage || shouldShowProjetMessage}
            />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {shouldShowSocieteMessage ? (
          Array(6).fill(0).map((_, i) => (
            <MetricsCard
              key={`societe-msg-${i}`}
              title="Société requise"
              value=""
              icon={<AlertOctagonIcon className="h-6 w-6 text-gray-400" />}
              color="gray"
              message="Veuillez sélectionner une société"
            />
          ))
        ) : shouldShowProjetMessage ? (
          Array(6).fill(0).map((_, i) => (
            <MetricsCard
              key={`projet-msg-${i}`}
              title="Projet requis"
              value=""
              icon={<AlertOctagonIcon className="h-6 w-6 text-gray-400" />}
              color="gray"
              message="Veuillez sélectionner un projet"
            />
          ))
        ) : (
          <>
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
              value={data?.array_visite_interet_et_date?.reduce((acc, item) => acc + (item.visite || 0), 0)}
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
              value={data?.Appels?.reduce((acc, item) => acc + (item['appel entrant'] || 0) + (item['appel sortant'] || 0), 0)}
              icon={<PhoneIcon className="h-6 w-6 text-indigo-500" />}
              color="indigo"
            />
          </>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Main Charts */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {shouldShowSocieteMessage ? (
            <EmptyStateMessage message="Veuillez sélectionner une société pour afficher les données" />
          ) : shouldShowProjetMessage ? (
            <EmptyStateMessage message="Veuillez sélectionner un projet pour afficher les données" />
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-50">
                <EncaissementChart 
                  startDate={startDate}
                  endDate={endDate}
                  data={data?.array_encaissement} 
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-50">
                <VentesChart 
                  startDate={startDate}
                  endDate={endDate}
                  data={data?.array_ventes} 
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-50">
                <VisitesChart 
                  startDate={startDate}
                  endDate={endDate}
                  data={data?.array_visite_interet_et_date} 
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column - Appels and Désistement */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {shouldShowSocieteMessage ? (
            <EmptyStateMessage message="Veuillez sélectionner une société pour afficher les données" />
          ) : shouldShowProjetMessage ? (
            <EmptyStateMessage message="Veuillez sélectionner un projet pour afficher les données" />
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <span className="w-2 h-8 bg-indigo-500 rounded-md mr-3"></span>
                  Appels
                </h2>
                <AppelsChart 
                  startDate={startDate}
                  endDate={endDate}
                  data={data} 
                />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <span className="w-2 h-8 bg-amber-500 rounded-md mr-3"></span>
                  Désistement
                </h2>
                <DesistementChart 
                  startDate={startDate}
                  endDate={endDate}
                  data={data} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};