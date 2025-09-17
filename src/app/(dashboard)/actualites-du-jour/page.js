'use client';

import React, { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import ProjetSelector from '@/components/ProjetSelector';
import LoadingSpin from '@/components/LoadingSpin';
import { useAuth } from '../../../context/AuthContext';

// Components
import VisitesCard from '@/components/actualites/VisitesCard';
import MeetingCalendar from '@/components/actualites/MeetingCalendar';
import RemboursementsCard from '@/components/actualites/RemboursementsCard';
import DesistementsCard from '@/components/actualites/DesistementsCard';
import Modal from '@/components/Modal';
import VentesCard from '@/components/actualites/VentesCard';

export default function ActualitesPage() {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [commercialId, setCommercialId] = useState(
    user.role == 3 ? user.id : 'tous'
  );
  const [commercialName, setCommercialName] = useState('Tous les Commerciaux');
  const [filterActive, setFilterActive] = useState(false);
  const [commercials, setCommercials] = useState([]);
  const [loadingCommercials, setLoadingCommercials] = useState(false);
  const [showDateFilterDialog, setShowDateFilterDialog] = useState(false);
  const [dateFilterActive, setDateFilterActive] = useState(false);

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
  /*const [ventes, setVentes] = useState([]);
  const [sumVentes, setSumVentes] = useState(0);*/

  const mockData = {
    visites: [0, 0, 0, 0, 0, 0, 0, 0],
    sum_visites: 0,
    avances_bien: [],
    sum_avances: 0,
    rdv_relances: [],
    remboursements: [],
    sum_remb: 0,
    desistements: [],
    sum_penalites: 0,
    sum_mont_a_ajouter: 0,
    nb_visite_last_5_days: 0,
    avances_last_5_days: 0,
    ventes: [],
    sum_ventes: 0,
  };

  // Get user information

  const fetchCommercials = async () => {
    setLoadingCommercials(true);
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/get_commerciaux/${selectedProjet.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Add "All commercials" option
      const commercialsList = [
        { id: 'tous', name: 'Tous les Commerciaux', prenom: '', tout: 1 },
      ];

      // Format commercials data
      if (response.data.users && Array.isArray(response.data.users)) {
        response.data.users.forEach((user) => {
          if (user.user) {
            commercialsList.push({
              id: user.user.id,
              name: user.user.name || '',
              prenom: user.user.prenom || '',
              user: user.user,
            });
          } else {
            commercialsList.push({
              id: user.id,
              name: user.name || '',
              prenom: user.prenom || '',
              user: user,
            });
          }
        });
      }
      setCommercials(commercialsList);
    } catch (error) {
      console.error('Error fetching commercials:', error);
      toast.error('Erreur lors du chargement des commerciaux');
      // Set default option on error
      setCommercials([
        { id: 'tous', name: 'Tous les Commerciaux', prenom: '', tout: 1 },
      ]);
    } finally {
      setLoadingCommercials(false);
    }
  };

  // Effect to fetch commercials when project changes
  useEffect(() => {
    if (!selectedProjet?.id) return;

    if (user.role <= 2) {
      fetchCommercials();
    }
  }, [selectedProjet?.id]);

  // Fetch data based on filters
  const fetchData = async (fromDate = null, toDate = null) => {
    if (!selectedProjet?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');

    // Use the provided dates or fall back to state
    const from = fromDate !== null ? fromDate : dateRange.from;
    const to = toDate !== null ? toDate : dateRange.to;

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/actualites/${selectedProjet.id}/${commercialId}/${
          from || 'null'
        }/${to || 'null'}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { data } = response;

      // Update all states with the fetched data
      setVisites(data.visites || mockData.visites);
      setSumVisites(data.sum_visites || mockData.sum_visites);
      setMeeting(data.rdv_relances || mockData.rdv_relances);
      setVisitesLastDays(
        data.nb_visite_last_5_days || mockData.nb_visite_last_5_days
      );
      setAvancesLastDays(
        data.avances_last_5_days || mockData.avances_last_5_days
      );
      setAvances(data.avances_bien || mockData.avances_bien);
      setSumAvances(data.sum_avances || mockData.sum_avances);
      setRemboursements(data.remboursements || mockData.remboursements);
      setSumRemb(data.sum_remb || mockData.sum_remb);
      console.log('summ desii==>' + data.desistements);
      setDesistements(data.desistements || mockData.desistements);
      setSumPenalites(data.sum_penalites || mockData.sum_penalites);
      setSumMontantAAjouter(
        data.sum_mont_a_ajouter || mockData.sum_mont_a_ajouter
      );
      /*setVentes(data.ventes || mockData.ventes);
      setSumVentes(data.sum_ventes || mockData.sum_ventes);*/

      setLoading(false);
    } catch (error) {
      console.error('Error fetching actualites data:', error);
      toast.error(
        'Erreur lors du chargement des données - Affichage des données de test'
      );

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
      /* setVentes(mockData.ventes);
      setSumVentes(mockData.sum_ventes);*/

      setLoading(false);
    }
  };

  // Update effect to fetch data when commercial changes or project changes
  useEffect(() => {
    if (selectedProjet?.id) {
      fetchData();
    }
  }, [selectedProjet?.id, commercialId]);

  // Handle date filter submission - FIXED
  const handleDateFilterSubmit = (fromDate, toDate) => {
    // Update the state
    setDateRange({ from: fromDate, to: toDate });
    setDateFilterActive(true);
    setShowDateFilterDialog(false);

    // Pass the dates directly to fetchData to ensure they're used
    fetchData(fromDate, toDate);
  };

  // Reset date filter
  const resetDateFilter = () => {
    setDateRange({ from: null, to: null });
    setDateFilterActive(false);
    fetchData(null, null);
  };

  const voir_detail = () => {
    window.open(`/encaissements`, '_blank');
  };

  if (!selectedProjet) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-xl font-semibold mb-4">
          Veuillez sélectionner un projet
        </h2>
        <div className="w-full max-w-md">
          <ProjetSelector onSelect={() => {}} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }
  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actualités</h1>

        {/* Date Filter Button */}
        <button
          onClick={() => setShowDateFilterDialog(true)}
          className="flex items-center gap-2 bg-blue-100 !text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Filtrer par date</span>
        </button>
      </div>

      {/* Date Filter Indicator */}
      {dateFilterActive && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <p className="font-medium">Filtre de date actif:</p>
            <p className="text-sm">
              Période:{' '}
              <span className="font-medium">
                {dateRange.from} à {dateRange.to}
              </span>
            </p>
          </div>
          <button
            onClick={resetDateFilter}
            className="!text-blue-600 hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Commercial Selection Tabs */}
      <div className="mb-6 border-b border-gray-200">
        {loadingCommercials ? (
          <div className="py-3 px-4 text-sm !text-gray-500">
            Chargement des commerciaux...
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-1 -mb-px">
            {commercials.map((commercial) => (
              <button
                key={commercial.id}
                onClick={() => {
                  setCommercialId(commercial.id);
                  setCommercialName(
                    commercial.name +
                      (commercial.prenom ? ' ' + commercial.prenom : '')
                  );
                  setFilterActive(commercial.id !== 'tous');
                }}
                className={`whitespace-nowrap py-3 px-5 text-sm font-medium transition-colors border-b-2 mr-1 ${
                  commercialId === commercial.id.toString()
                    ? 'border-blue-500 !text-blue-600'
                    : 'border-transparent !text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {commercial.name}
                {commercial.prenom ? ' ' + commercial.prenom : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Welcome card - expand to full width */}
        <div className="md:col-span-12 bg-gradient-to-r from-blue-500 to-[#009FFF] text-white p-6 rounded-lg shadow">
          {user.role <= 2 && (
            <h2 className="text-xl font-bold mb-4">{commercialName}</h2>
          )}
          <p className="mb-2">
            Vous avez réalisé <span className="font-bold">{sumAvances} DH</span>{' '}
            en plus aujour{"d'"}hui.
          </p>
          <p className="mb-4">Voir la liste des Avances.</p>
          <button
            className="bg-white !text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
            onClick={() => voir_detail(false)}
          >
            Voir Détail
          </button>
        </div>

        {/* Main content cards */}
        <div className="md:col-span-6">
          <VentesCard
            /* ventes={ventes}
            sumVentes={sumVentes}*/
            avances={avances}
            sumAvances={sumAvances}
          />
        </div>

        <div className="md:col-span-6">
          <VisitesCard visites={visites} sumVisites={sumVisites} />
        </div>

        <div className="md:col-span-4">
          <MeetingCalendar meetings={meeting} />
        </div>

        <div className="md:col-span-8">
          <DesistementsCard
            desistements={desistements}
            sumPenalites={sumPenalites}
            sumMontantAAjouter={sumMontantAAjouter}
          />
        </div>

        <div className="md:col-span-4">
          <RemboursementsCard
            remboursements={remboursements}
            sumRemb={sumRemb}
          />
        </div>
      </div>

      {/* Date Filter Dialog */}
      {showDateFilterDialog && (
        <Modal isVisible={true} onClose={() => setShowDateFilterDialog(false)}>
          <div className="w-[400px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filtrer par date</h2>
              <button
                onClick={() => setShowDateFilterDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDateFilterSubmit(
                  e.target.elements.fromDate.value,
                  e.target.elements.toDate.value
                );
              }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium !text-gray-700 mb-1">
                    De:
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    defaultValue={dateRange.from || ''}
                    className="w-full h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium !text-gray-700 mb-1">
                    à:
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    defaultValue={dateRange.to || ''}
                    className="w-full h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDateFilterDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
