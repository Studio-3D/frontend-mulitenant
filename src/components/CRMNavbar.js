'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiUser,
  FiCalendar,
  FiPhoneCall,
  FiHome,
  FiClock,
  FiUsers,
  FiMenu,FiPause
} from 'react-icons/fi';
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
  const [menuOpen, setMenuOpen] = useState(false); // For collapsing menu

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

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const navItems = [
    {
      name: 'Prospects',
      path: '/crm/prospects',
      icon: <FiUser className="w-5 h-5" />,
    },
    {
      name: 'Visites',
      path: '/crm/visites',
      icon: <FiUsers className="w-5 h-5" />,
    },
    {
      name: 'Appels',
      path: '/crm/appels',
      icon: <FiPhoneCall className="w-5 h-5" />,
    },
    {
      name: 'Pré-réservations',
      path: '/crm/pre-reservations',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      name: 'Relances',
      icon: <FiClock className="w-5 h-5" />,
      badge: nb_total_relances,
      subItems: [
        {
          name: 'Appels',
          path: '/crm/appels/relances',
          badge: nb_relances_appels,
        },
        {
          name: 'Visites',
          path: '/crm/visites/relances',
          badge: nb_relance_visite,
        },
      ],
    },
    {
      name: 'RDV',
      icon: <FiCalendar className="w-5 h-5" />,
      badge: nb_total_rdv,
      subItems: [
        {
          name: 'Appels',
          path: '/crm/appels/rdv',
          badge: nb_rdv_appel,
        },
        {
          name: 'Visites',
          path: '/crm/visites/rdv',
          badge: nb_rdv_visite,
        },
      ],
    },
    {
      name: 'Freins',
      path: '/crm/visites/freins',
      icon: <FiPause className="w-5 h-5" />,
      badge: nb_rel_client_freins,
    },
  ];

  const isActive = (path) => pathname === path;
  const isParentActive = (subItems) => {
    return subItems?.some((subItem) => pathname.startsWith(subItem.path));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Collapsible Menu Button */}
      <button
        className="block md:hidden text-gray-700 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Responsive Navigation */}
      <nav
        className={`flex flex-col gap-4 md:flex-row ${
          menuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {navItems.map((item) => (
          <div key={item.name} className="relative">
            <Link
              href={item.path || '#'}
              onClick={() => item.subItems && toggleSubmenu(item.name)}
              className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
                isActive(item.path) || isParentActive(item.subItems)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
            {item.subItems && openSubmenu === item.name && (
              <div className="absolute left-0 top-full bg-white shadow-lg rounded-md mt-2 w-48">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.path}
                    className={`flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                      isActive(subItem.path) ? 'bg-blue-100' : ''
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
        ))}
      </nav>
    </div>
  );
};

export default CRMNavbar;
