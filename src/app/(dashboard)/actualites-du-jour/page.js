"use client";

import React, { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
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

  const mockData = {
    visites: [10, 5, 3, 8, 12, 6, 2, 4],
    sum_visites: 50,
    avances_bien: [
      { 
        propriete_dite_bien: "Appartement A101", 
        montant: 50000, 
        tranche_nom: "Tranche 1", 
        bloc_nom: "Bloc A", 
        immeuble_nom: "Imm 1" 
      },
      { 
        propriete_dite_bien: "Appartement B262", 
        montant: 10000, 
        tranche_nom: "Tranche 556", 
        bloc_nom: "Blocccc", 
        immeuble_nom: "Immmmmmm" 
      },
      { 
        propriete_dite_bien: "Villa V220", 
        montant: 150000, 
        tranche_nom: "Tranche 2", 
        bloc_nom: "Bloc B" 
      },
      { 
        propriete_dite_bien: "Duplex D305", 
        montant: 200000, 
        tranche_nom: "Tranche 1", 
        immeuble_nom: "Imm 3" 
      },
    ],
    sum_avances: 400000,
    rdv_relances: [
      {
        visite: { 
          prospect: { nom: "Dupont", prenom: "Jean" } 
        },
        date_relance: "2023-06-15",
        rdv: null
      },
      {
        visite: { 
          prospect: { nom: "Martin", prenom: "Sophie" } 
        },
        date_relance: null,
        rdv: "2023-06-18"
      },
      {
        visite: { 
          prospect: { nom: "Dubois", prenom: "Pierre" } 
        },
        date_relance: "2023-06-20",
        rdv: null
      }
    ],
    remboursements: [
      {
        propriete_dite_bien: "Appartement B505",
        montant_a_rembourser: 25000,
        tranche_nom: "Tranche 3",
        bloc_nom: "Bloc C",
        immeuble_nom: "Imm 5"
      },
      {
        propriete_dite_bien: "Studio S101",
        montant_a_rembourser: 15000,
        tranche_nom: "Tranche 1",
        bloc_nom: "Bloc A"
      }
    ],
    sum_remb: 40000,
    desistements: [
      {
        type: 1, // DD
        type_dp: null,
        code_reservation: "RES-2023-001",
        bien: "Appartement C202",
        penalite: 10000
      },
      {
        type: 2, // DP
        type_dp: 1, // PROCHE
        bien: "Villa V115",
        lien_parente: "lien_parente",
        penalite: 5000
      },
      {
        type: 3, // CHANGE
        type_dp: null,
        bien: "Appartement A303",
        new_bien: "Appartement B401",
        montant_a_ajouter: 75000,
        penalite: 0
      }
    ],
    sum_penalites: 15000,
    sum_mont_a_ajouter: 75000,
    nb_visite_last_5_days: 15,
    avances_last_5_days: 250000
  };

  // Get user information
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('authUser') || '{}') : {};

  // Remove all isAdmin checks and debug logs
  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

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
        `${APIURL.ROOTV1}/actualites/${selectedProjet.id}/${commercialId}/${dateRange.from || 'null'}/${dateRange.to || 'null'}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const { data } = response;

      // Update all states with the fetched data
      setVisites(data.visites || mockData.visites);
      setSumVisites(data.sum_visites || mockData.sum_visites);
      setMeeting(data.rdv_relances || mockData.rdv_relances);
      setVisitesLastDays(data.nb_visite_last_5_days || mockData.nb_visite_last_5_days);
      setAvancesLastDays(data.avances_last_5_days || mockData.avances_last_5_days);
      setAvances(data.avances_bien || mockData.avances_bien);
      setSumAvances(data.sum_avances || mockData.sum_avances);
      setRemboursements(data.remboursements || mockData.remboursements);
      setSumRemb(data.sum_remb || mockData.sum_remb);
      setDesistements(data.desistements || mockData.desistements);
      setSumPenalites(data.sum_penalites || mockData.sum_penalites);
      setSumMontantAAjouter(data.sum_mont_a_ajouter || mockData.sum_mont_a_ajouter);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching actualites data:', error);
      toast.error('Erreur lors du chargement des données - Affichage des données de test');
      
      // Use mock data on error
      setVisites(mockData.visites);
      setSumVisites(mockData.sum_visites);
      setMeeting(mockData.rdv_relances);
      setVisitesLastDays(mockData.nb_visite_last_5_days);
      setAvancesLastDays(mockData.avances_last_5_days);
      setAvances(mockData.avances_bien);
      setSumAvances(mockData.sum_avances);
      setRemboursements(mockData.remboursements);
      setSumRemb(mockData.sum_remb);
      setDesistements(mockData.desistements);
      setSumPenalites(mockData.sum_penalites);
      setSumMontantAAjouter(mockData.sum_mont_a_ajouter);
      
      setLoading(false);
    }
  };

  // Effect to fetch data when project changes or filters are applied
  useEffect(() => {
    // Set mock data immediately for faster testing
    setVisites(mockData.visites);
    setSumVisites(mockData.sum_visites);
    setMeeting(mockData.rdv_relances);
    setVisitesLastDays(mockData.nb_visite_last_5_days);
    setAvancesLastDays(mockData.avances_last_5_days);
    setAvances(mockData.avances_bien);
    setSumAvances(mockData.sum_avances);
    setRemboursements(mockData.remboursements);
    setSumRemb(mockData.sum_remb);
    setDesistements(mockData.desistements);
    setSumPenalites(mockData.sum_penalites);
    setSumMontantAAjouter(mockData.sum_mont_a_ajouter);
    
    // Still try to fetch real data if project is selected
    if (selectedProjet?.id) {
      fetchData();
    }
  }, []);

  // Handle filter submission
  const handleFilterSubmit = (filters) => {
    setDateRange({ from: filters.fromDate, to: filters.toDate });
    setCommercialId(filters.commercial?.id || 'tous');

    // Use default "Tous les Commerciaux" if no commercial is selected
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

        {/* Remove the icon from the button */}
        <button 
          onClick={() => setShowFilterDialog(true)}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md"
          title="Actualités Par commerciaux"
        >
          <span>Actualités Par commerciaux</span>
        </button>
      </div>

      {/* Filter indicators */}
      {filterActive && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <p className="font-medium">Filtres actifs:</p>
            <p className="text-sm">
              {commercialName && <span className="font-medium">{commercialName}</span>}
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
            className="!text-blue-600 hover:underline"
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
            {commercialId === 'tous' ? 'Tous les Commerciaux' : commercialName}
          </h2>
          <p className="mb-2">
            Vous avez réalisé <span className="font-bold">{sumAvances} DH</span> en plus aujourd'hui.
          </p>
          <p className="mb-4">Voir la liste des Avances.</p>
          <button className="bg-white !text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50">
            Voir Détail
          </button>
        </div>

        {/* Stats cards - remove the icon prop */}
        <div className="md:col-span-2">
          <StatCard 
            title="Total des Visites"
            value={visitesLastDays}
            trend={`+${(visitesLastDays * 100 / 100).toFixed(0)}%`}
            trendUp={true}
            subtitle="5 derniers jours"
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
