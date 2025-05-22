import React from 'react';
import { Eye, UserCog, UserX, User, Trash2 } from "lucide-react";
import Table from '@/components/Table';

// Mock data for historiques
const historiqueData = [
  {
    id: 1,
    date: '12/06/2023',
    type: 'Création',
    description: 'Création de la réservation',
    user: 'Marie Dupont'
  },
  {
    id: 2,
    date: '14/06/2023',
    type: 'Modification',
    description: 'Mise à jour des informations client',
    user: 'Jean Martin'
  },
  {
    id: 3,
    date: '18/06/2023',
    type: 'Document',
    description: "Ajout de pièce d'identité",
    user: 'Marie Dupont'
  },
  {
    id: 4,
    date: '22/06/2023',
    type: 'Rendez-vous',
    description: 'Planification de la visite technique',
    user: 'Pierre Lemoine'
  },
  {
    id: 5,
    date: '25/06/2023',
    type: 'Paiement',
    description: 'Réception du premier acompte',
    user: 'Sophie Bernard'
  }
];

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'Création':
      return 'bg-green-100 text-green-800';
    case 'Modification':
      return 'bg-yellow-100 text-yellow-800';
    case 'Document':
      return 'bg-blue-100 text-blue-800';
    case 'Rendez-vous':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const HistoriquesTab = () => {
  const columns = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "user", label: "Utilisateur" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
            <Eye
              className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir détails"
            />
            <UserCog
              className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
              title="Modifier"
            />
          {row.status === "Actif" ? (
            <User
              className="w-4 h-4 text-green-500 hover:text-green-700 cursor-pointer"
              title="Bloquer utilisateur"
            />
          ) : (
            <UserX
              className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
              title="Débloquer utilisateur"
            />
          )}
          <Trash2
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
            title="Supprimer utilisateur"
          />
        </div>
      ),
    },
  ];
  return (
      <div className="">
       <Table
          columns={columns}
          data={historiqueData}
          enableExport
       />
      </div>
    
  );
};