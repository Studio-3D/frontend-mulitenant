'use client';

import React from 'react';
import {
  UserIcon,
  PhoneIcon,
  InfoIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon
} from 'lucide-react';


import { useRouter } from 'next/navigation';
import { ENDPOINTS } from '@/configs/api';


const PrestataireDetail = ({ Details }) => {

  const router = useRouter();
  

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white p-8">
        {/* First row - Information */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
          {/* Nom & Prénom */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-[whitesmoke]">Nom & Prénom:</p>
              <h2 className="text-xl font-bold">
                {Details?.nom + ' ' + Details?.prenom}
              </h2>
            </div>
          </div>

          {/* Cin */}
          <div className="flex items-center space-x-4">
            <ImageIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Carte Identité National:</p>
              <p className="font-medium">{Details?.cin}</p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Téléphone</p>
              <p className="font-medium">
                {Details?.telephone}

              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MailIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Email</p>
              <p className="font-medium">
                {Details?.email}

              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Adresse</p>
              <p className="font-medium">
                {Details?.adresse}

              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <InfoIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
  
                <>
                  <p className="text-sm text-[whitesmoke]">Service:</p>
                  <p className="font-medium">{Details?.service.nom}</p>
                </>
            </div>
          </div>

          
        </div>

        {/* Second row - Buttons aligned to the right */}
        <div className="flex justify-end mt-6">
          <div className="flex space-x-4">
            <button
              className="bg-white text-[#2563eb] px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => router.back()}            
            >
              Retour
            </button>
            <button
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors"
                onClick={() => { router.push(`${ENDPOINTS.Prestataires}?id=${Details?.id}&action=edit`);
              }}
        
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      
    </>
  );
}

export default PrestataireDetail;

