import React, { useMemo, useState, useCallback } from 'react';
import { StatusCard } from './StatusCard';
import { Eye, PencilLine, Trash2 } from "lucide-react"
import Link from 'next/link';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SelectInput from '@/components/SelectInput';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { APIURL } from '@/configs/api'

import {
  ChevronDownIcon,
  HomeIcon,
  LayersIcon,
  BuildingIcon,
  BoxesIcon,
} from 'lucide-react';
import Table from '@/components/Table';

const TAB_CONFIG = {
  tranche: {
    icon: <LayersIcon size={18} />,
    name: "Tranches",
    apiEndpoint: APIURL.TRANCHES,
    addLink: (user) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? '/Tranches/ajouter' : undefined,
    columns: (user, handleDelete) => [
      { key: 'nom', label: 'Tranche' },
      { key: 'date_lancement', label: 'Date lancement' },
      { key: 'niveau_etages', label: "Niveau d'étages" },
      { key: 'date_livraison', label: 'Date livraison' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex gap-4 items-center">
            <Link
              href={`/Tranches/${row.id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir le tranche"
            >
              <Eye className="w-4 h-4" />
            </Link>
            
            {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
              <>
                <Link
                  href={`/Tranches/${row.id}/modifier/?edit=true`}
                  className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                  title="Modifier le tranche"
                >
                  <PencilLine className="w-4 h-4" />
                </Link>
               <button onClick={() => handleDelete(row.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      }
    ]
  },
  blocs: {
    icon: <BoxesIcon size={18} />,
    name: "Blocs",
    apiEndpoint: APIURL.BLOCS,
    addLink: (user,) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Blocs/ajouter` : undefined,
    columns: (user, handleDelete) => [
      { key: 'nom', label: 'Bloc' },
      { key: 'tranche_nom', label: 'Tranche' },
      { key: 'titre_foncier', label: 'Titre foncier' },
      { key: 'nbre_immeubles', label: 'Nbr Immeubles' },
      { key: 'nbre_biens', label: 'Nbr Biens' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex gap-4 items-center">
            <Link
              href={`/Blocs/${row.id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir le bloc"
            >
              <Eye className="w-4 h-4" />
            </Link>
            
            {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
              <>
                <Link
                  href={`/Blocs/${row.id}/modifier/?edit=true`}
                  className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                  title="Modifier le bloc"
                >
                  <PencilLine className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(row.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      }
    ]
  },
  immeuble: {
    icon: <BuildingIcon size={18} />,
    name: "Immeubles",
    apiEndpoint: APIURL.IMMEUBLES,
    addLink: (user) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Immeubles/ajouter` : undefined,
    columns: (user, handleDelete) => [
      { key: 'nom', label: 'Immeuble' },
      { key: 'tranche_nom', label: 'Tranche' },
      { key: 'bloc_nom', label: 'Bloc' },
      { key: 'titre_foncier', label: 'Titre foncier' },
      { key: 'nbre_biens', label: 'Nbr Biens' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex gap-4 items-center">
            <Link
              href={`/Immeubles/${row.id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir l'immeuble"
            >
              <Eye className="w-4 h-4" />
            </Link>
            
            {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
              <>
               <Link
                  href={`/Immeubles/${row.id}/modifier/?edit=true`}
                  className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                  title="Modifier l'immeuble"
                >
                  <PencilLine className="w-4 h-4" />
                </Link>
               <button onClick={() => handleDelete(row.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      }
    ]
  },
  bien: {
    icon: <HomeIcon size={18} />,
    name: "Biens",
    apiEndpoint: APIURL.BIENS,
     addLink: (user) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Biens/ajouter` : undefined,
    columns: (user, handleDelete) => [
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
              href={`/Biens/${row.id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir le bien"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
              <>
                <Link
                  href={`/Biens/${row.id}/modifier/?edit=true`}
                  className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                  title="Modifier le bien"
                >
                  <PencilLine className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700"
                  title="Supprimer le bien"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      },
    ]
  },
};

export const RightCard = ({ tabsData, activeTab, setActiveTab, fetchProjectData, projectId }) => {
  const { token, user } = useAuth()
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);


   // Define handleAction before it's used
  const handleAction = useCallback((id) => {
        handleDelete(id);
    }, [activeTab, router]);

   const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
  setShowDeleteModal(false);
  if (fetchProjectData) {  // Now using the destructured prop
      fetchProjectData(); 
    }
};

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  }, []);

  // Filter items based on selected type and pagination
  const filteredItems = useMemo(() => {
    if (!tabsData[activeTab]?.items) return [];
    
    let items = tabsData[activeTab].items;
    
    // Apply type filter if activeTab is 'bien' and a type is selected
    if (activeTab === 'bien' && selectedType) {
      items = items.filter(item => item.type === selectedType);
    }
    
    // Update total rows count
    setTotalRows(items.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    return items.slice(startIndex, endIndex);
  }, [tabsData, activeTab, selectedType, currentPage, rowsPerPage]);

  const currentColumns = useMemo(() => {
    if (!activeTab || !TAB_CONFIG[activeTab]) return [];
    
    const columnConfig = TAB_CONFIG[activeTab].columns;
    return typeof columnConfig === 'function' 
      ? columnConfig(user, handleDelete, handleAction)  // Pass handleAction here
      : columnConfig;
  }, [activeTab, user, handleDelete, handleAction]);

  const availableTabs = useMemo(() => {
    return Object.keys(tabsData).filter(tab => 
      tabsData[tab]?.nbr_count > 0
    );
  }, [tabsData]);

  const safeActiveTab = useMemo(() => {
    return availableTabs.includes(activeTab) 
      ? activeTab 
      : availableTabs[0] || null;
  }, [activeTab, availableTabs]);

  if (!safeActiveTab) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-6 text-center text-gray-500">
          Aucune donnée disponible pour ce projet
        </div>
      </div>
    );
  }

  const currentTabData = tabsData[safeActiveTab];
  const hasItems = filteredItems.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                safeActiveTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedType(null); // Reset filter when changing tabs
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              {TAB_CONFIG[tab]?.icon}
              {TAB_CONFIG[tab]?.name} ({tabsData[tab]?.count || 0})
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 flex-grow">
        {safeActiveTab === 'bien' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Biens</h2>
              <div className="relative">
                <SelectInput
                  options={tabsData.bien?.typeBienOptions || []}
                  placeholder="Filtrer par type"
                  value={selectedType}
                  onChange={(value) => {
                    setSelectedType(value);
                    setCurrentPage(1); // Reset to first page when changing filter
                  }}
                  width="w-48"
                />
              </div>
            </div>
            {currentTabData.statuses && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {currentTabData.statuses.map((status, index) => (
                  <StatusCard
                    key={index}
                    name={status.name}
                    count={status.count}
                    color={status.color}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        <div className="mb-6">
          <Table
            columns={currentColumns}
            data={hasItems ? filteredItems : []}
            addLink={TAB_CONFIG[safeActiveTab]?.addLink?.(user, projectId)}
            showSearch={false}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">
                  Aucun {TAB_CONFIG[safeActiveTab]?.name?.toLowerCase()} disponible pour ce projet
                </p>
              </div>
            }
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalRows={totalRows}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            
          />
          {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                  <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
                    <DeleteData
                      route={TAB_CONFIG[safeActiveTab]?.apiEndpoint}
                      Id={selectedId}
                      type={TAB_CONFIG[safeActiveTab]?.name}
                      message={`Êtes-vous sûr de vouloir supprimer ce ${TAB_CONFIG[safeActiveTab]?.name.toLowerCase()} ?`}
                      accessToken={token || localStorage.getItem("accessToken")}
                      onClose={() => {
                        setShowDeleteModal(false);
                        handleDeleteSuccess();
                      }}
                    />
                  </Modal>
                )}
        </div>
      </div>
    </div>
  );
};