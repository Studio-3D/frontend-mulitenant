'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Home,
  Wrench,
  Calendar,
  CheckCircle,
  AlertCircle,
  Paperclip,
  User,
  ArrowLeft,
  Edit,
} from 'lucide-react';
import { APIURL, ENDPOINTS, RESOURCE_URL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpin from '@/components/LoadingSpin';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import PieceJointeViewer from '@/components/PieceJointeViewer';
import { useProjet } from '@/context/ProjetContext';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
}

function getStatutBadge(statut) {
  switch (statut) {
    case 1:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          En Attente
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          En Cours
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Résolu
        </span>
      );
    case 4:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Non Résolu
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inconnu
        </span>
      );
  }
}

export default function ViewReclamationFullPage({ reclamationId }) {
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { selectedProjet } = useProjet();

  const getFileUrl = (fichier) => {
    return `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/reclamations/${fichier}`;
  };

  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.back('');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  useEffect(() => {
    if (!reclamationId) return;
    setLoading(true);
    axios
      .get(`${APIURL.ReclamationsSav}/${reclamationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => setDetails(res.data.reclamation))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [reclamationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <LoadingSpin />
      </div>
    );
  }

  if (!Details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">
            Réclamation introuvable ou erreur de chargement.
          </h2>
        </div>
      </div>
    );
  }

  const { bien, client, prestataire, service } = Details;
  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      {/* Header with title and back button */}
      <div className="mb-8">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.ReclamationsSav}
            step={`Détail Réclamation`}
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Main info */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          {/* Client info */}
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {client?.nom?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-800">
                {client?.nom} {client?.prenom}
              </h2>
              <p className="text-pink-600 font-semibold">
                {client?.email || client?.telephone_num1 || '-'}
              </p>
              <div className="mt-2">{getStatutBadge(Details.statut)}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Property info */}
          <div className="space-y-4">
            <div className="flex items-start">
              <Home className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Bien</p>
                <p className="font-semibold text-gray-800">
                  {NomBienComplet(bien)}
                 
                </p>
              </div>
            </div>

            {/* Prestataire */}
            <div className="flex items-start">
              <Wrench className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Prestataire</p>
                <p className="font-semibold text-gray-800">
                  {prestataire?.civilite || '-'} {prestataire?.nom || '-'}{' '}
                  {prestataire?.prenom || '-'}
                </p>
                {prestataire?.telephone && (
                  <p className="text-sm text-gray-600">
                    {prestataire.telephone}
                  </p>
                )}
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start">
              <Wrench className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-semibold text-gray-800">
                  {service?.nom || '-'}
                </p>
              </div>
            </div>

            {/* Emplacements */}
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Emplacement(s)</p>
                <p className="font-semibold text-gray-800">
                  {Details.emplacements || '-'}
                </p>
              </div>
            </div>

            {/* Problèmes */}
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Problème(s)</p>
                <p className="font-semibold text-gray-800">
                  {Details.problemes || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Pièces jointes */}
          <div className="mt-8">
            <PieceJointeViewer Details={Details} getFileUrl={getFileUrl} />
          </div>
        </div>

        {/* Right column - Dates & Comments */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h3 className="text-xl font-bold text-blue-600 mb-6">
            Dates & Commentaires
          </h3>

          <div className="space-y-6">
            {/* Dates */}
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Date réclamation</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(Details.date_reclamation)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Date intervention</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(Details.date_intervention)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Date fin intervention</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(Details.date_fin_intervention)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Commentaires */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Commentaire traitement
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {Details.commentaires || '-'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Commentaire Résolution
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {Details.commentaire_trait || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {Details.statut == 1 && (
        <div className="mt-8 flex justify-center space-x-4">
          <Button type="button" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Button
            type="submit"
            onClick={() => {
              router.push(
                `${ENDPOINTS.ReclamationsSav}?id=${reclamationId}&action=edit`
              );
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      )}
    </div>
  );
}
