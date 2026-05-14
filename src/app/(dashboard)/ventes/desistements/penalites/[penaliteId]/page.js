'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import format from 'date-fns/format';
import { useAuth } from '../../../../../../context/AuthContext';
import { APIURL, RESOURCE_URL } from '../../../../../../configs/api';
import {
  MODE_PAIEMENT,
  getModePenaliteLabel,
  isAdmin,
  isCommercial,
  isComptable,
  isRespoCommercial,
  isSuperAdmin,
  modes_penalites,
  type_dst,
  type_dst_dp,
} from '@/configs/enum';
import toast from 'react-hot-toast';

import { AlertCircle, Printer, X } from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import Button from '@/components/Button'; // Import the component
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import Modal from '@/components/Modal'; // Import your custom modal component
import { useForm, Controller } from 'react-hook-form';
import CorrectionForm from './CorrectionForm';

import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocuPenaliteDesistementDocumentment from '../recu';

const STATUS_BADGES = {
  0: { text: 'Attente Validation', color: 'bg-yellow-100 text-yellow-800' },
  1: { text: 'Validé', color: 'bg-green-100 text-green-800' },
  2: { text: 'Rejeté', color: 'bg-red-100 text-red-800' },
};

const ShowPenalite = () => {
  const { selectedProjet } = useProjet();
  const { user, token } = useAuth();
  const params = useParams();
  const penaliteId = params.penaliteId;
  const accessToken = token || localStorage.getItem('accessToken');
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errors, setErrors] = useState(null);
  const [penalite, setPenalite] = useState(null);
  const [banques, setBanques] = useState([]);
  const [histo, setHisto] = useState(false);

  const [sumAvancesValides, setSumAvancesValides] = useState(0);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState({
    action: '',
    comment: '',
    remiseNumber: '',
    encaissementDate: '',
  });
     const userRole = user?.role;
        useEffect(() => {
          if (
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole)&&
            !isComptable(userRole)&&
                  !isRespoCommercial(userRole)
          ) {
            router.push('/');
          }
        }, [router]);
        
  // Simple cache et comparaison for return back en cas de changer projet
   const { selectedSociete } = useSociete();
      const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
  
     useEffect(() => {
  if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldProjetId||oldSocieteId) {
      // Projet ou société a changé
      //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet?.id}`);
        router.back();
    }
    setOldSocieteId(selectedSociete?.id)
    setOldProjetId(selectedProjet?.id);
  }
}, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [penaliteRes, banquesRes] = await Promise.all([
        axios.get(`${APIURL.ROOTV1}/show_penalite/${penaliteId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${APIURL.ROOTV1}/banques`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      setPenalite(penaliteRes.data.penalite);
      setSumAvancesValides(penaliteRes.data.sum_avances_valides);
      setBanques(banquesRes.data.banques);

      if (penaliteRes.data.histo > 1) {
        setHisto(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrors({ message: 'Failed to load penalty data' });
    } finally {
      setLoading(false);
    }
  }, [penaliteId, accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log('Validation data updated:', validationData);
  }, [validationData]);
  const fetchHistory = useCallback(async () => {
    setOpenHistory(true);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/get_historiques_penalites/${penalite.desistement_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setHistoryData(response.data.penalites);
    } catch (error) {
      console.error('Error fetching history:', error);
      setErrors({ message: 'Failed to load history data' });
    }
  }, [penalite?.desistement_id, accessToken]);

  const handleValidationSubmit = async (data) => {
    try {
      await axios.put(
        `${APIURL.ROOTV1}/traiter_penalite/${penaliteId}`,
        {
          commentaire: data.comment,
          date_encaiss: data.encaissementDate,
          n_remise: data.remiseNumber,
          etat: data.action,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

     // await fetchData(); // Refresh data
      router.push('/ventes?tab=validation&subtab=penalites-validation')
      toast.success('Action Traité avec Succés');

      setOpenValidationDialog(false);
    } catch (error) {
      setErrors(
        error.response?.data?.errors || { message: 'An error occurred' }
      );
      throw error; // This will be caught in the ValidationModal's handleFormSubmit
    }
  };

  const handleCorrectionSubmit = async (data) => {
    setLoadingSave(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Append all non-file fields
      formData.append('penalite_id', penaliteId);
      formData.append('desistement_id', penalite.desistement_id);
      formData.append('sr_pen', data.sr_pen);
      formData.append('penalite_par', data.penalite_par);
      formData.append('mode_penalite', data.mode_penalite);
      formData.append('penalite_montant', data.penalite_montant);
      formData.append('mode_paiement_pen', data.mode_paiement_pen);
      formData.append('banque_id_pen', data.banque_pen);
      formData.append('numero_paiement_pen', data.numero_paiement_pen);
      formData.append('echeance_pen', data.echeance_pen);

      // Append files correctly
      if (data.files && data.files.length > 0) {
        data.files.forEach((file, index) => {
          // For new files (File objects)
          if (file instanceof File || file.file) {
            formData.append(`files_penalite[${index}]`, file.file || file);
          }
          // For existing files (if you need to keep them)
          else if (file.fichier) {
            formData.append(`files_penalite[${index}]`, file.fichier);
          }
        });
      }

      const response = await axios.post(
        `${APIURL.ROOTV1}/penalites/corriger_penalite`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      );

      // Redirect after successful submission
      router.push('/ventes?tab=validation&subtab=penalites-validation');

      // Show success message
      toast.success('Action corrigé avec succès');
      setLoadingSave(false);
    } catch (error) {
      setLoadingSave(false);
      setErrors(
        error.response?.data?.errors || { message: 'An error occurred' }
      );
      throw error; // This allows the form to handle the error
    }
  };

  const getBanqueName = (id) => banques.find((b) => b.id == id)?.nom || '';

  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        STATUS_BADGES[status]?.color || 'bg-gray-100 text-gray-800'
      }`}
    >
      {STATUS_BADGES[status]?.text || 'Unknown'}
    </span>
  );

  const getTypeLabel = () => {
    const type = penalite.desistement.type;

    if (type == 1 || type == 3) {
      return type_dst[type]?.label || '';
    } else if (type == 2) {
      const dpType = penalite.desistement.type_dp;
      return type_dst_dp[dpType]?.label || '';
    }

    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpin />
      </div>
    );
  }

  if (!penalite) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Penalty data not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Error Alert */}
      {errors && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                {Object.values(errors).map((error, index) => (
                  <p key={index}>{Array.isArray(error) ? error[0] : error}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <BreadCrumb
          baseUrl={'/ventes?tab=penalites'}
          step={`Détail pénalité`}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Desistement Info */}
        {/* Left Side - Desistement Info */}
<div className="bg-white rounded-lg shadow p-6">
  <h2
    className="text-lg font-semibold mb-4 border-b pb-2"
    style={{ color: 'rgb(102, 108, 255)' }}
  >
    Détail Désistement
  </h2>

  <div className="space-y-4">
    <InfoRow
      label="Date"
      value={format(new Date(penalite.created_at), 'dd/MM/yyyy')}
    />
    <InfoRow label="Type" value={'Désistement ' + getTypeLabel()} />
    <InfoRow
      label="Code Réservation"
      value={penalite.desistement.reservation_ancien.code_reservation}
    />
    <InfoRow
      label="Prix"
      value={`${penalite.desistement.reservation_ancien.prix?.toLocaleString()} DH`}
      highlight
    />
    <InfoRow
      label="Avances"
      value={`${sumAvancesValides?.toLocaleString()} DH`}
      highlight2
    />
    <InfoRow
      label="Responsable"
      value={`${penalite.desistement.user.name} ${penalite.desistement.user.prenom}`}
    />


    {/* Buttons in same row */}
    <div className="flex flex-row gap-3 mt-4">
      <button
        onClick={() =>
          window.open(
            `/ventes/desistements/show/${penalite.desistement_id}`,
            '_blank'
          )
        }
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
      >
        View Dossier
      </button>
    {penalite.sr == 0 && (

        <PDFDownloadLink
          document={
            <DocuPenaliteDesistementDocumentment
              data={[
                penalite.desistement.reservation_ancien?.code_reservation,
                penalite.num_recu,
                penalite.montant,
                penalite.mode_paiement,
                penalite.numero_paiement,
                penalite.desistement.reservation_ancien?.bien,
                penalite.desistement.user.name,
                penalite.desistement.user.prenom,
                penalite.desistement.reservation_ancien?.aquereurs_ancien?.map(
                  (aq, i, arr) => {
                    return aq.client.cin +
                      '  ' +
                      aq.client.nom +
                      ' ' +
                      aq.client.prenom +
                      (arr.length - 1 === i ? '' : ' et ');
                  }
                ),
              ]}
            />
          }
          fileName={`recu_penalite_${penalite.id}.pdf`}
        >
          {({ loading, error }) => {
            if (error) {
              console.error('PDF generation error:', error);
              return (
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"
                >
                  <Printer className="w-4 h-4" />
                  Erreur PDF
                </button>
              );
            }
            
            return (
              <button
                type="button"
                disabled={loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-emerald-500 shadow-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Printer className="w-4 h-4" />
                {loading ? 'Préparation...' : 'Télécharger Reçu'}
              </button>
            );
          }}
        </PDFDownloadLink>
      )}
      </div>
  </div>
</div>

        {/* Right Side - Penalty Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2
              className="text-lg font-semibold "
              style={{ color: 'rgb(102, 108, 255)' }}
            >
              {penalite.statut == 2 ? 'Corriger Pénalité' : 'Détail  Pénalité'}
            </h2>
            {histo && (
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Historiques
              </button>
            )}
          </div>

          {penalite.statut == 2 ? (
            <CorrectionForm
              penalite={penalite}
              setPenalite={setPenalite}
              banques={banques}
              loadingSave={loadingSave}
              onSubmit={handleCorrectionSubmit}
              onCancel={() => router.back()}
              sumAvances={sumAvancesValides}
              prix={penalite?.desistement?.reservation_ancien?.prix}
              user={user}
              codeRes={
                penalite?.desistement?.reservation_ancien?.code_reservation
              }
            />
          ) : (
            <PenaltyDetails
              penalite={penalite}
              banques={banques}
              getBanqueName={getBanqueName}
              user={user}
              onProcess={() => setOpenValidationDialog(true)}
            />
          )}
        </div>
      </div>

      {/* History Modal */}
      <HistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        historyData={historyData}
        getBanqueName={getBanqueName}
        getStatusBadge={getStatusBadge}
      />

      {/* Validation Modal */}
      <ValidationModal
        open={openValidationDialog}
        onClose={() => setOpenValidationDialog(false)}
        validationData={validationData}
        setValidationData={setValidationData}
        onSubmit={handleValidationSubmit}
      />
    </div>
  );
};

// Sub-components
const InfoRow = ({ label, value, highlight = false, highlight2 = false }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span
      className={
        highlight
          ? 'font-medium text-blue-500'
          : highlight2
          ? 'font-medium text-green-500'
          : 'font-medium text-black'
      }
    >
      {value}
    </span>
  </div>
);

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const iconClass = 'w-5 h-5 flex-shrink-0 text-gray-400';

  switch (extension) {
    case 'pdf':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'jpg':
    case 'jpeg':
    case 'png':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'doc':
    case 'docx':
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
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const PenaltyDetails = ({
  penalite,
  banques,
  getBanqueName,
  user,
  onProcess,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InfoDetail
        label="Pénalité par:"
        value={penalite.penalite_par == 'prix' ? 'Prix' : 'Avance'}
      />
      <InfoDetail
        label="Mode Penalité"
        value={getModePenaliteLabel(penalite.mode_penalite)}
      />
      <InfoDetail
        label="Pénalité Montant:"
        value={`${penalite.montant.toLocaleString()} DH`}
        highlight
      />
    </div>

    <div className="border-t pt-4">
      <h3 className="text-md font-medium mb-4 bg-purple-100 text-purple-800 px-4 py-2 rounded">
        Mode Paiement Pénalité
      </h3>

      <div className="flex items-center mb-4">
        <span className="text-sm font-medium text-gray-500 mr-2">SR:</span>
        <span className="font-medium text-black-500">
          {penalite.sr==0 ? 'Non' : 'Oui'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoDetail
          label="Modalité de Paiement :
"
          value={MODE_PAIEMENT[penalite.mode_paiement]?.label || ''}
        />

        {penalite.mode_paiement != 1 && (
          <>
            <InfoDetail
              label="Banque :"
              value={getBanqueName(penalite.banque_id)}
            />
            <InfoDetail
              label="N° de Paiement :"
              value={penalite.numero_paiement || ''}
            />
          </>
        )}

        {penalite.mode_paiement != 1 &&
          penalite.mode_paiement != 5 &&
          penalite.mode_paiement != 6 && (
            <InfoDetail
              label="Echéance :
"
              value={
                penalite.echeance
                  ? format(new Date(penalite.echeance), 'dd/MM/yyyy')
                  : ''
              }
            />
          )}
      </div>

      {penalite.piece_jointes?.length > 0 && (
        <div className="mt-3 border-t border-gray-00 pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Fichiers joints ({penalite.piece_jointes.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3">
            {penalite.piece_jointes.map((file, index) => (
              <div
                key={index}
                className="flex flex-col p-3 bg-white rounded-md border border-gray-200"
              >
                <div className="flex items-center mb-2">
                  {getFileIcon(file.fichier)}
                  <a
                    href={`${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/penalites/${penalite.desistement.reservation_ancien.code_reservation}/${file.fichier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate"
                  >
                    {file.fichier.split('/').pop()}
                  </a>
                </div>
                <span className="text-xs text-gray-500 mt-auto">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {penalite.statut == 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-gray-00">
          <InfoDetail
            label="N° Remise"
            value={penalite.last_statut?.num_remise || ''}
          />
          <InfoDetail
            label="Date Encaissement"
            value={
              penalite.last_statut?.date_encaissement
                ? format(
                    new Date(penalite.last_statut.date_encaissement),
                    'dd/MM/yyyy'
                  )
                : ''
            }
          />
        </div>
      )}
    </div>

    {penalite.statut == 0 && (user?.role <= 2 ||user?.role==7) && (
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          onClick={onProcess}
          //  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Traiter
        </Button>
      </div>
    )}
  </div>
);

const InfoDetail = ({ label, value, highlight = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    <p className={`text-gray-900 font-medium`}>{value}</p>
  </div>
);

const HistoryModal = ({
  open,
  onClose,
  historyData,
  getBanqueName,
  getStatusBadge,
}) => (
  <Modal_l
    open={open}
    onClose={onClose}
    title="Historique des Pénalités"
    size="max-w-6xl"
  >
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white-200">
        <thead className="bg-black text-white-500">
          <tr className="text-white">
            <TableHeader>Date</TableHeader>
            <TableHeader>N° Reçu</TableHeader>
            <TableHeader>Responsable</TableHeader>
            <TableHeader>Montant</TableHeader>
            <TableHeader>Mode de Paiement</TableHeader>
            <TableHeader>Banque</TableHeader>
            <TableHeader>N° Paiement</TableHeader>
            <TableHeader>date Echéance</TableHeader>
            <TableHeader>Statut</TableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-black-200">
          {historyData.map((item) => (
            <tr key={item.id}>
              <TableCell>
                {format(new Date(item.created_at), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{item.num_recu}</TableCell>
              <TableCell>{`${item.desistement.user.name} ${item.desistement.user.prenom}`}</TableCell>
              <TableCell>{item.montant}</TableCell>
              <TableCell>
                {MODE_PAIEMENT[item.mode_paiement]?.label || ''}
              </TableCell>
              <TableCell>{getBanqueName(item.banque_id)}</TableCell>
              <TableCell>{item.numero_paiement}</TableCell>
              <TableCell>
                {item.echeance
                  ? format(new Date(item.echeance), 'dd/MM/yyyy')
                  : ''}
              </TableCell>
              <TableCell>{getStatusBadge(item.statut)}</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Modal_l>
);
const ValidationModal = ({
  open,
  onClose,
  validationData,
  setValidationData,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      action: '',
      comment: '',
      remiseNumber: '',
      encaissementDate: '',
    },
  });

  useEffect(() => {
    reset({
      action: validationData.action || '',
      comment: validationData.comment || '',
      remiseNumber: validationData.remiseNumber || '',
      encaissementDate: validationData.encaissementDate || '',
    });
  }, [open, validationData, reset]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      setValidationData(data);
      await onSubmit(data);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isVisible={open} onClose={onClose} maxWidth='max-w-xl'>
      <div className="w-[90vw] max-w-xl p-6">
        <div className="w-full h-[60px] bg-[green] px-4 mb-3">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-center text-white">
              Traitement Pénalité
            </h1>
          </div>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Controller
                  name="action"
                  control={control}
                  rules={{ required: 'Ce champ est obligatoire' }}
                  render={({ field }) => (
                    <SelectInput
                      label="Action"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'Sélectionner une action' },
                        { value: '1', label: 'Valider' },
                        { value: '2', label: 'Rejeter' },
                      ]}
                      error={errors.action?.message}
                    />
                  )}
                />
              </div>
            </div>

            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <>
                  {field.value === '1' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="remiseNumber"
                        control={control}
                        //rules={{ required: 'Ce champ est obligatoire' }}
                        render={({ field }) => (
                          <TextField
                            type="number"
                            control={false}
                            label="N° Remise"
                            name="remiseNumber"
                            value={field.value}
                            onChange={field.onChange}
                            required={false}
                            error={errors.remiseNumber?.message}
                          />
                        )}
                      />
                      <Controller
                        name="encaissementDate"
                        control={control}
                        rules={{ required: 'Ce champ est obligatoire' }}
                        render={({ field }) => (
                          <TextField
                            control={false}
                            label="Date Encaissement"
                            name="encaissementDate"
                            type="date"
                            value={field.value}
                            onChange={field.onChange}
                            required={true}
                            error={errors.encaissementDate?.message}
                          />
                        )}
                      />
                    </div>
                  )}

                  {field.value === '2' && (
                    <div className="col-span-2">
                      <Controller
                        name="comment"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            control={false}
                            label="Commentaire"
                            name="comment"
                            value={field.value}
                            onChange={field.onChange}
                            multi={true}
                            rows={4}
                            required
                            width="w-full"
                            height="h-full"
                          />
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            />
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="px-6"
              >
                Annuler
              </Button>
              <Button type="submit" className="px-6" loading={isSubmitting}>
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const Modal_l = ({ open, onClose, title, children, size = 'max-w-md' }) => (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
      open ? '' : 'hidden'
    }`}
  >
    <div
      className={`bg-white rounded-lg shadow-xl w-full ${size} max-h-[90vh] overflow-auto`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500">
    {children}
  </td>
);

export default ShowPenalite;
