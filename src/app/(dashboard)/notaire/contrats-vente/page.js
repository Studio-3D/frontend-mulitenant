'use client';

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { Eye, Clock, CheckCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
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

export default function Contrat_vente({ title = "Contrats de Vente" }) {
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

  const STATUS_OPTIONS = [
    { value: "", label: "Tous les statuts" },
    { value: "signe", label: "Signé" },
    { value: "non_signe", label: "Non Signé" }
  ];

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
    statut: "",
    client: "",
    telephone: "",
    date_sign_client_start: "",
    date_sign_client_end: "",
    date_sign_mo_start: "",
    date_sign_mo_end: "",
    date_enreg_start: "",
    date_enreg_end: "",
    notaire_id: "", // Ajout du filtre notaire
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const reset = {
      code_reservation: "",
      date_start: "",
      date_end: "",
      bien: "",
      statut: "",
      client: "",
      telephone: "",
      date_sign_client_start: "",
      date_sign_client_end: "",
      date_sign_mo_start: "",
      date_sign_mo_end: "",
      date_enreg_start: "",
      date_enreg_end: "",
      notaire_id: "",
    };
    setFilters(reset);
    setTempFilters(reset);
    setSelectedNotaireId(null);
    setSelectedNotaireName("");
    setCurrentPage(1);
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
    API_URL: "get_contrats_ventes",
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
      setTotalRows,
      selectedProjet
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

  const getStatutBadge = (item) => {
    if (item && typeof item === 'object') {
      if (item.is_non_signed_reservation === true || item.statut_type === 'non_signe') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Non Signé
          </span>
        );
      }
      if (item.contrat_signe !== null && item.contrat_signe !== undefined) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Signé
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3" />
          Contrat Non Signé
        </span>
      );
    }
    if (item === null || item === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Non Signé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Signé
      </span>
    );
  };

  const formatData = () => {
    return data.map((item, index) => {
      const isNonSignedReservation = item.is_non_signed_reservation || item.statut_type === 'non_signe';
      const reservation = isNonSignedReservation ? item.reservation : item.reservation;
      
      const acquereursNames = reservation?.aquereurs
        ? reservation.aquereurs
            .map((acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || "")
            .filter((name) => name)
            .join(" / ")
        : "";
      
      const acquereursTele = reservation?.aquereurs
        ? reservation.aquereurs
            .map((acq) => acq.client?.telephone_num1 || "")
            .filter((tele) => tele)
            .join(" / ")
        : "";

      const rowData = {
        id: isNonSignedReservation 
          ? `reservation_${reservation?.id || index}` 
          : `contrat_${item.id || index}`,
        reservation_id: reservation?.id,
        code_reservation: reservation?.code_reservation,
        clients: acquereursNames,
        telephones: acquereursTele,
        bien: reservation?.bien,
        date_sign_client: item.date_sign_client,
        date_sign_mo: item.date_sign_mo,
        date_enreg: item.date_enreg,
        contrat_signe: item.contrat_signe,
        num_titre: reservation?.bien?.titre_foncier || "",
        statut_type: item.statut_type || (isNonSignedReservation ? 'non_signe' : (item.contrat_signe != null ? 'signe' : 'non_signe_contrat')),
        is_non_signed_reservation: isNonSignedReservation,
        data_res: item,
      };
       
      return rowData;
    });
  };

  const columns = [
    { key: "code_reservation", label: "Code Réservation" },
    { key: "num_titre", label: "Nᵒ Titre" },
    {
      key: "bien",
      label: "Bien",
      render: (row) => {
        const bien = row.bien;
        if (!bien || !bien.id) return null;
        return (
          <Link target="_blank" href={`/Biens/${bien.id}`}>
            <strong style={{ fontWeight: 600 }}>
              {NomBienComplet(bien)}
            </strong>
          </Link>
        );
      },
    },
   
    { key: "clients", label: "Client" },
    { key: "telephones", label: "Téléphone" },
    {
      key: "statut",
      label: "Statut",
      render: (row) => {
        const itemData = {
          is_non_signed_reservation: row.is_non_signed_reservation,
          statut_type: row.statut_type,
          contrat_signe: row.contrat_signe
        };
        return getStatutBadge(itemData);
      }
    },
    {
      key: "date_sign_client",
      label: "Date Signature Client",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.date_sign_client ? formatDate(row.date_sign_client) : ""}</span>
        </div>
      ),
    },
    {
      key: "date_sign_mo",
      label: "Date Signature MO",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.date_sign_mo ? formatDate(row.date_sign_mo) : ""}</span>
        </div>
      ),
    },
    {
      key: "date_enreg",
      label: "Date Enregistrement",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.date_enreg ? formatDate(row.date_enreg) : ""}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Link
            href={`/ventes/reservations/${row.reservation_id}`}
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
      const isNonSignedReservation = item.is_non_signed_reservation || item.statut_type === 'non_signe';
      const reservation = item.reservation || item;
      
      const acquereursNames = reservation?.aquereurs
        ? reservation.aquereurs
            .map((acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || "")
            .filter((name) => name)
            .join(" / ")
        : "";

      const acquereursCin = reservation?.aquereurs
        ? reservation.aquereurs
            .map((acq) => acq.client?.cin || "")
            .filter((cin) => cin)
            .join(" / ")
        : "";

      const acquereursTele = reservation?.aquereurs
        ? reservation.aquereurs
            .map((acq) => acq.client?.telephone_num1 || "")
            .filter((tele) => tele)
            .join(" / ")
        : "";

      const statut = item.contrat_signe != null ? "Signé" : "Non Signé";
      
      // Déterminer le nom du notaire pour l'export
      let notaireExportName = "Non attribué";
      
      if (isNotaire(userRole)) {
        // Si c'est un notaire connecté, utiliser son propre nom
        notaireExportName = `${user?.name || ""} ${user?.prenom || ""}`.trim();
      } else if (isRespoLivraison(userRole) && selectedNotaireId && selectedNotaireName) {
        // Si c'est un responsable livraison avec notaire sélectionné
        notaireExportName = selectedNotaireName;
      } else if (reservation?.notaire) {
        // Sinon, utiliser le notaire de la réservation
        notaireExportName = `${reservation.notaire.name || ""} ${reservation.notaire.prenom || ""}`.trim();
      }

      return {
        code_reservation: reservation?.code_reservation || "",
        num_titre: reservation?.bien?.titre_foncier  || "",
        bien: NomBienComplet(reservation?.bien) || "",
        notaire: notaireExportName,
        noms_acquereurs: acquereursNames,
        cins_acquereurs: acquereursCin,
        tele_acquereurs: acquereursTele,
        statut: statut,
        date_sign_client: item?.date_sign_client ? formatDate(item.date_sign_client) : "",
        date_sign_mo: item?.date_sign_mo ? formatDate(item.date_sign_mo) : "",
        date_enreg: item?.date_enreg ? formatDate(item.date_enreg) : "",
      };
    });
  };

  const columns_export = [
    { key: "code_reservation", label: "Code reservation" },
    { key: "num_titre", label: "Nᵒ Titre" },
    { key: "bien", label: "Bien" },
    { key: "notaire", label: "Notaire" },
    { key: "noms_acquereurs", label: "Nom client" },
    { key: "cins_acquereurs", label: "CIN client" },
    { key: "tele_acquereurs", label: "Téléphone client" },
    { key: "statut", label: "Statut" },
    { key: "date_sign_client", label: "Date signature client" },
    { key: "date_sign_mo", label: "Date signature MO" },
    { key: "date_enreg", label: "Date enregistrement" },
  ];

  // Titre court du tableau
  const getShortTitle = () => {
    if (isNotaire(userRole)) {
      return `${title}`;
    } else if (isRespoLivraison(userRole)) {
      if (selectedNotaireId && selectedNotaireName) {
        const shortName = selectedNotaireName.split(' ')[0];
        return `${title} - ${shortName}`;
      } else {
        return `${title}`;
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
          showSearch={false}
          title={getShortTitle()}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={"contrats_vente_export"}
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
          addLink={false}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg">
              <div className="grid gap-5" style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}>
                <Input
                  type="text"
                  label="Code Réservation"
                  value={tempFilters.code_reservation}
                  onChange={(e) => handleFilterChange("code_reservation", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="text"
                  label="Bien"
                  value={tempFilters.bien}
                  onChange={(e) => handleFilterChange("bien", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                
                <SelectInput
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange("statut", value)}
                  options={STATUS_OPTIONS}
                  label="Statut"
                  className="h-10 text-sm w-full"
                />
                
                {/* Filtre client */}
                <Input
                  type="text"
                  label="Client"
                  value={tempFilters.client}
                  onChange={(e) => handleFilterChange("client", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  placeholder="Nom ou prénom du client"
                />
                
                {/* Filtre téléphone */}
               
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateRangePicker
                  startName="date_sign_client_start"
                  endName="date_sign_client_end"
                  startValue={tempFilters.date_sign_client_start}
                  endValue={tempFilters.date_sign_client_end}
                  onChange={handleFilterChange}
                  label="Date Signature Client"
                />
                
                <DateRangePicker
                  startName="date_sign_mo_start"
                  endName="date_sign_mo_end"
                  startValue={tempFilters.date_sign_mo_start}
                  endValue={tempFilters.date_sign_mo_end}
                  onChange={handleFilterChange}
                  label="Date Signature MO"
                />
                
                <DateRangePicker
                  startName="date_enreg_start"
                  endName="date_enreg_end"
                  startValue={tempFilters.date_enreg_start}
                  endValue={tempFilters.date_enreg_end}
                  onChange={handleFilterChange}
                  label="Date Enregistrement"
                />
                 <Input
                  type="text"
                  label="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) => handleFilterChange("telephone", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  placeholder="Numéro de téléphone"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Appliquer les filtres
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors"
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