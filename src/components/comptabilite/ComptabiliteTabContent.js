// components/ComptabiliteTabContent.jsx
import React from 'react';

// Import your actual table/components for each tab
import TvaTrancheManager from './TvaTrancheManager';
import TvaMensuelleManager from './TvaMensuelleManager';
import CoefficientManager from './CoefficientManager';
import FournisseursManager from './FournisseursManager';
import DecomptesManager from './DecomptesManager';
import FacturesManager from './FacturesManager';
import CpsManager from './CpsManager';
import CreditsManager from './CreditsManager';

export function ComptabiliteTabContent({ id, activeTab, onTabActivated, urlParams }) {
  // Common props for all components
  const commonProps = {
    urlParams,
    activeTab,
    onTabActivated
  };

  const tabComponents = {
    'tva-tranche': <TvaTrancheManager {...commonProps} />,
    'tva-mensuelle': <TvaMensuelleManager {...commonProps} />,
    'coefficient': <CoefficientManager {...commonProps} />,
    'fournisseurs': <FournisseursManager {...commonProps} />,
    'decomptes': <DecomptesManager {...commonProps} />,
    'factures': <FacturesManager {...commonProps} />,
    'cps': <CpsManager {...commonProps} />,
    'credits': <CreditsManager {...commonProps} />,
  };

  return tabComponents[id] || <div>Tab {id} not found</div>;
}