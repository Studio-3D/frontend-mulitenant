'use client';
import React, { useState, useRef } from 'react';
import { ComptabiliteTabs } from './ComptabiliteTabs';
import { ComptabiliteTabContent } from './ComptabiliteTabContent';

export function ComptabilitePage() {
  const [activeTab, setActiveTab] = useState('tva-tranche');
  
  // Track which tabs have been rendered at least once
  const renderedTabs = useRef({
    'tva-tranche': true, // Default active tab
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Mark tab as rendered if it hasn't been visited yet
    if (!renderedTabs.current[tabId]) {
      renderedTabs.current = { ...renderedTabs.current, [tabId]: true };
    }
  };

  return (
    <div className="">
      <ComptabiliteTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="">
        {/* Render all tabs but only show the active one */}
        {/* Each tab maintains its state once rendered */}
        <div style={{ display: activeTab === 'tva-tranche' ? 'block' : 'none' }}>
          {renderedTabs.current['tva-tranche'] && <ComptabiliteTabContent id="tva-tranche" />}
        </div>
        
        <div style={{ display: activeTab === 'tva-mensuelle' ? 'block' : 'none' }}>
          {renderedTabs.current['tva-mensuelle'] && <ComptabiliteTabContent id="tva-mensuelle" />}
        </div>
        
        <div style={{ display: activeTab === 'coefficient' ? 'block' : 'none' }}>
          {renderedTabs.current['coefficient'] && <ComptabiliteTabContent id="coefficient" />}
        </div>
        
        <div style={{ display: activeTab === 'fournisseurs' ? 'block' : 'none' }}>
          {renderedTabs.current['fournisseurs'] && <ComptabiliteTabContent id="fournisseurs" />}
        </div>
        
        <div style={{ display: activeTab === 'decomptes' ? 'block' : 'none' }}>
          {renderedTabs.current['decomptes'] && <ComptabiliteTabContent id="decomptes" />}
        </div>
        
        <div style={{ display: activeTab === 'factures' ? 'block' : 'none' }}>
          {renderedTabs.current['factures'] && <ComptabiliteTabContent id="factures" />}
        </div>
        
        <div style={{ display: activeTab === 'cps' ? 'block' : 'none' }}>
          {renderedTabs.current['cps'] && <ComptabiliteTabContent id="cps" />}
        </div>
        
        <div style={{ display: activeTab === 'credits' ? 'block' : 'none' }}>
          {renderedTabs.current['credits'] && <ComptabiliteTabContent id="credits" />}
        </div>
      </div>
    </div>
  );
}