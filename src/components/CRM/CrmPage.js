'use client';
import React, { useState, useRef, useEffect } from 'react';
import { TabsNavigation } from './TabsNavigation';
import { TabContent } from './TabContent';
import Pusher from 'pusher-js';
import FetchNotifMenu from '@/configs/FetchNotifMenu';

export function CRMPage() {
  const [activeTab, setActiveTab] = useState('prospects');
  const [activeSubTab, setActiveSubTab] = useState({
    relance: 'appels-relance',
    rdv: 'appels-rdv',
  });
  
  const renderedTabs = useRef({
    prospects: true,
  });

  // Notification state
  const [notifications, setNotifications] = useState({
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
    const projetId = JSON.parse(localStorage.getItem("selectedProjet"))?.id || 1;
    
    await FetchNotifMenu(
      nb,
      projetId,
      (appelsRelance) => setNotifications(prev => ({ ...prev, 'appels-relance': appelsRelance })),
      (appelsRdv) => setNotifications(prev => ({ ...prev, 'appels-rdv': appelsRdv })),
      (visitesRelance) => setNotifications(prev => ({ ...prev, 'visites-relance': visitesRelance })),
      (visitesRdv) => setNotifications(prev => ({ ...prev, 'visites-rdv': visitesRdv })),
      (freins) => setNotifications(prev => ({ ...prev, freins: freins }))
    );
  };

  useEffect(() => {
    // Initial fetch
    fetchDataNotiMon("D");

    // Pusher setup
    if (pusher_key_NotifMenu) {
      const pusher = new Pusher(pusher_key_NotifMenu, {
        cluster: "eu",
        encrypted: true,
      });

      const channel = pusher.subscribe("NotifMenu");

      channel.bind("App\\Events\\NotifMenuEvent", (data) => {
        fetchDataNotiMon(data.NotifMenuId);
      });

      return () => {
        channel.unbind("App\\Events\\NotifMenuEvent");
        pusher.unsubscribe("NotifMenu");
      };
    }
  }, []);

  // Calculate totals for main tabs
  useEffect(() => {
    const totalRelance = notifications['appels-relance'] + notifications['visites-relance'];
    const totalRdv = notifications['appels-rdv'] + notifications['visites-rdv'];
    
    setNotifications(prev => ({
      ...prev,
      relance: totalRelance,
      rdv: totalRdv
    }));
  }, [
    notifications['appels-relance'], 
    notifications['visites-relance'], 
    notifications['appels-rdv'], 
    notifications['visites-rdv']
  ]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    if (tabId === 'relance' || tabId === 'rdv') {
      const subtabId = tabId === 'relance' ? 'appels-relance' : 'appels-rdv';
      
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
      if (!renderedTabs.current[subtabId]) {
        renderedTabs.current = { ...renderedTabs.current, [subtabId]: true };
      }
      
      if (tabId === 'relance' && activeSubTab.relance !== 'appels-relance') {
        setActiveSubTab(prev => ({ ...prev, relance: 'appels-relance' }));
      } else if (tabId === 'rdv' && activeSubTab.rdv !== 'appels-rdv') {
        setActiveSubTab(prev => ({ ...prev, rdv: 'appels-rdv' }));
      }
    } else {
      if (!renderedTabs.current[tabId]) {
        renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
      }
    }
  };

  const handleSubTabChange = (parentTab, subTabId) => {
    setActiveSubTab(prev => ({
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
      />
      <div className="">
        {/* Main tabs content - only render if the tab has been visited, but keep in DOM */}
        <div style={{ display: activeTab === 'prospects' ? 'block' : 'none' }}>
          {renderedTabs.current['prospects'] && <TabContent id="prospects" />}
        </div>
        
        <div style={{ display: activeTab === 'visites' ? 'block' : 'none' }}>
          {renderedTabs.current['visites'] && <TabContent id="visites" />}
        </div>
        
        <div style={{ display: activeTab === 'appels' ? 'block' : 'none' }}>
          {renderedTabs.current['appels'] && <TabContent id="appels" />}
        </div>
        
        <div style={{ display: activeTab === 'pre-reservation' ? 'block' : 'none' }}>
          {renderedTabs.current['pre-reservation'] && <TabContent id="pre-reservation" />}
        </div>
        
        {/* Relance subtabs - keep them always in the DOM once rendered */}
        <div style={{ 
          display: activeTab === 'relance' && activeSubTab.relance === 'appels-relance' ? 'block' : 'none' 
        }}>
          {renderedTabs.current['appels-relance'] && <TabContent id="appels-relance" />}
        </div>
        
        <div style={{ 
          display: activeTab === 'relance' && activeSubTab.relance === 'visites-relance' ? 'block' : 'none' 
        }}>
          {renderedTabs.current['visites-relance'] && <TabContent id="visites-relance" />}
        </div>
        
        {/* RDV subtabs - keep them always in the DOM once rendered */}
        <div style={{ 
          display: activeTab === 'rdv' && activeSubTab.rdv === 'appels-rdv' ? 'block' : 'none' 
        }}>
          {renderedTabs.current['appels-rdv'] && <TabContent id="appels-rdv" />}
        </div>
        
        <div style={{ 
          display: activeTab === 'rdv' && activeSubTab.rdv === 'visites-rdv' ? 'block' : 'none' 
        }}>
          {renderedTabs.current['visites-rdv'] && <TabContent id="visites-rdv" />}
        </div>
        
        <div style={{ display: activeTab === 'freins' ? 'block' : 'none' }}>
          {renderedTabs.current['freins'] && <TabContent id="freins" />}
        </div>
      </div>
    </div>
  );
}