"use client";
import { useEffect, useState } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Table from '@/components/Table';
import { Eye, PencilLine, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { APIURL } from '@/configs/api';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { fetchData_Select, fetchData_table_by_projet } from '@/configs/api-utils';
import Input from '@/components/Input';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import Select from 'react-select';
import InputSelect from '@/components/inputSelect';
import ProjetFilter from './ProjetFilter';

export default function ProjetsPage({user_id}) {
  const { selectedSociete } = useSociete();
  const { fetchProjets } = useProjet();
  const { user } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjets, setFilteredProjets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const [projets, setProjets] = useState([]);
  const [Typeprojets, setTypeProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState({nom: '', code: '', type: '', adresse: '',date:''});
  const [tempFilters, setTempFilters] = useState({ ...filters });

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

 const entity = {
  API_URL: "projets",
  dataKey: "projets",
  name: "Projet",
  searchFields: ['nom','code','type','adresse'],
};
  
    useEffect(() => {
      const params_url = user_id
      ? { user_id: user_id }
      : {};
    const combinedFilters = { ...filters, ...params_url };
      fetchData_table_by_projet(
        entity,
        combinedFilters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accessToken,
        setLoading,
        setError,
        setProjets,
        setTotalRows
      );
    }, [searchTerm, currentPage, rowsPerPage, accessToken,filters]);
    
    useEffect(() => {
        fetchData_Select('typeProjets', setTypeProjets, setLoading);
      }, []);

  // Define table columns with actions
  const columns = [
    { key: 'nom', label: 'Nom du projet' },
    { key: 'code', label: 'Code' },
    { key: 'type', label: 'Type' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'date', label: 'Date création' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir Projet"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-yellow-500 hover:text-yellow-700"
            onClick={() => handleAction('edit', row.id)}
            title="Modifier Projet"
          >
            <PencilLine className="w-4 h-4" />
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
        </div>
      )
    }
  ];
  
  
  // Get the société from localStorage as a fallback
  useEffect(() => {
    // Log the context value
    console.log("From context - Selected société:", selectedSociete);
    
    // Check localStorage as fallback
    const savedSociete = localStorage.getItem("selectedSociete");
    if (!selectedSociete && savedSociete) {
      console.log("Using localStorage fallback for société:", JSON.parse(savedSociete));
    }
    
    // Only fetch projects if we have a selected société and haven't fetched yet
    const effectiveSociete = selectedSociete || (savedSociete ? JSON.parse(savedSociete) : null);
    
    if (effectiveSociete && !hasFetched && !loading) {
      const doFetch = async () => {
        console.log("Fetching projects for société:", effectiveSociete.id);
        try {
          await fetchProjets();
          setHasFetched(true);
        } catch (err) {
          console.error("Error fetching projets:", err);
          setError("Erreur lors du chargement des projets");
        }
      };
      
      doFetch();
    }
  }, [selectedSociete, loading, hasFetched, fetchProjets]);

  // Format projects data for table
  // 1. Quand tu reçois les données de l'API (déjà paginées)
useEffect(() => {
  // Applique seulement le formatage, pas de filtre ni de pagination locale
  if (!projets) return;

  const formattedProjets = projets.map(projet => ({
    id: projet.id,
    nom: projet.nom || 'Sans nom',
    code: projet.code || '',
    type: projet.type_projet?.type || '',
    adresse: projet.adresse || '',
    date: new Date(projet.created_at).toLocaleDateString('fr-FR') || '',
  }));

  setFilteredProjets(formattedProjets);
}, [projets]);



  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Projets/${id}`);
        break;
      case 'edit':
        router.push(`/Projets/${id}/modifier`);
        break;
      case 'delete':
        // You could implement a confirmation modal here
        console.log('Delete project', id);
        break;
      default:
        console.log(`Action ${action} for project ${id}`);
    }
  };

  const data_to_export = () => {
    return filteredProjets.map((projet) => ({
      'Nom du projet': projet.nom,
      'Code': projet.code,
      'Type': projet.type,
      'Adresse': projet.adresse,
      'Date création': projet.date,
    }));
  };
    const columns_export = [
  { key: "Nom du projet", label: "Nom" },
  { key: "Code", label: "Code" },
  { key: "Type", label: "Type" },
  { key: "Adresse", label: "Adresse" },
  { key: "Date création", label: "Date de création" },
];


    

  // Calculate paginated data
  const paginatedData = filteredProjets.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <Table
        title={user_id ? 'Liste des projets' : 'Projets'}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"projet_export"}
        columns={columns}
        filterComponent={
          <ProjetFilter
            tempFilters={tempFilters}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            typeProjets={Typeprojets}
            loading={loading}
          />
        }
        data={paginatedData || []}        
        totalRows={totalRows}
        loading={loading}
        error={error}
        onFilterToggle={handleFilterToggle}
        addLink={((isSuperAdmin(user.role) || isAdmin(user.role))) && !user_id ? "/Projets/ajouter" : undefined}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        enableExport={filteredProjets.length > 0}
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.PROJETS}
            Id={selectedId}
            type="Projet"
            message={`Êtes-vous sûr de vouloir supprimer ce projet ?`
            }
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                filters, 
                searchTerm,
                1,
                rowsPerPage,
                accessToken,
                setLoading,
                setError,
                setProjets,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </div>
    
  );
}