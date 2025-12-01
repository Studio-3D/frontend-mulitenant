import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StatusCard } from './StatusCard';
import { Download, Eye, PencilLine, Trash2 } from 'lucide-react';
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
import toast from 'react-hot-toast';
import axios from 'axios';
import { handleExportExcel } from '@/configs/export'; // Ajoutez cette ligne

const TAB_CONFIG = {
  bien: {
    icon: <HomeIcon size={18} />,
    name: 'Biens',
    apiEndpoint: APIURL.BIENS,
    addLink: (user, immeubleId, projetId) =>
      isSuperAdmin(user?.role) || isAdmin(user?.role)
        ? `/Biens/ajouter?projet=${projetId}&immeuble=${immeubleId}`
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

    exportConfig: (items, nbre_tranches, nbre_blocs) => {
      const baseExportData = items.map((item) => ({
        // Colonnes principales (sans id et type_id)
        Nom: item.name || '',
        Nom_projet: item.nom_projet,
        Numero: item.numero || '',
        Type: item.type || '',
        ...(nbre_tranches > 0 && { Tranche: item.tranche_nom || '' }),
        ...(nbre_blocs > 0 && { Bloc: item.bloc_nom || '' }),
        Immeuble: item.immeuble_nom,
        Surface: item.surface || '',
        Prix: item.price || '',
        Statut: item.status || '',
        Orientation: item.orientation || '',
        Niveau: item.etage || '', // Utilise la valeur formatée (RDC, 1er étage, etc.)
        Typologie: item.typologie || '',
        Vue: item.vue || '',
        Conventionné: item.conventionne || 0,
        'Prix parking': item.prix_parking || 0,
        'Prix unitaire': item.prix_unitaire || 0,
        'Numero parking': item.num_parking || '',
        'Numero box': item.num_box || '',
        'Prix box': item.prix_box || 0,
        'Avance minimale': item.avance_minimale || 0,
        'Superficie architecte': item.superficie_architecte || 0,
        'Superficie habitable': item.superficie_habitable || 0,
        'Nombre façades': item.nbre_facades || 0,
        'Superficie parking': item.superficie_parking || 0,
        'Superficie box': item.superficie_box || 0,
        'Superficie terrasse': item.superficie_terrasse || 0,
        'Superficie terrasse calculée': item.superficie_terrasse_calculer || 0,
        'Superficie balcon': item.superficie_balcon || 0,
        'Superficie balcon calculée': item.superficie_balcon_calculer || 0,
        'Superficie jardin': item.superficie_jardin || 0,
        'Superficie jardin calculée': item.superficie_jardin_calculer || 0,
        'Titre foncier': item.titre_foncier || 0,
        'Superficie totale': item.superficie_total || 0,
        'Superficie vendable': item.superficie_vendable || 0,
        // Données de la première composition seulement
        'Nombre chambres': item.nbre_chambres || 0,
        'Nombre salons': item.nbre_salons || 0,
        'Nombre salles de bain': item.nbre_sdb || 0,
        'Nombre cuisines': item.nbre_cuisines || 0,
        'Nombre halls': item.nbre_halls || 0,
        'Nombre terrasses': item.nbre_terasses || 0,
        'Nombre balcons': item.nbre_balcons || 0,
        'Nombre buanderies': item.nbre_buanderies || 0,
        'Nombre placards': item.nbre_placards || 0,
        'Nombre réceptions': item.nbre_receptions || 0,
      }));

      const baseColumns = [
        { key: 'Nom', label: 'Nom' },
        { key: 'Numero', label: 'Numero' },
        { key: 'Type', label: 'Type' },
        { key: 'Nom_projet', label: 'Projet' },
        ...(nbre_tranches > 0 ? [{ key: 'Tranche', label: 'Tranche' }] : []),
        ...(nbre_blocs > 0 ? [{ key: 'Bloc', label: 'Bloc' }] : []),
        { key: 'Immeuble', label: 'Immeuble' },
        { key: 'Surface', label: 'Surface' },
        { key: 'Prix', label: 'Prix' },
        { key: 'Statut', label: 'Statut' },
        { key: 'Orientation', label: 'Orientation' },
        { key: 'Niveau', label: 'Niveau' },
        { key: 'Typologie', label: 'Typologie' },
        { key: 'Vue', label: 'Vue' },
        { key: 'Conventionné', label: 'Conventionné' },
        { key: 'Prix unitaire', label: 'Prix unitaire' },
        { key: 'Numero parking', label: 'Numero parking' },
        { key: 'Prix parking', label: 'Prix parking' },
        { key: 'Numero box', label: 'Numero box' },
        { key: 'Prix box', label: 'Prix box' },
        { key: 'Avance minimale', label: 'Avance minimale' },
        { key: 'Superficie architecte', label: 'Superficie architecte' },
        { key: 'Superficie habitable', label: 'Superficie habitable' },
        { key: 'Nombre façades', label: 'Nombre façades' },
        { key: 'Superficie parking', label: 'Superficie parking' },
        { key: 'Superficie box', label: 'Superficie box' },
        { key: 'Superficie terrasse', label: 'Superficie terrasse' },
        {
          key: 'Superficie terrasse calculée',
          label: 'Superficie terrasse calculée',
        },
        { key: 'Superficie balcon', label: 'Superficie balcon' },
        {
          key: 'Superficie balcon calculée',
          label: 'Superficie balcon calculée',
        },
        { key: 'Superficie jardin', label: 'Superficie jardin' },
        {
          key: 'Superficie jardin calculée',
          label: 'Superficie jardin calculée',
        },
        { key: 'Titre foncier', label: 'Titre foncier' },
        { key: 'Superficie totale', label: 'Superficie totale' },
        { key: 'Superficie vendable', label: 'Superficie vendable' },
        // Colonnes de composition (première composition seulement)
        { key: 'Nombre chambres', label: 'Nombre chambres' },
        { key: 'Nombre salons', label: 'Nombre salons' },
        { key: 'Nombre salles de bain', label: 'Nombre salles de bain' },
        { key: 'Nombre cuisines', label: 'Nombre cuisines' },
        { key: 'Nombre halls', label: 'Nombre halls' },
        { key: 'Nombre terrasses', label: 'Nombre terrasses' },
        { key: 'Nombre balcons', label: 'Nombre balcons' },
        { key: 'Nombre buanderies', label: 'Nombre buanderies' },
        { key: 'Nombre placards', label: 'Nombre placards' },
        { key: 'Nombre réceptions', label: 'Nombre réceptions' },
      ];

      return {
        data_to_export: baseExportData,
        columns_export: baseColumns,
        name_file_export: 'biens_export',
      };
    },
    massEditExportConfig: (items, nbre_tranches, nbre_blocs) => {
      // Récupérer la configuration de base
      const baseConfig = TAB_CONFIG.bien.exportConfig(
        items,
        nbre_tranches,
        nbre_blocs
      );

      // Filtrer les données
      const massEditData = items.map((item, index) => {
        const baseData = baseConfig.data_to_export[index];

        // Créer un nouvel objet sans les colonnes problématiques
        const { Type, ...cleanData } = baseData;

        return {
          ID: item.id || '',
          'Type ID': item.type_id || '',
          ...cleanData,
        };
      });

      // Filtrer les colonnes - supprimer complètement Tranche, Bloc, Immeuble
      const massEditColumns = [
        { key: 'ID', label: 'ID' },
        { key: 'Type ID', label: 'Type' },
        ...baseConfig.columns_export.filter(
          (column) => !['Type'].includes(column.key)
        ),
      ];

      return {
        data_to_export: massEditData,
        columns_export: massEditColumns,
        name_file_export: 'biens_export_mass_edit',
      };
    },
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
  trancheId,
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMassEditModal, setShowMassEditModal] = useState(false); // Nouvel état pour le modal de modification en masse
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  // Function to update file display
  const updateFileDisplay = (file) => {
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone && file) {
      dropZone.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-gray-700">${file.name}</p>
            <p class="text-xs text-gray-500">${(
              file.size /
              1024 /
              1024
            ).toFixed(2)} MB</p>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">Fichier sélectionné avec succès</p>
      `;
    }
  };

  // Function to handle import button click
  const handleImportClick = async () => {
    if (!selectedFile) return;

    // Use the existing import function
    await handleMassEditImport(selectedFile);
  };

  // Update the reset function to also clear selected file
  const resetImportInterface = () => {
    const fileInput = document.getElementById('mass-edit-file');
    if (fileInput) {
      fileInput.value = '';
    }

    // Reset file display
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone) {
      dropZone.innerHTML = `
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600">
          <span class="text-green-600 font-medium">Cliquez pour sélectionner</span> ou glissez-déposez votre fichier
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Formats acceptés: .xlsx, .xls
        </p>
      `;
    }

    setSelectedFile(null);
  };
  // Fonction pour exporter les biens pour modification en masse
  const handleMassEditExport = () => {
    if (safeActiveTab === 'bien' && TAB_CONFIG.bien.massEditExportConfig) {
      const massEditConfig = TAB_CONFIG.bien.massEditExportConfig(
        filteredItems, // Utiliser filteredItems pour inclure tous les biens filtrés
        nbre_tranches,
        nbre_blocs
      );

      handleExportExcel(
        massEditConfig.data_to_export,
        massEditConfig.columns_export,
        `${massEditConfig.name_file_export}.xlsx`
      );
    }
  };
  // Fonction pour exporter les biens pour modification en masse
  // Fonction pour gérer l'import des modifications en masse
  const handleMassEditImport = async (file) => {
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setImportErrors([
        {
          id: 0,
          msg: 'Veuillez sélectionner un fichier Excel (.xlsx ou .xls)',
        },
      ]);
      return;
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImportErrors([
        { id: 0, msg: 'Le fichier est trop volumineux. Taille maximale: 10MB' },
      ]);
      return;
    }

    try {
      setIsImporting(true);
      setImportErrors([]);

      // Traitement du fichier Excel
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          let rows = XLSX.utils.sheet_to_json(sheet);
          const rawHeaders = jsonData[0] || [];
          const normalizedHeaders = rawHeaders.map((h) =>
            h?.toString().trim().toLowerCase()
          );

          let msg_error = [];
          let err = 0;

          // Headers requis pour la modification en masse
          let requiredHeaders = [
            'id',
            'numero',
            'nom',
            'prix unitaire',
            'superficie totale',
            'superficie habitable',
            'type',
          ];

          const missingHeaders = requiredHeaders.filter(
            (h) => !normalizedHeaders.includes(h)
          );
          if (missingHeaders.length > 0) {
            msg_error.push({
              id: 0,
              msg: `Colonnes manquantes: ${missingHeaders.join(', ')}`,
            });
            err = 1;
          }

          if (rows.length > 0) {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];

              // Vérification des surfaces
              if ('Superficie totale' in row && 'Superficie habitable' in row) {
                if (
                  row['Superficie totale'] == 0 &&
                  row['Superficie habitable'] == 0
                ) {
                  msg_error.push({
                    id: i + 1,
                    msg: `Ligne ${i + 1}: Aucune surface habitable ou totale`,
                  });
                  err = 1;
                }
              } else if (
                !('Superficie totale' in row) &&
                'Superficie habitable' in row
              ) {
                if (row['Superficie habitable'] == 0) {
                  msg_error.push({
                    id: i + 1,
                    msg: `Ligne ${i + 1}: Surface habitable doit être > 0`,
                  });
                  err = 1;
                }
              } else if (
                !('Superficie habitable' in row) &&
                'Superficie totale' in row
              ) {
                if (row['Superficie totale'] == 0) {
                  msg_error.push({
                    id: i + 1,
                    msg: `Ligne ${i + 1}: Surface totale doit être > 0`,
                  });
                  err = 1;
                }
              } else {
                msg_error.push({
                  id: i + 1,
                  msg: `Ligne ${i + 1}: Aucune surface définie`,
                });
                err = 1;
              }

              // Vérification des IDs
              if (!row['ID'] && !row['id']) {
                msg_error.push({
                  id: i + 1,
                  msg: `Ligne ${i + 1}: ID manquant`,
                });
                err = 1;
              }

              // Vérification de Numero
              if (!row['Numero'] && !row['numero']) {
                msg_error.push({
                  id: i + 1,
                  msg: `Ligne ${i + 1}: Numero manquant`,
                });
                err = 1;
              }

              // Vérification de Type (avec valeurs comme "magasin")
              if (!row['Type'] && !row['type']) {
                msg_error.push({
                  id: i + 1,
                  msg: `Ligne ${i + 1}: Type manquant`,
                });
                err = 1;
              }
            }

            if (err == 1 || msg_error.length > 0) {
              setImportErrors(msg_error);
            } else {
              // Envoyer les données au backend
              sendMassEditDataToBackend(rows, file);
            }
          } else {
            setImportErrors([{ id: 0, msg: 'Le fichier est vide' }]);
          }
        } catch (error) {
          console.error('Erreur lors du traitement du fichier:', error);
          setImportErrors([
            { id: 0, msg: 'Erreur lors de la lecture du fichier Excel' },
          ]);
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setImportErrors([{ id: 0, msg: 'Erreur de lecture du fichier' }]);
        setIsImporting(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
      setImportErrors([{ id: 0, msg: "Erreur lors de l'import du fichier" }]);
      setIsImporting(false);
    }
  };

  // Fonction pour envoyer les données au backend
  const sendMassEditDataToBackend = async (jsonData, file) => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('projet_id', projetId);
      dataToSend.append('jsonData', JSON.stringify(jsonData));
      dataToSend.append('is_mass_edit', 'true');

      if (file != null) {
        dataToSend.append('piece_jointe', file);
      }

      const response = await axios.post(
        `${APIURL.ROOTV1}/upload_excel_bien_modif_en_masse`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      // Succès - réinitialiser et fermer
      setImportErrors([]);

      // Fermer le modal après import réussi
      setShowMassEditModal(false);
      toast.success(
        `Import programmé avec succès, consulter l'historique des imports pour plus de détails`
      );
      // toast.success(`${jsonData.length} biens modifiés avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      const errorMessage =
        error.response?.data?.error || "Erreur lors de l'import";
      setImportErrors([{ id: 0, msg: errorMessage }]);
    } finally {
      setIsImporting(false);
    }
  };

  // Configuration pour l'action personnalisée de modification en masse
  const massEditAction = useMemo(() => {
    if (safeActiveTab === 'bien') {
      return {
        label: 'Modifier en masse',
        className: 'bg-purple-600 hover:bg-purple-700',
        onClick: () => {
          setImportErrors([]); // ← Réinitialiser les erreurs
          setShowMassEditModal(true);
        },
        icon: <PencilLine className="w-5 h-5" />,
      };
    }
    return null;
  }, [safeActiveTab]);

  const customActions = useMemo(() => {
    const actions = [];
    if (massEditAction) {
      actions.push(massEditAction);
    }
    return actions;
  }, [massEditAction]);

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
              pathname: TAB_CONFIG[safeActiveTab]?.addLink?.(
                user,
                immeubleId,
                projetId
              ),
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
            customActions={customActions} // Passer les actions personnalisées
          />
          <BienImport
            open={showImportModal}
            onClose={() => setShowImportModal(false)}
            projetId={projetId}
            max_etages={max_etages}
            tranche_id_get={trancheId}
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

          {showMassEditModal && (
            <Modal
              isVisible={true}
              onClose={() => {
                setShowMassEditModal(false);
                setSelectedFile(null);
                setImportErrors([]);
                resetImportInterface();
              }}
            >
              <div className="p-6 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Modification en masse des biens
                </h2>

                {/* Messages d'information */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Comment modifier vos biens en masse ?
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                      <li className="font-medium">
                        Exportez le fichier Excel contenant tous les biens
                        (inclut ID)
                      </li>
                      <li className="font-medium">
                        Modifiez les données dans Excel
                      </li>
                      <li className="font-medium">
                        Importez le fichier modifié via la zone de dépôt
                        ci-dessous
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-yellow-700 text-sm">
                        <strong>Important :</strong>
                        <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                          <li>
                            Ne modifiez pas la colonne <strong>ID</strong> dans
                            le fichier Excel, elle est essentielle pour
                            identifier les biens.
                          </li>
                          <li>
                            Les colonnes{' '}
                            <strong>Projet ,Tranche, Bloc et Immeuble</strong>{' '}
                            ne sont pas prises en compte lors de {"l'import"}.
                            Pour modifier ces informations, veuillez utiliser
                            les formulaires individuels de chaque bien.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section d'export */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Étape 1 : Exporter les données
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Téléchargez le fichier Excel contenant tous vos biens avec
                    leurs identifiants.
                  </p>
                  <button
                    onClick={handleMassEditExport}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">
                      Exporter pour modification en masse
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Fichier :{' '}
                    {exportConfig?.name_file_export || 'biens_export_mass_edit'}
                    .xlsx
                  </p>
                </div>

                {/* Section d'import intégrée */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-700 mb-3">
                    Étape 2 : Importer les modifications
                  </h3>
                  <p className="text-green-600 text-sm mb-4">
                    Une fois vos modifications terminées dans Excel, importez le
                    fichier pour mettre à jour vos biens.
                  </p>

                  {/* Zone de dépôt de fichier */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionnez votre fichier Excel modifié
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="mass-edit-file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImportErrors([]);
                            // Store the file for later import
                            setSelectedFile(file);
                            // Update the file display
                            updateFileDisplay(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="mass-edit-file"
                        className="flex-1 cursor-pointer"
                      >
                        <div
                          id="file-drop-zone"
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 hover:bg-green-25 transition-colors"
                        >
                          <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">
                            <span className="text-green-600 font-medium">
                              Cliquez pour sélectionner
                            </span>{' '}
                            ou glissez-déposez votre fichier
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formats acceptés : .xlsx, .xls
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* File info and import button */}
                  {selectedFile && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            resetImportInterface();
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Import Button */}
                  {selectedFile && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                          isImporting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        } text-white`}
                      >
                        {isImporting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Import en cours...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Importer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Informations sur le format */}
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-700 text-sm mb-2">
                      Format attendu :
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>
                        • Fichier Excel (.xlsx, .xls) avec les mêmes colonnes
                        que {"l'export"}
                      </li>
                      <li>
                        • Conservez la colonne <strong>ID</strong> intacte
                      </li>
                      <li>
                        • Les colonnes{' '}
                        <strong>Tranche, Bloc et Immeuble</strong> sont ignorées
                        lors de {"l'import"}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Affichage des erreurs */}
                {importErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2">
                      Erreurs détectées :
                    </h4>
                    <ul className="text-red-600 text-sm space-y-1 max-h-32 overflow-y-auto">
                      {importErrors.map((error, index) => (
                        <li key={index}>• {error.msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Indicateur de progression */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span
                      className={`font-medium ${
                        filteredItems.length > 0
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      ✓ Données prêtes à {"l'export"}
                    </span>
                    <span className="text-gray-400">
                      {filteredItems.length} biens disponibles
                    </span>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};
