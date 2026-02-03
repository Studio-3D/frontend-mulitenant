'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin,isSav } from '@/configs/enum';

import {
  UserIcon,
  PhoneIcon,
  InfoIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
} from 'lucide-react';

import { ENDPOINTS } from '@/configs/api';

const PrestataireDetail = ({ Details }) => {
  const router = useRouter();
       const {  user } = useAuth();
            const userRole = user?.role;
              
                useEffect(() => {
                  if (
                    user && 
                    !isAdmin(userRole) &&
                    !isSuperAdmin(userRole) &&
                    !isSav(userRole)
                  ) {
                    router.push('/');
                  }
                }, [user, userRole, router]);
  if (!Details) {
    return (
      <div className="p-8 text-center !text-gray-300">
        Chargement des informations du prestataire...
      </div>
    );
  }


  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white p-8 shadow-lg max-w-7xl mx-auto">
      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Nom & Prénom */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <UserIcon className="h-7 w-7 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Nom & Prénom :</p>
            <h2 className="text-xl font-bold text-white">
              {Details.nom || '-'} {Details.prenom || '-'}
            </h2>
          </div>
        </div>

        {/* Cin */}
        <div className="flex items-center space-x-4">
          <div>
            <ImageIcon className="h-6 w-6 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Cin :</p>
            <p className="font-medium text-white">{Details.cin || '-'}</p>
          </div>
        </div>

        {/* Téléphone */}
        <div className="flex items-center space-x-4">
          <div>
            <PhoneIcon className="h-6 w-6 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Téléphone :</p>
            <p className="font-medium text-white">{Details.telephone || '-'}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-4">
          <div>
            <MailIcon className="h-6 w-6 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Email :</p>
            <p className="font-medium text-white">{Details.email || '-'}</p>
          </div>
        </div>

        {/* Adresse */}
        <div className="flex items-center space-x-4">
          <div>
            <MapPinIcon className="h-6 w-6 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Adresse :</p>
            <p className="font-medium text-white">{Details.adresse || '-'}</p>
          </div>
        </div>

        {/* Service */}
        <div className="flex items-center space-x-4">
          <div>
            <InfoIcon className="h-6 w-6 !text-blue-100" />
          </div>
          <div>
            <p className="text-sm !text-blue-200">Service :</p>
            <p className="font-medium text-white">{Details.service?.nom || '-'}</p>
          </div>
        </div>
      </div>

      {/* Bouton Modifier */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          className="bg-blue-900 hover:bg-blue-800 transition-colors text-white px-6 py-2 rounded-lg font-semibold shadow-md"
          onClick={() =>
            router.push(`${ENDPOINTS.Prestataires}?id=${Details.id}&action=edit`)
          }
        >
          Modifier
        </button>
      </div>
    </div>
  );
};

export default PrestataireDetail;
