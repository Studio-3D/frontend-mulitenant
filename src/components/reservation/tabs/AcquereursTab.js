import React from 'react';
import { UsersIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import Table from '@/components/Table';
import { Eye, UserCog, UserX, User, Trash2 } from "lucide-react";

// Mock data for acquéreurs
const acquereursData = [
  {
    id: 1,
    nom: 'Dubois',
    prenom: 'Thomas',
    email: 'thomas.dubois@example.com',
    telephone: '+33 6 12 34 56 78',
    adresse: '15 Rue des Lilas, 75001 Paris',
    principal: true
  },
  {
    id: 2,
    nom: 'Dubois',
    prenom: 'Sophie',
    email: 'sophie.dubois@example.com',
    telephone: '+33 6 87 65 43 21',
    adresse: '15 Rue des Lilas, 75001 Paris',
    principal: false
  }
];

export const AcquereursTab = () => {
  const columns = [
      {
        key: "nom",
        label: "Nom",
      },
      {
        key: "prenom",
        label: "Prénom",
    
      },
      {
        key: "email",
        label: "Email",
      },
      {
        key: "telephone",
        label: "Téléphone",
        
      },
      {
        key: "adresse",
        label: "Adresse",
      },
      {
        key: "statut",
        label: "Statut",
        render: (row) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              row.principal ? "bg-green-100 !text-green-800" : "bg-cyan-100 text-cyan-800"
            }`}
          >
            {row.principal ? "Principal" : "Secondaire"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <div className="flex gap-3 items-center">
              <Eye
                className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
                title="Voir détails"
              />
              <UserCog
                className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
                title="Modifier"
              />
            {row.status === "Actif" ? (
              <User
                className="w-4 h-4 !text-green-500 hover:text-green-700 cursor-pointer"
                title="Bloquer utilisateur"
              />
            ) : (
              <UserX
                className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                title="Débloquer utilisateur"
              />
            )}
            <Trash2
              className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
              title="Supprimer utilisateur"
            />
          </div>
        ),
      },
    ];

  return (
    <div className="space-y-6">
      <Table 
      columns={columns} 
      data={acquereursData}
      enableExport
      />
    </div>
  );
};