'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import JournalTable from './JournalTable';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import {
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  User,
  Briefcase,
  MessageSquare,
  PhoneCall,
  Eye,
} from 'lucide-react';

// Reusable Components
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    primary: 'bg-cyan-50 text-cyan-700 border-cyan-200',
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

const AppelDetails = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const { appelId } = useParams();
  const accessToken = token || localStorage.getItem('accessToken');

  const [loading, setLoading] = useState(false);
  const [appelDetails, setAppelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('journaux');

  const handleViewProspect = (prosId) => {
    window.open(`/crm/prospects/${prosId}`, '_blank');
  };

  const tabs = [
    ...(appelDetails?.id != null
      ? [{ id: 'journaux', label: 'Journal des Appels', icon: PhoneCall }]
      : []),
  ];

  const { selectedSociete } = useSociete();
  const [oldProjetId, setOldProjetId] = useState(null);
  const [oldSocieteId, setOldSocieteId] = useState(null);

  useEffect(() => {
    if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId) || (selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
      if (oldProjetId || oldSocieteId) {
        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet?.id}`);
        router.push('/crm?tab=appels');
      }
      setOldSocieteId(selectedSociete?.id);
      setOldProjetId(selectedProjet?.id);
    }
  }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);

  useEffect(() => {
    if (appelId) {
      setLoading(true);
      axios
        .get(`${APIURL.APPELS}/${appelId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setAppelDetails(response.data.appel || {});
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [appelId, accessToken]);

  const handleTabClick = (tabId) => setActiveTab(tabId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  const prospect = appelDetails?.prospect || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header / Breadcrumb */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 text-sm text-slate-500">
            <a href={ENDPOINTS.CRM + '?tab=appels'} className="hover:text-cyan-600 transition-colors">
              CRM
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <a href={ENDPOINTS.CRM + '?tab=appels'} className="hover:text-cyan-600 transition-colors">
              Appels
            </a>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <span className="text-slate-900 font-medium">Détail appel</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-cyan-500 to-blue-600">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-white rounded-xl p-1 shadow-md">
                  <div className="w-full h-full bg-cyan-50 rounded-lg flex items-center justify-center text-2xl font-bold text-cyan-600">
                    {prospect.nom ? prospect.nom.charAt(0).toUpperCase() : 'P'}
                    {prospect.prenom ? prospect.prenom.charAt(0).toUpperCase() : ''}
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="primary">Appel #{appelDetails?.id || 'N/A'}</Badge>
              </div>
            </div>

            <div className="pt-14 pb-6 px-6 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900">
                {`${prospect.nom || ''} ${prospect.prenom || ''}`.trim() || 'Prospect sans nom'}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>CIN: {prospect.cin || 'Non renseigné'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50">
              <button
                onClick={() => handleViewProspect(prospect.id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 shadow-sm w-full"
              >
                <Eye className="w-4 h-4" />
                Voir le prospect
              </button>
            </div>
          </div>

          {/* Informations Prospect Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                Informations prospect
              </h2>
            </div>
            <div className="px-6 py-2">
              <InfoRow icon={Mail} label="Email" value={prospect.email} />
              <InfoRow icon={Phone} label="Téléphone 1" value={prospect.telephone} />
              {prospect.telephone_num2 && prospect.telephone_num2 !== 'null' && (
                <InfoRow icon={Phone} label="Téléphone 2" value={prospect.telephone_num2} />
              )}
              <InfoRow
                icon={MessageSquare}
                label="Contactable"
                valueNode={
                  <Badge variant={prospect.notifie === 1 ? 'success' : 'danger'}>
                    {prospect.notifie === 1 ? 'Oui' : 'Non'}
                  </Badge>
                }
              />
              <InfoRow label="Origine" valueNode={<Badge variant="default">{prospect.origin || 'Non spécifié'}</Badge>} />
              <InfoRow
                label="Source"
                valueNode={
                  <Badge variant="primary">
                    {prospect.partenaire_id != null
                      ? `Partenaire(${prospect.partenaire?.description || ''})`
                      : prospect.source?.source || 'Non spécifié'}
                  </Badge>
                }
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                      ${isActive ? 'border-cyan-600 text-cyan-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white min-h-[500px]">
            {activeTab === 'journaux' && appelDetails?.id && (
              <div className="animate-in fade-in duration-300">
                <JournalTable
                  id={appelDetails.id}
                  prospect={appelDetails.prospect}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppelDetails;