'use client';
import React, { useState, useEffect } from 'react';
import { ReservationHeader } from '../../../../../components/reservation/ReservationHeader';
import { TabNavigation } from '../../../../../components/reservation/TabNavigation';
import { DetailTab } from '../../../../../components/reservation/tabs/DetailTab';
import { HistoriquesTab } from '../../../../../components/reservation/tabs/HistoriquesTab';
import { AcquereursTab } from '../../../../../components/reservation/tabs/AcquereursTab';
import { PiecesJointesTab } from '../../../../../components/reservation/tabs/PiecesJointesTab';
import { AvancesTab } from '../../../../../components/reservation/tabs/AvancesTab';
import { RendezVousTab } from '../../../../../components/reservation/tabs/RendezVousTab';
import { CompromisVentesTab } from '../../../../../components/reservation/tabs/CompromisVentesTab';
import { ContractTab } from '../../../../../components/reservation/tabs/ContractTab';

import { useParams } from 'next/navigation';

// Mock reservation data
const reservationData = {
  code: 'RES-2023-05678',
  menuCounts: {
    historiques: 5,
    acquereurs: 2,
    piecesJointes: 8,
    avances: 3,
    rendezVous: 4,
    compromisVentes: 1,
    contracts: 2
  }
};

const Res_Show = () => {
    const [activeTab, setActiveTab] = useState('detail');
    const { reservationId } = useParams();
  const renderTabContent = () => {
    switch (activeTab) {
      case 'detail':
        return <DetailTab />;
      case 'historiques':
        return <HistoriquesTab />;
      case 'acquereurs':
        return <AcquereursTab />;
      case 'piecesJointes':
        return <PiecesJointesTab />;
      case 'avances':
        return <AvancesTab />;
      case 'rendezVous':
        return <RendezVousTab />;
      case 'compromisVentes':
        return <CompromisVentesTab />;
      case 'contract':
        return <ContractTab />;
      default:
        return <DetailTab />;
    }
  };

  
  return (
    <div className=" ">
        <p>{reservationId}</p>
      <ReservationHeader reservationData={reservationData} />
      <div className="bg-white rounded-lg shadow-md mt-6">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} counts={reservationData.menuCounts} />
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Res_Show;