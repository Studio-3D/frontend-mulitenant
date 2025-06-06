'use client';
import React, { use } from 'react';
import { useEffect, useState } from 'react'

import { 
  FileTextIcon,
  InfoIcon, 
  HistoryIcon, 
  UsersIcon, 
  PaperclipIcon, 
  CalendarIcon, 
} from 'lucide-react';

export const ReservationHeader = ({ reservationData }) => {
 


 
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileTextIcon className="h-8 w-8 !text-blue-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold !text-gray-800">
              Détails de réservation
            </h1>
            <p className="text-gray-600">Code: {reservationData.code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <InfoIcon className="h-5 w-5 !text-blue-500" />
          <span className=" !text-gray-600">
            Dernière mise à jour: 12/06/2023
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 !text-green-500" />
          <p className=" !text-gray-600">Rendez-vous</p>
          </div>
          <p className="text-lg font-semibold">
            {reservationData.menuCounts.rendezVous}
          </p>
        </div>
        <div className="bg-cyan-50 p-3 rounded-md">
          <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-cyan-500" />
          <p className=" !text-gray-600">Acquéreurs</p>
          </div>
          <p className="text-lg font-semibold">
            {reservationData.menuCounts.acquereurs}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
           <div className="flex items-center gap-2">
          <PaperclipIcon className="h-5 w-5 !text-blue-500" />
          <p className=" !text-gray-600">Pièces jointes</p>
          </div>
          <p className="text-lg font-semibold">
            {reservationData.menuCounts.piecesJointes}
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-md">
          <div className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 !text-red-500" />
          <p className=" !text-gray-600">Historiques</p>
          </div>
          <p className="text-lg font-semibold">
            {reservationData.menuCounts.historiques}
          </p>
        </div>
      </div>
    </div>
  );
};