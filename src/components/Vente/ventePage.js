'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VenteTabsNavigation } from './VenteTabsNavigation';
import { VenteTabContent } from './VenteTabContent';
import Pusher from 'pusher-js';
import FetchNotifMenuVente from '@/configs/fetch_notif_menu_vente';
import { useAuth } from '../../context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { useRouter, useSearchParams } from 'next/navigation';

export function VentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial state from URL parameters
  const urlTab = searchParams.get('tab');
  const urlSubTab = searchParams.get('subtab');

  // Set initial state from URL parameters
  const [activeTab, setActiveTab] = useState(urlTab || 'reservations');
  const [activeSubTab, setActiveSubTab] = useState({
    validation: urlSubTab || 'desistements-attente-encours',
    rejet: 'desistements-rejet',
    remboursements: 'apres-ventes',
  });

  const renderedTabs = useRef({ [activeTab]: true }); // Only current tab initially

  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const userRole = user?.role;
  const projetId = selectedProjet?.id;
  const pusher_key_NotifMenu =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF_MENU;
  const [param, setParam] = useState(0);

  // Update URL when tab changes - SIMPLIFIED like CRM
  const updateURL = useCallback((tab, subtab = null) => {
    const params = new URLSearchParams();

    if (tab) {
      params.set('tab', tab);
    }

    if (subtab) {
      params.set('subtab', subtab);
    }

    // Use replaceState like CRM does
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    console.log('URL updated to:', newUrl);
  }, []);

  useEffect(() => {
    if (activeTab && !renderedTabs.current[activeTab]) {
      renderedTabs.current[activeTab] = true;
    }
  }, [activeTab]);

  // Sync URL with tab state - SIMPLIFIED like CRM
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      console.log('URL tab change detected, calling handleTabChange:', urlTab);
      handleTabChange(urlTab, true);
    }
  }, [urlTab]);

  // Handle subtab URL changes - SIMPLIFIED
  useEffect(() => {
    if (
      urlSubTab &&
      ['validation', 'rejet', 'remboursements'].includes(activeTab)
    ) {
      const parentTab = activeTab;
      console.log(
        'URL subtab change detected:',
        urlSubTab,
        'for parent tab:',
        parentTab
      );

      // Directly set the subtab without calling handleSubTabChange to avoid loops
      setActiveSubTab((prev) => ({
        ...prev,
        [parentTab]: urlSubTab,
      }));

      // Ensure the subtab is marked as rendered
      if (!renderedTabs.current[urlSubTab]) {
        renderedTabs.current = { ...renderedTabs.current, [urlSubTab]: true };
      }
    }
  }, [urlSubTab, activeTab]);

  // Notification state - matching the old navbar structure
  const [notifications, setNotifications] = useState({
    // Main tabs
    reservations: 0,
    clients: 0,
    desistements: 0,
    penalites: 0,
    remboursements: 0,
    validation: 0,
    rejet: 0,
    echeances: 0,

    // Sub tabs - Validation
    'desistements-attente-encours': 0,
    'penalites-validation': 0,
    'reservations-validation': 0,
    'avances-validation': 0,

    // Sub tabs - Rejet
    'desistements-rejet': 0,
    'penalites-rejet': 0,
    'reservations-rejet': 0,
    'avances-rejet': 0,

    // Sub tabs - Remboursements
    'apres-ventes': 0,
    'att-accuse-cheque': 0,
    'att-decaissement': 0,
    accuses: 0,
    'dossiers-transferes': 0,
    'accuses-cheque-traite': 0,
  });

  // Fonction optimisée pour récupérer les notifications
  const fetchDataNotifMenu = useCallback(
    async (nb = 0) => {
      if (!projetId || !userRole) return;

      await FetchNotifMenuVente(
        nb,
        projetId,
        userRole,
        // nb_demande_pre_remb - not used in new notifications
        (nb_demande_pre_remb) => {},
        // nb_dst_att_valide
        (nb_dst_att_valide) =>
          setNotifications((prev) => ({
            ...prev,
            'desistements-attente-encours': nb_dst_att_valide,
          })),
        // nb_pen_att_valide
        (nb_pen_att_valide) =>
          setNotifications((prev) => ({
            ...prev,
            'penalites-validation': nb_pen_att_valide,
          })),
        // nb_att_valid_reservation
        (nb_att_valid_reservation) =>
          setNotifications((prev) => ({
            ...prev,
            'reservations-validation': nb_att_valid_reservation,
          })),
        // nb_att_valid_avances
        (nb_att_valid_avances) =>
          setNotifications((prev) => ({
            ...prev,
            'avances-validation': nb_att_valid_avances,
          })),
        // nb_echeances
        (nb_echeances) =>
          setNotifications((prev) => ({
            ...prev,
            echeances: nb_echeances,
          }))
      );
    },
    [projetId, userRole]
  );

  // Appel automatique quand le projet change
  useEffect(() => {
    if (projetId && userRole) {
      fetchDataNotifMenu(0);
    }
  }, [projetId, userRole, fetchDataNotifMenu]);

  // Configuration Pusher
  useEffect(() => {
    if (!pusher_key_NotifMenu || !projetId) return;

    const pusher = new Pusher(pusher_key_NotifMenu, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('NotifMenu');
    channel.bind('App\\Events\\NotifMenuEvent', (data) => {
      fetchDataNotifMenu(data.NotifMenuId);
      setParam(data.NotifMenuId);
    });

    return () => {
      channel.unbind('App\\Events\\NotifMenuEvent');
      pusher.unsubscribe('NotifMenu');
    };
  }, [pusher_key_NotifMenu, projetId, fetchDataNotifMenu]);

  // Appel initial au chargement
  useEffect(() => {
    if (projetId && userRole && param === 0) {
      fetchDataNotifMenu(0);
    }
  }, [param, projetId, userRole, fetchDataNotifMenu]);

  // Calculate totals for main tabs (same as old navbar logic)
  useEffect(() => {
    const nb_att_validation_total =
      Number(notifications['desistements-attente-encours']) +
      Number(notifications['penalites-validation']) +
      Number(notifications['reservations-validation']) +
      Number(notifications['avances-validation']);

    setNotifications((prev) => ({
      ...prev,
      validation: nb_att_validation_total,
    }));
  }, [
    notifications['desistements-attente-encours'],
    notifications['penalites-validation'],
    notifications['reservations-validation'],
    notifications['avances-validation'],
  ]);

  // Update the handleTabChange to be simpler
 // Update the handleTabChange function
const handleTabChange = (tabId, fromUrl = false) => {
  console.log('handleTabChange called:', tabId, 'fromUrl:', fromUrl);
  setActiveTab(tabId);

  if (!fromUrl) {
    updateURL(tabId);
  }

  // Set default sub-tabs when main tab changes
  if (tabId === 'validation') {
    // For comptable (role=7), set default to avances-validation instead of desistements
    const defaultSubTab = userRole === 7 ? 'avances-validation' : 'desistements-attente-encours';
    
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
    if (!renderedTabs.current[defaultSubTab]) {
      renderedTabs.current = {
        ...renderedTabs.current,
        [defaultSubTab]: true,
      };
    }

    if (activeSubTab.validation !== defaultSubTab) {
      setActiveSubTab((prev) => ({ ...prev, validation: defaultSubTab }));
      if (!fromUrl) {
        updateURL(tabId, defaultSubTab);
      }
    }
  } else if (tabId === 'rejet') {
    // For comptable (role=7), set default to avances-rejet instead of desistements-rejet
    const defaultSubTab = userRole === 7 ? 'avances-rejet' : 'desistements-rejet';
    
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
    if (!renderedTabs.current[defaultSubTab]) {
      renderedTabs.current = {
        ...renderedTabs.current,
        [defaultSubTab]: true,
      };
    }

    if (activeSubTab.rejet !== defaultSubTab) {
      setActiveSubTab((prev) => ({ ...prev, rejet: defaultSubTab }));
      if (!fromUrl) {
        updateURL(tabId, defaultSubTab);
      }
    }
  } else if (tabId === 'remboursements') {
    const defaultSubTab = 'apres-ventes';
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
    if (!renderedTabs.current[defaultSubTab]) {
      renderedTabs.current = {
        ...renderedTabs.current,
        [defaultSubTab]: true,
      };
    }

    if (activeSubTab.remboursements !== defaultSubTab) {
      setActiveSubTab((prev) => ({ ...prev, remboursements: defaultSubTab }));
      if (!fromUrl) {
        updateURL(tabId, defaultSubTab);
      }
    }
  } else {
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
  }
};

// Update the handleSubTabClick function to ensure localStorage is set correctly
const handleSubTabClick = (parentTab, subTabId) => {
  console.log('handleSubTabClick called:', parentTab, subTabId);
  
  // Set localStorage states based on sub-tab selection
  switch (subTabId) {
    case 'avances-validation':
      localStorage.setItem('etat_av', '3');
      break;
    case 'penalites-validation':
      if (userRole <= 2 || userRole ==7 ) {
        localStorage.setItem('etat_penalite', '5');
      } else {
        localStorage.setItem('etat_penalite', '0');
      }
      break;
    case 'desistements-attente-encours':
      if (userRole <= 2) {
        localStorage.setItem('etat_dst', '5');
      } else {
        localStorage.setItem('etat_dst', '0');
      }
      break;
    case 'reservations-validation':
      localStorage.setItem('etat_res', '3');
      break;
    case 'avances-rejet':
      localStorage.setItem('etat_av', '2');
      break;
    case 'penalites-rejet':
      localStorage.setItem('etat_penalite', '2');
      break;
    case 'desistements-rejet':
      localStorage.setItem('etat_dst', '2');
      break;
    case 'reservations-rejet':
      localStorage.setItem('etat_res', '2');
      break;
    default:
      break;
  }
  
  handleSubTabChange(parentTab, subTabId, true);
};
  // Update handleSubTabChange to be simpler
  const handleSubTabChange = (parentTab, subTabId, updateUrl = true) => {
    console.log('handleSubTabChange called:', parentTab, subTabId, updateUrl);
    setActiveSubTab((prev) => ({
      ...prev,
      [parentTab]: subTabId,
    }));

    if (updateUrl) {
      updateURL(parentTab, subTabId);
    }

    if (!renderedTabs.current[subTabId]) {
      renderedTabs.current = { ...renderedTabs.current, [subTabId]: true };
    }
  };

  // Handle localStorage state for specific tabs (from old navbar)
  const handleTabClick = (tabId) => {
    console.log('handleTabClick called:', tabId);
    switch (tabId) {
      case 'desistements':
        localStorage.setItem('etat_dst', '1');
        break;
      case 'penalites':
        localStorage.setItem('etat_penalite', '1');
        break;
      case 'echeances':
        localStorage.setItem('etat_av', '99');
        break;
      default:
        break;
    }
    handleTabChange(tabId, false);
  };


  // Show loading state if no project selected
  if (!selectedProjet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Aucun projet sélectionné</div>
          <div className="text-sm text-gray-400 mt-2">
            Veuillez sélectionner un projet pour afficher la Vente
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <VenteTabsNavigation
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabClick}
        onSubTabChange={handleSubTabClick}
        notifications={notifications}
        userRole={userRole}
      />
      <div className="">
        {/* Simple tabs */}
        <div
          style={{ display: activeTab === 'reservations' ? 'block' : 'none' }}
        >
          {renderedTabs.current['reservations'] && (
            <VenteTabContent id="reservations" />
          )}
        </div>

        <div style={{ display: activeTab === 'clients' ? 'block' : 'none' }}>
          {renderedTabs.current['clients'] && <VenteTabContent id="clients" />}
        </div>

        <div
          style={{ display: activeTab === 'desistements' ? 'block' : 'none' }}
        >
          {renderedTabs.current['desistements'] && (
            <VenteTabContent id="desistements" />
          )}
        </div>

        <div style={{ display: activeTab === 'penalites' ? 'block' : 'none' }}>
          {renderedTabs.current['penalites'] && (
            <VenteTabContent id="penalites" />
          )}
        </div>

        <div style={{ display: activeTab === 'echeances' ? 'block' : 'none' }}>
          {renderedTabs.current['echeances'] && (
            <VenteTabContent id="echeances" />
          )}
        </div>

        {/* Validation subtabs */}
        <div
          style={{
            display:
              activeTab === 'validation' &&
              activeSubTab.validation === 'desistements-attente-encours'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['desistements-attente-encours'] && (
            <VenteTabContent id="desistements-attente-encours" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'validation' &&
              activeSubTab.validation === 'penalites-validation'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['penalites-validation'] && (
            <VenteTabContent id="penalites-validation" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'validation' &&
              activeSubTab.validation === 'reservations-validation'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['reservations-validation'] && (
            <VenteTabContent id="reservations-validation" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'validation' &&
              activeSubTab.validation === 'avances-validation'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['avances-validation'] && (
            <VenteTabContent id="avances-validation" />
          )}
        </div>

        {/* Rejet subtabs */}
        <div
          style={{
            display:
              activeTab === 'rejet' &&
              activeSubTab.rejet === 'desistements-rejet'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['desistements-rejet'] && (
            <VenteTabContent id="desistements-rejet" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'rejet' && activeSubTab.rejet === 'penalites-rejet'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['penalites-rejet'] && (
            <VenteTabContent id="penalites-rejet" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'rejet' &&
              activeSubTab.rejet === 'reservations-rejet'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['reservations-rejet'] && (
            <VenteTabContent id="reservations-rejet" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'rejet' && activeSubTab.rejet === 'avances-rejet'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['avances-rejet'] && (
            <VenteTabContent id="avances-rejet" />
          )}
        </div>

        {/* Remboursements subtabs */}
        <div
          style={{
            display:
              activeTab === 'remboursements' &&
              activeSubTab.remboursements === 'apres-ventes'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['apres-ventes'] && (
            <VenteTabContent id="apres-ventes" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'remboursements' &&
              activeSubTab.remboursements === 'att-accuse-cheque'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['att-accuse-cheque'] && (
            <VenteTabContent id="att-accuse-cheque" />
          )}
        </div>

    {(userRole <= 2 || userRole === 7) ? (
          <>
            <div
              style={{
                display:
                  activeTab === 'remboursements' &&
                  activeSubTab.remboursements === 'att-decaissement'
                    ? 'block'
                    : 'none',
              }}
            >
              {renderedTabs.current['att-decaissement'] && (
                <VenteTabContent id="att-decaissement" />
              )}
            </div>

            <div
              style={{
                display:
                  activeTab === 'remboursements' &&
                  activeSubTab.remboursements === 'accuses'
                    ? 'block'
                    : 'none',
              }}
            >
              {renderedTabs.current['accuses'] && (
                <VenteTabContent id="accuses" />
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              display:
                activeTab === 'remboursements' &&
                activeSubTab.remboursements === 'accuses-cheque-traite'
                  ? 'block'
                  : 'none',
            }}
          >
            {renderedTabs.current['accuses-cheque-traite'] && (
              <VenteTabContent id="accuses-cheque-traite" />
            )}
          </div>
        )}

        <div
          style={{
            display:
              activeTab === 'remboursements' &&
              activeSubTab.remboursements === 'dossiers-transferes'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['dossiers-transferes'] && (
            <VenteTabContent id="dossiers-transferes" />
          )}
        </div>
      </div>
    </div>
  );
}
