import React from 'react';
import { Eye, UserCog, UserX, User, Trash2 } from "lucide-react";
import Table from '@/components/Table';

// Mock data for avances
const avancesData = [
  {
    id: 1,
    montant: '10000 €',
    date: '15/06/2023',
    type: 'Acompte',
    methode: 'Virement bancaire',
    reference: 'VIR-2023-001',
    status: 'Confirmé'
  },
  {
    id: 2,
    montant: '5000 €',
    date: '22/06/2023',
    type: 'Avance',
    methode: 'Chèque',
    reference: 'CHQ-2023-042',
    status: 'En attente'
  },
  {
    id: 3,
    montant: '1000 €',
    date: '28/06/2023',
    type: 'Frais de dossier',
    methode: 'Carte bancaire',
    reference: 'CB-2023-105',
    status: 'Confirmé'
  }
];

export const AvancesTab = () => {
  const columns = [
    {
      key: "date",
      label: "Date",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "montant",
      label: "Montant",
    },
    {
      key: "methode",
      label: "Méthode de paiement",
    },
    {
      key: "reference",
      label: "Référence",
    },
    {
      key: "status",
      label: "Statut",
      render: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'Confirmé' ? 'bg-green-100 !text-green-800' : 'bg-yellow-100 !text-yellow-800'
          }`}
        >
          {row.status}
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
      <div className="bg-cyan-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm !text-gray-500">Total versé</p>
            <p className="text-2xl font-bold">16 000 €</p>
          </div>
          <div>
            <p className="text-sm !text-gray-500">Reste à payer</p>
            <p className="text-2xl font-bold">304 000 €</p>
          </div>
          <div>
            <p className="text-sm !text-gray-500">Pourcentage versé</p>
            <p className="text-2xl font-bold">5%</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={avancesData}
          enableExport
        />
      </div>
    </div>
  );
};