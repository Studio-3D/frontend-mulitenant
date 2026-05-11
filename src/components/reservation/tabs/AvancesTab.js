import React, { useState, useEffect } from "react";
import {
  ScanEye,
  Pencil,
  CheckCircle,
  Euro,
  Trash2,
  History,
  FolderSearch,
  Paperclip,
  Printer,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import Table from "@/components/Table";
import { APIURL, RESOURCE_URL } from "../../../configs/api";
import {
  MODE_PAIEMENT,
  Avance_Statut,
  MODE_PAIEMENT_with_transfert,
} from "../../../configs/enum";
import {
  fetchData_Select,
  fetchList_fichier_exist_by_Code,
} from "../../../../src/configs/api-utils";
import axios from "axios";
import { toast } from "react-hot-toast";
import { formatDate } from "../../../utils/dateUtils";
import Autocomplete from "@/components/Autocomplete";
import Modal from "@/components/Modal";
import DeleteData from "@/components/DeleteData";
import Pusher from "pusher-js";
import SelectInput from "@/components/SelectInput";

export const AvancesTab = ({
  reservationData,
  user,
  accessToken: propAccessToken,
  onAvancesChange,
  updateReservationData,
}) => {
  const pusher_key_avances = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_AVANCES;

  //onAvancesChange  ===> to call res show to modify count avances in tabs avances atab
  const color_header_modal = process.env.NEXT_PUBLIC_COLOR_Header_Modal;
  const [selectedId, setSelectedId] = useState(null);
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);

  const accessToken = propAccessToken || localStorage.getItem("accessToken");
  const [loading_list, setLoading_list] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState({
    table: false,
    form: false,
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [etat_res, setEtat_res] = useState(0);
  const [sum_avances, setSum_av] = useState(0);
  const [reste_first, setReste_first] = useState(0);
  const [prix, setPrix] = useState(0);
  const [filesList_avc, setfilesList_avc] = useState([]);
  const [last_row_number, set_last_row_number] = useState(0);
  const reservationId = reservationData?.reservation?.id;

  // New state for scanner popup
  const [popupScanner, setPopupScanner] = useState(false);
  const [fichier_scanner, setfichier_scanner] = useState(null);
  const [avanceId, setAvanceId] = useState(null);
  const [loading_scann, setLoading_scann] = useState(false);
  const [loading_traite, setLoading_traite] = useState(false);

  // New state for validation/rejection dialog
  const [open_v_r, setOpen_v_r] = useState(false);
  const [ID, setID] = useState(0);
  const [num_recu, set_num_recu] = useState(0);
  const [Commentaire_r, setCommentaire_r] = useState("");
  const [type_action, set_type_action] = useState(null);
  const [action, setAction] = useState("");
  const [date_encaissement_v, set_date_encaissement_v] = useState(null);
  const [num_remise_v, set_num_remise_v] = useState(null);
  const [reste, setReste] = useState(0);

  // New state for PJ dialog
  const [open_dialog, setOpen_dialog] = useState(false);
  const [pjj, setPjj] = useState([]);
  const [myfile, setMyfile] = useState(false);
  //show detail
  const [open_dialog_show, setOpen_dialog_show] = useState(false);
  const [banque_show, set_banque_show] = useState(null);
  const [num_paiement_show, set_num_paiement_show] = useState(null);
  const [num_rem_show, set_num_rem_show] = useState(null);
  const [date_encais_show, set_date_encaiss_show] = useState(null);

  // In AvancesTab component - fix the Pusher initialization
  useEffect(() => {
    fetchData();

    // Initialize Pusher with the correct connection
    const initializePusher = () => {
      if (!pusher_key_avances || !reservationId) {
        console.log("Pusher key or reservation ID missing");
        return () => {};
      }

      Pusher.logToConsole = true;
      console.log(
        "Initializing Pusher for avances, reservation:",
        reservationId,
      );

      // Use the correct Pusher configuration that matches your backend
      const pusher = new Pusher(pusher_key_avances, {
        cluster: "eu",
        encrypted: true,
        forceTLS: true,
        wsHost: "ws-eu.pusher.com", // Add explicit WebSocket host
        wssPort: 443,
        enabledTransports: ["ws", "wss"], // Force WebSocket transport
      });

      // Create the EXACT channel name that matches your Laravel event
      const channelName = `avances-updates-${reservationId}`;
      console.log("Subscribing to channel:", channelName);

      try {
        const channel = pusher.subscribe(channelName);

        channel.bind("AvancesEvent", (data) => {
          console.log("Pusher AvancesEvent received:", data);
          alert("EVENT RECU");
          toast.success("Mise à jour des avances reçue");

          // Always refresh when we receive an event for this channel
          console.log("Refreshing avances data via Pusher");
          fetchData();
        });

        // Handle connection events
        channel.bind("pusher:subscription_succeeded", () => {
          console.log("✅ Successfully subscribed to channel:", channelName);
        });

        channel.bind("pusher:subscription_error", (status) => {
          console.error("❌ Pusher subscription error:", status);
        });

        // Also listen for connection state changes
        pusher.connection.bind("state_change", (states) => {
          console.log(
            "Pusher connection state changed:",
            states.previous,
            "->",
            states.current,
          );
        });

        pusher.connection.bind("connected", () => {
          console.log("✅ Pusher connected successfully");
        });

        pusher.connection.bind("disconnected", () => {
          console.log("🔴 Pusher disconnected");
        });
      } catch (error) {
        console.error("Error subscribing to Pusher channel:", error);
      }

      // Return cleanup function
      return () => {
        console.log("Cleaning up Pusher subscription for:", channelName);
        if (pusher) {
          pusher.disconnect();
        }
      };
    };

    const cleanupPusher = initializePusher();

    if (filesList_avc.length === 0) {
      fetchList_fichier_exist_by_Code(
        setfilesList_avc,
        "avc",
        reservationData?.reservation?.code_reservation,
        setLoading_list,
      );
    }

    return cleanupPusher;
  }, [reservationId, pusher_key_avances]);
  const fetchData = async () => {
    try {
      if (!reservationId) {
        setError("No reservation ID provided");
        return;
      }

      setLoading((prev) => ({ ...prev, table: true }));
      setError(null);

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const apiUrl = `${APIURL.ROOTV1}/getAvancesByReservation/${reservationId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { data, etat_res, prix, sum_avances, sum_avances_valides } =
        response.data;
      const processedData = data.map((item, index) => ({
        ...item,
        number: index + 1,
      }));

      setData(processedData);
      setEtat_res(etat_res);
      setPrix(prix);
      setSum_av(sum_avances);
      setReste_first(prix - sum_avances);
      setReste(prix - sum_avances);

      const lastRow = processedData[processedData.length - 1];
      if (lastRow) {
        set_last_row_number(lastRow.number);
      }
      // Notify res show  parent of changes
      if (onAvancesChange) {
        onAvancesChange(data.length, sum_avances_valides);
      }
      // Also update reservation data if sum_avances == prix
      if (sum_avances_valides >= prix && updateReservationData) {
        updateReservationData({
          sum_avances_valides: sum_avances_valides,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, table: false }));
    }
  };

  const handleShowPj = (n_recu, pjs) => {
    setOpen_dialog(true);
    set_num_recu(n_recu);
    setPjj(pjs);
  };

  const handle_detail = (
    n_recu,
    banque,
    numero_paiement,
    num_rem,
    date_encais,
  ) => {
    set_num_recu(n_recu);
    set_banque_show(banque);
    set_num_paiement_show(numero_paiement);
    set_num_rem_show(num_rem);
    set_date_encaiss_show(date_encais);
    setOpen_dialog_show(true);
  };

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/paiements/${reservationData?.reservation.code_reservation}/${file}`,
      "_blank",
    );
  };

  const PrintRecu = (paiementId) => {
    localStorage.setItem("avanceId", paiementId);
    const editUrl = `${window.location.origin}/ventes/reservations/printRecuPaiement/${paiementId}`;
    window.open(editUrl, "_blank");
  };

  // Add these state variables to your component
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPaiement, setCurrentPaiement] = useState(null);
  const [formData, setFormData] = useState({
    date_reglement: new Date().toISOString().split("T")[0],
    montant: "",
    mode_paiement: "",
    banque_id: "",
    numero_paiement: "",
    echeance: "",
    commentaireAvance: "",
    sr: 0,
    num_remise: "",
    date_encaissement: "",
  });
  const [banques, setBanques] = useState([]);
  const [loadingBanques, setLoadingBanques] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleEdit = (paiementId) => {
    const paiement = data.find((p) => p.id == paiementId);
    setCurrentPaiement(paiement);
    setFormData({
      date_reglement: paiement.date_reglement,
      montant: paiement.montant,
      mode_paiement: paiement.mode_paiement,
      banque_id: paiement.banque?.id || "",
      numero_paiement: paiement.numero_paiement,
      echeance: paiement.echeance || "",
      commentaireAvance: paiement.commentaireAvance || "",
      sr: paiement.sr || "",
      num_remise: paiement.last_statut?.num_remise || "",
      date_encaissement: paiement.last_statut?.date_encaissement || "",
    });
    set_num_remise_v(paiement.last_statut?.num_remise);
    set_date_encaissement_v(paiement.last_statut?.date_encaissement);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentPaiement(null);
    setFormData({
      date_reglement: new Date().toISOString().split("T")[0],
      montant: "",
      mode_paiement: "",
      banque_id: "",
      numero_paiement: "",
      echeance: "",
      commentaireAvance: "",
      sr: 0,
      num_remise: "",
      date_encaissement: "",
    });
    set_num_remise_v(null);
    set_date_encaissement_v(null);
    setAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setAddDialogOpen(false);
    setFormErrors({});
  };

  const [toastShown, setToastShown] = useState(false);

  const handleInputChange = (e) => {
    // Handle checkbox separately
    if (e.target && e.target.name == "sr") {
      setFormData((prev) => ({
        ...prev,
        sr: e.target.checked ? 1 : 0, // Set to 1 if checked, 0 if not
      }));
      return;
    }

    const { name, value } = e.target || "";

    // For Autocomplete components that might pass just the value
    const fieldName = name || e.name;
    const fieldValue = value !== undefined ? value : e;
    if (name == "banque_id") {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: fieldValue, // fieldValue is the id directly
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: fieldValue,
      }));
    }

    // Special handling for montant field
    if (fieldName == "montant") {
      const montantValue = parseFloat(fieldValue) || 0;
      let newReste = 0;

      if (editDialogOpen && currentPaiement) {
        // Calculate for edit mode
        const otherAdvancesSum = data
          .filter((item) => item.id !== currentPaiement.id)
          .reduce((sum, item) => sum + parseFloat(item.montant), 0);
        newReste = parseFloat(prix) - (otherAdvancesSum + montantValue);
      } else {
        // Calculate for add mode
        newReste = parseFloat(prix) - (parseFloat(sum_avances) + montantValue);
      }

      setReste(newReste);

      // Check if reste would be negative
      if (newReste < 0) {
        if (!toastShown) {
          toast.error("Le montant ne doit pas dépasser le prix total!");
          setToastShown(true);
        }

        // Reset montant to previous value or max allowed
        const maxAllowed =
          editDialogOpen && currentPaiement
            ? parseFloat(prix) -
              data
                .filter((item) => item.id !== currentPaiement.id)
                .reduce((sum, item) => sum + parseFloat(item.montant), 0)
            : parseFloat(prix) - parseFloat(sum_avances);

        setFormData((prev) => ({
          ...prev,
          montant: maxAllowed > 0 ? maxAllowed : 0,
        }));
      } else {
        // Reset the toast flag when the amount is valid again
        setToastShown(false);
      }
    }
  };

  useEffect(() => {
    if (editDialogOpen || addDialogOpen) {
      fetchData_Select("banques", setBanques, setLoadingBanques);
    }
  }, [editDialogOpen, addDialogOpen]);

  const validateForm = () => {
    const errors = {};

    if (!formData.date_reglement)
      errors.date_reglement = "Date de règlement requise";
    if (!formData.montant || isNaN(formData.montant))
      errors.montant = "Montant invalide";
    if (!formData.mode_paiement)
      errors.mode_paiement = "Mode de paiement requis";

    if (
      formData.mode_paiement &&
      [2, 3, 4, 5, 6].includes(parseInt(formData.mode_paiement))
    ) {
      // These modes require bank
      if (!formData.banque_id) errors.banque_id = "Banque requise";
      if (!formData.numero_paiement) {
        errors.numero_paiement = "Numéro de paiement requis";
      } else if (!/^\d{16}$/.test(formData.numero_paiement)) {
        errors.numero_paiement =
          "Le numéro de paiement doit contenir exactement 16 chiffres";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Additional validation for montant
    const montantValue = parseFloat(formData.montant) || 0;
    let newReste = 0;

    setLoading((prev) => ({ ...prev, form: true }));

    if (currentPaiement) {
      // Edit mode calculation
      const otherAdvancesSum = data
        .filter((item) => item.id !== currentPaiement.id)
        .reduce((sum, item) => sum + parseFloat(item.montant), 0);
      newReste = parseFloat(prix) - (otherAdvancesSum + montantValue);
    } else {
      // Add mode calculation
      newReste = parseFloat(prix) - (parseFloat(sum_avances) + montantValue);
    }

    if (newReste < 0) {
      toast.error("Le montant saisi dépasse le prix total!");
      return;
    }
    setLoading((prev) => ({ ...prev, form: true }));

    const dataToSend = new FormData();
    const url = currentPaiement
      ? `${APIURL.PAIEMENTS}/${currentPaiement.id}`
      : APIURL.PAIEMENTS;

    // Add form data to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataToSend.append(key, value);
      }
    });
    // Handle file uploads
    if (!currentPaiement && selectedFiles_avc.length !== 0) {
      selectedFiles_avc.forEach((file, index) => {
        dataToSend.append(`files_avance[${index}]`, file);
      });
    }

    if (currentPaiement) {
      const files = selectedFiles_avc.filter((file) => file instanceof File);
      const objects = selectedFiles_avc.filter(
        (file) => !(file instanceof File),
      );

      if (objects.length !== 0) {
        objects.forEach((file, index) => {
          // Convert object to File before sending
          const blob = new Blob([file.fichier], {
            type: "application/octet-stream",
          });
          const newFile = new File([blob], file.fichier);
          dataToSend.append(`files_avance[${index}]`, newFile);
        });
      }
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i++) {
          dataToSend.append(`files_avance[${objects.length + i}]`, files[i]);
        }
      }

      dataToSend.append("_method", "PATCH");
    }

    // Add reservation ID
    dataToSend.append("reservation_id", reservationId);

    try {
      const response = await axios.post(url, dataToSend, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status == 200) {
        const message = currentPaiement
          ? "Paiement modifié avec succès"
          : "Paiement ajouté avec succès";

        toast.success(message);
        // Close all possible modal states
        setEditDialogOpen(false);
        setAddDialogOpen(false);
        // Reset form and fetch new data
        setSelectedFiles_avc([]);
        setFormErrors({});
        // Fetch new data
        await fetchData(); // This will trigger the callback
        // Check if reste is 0 and user is admin
        // for not reload page and show contrat
        if (reste == 0 && user.role <= 2) {
          // Update reservation data to show contract tab
          if (updateReservationData) {
            updateReservationData({
              sum_avances_valides: prix, // Set sum_avances_valides to prix
              reservation: {
                ...reservationData.reservation,
                avances: {
                  ...reservationData.reservation.avances,
                  length: data.length + (currentPaiement ? 0 : 1),
                },
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error saving paiement:", error);

      if (error.response?.status == 422) {
        toast.error(
          error.response.data.errors ||
            "Une erreur s'est produite lors de la soumission du formulaire.",
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Une erreur s'est produite lors de la soumission du formulaire.",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handle_Scanne_recu = (id) => {
    setAvanceId(id);
    setPopupScanner(true);
  };

  const closeScannerPopup = () => {
    setPopupScanner(false);
    setfichier_scanner(null);
  };

  const scanner_file = async (ev) => {
    ev.preventDefault();
    setLoading_scann(true);

    try {
      const formData = new FormData();
      formData.append("avance_id", avanceId);
      formData.append("fichier_scanner", fichier_scanner);

      await axios.post(`${APIURL.ROOTV1}/scanner_file`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Le fichier a été scanné avec succès");
      closeScannerPopup();
      fetchData();
    } catch (err) {
      console.error("Error scanning file:", err);
      toast.error("Erreur lors du scan du fichier");
    } finally {
      setLoading_scann(false);
    }
  };

  const handle_Histo = (paiementId) => {
    const editUrl = `${window.location.origin}/ventes/reservations/historiquesPaiement/${paiementId}`;
    window.open(editUrl, "_blank");
  };

  const handle_valider_rejete = (Id, n_recu, number, text) => {
    setOpen_v_r(!open_v_r);
    setID(Id);
    set_num_recu(n_recu);
    set_type_action(text);
    if (number == 1) {
      setAction("1");
    }
  };

  const onSubmit_valider_rejete = async (e) => {
    e.preventDefault();
    setLoading_traite(true);
    try {
      const commentaire = Commentaire_r;
      const date_encaiss = date_encaissement_v;
      const n_remise = num_remise_v;
      const etat = action;

      await axios.put(
        `${APIURL.ROOT}/v1/traiter_avance/${ID}`,
        {
          commentaire,
          date_encaiss,
          n_remise,
          etat,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      toast.success("Avance traitée avec succès");

      setCommentaire_r(null);
      set_date_encaissement_v(null);
      set_num_remise_v(null);
      fetchData();
      setOpen_v_r(false);
      setLoading_traite(false);
    } catch (error) {
      console.error("Error processing avance:", error);
      toast.error("Erreur lors du traitement");
      setLoading_traite(false);
    }
  };

  const show_dos_desiste = (dosId) => {
    window.open(`/ventes/reservations/${dosId}`, "_blank");
  };

  const formatData = () => {
    return data.map((Paiement) => ({
      id: Paiement.id,
      sr: Paiement?.sr == 0 ? Paiement?.num_recu : "SR",
      date_reglement: Paiement?.date_reglement
        ? formatDate(Paiement.date_reglement)
        : "N/A",
      respo: `${Paiement.user.name} ${Paiement.user.prenom || ""}`.trim(),
      montant: Paiement.montant.toLocaleString() + " DH" || null,
      mode_pai: Paiement.mode_paiement,
      banque: Paiement.banque?.nom || null,
      numero_paiement: Paiement.numero_paiement || null,
      echeance: Paiement.echeance ? formatDate(Paiement.echeance) : null,
      statut: Paiement.statut,
      num_remise: Paiement?.last_statut?.num_remise || null,
      date_encaissement: Paiement?.last_statut?.date_encaissement
        ? formatDate(Paiement.last_statut.date_encaissement)
        : null,
      commentaireAvance: Paiement.commentaireAvance,
      commenataire_rejete: Paiement.commenataire_rejete,
      recu_scanne: Paiement.recu_scanne,
      number: Paiement.number,
      //  Paiement: Paiement,
      piece_jointe: Paiement.piece_jointe,
      dossier_id_transfert: Paiement.dossier_id_transfert,
      historiques_count: Paiement.historiques_count,
    }));
  };

  const columns = [
    { key: "sr", label: "N° Reçu" },
    { key: "date_reglement", label: "Date" },
    { key: "respo", label: "Responsable" },
    {
      key: "montant",
      label: "Montant",
      render: (row) => (
        <strong key={`montant-${row.id}`} style={{ color: "blue" }}>
          {row.montant}
        </strong>
      ),
    },

    {
      key: "mode_pai",
      label: "Mode Paiement",
      render: (row) => {
        if (!row.mode_pai) return null;
        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              {
                1: "bg-purple-100 text-purple-500",
                2: "bg-blue-100 text-blue-500",
                3: "bg-indigo-100 text-indigo-500",
                4: "bg-teal-100 text-teal-500",
                5: "bg-green-100 text-green-500",
                6: "bg-amber-100 text-amber-500",
                7: "bg-gray-100 text-gray-500",
              }[row.mode_pai] || "bg-gray-100 text-gray-500"
            }`}
          >
            {MODE_PAIEMENT_with_transfert[row.mode_pai]?.label || "Unknown"}
          </span>
        );
      },
    },

    { key: "echeance", label: "Echéance" },
    {
      key: "statut",
      label: "Statut",
      render: (row) => {
        if (!row.statut) return null;
        //mode paiement 7 transfert  //statut=>1 validé
        if (
          Number(row.statut) == 1 &&
          parseFloat(row.montant) > 0 &&
          Number(row.mode_pai) !== 7 &&
          row.date_encaissement == null
        ) {
          return (
            <span className="px-2 py-1 rounded text-sm font-semibold bg-blue-100 text-blue-500">
              En attente d{"'"}encaissement
            </span>
          );
        }

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              {
                1: "bg-green-100 text-green-500",
                3: "bg-blue-100 text-blue-500",
                2: "bg-red-100 text-red-500",
              }[row.statut] || "bg-gray-100 text-gray-500"
            }`}
          >
            {Avance_Statut[row.statut]?.label || "Inconnu"}
          </span>
        );
      },
    },

    {
      key: "recu_scanne",
      label: "Reçu scanné",
      render: (row) => {
        if (!row.recu_scanne) return null;

        return (
          <div className="flex items-center mb-1">
            <span
              className="text-sm hover:text-blue-500 cursor-pointer"
              onClick={() => handleFileClick(row.recu_scanne)}
            >
              {row.recu_scanne}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const isAdminOrEditor = user?.role == 1 || user?.role == 2;
        const isLastRow = row.number == last_row_number;
        const canShowScan =
          etat_res == 1 &&
          (user?.role <= 3 || user?.role == 9) &&
          !row.recu_scanne;

        return (
          <div className="flex gap-3 items-center">
            {/* Print Receipt Button */}
            {(row.banque != null ||
              row.numero_paiement != null ||
              row.num_remise != null ||
              row.date_encaissement != null) && (
              <button
                className="p-1 text-indigo-500 hover:text-indigo-700"
                onClick={() =>
                  handle_detail(
                    row.sr,
                    row.banque,
                    row.numero_paiement,
                    row.num_remise,
                    row.date_encaissement,
                  )
                }
                title="Détails"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            {row.sr !== "SR" && reservationData.reservation?.etat == 1 && (
              <button
                className="p-1 text-blue-500 hover:text-blue-700"
                onClick={() => PrintRecu(row.id)}
                title="Imprimer reçu"
              >
                <Printer className="w-5 h-5" />
              </button>
            )}
            {etat_res == 1 && (
              <>
                {/* Scan Button */}
                {canShowScan && (
                  <button
                    className="p-1 text-green-500 hover:text-green-700"
                    onClick={() => handle_Scanne_recu(row.id)}
                    title="Scanner reçu"
                  >
                    <ScanEye className="w-5 h-5" />
                  </button>
                )}

                {/* Edit/Delete Buttons */}
                {isAdminOrEditor ? (
                  <>
                    <button
                      className="p-1 text-yellow-500 hover:text-yellow-700"
                      onClick={() => handleEdit(row.id)}
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    {!isLastRow && (
                      <button
                        className="p-1 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setSelectedId(row.id);
                          setShowDeleteModal(true);
                        }}
                        title="Supprimer Avance"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                ) : (user?.role == 3 ||
                    user?.role == 5 ||
                    user?.role == 6 ||
                    user?.role == 9) &&
                  Number(row.statut != 1) ? (
                  <button
                    className="p-1 text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleEdit(row.id)}
                    title="Modifier"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                ) : null}

                {/* Validation/Encashment Buttons */}
                {reservationData.reservation?.statut == 1 &&
                  (isAdminOrEditor || user?.role == 7) && (
                    <>
                      {Number(row.statut) == 3 && (
                        <button
                          className="p-1 text-green-500 hover:text-green-700"
                          onClick={() =>
                            handle_valider_rejete(
                              row.id,
                              row.sr,
                              0,
                              "validation",
                            )
                          }
                          title="Valider le paiement"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}

                      {/*nest pas transfer*/}

                      {Number(row.mode_pai) != 7 &&
                        parseFloat(row.montant) > 0 &&
                        Number(row.statut) == 1 &&
                        row.date_encaissement == null && (
                          <button
                            className="p-1 text-blue-500 hover:text-blue-700"
                            onClick={() =>
                              handle_valider_rejete(
                                row.id,
                                row.sr,
                                1,
                                "encaissement",
                              )
                            }
                            title="Ajouter encaissement"
                          >
                            <Euro className="w-5 h-5" />
                          </button>
                        )}
                    </>
                  )}
              </>
            )}
            {/* History Button */}
            {row.historiques_count > 0 && (
              <button
                className="p-1 text-purple-500 hover:text-purple-700"
                onClick={() => handle_Histo(row.id)}
                title="Voir l'historique"
              >
                <History className="w-5 h-5" />
              </button>
            )}

            {/* Transfer Dossier Button */}
            {row.dossier_id_transfert !== null && (
              <button
                className="p-1 text-blue-500 hover:text-blue-700"
                onClick={() => show_dos_desiste(row.dossier_id_transfert)}
                title="Voir le dossier transféré"
              >
                <FolderSearch className="w-5 h-5" />
              </button>
            )}

            {/* Attachment Button */}
            {row.piece_jointe?.length > 0 && (
              <button
                className="p-1 text-orange-500 hover:text-orange-700"
                onClick={() => handleShowPj(row.sr, row.piece_jointe)}
                title="Visualiser les pièces jointes"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    event.target.value = null;

    files.forEach((file) => {
      const fileName = file.name;
      const fileExistsInList = Object.values(filesList_avc).includes(fileName);

      const fileExistsInSelected = selectedFiles_avc.some(
        (selectedFile) =>
          selectedFile.name == fileName || selectedFile.fichier == fileName,
      );

      if (fileExistsInSelected) {
        setMyfile(files);
      } else if (fileExistsInList) {
        let newFileName = fileName;
        let fileNumber = 1;

        const lastDotIndex = fileName.lastIndexOf(".");
        const baseName = fileName.substring(0, lastDotIndex);
        const extension = fileName.substring(lastDotIndex + 1);

        while (Object.values(filesList_avc).includes(newFileName)) {
          newFileName = `${baseName} (${fileNumber}).${extension}`;
          fileNumber++;
        }

        const newFile = new File([file], newFileName, { type: file.type });

        if (
          selectedFiles_avc.some(
            (selectedFile) =>
              selectedFile.name == newFileName ||
              selectedFile.fichier == newFileName,
          )
        ) {
          setMyfile([newFile]);
        } else {
          setSelectedFiles_avc([...selectedFiles_avc, newFile]);
        }
      } else {
        setSelectedFiles_avc([...selectedFiles_avc, file]);
      }
    });
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...selectedFiles_avc];
    newFiles.splice(index, 1);
    setSelectedFiles_avc(newFiles);
  };

  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const iconClass = "w-5 h-5 flex-shrink-0 text-gray-400";

    switch (extension) {
      case "pdf":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "jpg":
      case "jpeg":
      case "png":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "doc":
      case "docx":
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="bg-cyan-50 rounded-lg p-4 mb-6">
        {/* Single Row Summary */}
        <div className="bg-cyan-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total versé</p>
              <p className="text-2xl font-bold">
                {sum_avances === 0 ? "-" : sum_avances.toLocaleString()} DH
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Reste à payer</p>
              <p className="text-2xl font-bold">
                {loading.table ? "-" : reste_first.toLocaleString()} DH
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Pourcentage versé</p>
              <p className="text-2xl font-bold">
                {loading.table ||
                data.length == 0 ||
                !prix ||
                prix <= 0 ||
                sum_avances == 0
                  ? "-"
                  : `${Math.round((sum_avances / prix) * 100)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>
      {etat_res == 1 && (
        <>
          {(user?.role <= 3 ||
            user?.role == 9 ||
            user?.role == 5 ||
            user?.role == 6) &&
            reste_first > 0 && (
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-md flex items-center bg-[rgb(26,21,120)] text-white hover:bg-indigo-700"
                size="small"
                variant="outlined"
              >
                <Plus className="w-5 h-5" /> Ajouter Avance
              </button>
            )}
        </>
      )}
      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading.table}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          enableExport
          showSearch={false}
        />
      </div>
      {(editDialogOpen || addDialogOpen) && (
        <Modal
          isVisible={editDialogOpen || addDialogOpen}
          onClick={handleDialogClose}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Added max-h-[90vh] and overflow-y-auto here */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div
                style={{ backgroundColor: color_header_modal }}
                className="text-white p-4 rounded-t-lg sticky top-0 z-10"
              >
                <h2 className="text-xl font-bold">
                  {currentPaiement ? "Modifier Avance" : "Ajouter Avance"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Date de règlement */}
                    <div className="flex items-center">
                      <input
                        id="sr"
                        name="sr"
                        type="checkbox"
                        checked={formData.sr == 1}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="sr"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        SR
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de règlement{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="date_reglement"
                          value={formData.date_reglement || ""}
                          onChange={handleInputChange}
                          className={`w-full p-2 border rounded-md ${
                            formErrors.date_reglement
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {formErrors.date_reglement && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.date_reglement}
                        </p>
                      )}
                    </div>

                    {/* Montant */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant (DH) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="montant"
                          value={formData.montant || ""}
                          onChange={handleInputChange}
                          className={`w-full p-2 border rounded-md ${
                            formErrors.montant
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      {formErrors.montant && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.montant}
                        </p>
                      )}
                    </div>
                    {/* In your form, after the montant input */}
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Montant restant : </span>
                      <span
                        className={
                          reste < 0 ? "text-red-500" : "text-green-500"
                        }
                      >
                        {reste.toLocaleString() + " DH"}
                      </span>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-center"></div>
                    <div className="flex items-center"></div>
                    {/* Mode de paiement */}
                    <div>
                      <SelectInput
                        label="Mode Paiement :"
                        placeholder="Sélectionner un mode de paiement"
                        name="mode_paiement"
                        value={formData.mode_paiement || ""}
                        required={true}
                        options={Object.values(MODE_PAIEMENT || {}).map(
                          (item) => ({
                            value: item.code || item.value,
                            label: item.label || item.name,
                          }),
                        )}
                        onChange={(value) => {
                          handleInputChange({
                            target: { name: "mode_paiement", value },
                          });
                        }}
                        error={formErrors.mode_paiement} // Change this line
                      />

                      {formErrors.mode_paiement && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.mode_paiement}
                        </p>
                      )}
                    </div>

                    {/* Banque (conditionally shown) */}
                    {formData.mode_paiement &&
                      [2, 3, 4, 5, 6].includes(
                        parseInt(formData.mode_paiement),
                      ) && (
                        <div>
                          <SelectInput
                            label="Banque:"
                            placeholder="Sélectionner une banque"
                            name="banque_id"
                            value={formData.banque_id || ""}
                            required={true}
                            options={
                              Array.isArray(banques)
                                ? banques.map((banque) => ({
                                    value: banque.id,
                                    label: banque.nom || `Banque ${banque.id}`,
                                  }))
                                : []
                            }
                            loading={loadingBanques}
                            onChange={(value) => {
                              handleInputChange({
                                target: { name: "banque_id", value },
                              });
                            }}
                            submitted={true} // to show error on submit
                            errors={formErrors.banque_id}
                          />

                          {formErrors.banque_id && (
                            <p className="mt-1 text-sm text-red-500">
                              {formErrors.banque_id}
                            </p>
                          )}
                        </div>
                      )}
                    {/* Numéro de paiement (conditionally shown) */}
                    {formData.mode_paiement &&
                      [2, 3, 4, 5, 6].includes(
                        parseInt(formData.mode_paiement),
                      ) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de paiement
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            name="numero_paiement"
                            value={formData.numero_paiement || ""}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${
                              formErrors.numero_paiement
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {formErrors.numero_paiement && (
                            <p className="mt-1 text-sm text-red-500">
                              {formErrors.numero_paiement}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Échéance (for checks) */}
                    {formData.mode_paiement &&
                      [2, 3, 4].includes(parseInt(formData.mode_paiement)) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Échéance <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              required
                              type="date"
                              name="echeance"
                              value={formData.echeance || ""}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="relative mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fichier Paiements
                  </label>
                  <input
                    type="file"
                    name=""
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Specify accepted file types
                    onChange={(e) => handleFileChange(e, 2)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Formats acceptés: PDF, JPG, PNG, DOC (Taille max: 10MB)
                  </p>
                </div>
                {/* Selected Files Preview */}
                {selectedFiles_avc.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Fichiers sélectionnés ({selectedFiles_avc.length})
                    </h3>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {selectedFiles_avc.map((data, index) => (
                          <div
                            key={data.id || data.name}
                            className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                          >
                            <div className="flex items-center mb-2">
                              {/* File icon based on type */}
                              {getFileIcon(data.name || data.fichier)}

                              <button
                                onClick={() =>
                                  data.fichier
                                    ? handleFileClick(data.fichier)
                                    : handleDownloadFile(data)
                                }
                                className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                title={data.fichier || data.name}
                              >
                                {data.fichier || data.name}
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(data.size)}
                              </span>
                              <button
                                onClick={() => handleDeleteFile(index, "rsv")}
                                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                    Commentaire
                  </label>
                  <textarea
                    name="commentaireAvance"
                    value={formData.commentaireAvance}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {/* Encaisse Section */}
                {user?.role <= 2 && formData.montant > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-3">Encaissement</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          N° Remise
                          {/*formData.date_encaissement != '' ? (
                          <span className="text-red-500">*</span>
                        ) : null*/}
                        </label>

                        <input
                          name="num_remise"
                          type="number"
                          /* required={
                          formData.date_encaissement != '' ? true : false
                        }*/
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={formData.num_remise || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date encaissement
                          {formData.num_remise != "" ? (
                            <span className="text-red-500">*</span>
                          ) : null}
                        </label>
                        <div className="relative">
                          <input
                            name="date_encaissement"
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={formData.date_encaissement || ""}
                            required={formData.num_remise != "" ? true : false}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={handleDialogClose}
                    className="px-4 py-2 border bg-gray-300 border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading.form || reste < 0}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      loading.form
                        ? "bg-indigo-200 text-indigo-400 cursor-not-allowed"
                        : reste < 0
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : "bg-[rgb(26,21,120)] text-white hover:bg-indigo-700"
                    }`}
                  >
                    {currentPaiement ? "Modifier" : `Ajouter`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
      {/* Validation/Rejection Dialog */}
      {open_v_r && (
        <Modal isVisible={open_v_r} onClose={() => setOpen_v_r(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-0 rounded-lg max-w-md w-full">
              <div
                style={{ backgroundColor: color_header_modal }}
                className=" text-white p-4 rounded-t-lg mb-3"
              >
                <h3 className="text-lg font-bold">
                  {type_action == "validation"
                    ? "Traiter un Avance"
                    : "Encaissement"}
                </h3>
              </div>

              <form onSubmit={onSubmit_valider_rejete}>
                <div className="space-y-4 mb-6 p-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      N° Reçu:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={num_recu}
                      disabled
                    />
                  </div>

                  {type_action == "validation" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Statut:
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner</option>
                        <option value="1">Valider</option>
                        <option value="2">Rejeter</option>
                      </select>
                    </div>
                  )}

                  {action == "1" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          N° Remise:
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={num_remise_v || ""}
                          onChange={(e) => set_num_remise_v(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date encaissement:{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={date_encaissement_v || ""}
                          onChange={(e) =>
                            set_date_encaissement_v(e.target.value)
                          }
                          required
                        />
                      </div>
                    </>
                  )}

                  {action == "2" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Commentaire: <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        value={Commentaire_r}
                        onChange={(e) => setCommentaire_r(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mr-2 mb-2">
                  <button
                    type="button"
                    className="px-4 py-2 border bg-gray-300 border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setOpen_v_r(false)}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    disabled={loading_traite}
                  >
                    {loading_traite ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
      {/* PJ Dialog */}
      {open_dialog && (
        <Modal isVisible={open_dialog} onClose={() => setOpen_dialog(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              {/* Colored header div */}
              <div
                style={{ backgroundColor: color_header_modal }}
                className=" text-white p-4 rounded-t-lg"
              >
                <h3 className="text-lg font-bold">
                  Liste des Pièces Jointes - Avance N°: {num_recu}
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-10">
                {pjj?.map((pj) => (
                  <div key={`pj-${pj.id}`} className="flex items-center">
                    {" "}
                    {/* Add key here */}
                    {pj.fichier?.toLowerCase()?.endsWith(".pdf") ? (
                      <FileText className="w-5 h-5 mr-2 text-red-500" />
                    ) : (
                      <div className="relative w-5 h-5 mr-2">
                        <img
                          src={`${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/paiements/${reservationData?.reservation.code_reservation}/${pj.fichier}`}
                          alt="PJ"
                          className="object-cover rounded w-full h-full"
                        />
                      </div>
                    )}
                    <span
                      className="text-sm hover:text-blue-500 cursor-pointer truncate"
                      onClick={() => handleFileClick(pj.fichier)}
                      title={pj.fichier}
                    >
                      {pj.fichier}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6 mb-2 mr-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={() => setOpen_dialog(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {/*show detail*/}
      {open_dialog_show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            {/* Colored header div */}
            <div
              style={{ backgroundColor: color_header_modal }}
              className=" text-white p-4 rounded-t-lg"
            >
              <h3 className="text-lg font-bold">
                Détail Avance N°: {num_recu}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 ml-10">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 capitalize">
                  {"Banque:"}
                </span>
                <span className="text-base font-medium text-gray-900">
                  {banque_show}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 capitalize">
                  {"Numéro Paiement:"}
                </span>
                <span className="text-base font-medium text-gray-900">
                  {num_paiement_show}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 capitalize">
                  {"Numéro Remise:"}
                </span>
                <span className="text-base font-medium text-gray-900">
                  {num_rem_show}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 capitalize">
                  {"Date Encaissement:"}
                </span>
                <span className="text-base font-medium text-gray-900">
                  {date_encais_show}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6 mb-2 mr-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => setOpen_dialog_show(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.PAIEMENTS}
            Id={selectedId}
            type="Avance"
            message={"Etes-vous sûr de vouloir supprimer cette Avance ?"}
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData();
            }}
          />
        </Modal>
      )}{" "}
      {/* Scanner Popup */}
      {popupScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div
              style={{ backgroundColor: color_header_modal }}
              className="text-white p-4 rounded-t-lg mb-3"
            >
              <h3 className="text-lg font-bold">Scanner Fichier</h3>
            </div>

            {/* Colored header div */}

            <div className="mb-4 ml-2">
              <label className="block text-sm font-medium mb-1">
                Fichier à scanner:
              </label>
              <input
                type="file"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept="application/pdf, image/*"
                onChange={(e) => setfichier_scanner(e.target.files[0])}
                disabled={loading_list}
              />
            </div>
            <div className="flex justify-end gap-4 mr-2 mb-2">
              <button
                className="px-4 py-2 border bg-gray-300 border-gray-300 rounded-md hover:bg-gray-50"
                onClick={closeScannerPopup}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                onClick={scanner_file}
                disabled={!fichier_scanner || loading_scann}
              >
                {loading_scann ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
