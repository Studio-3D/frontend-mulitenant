// components/ComptabilitePage.jsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ComptabiliteTabs } from './ComptabiliteTabs';
import { ComptabiliteTabContent } from './ComptabiliteTabContent';

export function ComptabilitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get('tab');
  
  // Set initial active tab from URL or default
  const [activeTab, setActiveTab] = useState(urlTab || 'tva-tranche');

  // Track which tabs have been rendered at least once
  const renderedTabs = useRef({
    [activeTab]: true, // Start with the initial active tab
  });

  // Update active tab when URL changes
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
      
      // Mark tab as rendered if it hasn't been visited yet
      if (!renderedTabs.current[urlTab]) {
        renderedTabs.current = { ...renderedTabs.current, [urlTab]: true };
      }
    }
  }, [urlTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/comptabilite?${params.toString()}`, { scroll: false });

    // Mark tab as rendered if it hasn't been visited yet
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
  };

  // Fonction pour notifier l'activation d'un onglet
  const handleTabActivated = (tabId) => {
    if (tabId === 'decomptes') {
      // Cette fonction sera passée au DecomptesManager
      console.log('Onglet Décomptes activé - rechargement des données');
    }
  };

  // Get all URL parameters to pass to components
  const urlParams = Object.fromEntries(searchParams.entries());

  return (
    <div className="">
      <ComptabiliteTabs activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="">
        {/* Render all tabs but only show the active one */}
        {Object.keys(renderedTabs.current).map((tabId) => (
          <div
            key={tabId}
            style={{ display: activeTab === tabId ? 'block' : 'none' }}
          >
            {renderedTabs.current[tabId] && (
              <ComptabiliteTabContent
                id={tabId}
                activeTab={activeTab}
                onTabActivated={() => handleTabActivated(tabId)}
                urlParams={urlParams} // Pass all URL parameters
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}