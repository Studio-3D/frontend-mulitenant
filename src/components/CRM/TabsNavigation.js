import React, { useEffect, useState, useRef, forwardRef } from 'react';
import {
  User,
  TrendingUp,
  Phone,
  Home,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { isCommercial } from '@/configs/enum';

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

// Define TabButton outside with proper forwardRef
const TabButton = forwardRef(
  ({ label, icon, active, onClick, dropdown, expanded, count }, ref) => {
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
  }
);

// Add displayName for better debugging
TabButton.displayName = 'TabButton';

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

const TabsNavigation = ({
  activeTab,
  activeSubTab,
  notifications,
  onTabChange,
  onSubTabChange,
  userRole, // Add userRole prop
}) => {
  const [dropdownState, setDropdownState] = useState({
    relance: false,
    rdv: false,
    prospects: false, // Add prospects dropdown state
  });

  const [displayedLabels, setDisplayedLabels] = useState({
    relance: 'Relances',
    rdv: 'RDV',
    prospects: 'Prospects', // Add prospects label
  });

  // Reset to default labels when switching to different tabs
  useEffect(() => {
    if (activeTab !== 'relance') {
      setDisplayedLabels((prev) => ({
        ...prev,
        relance: 'Relances',
      }));
    }
    if (activeTab !== 'rdv') {
      setDisplayedLabels((prev) => ({
        ...prev,
        rdv: 'RDV',
      }));
    }
    if (activeTab !== 'prospects') {
      setDisplayedLabels((prev) => ({
        ...prev,
        prospects: 'Prospects',
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
    if (activeTab === 'prospects' && isCommercial(userRole)) {
      if (activeSubTab.prospects === 'mes-prospects') {
        setDisplayedLabels((prev) => ({
          ...prev,
          prospects: 'Mes Prospects',
        }));
      } else if (activeSubTab.prospects === 'tous-prospects') {
        setDisplayedLabels((prev) => ({
          ...prev,
          prospects: 'Tous Prospects',
        }));
      }
    }
  }, [activeTab, activeSubTab, userRole]);

  const relanceTabRef = useRef(null);
  const rdvTabRef = useRef(null);
  const relanceDropdownRef = useRef(null);
  const rdvDropdownRef = useRef(null);
  const prospectsTabRef = useRef(null); // Add prospects ref

  const prospectsDropdownRef = useRef(null); // Add prospects dropdown ref

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
      if (
        prospectsDropdownRef.current &&
        prospectsTabRef.current &&
        !prospectsDropdownRef.current.contains(event.target) &&
        !prospectsTabRef.current.contains(event.target)
      ) {
        setDropdownState((prev) => ({
          ...prev,
          prospects: false,
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
        prospects: false,
      }));
    } else if (tab === 'rdv') {
      setDropdownState((prev) => ({
        ...prev,
        rdv: !prev.rdv,
        relance: false,
        prospects: false,
      }));
    } else if (tab === 'prospects' && isCommercial(userRole)) {
      setDropdownState((prev) => ({
        ...prev,
        prospects: !prev.prospects,
        relance: false,
        rdv: false,
      }));
    } else {
      setDropdownState({
        relance: false,
        rdv: false,
        prospects: false,
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
    } else if (
      tabId === 'prospects' &&
      activeTab === 'prospects' &&
      isCommercial(userRole)
    ) {
      if (displayedLabels.prospects === 'Mes Prospects') {
        return notifications['mes-prospects'];
      } else if (displayedLabels.prospects === 'Tous Prospects') {
        return notifications['tous-prospects'];
      }
    }

    // Return total count for non-active tabs or default labels
    return notifications[tabId];
  };

  // Define all tabs - conditionally show dropdown for prospects based on role
  // Ajoutez cette tab dans le tableau `tabs`
  const tabs = [
    {
      id: 'prospects',
      label: displayedLabels.prospects,
      icon: 'user',
      dropdown: isCommercial(userRole),
      count: getDisplayedNotificationCount('prospects'),
    },
    { id: 'visites', label: 'Visites', icon: 'walk' },
    { id: 'appels', label: 'Appels', icon: 'phone' },
    { id: 'pre-reservation', label: 'Pré-réservations', icon: 'home' },
    {
      id: 'relance',
      label: displayedLabels.relance,
      icon: 'clock',
      dropdown: true,
      count: getDisplayedNotificationCount('relance'),
    },
    {
      id: 'rdv',
      label: displayedLabels.rdv,
      icon: 'calendar',
      dropdown: true,
      count: getDisplayedNotificationCount('rdv'),
    },
    {
      id: 'freins',
      label: 'Freins',
      icon: 'alert',
      count: notifications.freins,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 w-full">
      {/* Use grid with 7 equal columns for 7 tabs */}
      <div className="grid grid-cols-7 w-full">
        {tabs.map((tab) =>
          tab.dropdown ? (
            <div key={tab.id} className="relative">
              <TabButton
                label={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
                count={tab.count}
                onClick={() => handleTabClick(tab.id)}
                dropdown={true}
                expanded={dropdownState[tab.id]}
                ref={
                  tab.id === 'relance'
                    ? relanceTabRef
                    : tab.id === 'rdv'
                    ? rdvTabRef
                    : prospectsTabRef
                }
              />
              {dropdownState[tab.id] && (
                <div
                  ref={
                    tab.id === 'relance'
                      ? relanceDropdownRef
                      : tab.id === 'rdv'
                      ? rdvDropdownRef
                      : prospectsDropdownRef
                  }
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
                            'Appels Relances'
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
                            'Visites Relances'
                          )
                        }
                      />
                    </>
                  ) : tab.id === 'rdv' ? (
                    <>
                      <DropdownItem
                        label="Appels RDV"
                        count={notifications['appels-rdv']}
                        active={
                          activeTab === 'rdv' &&
                          activeSubTab.rdv === 'appels-rdv'
                        }
                        onClick={() =>
                          handleSubTabSelect('rdv', 'appels-rdv', 'Appels RDV')
                        }
                      />
                      <DropdownItem
                        label="Visites RDV"
                        count={notifications['visites-rdv']}
                        active={
                          activeTab === 'rdv' &&
                          activeSubTab.rdv === 'visites-rdv'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'rdv',
                            'visites-rdv',
                            'Visites RDV'
                          )
                        }
                      />
                    </>
                  ) : (
                    // Prospects dropdown for commercial users
                    <>
                      <DropdownItem
                        label="Mes Prospects"
                        count={notifications['mes-prospects']}
                        active={
                          activeTab === 'prospects' &&
                          activeSubTab.prospects === 'mes-prospects'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'prospects',
                            'mes-prospects',
                            'Mes Prospects'
                          )
                        }
                      />
                      <DropdownItem
                        label="Tous Prospects"
                        count={notifications['tous-prospects']}
                        active={
                          activeTab === 'prospects' &&
                          activeSubTab.prospects === 'tous-prospects'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'prospects',
                            'tous-prospects',
                            'Tous Prospects'
                          )
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
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              count={tab.count}
              onClick={() => handleTabClick(tab.id)}
            />
          )
        )}
      </div>
    </div>
  );
};

export { TabsNavigation };
