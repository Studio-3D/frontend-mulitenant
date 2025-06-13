"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/Input";
import { useProjet } from "@/context/ProjetContext"; // Import ProjetContext
import ProjetDialog from "@/components/ProjetDialog"; // Import ProjetDialog
import { format } from "date-fns";
import { Trash2 , File, Eye } from "lucide-react";
import SelectInput from "@/components/SelectInput";
import { FiDownload } from "react-icons/fi";

const HistoImpoTable = () => {
  const [histoImportations, sethistoImportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const accessToken = localStorage.getItem("accessToken");
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [filters, setFilters] = useState({
    date: "",
    statut: "",
   
    
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet(); // Get data from ProjetContext
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal

  const entity = {
    API_URL: "histo_importation",
    dataKey: "data",
    name: "histo_importation",
    searchFields: ["nom"],
  };

  // Check if a project is selected
  useEffect(() => {
    if (!selectedProjet && !showProjetModal ) {
      fetchProjets(); // Fetch projects if not already done
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets]);

  const statut = {
  1: { code: 1, label: 'Importé', color: 'bg-green-100 text-green-800' },
  0: { code: 0, label: 'En Cours', color: 'bg-yellow-100 text-yellow-800' },
  2: { code: 2, label: 'Échoué', color: 'bg-red-100 text-red-800' },
};

const getStatutBadge = (statutValue) => {
  const info = statut[statutValue];
  if (!info) return null;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
};


 
 
    const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

    function handleShow(Id) {
      router.push(`/historique-importation/${Id}`);
  }

    const handleFileClick = file => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/Import_fichier/${file}`,
      '_blank'
    )
  }
  useEffect(() => {

    fetchData_table_by_projet(
        entity,
        filters,       
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        sethistoImportations,
        setTotalRows
      );
    }, [searchTerm, currentPage, rowsPerPage, accesstoken,filters]);

    
    const handleFilterChange = (field, value) => {
      setTempFilters((prev) => ({ ...prev, [field]: value }));
    };
  

    const applyFilters = () => {
      setFilters(tempFilters); // C’est ici que fetchUsers va être déclenché
    };
    const resetFilters = () => {
      const reset = {
        date: "",
        statut: "",
      };
      setFilters(reset);
      setTempFilters(reset);
    };


  
  const columns = [
  {
    key: 'date',
    label: 'Date',
    render: (row) => format(new Date(row.created_at), 'dd/MM/yyyy'),
  },
  {
    key: 'fichier',
    label: 'Fichier',
    render: (row) => (
      <span
        className="text-sm hover:text-blue-600 cursor-pointer"
        onClick={() => handleFileClick(row.fichier)}
      >
        {row.fichier}
      </span>
    ),
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (row) => getStatutBadge(row.statut),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <div className="flex gap-2 items-center">
        <button title="visualiser" onClick={() => handleFileClick(row.fichier)}>
          <FiDownload className="w-5 h-5" />
        </button>
        {row.statut == 2 && (
          <Eye
            className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => handleShow(row.id)}
          />        
        )}
        {row.statut == 0 && (
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
        )}
      </div>
    ),
  },
];

 
  
 const formatData = () => {
  return histoImportations.map(file => ({
    ...file,
    id: file.id,
    created_at: file.created_at,
    fichier: file.fichier,
    statut: file.statut
  }));
};

 
  const selectedhistoImportation = histoImportations.find((histoimportation) => histoimportation.id === selectedId);

  
  
  // Handle project selection
  const handleProjectSelected = () => {
    setShowProjetModal(false);
    setCurrentPage(1); // Reset to first page
    
    // Fetch services and data with the newly selected project
    if (selectedProjet) {
      fetchData_table_by_projet(
        entity,
        filters,       
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        sethistoImportations,
        setTotalRows
      );
    }
  };
  
  return (
    <>
      
        <ProjetDialog
          open={showProjetModal}
          onClose={() => setShowProjetModal(false)}
          projets={projets}
          onSelect={handleProjectSelected}
        />
      
      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">

      <Table
        //data_to_export={data_to_export()}
        //columns_export={columns_export}
        name_file_export={"histoImportation_export"}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="text"
                placeholder="Date"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
            </div> 
            
              <SelectInput
                label={"Statut"}
                name="statut"
                placeholder="Sélectionnez un statut"
                options={[
                  { label: 'En cours', value: '0' },
                  { label: 'Succès', value: '1' },
                  { label: 'Échoué', value: '2' }
                ]}
                value={tempFilters.statut}
                onChange={(value) => handleFilterChange('statut', value)}
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
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        //enableExport={true}
        //enableImport={true}
        enableSearch={false}
        
      />
      </div>

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.HISTOIMPORTATION}
            Id={selectedId}
            type="HistoImportation"
            message={
              selectedhistoImportation && selectedhistoImportation.reclamations && selectedhistoImportation.reclamations.length > 0
                ? `Attention : la suppression de cet historique entraînera également la suppression de tous les réclamations associés. Êtes-vous sûr de vouloir le supprimer ?`
                : `Êtes-vous sûr de vouloir supprimer cet fichier à importer ?`
            }
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                filters,       
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                sethistoImportations,
                setTotalRows
              );      
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default HistoImpoTable;
