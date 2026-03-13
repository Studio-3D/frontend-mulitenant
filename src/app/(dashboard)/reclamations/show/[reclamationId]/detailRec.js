'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Paperclip,
  Tag,
  Building,
  ChevronLeft,
  Download,
  Copy,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  UserCircle,
  Briefcase,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import LoadingSpin from '@/components/LoadingSpin';
import PieceJointeViewer from '@/components/PieceJointeViewer';
import { APIURL, ENDPOINTS, RESOURCE_URL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineItem({
  date,
  title,
  description,
  isLast = false,
  icon: Icon,
}) {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div
          className={`w-3 h-3 rounded-full flex items-center justify-center ${
            Icon ? 'bg-blue-100' : 'bg-blue-500'
          }`}
        >
          {Icon && <Icon className="w-2 h-2 text-blue-600" />}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{date}</p>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

function getStatusConfig(statut) {
  const configs = {
    0: {
      label: 'En Attente',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Clock,
    },
    1: {
      label: 'En Cours',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: Clock,
    },
    2: {
      label: 'Traité',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: CheckCircle,
    },
    3: {
      label: 'Non Traité',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
    },
  };
  return (
    configs[statut] || {
      label: 'Inconnu',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: AlertCircle,
    }
  );
}

function StatutBadge({ statut }) {
  const config = getStatusConfig(statut);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bg} ${config.border} ${config.color}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-semibold text-sm">{config.label}</span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
  copyable = false,
  isLink = false,
  href = '',
  isEmail = false,
  isPhone = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value && copyable) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let content = value || '-';

  if (isLink && href && value) {
    content = (
      <Link
        href={href}
        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  } else if (isEmail && value) {
    content = (
      <a
        href={`mailto:${value}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {value}
      </a>
    );
  } else if (isPhone && value) {
    content = (
      <a
        href={`tel:${value}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {value}
      </a>
    );
  }

  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-gray-50 rounded-lg">
            <Icon className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-gray-900 font-medium mt-1">{content}</p>
        </div>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Copier"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
}

function ClientTag({
  clientId,
  clientNom,
  clientPrenom,
  clientEmail,
  clientPhone,
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold uppercase">
        {clientNom?.[0] || 'C'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">
            {clientNom} {clientPrenom}
          </h4>
          {clientId && (
            <Link
              href={`/ventes/clients/${clientId}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              Voir profil
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
          {clientEmail && (
            <a
              href={`mailto:${clientEmail}`}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <Mail className="w-3 h-3" />
              {clientEmail}
            </a>
          )}
          {clientPhone && (
            <a
              href={`tel:${clientPhone}`}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <Phone className="w-3 h-3" />
              {clientPhone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReclamationFullPage({ reclamationId }) {
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [oldProjetId, setOldProjetId] = useState(null);
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const { selectedSociete } = useSociete();
  const accessToken = token || localStorage.getItem('accessToken');

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
      //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.back();
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  useEffect(() => {
    if (reclamationId) {
      setLoading(true);
      axios
        .get(`${APIURL.ReclamationsClient}/${reclamationId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setDetails(response.data.reclamation);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [reclamationId, accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <LoadingSpin />
        </div>
      </div>
    );
  }

  if (!Details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Réclamation non trouvée
            </h2>
            <p className="text-gray-600 mb-6">
              La réclamation que vous recherchez n{"'"}existe pas ou n{"'"}est
              plus accessible.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Construire les données pour la timeline
  const timelineItems = [
    {
      date: formatDate(Details.created_at),
      title: 'Réclamation créée',
      icon: Tag,
    },
    {
      date: formatDate(Details.date_traitement),
      title: 'Début du traitement',
      description: `Traité par: ${Details.users_traite_nom} ${Details.users_traite_prenom}`,
      icon: UserCircle,
    },

    ...(Details.date_fin_traitement
      ? [
          {
            date: formatDate(Details.date_fin_traitement),
            title: 'Fin du traitement',
            isLast: true,
            icon: CheckCircle,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div
        className="flex items-center justify-start"
        style={{ marginBottom: '8px' }}
      >
        <BreadCrumb
          baseUrl={ENDPOINTS.ReclamationsClients}
          step={`Réclamtions Client`}
        />
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Détail Réclamation
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Détails complets de la réclamation
                </p>
              </div>
            </div>
            <StatutBadge statut={Details.etat} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client Tag avec lien */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Client
                </h3>
                <ClientTag
                  clientId={Details.client_id}
                  clientNom={Details.client_nom}
                  clientPrenom={Details.client_prenom}
                  clientEmail={Details.client_email}
                  clientPhone={Details.client_telephone}
                />
              </div>
            </div>

            {/* Service Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold uppercase">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      Service: {Details.nom_service || 'Non spécifié'}
                    </h2>
                    <div className="mt-2">
                      {Details.code_reservation && (
                        <Link
                          href={`/ventes/reservations/${Details.dossier_id}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Tag className="w-4 h-4" />
                          Code réservation: {Details.code_reservation}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <DetailRow
                    label="Traité par"
                    value={`${Details.users_traite_nom} ${Details.users_traite_prenom}`}
                    icon={User}
                  />
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Contenu de la réclamation
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Objet
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 font-medium">
                        {Details.objet || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Dossier
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {Details.code_reservation}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Message
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {Details.message || 'Aucun message'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Timeline améliorée */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Historique & Traitement
              </h3>
              <div className="space-y-1">
                {timelineItems
                  .filter((item) => item.date && item.date !== '-')
                  .map((item, index) => (
                    <TimelineItem
                      key={index}
                      date={item.date}
                      title={item.title}
                      description={item.description}
                      isLast={item.isLast || index === timelineItems.length - 1}
                      icon={item.icon}
                    />
                  ))}
              </div>

              {/* Commentaire commercial dans la timeline */}
              {Details.commentaire && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      Commentaire commercial
                    </h4>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-blue-800">
                        Code réservation:{' '}
                      </span>
                      <span className="text-sm text-blue-700">
                        {Details.code_reservation || 'Non spécifié'}
                      </span>
                    </div>
                    <p className="text-blue-800 whitespace-pre-line leading-relaxed text-sm">
                      {Details.commentaire}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {Details.piece_jointe && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                      Pièces jointes
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <PieceJointeViewer
                      url={`${RESOURCE_URL.DOCS}/${
                        selectedSociete?.raison_sociale_concatene || 'default'
                      }_${selectedSociete?.id || 0}/reclamations/${
                        Details.piece_jointe
                      }`}
                      filename={Details.piece_jointe}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
