'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import EncaissementTable from '@/app/(dashboard)/encaissements/EncaissementTable';
import ReservationTable from '../../reservations/ReservationTable';
import { getSituationLabel } from '@/components/client-utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ClientPDF from '../ClientImprimer';
import JournalTable from '@/app/(dashboard)/crm/appels/[appelId]/JournalTable';
import HistoriquesTable from '@/app/(dashboard)/crm/prospects/[prospectId]/HistoriquesTable';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isCommercial, isComptable, isNotaire, isRespoCommercial, isRespoLivraison, isSuperAdmin } from '@/configs/enum';
import { useSociete } from '@/context/SocieteContext';
import VisiteTableShow from '@/app/(dashboard)/crm/prospects/[prospectId]/VisitesTableShow';
import {
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  User,
  Briefcase,
  Clock,
  MessageSquare,
  MapPin,
  History,
  PhoneCall,
  Edit,
  ExternalLink,
  FileText,
  CreditCard,
  Home,
  Printer,
  Users,
  Heart,
  Cake,
  MapPinHouse,
  Flag,
  Building2,
  Globe,
  UserCheck,
} from 'lucide-react';

// Reusable Components
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueNode }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 text-slate-500">
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-sm text-slate-900 font-medium text-right">
      {valueNode || value || (
        <span className="text-slate-400 italic">Non renseigné</span>
      )}
    </div>
  </div>
);

