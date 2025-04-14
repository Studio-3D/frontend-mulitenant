"use client";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiCalendar, FiPhoneCall, FiHome, FiClock, FiUsers } from 'react-icons/fi';

export default function CRMNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // CRM navigation items
  const navItems = [
    { 
      name: 'Prospects', 
      path: '/crm/prospects', 
      icon: <FiUser className="w-5 h-5" /> 
    },
    { 
      name: 'Visites', 
      path: '/crm/visites', 
      icon: <FiUsers className="w-5 h-5" /> 
    },
    { 
      name: 'Appels', 
      path: '/crm/appels', 
      icon: <FiPhoneCall className="w-5 h-5" /> 
    },
    { 
      name: 'Pré-réservations', 
      path: '/crm/preReservation', 
      icon: <FiHome className="w-5 h-5" /> 
    },
    { 
      name: 'Relances', 
      path: '/crm/relances', 
      icon: <FiClock className="w-5 h-5" />,
      badge: 3, // Example badge count, should be dynamic
    },
    { 
      name: 'RDV', 
      path: '/crm/rdv', 
      icon: <FiCalendar className="w-5 h-5" />,
      badge: 2, // Example badge count, should be dynamic
    }
  ];

  // Check if path is active
  const isActive = (path) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link 
            key={item.name}
            href={item.path}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
              isActive(item.path) 
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
        ))}
      </nav>
    </div>
  );
}
