import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import { APIURL } from "../../configs/api";
import { DateSelector } from "./DateSelector";
import { MetricsCard } from "./MetricsCard";
import { EncaissementChart } from "./EncaissementChart";
import { VentesChart } from "./VentesChart";
import { VisitesChart } from "./VisitesChart";
import { AppelsChart } from "./charts/AppelsChart";
import { DesistementChart } from "./charts/DesistementChart";


import {
  UsersIcon,
  AlertOctagonIcon,
  CreditCardIcon,
  PhoneIcon,
  TrendingUpIcon,
  TargetIcon,
  ShoppingCartIcon,
  WalletIcon,
  BellRingIcon,
   UserPlusIcon,    // Nouveau
  EyeIcon, 
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useSociete } from "@/context/SocieteContext";
import SocieteModal from "../SocieteDialog";
import ProjetDialog from "../../components/ProjetDialog";
import { User_roles, decryptUserType } from "../../configs/enum";
import { startOfYear, endOfYear, format, isValid } from "date-fns";

const CardShell = ({ title, rightLabel, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {rightLabel ? (
        <span className="text-xs text-blue-600 font-medium">{rightLabel}</span>
      ) : null}
    </div>
    {children}
  </div>
);

export const Dashboard = () => {
  const [hasUserCancelledSociete, setHasUserCancelledSociete] = useState(false);
  const { token, user } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet, projets } = useProjet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(startOfYear(new Date()));
  const [endDate, setEndDate] = useState(endOfYear(new Date()));
  const [showProjetDialog, setShowProjetDialog] = useState(false);
  const router = useRouter();
  const { selectedSociete, societes } = useSociete();
  const [showSocieteModal, setShowSocieteModal] = useState(false);
  const [selectedSocieteId, setSelectedSocieteId] = useState(null);
  const [hasUserCancelledProjet, setHasUserCancelledProjet] = useState(false); // Nouvel état

  const userRole = decryptUserType(user?.role);
  const isSuperAdmin = userRole === User_roles.ROLE_SUPER_ADMIN;
const showTopCommerciaux = userRole <= 2; // ROLE_SUPER_ADMIN=1, ROLE_ADMIN=2, ROLE_COMMERCIAL=3

  // Check which dialogs to show on initial render
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

     // Check if we need to show societe modal
  if (isSuperAdmin && !selectedSociete && !showSocieteModal && !hasUserCancelledSociete) {
    setShowSocieteModal(true);
    return;
  }

    // Check if we need to show projet modal (only after societe is selected for super admin)
    // IMPORTANT: Ne pas afficher si l'utilisateur a déjà annulé
    if (
      !selectedProjet &&
      !localStorage.getItem("selectedProjet") &&
      !showProjetDialog &&
      !hasUserCancelledProjet // Vérifier si l'utilisateur n'a pas annulé
    ) {
      // For super admin, only show projet dialog if societe is already selected
      if (!isSuperAdmin || (isSuperAdmin && selectedSociete)) {
        setShowProjetDialog(true);
      }
    }
}, [user, selectedSociete, selectedProjet, isSuperAdmin, showSocieteModal, showProjetDialog, hasUserCancelledProjet, hasUserCancelledSociete]);
  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!accesstoken) {
        router.push("/login");
        setLoading(false);
        return;
      }

      // Don't fetch data if we're showing modals
      if (showSocieteModal || showProjetDialog) {
        setLoading(false);
        return;
      }

      // Don't fetch data if no projet is selected
      const hasSelectedProjet =
        selectedProjet || localStorage.getItem("selectedProjet");
      if (!hasSelectedProjet) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const projetId =
          selectedProjet?.id ||
          JSON.parse(localStorage.getItem("selectedProjet"))?.id;
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");

        const response = await axios.get(
          `${APIURL.ROOTV1}/dashboard/${projetId}/${start}/${end}`,
          {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }
        );

        setData(response.data);
      } catch (_err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjet, accesstoken, startDate, endDate, showSocieteModal, showProjetDialog, router]);

  const shouldShowSocieteMessage = isSuperAdmin && !selectedSociete;
  const shouldShowProjetMessage =
    !selectedProjet && !localStorage.getItem("selectedProjet") && !hasUserCancelledProjet;

  const selectedProjectName =
    selectedProjet?.nom ||
    JSON.parse(localStorage.getItem("selectedProjet") || "null")?.nom ||
    "Aucun projet sélectionné";

 const kpis = useMemo(() => {
  // Define these variables first, before any conditional checks
  const nbClients = Number(data?.nb_clients) || 0;
  const nbProspects = Number(data?.nb_prospects) || 0;
  const nbVisites = Number(data?.nb_visites) || 0;
  const nbReservations = Number(data?.nb_rsv) || 0;
  const sumEncaissements = Number(data?.sum_encaissements) || 0;
  const sumRemboursements = Number(data?.sum_remboursements) || 0;
  const countDesistements = Number(data?.count_dst) || 0;
  const objReservations = Number(data?.obj_mois_reservations) || 0;

  const appels = (data?.Appels || []).reduce(
    (acc, item) =>
      acc +
      Number(item["appel entrant"] || item.appel_entrant || 0) +
      Number(item["appel sortant"] || item.appel_sortant || 0),
    0
  );

  // Now check if should show projet message
  if (!data || shouldShowProjetMessage) {
    return [
      {
        title: "Chiffre d'affaires (CA)",
        value: "0 DH",
        icon: <TrendingUpIcon className="h-6 w-6 text-blue-500" />,
        color: "blue",
        trend: "Données réelles",
      },
      {
        title: "CA vs Objectif",
        value: "0%",
        icon: <TargetIcon className="h-6 w-6 text-green-500" />,
        color: "green",
        subtitle: "Obj. réservations: 0",
      },
      {
        title: "Taux de conversion",
        value: "0%",
        icon: <UsersIcon className="h-6 w-6 text-purple-500" />,
        color: "purple",
        trend: "0 réservations",
      },
      {
        title: "Panier moyen",
        value: "0 DH",
        icon: <ShoppingCartIcon className="h-6 w-6 text-amber-500" />,
        color: "amber",
        trend: "Encaissements / Réservations",
      },
      {
        title: "Taux de désistement",
        value: "0%",
        icon: <AlertOctagonIcon className="h-6 w-6 text-red-500" />,
        color: "red",
        trend: "0 désistements",
      },
      {
        title: "Taux de recouvrement",
        value: "0%",
        icon: <WalletIcon className="h-6 w-6 text-indigo-500" />,
        color: "indigo",
        trend: "Après remboursements",
      },
      {
        title: "Remboursements",
        value: "0 DH",
        icon: <CreditCardIcon className="h-6 w-6 text-amber-500" />,
        color: "amber",
      },
      {
        title: "Appels",
        value: "0",
        icon: <PhoneIcon className="h-6 w-6 text-indigo-500" />,
        color: "indigo",
      },
      {
        title: "Prospects",
        value: nbProspects.toLocaleString("fr-FR"),
        icon: <UserPlusIcon className="h-6 w-6 text-teal-500" />,
        color: "teal",
        trend: `${nbProspects.toLocaleString("fr-FR")} prospects`,
      },
      {
        title: "Visites",
        value: nbVisites.toLocaleString("fr-FR"),
        icon: <EyeIcon className="h-6 w-6 text-cyan-500" />,
        color: "cyan",
        trend: `${nbVisites.toLocaleString("fr-FR")} visites`,
      },
    ];
  }

  // Calculations for real data
  const tauxConversion = nbProspects
    ? ((nbReservations / nbProspects) * 100).toFixed(1)
    : "0.0";
  const panierMoyen = nbReservations
    ? (sumEncaissements / nbReservations).toFixed(0)
    : "0";
  const tauxDesistement = nbReservations
    ? ((countDesistements / nbReservations) * 100).toFixed(1)
    : "0.0";
  const tauxRecouvrement = sumEncaissements
    ? (((sumEncaissements - sumRemboursements) / sumEncaissements) * 100).toFixed(1)
    : "0.0";
  const caVsObjectif = objReservations > 0
    ? ((nbReservations / objReservations) * 100).toFixed(1)
    : "0.0";

  return [
    {
      title: "Chiffre d'affaires (CA)",
      value: `${sumEncaissements.toLocaleString("fr-FR")} DH`,
      icon: <TrendingUpIcon className="h-6 w-6 text-blue-500" />,
      color: "blue",
      trend: "Données réelles",
    },
    {
      title: "CA vs Objectif",
      value: `${caVsObjectif}%`,
      icon: <TargetIcon className="h-6 w-6 text-green-500" />,
      color: "green",
      subtitle: `Obj. réservations: ${objReservations.toLocaleString("fr-FR")}`,
    },
    {
      title: "Taux de conversion",
      value: `${tauxConversion}%`,
      icon: <UsersIcon className="h-6 w-6 text-purple-500" />,
      color: "purple",
      trend: `${nbReservations.toLocaleString("fr-FR")} réservations`,
    },
    {
      title: "Panier moyen",
      value: `${Number(panierMoyen).toLocaleString("fr-FR")} DH`,
      icon: <ShoppingCartIcon className="h-6 w-6 text-amber-500" />,
      color: "amber",
      trend: "Encaissements / Réservations",
    },
    {
      title: "Taux de désistement",
      value: `${tauxDesistement}%`,
      icon: <AlertOctagonIcon className="h-6 w-6 text-red-500" />,
      color: "red",
      trend: `${countDesistements.toLocaleString("fr-FR")} désistements`,
    },
    {
      title: "Taux de recouvrement",
      value: `${tauxRecouvrement}%`,
      icon: <WalletIcon className="h-6 w-6 text-indigo-500" />,
      color: "indigo",
      trend: "Après remboursements",
    },
    {
      title: "Remboursements",
      value: `${sumRemboursements.toLocaleString("fr-FR")} DH`,
      icon: <CreditCardIcon className="h-6 w-6 text-amber-500" />,
      color: "amber",
    },
    {
      title: "Appels",
      value: appels.toLocaleString("fr-FR"),
      icon: <PhoneIcon className="h-6 w-6 text-indigo-500" />,
      color: "indigo",
    },
    {
      title: "Prospects",
      value: nbProspects.toLocaleString("fr-FR"),
      icon: <UserPlusIcon className="h-6 w-6 text-teal-500" />,
      color: "teal",
      trend: `${nbProspects.toLocaleString("fr-FR")} prospects`,
    },
    {
      title: "Visites",
      value: nbVisites.toLocaleString("fr-FR"),
      icon: <EyeIcon className="h-6 w-6 text-cyan-500" />,
      color: "cyan",
      trend: `${nbVisites.toLocaleString("fr-FR")} visites`,
    },
  ];
}, [data, shouldShowProjetMessage]);
  const funnelData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return [
        { label: "Prospects", value: 0, rate: "0%" },
        { label: "Visites", value: 0, rate: "0%" },
        { label: "Pré-réservations", value: 0, rate: "0%" },
        { label: "Ventes", value: 0, rate: "0%" },
        { label: "Livraisons", value: 0, rate: "0%" },
      ];
    }

    const prospects = Number(data?.nb_prospects) || 0;
    const visites = Number(data?.nb_visites) || 0;
    const preReservations = Number(data?.biens?.[1]) || 0;
    const ventes = (data?.array_ventes || []).reduce(
      (acc, item) => acc + Number(item?.nombre || 0),
      0
    );
    const livraisons = Number(data?.nb_remise_recement) || 0;

    const base = prospects || 1;
    return [
      { label: "Prospects", value: prospects, rate: "100%" },
      {
        label: "Visites",
        value: visites,
        rate: `${((visites / base) * 100).toFixed(1)}%`,
      },
      {
        label: "Pré-réservations",
        value: preReservations,
        rate: `${((preReservations / base) * 100).toFixed(1)}%`,
      },
      {
        label: "Ventes",
        value: ventes,
        rate: `${((ventes / base) * 100).toFixed(1)}%`,
      },
      {
        label: "Livraisons",
        value: livraisons,
        rate: `${((livraisons / base) * 100).toFixed(1)}%`,
      },
    ];
  }, [data, shouldShowProjetMessage]);

  const alertsData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return [
        { label: "Échéances à venir", amount: "0 échéances", level: "info" },
        { label: "Désistements", amount: "0 dossiers", level: "info" },
        { label: "Demandes SAV", amount: "0 réclamations", level: "info" },
        { label: "Remises à venir", amount: "0 biens", level: "info" },
        { label: "Remboursements", amount: "0 DH", level: "info" },
        { label: "Pénalités", amount: "0 DH", level: "info" }, // AJOUTER

      ];
    }

    const nbEcheances = Number(data?.nb_echeances) || 0;
    const nbSav = Number(data?.nb_sav) || 0;
    const nbDes = Number(data?.count_dst) || 0;
    const nbRemiseAVenir = Number(data?.nb_remise_a_venir) || 0;
    const sumRemb = Number(data?.sum_remboursements) || 0;
    const sumPenalites = Number(data?.sum_penalites) || 0; // AJOUTER

    return [
      {
        label: "Échéances à venir",
        amount: `${nbEcheances.toLocaleString("fr-FR")} échéances`,
        level: nbEcheances > 0 ? "warning" : "info",
      },
      {
        label: "Désistements",
        amount: `${nbDes.toLocaleString("fr-FR")} dossiers`,
        level: nbDes > 0 ? "danger" : "info",
      },
      {
      label: "Pénalités", // AJOUTER CETTE ALERTE
      amount: `${sumPenalites.toLocaleString("fr-FR")} DH`,
      level: sumPenalites > 0 ? "warning" : "info",
       },
      {
        label: "Demandes SAV",
        amount: `${nbSav.toLocaleString("fr-FR")} réclamations`,
        level: nbSav > 0 ? "warning" : "info",
      },
      {
        label: "Remises à venir",
        amount: `${nbRemiseAVenir.toLocaleString("fr-FR")} biens`,
        level: nbRemiseAVenir > 0 ? "warning" : "info",
      },
      {
        label: "Remboursements",
        amount: `${sumRemb.toLocaleString("fr-FR")} DH`,
        level: sumRemb > 0 ? "danger" : "info",
      },
    ];
  }, [data, shouldShowProjetMessage]);

  const stockData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return {
        disponible: 0,
        preReservation: 0,
        reservation: 0,
        bloque: 0,
        proposition: 0,
        total: 0,
      };
    }

    const biens = Array.isArray(data?.biens) ? data.biens : [];
    return {
      disponible: Number(biens[0]) || 0,
      preReservation: Number(biens[1]) || 0,
      reservation: Number(biens[2]) || 0,
      bloque: Number(biens[3]) || 0,
      proposition: Number(biens[4]) || 0,
      total: Number(data?.count_biens) || 0,
    };
  }, [data, shouldShowProjetMessage]);

  const performanceData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return [
        {
          projet: selectedProjectName,
          ca: "0 DH",
          ventes: 0,
          stock: 0,
          taux: "0.0%",
        },
      ];
    }

    const fromApi = Array.isArray(data?.performance_projets)
      ? data.performance_projets
      : [];

    if (fromApi.length > 0) {
      return fromApi.map((p) => ({
        projet: p?.projet_nom || "Projet",
        ca: `${(Number(p?.ca) || 0).toLocaleString("fr-FR")} DH`,
        ventes: Number(p?.ventes) || 0,
        stock: Number(p?.stock) || 0,
        taux: `${Number(p?.taux_conversion || 0).toFixed(1)}%`,
      }));
    }

    return [
      {
        projet: selectedProjectName,
        ca: `${(Number(data?.sum_encaissements) || 0).toLocaleString("fr-FR")} DH`,
        ventes: Number(data?.nb_rsv) || 0,
        stock: Number(data?.count_biens) || 0,
        taux: `${
          (Number(data?.nb_prospects) || 0) > 0
            ? (
                ((Number(data?.nb_rsv) || 0) / Number(data?.nb_prospects)) *
                100
              ).toFixed(1)
            : "0.0"
        }%`,
      },
    ];
  }, [data, shouldShowProjetMessage, selectedProjectName]);

 const topCommerciauxData = useMemo(() => {
  if (!data || shouldShowProjetMessage) {
    return [];
  }

  // Vérifier si les données des top commerciaux existent dans la réponse
  if (data?.top_commerciaux && Array.isArray(data.top_commerciaux) && data.top_commerciaux.length > 0) {
    return data.top_commerciaux.map(commercial => ({
      name: commercial.name,
      ca: `${commercial.ca.toLocaleString("fr-FR")} DH`,
      ventes: commercial.ventes,
      commission: `${commercial.commission.toLocaleString("fr-FR")} DH`,
      id: commercial.id
    }));
  }

  // Retourner un tableau vide si pas de données
  return [];
}, [data, shouldShowProjetMessage]);
  const echeancesData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return [];
    }

    const echeances = Array.isArray(data?.echeances) ? data.echeances : [];
    return echeances.map((item, idx) => {
      const dateObj = item?.echeance ? new Date(item.echeance) : null;
      return {
        key: `${item?.id || idx}`,
        client:
          item?.reservation?.client?.nom && item?.reservation?.client?.prenom
            ? `${item.reservation.client.nom} ${item.reservation.client.prenom}`
            : "Client",
        projet: selectedProjectName,
        echeance:
          dateObj && isValid(dateObj) ? format(dateObj, "dd/MM/yyyy") : "--",
        montant: `${(Number(item?.montant) || 0).toLocaleString("fr-FR")} DH`,
        statut: Number(item?.last_statut?.statut) === 1 ? "Validée" : "À venir",
      };
    });
  }, [data, shouldShowProjetMessage, selectedProjectName]);

  const stockChartData = useMemo(
    () => [
      { name: "Disponible", value: stockData.disponible, color: "#10B981" },
      {
        name: "Pré-réservation",
        value: stockData.preReservation,
        color: "#3B82F6",
      },
      { name: "Réservation", value: stockData.reservation, color: "#6366F1" },
      { name: "Bloqué", value: stockData.bloque, color: "#F59E0B" },
      { name: "Proposition", value: stockData.proposition, color: "#EF4444" },
    ],
    [stockData]
  );

  const ventesBarData = useMemo(() => {
    if (!data || shouldShowProjetMessage) {
      return [];
    }

    const rows = Array.isArray(data?.array_ventes) ? data.array_ventes : [];
    return rows.map((r) => ({
      date: r?.date || "--",
      ventes: Number(r?.nombre) || 0,
    }));
  }, [data, shouldShowProjetMessage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Chargement Tableau de Bord...
      </div>
    );
  }

  // Show SocieteDialog first for superadmin if needed
  if (isSuperAdmin && showSocieteModal) {
    return (
      <SocieteModal
        open={showSocieteModal}
        onClose={() => {
          setShowSocieteModal(false);
          setHasUserCancelledSociete(true); // Marquer que l'utilisateur a annulé

        }}
        selectedId={selectedSocieteId}
        setSelectedId={setSelectedSocieteId}
        societes={societes}
        onConfirm={() => {
          setShowSocieteModal(false);
          setHasUserCancelledSociete(false); // Réinitialiser car une société a été sélectionnée
          // After selecting societe, show projet dialog if needed
          if (!selectedProjet && !localStorage.getItem("selectedProjet")) {
            setHasUserCancelledProjet(false); // Réinitialiser l'état d'annulation
            setShowProjetDialog(true);
          }
        }}
      />
    );
  }

  // Show ProjetDialog if needed
  if (showProjetDialog) {
    return (
      <ProjetDialog
        open={showProjetDialog}
        onClose={() => {
          setShowProjetDialog(false);
          // Marquer que l'utilisateur a annulé pour ne pas rouvrir le modal
          setHasUserCancelledProjet(true);
        }}
        projets={projets}
        onSelect={() => {
          setShowProjetDialog(false);
          // Si l'utilisateur sélectionne un projet, on ne marque pas comme annulé
          // On peut aussi réinitialiser l'état si besoin
        }}
      />
    );
  }

  if (shouldShowSocieteMessage) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-500">
        Veuillez sélectionner une société pour afficher les données.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
            <p className="text-sm text-slate-500 mt-1">
              Vue d&apos;ensemble de la performance de vos projets
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-lg border border-slate-200 bg-white min-w-[180px]">
              <p className="text-xs text-slate-500">Projet</p>
              <p className="text-sm font-semibold text-slate-800">
                {selectedProjectName}
              </p>
            </div>
            <DateSelector
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              disabled={shouldShowSocieteMessage || shouldShowProjetMessage}
            />
            {/*<div className="px-4 py-2 rounded-lg border border-slate-200 bg-white min-w-[180px]">
              <p className="text-xs text-slate-500">Comparer à</p>
              <p className="text-sm font-semibold text-slate-800">
                Même période N-1
              </p>
            </div>*/}
          </div>
        </div>
      </div>

      {shouldShowProjetMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-800">
            ⚠️ Aucun projet sélectionné. Veuillez sélectionner un projet pour
            voir les données réelles.
          </p>
        </div>
      )}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">        {kpis.map((item, idx) => (
          <MetricsCard
            key={`${item.title}-${idx}`}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            subtitle={item.subtitle}
            trend={item.trend}
          />
        ))}
      </div>

      {/* Le reste du JSX reste identique */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3">
          <CardShell title="Funnel commercial">
            <div className="space-y-2">
              {funnelData.map((f, idx) => {
                const widthMap = ["100%", "84%", "68%", "54%", "42%"];
                const bgMap = [
                  "from-indigo-500 to-blue-500",
                  "from-blue-500 to-cyan-500",
                  "from-cyan-500 to-teal-500",
                  "from-emerald-500 to-lime-500",
                  "from-amber-500 to-orange-500",
                ];
                const barWidth = widthMap[idx] || "40%";
                const barColor = bgMap[idx] || "from-slate-500 to-slate-400";

                return (
                  <div key={f.label} className="w-full">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-medium">{f.label}</span>
                     
                    </div>
                    <div className="w-full flex justify-center">
                      <div
                        className={`h-9 rounded-md bg-gradient-to-r ${barColor} text-white text-xs font-semibold flex items-center justify-center shadow-sm transition-all`}
                        style={{ width: barWidth }}
                      >
                         <span className="font-semibold text-white-700">
                        {f.value} ({f.rate})
                      </span>
                  
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 rounded-md bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium text-center">
              Conversion globale : {funnelData[3]?.rate || "0.0%"}
              {/* la conversion globale mesure le % de prospects devenus ventes*/}
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-6">
          <CardShell title="Encaissements" rightLabel="">
            <EncaissementChart
              startDate={startDate}
              endDate={endDate}
              data={data?.array_encaissement || []}
            />
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Alertes" rightLabel="">
            <div className="space-y-3">
              {alertsData.map((alert, idx) => (
                <div
                  key={`${alert.label}-${idx}`}
                  className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    <BellRingIcon
                      className={`h-4 w-4 mt-0.5 ${
                        alert.level === "danger"
                          ? "text-red-500"
                          : alert.level === "warning"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {alert.label}
                      </p>
                      <p className="text-xs text-slate-500">{alert.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Stock immobilier">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {stockChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              {stockChartData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                  <span className="font-semibold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Ventes par mois">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventesBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Bar dataKey="ventes" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Performance par projet">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="text-left py-2">Projet</th>
                    <th className="text-left py-2">CA</th>
                    <th className="text-left py-2">Ventes</th>
                    <th className="text-left py-2">Stock</th>
                    <th className="text-right py-2">Taux conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((p) => (
                    <tr key={p.projet} className="border-b border-slate-50">
                      <td className="py-2 font-semibold text-slate-700">
                        {p.projet}
                      </td>
                      <td className="py-2 text-slate-600">{p.ca}</td>
                      <td className="py-2 text-slate-600">{p.ventes}</td>
                      <td className="py-2 text-slate-600">{p.stock}</td>
                      <td className="py-2 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                          {p.taux}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>
        </div>
{showTopCommerciaux && (

        <div className="xl:col-span-3">
          <CardShell title="Top commerciaux" rightLabel="Classement par CA">
            <div className="space-y-3">
              {topCommerciauxData.length > 0 ? (
                topCommerciauxData.map((c, idx) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-b-0 hover:bg-slate-50 p-2 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                          idx === 1 ? 'bg-gray-300 text-gray-700' : 
                          idx === 2 ? 'bg-amber-600 text-white' : 
                          'bg-blue-100 text-blue-600'}
                      `}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500">CA: {c.ca}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{c.ventes} ventes</p>
                      <p className="text-xs text-slate-400">{c.commission}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-4">
                  Aucune donnée commerciale disponible
                </div>
              )}
            </div>
          </CardShell>
        </div>
)}

        <div className="xl:col-span-6">
          <CardShell title="Échéances à venir">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2">Client</th>
                    <th className="py-2">Projet</th>
                    <th className="py-2">Échéance</th>
                    <th className="py-2">Montant</th>
                    <th className="py-2 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {echeancesData.length > 0 ? (
                    echeancesData.map((row) => (
                      <tr key={row.key} className="border-b border-slate-50">
                        <td className="py-2 text-slate-700">{row.client}</td>
                        <td className="py-2 text-slate-600">{row.projet}</td>
                        <td className="py-2 text-slate-600">{row.echeance}</td>
                        <td className="py-2 text-slate-700 font-medium">
                          {row.montant}
                        </td>
                        <td className="py-2 text-right">
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                            {row.statut}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        Aucune échéance à venir
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Répartition des appels">
            <div className="h-[350px]">  {/* Hauteur fixe */}

            <AppelsChart
              startDate={startDate}
              endDate={endDate}
              data={data || {}}
            />
            </div>
          </CardShell>
        </div>
      
       

        <div className="xl:col-span-3">
          <CardShell title="Désistements par type">
                       <div className="h-[350px]">  {/* Hauteur fixe */}

           <DesistementChart
              startDate={startDate}
              endDate={endDate}
              data={data || {}}
            />
            </div>
          </CardShell>
          
        </div>

        <div className="xl:col-span-12">
          <CardShell title="Visites">
            <VisitesChart
              startDate={startDate}
              endDate={endDate}
              data={data?.array_visite_interet_et_date || []}
            />
          </CardShell>
        </div>
      </div>
    </div>
  );
};
