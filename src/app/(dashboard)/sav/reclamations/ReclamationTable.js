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
const [prestataires, setPrestataires] = useState([]);
const { selectedProjet } = useProjet();

const openTraitement = (row, bien) => {
  setSelectedId(row.id)
  setDialogType("traiter")
  setFormValues({ bien, prestataire_id: '', date_intervention: '', commentaire: '' })
  setOpenDialog(true)
  fetchPrestataires(row.service_id)

}

const openResolution = (id, bien) => {
  setSelectedId(id)
  setDialogType("resoudre")
  setFormValues({ bien, statut: '', date_fin_inter: '', commentaire: '' })
  setOpenDialog(true)

}

const fetchPrestataires= async (service_id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/Prestataires/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
        const filtered = response.data.prestataire.filter(p => p.service_id == service_id);
        setPrestataires(filtered);  
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const [filters, setFilters] = useState({
    client: "",
    date_intervention: "",
    date_fin_intervention: "",
    date_reclamation:"",
    propriete_dite_bien: "",
    prestataire: "",
    statut: "", 
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
      date_intervention: "",
      date_fin_intervention: "",
      propriete_dite_bien: "",
      prestataire: "",
      statut: "", 
      date_reclamation:"",
      date_start_rec:"",
      date_end_rec:""  ,
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();


  const entity = {
    API_URL: "ReclamationsSav",
    dataKey: "data",
    name: "reclamation",
    searchFields: ["client.nom"],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      { ...filters,prestataire_id: prestId }, 
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
    if (dialogType === "traiter") {
      if (!formValues.prestataire_id || !formValues.date_intervention) {
        toast.error("Veuillez remplir tous les champs obligatoires (Prestataire et Date).");
        return;
      }
    } else if (dialogType === "resoudre") {
      if (!formValues.statut || !formValues.date_fin_inter) {
        toast.error("Veuillez remplir tous les champs obligatoires (Statut et Date de Fin).");
        return;
      }
    }
  
    setDisabled(true);
  
    const formData = new FormData();
  
    if (dialogType === "traiter") {
      formData.append("date_intervention", formValues.date_intervention);
      formData.append("prestataire_id", formValues.prestataire_id);
      formData.append("commentaire", formValues.commentaire || ""); // Ensure empty string instead of null
    } else {
      formData.append("statut", formValues.statut);
      formData.append("date_fin_intervention", formValues.date_fin_inter);
      formData.append("commentaire", formValues.commentaire || ""); // Ensure empty string instead of null
    }
  
    // DEBUG: Log FormData contents *before* sending
    console.log("FormData contents:");


    for (const pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    console.log("FormData :",formData);

  
    const endpoint =
      dialogType === "traiter"
        ? `${APIURL.ROOTV1}/traiter_reclamation_sav/${selectedId}`
        : `${APIURL.ROOTV1}/resoudre_reclamation_sav/${selectedId}`;
  
        axios.post(endpoint, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        })
      .then(() => {
        toast.success(
          dialogType === "traiter"
            ? "Réclamation traitée !"
            : `Réclamation ${formValues.statut == 3 ? "résolue" : "non résolue"} !`
        );
        
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
  

  
  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.ReclamationsSav}?id=${id}&action=edit`);

 const statut = {
    1: { code: 1, label: 'En Attente', color: 'bg-blue-100 !text-blue-800' },
    2: { code: 2, label: 'En Cours', color: 'bg-blue-100 !text-blue-800' },
    3: { code: 3, label: 'Resolu', color: 'bg-green-100 !text-green-800' },
    4: { code: 4, label: 'Non Resolu', color: 'bg-red-100 !text-red-800' },
  };

  

  const getStatutBadge = (Statut) => {
    const statInfo = statut[Statut];
    if (!statInfo) return null;
  
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statInfo.color}`}
      >
        {statInfo.label}
      </span>
    );
  };

  function NomBienComplet(bien) {
    const noms = [];
  
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
  
    noms.push(bien.propriete_dite_bien);
  
    return noms.join(' - ');
  }
  
  function handleShow(Id) {
    router.push(`/sav/reclamations/show/${Id}`);
  }
  
  const columns = [
    {
      key: 'date_reclamation',
      label: 'Date Réclamation',
      render: (row) => {
        const date = new Date(row.date_reclamation);
        const formattedDate = date.toLocaleDateString('fr-FR'); // jj/mm/aaaa
        return <strong>{formattedDate}</strong>; // en gras
      },
    },    
    { key: 'bien', label: 'Bien' },
    { key: 'service', label: 'Service' },
    { key: 'prestataire', label: 'Prestataire' },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        return getStatutBadge(row.statut_raw);
      },
    },
        
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            className="text-blue-500 hover:text-yellow-700"
            onClick={() => handleShow(row.id)}
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            className="text-yellow-500 hover:text-yellow-700"
            onClick={() => handleEdit(row.id)}
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {row.statut_raw === 1 && (
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => openTraitement(row, row.bien)}
              title="Traiter"
            >
              <Wrench className="w-5 h-5" />
            </button>
          )}

          {row.statut_raw === 2 && (
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => openResolution(row.id, row.bien)}
              title="Résoudre"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

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
  
  


  const formatData = () => {
    return reclamations?.map((rec) => ({
      id: rec.id,
      date_reclamation: rec.date_reclamation,
      bien: NomBienComplet(rec.bien),
      emplacement: rec.emplacement,
      service_id: rec.service_id,
      service:
        rec?.service?.nom 
          ? rec?.service?.nom
          : '',
      prestataire:rec.prestataire?.nom? `${rec.prestataire.nom} ${rec.prestataire.prenom}`:'',
      statut:
        rec.statut == '1'
          ? 'En Cours'
          : rec.statut == '2'
          ? 'Résolu'
          : rec.statut == '3'
          ? 'Non Résolu'
          : '',
      statut_raw: parseInt(rec.statut),
      piece_jointe: rec.piece_jointe,
    }));
  };
  

  const data_to_export = () => {
    return reclamations.map((rec) => ({
      "Date Réclamation": rec.date_reclamation
        ? format(new Date(rec.date_reclamation), 'dd/MM/yyyy H:mm')
        : '',
      Bien: rec.bien?.propriete_dite_bien,
      Client: `${rec.client.nom} ${rec.client.prenom}`,
      Problèmes: rec.emplacement,
      "Service / Prestataire":
        rec.prestataire?.service?.nom && rec.prestataire?.nom
          ? `${rec.prestataire.service.nom} / ${rec.prestataire.nom} ${rec.prestataire.prenom}`
          : '',
      "Date Intervention": rec.date_intervention
        ? format(new Date(rec.date_intervention), 'dd/MM/yyyy')
        : '',
      "Date Fin Intervention": rec.date_fin_intervention
        ? format(new Date(rec.date_fin_intervention), 'dd/MM/yyyy')
        : '',
      Statut:
        rec.statut == '1'
          ? 'En Cours'
          : rec.statut == '2'
          ? 'Résolu'
          : rec.statut == '3'
          ? 'Non Résolu'
          : '',
      "Date Traitement": rec.date_traitement
        ? format(new Date(rec.date_traitement), 'dd/MM/yyyy')
        : '',
      Commentaire: rec.commentaire
    }));
  };
  
  const isPrestIdEmpty = 
  !prestId || (typeof prestId === 'object' && Object.keys(prestId).length === 0);
  

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  const columns_export = [
    { key: 'Date Réclamation', label: 'Date Réclamation' },
    { key: 'Bien', label: 'Bien' },
    { key: 'Client', label: 'Client' },
    { key: 'Problèmes', label: 'Problèmes' },
    { key: 'Service / Prestataire', label: 'Service / Prestataire' },
    { key: 'Date Intervention', label: 'Date Intervention' },
    { key: 'Date Fin Intervention', label: 'Date Fin Intervention' },
    { key: 'Statut', label: 'Statut' },
    { key: 'Date Traitement', label: 'Date Traitement' },
    { key: 'Commentaire', label: 'Commentaire' }
  ];
  
  return (
    <>
      <Table
        title={prestId.prestataire_id ? "Reclamations liées":'Reclamations'}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"reclamation_export"}
        onFilterToggle={handleFilterToggle}
        columns={columns}
        filterComponent={
          <div className="space-y-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <div className="mb-3">
          <label className="block !text-gray-700 text-sm font-bold mb-1">
            Date Reclamation 
          </label> 
              <input
                type="text"
                placeholder="Date Reclamation"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_reclamation}
                onChange={(e) => handleFilterChange("date_reclamation", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />              
              </div>

              <Input
                type="text"
                label='Client'
                placeholder="Client"
                value={tempFilters.client}
                onChange={(e) => handleFilterChange("client", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        <div className="mb-3">
          <label className="block !text-gray-700 text-sm font-bold mb-1">
            Date Intervention 
          </label> 
              <input
                type="text"
                placeholder="Date Intervention"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_intervention}
                onChange={(e) => handleFilterChange("date_intervention", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        </div>

        <div className="mb-3">
          <label className="block !text-gray-700 text-sm font-bold mb-1">
            Date fin Intervention
          </label> 
              <input
                type="text"
                placeholder="Date fin Intervention"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_fin_intervention}
                onChange={(e) => handleFilterChange("date_fin_intervention", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        </div>

              <Input
                label='Bien'
                type="text"
                placeholder="Bien"
                value={tempFilters.propriete_dite_bien}
                onChange={(e) => handleFilterChange("propriete_dite_bien", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                label={'Prestataire'}
                type="text"
                placeholder="Prestataire"
                value={tempFilters.prestataire}
                onChange={(e) => handleFilterChange("prestataire", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <SelectInput
                label="Statut"
                name="statut"
                placeholder="Sélectionnez un statut"
                options={[
                  { label: 'En cours', value: '1' },
                  { label: 'Résolu', value: '2' },
                  { label: 'Non Résolu', value: '3' }
                ]}
                value={tempFilters.statut}
                onChange={(value) => handleFilterChange('statut', value)}
              />


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
        enableImport={true}
        addLink={
          (isSuperAdmin(user?.role) || isAdmin(user?.role)) && isPrestIdEmpty
            ? `${ENDPOINTS.ReclamationsSav}?action=add`
            : undefined
        }
        
      />
      <ReclamationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        type={dialogType}
        prestataires={prestataires}        
        values={formValues}
        setValues={setFormValues}
        onSubmit={handleSubmitReclamation}
        disabled={disabled}
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.ReclamationsSav}
            Id={selectedId}
            message={"Êtes-vous sûr de vouloir supprimer cette reclamation ?"}
            accessToken={accesstoken}
            type="Reclamation"
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
                setReclamations,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default ReclamationTable;