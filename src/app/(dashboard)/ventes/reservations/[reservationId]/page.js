'use client';
import React, { useState, useEffect } from 'react';
import { ReservationHeader } from '../../../../../components/reservation/ReservationHeader';
import { TabNavigation } from '../../../../../components/reservation/TabNavigation';
import { DetailTab } from '../../../../../components/reservation/tabs/DetailTab';
import { HistoriquesTab } from '../../../../../components/reservation/tabs/HistoriquesTab';
import { AcquereursTab } from '../../../../../components/reservation/tabs/AcquereursTab';
import { PiecesJointesTab } from '../../../../../components/reservation/tabs/PiecesJointesTab';
import { AvancesTab } from '../../../../../components/reservation/tabs/AvancesTab';
import { RendezVousTab } from '../../../../../components/reservation/tabs/RendezVousTab';
import { CompromisVentesTab } from '../../../../../components/reservation/tabs/CompromisVentesTab';
import { ContractTab } from '../../../../../components/reservation/tabs/ContractTab';
import { TransfertTab } from '../../../../../components/reservation/tabs/TransfertTab';

import HistoriqueDesistementTab from '../../../../../components/reservation/tabs/HistoriqueDesistementTab';
import axios from 'axios';
import { useParams } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';
import { APIURL } from '../../../../../configs/api';
import { useAuth } from '../../../../../context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';

