"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Eye, Check, Wrench, File } from "lucide-react";
import SelectInput from "@/components/SelectInput";

import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin, Statuts_Prospect } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import Input from "@/components/Input";
import axios from "axios";
import toast from "react-hot-toast";
import ReclamationDialog from "@/components/dialogTraiterRec";
import { useProjet } from "@/context/ProjetContext";
import Link from "next/link";

const ReclamationTable = (prestId ) => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [disabled, setDisabled] = useState(false)
// état local
const [openDialog, setOpenDialog] = useState(false)
const [dialogType, setDialogType] = useState("traiter") // ou "resoudre"
const [formValues, setFormValues] = useState({})

const openTraitement = (row) => {
  setSelectedId(row.id)
  setFormValues({date_traitement: '', commentaire: '',statut:'',date_fin_traitement:''})
  setOpenDialog(true)

}



  const [filters, setFilters] = useState({
    client: "",
    date_reclamation:"",
    code_reservation: "",
    etat: "", 
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const accessToken = localStorage.getItem('accessToken')

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C’est ici que fetchUsers va être déclenché
  };

 

  const resetFilters = () => {
    const reset = {
      client: "",
      date_reclamation:"",
      code_reservation: "",
      etat: "", 
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();


  const entity = {
    API_URL: "ReclamationsClients",
    dataKey: "data",
    name: "Reclamation",
    searchFields: ["client_nom"],
  };

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
      setReclamations,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken,filters]);
  
  const handleSubmitReclamation = (e) => {
    e.preventDefault();
  
    
  // Validation
      if (!formValues.statut || !formValues.commentaire || (formValues.statut==1 && !formValues.date_traitement)|| (formValues.statut!=1 && !formValues.date_fin_traitement)) {
        toast.error("Veuillez remplir tous les champs obligatoires.");
        return;
     
      }
      setDisabled(true);

    const formData = new FormData();
  
      formData.append("statut", formValues.statut);

      formData.append(formValues.date_traitement?"date_traitement":"date_fin_traitement", formValues.date_traitement?formValues.date_traitement:formValues.date_fin_traitement);
      formData.append("commentaire", formValues.commentaire || ""); // Ensure empty string instead of null
    
        axios.post(`${APIURL.ROOTV1}/traiter_reclamation_client/${selectedId}`
          , formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        })
      .then(() => {
        toast.success("Réclamation traitée !");
        
        setOpenDialog(false);
        setDisabled(false);
  
        // Rechargement des données
        fetchData_table_by_projet(
          entity,
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accessToken,
          setLoading,
          setError,
          setReclamations,
          setTotalRows
        );
      })
      .catch((err) => {
        console.error(err);
        setDisabled(false);
        toast.error("Erreur lors de la soumission.");
      });
  };
  

  
 
 const statut = {
    1: { code: 1, label: 'En Attente', color: 'bg-blue-100 !text-blue-800' },
    2: { code: 2, label: 'En Cours', color: 'bg-blue-100 !text-blue-800' },
    3: { code: 3, label: 'Resolu', color: 'bg-green-100 !text-green-800' },
    4: { code: 4, label: 'Non Resolu', color: 'bg-red-100 !text-red-800' },
  };

  

  
  
  function handleShow(row) {
  sessionStorage.setItem("reclamationData", JSON.stringify(row)); // stocker la ligne
  router.push(`/Reclamations/show/${row.id}`);
}


  
  const columns = [
  {
    key: "date_reclamation",
    label: "Date Réclamation",
    sortable: true,
    render: row => row.created_at ? format(new Date(row.created_at), 'dd/MM/yyyy') : ''
  },
  {
    key: "client",
    label: "Client",
    sortable: true,
    render: row => (
      <Link
        target='_blank'
        href={'/clients/show/' + row.client_id}
        style={{
          textDecoration: 'none',
          color:  'rgb(102 104 128)'
        }}
        className="text-[#666880] inline-block min-w-[200px]" // min-w élargit la colonne

      >
        <strong>{row.client_nom + ' ' + row.client_prenom}</strong>
      </Link>
    )
  },
  {
    key: "dossier",
    label: "Code reservation",
    sortable: true,
    render: row => (
      <Link
        target='_blank'
        href={'/reservations/show/' + row.dossier_id}
        style={{
          textDecoration: 'none',
          color:  'rgb(102 104 128)'
        }}
      >
        <strong>{row.code_reservation}</strong>
      </Link>
    )
  },
 
  {
    key: "nom_service",
    label: "Service",
    sortable: true,
    render: row => row.nom_service
  },
  
  
  {
  key: 'etat',
  label: 'Statut',
  render: (row) => {
    const etatStyles = {
      0: "bg-blue-200 !text-blue-800",     // En Attente
      1: "bg-yellow-200 !text-yellow-800", // En cours
      2: "bg-green-200 !text-green-800",   // Traité
      3: "bg-red-200 !text-red-800",       // Non traité
    };

    const etatLabels = {
      0: "En Attente",
      1: "En cours",
      2: "Traité",
      3: "Non traité",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-sm font-semibold ${etatStyles[row.etat] || "bg-gray-200 !text-gray-800"}`}
      >
        {etatLabels[row.etat] || "Inconnu"}
      </span>
    );
  }
},


  
  
  {
    key: "actions",
    label: "Actions",
    render: row => (
      <>
      <div className="text-[#666880] inline-block min-w-[80px]" // min-w élargit la colonne
>

      <Eye
        className="w-4 h-4 !text-blue-500 hover:text-yellow-700 cursor-pointer"
        onClick={() => handleShow(row)}
      />
        {row.etat == 0 && (
          <Wrench
            className="w-5 h-5 !text-red-500 hover:text-red-700 cursor-pointer"
            title="Traiter"
            onClick={() => {
              setDialogType("traiter_client");
              openTraitement(row);
            }}            
          />
        )}
        {row.etat == 1 && (
          <>
          <Check
            className="w-4 h-4 !text-green-600 hover:text-green-800 cursor-pointer"
            title="Résoudre"
            onClick={() => {
              setDialogType("resoudre_client");
              openTraitement(row);
            }}
          />

          </>
        )}
    </div>

      </>
    )
  }
]
  
  
const formatData = () => {
  return reclamations.map(rec => ({
    id: rec.id,
    created_at: rec.created_at,
    client_id: rec.client_id,
    client_nom: rec.client_nom,
    client_prenom: rec.client_prenom,
    dossier_id: rec.dossier_id,
    code_reservation: rec.code_reservation,
    user_id_traite: rec.user_id_traite,
    users_traite_nom: rec.users_traite_nom,
    users_traite_prenom: rec.users_traite_prenom,
    nom_service: rec.nom_service,
    message: rec.message,
    piece_jointe: rec.piece_jointe,
    etat: rec.etat,
    date_traitement: rec.date_traitement,
    commentaire: rec.commentaire
  }));
};
  


const data_to_export = () => {
  return reclamations.map((rec) => ({
    "ID": rec.id,
    "Date Réclamation": rec.created_at
      ? format(new Date(rec.created_at), 'dd/MM/yyyy')
      : '',
    "ID Client": rec.client_id,
    "Nom Client": rec.client_nom || '',
    "Prénom Client": rec.client_prenom || '',
    "ID Dossier": rec.dossier_id,
    "Code Réservation": rec.code_reservation || '',
    "ID Traitant": rec.user_id_traite,
    "Nom Traitant": rec.users_traite_nom || '',
    "Prénom Traitant": rec.users_traite_prenom || '',
    "Objet": rec.objet || '',
    "Message": rec.message || '',
    "Pièce jointe": rec.piece_jointe || '',
    "Statut":
    rec.etat ==0
        ? 'En Attente'
        :rec.etat ==1
        ? 'En Cours'
        : rec.etat ==2
        ? 'Résolu'
        : rec.etat ==3
        ? 'Non Résolu'
        : '',
    "Date Traitement": rec.date_traitement
      ? format(new Date(rec.date_traitement), 'dd/MM/yyyy')
      : '',
    "Date Fin Traitement": rec.date_fin_traitement
      ? format(new Date(rec.date_fin_traitement), 'dd/MM/yyyy')
      : '',
    "Commentaire": rec.commentaire || ''
  }));
};

  
  

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  const columns_export = Object.keys(data_to_export()[0] || {}).map((key) => ({
  key,
  label: key
}));

  
  return (
    <>
      <Table
        title={prestId.prestataire_id ? "Reclamations liées":'Reclamations Client'}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"reclamation_client_export"}
        onFilterToggle={handleFilterToggle}
        columns={columns}
        filterComponent={
          <div className="space-y-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <input
                type="text"
                placeholder="Date Reclamation"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_reclamation}
                onChange={(e) => handleFilterChange("date_reclamation", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />              
             
              <Input
                type="text"
                placeholder="Client"
                value={tempFilters.client}
                onChange={(e) => handleFilterChange("client", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                placeholder="Code reservation"
                value={tempFilters.code_reservation}
                onChange={(e) => handleFilterChange("code_reservation", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

             
              <select
                value={tempFilters.etat}
                onChange={(e) => handleFilterChange("etat", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              >
                <option value="" disabled>Etat</option>
                <option value={0}>En Attente</option>
                <option value={1}>En cours</option>
                <option value={2}>Traité</option>
                <option value={3}>Non Traité</option>
              </select>

            </div>
        
            {/* Boutons */}
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
        data={formatData()}
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        enableExport={true}
        
        
      />
      <ReclamationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        type={dialogType}
        values={formValues}
        setValues={setFormValues}
        onSubmit={handleSubmitReclamation}
        disabled={disabled}
      />

      
    </>
  );
};

export default ReclamationTable;