const ClientDetails = () => {
  const { token, user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const { clientId } = useParams();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState({});
  const [reservationDetails, setReservationDetails] = useState([]);
  const [visiteDetails, setVisiteDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('encaissements');

  const handleEdit = (id) => {
    router.push(`${ENDPOINTS.CLIENTS}?id=${id}&action=edit`);
  };

  const userRole = user?.role;

  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole) &&
      !isRespoCommercial(userRole) &&
      !isNotaire(userRole) &&
      !isRespoLivraison(userRole) &&
      !isComptable(userRole)
    ) {
      router.push('/');
    }
  }, [router, userRole]);

  const tabs = [
    { id: 'encaissements', label: 'Encaissements', icon: CreditCard },
    { id: 'reservations', label: 'Réservations', icon: Home },
    { id: 'historiques', label: 'Historiques', icon: History },
    { id: 'appels', label: 'Appels', icon: PhoneCall },
    { id: 'visites', label: 'Visites', icon: MapPin },
  ];

  const filteredTabs = tabs.filter((tab) => {
    if (tab.id === 'historiques' && clientDetails?.prospect == null) return false;
    if (tab.id === 'appels' && clientDetails?.prospect?.appels == null) return false;
    return true;
  });

  const { selectedSociete } = useSociete();
  const [oldProjetId, setOldProjetId] = useState(null);
  const [oldSocieteId, setOldSocieteId] = useState(null);

  useEffect(() => {
    if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId) || (selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
      if (oldProjetId || oldSocieteId) {
        router.push('/ventes?tab=clients');
      }
      setOldSocieteId(selectedSociete?.id);
      setOldProjetId(selectedProjet?.id);
    }
  }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);

  useEffect(() => {
    if (clientId) {
      setLoading(true);
      axios
        .get(`${APIURL.CLIENTS}/${clientId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setClientDetails(response.data.client);
          setReservationDetails(response.data.reservations);
          setVisiteDetails(response.data.visites);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [clientId, accessToken]);

  const handleTabClick = (tab) => setActiveTab(tab);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50/50 pb-12">
          {/* Header / Breadcrumb */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-16 text-sm text-slate-500">
                <a href={ENDPOINTS.VENTE + '?tab=clients'} className="hover:text-emerald-600 transition-colors">
                  Vente
                </a>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <a href={ENDPOINTS.VENTE + '?tab=clients'} className="hover:text-emerald-600 transition-colors">
                  Clients
                </a>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <span className="text-slate-900 font-medium">Détail client</span>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Top Section - Client Info Cards in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-600">
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white rounded-xl p-1 shadow-md">
                      <div className="w-full h-full bg-emerald-50 rounded-lg flex items-center justify-center text-2xl font-bold text-emerald-600">
                        {clientDetails.nom ? clientDetails.nom.charAt(0).toUpperCase() : 'C'}
                        {clientDetails.prenom ? clientDetails.prenom.charAt(0).toUpperCase() : ''}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="primary">Code: {clientDetails.code_client || clientDetails.id || 'N/A'}</Badge>
                  </div>
                </div>

                <div className="pt-14 pb-6 px-6 border-b border-slate-100">
                  <h1 className="text-xl font-bold text-slate-900">
                    {clientDetails?.nom || ''} {clientDetails?.prenom || ''}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>CIN: {clientDetails?.cin || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <PDFDownloadLink
                      document={
                        <ClientPDF
                          client={clientDetails}
                          reservations={reservationDetails}
                          visites={visiteDetails}
                          user={user}
                        />
                      }
                      fileName={`client_${clientId}.pdf`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-emerald-500 shadow-sm"
                    >
                      {({ loading }) => (
                        <>
                          <Printer className="w-4 h-4" />
                          {loading ? 'Préparation...' : 'Imprimer'}
                        </>
                      )}
                    </PDFDownloadLink>
                    {(isSuperAdmin(userRole) || isAdmin(userRole)) && (
                      <button
                        onClick={() => handleEdit(clientDetails?.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-emerald-500 shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    Informations personnelles
                  </h2>
                </div>
                <div className="px-6 py-2 max-h-[400px] overflow-y-auto">
                  <InfoRow icon={Mail} label="Email" value={clientDetails?.email} />
                  <InfoRow icon={Phone} label="Téléphone 1" value={clientDetails?.telephone_num1} />
                  {clientDetails?.telephone_num2 && (
                    <InfoRow icon={Phone} label="Téléphone 2" value={clientDetails.telephone_num2} />
                  )}
                  <InfoRow
                    icon={MessageSquare}
                    label="Accepte d'être contacté:"
                    valueNode={
                      <Badge variant={clientDetails?.notifie === 1 ? 'success' : 'danger'}>
                        {clientDetails?.notifie === 1 ? 'Oui' : 'Non'}
                      </Badge>
                    }
                  />
                  <InfoRow icon={MapPinHouse} label="Adresse" value={clientDetails?.adresse} />
                  <InfoRow icon={Globe} label="Ville / Pays" value={`${clientDetails?.ville || ''} / ${clientDetails?.pays || ''}`} />
                  <InfoRow icon={Flag} label="Nationalité" value={clientDetails?.nationalite} />
                  <InfoRow icon={Briefcase} label="Profession" value={clientDetails?.profession} />
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    Détails complémentaires
                  </h2>
                </div>
                <div className="px-6 py-2 max-h-[400px] overflow-y-auto">
                  <InfoRow icon={Cake} label="Date naissance" value={formatDate(clientDetails?.date_naissance)} />
                  <InfoRow icon={MapPin} label="Lieu naissance" value={clientDetails?.lieu_naissance} />
                  <InfoRow icon={Users} label="Situation familiale" value={getSituationLabel(clientDetails?.situation_familliale)} />
                  {clientDetails?.situation_familliale == 2 && (
                    <>
                      <InfoRow icon={User} label="Nom mari" value={clientDetails?.nom_mari} />
                      <InfoRow icon={MapPin} label="Lieu mariage" value={clientDetails?.lieu_mariage} />
                      <InfoRow icon={Calendar} label="Date mariage" value={formatDate(clientDetails?.date_mariage)} />
                    </>
                  )}
                  {clientDetails?.nom_pere && (
                    <InfoRow icon={Users} label="Nom père" value={clientDetails?.nom_pere} />
                  )}
                  {clientDetails?.nom_mere && (
                    <InfoRow icon={Users} label="Nom mère" value={clientDetails?.nom_mere} />
                  )}
                  {clientDetails?.partenaire?.description && (
                    <InfoRow label="Partenaire" valueNode={<Badge variant="primary">{clientDetails?.partenaire?.description}</Badge>} />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section - Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50/50 px-2 pt-2">
                <div className="flex overflow-x-auto hide-scrollbar">
                  {filteredTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
                          flex items-center gap-2 px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                          ${isActive ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'}
                        `}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-white min-h-[500px]">
                {activeTab === 'encaissements' && (
                  <div className="animate-in fade-in duration-300">
                    <EncaissementTable dataClient_id={clientDetails} />
                  </div>
                )}

                {activeTab === 'reservations' && (
                  <div className="animate-in fade-in duration-300">
                    <ReservationTable dataClient={clientDetails} />
                  </div>
                )}

                {activeTab === 'historiques' && (
                  <div className="animate-in fade-in duration-300">
                    <HistoriquesTable
                      id={clientDetails?.prospect ? clientDetails?.prospect?.id : clientDetails?.id}
                      type={clientDetails?.prospect ? 'prospect' : 'client'}
                    />
                  </div>
                )}

                {activeTab === 'appels' && (
                  <div className="animate-in fade-in duration-300">
                    <JournalTable
                      id={clientDetails?.prospect?.appels?.id}
                      prospect={clientDetails?.prospect}
                      client={clientDetails}
                    />
                  </div>
                )}

                {activeTab === 'visites' && (
                  <div className="animate-in fade-in duration-300">
                    <VisiteTableShow dataProspect={null} dataClient={clientDetails} />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default ClientDetails;