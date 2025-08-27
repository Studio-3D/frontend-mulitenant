import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
import Input from '@/components/Input';
import {
  ChevronDownIcon,
  HomeIcon,
  LayersIcon,
  BuildingIcon,
  BoxesIcon,
} from 'lucide-react';
import Table from '@/components/Table';

const TAB_CONFIG = {
  blocs: {
    icon: <BoxesIcon size={18} />,
    name: "Blocs",
    apiEndpoint: APIURL.BLOCS,
    addLink: (user, trancheId) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Blocs/ajouter?trancheId=${trancheId}` : undefined,
    filters: (tabsData, trancheId) => [
      { 
        key: 'nom', 
        label: 'Nom', 
        type: 'text', 
        placeholder: 'Nom...',
        className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
      },
      { 
        key: 'titre_foncier', 
        label: 'Titre foncier', 
        type: 'text', 
        placeholder: 'Titre foncier...',
        className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
      },
    ],
    columns: (user, handleDelete) => [
      { key: 'nom', label: 'Bloc' },
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
    addLink: (user, trancheId) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Immeubles/ajouter?trancheId=${trancheId}` : undefined,
    filters: (tabsData, trancheId) => [
      { 
        key: 'nom', 
        label: 'Nom', 
        type: 'text', 
        placeholder: 'Nom...',
        className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
      },
      { 
        key: 'bloc_nom', 
        label: 'Bloc', 
        type: 'text', 
        placeholder: 'Bloc...',
        className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
      },
      { 
        key: 'titre_foncier', 
        label: 'Titre foncier', 
        type: 'text', 
        placeholder: 'Titre foncier...',
        className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
      },
    ],
    columns: (user, handleDelete) => [
      { key: 'nom', label: 'Immeuble' },
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
    addLink: (user, trancheId) => (isSuperAdmin(user?.role) || isAdmin(user?.role)) ? `/Biens/ajouter?trancheId=${trancheId}` : undefined,
    filters: (tabsData, trancheId) => {
      // Get unique status values from the biens data
      const statusOptions = tabsData.bien?.items 
        ? [...new Set(tabsData.bien.items.map(item => item.status))]
          .filter(status => status) // Remove empty/null values
          .map(status => ({ label: status, value: status }))
        : [];
      
      return [
        { 
          key: 'name', 
          label: 'Nom', 
          type: 'text', 
          placeholder: 'Nom...',
          className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
        },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select', 
          placeholder: 'Sélectionner un type',
          options: tabsData.bien?.typeBienOptions || [],
          className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
        },
        { 
          key: 'surface', 
          label: 'Surface', 
          type: 'number', 
          placeholder: 'Surface...',
          className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
        },
        { 
          key: 'price', 
          label: 'Prix', 
          type: 'number', 
          placeholder: 'Prix...',
          className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
        },
        { 
          key: 'status', 
          label: 'Statut', 
          type: 'select', 
          placeholder: 'Sélectionner un statut',
          options: statusOptions,
          className: "h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
        },
      ];
    },
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

export const RightCard = ({ tabsData, activeTab, setActiveTab, fetchTrancheData, trancheId }) => {
  const { token, user } = useAuth()
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  
  // State for filters
  const [tempFilters, setTempFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);

  // Initialize filters when tab changes
  useEffect(() => {
    const initialFilters = {};
    if (TAB_CONFIG[activeTab]?.filters) {
      const filterConfig = TAB_CONFIG[activeTab].filters(tabsData, trancheId);
      filterConfig.forEach(filter => {
        initialFilters[filter.key] = '';
      });
    }
    setTempFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setShowFilter(false); // Hide filter when tab changes
  }, [activeTab, tabsData, trancheId]);

  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    if (fetchTrancheData) {
      fetchTrancheData(); 
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({...tempFilters});
    setCurrentPage(1); // Reset to first page when applying filters
    setShowFilter(false); // Hide filter after applying
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {};
    if (TAB_CONFIG[activeTab]?.filters) {
      const filterConfig = TAB_CONFIG[activeTab].filters(tabsData, trancheId);
      filterConfig.forEach(filter => {
        resetFilters[filter.key] = '';
      });
    }
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1); // Reset to first page when resetting filters
  };

  // Handle filter toggle
  const handleFilterToggle = (isVisible) => {
    setShowFilter(isVisible);
  };

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  // Filter items based on selected type, applied filters and pagination
  const filteredItems = useMemo(() => {
    if (!tabsData[activeTab]?.items) return [];
    
    let items = tabsData[activeTab].items;
    
    // Apply type filter if activeTab is 'bien' and a type is selected
    if (activeTab === 'bien' && selectedType) {
      items = items.filter(item => item.type === selectedType);
    }
    
    // Apply text filters
    Object.keys(appliedFilters).forEach(key => {
      if (appliedFilters[key]) {
        items = items.filter(item => 
          item[key]?.toString().toLowerCase().includes(appliedFilters[key].toLowerCase())
        );
      }
    });
    
    // Update total rows count
    setTotalRows(items.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    return items.slice(startIndex, endIndex);
  }, [tabsData, activeTab, selectedType, appliedFilters, currentPage, rowsPerPage]);

  const currentColumns = useMemo(() => {
    if (!activeTab || !TAB_CONFIG[activeTab]) return [];
    
    const columnConfig = TAB_CONFIG[activeTab].columns;
    return typeof columnConfig === 'function' 
      ? columnConfig(user, handleDelete) 
      : columnConfig;
  }, [activeTab, user, handleDelete]);

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

  // Filter component for all tabs
const filterComponent = useMemo(() => {
  if (!TAB_CONFIG[safeActiveTab]?.filters) return null;
  
  const filterConfig = TAB_CONFIG[safeActiveTab].filters(tabsData, trancheId);
  
  return (
    <div className="space-y-4 ">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {filterConfig.map(filter => {
          if (filter.type === 'select') {
            return (
              <div key={filter.key} className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">{filter.label}</label>
                <SelectInput
                  options={filter.options || []}
                  placeholder={filter.placeholder}
                  value={tempFilters[filter.key] || ''}
                  onChange={(selectedValue) => handleFilterChange(filter.key, selectedValue)}
                  width="w-full"
                />
              </div>
            );
          } else if (filter.type === 'number') {
            return (
              <div key={filter.key} className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">{filter.label}</label>
                <Input
                  type="number"
                  name={filter.key}
                  value={tempFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                />
              </div>
            );
          } else {
            return (
              <div key={filter.key} className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">{filter.label}</label>
                <Input
                  type="text"
                  name={filter.key}
                  value={tempFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                />
              </div>
            );
          }
        })}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
}, [safeActiveTab, tabsData, trancheId, tempFilters]);

  if (!safeActiveTab) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-6 text-center text-gray-500">
          Aucune donnée disponible pour cette tranche
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
                setSelectedType(null);
                setCurrentPage(1);
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
                    setCurrentPage(1);
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
            addLink={TAB_CONFIG[safeActiveTab]?.addLink?.(user, trancheId)}
            showSearch={false}
            filterComponent={filterComponent}
            onFilterToggle={handleFilterToggle}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">
                  Aucun {TAB_CONFIG[safeActiveTab]?.name?.toLowerCase()} disponible pour cette tranche
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
                onClose={() => setShowDeleteModal(false)}
                onSuccess={handleDeleteSuccess}
              />
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};