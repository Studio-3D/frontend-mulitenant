"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { isSuperAdmin, isAdmin } from "@/configs/enum";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import Link from "next/link";
import Input from "@/components/Input";
import DateRangePicker from "@/components/DateRangePicker";
import { useProjet } from "@/context/ProjetContext";

const EtatDossierTable = () => {
  const { selectedProjet } = useProjet();
  const { user } = useAuth();
  const userRole = user?.role;
  const accesstoken = localStorage.getItem("accessToken");
  const router = useRouter();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [filters, setFilters] = useState({
    code_dossier: "",
    date_start: "",
    date_end: "",
    bien: "",
    client: "",
    statut: "",
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    const reset = Object.fromEntries(
      Object.keys(filters).map((key) => [key, ""])
    );
    setFilters(reset);
    setTempFilters(reset);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const entity = {
    API_URL: "etat-dossiers", // Change to your actual API endpoint
    dataKey: "data",
    searchFields: [],
  };

  useEffect(() => {
    const combinedFilters = { ...filters };
    
    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters,selectedProjet]);

 
  const NomBienComplet = (bien) => {
    if (!bien) return "";
    
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    if (bien.propriete_dite_bien) noms.push(bien.propriete_dite_bien);

    return noms.join(" - ");
  };

 const formatData = () => {
  return data.map((item) => {
    const acquereursNames = item?.aquereurs
      ? item.aquereurs
          .map(
            (acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || ""
          )
          .filter((name) => name)
          .join(" / ")
      : "";
    
    return {
      id: item.id,
      code_dossier: item.code_dossier || item.code_reservation || "N/A",
      cc: item.user ? `${item.user.name} ${item.user.prenom}` : "N/A",
      user_id: item.user?.id,
      date_creation: item.date_creation || item.created_at || item.date_reservation,
      clients: item.clients || item.aquereurs || [],
      bien_id: item.bien_id,
      bien: item.bien,
      propriete_dite_bien: item.bien?.propriete_dite_bien,
      prix: item.prix || 0,
      avances_sum_montant: item.avances_sum_montant || 0,
      statut: item.statut || item.etat || "N/A",
      data_item: item,
      nomComplet: acquereursNames,
      // Also store the aquereurs array for use in the render function
      aquereurs: item.aquereurs || []
    };
  });
};

  const columns = [
    {
      key: "cc",
      label: "Responsable",
      render: (row) => {
        return isSuperAdmin(userRole) || isAdmin(userRole) ? (
          <>
            {row.data_item.user && (
              <Link
                target="_blank"
                href={"/Utilisateurs/afficher-utilisateur/" + row.user_id}
              >
                <strong style={{ fontWeight: 600 }}>{row.cc}</strong>
              </Link>
            )}
          </>
        ) : (
          row.cc
        );
      },
    },
    {
      key: "date_creation",
      label: "Date",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date_creation ? formatDate(row.date_creation) : "N/A"}
          </span>
        </div>
      ),
    },
    { key: "code_dossier", label: "Code Dossier" },
  {
  key: 'nomComplet',
  label: 'Nom Complet',
  render: (row) => {
    return row.aquereurs && row.aquereurs.length > 0 ? (
      row.aquereurs.map((acq, index) => (
        <div key={index} className="">
          {acq.client && acq.client.id ? (
            <Link
              target="_blank"
              href={`/ventes/clients/${acq.client.id}`}
             
            >
              <strong style={{ fontWeight: 600 }}>
                {acq.client.nom} {acq.client.prenom}
              </strong>
            </Link>
          ) : (
            <span>
              {acq.client?.nom} {acq.client?.prenom}
            </span>
          )}
        </div>
      ))
    ) : (
      <span className="text-gray-400"></span>
    );
  },
},
    {
      key: "propriete_dite_bien",
      label: "Bien",
      render: (row) => (
        <Link target="_blank" href={`/Biens/${row.bien_id}`}>
          <strong style={{ fontWeight: 600 }}>
            {NomBienComplet(row.bien)}
          </strong>
        </Link>
      ),
    },
    {
      key: "prix",
      label: "Prix",
      render: (row) => (
        <b style={{ color: "blue" }}>
          {row.prix ? `${row.prix.toLocaleString()} DH` : "0 DH"}
        </b>
      ),
    },
    {
      key: "avance",
      label: "Avance",
      render: (row) => (
        <b style={{ color: "green" }}>
          {row.avances_sum_montant
            ? `${row.avances_sum_montant.toLocaleString()} DH`
            : "0 DH"}
        </b>
      ),
    },
    {
      key: "reste",
      label: "Reste",
      render: (row) => (
        <b style={{ color: "red" }}>
          {row.prix && row.avances_sum_montant
            ? `${(row.prix - row.avances_sum_montant).toLocaleString()} DH`
            : "0 DH"}
        </b>
      ),
    },
    
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
        <div title="Détail du dossier">
            <Link
                href={`/etat-dossiers/${row.id}`}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                title="Voir les détails"
            >
                <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const data_to_export = () => {
    return data.map((item) => {
      const clientsInfo =  item.aquereurs || [];
      
      const clientsNames = clientsInfo
        .map((client) => 
          client.client 
            ? `${client.client.nom || ""} ${client.client.prenom || ""}`.trim()
            : client.nom || ""
        )
        .filter((name) => name)
        .join(" / ");

      const clientsCin = clientsInfo
        .map((client) => 
          client.client?.cin || client.cin || ""
        )
        .filter((cin) => cin)
        .join(" / ");

      const clientsTele = clientsInfo
        .map((client) => 
          client.client?.telephone_num1 || client.telephone || ""
        )
        .filter((tele) => tele)
        .join(" / ");

      return {
        code_dossier: item.code_dossier || item.code_reservation || "",
        date_creation: item.date_creation 
          ? formatDate(item.date_creation)
          : item.created_at 
            ? formatDate(item.created_at)
            : "",
        bien: NomBienComplet(item?.bien) || "",
        prix: item.prix ? `${item.prix.toLocaleString()} DH` : "0 DH",
        avance: item.avances_sum_montant
          ? `${item.avances_sum_montant.toLocaleString()} DH`
          : "0 DH",
        Reste: item.prix && item.avances_sum_montant
          ? `${(item.prix - item.avances_sum_montant).toLocaleString()} DH`
          : "0 DH",
        responsable: item.user 
          ? `${item.user.name || ""} ${item.user.prenom || ""}`.trim()
          : "",
        noms_clients: clientsNames,
        cins_clients: clientsCin,
        tele_clients: clientsTele,
        date_validation: item.date_validation 
          ? formatDate(item.date_validation)
          : "",
        commentaire: item.commentaire || "",
      };
    });
  };

  const columns_export = [
    { key: "code_dossier", label: "Code Dossier" },
    { key: "date_creation", label: "Date création" },
    { key: "bien", label: "Bien" },
    { key: "prix", label: "Prix" },
    { key: "avance", label: "Avance" },
    { key: "Reste", label: "Reste" },
    { key: "responsable", label: "Responsable" },
    { key: "noms_clients", label: "Nom(s) client(s)" },
    { key: "cins_clients", label: "CIN client(s)" },
    { key: "tele_clients", label: "Téléphone client(s)" },
    { key: "date_validation", label: "Date validation" },
    { key: "commentaire", label: "Commentaire" },
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <Table
        title="Liste des États Dossiers"
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"etat_dossiers_export"}
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
        enableExport={formatData().length > 0}
        enableImport={false}
        showSearch={false}
        addLink={undefined} // No add button needed for etat dossier
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <Input
                type="text"
                label="Code Dossier"
                value={tempFilters.code_dossier}
                onChange={(e) =>
                  handleFilterChange("code_dossier", e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                label="Bien"
                value={tempFilters.bien}
                onChange={(e) => handleFilterChange("bien", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                label="Client"
                value={tempFilters.client}
                onChange={(e) => handleFilterChange("client", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                type="text"
                label="Statut"
                value={tempFilters.statut}
                onChange={(e) => handleFilterChange("statut", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <DateRangePicker
                startName="date_start"
                endName="date_end"
                startValue={tempFilters.date_start}
                endValue={tempFilters.date_end}
                onChange={handleFilterChange}
                label="Choisir une Date"
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
      />
    </div>
  );
};

export default EtatDossierTable;