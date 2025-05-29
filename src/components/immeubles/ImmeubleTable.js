"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Edit, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { useProjet } from '@/context/ProjetContext';
import Input from '../Input';
import InputSelect from '../inputSelect';
import { fetchData_table_by_projet, fetchDataByProjet, fetchDataByProjet_params } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';

export default function ImmeubleTable({ projetId,trancheId, blocId }) {
  const [immeubles, setImmeubles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({nom: '', tranche: '', bloc: '',titre_foncier:''
});
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet } = useProjet(); // Get data from ProjetContext
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: '', tranche: '', bloc: '',titre_foncier:''
    };
    setFilters(reset);
    setTempFilters(reset);
  };
    const [blocs, setBlocs] = useState([]);
    const [tranches, setTranches] = useState([]);
  
    
      useEffect(() => {
        if (selectedProjet.nbre_tranches !== 0 && !trancheId && !blocId && tranches.length === 0) {
          fetchDataByProjet_params('tranches', setTranches, setLoading);
        }
        if (selectedProjet.nbre_blocs !== 0 && !blocId ) {
          if (trancheId && blocs.length === 0) {
            fetchDataByProjet_params('blocs', setBlocs,setLoading, { tranche_id: trancheId });
          } else if (blocs.length == 0) {
            fetchDataByProjet_params('blocs', setBlocs,setLoading);
          }
        }
        }, [
        trancheId, 
        blocId,
      ]);
    

   const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };
    
  // Check user permissions for managing immeubles
  const canManageImmeubles = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  // Define table columns with action buttons
  const columns = [
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
          <button
            className="text-teal-500 hover:text-teal-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {canManageImmeubles && (
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
  API_URL: "immeubles",
  dataKey: "data",
  name: "immeuble",
  searchFields: ['nom', 'titre_foncier'],
};

 const loadData = () => {
  const filtersToUse = {
    ...filters,
    ...(projetId ? { projet_id: projetId } : {}),
    ...(trancheId ? { tranche_id: trancheId } : {}),
    ...(blocId ? { bloc_id: blocId } : {})
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
    setImmeubles,
    setTotalRows
  );
};

useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, accessToken, projetId, trancheId, blocId, filters]);

  const formattedImmeubles = immeubles
    .filter(immeuble => 
      searchTerm === '' || 
      immeuble?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      immeuble?.bloc?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      immeuble?.titre_foncier?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(immeuble => ({
      id: immeuble?.id,
      nom: immeuble?.nom || '',
      bloc_nom: immeuble?.bloc?.nom || '',
      tranche_nom: immeuble?.tranche?.nom || '',
      titre_foncier: immeuble?.titre_foncier || '',
      nbre_biens: immeuble?.nbre_biens || '0'
    }));

  // Calculate paginated data
  const paginatedData = formattedImmeubles.slice(
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
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const data_to_export = () => {
  return paginatedData.map((immeuble) => ({
    'immeuble': immeuble?.nom || '',
    'Tranche': immeuble?.tranche?.nom || '',
    'Bloc': immeuble?.bloc?.nom || '',
    'Titre foncier': immeuble?.titre_foncier || '',
    'Date': immeuble?.created_at
      ? new Date(immeuble?.created_at).toLocaleDateString('fr-FR')
      : '',
    'nbre_biens': immeuble?.nbre_biens ?? 0,
  }));
};

   const columns_export = [
  { key: "immeuble", label: "Immeuble" },
  { key: "Bloc", label: "Bloc" },
  { key: "tranche", label: "Tranche" },
  { key: "Titre foncier", label: "Titre foncier" },
  { key: "nbre_biens", label: "Nombre de biens" },
  { key: "Date", label: "Date de création" },
];

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Immeubles/${id}`);
        break;
      case 'edit':
        router.push(`/Immeubles/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer cet immeuble ? Cette action est irréversible.")) {
          deleteImmeubleById(id);
        }
        break;
      default:
        console.log(`Action ${action} for immeuble ${id}`);
    }
  };

  // Delete immeuble
  const deleteImmeubleById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.IMMEUBLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Immeuble supprimé avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete immeuble:", err);
      toast.error("Erreur lors de la suppression de l'immeuble");
    }
  };
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageImmeubles 
    ? `/Immeubles/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div>
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={totalRows}
      loading={loading}
      error={error}
      filterComponent={
        <div className="space-y-4 p-4 rounded-lg">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
          >
            
              <Input
                label={'Nom'}
                type="text"
                placeholder="Nom..."
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
              />
              <Input
                label={'Titre foncier'}
                type="text"
                placeholder="titre_foncier..."
                value={tempFilters.titre_foncier}
                onChange={(e) => handleFilterChange("titre_foncier", e.target.value)}
                className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
              />

           
            {selectedProjet.nbre_tranches !== 0 && !trancheId && !blocId  && (
              <InputSelect
                label="Tranche"
                options={tranches.map(t => ({ label: t.nom, value: t.nom }))}
                value={tempFilters.tranche}
                onChange={(value) => handleFilterChange("tranche" ,value?.value || null)}
              />
            )}
    
            {selectedProjet.nbre_blocs !== 0 && !blocId && (
              <InputSelect
                label="Bloc"
                options={blocs.map(b => ({ label: b.nom, value: b.nom }))}
                value={tempFilters.bloc}
                onChange={(value) => handleFilterChange("bloc" ,value?.value || null)}
              />
            )}
          </div>

          {/* Boutons de contrôle */}
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
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      data_to_export={data_to_export()}
      columns_export={columns_export}
      name_file_export={"immeuble_export"}
      addLink={addButtonUrl}
      onFilterToggle={handleFilterToggle}
      onSearchChange={handleSearchChange}
      enableExport={formattedImmeubles.length > 0}
    />
     {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.IMMEUBLES}
            Id={selectedId}
            type="Immeuble"
            message={`Êtes-vous sûr de vouloir supprimer cet immeuble ?`
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
