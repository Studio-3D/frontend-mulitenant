import React from 'react';
import { 
  CalendarIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon 
} from 'lucide-react';

// Mock data for rendez-vous
const rendezVousData = [
  {
    id: 1,
    date: '15/06/2023',
    heure: '10:00',
    type: 'Visite initiale',
    responsable: 'Marie Dupont',
    lieu: '15 Rue des Lilas, 75001 Paris',
    status: 'Terminé'
  },
  {
    id: 2,
    date: '22/06/2023',
    heure: '14:30',
    type: 'Visite technique',
    responsable: 'Pierre Lemoine',
    lieu: '15 Rue des Lilas, 75001 Paris',
    status: 'Terminé'
  },
  {
    id: 3,
    date: '05/07/2023',
    heure: '11:15',
    type: 'Signature compromis',
    responsable: 'Sophie Bernard',
    lieu: 'Cabinet notaire, 8 Avenue Victor Hugo, 75016 Paris',
    status: 'À venir'
  },
  {
    id: 4,
    date: '20/07/2023',
    heure: '16:00',
    type: 'Remise des clés',
    responsable: 'Jean Martin',
    lieu: '15 Rue des Lilas, 75001 Paris',
    status: 'À venir'
  }
];

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Terminé': {
      icon: <CheckCircleIcon className="h-4 w-4 mr-1" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    'À venir': {
      icon: <ClockIcon className="h-4 w-4 mr-1" />,
      color: 'text-cyan-600',
      bgColor: 'bg-blue-100'
    }
  };

  const config = statusConfig[status] || statusConfig['À venir'];

  return (
    <span className={`flex items-center ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

export const RendezVousTab = () => {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold !text-gray-800 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 !text-blue-500" />
          Rendez-vous
        </h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4 mr-1" />
          Ajouter un rendez-vous
        </button>
      </div>

      {/* Appointments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rendezVousData.map(rdv => (
          <div key={rdv.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
            {/* Appointment header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${rdv.status === 'Terminé' ? 'bg-green-50' : 'bg-cyan-50'}`}>
                  <CalendarIcon className={`h-5 w-5 ${rdv.status === 'Terminé' ? 'text-green-500' : 'text-cyan-500'}`} />
                </div>
                <div>
                  <h3 className="font-medium !text-gray-900">{rdv.type}</h3>
                  <p className="text-sm !text-gray-500">
                    {rdv.date} à {rdv.heure}
                  </p>
                </div>
              </div>
              <div className="flex">
                <button 
                  className="text-blue-500 mr-2 transition-colors"
                  aria-label="Modifier le rendez-vous"
                >
                  <EditIcon className="h-4 w-4" />
                </button>
                <button 
                  className="text-red-500 transition-colors"
                  aria-label="Supprimer le rendez-vous"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Appointment details */}
            <div className="mt-4 text-sm">
              <p className="flex items-center !text-gray-600 mb-1">
                <span className="font-medium w-24">Lieu:</span> 
                <span className="flex-1">{rdv.lieu}</span>
              </p>
              <p className="flex items-center !text-gray-600 mb-1">
                <span className="font-medium w-24">Responsable:</span>
                <span className="flex-1">{rdv.responsable}</span>
              </p>
              <p className="flex items-center !text-gray-500">
                <span className="font-medium w-24">Statut:</span>
                <StatusBadge status={rdv.status} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};