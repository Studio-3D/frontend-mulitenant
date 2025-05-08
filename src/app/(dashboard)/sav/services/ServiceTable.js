"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";

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

  const entity = {
    API_URL: "ServicesPrestataires",
    dataKey: "data",
    name: "Service",
    searchFields: ["nom"],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      {}, // ← ici tu mets params_url vide ou personnalisé si besoin
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setServices,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken]);
  
  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.ServicesPrestataires}?id=${id}&action=edit`);

  const columns = [
    { key: "nom", label: "Nom du service" },
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
    return services.map((ser) => ({
      id: ser.id,
      nom: ser.nom,
    }));
  };

  const data_to_export = () => {
    return services.map((srv) => ({
      nom: srv.nom,
      // Ajoute d'autres champs utiles si nécessaire
    }));
  };

  const columns_export = [{ key: "nom", label: "Nom" }];

  return (
    <>
      <Table
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"service_export"}
        columns={columns}
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
            ? `${ENDPOINTS.ServicesPrestataires}?action=add`
            : undefined
        }
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.ServicesPrestataires}
            Id={selectedId}
            message={"Êtes-vous sûr de vouloir supprimer ce service ?"}
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
                setServices,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default ServiceTable;
