"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Pencil, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import InputSelect from '../inputSelect';
import Input from '../Input';
import { useProjet } from '@/context/ProjetContext';
import { fetchData_table_by_projet, fetchDataByProjet, fetchDataByProjet_params } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';

export default function BlocTable({ projetId,trancheId }) {
  const [blocs, setBlocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({nom: '', tranche: '',titre_foncier:''});
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet } = useProjet(); // Get data from ProjetContext
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [tranches, setTranches] = useState([]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: '', tranche: '',titre_foncier:''
    };
    setFilters(reset);
    setTempFilters(reset);
  };

   const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };
    
  // Check user permissions for managing blocs
  const canManageBlocs = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  useEffect(() => {
    if (selectedProjet.nbre_tranches!==0 &&  tranches.length===0 && !trancheId)  {
      fetchDataByProjet_params('tranches', setTranches, setLoading);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trancheId,
       
  ]);

  const columns = [
    { key: 'nom', label: 'Bloc' },
    { key: 'tranche_nom', label: 'Tranche' },
    { key: 'titre_foncier', label: 'Titre foncier' },
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
          
          {canManageBlocs && (
            <>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
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
    API_URL: "blocs",
    dataKey: "data",
    name: "bloc",
    searchFields: ['nom','tranche'],
  };
  
   const loadData = () => {
  const filtersToUse = {
    ...filters,
    ...(projetId ? { projet_id: projetId } : {}),
    ...(trancheId ? { tranche_id: trancheId } : {}),
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
    setBlocs,
    setTotalRows
  );
};

useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, accessToken, projetId, trancheId, filters,currentPage,rowsPerPage  ]);

  // Format blocs data for table
  const formattedBlocs = blocs
    .filter(bloc => 
      searchTerm === '' || 
      bloc.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bloc.tranche?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bloc.titre_foncier?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bloc => ({
      id: bloc.id,
      nom: bloc.nom || 'Sans nom',
      tranche_nom: bloc.tranche?.nom || '',
      titre_foncier: bloc.titre_foncier || ''
    }));

  // Calculate paginated data
  const paginatedData = formattedBlocs.slice(
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

  // Handle export - This is the functionality we're keeping
const data_to_export = () => {
    return blocs.map((bloc) => ({
      'Bloc': bloc?.nom|| '',
      'Tranche': bloc?.tranche?.nom|| '',
      "Titre foncier": bloc?.titre_foncier|| '',
      "Date de création": bloc?.created_at ? new Date(bloc.created_at).toLocaleDateString('fr-FR') : ''|| '',
      'nbre_immeubles': bloc?.nbre_immeubles|| '',
      'nbre_biens': bloc?.nbre_biens|| '',
    }));
  }

const columns_export = [
  { key: "Bloc", label: "Bloc" },
  { key: "Tranche", label: "Tranche" },
  { key: "Titre foncier", label: "Titre foncier" },
  { key: "Date de création", label: "Date de création" },
  { key: "nbre_immeubles", label: "Nombre d'immeubles" },
  { key: "nbre_biens", label: "Nombre de biens" },
];


  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Blocs/${id}`);
        break;
      case 'edit':
        router.push(`/Blocs/${id}/modifier`);
        break;
      
      default:
        console.log(`Action ${action} for bloc ${id}`);
    }
  };

  
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageBlocs 
    ? `/Blocs/ajouter?projet=${projetId}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div>
    <Table
      data_to_export={data_to_export()}
      columns_export={columns_export}
      name_file_export={"bloc_export"}
      columns={columns}
      data={paginatedData || []}        
      totalRows={totalRows}
      loading={loading}
      filterComponent={
        <div className="space-y-4 p-4 rounded-lg">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
          >
              <Input
                label={'Nom'}
                name="nom"
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                placeholder="Nom..."
              />
              <Input
                label={'Titre foncier'}
                name="titre_foncier"
                value={tempFilters.titre_foncier}
                onChange={(e) => handleFilterChange("titre_foncier", e.target.value)}
                placeholder="Titre foncier..."
              />
              

            {selectedProjet.nbre_tranches !== 0 && !trancheId && (
              
                <InputSelect
                  label="Tranche"
                  options={tranches.map(t => ({ label: t.nom, value: t.nom }))}
                  value={tempFilters.tranche}
                  onChange={(value) => handleFilterChange("tranche" ,value?.value || null)}
                />
            )}

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
      enableExport={formattedBlocs.length > 0} // Only enable if we have data
      onFilterToggle={handleFilterToggle}
    />
     {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.BLOCS}
            Id={selectedId}
            type="Bloc"
            message={`Êtes-vous sûr de vouloir supprimer ce bloc ?`
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
