"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Edit, Trash2 } from "lucide-react";
import Input from '../Input';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';

export default function TrancheTable({ projetId }) {
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({nom: '', niveau_etages: '', });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: '', code: '', type: '', adresse: '',date:''
    };
    setFilters(reset);
    setTempFilters(reset);
  };

   const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };
    
  // Check user permissions for managing tranches
  const canManageTranches = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  // Define table columns with action buttons
  const columns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'date_lancement', label: 'Date lancement' },
    { key: 'niveau_etages', label: 'Niveau d\'étages' },
    { key: 'date_livraison', label: 'Date livraison' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-teal-500 hover:text-teal-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {canManageTranches && (
            <>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}  
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

 const entity = {
     API_URL: "tranches",
     dataKey: "data",
     name: "tranche",
     searchFields: ['nom','tranche'],
   };
   
    const loadData = () => {
  const filtersToUse = {
    ...filters,
    ...(projetId ? { projet_id: projetId } : {}),
  };

  fetchData_table_by_projet(
    entity,
    filtersToUse,
    searchTerm,
    currentPage,
    rowsPerPage,
    accessToken,
    setLoading,
    setError,
    setTranches,
    setTotalRows
  );
};

useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, accessToken, projetId, filters,currentPage,rowsPerPage    ]);

  // Format tranches data for table
  const formattedTranches = tranches
    .filter(tranche => 
      searchTerm === '' || 
      tranche.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(tranche => ({
      id: tranche.id,
      nom: tranche.nom || 'Sans nom',
      date_lancement: tranche.date_lancement ? new Date(tranche.date_lancement).toLocaleDateString('fr-FR') : '',
      niveau_etages: tranche.niveau_etages || '',
      date_livraison: tranche.date_livraison ? new Date(tranche.date_livraison).toLocaleDateString('fr-FR') : ''
    }));

  // Calculate paginated data
  const paginatedData = formattedTranches.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
  };

  // Handle export
  const data_to_export = () => {
    return formattedTranches.map((tranche) => ({
      'Tranche': tranche.nom,
      "Date lancement": tranche.date_lancement,
      "Niveau d'étages": tranche.niveau_etages,
      "Date livraison": tranche.date_livraison
    }));

    };
    const columns_export = [
  { key: "Tranche", label: "Tranche" },
  { key: "Date lancement", label: "Date de lancement" },
  { key: "Niveau d'étages", label: "Niveau d'étages" },
  { key: "Date livraison", label: "Date de livraison" },
];


  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Tranches/${id}`);
        break;
      case 'edit':
        router.push(`/Tranches/${id}/modifier`);
        break;
     
      default:
        console.log(`Action ${action} for tranche ${id}`);
    }
  };

  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageTranches ? `/Tranches/ajouter?projet=${projetId}` : "";

  return (
    <div>
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={totalRows}
      loading={loading}
      filterComponent={
        <div className="space-y-4 p-4 rounded-lg">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
          >
            
              <Input
                label="Nom"
                type="text"
                name="nom"
                value={tempFilters.nom}
                onChange={handleFilterChange}
                placeholder="Nom..."
                className="h-9 px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
              />
            
              <Input
                label={'Niveau d\'étage'}
                type="text"
                name="niveau_etages"
                value={tempFilters.niveau_etages}
                onChange={handleFilterChange}
                placeholder="Niveau d'étage..."
                className="h-9 px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
              />
          
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
      }
      error={error}
      addLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedTranches.length > 0}
      data_to_export={data_to_export()}
      columns_export={columns_export}
      name_file_export={"tranche_export"}
      onFilterToggle={handleFilterToggle}
    />
     {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.TRANCHES}
            Id={selectedId}
            type="Tranche"
            message={`Êtes-vous sûr de vouloir supprimer ce tranche ?`
            }
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              loadData(); // Recharge les données après suppression

            }}
          />
        </Modal>
    )}
    </div>
  );
}
