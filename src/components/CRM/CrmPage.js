'use client';
import React, { useState, useRef, useEffect } from 'react';
import { TabsNavigation } from './TabsNavigation';
import { TabContent } from './TabContent';
import Pusher from 'pusher-js';
import FetchNotifMenu from '@/configs/FetchNotifMenu';
import { useSearchParams, useRouter } from 'next/navigation';
import { isCommercial } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';

export function CRMPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get('tab');
  
  // Set initial state from URL parameters
  const [activeTab, setActiveTab] = useState(urlTab || 'prospects');
  const [activeSubTab, setActiveSubTab] = useState({
    relance: 'appels-relance',
    rdv: 'appels-rdv',
    prospects: isCommercial(user?.role) ? 'mes-prospects' : 'tous-prospects',
  });

  // FIX: Initialize with only the active tab rendered
  const initialTab = isCommercial(user?.role) && activeTab === 'prospects' 
    ? activeSubTab.prospects 
    : activeTab;
  const renderedTabs = useRef({ [initialTab]: true });

  // FIX: Update renderedTabs when tab changes
  useEffect(() => {
    const currentTab = isCommercial(user?.role) && activeTab === 'prospects' 
      ? activeSubTab.prospects 
      : activeTab;
    
    if (currentTab && !renderedTabs.current[currentTab]) {
      renderedTabs.current[currentTab] = true;
    }
  }, [activeTab, activeSubTab, user?.role]);

  // Sync URL with tab state
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      handleTabChange(urlTab, true);
    }
  }, [urlTab]);

  // Update URL when tab changes
  const updateUrl = (tabId) => {
    const params = new URLSearchParams();
    params.set('tab', tabId);
    const newUrl = `?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  // Notification state
  const [notifications, setNotifications] = useState({
    prospects: 0,
    'mes-prospects': 0,
    'tous-prospects': 0,
    relance: 0,
    'appels-relance': 0,
    'visites-relance': 0,
    rdv: 0,
    'appels-rdv': 0,
    'visites-rdv': 0,
    freins: 0,
  });

  const pusher_key_NotifMenu = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF_MENU;

  const fetchDataNotiMon = async (nb) => {
    const projetId = JSON.parse(localStorage.getItem('selectedProjet'))?.id;

    await FetchNotifMenu(
      nb,
      projetId,
      (appelsRelance) =>
        setNotifications((prev) => ({
          ...prev,
          'appels-relance': appelsRelance,
        })),
      (appelsRdv) =>
        setNotifications((prev) => ({ ...prev, 'appels-rdv': appelsRdv })),
      (visitesRelance) =>
        setNotifications((prev) => ({
          ...prev,
          'visites-relance': visitesRelance,
        })),
      (visitesRdv) =>
        setNotifications((prev) => ({ ...prev, 'visites-rdv': visitesRdv })),
      (freins) => setNotifications((prev) => ({ ...prev, freins: freins }))
    );
  };

  useEffect(() => {
    // Initial fetch
    fetchDataNotiMon('D');

    // Pusher setup
    if (pusher_key_NotifMenu) {
      const pusher = new Pusher(pusher_key_NotifMenu, {
        cluster: 'eu',
        encrypted: true,
      });

      const channel = pusher.subscribe('NotifMenu');

      channel.bind('App\\Events\\NotifMenuEvent', (data) => {
        fetchDataNotiMon(data.NotifMenuId);
      });

      return () => {
        channel.unbind('App\\Events\\NotifMenuEvent');
        pusher.unsubscribe('NotifMenu');
      };
    }
  }, [pusher_key_NotifMenu]);

  // Calculate totals for main tabs
  useEffect(() => {
    const totalRelance =
      notifications['appels-relance'] + notifications['visites-relance'];
    const totalRdv = notifications['appels-rdv'] + notifications['visites-rdv'];

    setNotifications((prev) => ({
      ...prev,
      relance: totalRelance,
      rdv: totalRdv,
    }));
  }, [
    notifications['appels-relance'],
    notifications['visites-relance'],
    notifications['appels-rdv'],
    notifications['visites-rdv'],
  ]);

  const handleTabChange = (tabId, fromUrl = false) => {
    setActiveTab(tabId);
    if (!fromUrl) {
      updateUrl(tabId);
    }

    if (tabId === 'relance' || tabId === 'rdv') {
      const subtabId = tabId === 'relance' ? 'appels-relance' : 'appels-rdv';

      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
      if (!renderedTabs.current[subtabId]) {
        renderedTabs.current = { ...renderedTabs.current, [subtabId]: true };
      }

      if (tabId === 'relance' && activeSubTab.relance !== 'appels-relance') {
        setActiveSubTab((prev) => ({ ...prev, relance: 'appels-relance' }));
      } else if (tabId === 'rdv' && activeSubTab.rdv !== 'appels-rdv') {
        setActiveSubTab((prev) => ({ ...prev, rdv: 'appels-rdv' }));
      }
    } else if (tabId === 'prospects' && isCommercial(user?.role)) {
      // For commercial users, set default prospects sub-tab
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
      if (activeSubTab.prospects !== 'mes-prospects') {
        setActiveSubTab((prev) => ({ ...prev, prospects: 'mes-prospects' }));
      }
    } else {
      // This handles visites, appels, pre-reservation, freins tabs
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
    }
  };

  const handleSubTabChange = (parentTab, subTabId) => {
    setActiveSubTab((prev) => ({
      ...prev,
      [parentTab]: subTabId,
    }));

    if (!renderedTabs.current[subTabId]) {
      renderedTabs.current = { ...renderedTabs.current, [subTabId]: true };
    }
  };

  return (
    <div className="">
      <TabsNavigation
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabChange}
        onSubTabChange={handleSubTabChange}
        notifications={notifications}
        userRole={user?.role}
      />
      <div className="">
        {/* Prospects tabs - handle both commercial and non-commercial users */}
        {isCommercial(user?.role) ? (
          <>
            {/* Commercial users see sub-tabs */}
            <div
              style={{
                display:
                  activeTab === 'prospects' &&
                  activeSubTab.prospects === 'mes-prospects'
                    ? 'block'
                    : 'none',
              }}
            >
              {renderedTabs.current['mes-prospects'] && (
                <TabContent id="mes-prospects" />
              )}
            </div>

            <div
              style={{
                display:
                  activeTab === 'prospects' &&
                  activeSubTab.prospects === 'tous-prospects'
                    ? 'block'
                    : 'none',
              }}
            >
              {renderedTabs.current['tous-prospects'] && (
                <TabContent id="tous-prospects" />
              )}
            </div>
          </>
        ) : (
          /* Non-commercial users see single prospects tab */
          <div
            style={{ display: activeTab === 'prospects' ? 'block' : 'none' }}
          >
            {renderedTabs.current['prospects'] && <TabContent id="prospects" />}
          </div>
        )}

        <div style={{ display: activeTab === 'visites' ? 'block' : 'none' }}>
          {renderedTabs.current['visites'] && <TabContent id="visites" />}
        </div>

        <div style={{ display: activeTab === 'appels' ? 'block' : 'none' }}>
          {renderedTabs.current['appels'] && <TabContent id="appels" />}
        </div>

        <div
          style={{
            display: activeTab === 'pre-reservation' ? 'block' : 'none',
          }}
        >
          {renderedTabs.current['pre-reservation'] && (
            <TabContent id="pre-reservation" />
          )}
        </div>

        {/* Relance subtabs */}
        <div
          style={{
            display:
              activeTab === 'relance' &&
              activeSubTab.relance === 'appels-relance'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['appels-relance'] && (
            <TabContent id="appels-relance" />
          )}
        </div>

        <div
          style={{
            display:
              activeTab === 'relance' &&
              activeSubTab.relance === 'visites-relance'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['visites-relance'] && (
            <TabContent id="visites-relance" />
          )}
        </div>

        {/* RDV subtabs */}
        <div
          style={{
            display:
              activeTab === 'rdv' && activeSubTab.rdv === 'appels-rdv'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['appels-rdv'] && <TabContent id="appels-rdv" />}
        </div>

        <div
          style={{
            display:
              activeTab === 'rdv' && activeSubTab.rdv === 'visites-rdv'
                ? 'block'
                : 'none',
          }}
        >
          {renderedTabs.current['visites-rdv'] && (
            <TabContent id="visites-rdv" />
          )}
        </div>

        <div style={{ display: activeTab === 'freins' ? 'block' : 'none' }}>
          {renderedTabs.current['freins'] && <TabContent id="freins" />}
        </div>
      </div>
    </div>
  );
}