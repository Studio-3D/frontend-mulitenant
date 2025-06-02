"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line, RiEyeLine } from "react-icons/ri";
import axios from "axios";
import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/Input";
import InputSelect from "@/components/inputSelect";
import { useProjet } from "@/context/ProjetContext"; // Import ProjetContext
import ProjetDialog from "@/components/ProjetDialog"; // Import ProjetDialog
import Select from 'react-select';
import { Eye, Pencil, Trash2 } from "lucide-react";

const PrestataireTable = (serviceId) => {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [services, setServices] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet(); // Get data from ProjetContext
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal
  const [selectedCompositionBien, setSelectedCompositionBien] = useState(null);
  const selectedBien= localStorage.getItem('selectedBien')

  const [filters, setFilters] = useState({
    nbre_balcons: '',
    nbre_buanderies: '',
    nbre_chambres: '',
    nbre_cuisines: '',
    nbre_salons: '',

  })
  const fetchCompositionBiensFromApi = pageNumber => {
    setLoading(true)
    const selectedBienId = bien ? bien : selectedBien
    axios
      .get(APIURL.COMPOSITIONBIENS, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: { page: pageNumber + 1, size,bien_id: selectedBienId, ...filterValues } // Increment page number by 1 for API
      })
      .then(response => {
        const { compositionBiens, pagination } = response.data
        setPaginatedData({
          compositionBiens,
          ...pagination,
          currentPage: pageNumber + 1 // Increment page number by 1 for display
        })
      })
      .catch(error => {
        console.error('Error fetching users:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
 
    function handleShow(Id) {
      router.push(`/sav/prestataires/show/${Id}`);
    }

    const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

  useEffect(() => {
     fetchCompositionBiensFromApi(0); // Fetch initial data for the first page 
   
    }, [searchTerm, currentPage, rowsPerPage, accesstoken,filters]);

    
    const handleFilterChange = (field, value) => {
      setTempFilters((prev) => ({ ...prev, [field]: value }));
    };
  

    const applyFilters = () => {
      setFilters(tempFilters); // C’est ici que fetchUsers va être déclenché
    };
    const resetFilters = () => {
      const reset = {
        nom: "",
        prenom: "",
        cin: "",
        email: "",
        telephone: "",
        serviceId: serviceId?.service?.id == null ? "" : serviceId?.service?.id, // n'inclut que si null
      };
      setFilters(reset);
      setTempFilters(reset);
    };


  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.Prestataires}?id=${id}&action=edit`);

  const columns = [
  {
    key: 'index',
    label: '#',
    render: (row, idx) => (
      <CustomAvatar
        skin="light"
        color={
          ['success', 'error', 'warning', 'info', 'primary', 'secondary'][Math.floor(Math.random() * 6)]
        }
        sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      >
        {idx + 1}
      </CustomAvatar>
    ),
  },
  { key: 'nbre_balcons', label: 'Nbre balcons' },
  { key: 'nbre_buanderies', label: 'Nbre buanderies' },
  { key: 'nbre_chambres', label: 'Nbre chambres' },
  { key: 'nbre_cuisines', label: 'Nbre cuisines' },
  { key: 'nbre_halls', label: 'Nbre halls' },
  { key: 'nbre_placards', label: 'Nbre placards' },
  {
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <>
        <ShowButton onClick={() => handleShow(row)} />
        <EditButton onClick={() => handleEdit(row.id)} />
        <DeleteButton onClick={() => handleDelete(row.id)} />
      </>
    ),
  },
];

const formattedData = compositionbiens.map((c, index) => ({
  ...c,
  index, // pour le render du numéro
}));

  
  const data_to_export = () => {
  return paginatedData.items.map(item => ({
    'Nbre balcons': item.nbre_balcons,
    'Nbre buanderies': item.nbre_buanderies,
    'Nbre chambres': item.nbre_chambres,
    'Nbre cuisines': item.nbre_cuisines,
    'Nbre halls': item.nbre_halls,
    'Nbre placards': item.nbre_placards
  }));
};

const columns_export = [
  { key: 'Nbre balcons', label: 'Nbre balcons' },
  { key: 'Nbre buanderies', label: 'Nbre buanderies' },
  { key: 'Nbre chambres', label: 'Nbre chambres' },
  { key: 'Nbre cuisines', label: 'Nbre cuisines' },
  { key: 'Nbre halls', label: 'Nbre halls' },
  { key: 'Nbre placards', label: 'Nbre placards' }
];

  
  // Handle project selection
  const handleProjectSelected = () => {
    setShowProjetModal(false);
    setCurrentPage(1); // Reset to first page
    
    // Fetch services and data with the newly selected project
    if (selectedProjet) {
      fetchServices();
      fetchData_table_by_projet(
        entity,
        filters,       
        searchTerm,
        1,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setPrestataires,
        setTotalRows
      );
    }
  };
  
  return (
    < div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      {/* Project Selection Modal */}
      {!serviceId && (
        <ProjetDialog
          open={showProjetModal}
          onClose={() => setShowProjetModal(false)}
          projets={projets}
          onSelect={handleProjectSelected}
        />
      )}
      <Table
        title={serviceId?.service?.nom && `Prestataires liées à ${serviceId?.service?.nom}`} 
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"prestataire_export"}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg ">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="Nom..."
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="text"
                placeholder="Prénom..."
                value={tempFilters.prenom}
                onChange={(e) => handleFilterChange("prenom", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="text"
                placeholder="Cin..."
                value={tempFilters.cin}
                onChange={(e) => handleFilterChange("cin", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Email..."
                value={tempFilters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Téléphone..."
                value={tempFilters.telephone}
                onChange={(e) => handleFilterChange("telephone", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              
              {!serviceId?.service?.id && (
                <Select
                  isClearable
                  value={
                  services
                  .map(service => ({
                  value: service.id,
                  label: service.nom,
                  id: service.id
                  }))
                  .find(option => option.value === tempFilters.serviceId) || null
                  }
                  onChange={selected =>
                  handleFilterChange("serviceId", selected?.value || null)
                  }
                  options={services.map(service => ({
                  value: service.id,
                  label: service.nom,
                  id: service.id
                  }))}
                  isLoading={loading}
                  placeholder="Choisir un service..."
                  className="text-sm"
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
          (isSuperAdmin(user.role) || isAdmin(user.role)) && selectedProjet
            ? `${ENDPOINTS.Prestataires}?action=add`
            : undefined
        }
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.Prestataires}
            Id={selectedId}
            type="Prestataire"
            message={`Êtes-vous sûr de vouloir supprimer ce prestataire ?`
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
                setPrestataires,
                setTotalRows
              );      
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default PrestataireTable;
