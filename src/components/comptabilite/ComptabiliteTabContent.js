// components/ComptabiliteTabContent.jsx
import React from 'react';

// Import your actual table/components for each tab
import TvaTrancheManager from './TvaTrancheManager';
import TvaMensuelleManager from './TvaMensuelleManager';
import CoefficientManager from './CoefficientManager';
import FournisseursManager from './FournisseursManager';
import DecomptesManager from './DecomptesManager';
import FacturesManager from './FacturesManager';
// import CpsTable from '@/app/(dashboard)/comptabilite/cps/CpsTable';
// import CreditsTable from '@/app/(dashboard)/comptabilite/credits/CreditsTable';

export function ComptabiliteTabContent({ id }) {
  const tabComponents = {
    'tva-tranche': <TvaTrancheManager />,
    'tva-mensuelle': <TvaMensuelleManager />,
    'coefficient': <CoefficientManager/>,
    'fournisseurs': <FournisseursManager />,
    'decomptes': <DecomptesManager />,
    'factures': <FacturesManager />,
    // 'cps': <CpsTable />,
    // 'credits': <CreditsTable />,
  };

  return tabComponents[id] || <div>Tab "{id}" not found</div>;
}