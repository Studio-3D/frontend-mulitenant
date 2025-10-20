'use client';

import { HomeIcon, InfoIcon, PhoneIcon, XIcon } from 'lucide-react';

export default function Modal_Propsepct_Exist({
  onClose,
  info_param,
  info_client_1,
  id_appel,
  id_visite,
  client_prospect,
}) {
  function handleClickAppel(appelId) {
    window.open(`/crm/appels/${appelId}`, '_blank');
  }

  function handleClickVisite(vId) {
    window.open(`/crm/visites/${vId}`, '_blank');
  }

  return (
    <div
      className="w-full bg-white border-b border-gray-200"
      style={{ background: '#957de62b' }}
    >
      <div className="container mx-auto px-4 py-4 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Column 1: Title */}
          <div className="flex items-center col-span-1">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {info_param == "l'email" ? 'cet email' : 'Ce ' + info_param} appartient à:{' '}
            </h3>
          </div>

          {/* Column 2: Name */}
          <div className="flex items-center col-span-1">
            <div className="text-sm font-medium text-gray-500 mr-2">
              Nom & Prénom:
            </div>
            <div className="font-medium text-gray-900 truncate">
              {info_client_1}
            </div>
          </div>

          {/* Column 3: Type */}
          <div className="flex items-center col-span-1">
            <div className="text-sm font-medium text-gray-500 mr-2">Type:</div>
            <div className="font-medium text-gray-900">{client_prospect}</div>
          </div>

          {/* Column 4: Actions */}
          <div className="flex flex-wrap gap-2 justify-end col-span-1">
            {id_appel != null && (
              <button
                onClick={() => handleClickAppel(id_appel)}
                className="inline-flex items-center text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                aria-label="Voir détails de l'appel"
              >
                <PhoneIcon className="w-4 h-4 text-blue-500 mr-1.5" />
                <span>Voir appel</span>
              </button>
            )}

            {id_visite != null && (
              <button
                onClick={() => handleClickVisite(id_visite)}
                className="inline-flex items-center text-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                aria-label="Voir détails de la visite"
              >
                <HomeIcon className="w-4 h-4 text-blue-500 mr-1.5" />
                <span>Voir visite</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
