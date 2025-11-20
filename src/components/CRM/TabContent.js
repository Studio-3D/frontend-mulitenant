// components/TabContent.jsx
import React from 'react';
import ProspectTable from '../../app/(dashboard)/crm/prospects/ProspectTable';
import VisiteTable from '../../app/(dashboard)/crm/visites/VisiteTable';
import VisiteTableComponent from '../../app/(dashboard)/crm/visites/VisiteTable';
import EcheanceTrancheTable from '../../app/(dashboard)/crm/echeance-tranches/EcheanceTrancheTable'; // Corrigez le nom
import AppelTable from '../../app/(dashboard)/crm/appels/AppelsTable';
import PreReservationTable from '../../app/(dashboard)/crm/pre-reservations/PreReservationTable';
import RelancesRdvAppelsTable from '../../app/(dashboard)/crm/appels/RelancesRdvAppelsTable';
import RelancesRdv_Visites_Table from '../../app/(dashboard)/crm/visites/RelancesRdv_Visites_Table';
import FreinsTable from '../../app/(dashboard)/crm/visites/freins/RelancesFreinsTable';

export function TabContent({ id }) {
  console.log('TabContent rendering with id:', id);

  const tabComponents = {
    'prospects': <ProspectTable />,
    'mes-prospects': <ProspectTable view="assigned" />,
    'tous-prospects': <ProspectTable view="all" />,
    'visites': <VisiteTableComponent />,
    'appels': <AppelTable />,
    'echeancesTranches': <EcheanceTrancheTable />, // Utilisez le bon nom
    'pre-reservation': <PreReservationTable />,
    'appels-relance': <RelancesRdvAppelsTable type={1} />,
    'visites-relance': <RelancesRdv_Visites_Table type={1} />,
    'appels-rdv': <RelancesRdvAppelsTable type={2} />,
    'visites-rdv': <RelancesRdv_Visites_Table type={2} />,
    'freins': <FreinsTable />,
  };

  return tabComponents[id] || <div>Tab {id} not found</div>;
}