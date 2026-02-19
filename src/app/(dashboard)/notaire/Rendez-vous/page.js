'use client';

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { Eye, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { isNotaire, isRespoLivraison } from "@/configs/enum";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import Link from "next/link";
import Input from "@/components/Input";
import DateRangePicker from "@/components/DateRangePicker";
import { useProjet } from '@/context/ProjetContext';
import SelectInput from "@/components/SelectInput";
import axios from 'axios';
import { APIURL } from "@/configs/api";
import MenuNotaires from "../MenuNotaires";

// RDV status constants
const RDV_STATUS = {
  1: { code: 1, label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  2: { code: 2, label: "Traité", color: "bg-green-100 text-green-800" },
  3: { code: 3, label: "Non traité", color: "bg-red-100 text-red-800" }
};

// For SelectInput options
const RDV_STATUS_OPTIONS = Object.values(RDV_STATUS).map((status) => ({
  value: status.code,
  label: status.label,
}));

export default function RelancesRdv_notaire({ type }) {
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();
  const router = useRouter();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour les notaires
  const [notaires, setNotaires] = useState([]);
  const [loadingNotaires, setLoadingNotaires] = useState(false);
  const [selectedNotaireId, setSelectedNotaireId] = useState(null);
  const [selectedNotaireName, setSelectedNotaireName] = useState("");

  
  const [filters, setFilters] = useState({
    code_reservation: "",
    date_start: "",
    date_end: "",
    bien: "",
    client: "",
    cc: "",
    // New filters
    rdv_date_start: "",
    rdv_date_end: "",
    relance_date_start: "",
    relance_date_end: "",
    statut: "", // For RDV status filter
    notaire_id: "", // Ajout du filtre notaire
    type_rdv: "",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  
  const resetFilters = () => {
    const reset = {
      code_reservation: "",
      date_start: "",
      date_end: "",
      bien: "",
      client: "",
      cc: "",
      rdv_date_start: "",
      rdv_date_end: "",
      relance_date_start: "",
      relance_date_end: "",
      statut: "",
      notaire_id: "",
      type_rdv: "",
    };
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
        const response = await axios.get(`${APIURL.ROOTV1}/projets/${selectedProjet?.id}/notaires`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setNotaires(response.data.notaires || []);
      } catch (error) {
        console.error("Erreur chargement notaires:", error);
      } finally {
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

  useEffect(() => {
    fetchNotaires();
  }, [userRole]);

  const entity = {
    API_URL: type == 1 ? "rdvs_notaire" : "relances_notaire",
    dataKey: "data",
    searchFields: [],
  };

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
      paramsToSend,
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

    noms.push(bien.propriete_dite_bien);

    return noms.join(" - ");
  }

  // Check if RDV is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    const rdvDate = dateString.split('T')[0];
    return today === rdvDate;
  };

  // Check if RDV is now (within current hour)
  const isNow = (dateString) => {
    if (!dateString) return false;
    const now = new Date();
    const rdvDate = new Date(dateString);
    
    // Check if same date
    const isSameDate = now.toDateString() === rdvDate.toDateString();
    // Check if same hour (you can adjust this logic as needed)
    const isSameHour = now.getHours() === rdvDate.getHours();
    
    return isSameDate && isSameHour;
  };

  const formatData = () => {
    return data.map((pro) => {
      const isRdvToday = type == 1 && isToday(pro.rdv);
      const isRdvNow = type == 1 && isNow(pro.rdv);
      
      const rowData = {
        id: pro.id,
        reservation_id: pro?.reservation_id,
        code_reservation: pro?.reservation?.code_reservation,
        cc: pro?.reservation?.user?.name + " " + pro?.reservation?.user?.prenom,
        date_reservation: pro?.reservation?.date_reservation,
        aquereurs: pro?.reservation?.aquereurs,
        bien: pro?.reservation?.bien,
        bien_id: pro?.reservation?.bien_id,
        rdv: pro.rdv,
        prochaine_relance: pro.prochaine_relance,
        user: pro?.reservation?.user,
        statut: pro.statut,
        data_res: pro,
        isRdvToday,
        isRdvNow,
      };
      
      // Ajouter notaire_id uniquement si c'est un responsable livraison
      if (isRespoLivraison(userRole)) {
        rowData.notaire_id = pro?.notaire_id;
      }
      
      return rowData;
    });
  };

  const getStatusBadge = (statut) => {
    const status = RDV_STATUS[statut];
    if (!status) return null;
    
    let Icon = Clock;
    if (statut === 2) Icon = CheckCircle;
    if (statut === 3) Icon = XCircle;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </span>
    );
  };

  const getDateColumn = () => {
    if (type == 1) {
      return {
        key: "rdv",
        label: "Date RDV",
        render: (row) => {
          const isToday = row.isRdvToday;
          const isNow = row.isRdvNow;
          
          return (
            <div className="flex items-center gap-3">
              <span className={`${isNow ? 'font-bold text-blue-600' : isToday ? 'font-semibold text-blue-500' : ''}`}>
                {row.rdv ? formatDateTime(row.rdv) : ""}
              </span>
              {isNow && (
                <span className="animate-pulse inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
              )}
            </div>
          );
        },
      };
    } else {
      return {
        key: "prochaine_relance",
        label: "Prochaine Relance",
        render: (row) => (
          <div className="flex items-center gap-3">
            <span>
              {row.prochaine_relance ? formatDate(row.prochaine_relance) : ""}
            </span>
          </div>
        ),
      };
    }
  };

  const columns = [
    { key: "cc", label: "Commercial" },
    {
      key: "date_reservation",
      label: "Date Réservation",
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
      render: (row) => {
        const bien = row.bien;
        if (!bien || !bien.id) return null;
        
        return (
          <Link target="_blank" href={`/biens/${bien.id}`}>
            <strong style={{ fontWeight: 600 }}>
              {NomBienComplet(bien)}
            </strong>
          </Link>
        );
      },
    },

    getDateColumn(),
   
    // Add status column for RDVs
    ...(type == 1 ? [{
      key: "statut",
      label: "Statut",
      render: (row) => getStatusBadge(row.statut),
    }] : []),
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Link
            href={`/ventes/reservations/${row.reservation_id}`}
            className={`flex items-center gap-1 ${row.isRdvNow ? 'text-sky-600 hover:text-sky-800' : 'text-blue-500 hover:text-blue-700'}`}
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
      const acquereursNames = item?.reservation?.aquereurs
        ? item.reservation.aquereurs
            .map(
              (acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || ""
            )
            .filter((name) => name)
            .join(" / ")
        : "";

      const acquereursCin = item?.reservation?.aquereurs
        ? item.reservation.aquereurs
            .map((acq) => acq.client?.cin || "")
            .filter((cin) => cin)
            .join(" / ")
        : "";

      const acquereursTele = item?.reservation?.aquereurs
        ? item.reservation.aquereurs
            .map((acq) => acq.client?.telephone_num1 || "")
            .filter((tele) => tele)
            .join(" / ")
        : "";

      // Déterminer le nom du notaire pour l'export
      let notaireExportName = "Non attribué";
      
      if (isNotaire(userRole)) {
        // Si c'est un notaire connecté, utiliser son propre nom
        notaireExportName = `${user?.name || ""} ${user?.prenom || ""}`.trim();
      } else if (isRespoLivraison(userRole) && selectedNotaireId && selectedNotaireName) {
        // Si c'est un responsable livraison avec notaire sélectionné
        notaireExportName = selectedNotaireName;
      } else if (item?.reservation?.notaire) {
        // Sinon, utiliser le notaire de la réservation
        notaireExportName = `${item.reservation.notaire.name || ""} ${item.reservation.notaire.prenom || ""}`.trim();
      }

      const exportItem = {
        code_reservation: item?.reservation?.code_reservation || "",
        date_reservation: item?.reservation?.date_reservation
          ? formatDate(item.reservation.date_reservation)
          : "",
        [type == 1 ? "date_rdv" : "prochaine_relance"]: 
          type == 1 
            ? (item.rdv ? formatDateTime(item.rdv) : "")
            : (item.prochaine_relance ? formatDate(item.prochaine_relance) : ""),
        bien: item?.reservation?.bien?.propriete_dite_bien || "",
        notaire: notaireExportName,
        noms_acquereurs: acquereursNames,
        cins_acquereurs: acquereursCin,
        tele_acquereurs: acquereursTele,
        commercial: item?.reservation?.user ? 
          `${item.reservation.user.name || ""} ${item.reservation.user.prenom || ""}`.trim() 
          : "",
      };

      // Add status for RDV exports
      if (type == 1) {
        exportItem.statut = RDV_STATUS[item.statut]?.label || "";
      }

      return exportItem;
    });
  };

  const columns_export = [
    { key: "code_reservation", label: "Code reservation" },
    { key: "date_reservation", label: "Date reservation" },
    { 
      key: type == 1 ? "date_rdv" : "prochaine_relance", 
      label: type == 1 ? "Date RDV" : "Prochaine Relance" 
    },
    { key: "bien", label: "Bien" },
    { key: "notaire", label: "Notaire" },
    ...(type == 1 ? [{ key: "statut", label: "Statut" }] : []),
    { key: "noms_acquereurs", label: "Nom client" },
    { key: "cins_acquereurs", label: "Cin client" },
    { key: "tele_acquereurs", label: "Tele client" },
    { key: "commercial", label: "Commercial" },
  ];

  const title = type == 1 ? "Liste des Rendez vous" : "Liste des Relances";
  
  // Titre court du tableau
 // Titre court du tableau - CORRECTION
const getShortTitle = () => {
  if (isNotaire(userRole)) {
    return `${title}`; // Juste le titre pour notaire
  } else if (isRespoLivraison(userRole)) {
    if (selectedNotaireId) {
      // Format court pour notaire sélectionné
      const shortName = selectedNotaireName.split(' ')[0]; // Prendre seulement le prénom
      return `${title} - ${shortName}`;
    } else {
      return `${title}`; // Juste le titre quand "Tous" est sélectionné
    }
  }
  return title;
};

  // Fonction pour obtenir les initiales
  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

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
        </div>
        <div className="bg-white rounded-lg p-4">

        <Table
          title={getShortTitle()} // Titre court
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={type == 1 ? "rdvs_notaire_export" : "relances_notaire_export"}
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
          rowClassName={(row) => {
            if (type == 1) {
              if (row.isRdvNow) return 'bg-sky-50 border-l-4 border-l-sky-500';
              if (row.isRdvToday) return 'bg-blue-50';
              return '';
            }
            return '';
          }}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
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
                
                {/* RDV Date Filter - Only show for type 1 */}
                {type == 1 && (
                  <DateRangePicker
                    startName="rdv_date_start"
                    endName="rdv_date_end"
                    startValue={tempFilters.rdv_date_start}
                    endValue={tempFilters.rdv_date_end}
                    onChange={handleFilterChange}
                    label="Date RDV"
                  />
                )}
                
                {/* Relance Date Filter - Only show for type != 1 */}
                {type != 1 && (
                  <DateRangePicker
                    startName="relance_date_start"
                    endName="relance_date_end"
                    startValue={tempFilters.relance_date_start}
                    endValue={tempFilters.relance_date_end}
                    onChange={handleFilterChange}
                    label="Date Relance"
                  />
                )}
              </div>
              
              {/* General Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <DateRangePicker
                  startName="date_start"
                  endName="date_end"
                  startValue={tempFilters.date_start}
                  endValue={tempFilters.date_end}
                  onChange={handleFilterChange}
                  label="Date Réservation"
                />
                
                {/* Additional Filters for RDVs */}
                {type == 1 && (
                  <>
                    <SelectInput
                      value={tempFilters.statut}
                      onChange={(value) => handleFilterChange('statut', value)}
                      options={[
                        { value: "", label: "Tous les statuts" },
                        ...RDV_STATUS_OPTIONS
                      ]}
                      label="Statut RDV"
                      className="h-10 text-sm w-full"
                    />
                    
                    <Input
                      type="datetime-local"
                      label="Recherche par Date/Heure RDV"
                      value={tempFilters.rdv_datetime || ""}
                      onChange={(e) => handleFilterChange("rdv_datetime", e.target.value)}
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                  </>
                )}
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
    </>
  );
}