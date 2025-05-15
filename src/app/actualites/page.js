"use client";

import React, { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { Calendar, Clock, ChevronUp, Users } from 'lucide-react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import ProjetSelector from '@/components/ProjetSelector';

// Components
import VisitesCard from './components/VisitesCard';
import AvancesCard from './components/AvancesCard';
import MeetingCard from './components/MeetingCard';
import RemboursementsCard from './components/RemboursementsCard';
import DesistementsCard from './components/DesistementsCard';
import StatCard from './components/StatCard';
import FilterDialog from './components/FilterDialog';

export default function ActualitesPage() {
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(true);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [commercialId, setCommercialId] = useState('tous');
  const [commercialName, setCommercialName] = useState('Tous les Commerciaux');
  const [filterActive, setFilterActive] = useState(false);

  // Data states
  const [visites, setVisites] = useState([]);
  const [sumVisites, setSumVisites] = useState(0);
  const [avances, setAvances] = useState([]);
  const [sumAvances, setSumAvances] = useState(0);
  const [meeting, setMeeting] = useState([]);
  const [remboursements, setRemboursements] = useState([]);
  const [sumRemb, setSumRemb] = useState(0);
  const [desistements, setDesistements] = useState([]);
  const [sumPenalites, setSumPenalites] = useState(0);
  const [sumMontantAAjouter, setSumMontantAAjouter] = useState(0);
  const [visitesLastDays, setVisitesLastDays] = useState(0);
  const [avancesLastDays, setAvancesLastDays] = useState(0);
  
  // User data
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('authUser') || '{}') : {};
  const isAdmin = user?.role <= 2;

  // Fetch data based on filters
  const fetchData = async () => {
    if (!selectedProjet?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/actualites/${selectedProjet.id}/${commercialId}/${dateRange.from || ''}/${dateRange.to || ''}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      const { data } = response;
      
      // Update all states with the fetched data
      setVisites(data.visites);
      setSumVisites(data.sum_visites);
      setMeeting(data.rdv_relances);
      setVisitesLastDays(data.nb_visite_last_5_days);
      setAvancesLastDays(data.avances_last_5_days);
      setAvances(data.avances_bien);
      setSumAvances(data.sum_avances);
      setRemboursements(data.remboursements);
      setSumRemb(data.sum_remb);
      setDesistements(data.desistements);
      setSumPenalites(data.sum_penalites);
      setSumMontantAAjouter(data.sum_mont_a_ajouter);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching actualites data:', error);
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  // Effect to fetch data when project changes or filters are applied
  useEffect(() => {
    fetchData();
  }, [selectedProjet?.id]);

  // Handle filter submission
  const handleFilterSubmit = (filters) => {
    setDateRange({ from: filters.fromDate, to: filters.toDate });
    setCommercialId(filters.commercial?.id || 'tous');
    setCommercialName(filters.commercial?.name || 'Tous les Commerciaux');
    setFilterActive(true);
    setShowFilterDialog(false);
    fetchData();
  };

  if (!selectedProjet) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-xl font-semibold mb-4">Veuillez sélectionner un projet</h2>
        <div className="w-full max-w-md">
          <ProjetSelector onSelect={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actualités</h1>
        
        {isAdmin && (
          <button 
            onClick={() => setShowFilterDialog(true)}
            className="flex items-center gap-2 bg-[#009FFF] text-white px-4 py-2 rounded-md"
          >
            <Users size={18} />
            <span>Filtrer par commercial</span>
          </button>
        )}
      </div>

      {/* Filter indicators */}
      {filterActive && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <p className="font-medium">Filtres actifs:</p>
            <p className="text-sm">
              Commercial: <span className="font-medium">{commercialName}</span>
              {dateRange.from && <>, Période: <span className="font-medium">{dateRange.from} à {dateRange.to}</span></>}
            </p>
          </div>
          <button 
            onClick={() => {
              setDateRange({ from: null, to: null });
              setCommercialId('tous');
              setCommercialName('Tous les Commerciaux');
              setFilterActive(false);
              fetchData();
            }}
            className="text-blue-600 hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Welcome card */}
        <div className="md:col-span-8 bg-gradient-to-r from-blue-500 to-[#009FFF] text-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {isAdmin
              ? commercialId === 'tous'
                ? 'Tous les Commerciaux'
                : commercialName
              : `${user.name} ${user.prenom}`}
          </h2>
          <p className="mb-2">
            Vous avez réalisé <span className="font-bold">{sumAvances} DH</span> en plus aujourd'hui.
          </p>
          <p className="mb-4">Voir la liste des Avances.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50">
            Voir Détail
          </button>
        </div>

        {/* Stats cards */}
        <div className="md:col-span-2">
          <StatCard 
            title="Total des Visites"
            value={visitesLastDays}
            trend={`+${(visitesLastDays * 100 / 100).toFixed(0)}%`}
            trendUp={true}
            subtitle="5 derniers jours"
            icon={<Calendar className="h-5 w-5" />}
            color="bg-blue-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <StatCard 
            title="Ventes totales"
            value={`${avancesLastDays} DH`}
            trend="38%"
            trendUp={true}
            subtitle="5 derniers jours"
            icon={<Clock className="h-5 w-5" />}
            color="bg-red-500"
          />
        </div>

        {/* Main content cards */}
        <div className="md:col-span-4">
          <AvancesCard avances={avances} sumAvances={sumAvances} commercial={commercialId} />
        </div>
        
        <div className="md:col-span-4">
          <VisitesCard visites={visites} sumVisites={sumVisites} />
        </div>
        
        <div className="md:col-span-4">
          <MeetingCard meetings={meeting} />
        </div>

        <div className="md:col-span-8">
          <DesistementsCard 
            desistements={desistements} 
            sumPenalites={sumPenalites}
            sumMontantAAjouter={sumMontantAAjouter}
          />
        </div>
        
        <div className="md:col-span-4">
          <RemboursementsCard remboursements={remboursements} sumRemb={sumRemb} />
        </div>
      </div>

      {/* Filter Dialog */}
      {showFilterDialog && (
        <FilterDialog 
          onClose={() => setShowFilterDialog(false)}
          onSubmit={handleFilterSubmit}
          initialValues={{
            fromDate: dateRange.from,
            toDate: dateRange.to,
            commercialId: commercialId
          }}
          projetId={selectedProjet?.id}
        />
      )}
    </div>
  );
}
