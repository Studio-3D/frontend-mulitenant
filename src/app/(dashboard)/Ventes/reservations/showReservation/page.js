'use client'
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

// Tab configuration
const TAB_COMPONENTS = {
  detail: DetailTab,
  historiques: HistoriquesTab,
  acquereurs: AcquereursTab,
  piecesJointes: PiecesJointesTab,
  avances: AvancesTab,
  rendezVous: RendezVousTab,
  compromisVentes: CompromisVentesTab,
  contract: ContractTab
};

const ShowReservation = () => {
  const [activeTab, setActiveTab] = useState('detail');

  const renderTabContent = () => {
    const TabComponent = TAB_COMPONENTS[activeTab] || DetailTab;
    return <TabComponent />;
  };

  return (
    <div className="">
      <ReservationHeader reservationData={reservationData} />
      
      <div className="bg-white min-h-[66vh] rounded-lg shadow-md mt-6">
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          counts={reservationData.menuCounts} 
        />
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ShowReservation;