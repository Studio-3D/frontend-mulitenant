import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StatusCard } from './StatusCard';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SelectInput from '@/components/SelectInput';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { APIURL } from '@/configs/api';
import Input from '@/components/Input';
import { ChevronDownIcon, HomeIcon } from 'lucide-react';
import Table from '@/components/Table';
import BienImport from '@/components/biens/BienImport';
import { getOrientationLabel } from '@/components/bien-utils'; // Import the new config

const TAB_CONFIG = {
  bien: {
    icon: <HomeIcon size={18} />,
    name: 'Biens',
    apiEndpoint: APIURL.BIENS,
    addLink: (user, immeubleId) =>
      isSuperAdmin(user?.role) || isAdmin(user?.role)
        ? `/Biens/ajouter?immeuble=${immeubleId}`
        : undefined,
    filters: (tabsData, immeubleId, nbre_tranches, nbre_blocs) => {
      // Get unique status values from the biens data
      const statusOptions = tabsData.bien?.items
        ? [...new Set(tabsData.bien.items.map((item) => item.status))]
            .filter((status) => status) // Remove empty/null values
            .map((status) => ({ label: status, value: status }))
        : [];
      // Get unique values for the new filters from ACTUAL project data
      const orientationOptions = tabsData.bien?.items
        ? [
            ...new Set(
              tabsData.bien.items
                .map((item) => item.orientation)
                .filter(Boolean)
            ),
          ].map((orientation) => {
            // Use the getOrientationLabel function to get the French label
            const label = getOrientationLabel(orientation);
            return { label: label, value: orientation };
          })
        : [];

      const typologieOptions = tabsData.bien?.items
        ? [
            ...new Set(
              tabsData.bien.items.map((item) => item.typologie).filter(Boolean)
            ),
          ].map((typologie) => ({ label: typologie, value: typologie }))
        : [];

      const vueOptions = tabsData.bien?.items
        ? [
            ...new Set(
              tabsData.bien.items.map((item) => item.vue).filter(Boolean)
            ),
          ].map((vue) => ({ label: vue, value: vue }))
        : [];

      const niveauOptions = tabsData.bien?.items
        ? [
            ...new Set(
              tabsData.bien.items.map((item) => item.etage).filter(Boolean)
            ),
          ].map((niveau) => ({ label: niveau, value: niveau }))
        : [];
      return [
        {
          key: 'name',
          label: 'Nom',
          type: 'text',
          placeholder: 'Nom...',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'numero',
          label: 'Numéro',
          type: 'text',
          placeholder: '',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'type',
          label: 'Type',
          type: 'select',
          placeholder: 'Sélectionner un type',
          options: tabsData.bien?.typeBienOptions || [],
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },

        {
          key: 'status',
          label: 'Statut',
          type: 'select',
          placeholder: 'Sélectionner un statut',
          options: statusOptions,
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        // New filters for orientation, typologie, vue, and niveau
        {
          key: 'orientation',
          label: 'Orientation',
          type: 'select',
          placeholder: 'Sélectionner une orientation',
          options: orientationOptions, // This will only show orientations that exist in the data
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'typologie',
          label: 'Typologie',
          type: 'select',
          placeholder: 'Sélectionner une typologie',
          options: typologieOptions,
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'vue',
          label: 'Vue',
          type: 'select',
          placeholder: 'Sélectionner une vue',
          options: vueOptions,
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'etage',
          label: 'Niveau',
          type: 'select',
          placeholder: 'Sélectionner un niveau',
          options: niveauOptions,
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        ...(nbre_tranches > 0
          ? [
              {
                key: 'tranche_nom',
                label: 'Tranche',
                type: 'select',
                placeholder: 'Sélectionner une tranche',
                options:
                  tabsData.bien?.tranches?.map((t) => ({
                    label: t.nom,
                    value: t.nom,
                  })) || [],
                className:
                  'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
              },
            ]
          : []),
        ...(nbre_blocs > 0
          ? [
              {
                key: 'bloc_nom',
                label: 'Bloc',
                type: 'select',
                placeholder: 'Sélectionner un bloc',
                options:
                  tabsData.bien?.blocs?.map((b) => ({
                    label: b.nom,
                    value: b.nom,
                  })) || [],
                className:
                  'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
              },
            ]
          : []),
        // Surface min and max
        {
          key: 'surface_min',
          label: 'Surface min',
          type: 'number',
          placeholder: 'Min...',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'surface_max',
          label: 'Surface max',
          type: 'number',
          placeholder: 'Max...',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        // Prix min and max
        {
          key: 'price_min',
          label: 'Prix min',
          type: 'number',
          placeholder: 'Min...',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
        {
          key: 'price_max',
          label: 'Prix max',
          type: 'number',
          placeholder: 'Max...',
          className:
            'h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full',
        },
      ];
    },
    columns: (user, handleDelete, nbre_tranches, nbre_blocs) => [
      { key: 'name', label: 'Nom' },
      { key: 'numero', label: 'Numéro' },
      { key: 'type', label: 'Type' },
      ...(nbre_tranches > 0 ? [{ key: 'tranche_nom', label: 'Tranche' }] : []),
      ...(nbre_blocs > 0 ? [{ key: 'bloc_nom', label: 'Bloc' }] : []),
      { key: 'surface', label: 'Surface' },
      { key: 'price', label: 'Prix' },
      {
        key: 'status',
        label: 'Statut',
        render: (row) => {
          let color = 'bg-gray-500'; // Default color

          // Add conditions based on the status value
          if (row.status === 'Disponible') {
            color = 'bg-green-500';
          } else if (row.status === 'Pré-réservé') {
            color = 'bg-yellow-500';
          } else if (row.status === 'Réservé') {
            color = 'bg-blue-500';
          } else if (row.status === 'Bloqué') {
            color = 'bg-red-500';
          } else if (row.status === 'Vendu') {
            color = 'bg-purple-500';
          } else if (row.status === 'En cours de proposition') {
            color = 'bg-orange-500';
          }

          return (
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded ${color} text-white`}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
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
        ),
      },
    ],
    exportConfig: (items, nbre_tranches, nbre_blocs) => ({
      data_to_export: items.map((item) => ({
        Nom: item.name || '',
        Numéro: item.numero || '',
        Type: item.type || '',
        ...(nbre_tranches > 0 && { Tranche: item.tranche_nom || '' }),
        ...(nbre_blocs > 0 && { Bloc: item.bloc_nom || '' }),
        Surface: item.surface || '',
        Prix: item.price || '',
        Statut: item.status || '',
      })),
      columns_export: [
        { key: 'Nom', label: 'Nom' },
        { key: 'Numéro', label: 'Numéro' },
        { key: 'Type', label: 'Type' },
        ...(nbre_tranches > 0 ? [{ key: 'Tranche', label: 'Tranche' }] : []),
        ...(nbre_blocs > 0 ? [{ key: 'Bloc', label: 'Bloc' }] : []),
        { key: 'Surface', label: 'Surface' },
        { key: 'Prix', label: 'Prix' },
        { key: 'Statut', label: 'Statut' },
      ],
      name_file_export: 'biens_export',
    }),
  },
};

export const RightCard = ({
  tabsData,
  activeTab,
  setActiveTab,
  fetchImmeubleData,
  immeubleId,
  breadcrumbContext,
  nbre_tranches,
  nbre_blocs,
  projetId,
  max_etages,
}) => {
  console.log('nb blocs ==>' + nbre_blocs);

  const [showImportModal, setShowImportModal] = useState(false);

  const { token, user } = useAuth();
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
      const filterConfig = TAB_CONFIG[activeTab].filters(
        tabsData,
        immeubleId,
        nbre_tranches,
        nbre_blocs
      );
      filterConfig.forEach((filter) => {
        initialFilters[filter.key] = '';
      });
    }
    setTempFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setShowFilter(false); // Hide filter when tab changes
  }, [activeTab, tabsData, immeubleId, nbre_tranches, nbre_blocs]);

  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    if (fetchImmeubleData) {
      fetchImmeubleData();
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setCurrentPage(1); // Reset to first page when applying filters
    setShowFilter(false); // Hide filter after applying
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {};
    if (TAB_CONFIG[activeTab]?.filters) {
      const filterConfig = TAB_CONFIG[activeTab].filters(
        tabsData,
        immeubleId,
        nbre_tranches,
        nbre_blocs
      );
      filterConfig.forEach((filter) => {
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
      items = items.filter((item) => item.type === selectedType);
    }

    // Apply text filters
    Object.keys(appliedFilters).forEach((key) => {
      if (appliedFilters[key]) {
        // Handle surface range filtering
        if (key === 'surface_min' && appliedFilters[key]) {
          const minValue = parseFloat(appliedFilters[key]);
          items = items.filter((item) => {
            const itemSurface = parseFloat(item.surface);
            return !isNaN(itemSurface) && itemSurface >= minValue;
          });
        } else if (key === 'surface_max' && appliedFilters[key]) {
          const maxValue = parseFloat(appliedFilters[key]);
          items = items.filter((item) => {
            const itemSurface = parseFloat(item.surface);
            return !isNaN(itemSurface) && itemSurface <= maxValue;
          });
        }
        // Handle price range filtering
        else if (key === 'price_min' && appliedFilters[key]) {
          const minValue = parseFloat(appliedFilters[key]);
          items = items.filter((item) => {
            const itemPrice = parseFloat(item.price);
            return !isNaN(itemPrice) && itemPrice >= minValue;
          });
        } else if (key === 'price_max' && appliedFilters[key]) {
          const maxValue = parseFloat(appliedFilters[key]);
          items = items.filter((item) => {
            const itemPrice = parseFloat(item.price);
            return !isNaN(itemPrice) && itemPrice <= maxValue;
          });
        }
        // Handle select filters (orientation, typologie, vue, etage, etc.)
        else if (
          [
            'orientation',
            'typologie',
            'vue',
            'etage',
            'status',
            'type',
            'tranche_nom',
            'bloc_nom',
          ].includes(key)
        ) {
          // For select filters, do exact matching
          items = items.filter((item) => {
            const itemValue = item[key]?.toString().toLowerCase();
            const filterValue = appliedFilters[key]?.toString().toLowerCase();
            return itemValue === filterValue;
          });
        }
        // Handle other text filters
        else if (
          key !== 'surface_min' &&
          key !== 'surface_max' &&
          key !== 'price_min' &&
          key !== 'price_max'
        ) {
          items = items.filter((item) =>
            item[key]
              ?.toString()
              .toLowerCase()
              .includes(appliedFilters[key].toLowerCase())
          );
        }
      }
    });

    return items;
  }, [tabsData, activeTab, selectedType, appliedFilters]);

  // Step 2: Calculate paginated items separately
  const paginatedItems = useMemo(() => {
    // Update total rows count based on filtered data
    setTotalRows(filteredItems.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, rowsPerPage]);
  const currentColumns = useMemo(() => {
    if (!activeTab || !TAB_CONFIG[activeTab]) return [];

    const columnConfig = TAB_CONFIG[activeTab].columns;
    return typeof columnConfig === 'function'
      ? columnConfig(user, handleDelete, nbre_tranches, nbre_blocs)
      : columnConfig;
  }, [activeTab, user, handleDelete, nbre_tranches, nbre_blocs]);

  // Show all tabs regardless of count
  const availableTabs = useMemo(() => {
    return Object.keys(tabsData).filter(
      (tab) => tabsData[tab] !== undefined && tabsData[tab] !== null
    );
  }, [tabsData]);

  const safeActiveTab = useMemo(() => {
    return availableTabs.includes(activeTab)
      ? activeTab
      : availableTabs[0] || null;
  }, [activeTab, availableTabs]);

  // Filter component for all tabs

  // Filter component for all tabs
  const filterComponent = useMemo(() => {
    if (!TAB_CONFIG[safeActiveTab]?.filters) return null;

    const filterConfig = TAB_CONFIG[safeActiveTab].filters(
      tabsData,
      immeubleId,
      nbre_tranches,
      nbre_blocs
    );

    return (
      <div className="space-y-4">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          {filterConfig.map((filter) => {
            // Group surface min and max in the same row
            if (filter.key === 'surface_min' || filter.key === 'surface_max') {
              const minFilter = filterConfig.find(
                (f) => f.key === 'surface_min'
              );
              const maxFilter = filterConfig.find(
                (f) => f.key === 'surface_max'
              );

              // Only render once (for surface_min)
              if (filter.key === 'surface_min') {
                return (
                  <div key="surface_range" className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Surface
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          name="surface_min"
                          value={tempFilters.surface_min || ''}
                          onChange={(e) =>
                            handleFilterChange('surface_min', e.target.value)
                          }
                          placeholder={minFilter?.placeholder || 'Min...'}
                          className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          name="surface_max"
                          value={tempFilters.surface_max || ''}
                          onChange={(e) =>
                            handleFilterChange('surface_max', e.target.value)
                          }
                          placeholder={maxFilter?.placeholder || 'Max...'}
                          className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }

            // Group price min and max in the same row
            if (filter.key === 'price_min' || filter.key === 'price_max') {
              const minFilter = filterConfig.find((f) => f.key === 'price_min');
              const maxFilter = filterConfig.find((f) => f.key === 'price_max');

              // Only render once (for price_min)
              if (filter.key === 'price_min') {
                return (
                  <div key="price_range" className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Prix
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          name="price_min"
                          value={tempFilters.price_min || ''}
                          onChange={(e) =>
                            handleFilterChange('price_min', e.target.value)
                          }
                          placeholder={minFilter?.placeholder || 'Min...'}
                          className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          name="price_max"
                          value={tempFilters.price_max || ''}
                          onChange={(e) =>
                            handleFilterChange('price_max', e.target.value)
                          }
                          placeholder={maxFilter?.placeholder || 'Max...'}
                          className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }

            // Handle other filter types (select, text, number)
            if (filter.type === 'select') {
              return (
                <div key={filter.key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <SelectInput
                    options={filter.options || []}
                    placeholder={filter.placeholder}
                    value={tempFilters[filter.key] || ''}
                    onChange={(selectedValue) =>
                      handleFilterChange(filter.key, selectedValue)
                    }
                    width="w-full"
                  />
                </div>
              );
            } else {
              return (
                <div key={filter.key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <Input
                    type={filter.type || 'text'}
                    name={filter.key}
                    value={tempFilters[filter.key] || ''}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
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
  }, [
    safeActiveTab,
    tabsData,
    immeubleId,
    tempFilters,
    nbre_tranches,
    nbre_blocs,
  ]);

  // Inside the RightCard component, add this code to get the export configuration
  const exportConfig = useMemo(() => {
    if (!TAB_CONFIG[safeActiveTab]?.exportConfig) return null;

    const exportConfigFn = TAB_CONFIG[safeActiveTab].exportConfig;

    // Pass the appropriate parameters based on the active tab
    switch (safeActiveTab) {
      case 'bien':
        return exportConfigFn(filteredItems, nbre_tranches, nbre_blocs);
      default:
        return exportConfigFn(filteredItems);
    }
  }, [safeActiveTab, filteredItems, nbre_tranches, nbre_blocs]);

  const currentTabData = tabsData[safeActiveTab];
  const hasItems = filteredItems.length > 0;

  // Calculate status counts for filtered items (for bien tab only)
  const filteredStatusCounts = useMemo(() => {
    if (safeActiveTab !== 'bien' || !filteredItems.length) return null;

    const counts = {};
    filteredItems.forEach((item) => {
      if (item.status) {
        counts[item.status] = (counts[item.status] || 0) + 1;
      }
    });

    return counts;
  }, [safeActiveTab, filteredItems]); // Use filteredItems instead of paginatedItems
  // Get the status cards data with filtered counts
  const persistAddBienContext = useCallback(() => {
    try {
      if (!tabsData) return;
      const ctx = breadcrumbContext || {};
      localStorage.setItem('bienBreadcrumbContext', JSON.stringify(ctx));
    } catch {}
  }, [breadcrumbContext, tabsData]);

  const statusCardsData = useMemo(() => {
    if (safeActiveTab !== 'bien' || !currentTabData.statuses) return null;

    return currentTabData.statuses.map((status) => ({
      ...status,
      // Use filtered count if available, otherwise fall back to original count
      count: filteredStatusCounts?.[status.name] || 0,
    }));
  }, [safeActiveTab, currentTabData.statuses, filteredStatusCounts]);

  if (!safeActiveTab) {
    return (
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-6 text-center text-gray-500">
          Aucune donnée disponible pour cet immeuble
        </div>
      </div>
    );
  }

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
            {statusCardsData && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {statusCardsData.map((status, index) => (
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
            addLink={{
              pathname: TAB_CONFIG[safeActiveTab]?.addLink?.(user, immeubleId),
              onClick: persistAddBienContext,
            }}
            showSearch={false}
            filterComponent={filterComponent}
            onFilterToggle={handleFilterToggle}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">
                  Aucun {TAB_CONFIG[safeActiveTab]?.name?.toLowerCase()}{' '}
                  disponible pour cet immeuble
                </p>
              </div>
            }
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalRows={totalRows}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            data_to_export={exportConfig?.data_to_export || []}
            columns_export={exportConfig?.columns_export || []}
            name_file_export={exportConfig?.name_file_export || 'export'}
            enableExport={filteredItems.length > 0}
            enableImport={user.role <= 2 && safeActiveTab == 'bien'}
            onImportClick={() => setShowImportModal(true)}
          />
          <BienImport
            open={showImportModal}
            onClose={() => setShowImportModal(false)}
            projetId={projetId}
            max_etages={max_etages}
          />
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
              <DeleteData
                route={TAB_CONFIG[safeActiveTab]?.apiEndpoint}
                Id={selectedId}
                type={TAB_CONFIG[safeActiveTab]?.name}
                message={`Êtes-vous sûr de vouloir supprimer ce ${TAB_CONFIG[
                  safeActiveTab
                ]?.name.toLowerCase()} ?`}
                accessToken={token || localStorage.getItem('accessToken')}
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
