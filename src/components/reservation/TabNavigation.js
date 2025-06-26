import React from 'react';
import { 
  FileTextIcon, 
  HistoryIcon, 
  UsersIcon, 
  PaperclipIcon, 
  CoinsIcon, 
  CalendarIcon, 
  FileSignatureIcon,
  RefreshCwIcon,
  FoldHorizontal
} from 'lucide-react';

const iconComponents = {
  'file-text': FileTextIcon,
  'history': HistoryIcon,
  'users': UsersIcon,
  'paperclip': PaperclipIcon,
  'coins': CoinsIcon,
  'calendar': CalendarIcon,
  'file-signature': FileSignatureIcon,
  'repeat': RefreshCwIcon,
  'swap-horizontal': FoldHorizontal
};

export const TabNavigation = ({
  activeTab,
  setActiveTab,
  tabs,
  counts = {}
}) => {
  const getIconComponent = (iconName) => {
    const IconComponent = iconComponents[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <div className="h-4 w-4" />;
  };

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto py-2 px-4">
        {tabs.map(tab => {
          const count = counts[tab.id] !== undefined ? counts[tab.id] : tab.count;
          
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap px-4 py-2 mr-2 rounded-md text-md font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-[#009FFF] border-b-2 border-[#009FFF]' 
                  : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span className="mr-2">{getIconComponent(tab.icon)}</span>
              {tab.label}
              {(count !== undefined && count > 0) && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full 
                  ${activeTab === tab.id 
                    ? 'bg-blue-100 text-[#009FFF]' 
                    : 'bg-gray-100 text-gray-600'}`
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};