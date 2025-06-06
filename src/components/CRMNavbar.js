'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  Phone,
  Home,
  Clock,
  Users,
  Menu,
  Pause,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Pusher from 'pusher-js';
import FetchNotifMenu from '../../src/configs/FetchNotifMenu';

const CRMNavbar = () => {
  const router = useRouter();
  const pusher_key_NotifMenu =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF_MENU;

  const pathname = usePathname();
  const projetId = JSON.parse(localStorage.getItem('selectedProjet'))
    ? JSON.parse(localStorage.getItem('selectedProjet')).id
    : 1;
  const [nb_relances_appels, setnb_rel_appel] = useState(0);
  const [nb_rdv_appel, setnb_rdv_appel] = useState(0);
  const [nb_relance_visite, setnb_rel_visite] = useState(0);
  const [nb_rdv_visite, setnb_rdv_visite] = useState(0);
  const [nb_rel_client_freins, set_nb_rel_client_freins] = useState(0);
  const [param, setParam] = useState('D');
  const [param_2, setParam_2] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navRef = useRef(null);

  const nb_total_relances =
    Number(nb_relance_visite) + Number(nb_relances_appels);
  const nb_total_rdv = Number(nb_rdv_appel) + Number(nb_rdv_visite);

  const fetchDataNotiMon = async (nb) => {
    if (param_2 == 0) {
      await FetchNotifMenu(
        nb,
        projetId,
        setnb_rel_appel,
        setnb_rdv_appel,
        setnb_rel_visite,
        setnb_rdv_visite,
        set_nb_rel_client_freins
      );
    }
  };

  useEffect(() => {
    pusher_function();
    if (param == 'D') {
      fetchDataNotiMon('D');
    }
  }, [param]);

  const pusher_function = async () => {
    const pusher = new Pusher(`${pusher_key_NotifMenu}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('NotifMenu');

    channel.bind('App\\Events\\NotifMenuEvent', (data) => {
      fetchDataNotiMon(data.NotifMenuId);
      setParam(data.NotifMenuId);
      setParam_2(1);
    });

    return () => {
      channel.unbind('App\\Events\\NotifMenuEvent');
      pusher.unsubscribe('NotifMenu');
    };
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const navItems = [
    {
      name: 'Prospects',
      path: '/crm/prospects',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'Visites',
      path: '/crm/visites',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'Appels',
      path: '/crm/appels',
      icon: <Phone className="w-5 h-5" />,
    },
    {
      name: 'Pré-réservations',
      path: '/crm/pre-reservations',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Relances',
      icon: <Clock className="w-5 h-5" />,
      badge: nb_total_relances,
      subItems: [
        {
          name: 'Appels Relances',
          path: '/crm/appels/relances',
          badge: nb_relances_appels,
        },
        {
          name: 'Visites Relances',
          path: '/crm/visites/relances',
          badge: nb_relance_visite,
        },
      ],
    },
    {
      name: 'RDV',
      icon: <Calendar className="w-5 h-5" />,
      badge: nb_total_rdv,
      subItems: [
        {
          name: 'Appels RDV',
          path: '/crm/appels/rdv',
          badge: nb_rdv_appel,
        },
        {
          name: 'Visites RDV',
          path: '/crm/visites/rdv',
          badge: nb_rdv_visite,
        },
      ],
    },
    {
      name: 'Freins',
      path: '/crm/visites/freins',
      icon: <Pause className="w-5 h-5" />,
      badge: nb_rel_client_freins,
    },
  ];

  const isActive = (path) => pathname === path;
  const isParentActive = (subItems) => {
    return subItems?.some((subItem) => pathname.startsWith(subItem.path));
  };

  // Get the active submenu item name
  const getActiveSubmenuName = (subItems) => {
    const activeItem = subItems?.find((subItem) =>
      pathname.startsWith(subItem.path)
    );
    return activeItem?.name || null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4" ref={navRef}>
      {/* Collapsible Menu Button */}
      <button
        className="block md:hidden !text-gray-700 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Responsive Navigation */}
      <nav
        className={`flex flex-col gap-4 md:flex-row ${
          menuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {navItems.map((item) => {
          const activeSubmenuName = getActiveSubmenuName(item.subItems);
          const showSubmenuName =
            activeSubmenuName &&
            (isParentActive(item.subItems) || openSubmenu === item.name);

          return (
            <div key={item.name} className="relative flex-1">
              <Link
                href={item.path || '#'}
                onClick={() => item.subItems && toggleSubmenu(item.name)}
                className={`flex items-center gap-2 px-1 py-3 rounded-md transition-colors ${
                  isActive(item.path) || isParentActive(item.subItems)
                    ? 'bg-[#009FFF] text-white font-normal'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap">
                  {showSubmenuName ? activeSubmenuName : item.name}
                </span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.subItems && (
                  <span className="ml-auto">
                    {openSubmenu === item.name ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </Link>
              {item.subItems && openSubmenu === item.name && (
                <div className="absolute left-0 top-full bg-white shadow-md rounded-md mt-2 w-full z-10">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.path}
                      className={`flex items-center justify-between px-4 py-2 m-1 !text-gray-700 hover:bg-gray-100 hover:rounded-md ${
                        isActive(subItem.path) ? 'bg-blue-50 rounded-md' : ''
                      }`}
                    >
                      <span>{subItem.name}</span>
                      {subItem.badge && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default CRMNavbar;
