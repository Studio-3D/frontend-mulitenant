// components/ComptabiliteTabContent.jsx
import React from 'react';

// Import your actual table/components for each tab
import TvaTrancheManager from './TvaTrancheManager';
import TvaMensuelleManager from './TvaMensuelleManager';
import CoefficientManager from './CoefficientManager';
import FournisseursManager from './FournisseursManager';
// import DecomptesTable from '@/app/(dashboard)/comptabilite/decomptes/DecomptesTable';
// import FacturesTable from '@/app/(dashboard)/comptabilite/factures/FacturesTable';
// import CpsTable from '@/app/(dashboard)/comptabilite/cps/CpsTable';
// import CreditsTable from '@/app/(dashboard)/comptabilite/credits/CreditsTable';

export function ComptabiliteTabContent({ id }) {
  const tabComponents = {
    'tva-tranche': <TvaTrancheManager />,
    'tva-mensuelle': <TvaMensuelleManager />,
    'coefficient': <CoefficientManager/>,
    'fournisseurs': <FournisseursManager />,
    // 'decomptes': <DecomptesTable />,
    // 'factures': <FacturesTable />,
    // 'cps': <CpsTable />,
    // 'credits': <CreditsTable />,
  };

  return tabComponents[id] || <div>Tab "{id}" not found</div>;
}