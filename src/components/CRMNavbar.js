"use client";

import { FiUser, FiCalendar, FiPhoneCall, FiHome, FiClock, FiUsers } from 'react-icons/fi';
import SharedNavBar from '@/components/SharedNavBar';

export default function CRMNavbar() {
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

  return <SharedNavBar items={navItems} />;
}
