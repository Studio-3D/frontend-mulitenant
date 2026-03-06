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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const getIcon = (type, size = 20) => {
  const iconProps = { size };
  
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

// Desktop Tab Button
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
        {getIcon(icon, 16)}
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

// Desktop Dropdown Item
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

// Mobile Menu Item
const MobileMenuItem = ({ 
  tab, 
  active, 
  onPress, 
  level = 0,
  hasChildren,
  expanded,
  onToggle,
  notifications,
  activeTab,
  activeSubTab,
  userRole,
  onSubTabSelect
}) => {
  const isActive = () => {
    if (tab.parentId) {
      if (tab.parentId === 'validation') {
        return activeTab === 'validation' && activeSubTab.validation === tab.id;
      }
      if (tab.parentId === 'rejet') {
        return activeTab === 'rejet' && activeSubTab.rejet === tab.id;
      }
      if (tab.parentId === 'remboursements') {
        return activeTab === 'remboursements' && activeSubTab.remboursements === tab.id;
      }
    }
    return activeTab === tab.id;
  };

  const handleClick = () => {
    if (hasChildren) {
      onToggle(tab.id);
    } else if (tab.parentId) {
      let label = tab.label;
      onSubTabSelect(tab.parentId, tab.id, label);
    } else {
      onPress(tab);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={handleClick}
        className={`flex items-center justify-between w-full px-4 py-4 text-left transition-colors ${
          isActive() && !hasChildren ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
        } ${level > 0 ? 'pl-8' : ''}`}
      >
        <div className="flex items-center gap-3">
          {getIcon(tab.icon, 20)}
          <span className="font-medium">{tab.label}</span>
          {tab.count > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
              {tab.count > 99 ? '99+' : tab.count}
            </span>
          )}
        </div>
        {hasChildren && (
          <ChevronDown
            size={18}
            className={`transform transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      
      {/* Submenu items */}
      {hasChildren && expanded && (
        <div className="bg-gray-50">
          {tab.id === 'validation' && (
            <>
              {userRole <= 3 && (
                <MobileMenuItem
                  tab={{
                    id: 'desistements-attente-encours',
                    label: 'Désistements',
                    icon: 'repeat',
                    count: notifications['desistements-attente-encours'],
                    parentId: 'validation'
                  }}
                  active={activeTab === 'validation' && activeSubTab.validation === 'desistements-attente-encours'}
                  onPress={onPress}
                  onSubTabSelect={onSubTabSelect}
                  level={1}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                />
              )}
              <MobileMenuItem
                tab={{
                  id: 'penalites-validation',
                  label: 'Pénalités',
                  icon: 'euro',
                  count: notifications['penalites-validation'],
                  parentId: 'validation'
                }}
                active={activeTab === 'validation' && activeSubTab.validation === 'penalites-validation'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
              {userRole <= 3 && (
                <MobileMenuItem
                  tab={{
                    id: 'reservations-validation',
                    label: 'Réservations',
                    icon: 'user',
                    count: notifications['reservations-validation'],
                    parentId: 'validation'
                  }}
                  active={activeTab === 'validation' && activeSubTab.validation === 'reservations-validation'}
                  onPress={onPress}
                  onSubTabSelect={onSubTabSelect}
                  level={1}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                />
              )}
              <MobileMenuItem
                tab={{
                  id: 'avances-validation',
                  label: 'Avances',
                  icon: 'euro',
                  count: notifications['avances-validation'],
                  parentId: 'validation'
                }}
                active={activeTab === 'validation' && activeSubTab.validation === 'avances-validation'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
            </>
          )}
          {tab.id === 'rejet' && (
            <>
              {userRole <= 3 && (
                <MobileMenuItem
                  tab={{
                    id: 'desistements-rejet',
                    label: 'Désistements',
                    icon: 'repeat',
                    count: notifications['desistements-rejet'],
                    parentId: 'rejet'
                  }}
                  active={activeTab === 'rejet' && activeSubTab.rejet === 'desistements-rejet'}
                  onPress={onPress}
                  onSubTabSelect={onSubTabSelect}
                  level={1}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                />
              )}
              <MobileMenuItem
                tab={{
                  id: 'penalites-rejet',
                  label: 'Pénalités',
                  icon: 'euro',
                  count: notifications['penalites-rejet'],
                  parentId: 'rejet'
                }}
                active={activeTab === 'rejet' && activeSubTab.rejet === 'penalites-rejet'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
              {userRole <= 3 && (
                <MobileMenuItem
                  tab={{
                    id: 'reservations-rejet',
                    label: 'Réservations',
                    icon: 'user',
                    count: notifications['reservations-rejet'],
                    parentId: 'rejet'
                  }}
                  active={activeTab === 'rejet' && activeSubTab.rejet === 'reservations-rejet'}
                  onPress={onPress}
                  onSubTabSelect={onSubTabSelect}
                  level={1}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                />
              )}
              <MobileMenuItem
                tab={{
                  id: 'avances-rejet',
                  label: 'Avances',
                  icon: 'euro',
                  count: notifications['avances-rejet'],
                  parentId: 'rejet'
                }}
                active={activeTab === 'rejet' && activeSubTab.rejet === 'avances-rejet'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
            </>
          )}
          {tab.id === 'remboursements' && (
            <>
              <MobileMenuItem
                tab={{
                  id: 'apres-ventes',
                  label: 'Aprés Vente',
                  icon: 'handshake',
                  count: notifications['apres-ventes'],
                  parentId: 'remboursements'
                }}
                active={activeTab === 'remboursements' && activeSubTab.remboursements === 'apres-ventes'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
              <MobileMenuItem
                tab={{
                  id: 'att-accuse-cheque',
                  label: 'Attente Accusé',
                  icon: 'clock',
                  count: notifications['att-accuse-cheque'],
                  parentId: 'remboursements'
                }}
                active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-accuse-cheque'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
              {(userRole <= 2 || userRole === 7) ? (
                <>
                  <MobileMenuItem
                    tab={{
                      id: 'att-decaissement',
                      label: 'Attente Décaissement',
                      icon: 'clock',
                      count: notifications['att-decaissement'],
                      parentId: 'remboursements'
                    }}
                    active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-decaissement'}
                    onPress={onPress}
                    onSubTabSelect={onSubTabSelect}
                    level={1}
                    notifications={notifications}
                    activeTab={activeTab}
                    activeSubTab={activeSubTab}
                    userRole={userRole}
                  />
                  <MobileMenuItem
                    tab={{
                      id: 'accuses',
                      label: 'Liste des Accusés',
                      icon: 'users',
                      count: notifications['accuses'],
                      parentId: 'remboursements'
                    }}
                    active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses'}
                    onPress={onPress}
                    onSubTabSelect={onSubTabSelect}
                    level={1}
                    notifications={notifications}
                    activeTab={activeTab}
                    activeSubTab={activeSubTab}
                    userRole={userRole}
                  />
                </>
              ) : (
                <MobileMenuItem
                  tab={{
                    id: 'accuses-cheque-traite',
                    label: 'Accusé Traité',
                    icon: 'check',
                    count: notifications['accuses-cheque-traite'],
                    parentId: 'remboursements'
                  }}
                  active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses-cheque-traite'}
                  onPress={onPress}
                  onSubTabSelect={onSubTabSelect}
                  level={1}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                />
              )}
              <MobileMenuItem
                tab={{
                  id: 'dossiers-transferes',
                  label: 'Dossiers Transférés',
                  icon: 'users',
                  count: notifications['dossiers-transferes'],
                  parentId: 'remboursements'
                }}
                active={activeTab === 'remboursements' && activeSubTab.remboursements === 'dossiers-transferes'}
                onPress={onPress}
                onSubTabSelect={onSubTabSelect}
                level={1}
                notifications={notifications}
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userRole={userRole}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

MobileMenuItem.displayName = 'MobileMenuItem';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  
  const [displayedLabels, setDisplayedLabels] = useState({
    validation: (userRole <= 2 || userRole == 7) ? 'Validation' : 'En cours',
    rejet: 'Rejet',
    remboursements: 'Remboursements',
  });

  // Refs for desktop dropdowns
  const validationTabRef = useRef(null);
  const rejetTabRef = useRef(null);
  const remboursementsTabRef = useRef(null);
  const validationDropdownRef = useRef(null);
  const rejetDropdownRef = useRef(null);
  const remboursementsDropdownRef = useRef(null);

  // Reset to default labels when switching to different tabs
  useEffect(() => {
    if (activeTab !== 'validation') {
      setDisplayedLabels(prev => ({
        ...prev,
        validation: (userRole <= 2 || userRole == 7) ? 'Validation' : 'En cours',
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

  // Update displayed labels based on active sub-tabs
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

  // Handle click outside for desktop dropdowns
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
      closeMobileMenu();
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
    closeMobileMenu();
  };

  // Mobile handlers
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileExpanded({});
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpanded({});
  };

  const handleMobileTabPress = (tab) => {
    if (tab.dropdown) {
      return;
    }
    onTabChange(tab.id);
    closeMobileMenu();
  };

  const toggleMobileExpand = (tabId) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  // Get notification count for displayed labels
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
    return notifications[tabId];
  };

  // Define all tabs
  const tabs = [
    { id: 'reservations', label: 'Reservations', icon: 'user', count: notifications.reservations },
    { id: 'clients', label: 'Clients', icon: 'users', count: notifications.clients },
    ...(userRole <= 3 ? [{ id: 'desistements', label: 'Désistements', icon: 'repeat', count: notifications.desistements }] : []),
    { id: 'penalites', label: 'Penalités', icon: 'euro', count: notifications.penalites },
    { 
      id: 'remboursements', 
      label: displayedLabels.remboursements, 
      icon: 'handshake', 
      dropdown: true, 
      count: getDisplayedNotificationCount('remboursements'),
    },
    { 
      id: 'validation', 
      label: displayedLabels.validation, 
      icon: 'check', 
      dropdown: true, 
      count: getDisplayedNotificationCount('validation'),
    },
    { 
      id: 'rejet', 
      label: displayedLabels.rejet, 
      icon: 'circle-x', 
      dropdown: true, 
      count: getDisplayedNotificationCount('rejet'),
    },
    { 
      id: 'echeances', 
      label: 'Echéances', 
      icon: 'clock', 
      count: notifications.echeances,
    },
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200 w-full">
        <div className="grid grid-cols-8 w-full">
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
                            active={activeTab === 'validation' && activeSubTab.validation === 'desistements-attente-encours'}
                            onClick={() => handleSubTabSelect('validation', 'desistements-attente-encours', 'Désistements')}
                          />
                        )}
                        <DropdownItem
                          label="Pénalités"
                          count={notifications['penalites-validation']}
                          active={activeTab === 'validation' && activeSubTab.validation === 'penalites-validation'}
                          onClick={() => handleSubTabSelect('validation', 'penalites-validation', 'Pénalités')}
                        />
                        {userRole <= 3 && (
                          <DropdownItem
                            label="Réservations"
                            count={notifications['reservations-validation']}
                            active={activeTab === 'validation' && activeSubTab.validation === 'reservations-validation'}
                            onClick={() => handleSubTabSelect('validation', 'reservations-validation', 'Réservations')}
                          />
                        )}
                        <DropdownItem
                          label="Avances"
                          count={notifications['avances-validation']}
                          active={activeTab === 'validation' && activeSubTab.validation === 'avances-validation'}
                          onClick={() => handleSubTabSelect('validation', 'avances-validation', 'Avances')}
                        />
                      </>
                    ) : tab.id === 'rejet' ? (
                      <>
                        {userRole <= 3 && (
                          <DropdownItem
                            label="Désistements"
                            count={notifications['desistements-rejet']}
                            active={activeTab === 'rejet' && activeSubTab.rejet === 'desistements-rejet'}
                            onClick={() => handleSubTabSelect('rejet', 'desistements-rejet', 'Désistements')}
                          />
                        )}
                        <DropdownItem
                          label="Pénalités"
                          count={notifications['penalites-rejet']}
                          active={activeTab === 'rejet' && activeSubTab.rejet === 'penalites-rejet'}
                          onClick={() => handleSubTabSelect('rejet', 'penalites-rejet', 'Pénalités')}
                        />
                        {userRole <= 3 && (
                          <DropdownItem
                            label="Réservations"
                            count={notifications['reservations-rejet']}
                            active={activeTab === 'rejet' && activeSubTab.rejet === 'reservations-rejet'}
                            onClick={() => handleSubTabSelect('rejet', 'reservations-rejet', 'Réservations')}
                          />
                        )}
                        <DropdownItem
                          label="Avances"
                          count={notifications['avances-rejet']}
                          active={activeTab === 'rejet' && activeSubTab.rejet === 'avances-rejet'}
                          onClick={() => handleSubTabSelect('rejet', 'avances-rejet', 'Avances')}
                        />
                      </>
                    ) : (
                      // Remboursements dropdown
                      <>
                        <DropdownItem
                          label="Aprés Vente"
                          count={notifications['apres-ventes']}
                          active={activeTab === 'remboursements' && activeSubTab.remboursements === 'apres-ventes'}
                          onClick={() => handleSubTabSelect('remboursements', 'apres-ventes', 'Aprés Vente')}
                        />
                        <DropdownItem
                          label="Attente Accusé"
                          count={notifications['att-accuse-cheque']}
                          active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-accuse-cheque'}
                          onClick={() => handleSubTabSelect('remboursements', 'att-accuse-cheque', 'Attente Accusé')}
                        />
                        {(userRole <= 2 || userRole === 7) ? (
                          <>
                            <DropdownItem
                              label="Attente Décaissement"
                              count={notifications['att-decaissement']}
                              active={activeTab === 'remboursements' && activeSubTab.remboursements === 'att-decaissement'}
                              onClick={() => handleSubTabSelect('remboursements', 'att-decaissement', 'Attente Décaissement')}
                            />
                            <DropdownItem
                              label="Liste des Accusés"
                              count={notifications['accuses']}
                              active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses'}
                              onClick={() => handleSubTabSelect('remboursements', 'accuses', 'Liste des Accusés')}
                            />
                          </>
                        ) : (
                          <DropdownItem
                            label="Accusé Traité"
                            count={notifications['accuses-cheque-traite']}
                            active={activeTab === 'remboursements' && activeSubTab.remboursements === 'accuses-cheque-traite'}
                            onClick={() => handleSubTabSelect('remboursements', 'accuses-cheque-traite', 'Accusé Traité')}
                          />
                        )}
                        <DropdownItem
                          label="Dossiers Transférés"
                          count={notifications['dossiers-transferes']}
                          active={activeTab === 'remboursements' && activeSubTab.remboursements === 'dossiers-transferes'}
                          onClick={() => handleSubTabSelect('remboursements', 'dossiers-transferes', 'Dossiers Transférés')}
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

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {getIcon(tabs.find(t => t.id === activeTab)?.icon || 'user', 20)}
            <span className="font-medium text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label || 'Tableau de bord'}
            </span>
            {notifications[activeTab] > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {notifications[activeTab] > 99 ? '99+' : notifications[activeTab]}
              </span>
            )}
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMobileMenu}
            />
            
            {/* Menu Panel - Positioned at the top */}
            <div className="fixed left-0 right-0 top-[57px] bg-white shadow-lg z-50 max-h-[calc(100vh-57px)] overflow-y-auto border-t border-gray-200 animate-slide-down">
              {tabs.map((tab) => (
                <MobileMenuItem
                  key={tab.id}
                  tab={tab}
                  active={activeTab === tab.id}
                  onPress={handleMobileTabPress}
                  hasChildren={tab.dropdown}
                  expanded={mobileExpanded[tab.id]}
                  onToggle={toggleMobileExpand}
                  notifications={notifications}
                  activeTab={activeTab}
                  activeSubTab={activeSubTab}
                  userRole={userRole}
                  onSubTabSelect={handleSubTabSelect}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export { VenteTabsNavigation };