import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { 
  User, 
  TrendingUp, 
  Phone, 
  Home, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  ChevronDown
} from 'lucide-react';

const getIcon = (type) => {
  const iconProps = { size: 16 };
  
  switch (type) {
    case 'user':
      return <User {...iconProps} />;
    case 'walk':
      return <TrendingUp {...iconProps} />;
    case 'phone':
      return <Phone {...iconProps} />;
    case 'home':
      return <Home {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'alert':
      return <AlertTriangle {...iconProps} />;
    default:
      return null;
  }
};

const TabsNavigation = ({
  activeTab,
  activeSubTab,
  notifications,
  onTabChange,
  onSubTabChange,
}) => {
  const [dropdownState, setDropdownState] = useState({
    relance: false,
    rdv: false,
  });
  
  const [displayedLabels, setDisplayedLabels] = useState({
    relance: 'Relances',
    rdv: 'RDV',
  });

  // Reset to default labels when switching to different tabs
  useEffect(() => {
    if (activeTab !== 'relance') {
      setDisplayedLabels(prev => ({
        ...prev,
        relance: 'Relances',
      }));
    }
    if (activeTab !== 'rdv') {
      setDisplayedLabels(prev => ({
        ...prev,
        rdv: 'RDV',
      }));
    }
  }, [activeTab]);

  // Update displayed labels based on active sub-tabs only when the parent tab is active
  useEffect(() => {
    if (activeTab === 'relance') {
      if (activeSubTab.relance === 'appels-relance') {
        setDisplayedLabels((prev) => ({
          ...prev,
          relance: 'Appels Relances',
        }));
      } else if (activeSubTab.relance === 'visites-relance') {
        setDisplayedLabels((prev) => ({
          ...prev,
          relance: 'Visites Relances',
        }));
      }
    }
    if (activeTab === 'rdv') {
      if (activeSubTab.rdv === 'appels-rdv') {
        setDisplayedLabels((prev) => ({
          ...prev,
          rdv: 'Appels RDV',
        }));
      } else if (activeSubTab.rdv === 'visites-rdv') {
        setDisplayedLabels((prev) => ({
          ...prev,
          rdv: 'Visites RDV',
        }));
      }
    }
  }, [activeTab, activeSubTab]);

  const relanceTabRef = useRef(null);
  const rdvTabRef = useRef(null);
  const relanceDropdownRef = useRef(null);
  const rdvDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        relanceDropdownRef.current &&
        relanceTabRef.current &&
        !relanceDropdownRef.current.contains(event.target) &&
        !relanceTabRef.current.contains(event.target)
      ) {
        setDropdownState((prev) => ({
          ...prev,
          relance: false,
        }));
      }
      
      if (
        rdvDropdownRef.current &&
        rdvTabRef.current &&
        !rdvDropdownRef.current.contains(event.target) &&
        !rdvTabRef.current.contains(event.target)
      ) {
        setDropdownState((prev) => ({
          ...prev,
          rdv: false,
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'relance') {
      setDropdownState((prev) => ({
        ...prev,
        relance: !prev.relance,
        rdv: false,
      }));
    } else if (tab === 'rdv') {
      setDropdownState((prev) => ({
        ...prev,
        rdv: !prev.rdv,
        relance: false,
      }));
    } else {
      setDropdownState({
        relance: false,
        rdv: false,
      });
      onTabChange(tab);
    }
  };

  const handleSubTabSelect = (parentTab, subTab, label) => {
    onTabChange(parentTab);
    onSubTabChange(parentTab, subTab);
    setDisplayedLabels((prev) => ({
      ...prev,
      [parentTab]: label,
    }));
    setDropdownState((prev) => ({
      ...prev,
      [parentTab]: false,
    }));
  };

  // Get the appropriate notification count for displayed labels
  const getDisplayedNotificationCount = (tabId) => {
    if (tabId === 'relance' && activeTab === 'relance') {
      if (displayedLabels.relance === 'Appels Relances') {
        return notifications['appels-relance'];
      } else if (displayedLabels.relance === 'Visites Relances') {
        return notifications['visites-relance'];
      }
    } else if (tabId === 'rdv' && activeTab === 'rdv') {
      if (displayedLabels.rdv === 'Appels RDV') {
        return notifications['appels-rdv'];
      } else if (displayedLabels.rdv === 'Visites RDV') {
        return notifications['visites-rdv'];
      }
    }
    
    // Return total count for non-active tabs or default labels
    return notifications[tabId];
  };

  // Define all tabs
  const tabs = [
    { id: 'prospects', label: 'Prospects', icon: 'user' },
    { id: 'visites', label: 'Visites', icon: 'walk' },
    { id: 'appels', label: 'Appels', icon: 'phone' },
    { id: 'pre-reservation', label: 'Pré-réservations', icon: 'home' },
    { 
      id: 'relance', 
      label: displayedLabels.relance, 
      icon: 'clock', 
      dropdown: true, 
      count: getDisplayedNotificationCount('relance') 
    },
    { 
      id: 'rdv', 
      label: displayedLabels.rdv, 
      icon: 'calendar', 
      dropdown: true, 
      count: getDisplayedNotificationCount('rdv') 
    },
    { id: 'freins', label: 'Freins', icon: 'alert', count: notifications.freins },
  ];

  return (
    <div className="bg-white border-b border-gray-200 w-full">
      {/* Use grid with 7 equal columns for 7 tabs */}
      <div className="grid grid-cols-7 w-full">
        {tabs.map((tab) => (
          tab.dropdown ? (
            <div key={tab.id} className="relative">
              <TabButton
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
                count={tab.count}
                onClick={() => handleTabClick(tab.id)}
                dropdown={true}
                expanded={dropdownState[tab.id]}
                ref={tab.id === 'relance' ? relanceTabRef : rdvTabRef}
              />
              {dropdownState[tab.id] && (
                <div
                  ref={tab.id === 'relance' ? relanceDropdownRef : rdvDropdownRef}
                  className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md border border-gray-200 z-10 overflow-hidden"
                >
                  {tab.id === 'relance' ? (
                    <>
                      <DropdownItem
                        label="Appels Relances"
                        count={notifications['appels-relance']}
                        active={
                          activeTab === 'relance' &&
                          activeSubTab.relance === 'appels-relance'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'relance',
                            'appels-relance',
                            'Appels Relances',
                          )
                        }
                      />
                      <DropdownItem
                        label="Visites Relances"
                        count={notifications['visites-relance']}
                        active={
                          activeTab === 'relance' &&
                          activeSubTab.relance === 'visites-relance'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'relance',
                            'visites-relance',
                            'Visites Relances',
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <DropdownItem
                        label="Appels RDV"
                        count={notifications['appels-rdv']}
                        active={activeTab === 'rdv' && activeSubTab.rdv === 'appels-rdv'}
                        onClick={() =>
                          handleSubTabSelect('rdv', 'appels-rdv', 'Appels RDV')
                        }
                      />
                      <DropdownItem
                        label="Visites RDV"
                        count={notifications['visites-rdv']}
                        active={
                          activeTab === 'rdv' && activeSubTab.rdv === 'visites-rdv'
                        }
                        onClick={() =>
                          handleSubTabSelect('rdv', 'visites-rdv', 'Visites RDV')
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              count={tab.count}
              onClick={() => handleTabClick(tab.id)}
            />
          )
        ))}
      </div>
    </div>
  );
};

const TabButton = forwardRef(({ 
  label, 
  icon, 
  active, 
  onClick, 
  dropdown, 
  expanded,
  count
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center justify-center px-2 py-4 text-sm font-medium border-b-2 transition-colors duration-200 relative w-full ${
        active 
          ? 'border-emerald-500 text-emerald-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-center flex-col sm:flex-row gap-1 sm:gap-2">
        {getIcon(icon)}
        <span className="whitespace-nowrap text-xs sm:text-sm">{label}</span>
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        {dropdown && (
          <ChevronDown 
            size={14} 
            className={`transform transition-transform ${
              expanded ? 'rotate-180' : ''
            }`} 
          />
        )}
      </div>
    </button>
  );
});

const DropdownItem = ({ label, active, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
        active ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {count > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

export { TabsNavigation };