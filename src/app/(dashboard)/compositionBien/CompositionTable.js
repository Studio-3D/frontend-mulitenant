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
import toast from "react-hot-toast";

export default function Composition({bien,reloadTrigger}) {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [compositionBiens, setCompositionBien] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const { selectedProjet, projets, fetchProjets } = useProjet(); // Get data from ProjetContext
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal
  const [selectedCompositionBien, setSelectedCompositionBien] = useState(null);
  const selectedBien= localStorage.getItem('selectedBien')
const [showEditModal, setShowEditModal] = useState(false);



  const [filters, setFilters] = useState({
    nbre_balcons: '',
    nbre_buanderies: '',
    nbre_chambres: '',
    nbre_cuisines: '',
    nbre_salons: '',

  })
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const fetchCompositionBiensFromApi = pageNumber => {
    setLoading(true)
    const selectedBienId = bien ? bien : selectedBien
    axios
      .get(APIURL.COMPOSITIONBIENS, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: { page: pageNumber + 1, currentPage,bien_id: selectedBienId, ...filters } // Increment page number by 1 for API
      })
      .then(response => {
       const { compositionBiens, pagination } = response.data

      const itemsPerPage = pagination.perPage || 10 // ou pagination.pageSize

      const updatedBiens = compositionBiens.map((item, idx) => ({
        ...item,
        classement: (pageNumber * itemsPerPage) + idx + 1 // index global
      }))

      setCompositionBien(updatedBiens)
    })
      .catch(error => {
        console.error('Error fetching users:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
 
    const [selectedRow, setSelectedRow] = useState(null);
const [showModal, setShowModal] = useState(false);

const handleShow = (id) => {
  const row = compositionBiens.find((item) => item.id === id);
  setSelectedRow(row);
  setShowModal(true);
};

const handleClose = () => {
  setShowModal(false);
  setSelectedRow(null);
};


    const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

  useEffect(() => {
     fetchCompositionBiensFromApi(0); // Fetch initial data for the first page 
   
    }, [searchTerm, currentPage, rowsPerPage, accesstoken,filters,reloadTrigger]);

    
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
      };
      setFilters(reset);
      setTempFilters(reset);
    };


 const handleEdit = (id) => {
  const row = compositionBiens.find((item) => item.id === id);
  if (row) {
    setSelectedRow({ ...row }); // copier les données
    setShowEditModal(true);
  }
};

const onUpdate = (data) => {
  setLoading({ ...loading, form: true });

  // Filtrer uniquement les clés qui commencent par "nbre"
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key]) => key.startsWith('nbre'))
  );

  // Vérifier si toutes les valeurs filtrées sont égales à 0 ou vides (string "0" ou nombre 0)
  const allZero = Object.values(filteredData).every(value => {
    // Convertir en string puis en nombre pour comparaison fiable
    const num = Number(value);
    return num === 0 || value === '' || value === null;
  });

  if (allZero) {
    toast.error('Toutes les données commençant par "nbre" sont égales à 0 ou vides');
    setLoading({ ...loading, form: false });
    return;
  }

  // Ajouter bien_id si besoin (hors filtres)
  filteredData.bien_id = selectedBien;

  let url = `${APIURL.COMPOSITIONBIENS}/${selectedRow.id}`;
  let method = 'PATCH';

  // Construire FormData uniquement avec filteredData
  const dataToSend = new FormData();
  Object.entries(filteredData).forEach(([key, value]) => {
    dataToSend.append(key, value === null ? '' : value);
  });

  axios({
    method: method,
    url: url,
    data: dataToSend,
    headers: {
      // Ne pas définir Content-Type, axios le gère automatiquement avec FormData
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  })
    .then(res => {
      setLoading({ ...loading, form: false });

      if (res.status === 200) {
        toast.success('La composition du bien a été modifiée avec succès');
        setShowEditModal(false);
        fetchCompositionBiensFromApi(0);
      } else if (res.status === 422) {
        setBackendErrors(res.data.errors);
        setTimeout(() => setBackendErrors({}), 5000);
      }
    })
    .catch(error => {
      const response = error.response;
      console.error("Erreur lors de la mise à jour:", error);
      if (response?.status === 422) {
        setBackendErrors(response.data.errors);
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error("Une erreur s'est produite lors de la mise à jour.");
      }
    })
    .finally(() => setLoading({ ...loading, form: false }));
};


  const columns = [
  {
    key: 'classement',
  label: '#',
  render: (row) => (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
      {row.classement}
    </div>
  )
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
  render: (row) => (  // ✅ correction ici
    <div className="flex gap-3 items-center">
      <button
        className="text-teal-500 hover:text-teal-700"
        onClick={() => handleShow(row.id)} // ✅ Ouvre la popup
        title="Voir"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        className="text-blue-500 hover:text-blue-700"
        onClick={() => handleEdit(row.id)}
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
    </div>
  ),
},

];

const formatData = compositionBiens.map((c, index) => ({
  ...c,
  index, // pour le render du numéro
}));

  
  



  
  
  return (
    < div >
      {/* Project Selection Modal */}
      
      <Table
        
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={compositionBiens}
        /* filterComponent={
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
        } */
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        enableSearch={false}
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
              
            }}
          />
        </Modal>
      )}
      {showModal && selectedRow && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        Détails des pièces
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(selectedRow)
          .filter(([key]) => key.startsWith('nbre_'))
          .map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm text-gray-500 capitalize">{key.replace('nbre_', '').replace('_', ' ')}</span>
              <span className="text-base font-medium text-gray-900">{value}</span>
            </div>
          ))}
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
      )}
      {showEditModal && selectedRow && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
        Modifier les pièces
      </h2>

      <form onSubmit={(e) => {
  e.preventDefault();
  onUpdate(selectedRow); // 🔁 utilise onUpdate ici
}}>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(selectedRow)
            .filter(([key]) => key.startsWith('nbre_'))
            .map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label htmlFor={key} className="text-sm text-gray-600 capitalize mb-1">
                  {key.replace('nbre_', '').replace('_', ' ')}
                </label>
                <input
                  type="number"
                  name={key}
                  id={key}
                  value={selectedRow[key]}
                  onChange={(e) =>
                    setSelectedRow((prev) => ({
                      ...prev,
                      [key]: parseInt(e.target.value, 10),
                    }))
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
              </div>
            ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
)}



    </div>
  );
};

