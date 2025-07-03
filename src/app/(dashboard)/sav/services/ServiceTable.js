"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";

import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/Input";
import { useProjet } from "@/context/ProjetContext"; // Import ProjetContext
import ProjetDialog from "@/components/ProjetDialog"; // Import ProjetDialog

const ServiceTable = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [filters, setFilters] = useState({nom: ""})
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet(); // Get selectedProjet from context
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal

  const entity = {
    API_URL: "ServicesPrestataires",
    dataKey: "data",
    name: "Service",
    searchFields: ["nom"],
  };

  // Check if a project is selected
  useEffect(() => {
    if (!selectedProjet && !showProjetModal) {
      fetchProjets(); // Fetch projects if not already done
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets]);

  // Reset state when project changes
  useEffect(() => {
    if (selectedProjet) {
      setServices([]);
      setCurrentPage(1);
      setError("");
    }
  }, [selectedProjet]);

  useEffect(() => {
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
        setServices,
        setTotalRows
      );
    }
  }, [searchTerm, currentPage, rowsPerPage, accesstoken, filters, selectedProjet]); // Add selectedProjet dependency
  
  function handleShow(Id, nom) {
    localStorage.setItem('service_pre', JSON.stringify(nom))
    localStorage.setItem('service_pre_id', JSON.stringify(Id))
    router.push(`/sav/services/show/` + Id)
  }

  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.ServicesPrestataires}?id=${id}&action=edit`);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: "",
      
    };
    setFilters(reset);
    setTempFilters(reset);
  };
  
  const selectedService = services.find((service) => service.id === selectedId);

  const columns = [
    { key: "nom", label: "Nom du service" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          
          <Pencil
            className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
            onClick={() => handleEdit(row.id)}
          />
        
          <Eye
            className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={() => handleShow(row.id,row.nom)}
          />
          
          <Trash2
            className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => {
              setSelectedId(row.id);
              setShowDeleteModal(true);
            }}
          />

        </div>
      ),
    },
  ];

  const formatData = () => {
    return services.map((ser) => ({
      id: ser.id,
      nom: ser.nom,
      prestataires:ser?.prestataires
    }));
  };

  const data_to_export = () => {
    return services.map((srv) => ({
      nom: srv.nom,
      // Ajoute d'autres champs utiles si nécessaire
    }));
  };

  const columns_export = [{ key: "nom", label: "Nom" }];


  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };


  // Handle project selection
  const handleProjectSelected = () => {
    setShowProjetModal(false);
    setCurrentPage(1); // Reset to first page
    
    // Fetch data with the newly selected project
    if (selectedProjet) {
      fetchData_table_by_projet(
        entity,
        filters, 
        searchTerm,
        1,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setServices,
        setTotalRows
      );
    }
  };

  return (
    <>
    < div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <ProjetDialog
        open={showProjetModal}
        onClose={() => setShowProjetModal(false)}
        projets={projets}
        onSelect={handleProjectSelected}
      />
      
      <Table
        title={'Services'}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"service_export"}
        columns={columns}
        data={formatData()}
        onFilterToggle={handleFilterToggle}
        filterComponent={
          <div className="space-y-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="Nom..."
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
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
        enableExport={true}
        enableImport={true}
        addLink={
          isSuperAdmin(user.role) || isAdmin(user.role)
            ? `${ENDPOINTS.ServicesPrestataires}?action=add`
            : undefined
        }
      />

{showDeleteModal && selectedId && (
  <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
    <DeleteData
      route={APIURL.ServicesPrestataires}
      Id={selectedId}
      type="Service"
      message={
        selectedService && selectedService.prestataires && selectedService.prestataires.length > 0
          ? `Attention : la suppression de ce service entraînera également la suppression de tous les prestataires associés. Êtes-vous sûr de vouloir le supprimer ?`
          : `Êtes-vous sûr de vouloir supprimer ce service ?`
      }
      accessToken={accesstoken}
      onClose={() => {
        setShowDeleteModal(false);
        fetchData_table_by_projet(entity, filters, searchTerm, currentPage, rowsPerPage, accesstoken, setLoading, setError, setServices, setTotalRows);
      }}
    />
  </Modal>
)}
  </div>

    </>
  );
};

export default ServiceTable;
