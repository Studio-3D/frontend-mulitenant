"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line, RiEyeLine } from "react-icons/ri";
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

const RemiseCleTable = (serviceId) => {
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
  }));
};

  const columns = [
  {
      key: 'date_remise',
      label: 'date Remise',
      render: (row) => {
        const date = new Date(row.date_remise);
        const formattedDate = date.toLocaleDateString('fr-FR'); // jj/mm/aaaa
        return <strong>{formattedDate}</strong>; // en gras
      },
    },     {
    key: "responsable",
    label: "Responsable",
    render: (row) =>
      user?.role <= 2 ? (
        <Link
          target="_blank"
          href={`/Utilisateurs/afficher-utilisateur/${row.user_id_remis}`}
          style={{ textDecoration: 'none', color: 'rgb(102 104 128)' }}
        >
          <strong>{row.user_remis?.name} {row.user_remis?.prenom}</strong>
        </Link>
      ) : null
  },
  {
    key: "bien",
    label: "Bien",
    render: (row) => (
      <Link
        target="_blank"
        href={`/biens/show/${row.bien_id}`}
        style={{ textDecoration: 'none', color: 'rgb(102 104 128)' }}
      >
        <strong>{NomBienComplet(row.bien)}</strong>
      </Link>
    )
  },
  {
    key: "piece_jointe",
    label: "Pièce Jointe",
    render: (row) => (
  row.fichier ? (
    <Box
      component="img"
      src={`${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${row.fichier}`}
      alt="Pièce jointe"
      onClick={() => handleFileClick(row.fichier)}
      sx={{
        width: 40,
        height: 40,
        objectFit: 'cover',
        cursor: 'pointer',
        boxShadow: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    />
  ) : null
)


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
          />      </div>
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
          <div className="space-y-4 p-4 rounded-lg shadow-md">
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
              <Input
                type="text"
                placeholder="Bien..."
                value={tempFilters.bien}
                onChange={(e) => handleFilterChange("bien", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="text"
                placeholder="CC..."
                value={tempFilters.cc}
                onChange={(e) => handleFilterChange("cc", e.target.value)}
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
