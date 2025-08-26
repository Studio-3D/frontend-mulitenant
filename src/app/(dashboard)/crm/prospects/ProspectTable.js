"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { Eye, Pencil, Check, RefreshCw, Trash2, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import DeleteData from "@/components/DeleteData";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import { APIURL, ENDPOINTS } from "@/configs/api";
import { useRouter } from "next/navigation";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isCommercial, isSuperAdmin } from "@/configs/enum";
import Modal_Traite from "./Modal_Traite";
import {
  Statuts_Prospect,
  getProspectStatusColor,
  getProspectStatusLabel,
  canProspectBeAssigned,
} from "@/configs/enum";
import { Check as CheckIcon } from "lucide-react";
import Input from "@/components/Input";
import SelectInput from "@/components/SelectInput";
import Modal_Import from "@/components/Modal_Import";
import Button from "@/components/Button";
import { format } from "date-fns";

// Custom Checkbox Component
const CustomCheckbox = ({
  checked,
  onChange,
  disabled = false,
  className = "",
  title = "",
  ariaLabel = "",
}) => {
  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`
          relative w-5 h-5 rounded border-2 transition-all duration-200 ease-in-out transform
          ${
            checked
              ? "bg-blue-600 border-blue-600 shadow-lg scale-105"
              : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }
          ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
              : "cursor-pointer hover:shadow-md active:scale-95"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${className}
        `}
        title={title}
        aria-label={ariaLabel}
        aria-checked={checked}
        role="checkbox"
      >
        <div
          className={`
          absolute inset-0 rounded transition-all duration-200
          ${checked ? "bg-blue-600" : "bg-transparent"}
        `}
        >
          {checked && (
            <CheckIcon
              className={`
                absolute inset-0 w-3 h-3 m-auto text-white animate-in zoom-in duration-200
                ${disabled ? "text-gray-400" : "text-white"}
              `}
              strokeWidth={3}
            />
          )}
        </div>
      </button>
    </div>
  );
};

