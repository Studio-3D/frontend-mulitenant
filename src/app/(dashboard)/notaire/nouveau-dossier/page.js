"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { Eye } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDate, formatDateTime } from "../../../../utils/dateUtils";
import { isNotaire, isRespoLivraison, MODE_FINANCE } from "../../../../configs/enum";
import { fetchData_table_by_projet } from "../../../../configs/api-utils";
import Link from "next/link";
import Input from "@/components/Input";
import DateRangePicker from "@/components/DateRangePicker";
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from "@/configs/api";
import axios from 'axios';
import MenuNotaires from "../MenuNotaires";

const Nouveau_Dossier = ({}) => {
  
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // États pour les notaires
  const [notaires, setNotaires] = useState([]);
  const [loadingNotaires, setLoadingNotaires] = useState(false);
  const [selectedNotaireId, setSelectedNotaireId] = useState(null);
  const [selectedNotaireName, setSelectedNotaireName] = useState("");

  // Validation du rôle
  useEffect(() => {
    if (!isNotaire(userRole) && !isRespoLivraison(userRole)) {
      router.push('/');
    }
  }, [router, userRole]);

  const [filters, setFilters] = useState({
    code_reservation: "",
    date_start: "",
    date_end: "",
    bien: "",
    client: "",
    cc: "",
    notaire_id: "", // Ajout du filtre notaire
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
    setSelectedNotaireId(null);
    setSelectedNotaireName("");
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  // Fonction pour charger les notaires
  const fetchNotaires = async () => {
    if (isRespoLivraison(userRole)) {    
      setLoadingNotaires(true);
      try {
        await axios
              .get(`${APIURL.ROOTV1}/projets/${selectedProjet?.id}/notaires`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
              })
              .then((res) => {
                setNotaires(res.data.notaires);
                setLoadingNotaires(false);
              })
      } catch (error) {
        console.error("Erreur chargement notaires:", error);
        setLoadingNotaires(false);
      }
    }
  };

  // Sélectionner un notaire
  const handleSelectNotaire = (notaireId, notaireNom = "") => {
    setSelectedNotaireId(notaireId);
    setSelectedNotaireName(notaireNom);
    
    // Mettre à jour les filtres avec l'ID du notaire
    const newFilters = { ...tempFilters };
    if (notaireId) {
      newFilters.notaire_id = notaireId;
    } else {
      delete newFilters.notaire_id;
    }
    setTempFilters(newFilters);
    setFilters(newFilters);
  };

  // Configuration de l'entité
  const entity = {
    API_URL: "new_dossiers_notaire",
    dataKey: "data",
    searchFields: [],
  };

  useEffect(() => {
    fetchNotaires();
  }, [userRole]);

  useEffect(() => {
    if (!selectedProjet?.id) return;

    // Préparer les paramètres à envoyer
    const paramsToSend = { ...filters };
    
    // Pour le notaire connecté, ne pas envoyer de filtre notaire_id
    if (isNotaire(userRole)) {
      delete paramsToSend.notaire_id;
    }
    
    // Si aucun notaire sélectionné et on est respo livraison, enlever le filtre
    if (isRespoLivraison(userRole) && !selectedNotaireId) {
      delete paramsToSend.notaire_id;
    }

    fetchData_table_by_projet(
      entity,
      paramsToSend, // Envoyer tous les filtres comme params_url
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters, selectedProjet, selectedNotaireId, userRole]);

  function NomBienComplet(bien) {
    if (!bien) return "";
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien || "");

    return noms.join(" - ");
  }

  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        code_reservation: pro.code_reservation || "",
        cc: pro.user?.name ? `${pro.user.name} ${pro.user.prenom || ""}` : "",
        user_id: pro.user?.id || "",
        date_reservation: pro.date_reservation,
        aquereurs: pro.aquereurs || [],
        bien_id: pro.bien_id,
        bien: pro.bien || {},
        propriete_dite_bien: pro.bien?.propriete_dite_bien || "",
        prix: pro.prix || 0,
        avances_sum_montant: pro.avances_sum_montant || 0,
        statut: pro.statut,
        notaire_id: pro?.notaire_id,
        data_res: pro,
        // Données supplémentaires pour l'export
        nb_acquereurs: pro.nb_acquereurs || 0,
        mode_financement: pro.mode_financement,
      
      };
    });
  };

  const columns = [
    { key: "cc", label: "Commercial" },
    {
      key: "date_reservation",
      label: "Date",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date_reservation ? formatDate(row.date_reservation) : ""}
          </span>
        </div>
      ),
    },
    { key: "code_reservation", label: "Code" },
    {
      key: "propriete_dite_bien",
      label: "Bien",
      render: (row) => (
        <Link target="_blank" href={`/biens/${row.bien_id}`}>
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
            ? (row.prix - row.avances_sum_montant).toLocaleString() + " DH"
            : "0 DH"}
        </b>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Link
            href={`/ventes/reservations/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Link>      
        </div>
      ),
    },
  ];

  const data_to_export = () => {
    return data.map((item) => {
      const acquereursNames = item?.aquereurs
        ? item.aquereurs
            .map(
              (acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || ""
            )
            .filter((name) => name)
            .join(" / ")
        : "";

      const acquereursCin = item?.aquereurs
        ? item.aquereurs
            .map((acq) => acq.client?.cin || "")
            .filter((cin) => cin)
            .join(" / ")
        : "";

      const acquereursTele = item?.aquereurs
        ? item.aquereurs
            .map((acq) => acq.client?.telephone_num1 || "")
            .filter((tele) => tele)
            .join(" / ")
        : "";

      // Déterminer le nom du notaire pour l'export
      let notaireExportName = "";
      if (isNotaire(userRole)) {
        // Si c'est un notaire connecté, utiliser son propre nom
        notaireExportName = `${user?.name || ""} ${user?.prenom || ""}`.trim();
      } else if (selectedNotaireId && selectedNotaireName) {
        // Si un notaire est sélectionné, utiliser le nom sélectionné
        notaireExportName = selectedNotaireName;
      } else if (item.notaire) {
        // Sinon, utiliser le notaire de l'item
        notaireExportName = `${item.notaire.nom || ""} ${item.notaire.prenom || ""}`.trim();
      } else {
        notaireExportName = "Non attribué";
      }

      return {
        code_reservation: item.code_reservation || "",
        date_reservation: item.date_reservation
          ? formatDate(item.date_reservation)
          : "",
        bien: item.bien?.propriete_dite_bien || "",
        prix: item.prix ? `${item.prix.toLocaleString()} DH` : "",
        avance: item.avances_sum_montant
          ? `${item.avances_sum_montant.toLocaleString()} DH`
          : "",
        Reste:
          item.prix && item.avances_sum_montant
            ? `${(item.prix - item.avances_sum_montant).toLocaleString()} DH`
            : "",
        mode_financement: MODE_FINANCE[item.mode_financement]?.label || "",
        noms_acquereurs: acquereursNames,
        cins_acquereurs: acquereursCin,
        tele_acquereurs: acquereursTele,
        notaire: notaireExportName, // Ajout de la colonne notaire
      };
    });
  };

  const columns_export = [
    { key: "code_reservation", label: "Code reservation" },
    { key: "date_reservation", label: "Date reservation" },
    { key: "bien", label: "Bien" },
    { key: "notaire", label: "Notaire" }, // Nouvelle colonne
    { key: "prix", label: "Prix" },
    { key: "avance", label: "Avance" },
    { key: "Reste", label: "Reste" },
    { key: "mode_financement", label: "Mode financement" },
    { key: "noms_acquereurs", label: "Nom client" },
    { key: "cins_acquereurs", label: "Cin client" },
    { key: "tele_acquereurs", label: "Tele client" },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Menu des notaires pour responsable livraison */}
        {isRespoLivraison(userRole) && (
         <MenuNotaires
            notaires={notaires}
            selectedNotaire={selectedNotaireId}
            onSelectNotaire={handleSelectNotaire}
            loading={loadingNotaires}
          />
        )}

        <div className="bg-white rounded-lg p-4">
          <Table
            title={
              selectedNotaireId && selectedNotaireName
                ? `Dossiers du  ${selectedNotaireName}`
                : isRespoLivraison(userRole)
                ? "Liste des Nouveaux Dossiers - Tous les notaires"
                : "Mes Nouveaux Dossiers"
            }
            data_to_export={data_to_export()}
            columns_export={columns_export}
            name_file_export={"new_dossier_export"}
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
            addLink={false}
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
                    label="Code Réservation"
                    value={tempFilters.code_reservation}
                    onChange={(e) =>
                      handleFilterChange("code_reservation", e.target.value)
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
                    label="Responsable"
                    value={tempFilters.cc}
                    onChange={(e) => handleFilterChange("cc", e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                  
                  {/* Champ notaire_id caché pour maintenir le filtre */}
                  {isRespoLivraison(userRole) && selectedNotaireId && (
                    <input
                      type="hidden"
                      value={selectedNotaireId}
                      onChange={(e) => handleFilterChange("notaire_id", e.target.value)}
                    />
                  )}
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
      </div>
    </>
  );
};

export default Nouveau_Dossier;