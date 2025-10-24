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

export function ComptabiliteTabContent({ id }) {
  const tabComponents = {
    'tva-tranche': <TvaTrancheManager />,
    'tva-mensuelle': <TvaMensuelleManager />,
    'coefficient': <CoefficientManager/>,
    'fournisseurs': <FournisseursManager />,
    'decomptes': <DecomptesManager />,
    'factures': <FacturesManager />,
    'cps': <CpsManager />,
    'credits': <CreditsManager />,
  };

  return tabComponents[id] || <div>Tab "{id}" not found</div>;
}