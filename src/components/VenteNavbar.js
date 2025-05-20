'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FiUser,
  FiCalendar,
  FiPhoneCall,
  FiHome,
  FiClock,
  FiUsers,
  FiMenu,
  FiPause,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import Pusher from 'pusher-js';
import FetchNotifMenu from '../../src/configs/FetchNotifMenu';

const VenteNavbar = () => {
   const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const pathname = usePathname();

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
      name: 'Reservations',
      path: '/ventes/reservations',
      icon: <FiUser className="w-5 h-5" />,
    },
    {
      name: 'Clients',
      path: '/ventes/clients',
      icon: <FiUsers className="w-5 h-5" />,
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
        {navItems.map((item) => {
          const activeSubmenuName = getActiveSubmenuName(item.subItems);
          const showSubmenuName =
            activeSubmenuName &&
            (isParentActive(item.subItems) || openSubmenu === item.name);

          return (
            <div key={item.name} className="relative">
              <Link
                href={item.path || '#'}
                onClick={() => item.subItems && toggleSubmenu(item.name)}
                className={`flex items-center gap-2 px-1 py-3 xl:w-48 rounded-md transition-colors ${
                  isActive(item.path) || isParentActive(item.subItems)
                    ? 'bg-[#009FFF] text-white font-normal'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{showSubmenuName ? activeSubmenuName : item.name}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5  text-xs font-semibold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.subItems && (
                  <span className="ml-auto">
                    {openSubmenu === item.name ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </Link>
              {item.subItems && openSubmenu === item.name && (
                <div className="absolute left-0 top-full bg-white shadow-md rounded-md mt-2 xl:w-48 z-10">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.path}
                      className={`flex items-center justify-between px-4 py-2 m-1 text-gray-700 hover:bg-gray-100 hover:rounded-md ${
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

export default VenteNavbar;
