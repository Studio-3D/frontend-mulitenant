// components/TabContent.jsx
import React from 'react';
import ProspectTable from '../../app/(dashboard)/crm/prospects/ProspectTable';
import VisiteTable from '../../app/(dashboard)/crm/visites/VisiteTable';
import VisiteTableComponent from '../../app/(dashboard)/crm/visites/VisiteTable'; // Rename import

import AppelTable from '../../app/(dashboard)/crm/appels/AppelsTable';
import PreReservationTable from '../../app/(dashboard)/crm/pre-reservations/PreReservationTable';
import RelancesRdvAppelsTable from '../../app/(dashboard)/crm/appels/RelancesRdvAppelsTable';
import RelancesRdv_Visites_Table from '../../app/(dashboard)/crm/visites/RelancesRdv_Visites_Table';
import FreinsTable from '../../app/(dashboard)/crm/visites/freins/RelancesFreinsTable';

export function TabContent({ id }) {
    console.log('TabContent rendering with id:', id); // Add this for debugging

  const tabComponents = {
    'prospects': <ProspectTable />,
      'mes-prospects': <ProspectTable view="assigned" />, // Add view prop for assigned prospects
    'tous-prospects': <ProspectTable view="all" />, // Add view prop for all prospects
    'visites': <VisiteTableComponent />,
    'appels': <AppelTable />,
    'pre-reservation': <PreReservationTable />,
    'appels-relance': <RelancesRdvAppelsTable type={1} />, // type=1 for Appels Relance
    'visites-relance': <RelancesRdv_Visites_Table type={1} />, // type=1 for Visites Relance
    'appels-rdv': <RelancesRdvAppelsTable type={2} />, // type=2 for Appels RDV
    'visites-rdv': <RelancesRdv_Visites_Table type={2} />, // type=2 for Visites RDV
    'freins': <FreinsTable />,
  };

  return tabComponents[id] || <div>Tab {id} not found</div>
}