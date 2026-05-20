'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Button from '@/components/Button';
import HistoriquesTable from './HistoriquesTable';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import Modal from '@/components/Modal';
import SelectInput from '@/components/SelectInput';
import { useProjet } from '@/context/ProjetContext';
import VisiteTable from '../../visites/VisiteTable';
import { format } from 'date-fns';
import JournalTable from '../../appels/[appelId]/JournalTable';
import Modal_Traite from '../Modal_Traite';
import { isAdmin, isAgentAdministratif, isCommercial, isRespoCommercial, isSuperAdmin } from '@/configs/enum';
import { useSociete } from '@/context/SocieteContext';
import VisiteTableShow from './VisitesTableShow';
import {
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  User,
  CheckCircle2,
  Briefcase,
  Clock,
  MessageSquare,
  MapPin,
  History,
  PhoneCall,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Printer, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
// Reusable Components from template
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
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

//import { PDFDownloadLink } from '@react-pdf/renderer';
//import ProspectPDF from './ProspectPdf';
const ProspectDetails = () => {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [appels, setAppels] = useState([]);
  const [visiteDetails, setVisiteDetails] = useState([]);
  const [refreshHistoriques, setRefreshHistoriques] = useState(0);
  const { user, token } = useAuth();
  const router = useRouter();
  const { prospectId } = useParams();
  const accessToken = token || localStorage.getItem('accessToken');
  const { projets, selectedProjet } = useProjet();
  const [showProjetModal, setShowProjetModal] = useState(false);
  const [selectedProjetId, setSelectedProjetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [prospectDetails, setProspectDetails] = useState({});
  const [activeTab, setActiveTab] = useState('historiques');
  const [open_traite, setOpen_traite] = useState(false);
  const [traite_id, setId_traite] = useState(null);
  const [num_tel, setTel_num] = useState(null);
  const [nom_prenom, setNomPrenom] = useState(null);

  const handleraiter = (Id, num_tel, nom_prenom) => {
    setOpen_traite(!open_traite);
    setId_traite(Id);
    setTel_num(num_tel);
    setNomPrenom(nom_prenom);
  };

  const handleTraiteSuccess = () => {
    setOpen_traite(false);
    setRefreshHistoriques((prev) => prev + 1);
  };

  const handleTraiteClose = () => {
    setOpen_traite(false);
  };

  const handleEdit = (id) => {
    router.push(`${ENDPOINTS.PROSPECTS}?id=${id}&action=edit`);
  };

  const handleShowClient = (id) => {
    router.push(`/ventes/clients/${id}`);
  };

  useEffect(() => {
    if (
      !isAdmin(user?.role) &&
      !isSuperAdmin(user?.role) &&
      !isCommercial(user?.role) &&
      !isRespoCommercial(user?.role)&&
      !isAgentAdministratif(user?.role)
    ) {
      router.push('/');
    }
  }, [user?.role, router]);

  const tabs = [
    ...(prospectDetails?.id != null
      ? [{ id: 'historiques', label: 'Historiques', icon: History }]
      : []),
    { id: 'visites', label: 'Visites', icon: MapPin },
    { id: 'journaux', label: 'Journal des Appels', icon: PhoneCall },
  ];

  const { selectedSociete } = useSociete();
  const [oldProjetId, setOldProjetId] = useState(null);
  const [oldSocieteId, setOldSocieteId] = useState(null);

  useEffect(() => {
    if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId) || (selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
      if (oldProjetId || oldSocieteId) {
        router.push('/crm');
      }
      setOldSocieteId(selectedSociete?.id);
      setOldProjetId(selectedProjet?.id);
    }
  }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);

  useEffect(() => {
    if (prospectId) {
      setLoading(true);
      axios
        .get(`${APIURL.PROSPECTS}/${prospectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setProspectDetails(response.data.prospect);
          setAppels(response.data.appels);
          setVisiteDetails(response.data.visites);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [prospectId, accessToken]);

  useEffect(() => {
    if (
      prospectDetails &&
      prospectDetails.origin === 'whatsapp' &&
      !prospectDetails.projet_id
    ) {
      setShowProjetModal(true);
    }
  }, [prospectDetails]);

  const handleAssignProjet = async () => {
    if (!selectedProjetId) return;
    try {
      await axios.put(
        `${APIURL.PROSPECTS}/${prospectDetails.id}`,
        {
          projet_id: selectedProjetId,
          telephone: prospectDetails?.telephone,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setProspectDetails({ ...prospectDetails, projet_id: selectedProjetId });
      setShowProjetModal(false);
    } catch (e) {
      console.error('Erreur lors de la mise à jour du projet du prospect', e);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Add this function before the return statement
const handleDownloadProspectPDF = async () => {
  try {
    setLoadingPdf(true);
    
    // Prepare the data to send to backend
    const pdfData = {
      prospect: prospectDetails,
      appels: appels || [],
      visites: visiteDetails || [],
      user: {
        ...user,
        societe: user?.societe || {}
      },
      currentDate: new Date().toISOString(),
    };

    const response = await axios.post(
       `${apiUrl}/generate-prospect-pdf`,
      { data: pdfData },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fiche_prospect_${prospectDetails?.nom || ''}_${prospectDetails?.prenom || ''}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('PDF généré avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération du PDF');
  } finally {
    setLoadingPdf(false);
  }
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
                <a href={ENDPOINTS.CRM + '?tab=prospects'} className="hover:text-indigo-600 transition-colors">
                  CRM
                </a>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <a href={ENDPOINTS.CRM + '?tab=prospects'} className="hover:text-indigo-600 transition-colors">
                  Prospects
                </a>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <span className="text-slate-900 font-medium">Détail prospect</span>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Top Section - Prospect Info Cards in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header with Avatar */}
                <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white rounded-xl p-1 shadow-md">
                      <div className="w-full h-full bg-indigo-50 rounded-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                        {prospectDetails.nom ? prospectDetails.nom.charAt(0).toUpperCase() : 'P'}
                        {prospectDetails.prenom ? prospectDetails.prenom.charAt(0).toUpperCase() : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-14 pb-6 px-6 border-b border-slate-100">
                  <h1 className="text-xl font-bold text-slate-900">
                    {(prospectDetails?.nom || '') + ' ' + (prospectDetails?.prenom || '')}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <User className="w-4 h-4" />
                    <span>CIN: {prospectDetails?.cin || 'Non renseigné'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
                
                  {(isAdmin(user?.role) || prospectDetails?.commercial_affecte?.user_id_origin == user?.id) && (
                    <button
                      onClick={() => handleraiter(prospectDetails?.id, prospectDetails?.telephone, (prospectDetails?.nom || '') + ' ' + (prospectDetails?.prenom || ''))}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm w-full"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Traiter le prospect
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {prospectDetails?.client_id != null && (
                      <button
                        onClick={() => handleShowClient(prospectDetails?.client_id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voir Client
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(prospectDetails?.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                      <button
                        onClick={handleDownloadProspectPDF}
                        disabled={loadingPdf}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm"
                      >
                        {loadingPdf ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Printer className="w-4 h-4" />
                            Imprimer
                          </>
                        )}
                      </button>
                    {/*<PDFDownloadLink
                        document={
                          <ProspectPDF
                            prospect={prospectDetails}
                            appels={appels || []}
                            visites={visiteDetails || []}
                            user={user}
                          />
                        }
                        fileName={`fiche Prospect prospect_${prospectDetails?.nom+''+prospectDetails?.prenom  || 'details'}.pdf`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm"
                      >
                        {({ loading }) => (
                          <>
                            <Printer className="w-4 h-4" />
                            {loading ? 'Préparation...' : 'Imprimer'}
                          </>
                        )}
                      </PDFDownloadLink>*/}
                  </div>
                </div>
              </div>

              {/* Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    Informations générales
                  </h2>
                </div>

                <div className="px-6 py-2 max-h-[400px] overflow-y-auto">
                  <InfoRow icon={Mail} label="Email" value={prospectDetails?.email} />
                  <InfoRow icon={Phone} label="Téléphone 1" value={prospectDetails?.telephone} />
                  {prospectDetails?.telephone_num2 && prospectDetails.telephone_num2 !== 'null' && (
                    <InfoRow icon={Phone} label="Téléphone 2" value={prospectDetails.telephone_num2} />
                  )}
                  <InfoRow
                    
                    label="Accepte d'être contacté:"
                    valueNode={
                      <Badge variant={prospectDetails?.notifie === 1 ? 'success' : 'danger'}>
                        {prospectDetails?.notifie === 1 ? 'Oui' : 'Non'}
                      </Badge>
                    }
                  />
                  <InfoRow
                    label="Origine"
                    valueNode={<Badge variant="default">{prospectDetails?.origin || 'Non spécifié'}</Badge>}
                  />
                  <InfoRow
                    label="Source"
                    valueNode={
                      <Badge variant="primary">
                        {prospectDetails?.partenaire_id !== null
                          ? `Partenaire(${prospectDetails?.partenaire?.description})`
                          : prospectDetails?.source?.source || 'Non spécifié'}
                      </Badge>
                    }
                  />
                </div>
              </div>

              {/* Tracking Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                 Affectation
                  </h2>
                </div>

                <div className="px-6 py-2 max-h-[400px] overflow-y-auto">
                  {prospectDetails?.affecte_par_admin && (
                    <InfoRow
                      label="Affecté par"
                      value={`${prospectDetails.affecte_par_admin.name || ''} ${prospectDetails.affecte_par_admin.prenom || ''}`}
                    />
                  )}
                  {prospectDetails?.date_affectation && (
                    <InfoRow
                      icon={Calendar}
                      label="Date affectation"
                      value={formatDate(prospectDetails.date_affectation)}
                    />
                  )}
                 
                </div>

                {prospectDetails?.message && (
                  <div className="px-6 py-4 bg-amber-50/50 border-t border-amber-100">
                    <p className="text-xs font-medium text-amber-800 mb-1">Message initial</p>
                    <p className="text-sm text-amber-900/80 leading-relaxed">
                      {prospectDetails.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Tabs Navigation */}
              <div className="border-b border-slate-200 bg-slate-50/50 px-2 pt-2">
                <div className="flex overflow-x-auto hide-scrollbar">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
                          flex items-center gap-2 px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                          ${isActive ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'}
                        `}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="p-6 bg-white min-h-[500px]">
                {activeTab === 'historiques' && prospectDetails?.id && (
                  <div className="animate-in fade-in duration-300">
                    <HistoriquesTable
                      id={prospectDetails.id}
                      refreshTrigger={refreshHistoriques}
                      type={'prospect'}
                    />
                  </div>
                )}

                {activeTab === 'visites' && (
                  <div className="animate-in fade-in duration-300">
                    <VisiteTableShow dataProspect={prospectDetails} show_prospect={true} />
                  </div>
                )}

                {activeTab === 'journaux' && (
                  <div className="animate-in fade-in duration-300">
                    <JournalTable id={prospectDetails?.appels?.id} prospect={prospectDetails} />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      {showProjetModal && (
        <Modal isVisible={true} onClose={() => setShowProjetModal(false)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Assigner un projet au prospect</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ce prospect provient de WhatsApp mais plusieurs configurations partagent le même projet. Veuillez choisir le projet auquel {"l'"}assigner.
            </p>
            <div className="mb-4">
              <SelectInput
                label="Projet"
                options={(projets || []).map((p) => ({
                  label: p.nom,
                  value: p.id,
                }))}
                value={selectedProjetId}
                onChange={(val) => setSelectedProjetId(val)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowProjetModal(false)}>
                Annuler
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white"
                onClick={handleAssignProjet}
                disabled={!selectedProjetId}
              >
                Assigner
              </button>
            </div>
          </div>
        </Modal>
      )}

      {open_traite && (
        <Modal isVisible={true} onClose={handleTraiteClose}>
          <Modal_Traite
            nom_prenom={nom_prenom}
            num_tel={num_tel}
            id={traite_id}
            from_prospect_show={true}
            onClose={handleTraiteClose}
            onSuccess={handleTraiteSuccess}
          />
        </Modal>
      )}
    </>
  );
};

export default ProspectDetails;