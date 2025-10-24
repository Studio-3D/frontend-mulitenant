// components/ComptabiliteTabContent.jsx
import React from 'react';

// Import your actual table/components for each tab
import TvaTrancheManager from './TvaTrancheManager';
import TvaMensuelleManager from './TvaMensuelleManager';
// import CoefficientTable from '@/app/(dashboard)/comptabilite/coefficient/CoefficientTable';
// import FournisseursTable from '@/app/(dashboard)/comptabilite/fournisseurs/FournisseursTable';
// import DecomptesTable from '@/app/(dashboard)/comptabilite/decomptes/DecomptesTable';
// import FacturesTable from '@/app/(dashboard)/comptabilite/factures/FacturesTable';
// import CpsTable from '@/app/(dashboard)/comptabilite/cps/CpsTable';
// import CreditsTable from '@/app/(dashboard)/comptabilite/credits/CreditsTable';

export function ComptabiliteTabContent({ id }) {
  const tabComponents = {
    'tva-tranche': <TvaTrancheManager />,
    'tva-mensuelle': <TvaMensuelleManager />,
    // 'coefficient': <CoefficientTable />,
    // 'fournisseurs': <FournisseursTable />,
    // 'decomptes': <DecomptesTable />,
    // 'factures': <FacturesTable />,
    // 'cps': <CpsTable />,
    // 'credits': <CreditsTable />,
  };

  return tabComponents[id] || <div>Tab "{id}" not found</div>;
}