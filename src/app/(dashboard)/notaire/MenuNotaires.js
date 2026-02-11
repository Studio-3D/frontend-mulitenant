// MenuNotaires.jsx (version avec tabs et animation)
import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, UsersIcon } from 'lucide-react';

const MenuNotaires = ({ notaires, selectedNotaire, onSelectNotaire, loading }) => {
  const tabs = [
    {
      id: 'all',
      label: 'Tous les notaires',
      value: null,
      icon: UsersIcon,
    },
    ...notaires.map((n) => ({
      id: String(n.id),
      label: `${n.name} ${n.prenom}`,
      value: n.id,
      icon: UserIcon,
    })),
  ];
  
  const currentTabId = selectedNotaire === null ? 'all' : String(selectedNotaire);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Sélectionner un notaire</h3>
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-t-lg animate-pulse w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Sélectionner un notaire</h3>
      
      {/* Container des tabs */}
      <div className="relative border-b border-gray-200">
        <nav className="flex overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = currentTabId === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNotaire(tab.value, tab.label)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap
                  transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Contenu de la tab active */}
    
      
      {notaires.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500 italic">
          Aucun notaire disponible
        </div>
      )}
    </div>
  );
};

export default MenuNotaires;