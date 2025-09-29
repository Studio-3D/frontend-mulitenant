'use client';
import React, { useState } from 'react';
import ProfileContent from '@/components/Utilisateurs/ProfileContent';
import ProjetsContent from '@/components/Utilisateurs/ProjetsContent';
import VisitesContent from '@/components/Utilisateurs/VisitesContent';
import VentesContent from '@/components/Utilisateurs/VentesContent';
import { User, Briefcase, Map, Handshake } from "lucide-react";
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserDetailsPage() { // Renamed to PascalCase
  const { id } = useParams();
  const [selectedMenu, setSelectedMenu] = useState('Profil');
  const { token } = useAuth();
   

  const menuItems = [
    { label: 'Profil', icon: <User /> },
    { label: 'Projets', icon: <Briefcase /> },
    { label: 'Visites', icon: <Map /> },
    { label: 'Ventes', icon: <Handshake /> },
  ];

  return (
    <div className='bg-white xl:min-h-[90vh] shadow-md rounded-xl pb-4'>
     
      <div className='flex justify-between  h-full'>

      
      {/* Body Section */}
      <div className='flex flex-col w-[20%] '>
         {/* Head Section */}
      <div className='flex '>
        <div className=' w-full  border-r border-b flex justify-start items-center p-6'>
          <h1 className='text-2xl font-semibold'>Utilisateurs</h1>
        </div>

      </div>
        {/* Left Menu */}
        <div className=' h-full border-r border-gray-300 '>
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`px-6 pt-2 pb-2 cursor-pointer hover:bg-[#e5f4ff] mb-1 ${
                selectedMenu === item.label ? 'bg-[#e5f4ff] border-r-2 border-[#008eff]' : ''
              }`}
              onClick={() => setSelectedMenu(item.label)}
            >
              <div className='flex items-center'>
                <span className="w-8 h-8 flex items-center !text-gray-400">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
        {/* Dynamic Content */}
        <div className=' w-full h-full  '>
          {selectedMenu === 'Profil' && <ProfileContent userId={id}  token={token}/>}
          {selectedMenu === 'Projets' && <ProjetsContent user_id={id} />}
          {selectedMenu === 'Visites' && <VisitesContent  user_id={id}/>}
          {selectedMenu === 'Ventes' && <VentesContent  user_id={id}/>}
        </div>
        </div>
    </div>
  );
}