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
import BienFilter from './BienFilter';
import { useProjet } from '@/context/ProjetContext';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { decryptBienEtat, getEtatLabel, rowBienBackgroundColors } from '../bien-utils';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { selectedProjet } = useProjet();
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  

  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({propriete_dite_bien: '',
      immeuble:'',
      bloc:'',
      tranche:'',
      type_id:'',
      vue:'',
      typologie:'',
      etat:'',
      orientation:'',
      niveau:'',
      prix_min:'',
      prix_max:'',
      superficie_min:'',
      superficie_max:'',
    });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      propriete_dite_bien: '',
      num:'',
      immeuble:'',
      bloc:'',
      tranche:'',
      type_id:'',
      vue:'',
      typologie:'',
      etat:'',
      orientation:'',
      niveau:'',
      prix_min:'',
      prix_max:'',
      superficie_min:'',
      superficie_max:'',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

   const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

  // Format property status using the helper function from enum.js
  const formatEtat = (etat) => {
    return getEtatLabel(etat);
  };

  // Define table columns with action buttons
  const columns = [
    { key: 'propriete_dite_bien', label: 'Désignation' },
    { key: 'numero', label: 'Numéro' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'immeuble_nom', label: 'Immeuble' },
    { key: 'prix', label: 'Prix (Dhs)' },
    {
        key: 'etat',
        label: 'État',
        render: (row) => {
          const label = getEtatLabel(row.etat);
          const color = rowBienBackgroundColors[decryptBienEtat(row.etat)];
          return (
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
          );
        }
      },    
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        // Check user permissions for managing biens
        const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
        
        return (
          <div className="flex gap-4 items-center">
            {/* View button - available to all users */}
            <button
              className="text-gray-500 hover:text-blue-500"
              onClick={() => handleAction('view', row.id)}
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {canManageBiens && (
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
        );
      }
    }
  ];

  const entity = {
   API_URL: "biens",
   dataKey: "data",
   name: "bien",
   searchFields: ['nom','tranche','bloc','immeuble'],
 };
 
  const loadData = () => {
  const filtersToUse = {
    ...filters,
    ...(projetId ? { projet_id: projetId } : {}),
    ...(trancheId ? { tranche_id: trancheId } : {}),
    ...(blocId ? { bloc_id: blocId } : {}),
    ...(immeubleId ? { immeuble_id: immeubleId } : {})
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
    setBiens,
    setTotalRows
  );
};

useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, accessToken, projetId, trancheId, blocId, immeubleId, filters]);

  // Format biens data for table
  const formattedBiens = biens
    .filter(bien => 
      searchTerm === '' || 
      bien.propriete_dite_bien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.immeuble?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bien => ({
      id: bien.id,
      propriete_dite_bien: bien.propriete_dite_bien || 'Sans nom',
      numero: bien.numero || '',
      niveau: bien.niveau?.toString() || '',
      immeuble_nom: bien.immeuble?.nom || '',
      prix: bien.prix?.toLocaleString('fr-FR') || '0',
      etat: bien.etat 
    }));

  // Calculate paginated data
  const paginatedData = formattedBiens.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1);
  };

const data_to_export = () => {
    return formattedBiens.map((bien) => ({
      Désignation: bien.propriete_dite_bien,
      Numéro: bien.numero,
      Niveau: bien.niveau,
      Immeuble: bien.immeuble_nom,
      Prix: bien.prix,
      État: bien.etat
    }));
  };  

  const columns_export = [
  { key: "Désignation", label: "Désignation" },
  { key: "Numéro", label: "Numéro" },
  { key: "Niveau", label: "Niveau" },
  { key: "Immeuble", label: "Immeuble" },
  { key: "Prix", label: "Prix" },
  { key: "État", label: "État" },
];


  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Biens/${id}`);
        break;
      case 'edit':
        router.push(`/Biens/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.")) {
          deleteBienById(id);
        }
        break;
      default:
        console.log(`Action ${action} for bien ${id}`);
    }
  };

  // Delete bien
  const deleteBienById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.BIENS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Bien supprimé avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete bien:", err);
      toast.error("Erreur lors de la suppression du bien");
    }
  };

  // Check user permissions for managing biens
  const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageBiens 
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">

    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={totalRows}
      loading={loading}
      filterComponent={
        <BienFilter
          tempFilters={tempFilters}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          applyFilters={applyFilters}
          loading_T={loading}
          trancheId={trancheId}
          blocId={blocId}
          immeubleId={immeubleId}
        />
      }
      error={error}
      addLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedBiens.length > 0}
      onFilterToggle={handleFilterToggle}
      data_to_export={data_to_export()}
      columns_export={columns_export}
      name_file_export={"bien_export"}
      
    />
    {showDeleteModal && selectedId && (
            <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
              <DeleteData
                route={APIURL.BIENS}
                Id={selectedId}
                type="Bien"
                message={`Êtes-vous sûr de vouloir supprimer ce bien ?`
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
