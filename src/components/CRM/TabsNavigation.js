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
  Menu,
  X,
} from 'lucide-react';
import { isCommercial } from '@/configs/enum';
import Modal from '@/components/Modal';

const getIcon = (type) => {
  const iconProps = { size: 20 }; // Slightly larger icons for mobile

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

// Desktop Tab Button
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

TabButton.displayName = 'TabButton';

// Mobile Menu Item
// Mobile Menu Item - Version corrigée avec compteurs individuels
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
      if (tab.parentId === 'relance') {
        return activeTab === 'relance' && activeSubTab.relance === tab.id;
      }
      if (tab.parentId === 'rdv') {
        return activeTab === 'rdv' && activeSubTab.rdv === tab.id;
      }
      if (tab.parentId === 'prospects') {
        return activeTab === 'prospects' && activeSubTab.prospects === tab.id;
      }
    }
    return activeTab === tab.id;
  };

  const handleClick = () => {
    if (hasChildren) {
      onToggle(tab.id);
    } else if (tab.parentId) {
      onSubTabSelect(tab.parentId, tab.id, tab.label);
    } else {
      onPress(tab);
    }
  };

  // Obtenir le compteur spécifique à cet item
  const getItemCount = () => {
    // Si c'est un sous-menu avec un ID spécifique, utiliser le compteur correspondant
    if (tab.id === 'appels-relance') return notifications['appels-relance'] || 0;
    if (tab.id === 'visites-relance') return notifications['visites-relance'] || 0;
    if (tab.id === 'appels-rdv') return notifications['appels-rdv'] || 0;
    if (tab.id === 'visites-rdv') return notifications['visites-rdv'] || 0;
    if (tab.id === 'mes-prospects') return notifications['mes-prospects'] || 0;
    if (tab.id === 'tous-prospects') return notifications['tous-prospects'] || 0;
    
    // Pour les items principaux, utiliser leur count direct
    return tab.count || 0;
  };

  const count = getItemCount();

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={handleClick}
        className={`flex items-center justify-between w-full px-4 py-4 text-left transition-colors ${
          isActive() && !hasChildren ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
        } ${level > 0 ? 'pl-8' : ''}`}
      >
        <div className="flex items-center gap-3">
          {getIcon(tab.icon)}
          <span className="font-medium">{tab.label}</span>
          {count > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
              {count > 99 ? '99+' : count}
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
          {tab.id === 'relance' && (
            <>
              <MobileMenuItem
                tab={{
                  id: 'appels-relance',
                  label: 'Appels Relances',
                  icon: 'phone',
                  parentId: 'relance'
                }}
                active={activeTab === 'relance' && activeSubTab.relance === 'appels-relance'}
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
                  id: 'visites-relance',
                  label: 'Visites Relances',
                  icon: 'walk',
                  parentId: 'relance'
                }}
                active={activeTab === 'relance' && activeSubTab.relance === 'visites-relance'}
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
          {tab.id === 'rdv' && (
            <>
              <MobileMenuItem
                tab={{
                  id: 'appels-rdv',
                  label: 'Appels RDV',
                  icon: 'phone',
                  parentId: 'rdv'
                }}
                active={activeTab === 'rdv' && activeSubTab.rdv === 'appels-rdv'}
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
                  id: 'visites-rdv',
                  label: 'Visites RDV',
                  icon: 'walk',
                  parentId: 'rdv'
                }}
                active={activeTab === 'rdv' && activeSubTab.rdv === 'visites-rdv'}
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
          {tab.id === 'prospects' && isCommercial(userRole) && (
            <>
              <MobileMenuItem
                tab={{
                  id: 'mes-prospects',
                  label: 'Mes Prospects',
                  icon: 'user',
                  parentId: 'prospects'
                }}
                active={activeTab === 'prospects' && activeSubTab.prospects === 'mes-prospects'}
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
                  id: 'tous-prospects',
                  label: 'Tous Prospects',
                  icon: 'user',
                  parentId: 'prospects'
                }}
                active={activeTab === 'prospects' && activeSubTab.prospects === 'tous-prospects'}
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

// Dropdown Item Component
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
  userRole,
}) => {
  const [dropdownState, setDropdownState] = useState({
    relance: false,
    rdv: false,
    prospects: false,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});

  const [displayedLabels, setDisplayedLabels] = useState({
    relance: 'Relances',
    rdv: 'RDV',
    prospects: 'Prospects',
  });

  // Refs for desktop dropdowns
  const relanceTabRef = useRef(null);
  const rdvTabRef = useRef(null);
  const relanceDropdownRef = useRef(null);
  const rdvDropdownRef = useRef(null);
  const prospectsTabRef = useRef(null);
  const prospectsDropdownRef = useRef(null);

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

  // Update displayed labels based on active sub-tabs
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

  // Handle click outside for desktop dropdowns
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
      closeMobileMenu();
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
    closeMobileMenu();
  };

  // Mobile handlers
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileExpanded({}); // Reset expanded state when closing/opening menu
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpanded({});
  };

  const handleMobileTabPress = (tab) => {
    if (tab.dropdown) {
      // For tabs with dropdown, we'll handle through the MobileMenuItem
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
    return notifications[tabId];
  };

  // Define all tabs
  const tabs = [
    {
      id: 'prospects',
      label: displayedLabels.prospects,
      icon: 'user',
      dropdown: isCommercial(userRole),
      count: getDisplayedNotificationCount('prospects'),
    },
    { id: 'visites', label: 'Visites', icon: 'walk', count: notifications.visites },
    { id: 'appels', label: 'Appels', icon: 'phone', count: notifications.appels },
    { id: 'pre-reservation', label: 'Pré-réservations', icon: 'home', count: notifications['pre-reservation'] },
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
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200 w-full">
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

      {/* Mobile Navigation - Visible only on mobile */}

      {/* Mobile Navigation - Visible only on mobile */}

{/* Mobile Navigation - Visible only on mobile */}
<div className="md:hidden bg-white border-b border-gray-200">
  {/* Mobile Header with current tab info and menu button */}
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-2">
      {getIcon(tabs.find(t => t.id === activeTab)?.icon || 'user')}
      <span className="font-medium text-gray-900">
        {tabs.find(t => t.id === activeTab)?.label || 'Tableau de bord'}
      </span>
      {/* Afficher le compteur spécifique au sous-menu actif */}
      {activeTab === 'relance' && activeSubTab.relance === 'appels-relance' && notifications['appels-relance'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['appels-relance']}
        </span>
      )}
      {activeTab === 'relance' && activeSubTab.relance === 'visites-relance' && notifications['visites-relance'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['visites-relance']}
        </span>
      )}
      {activeTab === 'rdv' && activeSubTab.rdv === 'appels-rdv' && notifications['appels-rdv'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['appels-rdv']}
        </span>
      )}
      {activeTab === 'rdv' && activeSubTab.rdv === 'visites-rdv' && notifications['visites-rdv'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['visites-rdv']}
        </span>
      )}
      {activeTab === 'prospects' && activeSubTab.prospects === 'mes-prospects' && notifications['mes-prospects'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['mes-prospects']}
        </span>
      )}
      {activeTab === 'prospects' && activeSubTab.prospects === 'tous-prospects' && notifications['tous-prospects'] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications['tous-prospects']}
        </span>
      )}
      {/* Pour les tabs sans sous-menus, afficher leur compteur normal */}
      {!['relance', 'rdv', 'prospects'].includes(activeTab) && notifications[activeTab] > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {notifications[activeTab]}
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

  {/* Mobile Menu avec Modal */}
  <Modal 
    isVisible={mobileMenuOpen} 
    onClose={closeMobileMenu}
    maxWidth="max-w-full"
  >
    {/* Header du modal avec titre et bouton fermer */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900">Menu</h3>
      <button 
        onClick={closeMobileMenu}
        className="p-1 hover:bg-gray-100 rounded-lg"
      >
        <X size={20} />
      </button>
    </div>
    
    {/* Menu Items */}
    <div className="max-h-[70vh] overflow-y-auto">
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
  </Modal>
</div>

      {/* Ajoutez ces styles à la fin de votre composant ou dans votre fichier CSS global */}
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

export { TabsNavigation };