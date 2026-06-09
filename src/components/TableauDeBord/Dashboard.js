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

  const userRole = decryptUserType(user?.role);
  const isSuperAdmin = userRole === User_roles.ROLE_SUPER_ADMIN;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isSuperAdmin && !selectedSociete && !showSocieteModal) {
      setShowSocieteModal(true);
      return;
    }

    if (
      !selectedProjet &&
      !localStorage.getItem("selectedProjet") &&
      !showProjetDialog
    ) {
      if (!isSuperAdmin || (isSuperAdmin && selectedSociete)) {
        setShowProjetDialog(true);
      }
    }
  }, [
    user,
    selectedSociete,
    selectedProjet,
    isSuperAdmin,
    showProjetDialog,
    showSocieteModal,
    router,
  ]);

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

      if (showSocieteModal || showProjetDialog) {
        setLoading(false);
        return;
      }

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
          },
        );

        setData(response.data);
      } catch (_err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedProjet,
    accesstoken,
    startDate,
    endDate,
    showSocieteModal,
    showProjetDialog,
    router,
  ]);

  const shouldShowSocieteMessage = isSuperAdmin && !selectedSociete;
  const shouldShowProjetMessage =
    !selectedProjet && !localStorage.getItem("selectedProjet");

  const selectedProjectName =
    selectedProjet?.nom ||
    JSON.parse(localStorage.getItem("selectedProjet") || "null")?.nom ||
    "Projet B";

  const kpis = useMemo(() => {
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
      0,
    );

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
      ? (
          ((sumEncaissements - sumRemboursements) / sumEncaissements) *
          100
        ).toFixed(1)
      : "0.0";
    const caVsObjectif = objReservations
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
    ];
  }, [data]);

  const funnelData = useMemo(() => {
    const prospects = Number(data?.nb_prospects) || 0;
    const visites = Number(data?.nb_visites) || 0;
    const preReservations = Number(data?.biens?.[1]) || 0;
    const ventes = (data?.array_ventes || []).reduce(
      (acc, item) => acc + Number(item?.nombre || 0),
      0,
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
  }, [data]);

  const alertsData = useMemo(() => {
    const nbEcheances = Number(data?.nb_echeances) || 0;
    const nbSav = Number(data?.nb_sav) || 0;
    const nbDes = Number(data?.count_dst) || 0;
    const nbRemiseAVenir = Number(data?.nb_remise_a_venir) || 0;
    const sumRemb = Number(data?.sum_remboursements) || 0;

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
  }, [data]);

  const stockData = useMemo(() => {
    const biens = Array.isArray(data?.biens) ? data.biens : [];
    return {
      disponible: Number(biens[0]) || 0,
      preReservation: Number(biens[1]) || 0,
      reservation: Number(biens[2]) || 0,
      bloque: Number(biens[3]) || 0,
      proposition: Number(biens[4]) || 0,
      total: Number(data?.count_biens) || 0,
    };
  }, [data]);

  const performanceData = useMemo(() => {
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
        taux: `${(Number(data?.nb_prospects) || 0) > 0 ? (((Number(data?.nb_rsv) || 0) / Number(data?.nb_prospects)) * 100).toFixed(1) : "0.0"}%`,
      },
    ];
  }, [data, selectedProjectName]);

  const topCommerciauxData = useMemo(() => {
    return [
      {
        name:
          user?.name && user?.prenom
            ? `${user.name} ${user.prenom}`
            : "Utilisateur connecté",
        ventes: Number(data?.nb_rsv) || 0,
        commission: `${((Number(data?.sum_encaissements) || 0) * 0.03).toLocaleString("fr-FR")} DH`,
        ca: `${(Number(data?.sum_encaissements) || 0).toLocaleString("fr-FR")} DH`,
      },
    ];
  }, [data, user]);

  const echeancesData = useMemo(() => {
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
  }, [data, selectedProjectName]);

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
    [stockData],
  );

  const ventesBarData = useMemo(() => {
    const rows = Array.isArray(data?.array_ventes) ? data.array_ventes : [];
    return rows.map((r) => ({
      date: r?.date || "--",
      ventes: Number(r?.nombre) || 0,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Chargement du dashboard...
      </div>
    );
  }

  if (isSuperAdmin && showSocieteModal) {
    return (
      <SocieteModal
        open={showSocieteModal}
        onClose={() => setShowSocieteModal(false)}
        selectedId={selectedSocieteId}
        setSelectedId={setSelectedSocieteId}
        societes={societes}
        onConfirm={() => {
          setShowSocieteModal(false);
          if (!selectedProjet && !localStorage.getItem("selectedProjet"))
            setShowProjetDialog(true);
        }}
      />
    );
  }

  if (showProjetDialog) {
    return (
      <ProjetDialog
        open={showProjetDialog}
        onClose={() => setShowProjetDialog(false)}
        projets={projets}
        onSelect={() => setShowProjetDialog(false)}
      />
    );
  }

  if (shouldShowSocieteMessage || shouldShowProjetMessage) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-500">
        {shouldShowSocieteMessage
          ? "Veuillez sélectionner une société pour afficher les données."
          : "Veuillez sélectionner un projet pour afficher les données."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
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
            />
            <div className="px-4 py-2 rounded-lg border border-slate-200 bg-white min-w-[180px]">
              <p className="text-xs text-slate-500">Comparer à</p>
              <p className="text-sm font-semibold text-slate-800">
                Même période N-1
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
        {kpis.map((item, idx) => (
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
                      <span className="font-semibold text-slate-700">
                        {f.value} ({f.rate})
                      </span>
                    </div>
                    <div className="w-full flex justify-center">
                      <div
                        className={`h-9 rounded-md bg-gradient-to-r ${barColor} text-white text-xs font-semibold flex items-center justify-center shadow-sm transition-all`}
                        style={{ width: barWidth }}
                      >
                        {f.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 rounded-md bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium text-center">
              Conversion globale : {funnelData[3]?.rate || "0.0%"}
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-6">
          <CardShell title="Encaissements" rightLabel="Année en cours">
            <EncaissementChart
              startDate={startDate}
              endDate={endDate}
              data={data?.array_encaissement || []}
            />
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Alertes" rightLabel="Voir toutes">
            <div className="space-y-3">
              {alertsData.map((alert, idx) => (
                <div
                  key={`${alert.label}-${idx}`}
                  className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    <BellRingIcon
                      className={`h-4 w-4 mt-0.5 ${alert.level === "danger" ? "text-red-500" : alert.level === "warning" ? "text-amber-500" : "text-blue-500"}`}
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
                  <span className="font-semibold text-slate-800">
                    {s.value}
                  </span>
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

        <div className="xl:col-span-3">
          <CardShell title="Top commerciaux" rightLabel="Voir tous">
            <div className="space-y-3">
              {topCommerciauxData.map((c, idx) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500">CA: {c.ca}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{c.ventes}</p>
                    <p className="text-xs text-slate-500">{c.commission}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        </div>

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
                  {echeancesData.map((row) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Répartition des encaissements">
            <AppelsChart
              startDate={startDate}
              endDate={endDate}
              data={data || {}}
            />
          </CardShell>
        </div>

        <div className="xl:col-span-3">
          <CardShell title="Désistements par motif">
            <DesistementChart
              startDate={startDate}
              endDate={endDate}
              data={data || {}}
            />
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