const ProspectTable = ({ showOnlyAssigned = false }) => {
  // --- State ---
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open_traite, setOpen_traite] = useState(false);
  const [traite_id, setId_traite] = useState(null);
  const [num_tel, setTel_num] = useState(null);
  const [nom_prenom, setNomPrenom] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [checkedProspects, setCheckedProspects] = useState([]);
  const [showAffecterModal, setShowAffecterModal] = useState(false);
  const [commercials, setCommercials] = useState([]);
  const [selectedCommercial, setSelectedCommercial] = useState("");
  const [assignMode, setAssignMode] = useState("selective");
  const [showCommercialDropdown, setShowCommercialDropdown] = useState(false);
  const [searchCommercial, setSearchCommercial] = useState("");
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    cin: "",
    telephone: "",
    email: "",
    statut: "",
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const { user, token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();

  // Check if user is commercial to disable assignment features
  const isCommercialUser = isCommercial(user?.role);

  // --- Data Fetch ---
  useEffect(() => {
    // Don't add filtering in the API call, we'll filter in frontend
    fetchData_table_by_projet(
      {
        API_URL: "prospects",
        dataKey: "prospects",
        searchFields: ["nom", "prenom", "email", "telephone", "cin"],
      },
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setProspects,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
    user,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 1200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("load_data_prospect") == 1) {
        fetchData_table_by_projet(
          {
            API_URL: "prospects",
            dataKey: "prospects",
            searchFields: ["nom", "prenom", "email", "telephone", "cin"],
          },
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setProspects,
          setTotalRows
        );
        localStorage.removeItem("load_data_prospect");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  // --- Format Data with Frontend Filtering ---
  const formatData = () => {
    let filteredProspects = prospects;

    // Apply frontend filtering for "Mes prospects" when user is commercial
    if (showOnlyAssigned && isCommercialUser && user?.id) {
      filteredProspects = prospects.filter((pro) => {
        // Check if prospect has a commercial assigned and if it matches current user
        // The user.id from frontend corresponds to user_id_origin in backend
        return (
          pro.commercial_affecte &&
          pro.commercial_affecte.user_id_origin === user.id
        );
      });
    }

    return filteredProspects.map((pro) => ({
      id: pro.id,
      nom: `${pro.nom || ""}`.trim(),
      prenom: `${pro.prenom || ""}`.trim(),
      nomComplet: `${pro.nom || ""} ${pro.prenom || ""}`.trim(),
      email: pro.email,
      telephone:
        (pro.telephone ? pro.telephone : "") +
          (pro.telephone && pro.telephone_num2 && pro.telephone_num2 !== "null"
            ? " / " + pro.telephone_num2
            : "") || "Non spécifié",
      cin: pro.cin,
      client: pro.client,
      visites: pro.visites,
      appels: pro.appels,
      origin: pro.origin,
      date: pro.created_at
        ? format(new Date(pro.created_at), "yyyy-MM-dd")
        : "",
      statut: getProspectStatusLabel(pro.last_statut?.statut || ""),
      commercial_affecte: pro.commercial_affecte || null,
      affecte_par_admin: pro.affecte_par_admin || null,
      traite_par_user: pro.traite_par_user || null,
      date_affectation: pro.date_affectation
        ? format(new Date(pro.date_affectation), "yyyy-MM-dd HH:mm")
        : "",
      date_traitement: pro.date_traitement
        ? format(new Date(pro.date_traitement), "yyyy-MM-dd HH:mm")
        : "",
      prospect: pro,
    }));
  };

  // Calculate filtered total rows for pagination
  const getFilteredTotalRows = () => {
    if (showOnlyAssigned && isCommercialUser && user?.id) {
      const filteredCount = prospects.filter(
        (pro) =>
          pro.commercial_affecte &&
          pro.commercial_affecte.user_id_origin === user.id
      ).length;
      return filteredCount;
    }
    return totalRows;
  };

  // --- Export with filtered data ---
  const data_to_export = () => {
    let filteredProspects = prospects;

    // Apply same filtering for export
    if (showOnlyAssigned && isCommercialUser && user?.id) {
      filteredProspects = prospects.filter(
        (pro) =>
          pro.commercial_affecte &&
          pro.commercial_affecte.user_id_origin === user.id
      );
    }

    return filteredProspects.map((pro) => ({
      nomComplet: `${pro.nom || ""} ${pro.prenom || ""}`.trim(),
      email: pro.email,
      telephone:
        (pro.telephone ? pro.telephone : "") +
          (pro.telephone && pro.telephone_num2 && pro.telephone_num2 !== "null"
            ? " / " + pro.telephone_num2
            : "") || "Non spécifié",
      cin: pro.cin,
      type_client: pro.partenaire_id === null ? "Particulier" : "professionnel",
      partenaire: pro.partenaire_id ? pro.partenaire?.description : "",
      source: pro?.source?.source,
      origin: pro.origin,
      date: pro.created_at
        ? format(new Date(pro.created_at), "yyyy-MM-dd")
        : "",
    }));
  };

  const columns_export = [
    { key: "nomComplet", label: "nomComplet" },
    { key: "telephone", label: "Telephone" },
    { key: "cin", label: "Cin" },
    { key: "email", label: "Email" },
    { key: "type_client", label: "Type Prospect" },
    { key: "source", label: "Source" },
    { key: "partenaire", label: "Partenaire" },
    { key: "origin", label: "Origine" },
    { key: "date", label: "Date" },
  ];

  // --- Table Columns ---
  const columns = [
    // Only show checkbox column if user is not commercial
    ...(!isCommercialUser
      ? [
          {
            key: "__checkbox__",
            label: (() => {
              const assignableProspects = formatData().filter((row) =>
                canProspectBeAssigned(row.prospect)
              );
              return (
                <div className="flex items-center justify-center">
                  <CustomCheckbox
                    checked={
                      assignableProspects.length > 0 &&
                      checkedProspects.length === assignableProspects.length
                    }
                    onChange={() =>
                      handleCheckAll(
                        !(
                          assignableProspects.length > 0 &&
                          checkedProspects.length === assignableProspects.length
                        )
                      )
                    }
                    ariaLabel="Tout sélectionner"
                    title="Sélectionner/Désélectionner tous les prospects"
                    className="ring-2 ring-blue-200"
                  />
                </div>
              );
            })(),
            render: (row) => {
              const canBeAssigned = canProspectBeAssigned(row.prospect);
              return (
                <CustomCheckbox
                  checked={checkedProspects.includes(row.id)}
                  onChange={() => canBeAssigned && handleCheckProspect(row.id)}
                  disabled={!canBeAssigned}
                  ariaLabel={`Sélectionner le prospect ${row.nom} ${row.prenom}`}
                  title={
                    !canBeAssigned
                      ? "Ce prospect ne peut pas être assigné (statut final)"
                      : `Sélectionner ${row.nom} ${row.prenom}`
                  }
                />
              );
            },
          },
        ]
      : []),
    {
      key: "nom",
      label: "Nom",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.nom}</span>
        </div>
      ),
    },
    {
      key: "prenom",
      label: "Prénom",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.prenom}</span>
        </div>
      ),
    },
    { key: "telephone", label: "Téléphone" },
    {
      key: "commercial_affecte",
      label: "Commercial affecté",
      render: (row) => (
        <div>
          <span>
            {row.commercial_affecte
              ? `${row.commercial_affecte.name || ""} ${
                  row.commercial_affecte.prenom || ""
                }`
              : ""}
          </span>
          {row.affecte_par_admin && (
            <div className="text-xs text-gray-500">
              Affecté par: {row.affecte_par_admin.name}{" "}
              {row.affecte_par_admin.prenom}
              {row.date_affectation && <div>Le: {row.date_affectation}</div>}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) => {
        if (!row.statut) return "";
        return (
          <div>
            <span
              className={`px-2 py-1 rounded text-sm font-semibold ${getProspectStatusColor(
                row.statut
              )}`}
            >
              {row.statut}
            </span>
            {row.traite_par_user && (
              <div className="text-xs text-gray-500 mt-1">
                Traité par: {row.traite_par_user.name}{" "}
                {row.traite_par_user.prenom}
                {row.date_traitement && <div>Le: {row.date_traitement}</div>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "origin",
      label: "Origine",
      render: (row) => <span>{row.origin}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => <span>{row.date || ""}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <div title="Voir détails">
            <Eye
              className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
              onClick={() => handleShow(row.id)}
            />
          </div>
          <div title="Modifier">
            <Pencil
              className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
              onClick={() => handleEdit(row.id)}
            />
          </div>
          <div title="Traiter">
            <Check
              className="w-4 h-4  hover:text-['rgb(87,80,129)']-700 text-['rgb(87,80,129)'] cursor-pointer"
              onClick={() =>
                handleraiter(row.id, row.telephone, row.nomComplet)
              }
            />
          </div>
          <div title="Convertir en visite">
            <RefreshCw
              className="w-4 h-4 !text-green-500  cursor-pointer"
              onClick={() => handle_convert_to_visite(row.prospect)}
            />
          </div>
          {row.client == null &&
            row.visites.length == 0 &&
            row.appels == null && (
              <div title="Supprimer utilisateur">
                <Trash2
                  className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() => {
                    setSelectedId(row.id);
                    setShowDeleteModal(true);
                  }}
                />
              </div>
            )}
        </div>
      ),
    },
  ];

  // --- Handlers ---
  const handleImportClick = () => setShowImportModal(true);
  const handleShow = (prospectId) =>
    router.push(`/crm/prospects/${prospectId}`);
  const handleEdit = (ProspectId) =>
    router.push(`${ENDPOINTS.PROSPECTS}?id=${ProspectId}&action=edit`);
  const handleraiter = (Id, num_tel, nom_prenom) => {
    setOpen_traite(!open_traite);
    setId_traite(Id);
    setTel_num(num_tel);
    setNomPrenom(nom_prenom);
  };
  const handle_convert_to_visite = (row) => {
    localStorage.setItem(
      "selectedProspect",
      JSON.stringify({ dataProspect: row })
    );
    router.push(`${ENDPOINTS.VISITES}?action=add`);
  };
  const handleFilterChange = (field, value) =>
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  const applyFilters = () => setFilters(tempFilters);
  const resetFilters = () => {
    const reset = {
      nom: "",
      prenom: "",
      cin: "",
      telephone: "",
      email: "",
      statut: "",
    };
    setFilters(reset);
    setTempFilters(reset);
  };
  const handleCheckProspect = (id) =>
    setCheckedProspects((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  const handleCheckAll = (checked) => {
    if (checked) {
      // Only select prospects that can be assigned
      const assignableProspects = formatData().filter((row) =>
        canProspectBeAssigned(row.prospect)
      );
      setCheckedProspects(assignableProspects.map((row) => row.id));
    } else {
      setCheckedProspects([]);
    }
  };
  const handleOpenAffecter = () => setShowAffecterModal(true);
  const handleCloseAffecter = () => {
    setShowAffecterModal(false);
    setSelectedCommercial("");
  };
  const handleAffecterSubmit = async () => {
    if (!selectedCommercial) return;
    try {
      // Find the full prospect object for each checked prospect
      const selectedProspects = prospects.filter((pro) =>
        checkedProspects.includes(pro.id)
      );
      await Promise.all(
        selectedProspects.map((pro) => {
          // Clean up fields: convert "null" string to null or empty string
          const clean = (val) =>
            val === "null" || val === null || val === undefined ? "" : val;
          return fetch(`${APIURL.PROSPECTS}/${pro.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${accesstoken}`,
            },
            body: JSON.stringify({
              nom: clean(pro.nom),
              prenom: clean(pro.prenom),
              telephone: clean(pro.telephone),
              telephone_num2: clean(pro.telephone_num2),
              email: clean(pro.email),
              cin: clean(pro.cin),
              origin: clean(pro.origin),
              notifie: pro.notifie,
              source: pro.source?.id || pro.source,
              partenaire_id: pro.partenaire_id,
              message: clean(pro.message),
              ville: clean(pro.ville),
              commercial_affecte: selectedCommercial,
            }),
          });
        })
      );
      setShowAffecterModal(false);
      setSelectedCommercial("");
      setCheckedProspects([]);
      fetchData_table_by_projet(
        {
          API_URL: "prospects",
          dataKey: "prospects",
          searchFields: ["nom", "prenom", "email", "telephone", "cin"],
        },
        filters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setProspects,
        setTotalRows
      );
    } catch (e) {
      // Handle error
    }
  };
  const handleAffectationAuto = async () => {
    if (!checkedProspects.length) return;
    try {
      const response = await fetch(`${APIURL.ROOT}/v1/prospects/auto-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify({
          prospect_ids: checkedProspects,
          projet_id: selectedProjet.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setShowAffecterModal(false);
      setSelectedCommercial("");
      setCheckedProspects([]);

      fetchData_table_by_projet(
        {
          API_URL: "prospects",
          dataKey: "prospects",
          searchFields: ["nom", "prenom", "email", "telephone", "cin"],
        },
        filters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setProspects,
        setTotalRows
      );

      // Show success message
      console.log("Auto-assignment completed:", result.assignments);
    } catch (e) {
      console.error("Auto-assignment failed:", e);
      // Handle error - maybe show a toast notification
    }
  };

  // --- Fetch commercials when modal opens ---
  useEffect(() => {
    if (showAffecterModal && selectedProjet?.id) {
      const fetchCommercials = async () => {
        try {
          const res = await fetch(
            `${APIURL.ROOT}/v1/get_commerciaux/${selectedProjet.id}`,
            { headers: { Authorization: `Bearer ${accesstoken}` } }
          );
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          const commercialUsers = data.users
            ? data.users.map((item) => item.user).filter(Boolean)
            : [];
          setCommercials(commercialUsers);
        } catch (e) {
          setCommercials([]);
        }
      };
      fetchCommercials();
    }
  }, [showAffecterModal, selectedProjet, accesstoken]);

  // --- Commercials dropdown logic ---
  const filteredCommercials = commercials.filter((user) =>
    `${user.name} ${user.prenom}`
      .toLowerCase()
      .includes(searchCommercial.toLowerCase())
  );

  // --- Render ---
  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={"propects_export"}
          columns={columns}
          data={formatData()}
          totalRows={getFilteredTotalRows()}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={true}
          enableImport={true}
          onImportClick={handleImportClick}
          showSearch={false}
          addLink={
            user &&
            (isSuperAdmin(user.role) ||
              isAdmin(user.role) ||
              isCommercial(user.role))
              ? `${ENDPOINTS.PROSPECTS}?action=add`
              : undefined
          }
          extraActions={
            // Only show assign button for non-commercial users
            !isCommercialUser &&
            checkedProspects.length > 0 && (
              <button
                className="flex gap-1 items-center bg-[#009FFF] text-white font-medium rounded-lg px-3 py-1.5"
                onClick={() => setShowAffecterModal(true)}
                type="button"
              >
                Affecter
              </button>
            )
          }
          filterComponent={
            <div className="space-y-4 ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                }}
              >
                <Input
                  type="text"
                  label="Cin"
                  value={tempFilters.cin}
                  onChange={(e) => handleFilterChange("cin", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Nom"
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange("nom", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Prénom"
                  value={tempFilters.prenom}
                  onChange={(e) => handleFilterChange("prenom", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="number"
                  label="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange("telephone", e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="email"
                  label="Email"
                  value={tempFilters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <SelectInput
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange("statut", value)}
                  options={Object.values(Statuts_Prospect).map((data) => ({
                    value: data.id,
                    label: data.label,
                  }))}
                  label="Choisir un Statut"
                  className="h-10 text-sm w-full"
                />
              </div>
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
          rowClassName={(row) => {
            if (!isCommercialUser && checkedProspects.includes(row.id)) {
              return "bg-blue-50";
            }
            if (!canProspectBeAssigned(row.prospect)) {
              return "bg-gray-50 opacity-60";
            }
            return "";
          }}
        />

        {/* Affecter Modal - Only show for non-commercial users */}
        {!isCommercialUser && showAffecterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={handleCloseAffecter}
                aria-label="Fermer"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">
                Affecter des prospects
              </h2>

              {/* Assignment mode toggle */}
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignMode("selective")}
                  className={`px-3 py-1.5 rounded-md border ${
                    assignMode === "selective"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  Sélective (choisir un commercial)
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode("auto")}
                  className={`px-3 py-1.5 rounded-md border ${
                    assignMode === "auto"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  Automatique (répartition équitable)
                </button>
              </div>

              {/* Selective assignment block */}
              {assignMode === "selective" && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-gray-700">
                    Sélectionner un commercial
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowCommercialDropdown(!showCommercialDropdown)
                      }
                      className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span>
                        {selectedCommercial
                          ? (() => {
                              const user = commercials.find(
                                (u) => u.id == selectedCommercial
                              );
                              return user
                                ? `${user.name} ${user.prenom}`
                                : "Sélectionner un commercial";
                            })()
                          : "Sélectionner un commercial"}
                      </span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={
                            showCommercialDropdown
                              ? "M5 15l7-7 7 7"
                              : "M19 9l-7 7-7-7"
                          }
                        />
                      </svg>
                    </button>
                    {showCommercialDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                          <input
                            type="text"
                            value={searchCommercial}
                            onChange={(e) =>
                              setSearchCommercial(e.target.value)
                            }
                            placeholder="Rechercher un commercial..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="py-1">
                          {filteredCommercials.length === 0 ? (
                            <div className="px-4 py-2 text-sm !text-gray-500">
                              Aucun commercial trouvé
                            </div>
                          ) : (
                            filteredCommercials.map((user) => (
                              <div key={user.id} className="px-2 py-1">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={selectedCommercial == user.id}
                                    onChange={() => {
                                      setSelectedCommercial(user.id);
                                      setShowCommercialDropdown(false);
                                    }}
                                    className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="ml-2 block text-sm">
                                    {user.name} {user.prenom}
                                  </span>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {assignMode === "selective" ? (
                  <Button
                    type="button"
                    onClick={handleAffecterSubmit}
                    disabled={!selectedCommercial}
                    className="bg-[#009FFF] text-white"
                  >
                    Affecter
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleAffectationAuto}
                    className="bg-gray-700 text-white"
                  >
                    Lancer l'affectation automatique
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.PROSPECTS}
            Id={selectedId}
            type="Prospect"
            message={"Etes-vous sûr de vouloir supprimer ce Prospect ?"}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                {
                  API_URL: "prospects",
                  dataKey: "prospects",
                  searchFields: ["nom", "prenom", "email", "telephone", "cin"],
                },
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setProspects,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
      {open_traite && (
        <Modal isVisible={true} onClose={() => setOpen_traite(false)}>
          <Modal_Traite
            nom_prenom={nom_prenom}
            num_tel={num_tel}
            id={traite_id}
            onClose={() => setOpen_traite(false)}
          />
        </Modal>
      )}
      {showImportModal && (
        <Modal isVisible={true} onClose={() => setShowImportModal(false)}>
          <Modal_Import
            title="Prospects"
            route="upload_excel_prospect"
            localstorage="load_data_prospect"
            onClose={() => setShowImportModal(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default ProspectTable;
