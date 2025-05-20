"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';
import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/Input";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { Pencil, Trash2, Eye, Check, Wrench, File } from "lucide-react";
import PieceJointeViewer from "@/components/PieceJointeViewer";
import { format } from "date-fns";
import { useProjet } from "@/context/ProjetContext";

const RemiseCleTable = ({}) => {
  const [remisecles, setRemiseCles] = useState([]);
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
  const [biens, setBiens] = useState([]);
  const [cc, setCC] = useState([]);
    const { selectedProjet } = useProjet();
  
  
  const router = useRouter();
  const [filters, setFilters] = useState({
    bien: "",
    date_remise: "",
    cc: "",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: "RemiseCles",
    dataKey: "data",
    name: "RemiseCle",
    searchFields: ["nom"],
  };

 const fetch_cc = async () => {
  try {
    if (!accessToken) {
      console.warn("Pas de token d'accès");
      return;
    }
    const response = await axios.get(
      `${APIURL.ROOTV1}/commerciaux/${selectedProjet?.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
      const { data } = response
      setCC(data.data)  } 
      catch (error) {
  }
};

const fetchbiens = async () => {
  try {
    if (!accessToken) {
      console.warn("Pas de token d'accès");
      return;
    }
    setLoading(true);
    const response = await axios.get(
      `${APIURL.ROOTV1}/getBiens_Vendu_ByProjet_Concat/${selectedProjet?.id}/BiensVendu`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setBiens(response.data.biens || []);
  } catch (error) {
    console.error("Erreur fetchbiens:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {

    fetch_cc()
    fetchbiens()
  }, []);

    function handleShow(Id) {
      router.push(`/reservations/show/${Id}`);
    }

    const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

    const handleFileClick = (file) => {
      const url = `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${file}`;
      window.open(url, '_blank');
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
        setRemiseCles,
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
        bien: "",
        date_remise: "",
        cc: "",
      };
      setFilters(reset);
      setTempFilters(reset);
    };

    function NomBienComplet(bien) {
    const noms = [];
  
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
  
    noms.push(bien.propriete_dite_bien);
  
    return noms.join(' - ');
  }

  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.REMISECLES}?id=${id}&action=edit`);

  const formatData = () => {
  return remisecles.map((cp) => ({
    id: cp.id,
    date_remise: cp.date_remise,
    user_id_remis: cp.user_id_remis,
    user_remis: cp.user_remis,
    bien_id: cp.bien_id,
    bien: cp.bien,
    fichier: cp.fichier,
    id_res: cp.id_res,
    code_reservation: cp.code_reservation,
  }));
};

  const columns = [
  {
      key: 'date_remise',
      label: 'Date Remise',
      render: (row) => {
        const date = new Date(row.date_remise);
        const formattedDate = date.toLocaleDateString('fr-FR'); // jj/mm/aaaa
        return formattedDate; // en gras
      },
    },     
    {
    key: "responsable",
    label: "Responsable",
    render: (row) =>
      user?.role <= 2 ? (
        <Link
          target="_blank"
          href={`/Utilisateurs/afficher-utilisateur/${row.user_id_remis}`}
          style={{ textDecoration: 'underline', color: 'rgb(102 104 128)' }}
        >
          <strong>{row.user_remis?.name} {row.user_remis?.prenom}</strong>
        </Link>
      ) : null
  },
  {
      key: "code_reservation",
      label: "Code reservation",
      sortable: true,
      render: row => (
        <Link
          target='_blank'
          href={'/reservations/show/' + row.id_res}
          style={{ textDecoration: 'underline', color: 'rgb(102 104 128)' }}

        >
          <strong>{row.code_reservation}</strong>
        </Link>
      )
    },
  {
    key: "bien",
    label: "Bien",
    render: (row) => (
      <Link
        target="_blank"
        href={`/biens/show/${row.bien_id}`}
        style={{ textDecoration: 'underline', color: 'rgb(102 104 128)' }}
      >
        <strong>{NomBienComplet(row.bien)}</strong>
      </Link>
    )
  },
  { 
      key: 'fichier', 
      label: 'Pièce Jointe',
      render: (row) => row.fichier ? (
        <span 
          className=" hover:underline cursor-pointer"
          onClick={() => handleFileClick(row.fichier)}
        >
          {row.fichier}
        </span>
      ) : '-'
    },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="flex gap-3 items-center">
          <Pencil
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            onClick={() => handleEdit(row.id)}
          />        
          <Eye
            className="w-4 h-4 text-blue-500 hover:text-yellow-700 cursor-pointer"
            onClick={() => handleShow(row.id_res)}
          />
          <Trash2
            className="w-4 h-4 text-red-1000 hover:text-red-700 cursor-pointer"
            onClick={() => {
              setSelectedId(row.id);
              setShowDeleteModal(true);
            }}
          />      
          </div>
    )
  }
];

const columns_export = [
  { key: "Date Remise", label: "Date Remise" },
  { key: "Responsable", label: "Responsable" },
  { key: "Bien", label: "Bien" },
];

  const data_to_export = () => {
  return remisecles.map((row) => ({
    "Date Remise": row.date_remise
      ? format(new Date(row.date_remise), 'dd/MM/yyyy HH:mm')
      : '',
    Responsable: user?.role <= 2
      ? `${row.user_remis?.name || ''} ${row.user_remis?.prenom || ''}`
      : '',
    Bien: NomBienComplet(row.bien),
  }));
};


  
  return (
    <>
      <Table
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"remisecle_export"}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <input
                type="text"
                placeholder="Date Remise..."
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date_remise}
                onChange={(e) => handleFilterChange("date_remise", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />  
              
                <Select
                  isClearable
                  value={
                  cc
                  .map(cc => ({
                  value: cc.user.id,
                  label: cc.user.name+" "+cc.user.prenom,
                  id: cc.user.id
                  }))
                  .find(option => option.value === tempFilters.cc) || null
                  }
                  onChange={selected =>
                  handleFilterChange("cc", selected?.value || null)
                  }
                  options={cc.map(cc => ({
                  value: cc.user.id,
                  label: cc.user.name+" "+cc.user.prenom,
                  id: cc.user.id
                  }))}
                  isLoading={loading}
                  placeholder="Choisir un comercial..."
                  className="text-sm"
                />
                <Select
                  isClearable
                  value={
                  biens
                  .map(bien => ({
                  value: bien.id,
                  label: bien.propriete_dite_bien,
                  id: bien.id
                  }))
                  .find(option => option.value === tempFilters.bien) || null
                  }
                  onChange={selected =>
                  handleFilterChange("bien", selected?.value || null)
                  }
                  options={biens.map(bien => ({
                  value: bien.id,
                  label: bien.propriete_dite_bien,
                  id: bien.id
                  }))}
                  isLoading={loading}
                  placeholder="Choisir un bien..."
                  className="text-sm"
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
            ? `${ENDPOINTS.REMISECLES}?action=add`
            : undefined
        }
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.REMISECLES}
            Id={selectedId}
            type="RemiseCle"
            message={`Êtes-vous sûr de vouloir supprimer ce remisecle ?`
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
                setRemiseCles,
                setTotalRows
              );      
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default RemiseCleTable;
