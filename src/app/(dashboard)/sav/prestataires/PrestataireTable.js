"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line, RiEyeLine } from "react-icons/ri";

import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import SelectInput from "@/components/SelectInput";
import Input from "@/components/Input";

const PrestataireTable = () => {
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

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    adresse:"",
    service_id: "",
    
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: "Prestataires",
    dataKey: "prestataires",
    name: "Prestataire",
    searchFields: ["nom"],
  };
  const fetchServices = async () => {
      try {
  
        const response = await axios.get(
          `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/ServicesPrestataires/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const { data } = response;
        setServices(data.services);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    useEffect(() => {
      fetchServices();
    }, []);

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
        setPrestataires,
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
        nom: "",
        prenom: "",
        cin: "",
        email: "",
        telephone: "",
        adresse:"",
        service_id: "",
      };
      setFilters(reset);
      setTempFilters(reset);
    };

  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.Prestataires}?id=${id}&action=edit`);

  const columns = [
    { key: "cin", label: "CIN" },
    { key: "nom", label: "Nom" },
    { key: "prenom", label: "Prénom" },
    { key: "email", label: "Email" },
    {
      key: "service",
      label: "Service",
      render: (row) => {
        return  row.service.nom 
      },
    },
    
         
    { key: "telephone", label: "Téléphone" },
    { key: "adresse", label: "Adresse" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <FaEdit
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            onClick={() => handleEdit(row.id)}
          />
          {row.reclamations?.length > 0 ? (
            <RiEyeLine
              className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
              onClick={() => handleShow(row.id)}
            />
          ) : (
            <RiDeleteBin6Line
              className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => {
                setSelectedId(row.id);
                setShowDeleteModal(true);
              }}
            />
          )}
        </div>
      ),
    },
  ];
  

  const formatData = () => {
    return prestataires.map((pre) => ({
      id: pre.id,
      cin: pre.cin,
      nom: pre.nom,
      prenom: pre.prenom,
      email: pre.email,
      service: pre.service || '',
      telephone: pre.telephone,
      adresse: pre.adresse,
      reclamations: pre.reclamations || [],
    }));
  };
  

  const data_to_export = () => {
    return prestataires.map((pre) => ({
      CIN: pre.cin,
      Nom: pre.nom,
      Prénom: pre.prenom,
      Email: pre.email,
      Service: pre.service?.nom || '',
      Téléphone: pre.telephone,
      Adresse: pre.adresse,
    }));
  };
  

  const columns_export = [
    { key: "CIN", label: "CIN" },
    { key: "Nom", label: "Nom" },
    { key: "Prénom", label: "Prénom" },
    { key: "Email", label: "Email" },
    { key: "Service", label: "Service" },
    { key: "Téléphone", label: "Téléphone" },
    { key: "Adresse", label: "Adresse" },
  ];
  
  return (
    <>
      <Table
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"prestataire_export"}
        columns={columns}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              {/* Champs de recherche */}
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
              <Input
                type="text"
                placeholder="Adresse..."
                value={tempFilters.adresse}
                onChange={(e) => handleFilterChange("adresse", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <select
                value={tempFilters.service_id}
                onChange={(e) => handleChange("propriete_dite_bien", e.target.value)} // Envoi du service_id
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              >
                <option value="" disabled>Choisir un service</option>
                {loading ? (
                  <option>Chargement...</option>
                ) : (
                  services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} {/* Assure-toi d'utiliser le nom correct */}
                    </option>
                  ))
                )}
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
            ? `${ENDPOINTS.Prestataires}?action=add`
            : undefined
        }
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.Prestataires}
            Id={selectedId}
            message={"Êtes-vous sûr de vouloir supprimer ce prestataire ?"}
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
                setPrestataires,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default PrestataireTable;
