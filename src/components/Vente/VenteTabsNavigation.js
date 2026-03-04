import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { 
  User, 
  Users, 
  Repeat, 
  Euro, 
  Handshake, 
  Check, 
  CircleX, 
  Clock,
  ChevronDown
} from 'lucide-react';

const getIcon = (type) => {
  const iconProps = { size: 16 };
  
  switch (type) {
    case 'user':
      return <User {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'repeat':
      return <Repeat {...iconProps} />;
    case 'euro':
      return <Euro {...iconProps} />;
    case 'handshake':
      return <Handshake {...iconProps} />;
    case 'check':
      return <Check {...iconProps} />;
    case 'circle-x':
      return <CircleX {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    default:
      return null;
  }
};

const VenteTabsNavigation = ({
  activeTab,
  activeSubTab,
  notifications,
  onTabChange,
  onSubTabChange,
  userRole,
}) => {
  const [dropdownState, setDropdownState] = useState({
    validation: false,
    rejet: false,
    remboursements: false,
  });
  
  const [displayedLabels, setDisplayedLabels] = useState({
    validation: (userRole <= 2 || userRole ==7 )? 'Validation' : 'En cours',
    rejet: 'Rejet',
    remboursements: 'Remboursements',
  });

  // Reset to default labels when switching to different tabs
  useEffect(() => {
    if (activeTab !== 'validation') {
      setDisplayedLabels(prev => ({
        ...prev,
        validation: (userRole <= 2 || userRole ==7 ) ? 'Validation' : 'En cours',
      }));
    }
    if (activeTab !== 'rejet') {
      setDisplayedLabels(prev => ({
        ...prev,
        rejet: 'Rejet',
      }));
    }
    if (activeTab !== 'remboursements') {
      setDisplayedLabels(prev => ({
        ...prev,
        remboursements: 'Remboursements',
      }));
    }
  }, [activeTab, userRole]);

  // Update displayed labels based on active sub-tabs only when the parent tab is active
  useEffect(() => {
    if (activeTab === 'validation') {
      const subTab = activeSubTab.validation;
      const labels = {
        'desistements-attente-encours': 'Désistements',
        'penalites-validation': 'Pénalités',
        'reservations-validation': 'Réservations',
        'avances-validation': 'Avances',
      };
      if (labels[subTab]) {
        setDisplayedLabels(prev => ({
          ...prev,
          validation: labels[subTab],
        }));
      }
    }
    if (activeTab === 'rejet') {
      const subTab = activeSubTab.rejet;
      const labels = {
        'desistements-rejet': 'Désistements',
        'penalites-rejet': 'Pénalités',
        'reservations-rejet': 'Réservations',
        'avances-rejet': 'Avances',
      };
      if (labels[subTab]) {
        setDisplayedLabels(prev => ({
          ...prev,
          rejet: labels[subTab],
        }));
      }
    }
    if (activeTab === 'remboursements') {
      const subTab = activeSubTab.remboursements;
      const labels = {
        'apres-ventes': 'Aprés Vente',
        'att-accuse-cheque': 'Attente Accusé',
        'att-decaissement': 'Attente Décaissement',
        'accuses': 'Liste des Accusés',
        'dossiers-transferes': 'Dossiers Transférés',
        'accuses-cheque-traite': 'Accusé Traité',
      };
      if (labels[subTab]) {
        setDisplayedLabels(prev => ({
          ...prev,
          remboursements: labels[subTab],
        }));
      }
    }
  }, [activeTab, activeSubTab, userRole]);

  const validationTabRef = useRef(null);
  const rejetTabRef = useRef(null);
  const remboursementsTabRef = useRef(null);
  const validationDropdownRef = useRef(null);
  const rejetDropdownRef = useRef(null);
  const remboursementsDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const checkOutside = (tabRef, dropdownRef, tabName) => {
        if (
          dropdownRef.current &&
          tabRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !tabRef.current.contains(event.target)
        ) {
          setDropdownState(prev => ({
            ...prev,
            [tabName]: false,
          }));
        }
      };

      checkOutside(validationTabRef, validationDropdownRef, 'validation');
      checkOutside(rejetTabRef, rejetDropdownRef, 'rejet');
      checkOutside(remboursementsTabRef, remboursementsDropdownRef, 'remboursements');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab) => {
    if (['validation', 'rejet', 'remboursements'].includes(tab)) {
      setDropdownState(prev => ({
        validation: tab === 'validation' ? !prev.validation : false,
        rejet: tab === 'rejet' ? !prev.rejet : false,
        remboursements: tab === 'remboursements' ? !prev.remboursements : false,
      }));
    } else {
      setDropdownState({
        validation: false,
        rejet: false,
        remboursements: false,
      });
      onTabChange(tab);
    }
  };

  const handleSubTabSelect = (parentTab, subTab, label) => {
    onTabChange(parentTab);
    onSubTabChange(parentTab, subTab);
    setDisplayedLabels(prev => ({
      ...prev,
      [parentTab]: label,
    }));
    setDropdownState(prev => ({
      ...prev,
      [parentTab]: false,
    }));
  };

  // Get the appropriate notification count for displayed labels
  const getDisplayedNotificationCount = (tabId) => {
    if (tabId === 'validation' && activeTab === 'validation') {
      const subTab = activeSubTab.validation;
      const countMap = {
        'desistements-attente-encours': notifications['desistements-attente-encours'],
        'penalites-validation': notifications['penalites-validation'],
        'reservations-validation': notifications['reservations-validation'],
        'avances-validation': notifications['avances-validation'],
      };
      return countMap[subTab] || notifications.validation;
    } 
    else if (tabId === 'rejet' && activeTab === 'rejet') {
      const subTab = activeSubTab.rejet;
      const countMap = {
        'desistements-rejet': notifications['desistements-rejet'],
        'penalites-rejet': notifications['penalites-rejet'],
        'reservations-rejet': notifications['reservations-rejet'],
        'avances-rejet': notifications['avances-rejet'],
      };
      return countMap[subTab] || notifications.rejet;
    }
    else if (tabId === 'remboursements' && activeTab === 'remboursements') {
      const subTab = activeSubTab.remboursements;
      const countMap = {
        'apres-ventes': notifications['apres-ventes'],
        'att-accuse-cheque': notifications['att-accuse-cheque'],
        'att-decaissement': notifications['att-decaissement'],
        'accuses': notifications['accuses'],
        'dossiers-transferes': notifications['dossiers-transferes'],
        'accuses-cheque-traite': notifications['accuses-cheque-traite'],
      };
      return countMap[subTab] || notifications.remboursements;
    }
    
    // Return total count for non-active tabs or default labels
    return notifications[tabId];
  };

  // Define all tabs - ONLY show counts on specific tabs
const tabs = [
  { id: 'reservations', label: 'Reservations', icon: 'user' },
  { id: 'clients', label: 'Clients', icon: 'users' },
  // Conditionally add desistements tab based on userRole
  ...(userRole <= 3 ? [{ id: 'desistements', label: 'Désistements', icon: 'repeat' }] : []),
  { id: 'penalites', label: 'Penalités', icon: 'euro' },
  { 
    id: 'remboursements', 
    label: displayedLabels.remboursements, 
    icon: 'handshake', 
    dropdown: true, 
    count: getDisplayedNotificationCount('remboursements'),
    showCount: true
  },
  { 
    id: 'validation', 
    label: displayedLabels.validation, 
    icon: 'check', 
    dropdown: true, 
    count: getDisplayedNotificationCount('validation'),
    showCount: true
  },
  { 
    id: 'rejet', 
    label: displayedLabels.rejet, 
    icon: 'circle-x', 
    dropdown: true, 
    count: getDisplayedNotificationCount('rejet'),
    showCount: true
  },
  { 
    id: 'echeances', 
    label: 'Echéances', 
    icon: 'clock', 
    count: notifications.echeances,
    showCount: false
  },
];

  return (
    <div className="bg-white border-b border-gray-200 w-full">
      {/* Use grid with 8 equal columns for 8 tabs */}
      <div className="grid grid-cols-8 w-full">
        {tabs.map((tab) => (
          tab.dropdown ? (
            <div key={tab.id} className="relative">
              <TabButton
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
                count={tab.showCount ? tab.count : undefined}
                onClick={() => handleTabClick(tab.id)}
                dropdown={true}
                expanded={dropdownState[tab.id]}
                ref={
                  tab.id === 'validation' ? validationTabRef :
                  tab.id === 'rejet' ? rejetTabRef :
                  tab.id === 'remboursements' ? remboursementsTabRef : null
                }
              />
              {dropdownState[tab.id] && (
                <div
                  ref={
                    tab.id === 'validation' ? validationDropdownRef :
                    tab.id === 'rejet' ? rejetDropdownRef :
                    tab.id === 'remboursements' ? remboursementsDropdownRef : null
                  }
                  className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md border border-gray-200 z-10 overflow-hidden"
                >
                  {tab.id === 'validation' ? (
                    <>
                      {userRole <= 3 && (
                        <DropdownItem
                        label="Désistements"
                        count={notifications['desistements-attente-encours']}
                        active={
                          activeTab === 'validation' &&
                          activeSubTab.validation === 'desistements-attente-encours'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'validation',
                            'desistements-attente-encours',
                            'Désistements',
                          )
                        }
                      />
                      )}
                      
                      <DropdownItem
                        label="Pénalités"
                        count={notifications['penalites-validation']}
                        active={
                          activeTab === 'validation' &&
                          activeSubTab.validation === 'penalites-validation'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'validation',
                            'penalites-validation',
                            'Pénalités',
                          )
                        }
                      />
                        {userRole <= 3  && (
                          <DropdownItem
                            label="Réservations"
                            count={notifications['reservations-validation']}
                            active={
                              activeTab === 'validation' &&
                              activeSubTab.validation === 'reservations-validation'
                            }
                            onClick={() =>
                              handleSubTabSelect(
                                'validation',
                                'reservations-validation',
                                'Réservations',
                              )
                            }
                          />)}
                      <DropdownItem
                        label="Avances"
                        count={notifications['avances-validation']}
                        active={
                          activeTab === 'validation' &&
                          activeSubTab.validation === 'avances-validation'
                        }
                        onClick={() =>
                          handleSubTabSelect(
                            'validation',
                            'avances-validation',
                            'Avances',
                          )
                        }
                      />
                    </>
                  ) : tab.id === 'rejet' ? (
                    <>
                      {userRole <= 3 && (
                        <DropdownItem
                          label="Désistements"
                          count={notifications['desistements-rejet']}
                          active={activeTab === 'rejet' && activeSubTab.rejet === 'desistements-rejet'}
                          onClick={() =>
                            handleSubTabSelect('rejet', 'desistements-rejet', 'Désistements')
                          }
                        />
                      )}
                      <DropdownItem
                        label="Pénalités"
                        count={notifications['penalites-rejet']}
                        active={activeTab === 'rejet' && activeSubTab.rejet === 'penalites-rejet'}
                        onClick={() =>
                          handleSubTabSelect('rejet', 'penalites-rejet', 'Pénalités')
                        }
                      />
                       {userRole <= 3  && (
                        <DropdownItem
                          label="Réservations"
                          count={notifications['reservations-rejet']}
                          active={activeTab === 'rejet' && activeSubTab.rejet === 'reservations-rejet'}
                          onClick={() =>
                            handleSubTabSelect('rejet', 'reservations-rejet', 'Réservations')
                          }
                        />
                        )}
                      <DropdownItem
                        label="Avances"
                        count={notifications['avances-rejet']}
                        active={activeTab === 'rejet' && activeSubTab.rejet === 'avances-rejet'}
                        onClick={() =>
                          handleSubTabSelect('rejet', 'avances-rejet', 'Avances')
                        }
                      />
                    </>
                  ) : (
                    // Remboursements dropdown
                    <>
                      <DropdownItem
                        label="Aprés Vente"
                        count={notifications['apres-ventes']}
                        active={activeTab === 'remboursements' && activeSubTab.remboursements === 'apres-ventes'}
                        onClick={() =>
                          handleSubTabSelect('remboursements', 'apres-ventes', 'Aprés Vente')
                        }
                      />
                      <DropdownItem
                        label="Attente Accusé"
                        count={notifications['att-accuse-cheque']}
                        active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-accuse-cheque'}
                        onClick={() =>
                          handleSubTabSelect('remboursements', 'att-accuse-cheque', 'Attente Accusé')
                        }
                      />
                      {(userRole <= 2 || userRole ===7 ) ? (
                        <>
                          <DropdownItem
                            label="Attente Décaissement"
                            count={notifications['att-decaissement']}
                            active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-decaissement'}
                            onClick={() =>
                              handleSubTabSelect('remboursements', 'att-decaissement', 'Attente Décaissement')
                            }
                          />
                          <DropdownItem
                            label="Liste des Accusés"
                            count={notifications['accuses']}
                            active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses'}
                            onClick={() =>
                              handleSubTabSelect('remboursements', 'accuses', 'Liste des Accusés')
                            }
                          />
                        </>
                      ) : (
                        <DropdownItem
                          label="Accusé Traité"
                          count={notifications['accuses-cheque-traite']}
                          active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses-cheque-traite'}
                          onClick={() =>
                            handleSubTabSelect('remboursements', 'accuses-cheque-traite', 'Accusé Traité')
                          }
                        />
                      )}
                      <DropdownItem
                        label="Dossiers Transférés"
                        count={notifications['dossiers-transferes']}
                        active={activeTab === 'remboursements' && activeSubTab.remboursements === 'dossiers-transferes'}
                        onClick={() =>
                          handleSubTabSelect('remboursements', 'dossiers-transferes', 'Dossiers Transférés')
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
              count={tab.showCount ? tab.count : undefined}
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
  dropdown = false, 
  expanded = false,
  count = 0,
  id
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
      aria-expanded={dropdown ? expanded : undefined}
      aria-haspopup={dropdown ? "true" : undefined}
      aria-controls={dropdown ? `${id}-dropdown` : undefined}
    >
      <div className="flex items-center justify-center flex-col sm:flex-row gap-1 sm:gap-2">
        {getIcon(icon)}
        <span className="whitespace-nowrap text-xs sm:text-sm">{label}</span>
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 h-4 flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
        {dropdown && (
          <ChevronDown 
            size={14} 
            className={`transform transition-transform ${
              expanded ? 'rotate-180' : ''
            }`} 
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
});

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

export { VenteTabsNavigation };