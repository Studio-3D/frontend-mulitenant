import React from 'react';
import { StatusCard } from './StatusCard';
import { Eye, PencilLine, Trash2 } from "lucide-react"
import Link from 'next/link';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  ChevronDownIcon,
  HomeIcon,
  LayersIcon,
  BuildingIcon,
  BoxesIcon,
} from 'lucide-react';
import Table from '@/components/Table';

export const RightCard = ({ tabsData, activeTab, setActiveTab }) => {
  const { token, user } = useAuth()
    const router = useRouter()
  // Map of tab names to their respective icons
  const tabIcons = {
    bien: <HomeIcon size={18} />,
    tranche: <LayersIcon size={18} />,
    immeuble: <BuildingIcon size={18} />,
    blocs: <BoxesIcon size={18} />,
  };

  // Define columns for each tab type
  const tabColumns = {
    bien: [
      { key: 'name', label: 'Nom' },
      { key: 'type', label: 'Type' },
      { key: 'surface', label: 'Surface' },
      { key: 'price', label: 'Prix' },
      { key: 'status', label: 'Statut' },
      { 
      key: "actions", 
      label: "Actions",
      render: (row) => (
        <div className="flex gap-4 items-center text-sm">
          <Link
            href={`/Projets/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir le projet"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
            <>
              <Link
                href={`${row.id}?edit=true`}
                className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                title="Modifier le projet"
              >
                <PencilLine className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(row.id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
                title="Supprimer le projet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    },
    ],
    tranche: [
      { key: 'name', label: 'Nom' },
      { key: 'startDate', label: 'Date début' },
      { key: 'endDate', label: 'Date fin' },
      { key: 'status', label: 'Statut' },
    ],
    immeuble: [
      { key: 'name', label: 'Nom' },
      { key: 'address', label: 'Adresse' },
      { key: 'floors', label: 'Étages' },
      { key: 'status', label: 'Statut' },
    ],
    blocs: [
      { key: 'name', label: 'Nom' },
      { key: 'type', label: 'Type' },
      { key: 'units', label: 'Unités' },
      { key: 'status', label: 'Statut' },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {Object.keys(tabsData).map((tab) => (
            <button
              key={tab}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tabIcons[tab]}
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabsData[tab].count})
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 flex-grow">
        {activeTab === 'bien' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Biens</h2>
              <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500">
                  <option>Tous les biens</option>
                  <option>Appartements</option>
                  <option>Maisons</option>
                  <option>Bureaux</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabsData.bien.statuses.map((status, index) => (
                <StatusCard
                  key={index}
                  name={status.name}
                  count={status.count}
                  color={status.color}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Common table for all tabs */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {activeTab === 'bien' && (
            <div className="mt-4">
              <Table
                columns={tabColumns[activeTab]}
                data={tabsData[activeTab].items}
                showSearch={false}
              />
            </div>
          )}
          {activeTab !== 'bien' && (
            <div className="mt-4">
              <Table
                columns={tabColumns[activeTab]}
                data={tabsData[activeTab].items}
                showSearch={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};