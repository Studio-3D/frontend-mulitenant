'use client';
import React, { useState } from 'react';

import {
  FileTextIcon,
  InfoIcon,
  HistoryIcon,
  UsersIcon,
  PaperclipIcon,
  CalendarIcon,
} from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';
import Button from '@/components/Button'; // adjust the path as needed
import Modal from '@/components/Modal';
import Modal_Relance from './Modal_Relance';

export const ReservationHeader = ({ reservationData ,userRole}) => {
  const [open_dialog, setOpen_dialog] = useState(false);

  // Add null checks and default values
  if (!reservationData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingSpin />
      </div>
    );
  }

  // Destructure the nested reservation object
  const { reservation } = reservationData;
  const lastUpdated = reservation?.updated_at
    ? new Date(reservation.updated_at).toLocaleDateString('fr-FR')
    : 'N/A';

  const handle_relance = () => {
    setOpen_dialog(!open_dialog);
  };
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileTextIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Détails de réservation{' '}
                {reservation.etat > 1 && (
                  <b className="text-red-500">Dossier Désisté</b>
                )}
              </h1>
              <p
                className={
                  reservation.statut == 3
                    ? 'text-orange-500'
                    : reservation.statut == 2
                    ? 'text-red-500'
                    : 'text-[#162A55]'
                }
              >
                Code: {reservation?.code_reservation || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <InfoIcon className="h-5 w-5 text-blue-500" />
            <span className="text-gray-600">
              Dernière mise à jour: {lastUpdated}
            </span>
          </div>
        </div>
        {reservation.statut == 2 && userRole==3 &&  (
          <div className="flex justify-end">
            <Button type="delete" onClick={() => handle_relance()}>
              Relancer
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-500" />
              <p className="text-gray-600">Rendez-vous</p>
            </div>
            <p className="text-lg font-semibold">
              {reservation?.rdv?.length || 0}{' '}
            </p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-cyan-500" />
              <p className="text-gray-600">Acquéreurs</p>
            </div>
            <p className="text-lg font-semibold">
              {reservation?.etat == 1
                ? reservation?.aquereurs?.length
                : reservation?.aquereurs_ancien?.length || 0}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <PaperclipIcon className="h-5 w-5 text-blue-500" />
              <p className="text-gray-600">Pièces jointes</p>
            </div>
            <p className="text-lg font-semibold">
              {reservation?.piece_jointe?.length || 0}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-red-500" />
              <p className="text-gray-600">Historiques</p>
            </div>
            <p className="text-lg font-semibold">
              {reservation?.historiques?.length || 0}
            </p>
          </div>
        </div>
      </div>
      {open_dialog && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog(false)}>
            <Modal_Relance
              id={reservation.id}
              onClose={() => setOpen_dialog(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
};
