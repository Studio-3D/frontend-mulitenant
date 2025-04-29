"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import SelectInput from "@/components/SelectInput";
import Input from "@/components/Input";

import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const ReclamationTable = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    dataKey: "reclamationSav",
    name: "reclamationSav",
    searchFields: ["client"],
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
  
  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.ReclamationsSav}?id=${id}&action=edit`);

  const columns = [
    { key: 'date_reclamation', label: 'Date Réclamation' },
    { key: 'bien', label: 'Bien' },
    { key: 'client', label: 'Client' },
    { key: 'probleme', label: 'Problèmes' },
   // ...(prestataire_id != null ? [{ key: 'service', label: 'Service/Prestataire' }] : []),
    { key: 'date_intervention', label: 'Date Intervention' },
    { key: 'date_fin_intervention', label: 'Date Fin Intervention' },
    { key: 'statut', label: 'Statut' },
    { key: 'date_traitement', label: 'Date' },
    { key: 'commentaire', label: 'Commentaire' },    
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <FaEdit
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            onClick={() => handleEdit(row.id)}
          />
          <RiDeleteBin6Line
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
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
    return reclamations?.map((rec) => ({
      id: rec.id,
      date_reclamation: rec.date_reclamation,
      bien: rec.bien.propriete_dite_bien,
      client: `${rec.client.nom} ${rec.client.prenom}`,
      problemes: rec.problemes,
      service_prestataire:
        rec.prestataire?.service?.nom && rec.prestataire?.nom
          ? `${rec.prestataire.service.nom} / ${rec.prestataire.nom} ${rec.prestataire.prenom}`
          : '',
      date_intervention: rec.date_intervention,
      date_fin_intervention: rec.date_fin_intervention,
      statut:
        rec.statut == '1'
          ? 'En Cours'
          : rec.statut == '2'
          ? 'Résolu'
          : rec.statut == '3'
          ? 'Non Résolu'
          : '',
      date_traitement: rec.date_traitement,
      commentaire: rec.commentaire
    }));
  };
  

  const data_to_export = () => {
    return reclamations.map((rec) => ({
      "Date Réclamation": rec.date_reclamation
        ? format(new Date(rec.date_reclamation), 'dd/MM/yyyy H:mm')
        : '',
      Bien: rec.bien?.propriete_dite_bien,
      Client: `${rec.client.nom} ${rec.client.prenom}`,
      Problèmes: rec.problemes,
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
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"reclamation_export"}
        columns={columns}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg shadow-md">
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

              <input
                type="text"
                placeholder="Date Intervention"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_intervention}
                onChange={(e) => handleFilterChange("date_intervention", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <input
                type="text"
                placeholder="Date fin Intervention"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_fin_intervention}
                onChange={(e) => handleFilterChange("date_fin_intervention", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                placeholder="Bien"
                value={tempFilters.propriete_dite_bien}
                onChange={(e) => handleFilterChange("propriete_dite_bien", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                placeholder="Prestataire"
                value={tempFilters.prestataire}
                onChange={(e) => handleFilterChange("prestataire", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              {/* Pour Statut, puisque c'est un Select, on garde un <select> simple */}
              <select
                value={tempFilters.statut}
                onChange={(e) => handleFilterChange("statut", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              >
                <option value="" disabled>Statut</option>
                <option value={1}>En cours</option>
                <option value={2}>Résolu</option>
                <option value={3}>Non Résolu</option>
              </select>

            </div>
        
            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
              >
                Réinitialiser
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
          isSuperAdmin(user.role) || isAdmin(user.role)
            ? `${ENDPOINTS.ReclamationsSav}?action=add`
            : undefined
        }
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.ReclamationsSav}
            Id={selectedId}
            message={"Êtes-vous sûr de vouloir supprimer ce reclamation ?"}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
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
