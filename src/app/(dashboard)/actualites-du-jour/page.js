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
import VentesCard from '@/components/actualites/VentesCard';
import TraitementsProspect from '@/components/actualites/TraitementsProspects';
import { DateFilter } from '@/components/statistique/DateFilter';
import {
  startOfDay,
  endOfDay,
  format,
} from "date-fns";

export default function ActualitesPage() {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(true);
  const [commercialId, setCommercialId] = useState(
    user.role == 3 ? user.id : 'tous'
  );
  const [commercialName, setCommercialName] = useState('Tous les Commerciaux');
  const [commercials, setCommercials] = useState([]);
  const [loadingCommercials, setLoadingCommercials] = useState(false);

  // Date filter states - Set to "today" instead of month
  const today = new Date();
  const [startDate, setStartDate] = useState(startOfDay(today));
  const [endDate, setEndDate] = useState(endOfDay(today));
  const [timePeriod, setTimePeriod] = useState('today'); 

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
  const [reservations, setReservations] = useState([]);
  const [traitements_prospects, setTraitementsProspect] = useState([]);

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
    reservations: [],
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
  const fetchData = async (start = null, end = null) => {
    if (!selectedProjet?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');

    // Use the provided dates or fall back to state
    const from = start !== null ? format(start, 'yyyy-MM-dd') : null;
    const to = end !== null ? format(end, 'yyyy-MM-dd') : null;

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
      setVisites(data.visites);
      setSumVisites(data.sum_visites);
      setMeeting(data.rdv_relances);

      setAvances(data.avances_bien);
      setSumAvances(data.sum_avances);
      setRemboursements(data.remboursements);
      setSumRemb(data.sum_remb);
      setDesistements(data.desistements);
      setSumPenalites(data.sum_penalites);
      setSumMontantAAjouter(data.sum_mont_a_ajouter);
      setReservations(data.reservations);
      setTraitementsProspect(data.traitements_prospects);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching actualites data:', error);
      toast.error('Erreur lors du chargement des données ');

      // Use mock data on error
      setVisites(mockData.visites);
      setSumVisites(mockData.sum_visites);
      setMeeting(mockData.rdv_relances);
      setAvances(mockData.avances_bien);
      setSumAvances(mockData.sum_avances);
      setRemboursements(mockData.remboursements);
      setSumRemb(mockData.sum_remb);
      setDesistements(mockData.desistements);
      setSumPenalites(mockData.sum_penalites);
      setSumMontantAAjouter(mockData.sum_mont_a_ajouter);
      setReservations(mockData.reservations);

      setLoading(false);
    }
  };

  // Update effect to fetch data when commercial changes or project changes
  useEffect(() => {
    if (selectedProjet?.id) {
      fetchData(startDate, endDate);
    }
  }, [selectedProjet?.id, commercialId]);

  // Handle date filter change from DateFilter component
  const handleDateChange = (start, end, period) => {
    setStartDate(start);
    setEndDate(end);
    setTimePeriod(period || 'custom');
    fetchData(start, end);
  };

  
  const voir_detail = () => {
    // Store filter parameters in localStorage
    const filterParams = {
      commercial: commercialId,
      commercial_name: commercialName,
      type_encaissement: 1, // Avances
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
      timestamp: Date.now() // Add timestamp to identify the latest filter
    };
    
    localStorage.setItem('encaissement_filters', JSON.stringify(filterParams));
    
    // Redirect to encaissement page without parameters in URL
    window.open('/encaissements', '_blank');
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
        <LoadingSpin />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actualités</h1>
      </div>
      
      {/* Date Filter Component */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="xl:text-xl items-center font-semibold text-gray-800 sm:mb-0">
          Aperçu Général
        </h2>
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          timePeriod={timePeriod}
        />
      </div>

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
            onClick={() => voir_detail()}
          >
            Voir Détail
          </button>
        </div>

        {/* Main content cards */}
        <div className="md:col-span-12">
          <VentesCard
            reservations={reservations}
            nb_reservation={reservations.length}
            desistements={desistements}
            sumPenalites={sumPenalites}
            sumMontantAAjouter={sumMontantAAjouter}
            avances={avances}
            sumAvances={sumAvances}
            remboursements={remboursements}
            sumRemb={parseFloat(sumRemb.toFixed(2))}
          />
        </div>

        <div className="md:col-span-4">
          <VisitesCard visites={visites} sumVisites={sumVisites} />
        </div>
        <div className="md:col-span-4">
          <TraitementsProspect
            traitements_prospects={traitements_prospects}
            nb={traitements_prospects.length}
          />
        </div>
        <div className="md:col-span-4">
          <MeetingCalendar meetings={meeting} />
        </div>
      </div>
    </div>
  );
}