const Res_Show = () => {
  const router = useRouter();
  const pusher_key_avances = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_AVANCES;

  const { selectedProjet } = useProjet();
  const [activeTab, setActiveTab] = useState('detail');
  const [sum_av, setSum_av] = useState(null);

  const [reservationData, setReservationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reservationId } = useParams();
  const { user, token } = useAuth();
  const userRole = user.role;
  const accessToken = token || localStorage.getItem('accessToken');

  // Function to reload reservation data
  const reloadReservationData = () => {
    fetchData();
  };
  // In Res_Show component where reste==0 dont reload page// and if on submit contrat de vente
  const updateReservationData = (newData) => {
    setReservationData((prev) => ({
      ...prev,
      ...newData,
    }));
  };
  // In Res_Show component
/*useEffect(() => {
  let lastFetchTime = 0;
  const FETCH_COOLDOWN = 2000; // 3 seconds cooldown

  fetchData();

  if (activeTab !== 'avances') {
    const initializePusher = () => {
      if (!pusher_key_avances || !reservationId || !user?.id) return () => {};

      const pusher = new Pusher(pusher_key_avances, {
        cluster: 'eu',
        encrypted: true,
        forceTLS: true,
      });

      const userChannelName = `res-show-user-${user.id}`;
      const userChannel = pusher.subscribe(userChannelName);
      
      userChannel.bind('AvancesEvent', (data) => {
        const now = Date.now();
        
        // Only fetch if enough time has passed since last fetch
        if (now - lastFetchTime > FETCH_COOLDOWN) {
          console.log('Refreshing data via Pusher');
          lastFetchTime = now;
          fetchData();
        } else {
          console.log('Skipping fetch - cooldown active');
        }
      });

      return () => pusher.disconnect();
    };

    return initializePusher();
  }
}, [reservationId, pusher_key_avances, user?.id, activeTab]);*/ // Add activeTab to dependencies
  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

       
        router.push('/ventes/reservations');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  const fetchData = async () => {
    try {
      if (!reservationId) {
        setError('No reservation ID provided');
        return;
      }

      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Construct the proper API URL
      const apiUrl = `${APIURL.RESERVATIONS}/${reservationId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setReservationData(response.data);
      setSum_av(response.data.sum_avances_valides);
    } catch (error) {
      console.error('Full error details:', error);
      if (error.response) {
        setError(
          `Server error: ${error.response.status} - ${
            error.response.data?.message || 'No additional info'
          }`
        );
      } else if (error.request) {
        setError('No response received from server');
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verify reservationId is correct before fetching
    if (reservationId && typeof reservationId === 'string') {
      fetchData();
    } else {
      setError('Invalid reservation ID');
    }
  }, [reservationId]);

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem('load_reservation_show') == 1) {
        fetchData();
        localStorage.removeItem('load_reservation_show');
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, []);

  // Add this function to handle avances changes
  const handleAvancesChange = (count, sum) => {
    setSum_av(sum); // Update the sum of advances
    // You might also want to update reservationData if needed
    setReservationData((prev) => ({
      ...prev,
      sum_avances_valides: sum,
      reservation: {
        ...prev.reservation,
        avances: {
          ...prev.reservation.avances,
          length: count,
        },
      },
    }));
  };
  const handleRdvChange = (count) => {
    setReservationData((prev) => ({
      ...prev,
      reservation: {
        ...prev.reservation,
        rdv: {
          ...prev.reservation.rdv,
          length: count,
        },
      },
    }));
  };
  // Prepare tab counts and visibility
  const getTabConfig = () => {
    if (!reservationData) return { tabs: [], counts: {} };

    const counts = {
      acquereurs:
        reservationData?.reservation?.etat == 1
          ? reservationData?.reservation?.aquereurs?.length
          : reservationData?.reservation?.aquereurs_ancien?.length || 0,
      piecesJointes:
        reservationData?.reservation?.etat == 1
          ? reservationData?.reservation?.piece_jointe?.length
          : reservationData?.reservation?.piece_jointe_desiste?.length || 0,
      avances: reservationData?.reservation?.avances?.length || 0,
      rendezVous: reservationData?.reservation?.rdv?.length || 0,
    };

    const baseTabs = [
      { id: 'detail', label: 'Détail réservation', icon: 'file-text' },
      {
        id: 'historiques',
        label: 'Historiques',
        icon: 'history',
        visible: true,
      },
      { id: 'acquereurs', label: 'Acquéreurs', icon: 'users' },
      { id: 'piecesJointes', label: 'Pièces jointes', icon: 'paperclip' },
      { id: 'avances', label: 'Avances', icon: 'coins' },
      {
        id: 'transfert',
        label: 'Transfert',
        icon: 'swap-horizontal',
        visible:
          reservationData?.reservation?.etat == 2 &&
          reservationData?.reservation?.remboursement_dd_with_transfert != null,
      },
      {
        id: 'historiqueDesistement',
        label: 'Historique Désistement',
        icon: 'repeat',
        visible: reservationData?.reservation?.code_desistement != null,
      },
      {
        id: 'rendezVous',
        label: 'Rendez-vous',
        icon: 'calendar',
        visible: userRole <= 3,
      },
      {
        id: 'compromisVentes',
        label: 'Attestation de vente',
        icon: 'file-signature',
        visible: userRole <= 3 && reservationData.sum_avances_valides > 0,
      },
      {
        id: 'contract',
        label: 'Contrat de vente',
        icon: 'file-text',
        visible:
          userRole <= 3 &&
          reservationData.sum_avances_valides >=
            reservationData?.reservation?.prix,
      },
    ];

    // Filter out hidden tabs
    const visibleTabs = baseTabs.filter((tab) => tab.visible !== false);

    return { tabs: visibleTabs, counts };
  };

  const { tabs, counts } = getTabConfig();

  const renderTabContent = () => {
    if (loading)
      return (
        <div className="p-6 text-center">
          <LoadingSpin />
        </div>
      );
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!reservationData) return <div className="p-6">No data available</div>;

    switch (activeTab) {
      case 'detail':
        return (
          <DetailTab
            reservationData={reservationData}
            sum_avances_valides={sum_av}
            onReservationUpdate={reloadReservationData} // Add this prop
          />
        );
      case 'historiques':
        return <HistoriquesTab reservationData={reservationData} />;
      case 'acquereurs':
        return (
          <AcquereursTab
            etat={reservationData?.reservation?.etat}
            contrat_vente={reservationData?.reservation?.contrat_vente}
            reservationId={reservationData?.reservation?.id}
            aquereurs={
              reservationData?.reservation?.etat == 1
                ? reservationData?.reservation?.aquereurs
                : reservationData?.reservation?.aquereurs_ancien || []
            }
            user_role={userRole}
          />
        );
      case 'piecesJointes':
        return (
          <PiecesJointesTab
            reservationData={reservationData}
            user={user}
            piecesJointesData={
              reservationData?.reservation?.etat == 1
                ? reservationData?.reservation?.piece_jointe
                : reservationData?.reservation?.piece_jointe_desiste
            }
          />
        );
      case 'avances':
        return (
          <AvancesTab
            reservationData={reservationData}
            user={user}
            accessToken={accessToken}
            onAvancesChange={handleAvancesChange}
            updateReservationData={updateReservationData} // Add this line
          />
        );
      case 'rendezVous':
        return (
          <RendezVousTab
            reservationData={reservationData}
            user={user}
            accessToken={accessToken}
            onRdvChange={handleRdvChange}
          />
        );
      case 'compromisVentes':
        return (
          <CompromisVentesTab
            reservationData={reservationData}
            user={user}
            accessToken={accessToken}
          />
        );
      case 'contract':
        return (
          <ContractTab
            reservationData={reservationData}
            user={user}
            accessToken={accessToken}
            updateReservationData={updateReservationData} // Add this line
          />
        );
      case 'transfert':
        return (
          <TransfertTab
            reservationData={reservationData}
            user={user}
            accessToken={accessToken}
          />
        );
      case 'historiqueDesistement':
        return (
          <HistoriqueDesistementTab
            code_desistement={reservationData?.reservation?.code_desistement}
          />
        );
      default:
        return <DetailTab reservationData={reservationData} />;
    }
  };

  return (
    <div className="min-h-screen">
      {loading && !reservationData ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin /> {/* Use your loading spinner here */}
        </div>
      ) : error ? (
        <div className="p-6 text-red-500">{error}</div>
      ) : (
        <>
          <ReservationHeader
            reservationData={reservationData}
            userRole={userRole}
          />
          <div className="bg-white rounded-lg shadow-md mt-6">
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
              counts={counts}
            />
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Res_Show;
