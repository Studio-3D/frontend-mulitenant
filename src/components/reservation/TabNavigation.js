import React from 'react';
import { 
  FileTextIcon, 
  HistoryIcon, 
  UsersIcon, 
  PaperclipIcon, 
  CoinsIcon, 
  CalendarIcon, 
  FileSignatureIcon 
} from 'lucide-react';

export const TabNavigation = ({
  activeTab,
  setActiveTab,
  counts
}) => {
  const tabs = [
    {
      id: 'detail',
      label: 'Détail réservation',
      icon: <FileTextIcon className="h-4 w-4" />
    },
    {
      id: 'historiques',
      label: 'Historiques',
      icon: <HistoryIcon className="h-4 w-4" />,
      count: counts.historiques
    },
    {
      id: 'acquereurs',
      label: 'Acquéreurs',
      icon: <UsersIcon className="h-4 w-4" />,
      count: counts.acquereurs
    },
    {
      id: 'piecesJointes',
      label: 'Pièces jointes',
      icon: <PaperclipIcon className="h-4 w-4" />,
      count: counts.piecesJointes
    },
    {
      id: 'avances',
      label: 'Avances',
      icon: <CoinsIcon className="h-4 w-4" />,
      count: counts.avances
    },
    {
      id: 'rendezVous',
      label: 'Rendez-vous',
      icon: <CalendarIcon className="h-4 w-4" />,
      count: counts.rendezVous
    },
    {
      id: 'compromisVentes',
      label: 'Compromis de ventes',
      icon: <FileSignatureIcon className="h-4 w-4" />,
      count: counts.compromisVentes
    },
    {
      id: 'contract',
      label: 'Contract',
      icon: <div className="h-4 w-4" />,
      count: counts.contracts
    }
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto py-2 px-4">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center whitespace-nowrap px-4 py-2 mr-2 rounded-md text-md font-medium transition-colors
              ${activeTab === tab.id 
                ? 'bg-blue-50 text-[#009FFF] border-b-2 border-[#009FFF]' 
                : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full 
                ${activeTab === tab.id 
                  ? 'bg-blue-100 text-[#009FFF]' 
                  : 'bg-gray-100 text-gray-600'}`
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};