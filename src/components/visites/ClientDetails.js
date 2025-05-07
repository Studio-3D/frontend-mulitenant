'use client';

import React from 'react';
import {
  UserIcon,
  PhoneIcon,
  InfoIcon,
  AlertCircleIcon,
  ImageIcon,
} from 'lucide-react';

import Modal from '@/components/Modal';
import { useState } from 'react';

import ProspectFormDialog from '../../../src/app/(dashboard)/crm/prospects/ProspectFormDialg';
export function ClientDetails({ Prospect }) {
  const handleView_Prospect = (prosId) => {
    window.open(`/crm/prospects/${prosId}`, '_blank');
  };
  //modifier prspct
  const [openDialog, setOpenDialog] = useState(false);
  const handleDialogOpen = () => setOpenDialog(true);
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
                {Prospect?.nom + ' ' + Prospect?.prenom}
              </h2>
            </div>
          </div>

          {/* Cin */}
          <div className="flex items-center space-x-4">
            <ImageIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Carte Identité National:</p>
              <p className="font-medium">{Prospect?.cin}</p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Téléphone</p>
              <p className="font-medium">
                {Prospect?.telephone}
                {Prospect?.telephone_num2 != null
                  ? '/' + Prospect?.telephone_num2
                  : null}
              </p>
            </div>
          </div>

          {/* Source/Partenaire */}
          <div className="flex items-center space-x-3">
            <InfoIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              {Prospect?.partenaire_id != null ? (
                <>
                  <p className="text-sm text-[whitesmoke]">Partenaire:</p>
                  <p className="font-medium">
                    {Prospect?.partenaire.description}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[whitesmoke]">Source:</p>
                  <p className="font-medium">{Prospect?.source.source}</p>
                </>
              )}
            </div>
          </div>

          {/* Accepte d'être contacté */}
          <div className="flex items-center space-x-3">
            <AlertCircleIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <p className="text-sm text-[whitesmoke]">Accepte {'d\'être'} contacté</p>
              <p className="font-medium">
                {Prospect?.notifie == 1 ? 'Oui' : 'Non'}
              </p>
            </div>
          </div>
        </div>

        {/* Second row - Buttons aligned to the right */}
        <div className="flex justify-end mt-6">
          <div className="flex space-x-4">
            <button
              className="bg-white text-[#2563eb] px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => handleView_Prospect(Prospect?.id)}
            >
              Voir Prospect
            </button>
            <button
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors"
              onClick={() => handleDialogOpen()}
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      {openDialog && (
        <>
          <Modal isVisible={true} onClose={() => setOpenDialog(false)}>
            <ProspectFormDialog
              id={Prospect?.id}
              onClose={() => setOpenDialog(false)}
              //onSuccess={fetch_visite}
            />
          </Modal>
        </>
      )}
    </>
  );
}
