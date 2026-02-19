'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SideBar } from '../../../desistements/ajouter_desistement/[reservationId]/SideBar';
import { Desistement_Definitif } from './Desistement_Definitif';
import { Desistement_Au_Profit } from './Desistement_Au_Profit';
import { Changement_De_Bien } from './Changement_De_Bien';
import { useParams } from 'next/navigation';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextField from '@/components/Textfield';
import { isAdmin, isCommercial, isComptable, isSuperAdmin, type_dst } from '@/configs/enum';
import { useAuth } from '../../../../../../context/AuthContext';
import { fetchData_Select } from '../../../../../../../src/configs/api-utils';
import { type_dst_dp } from '@/configs/enum';
import { useForm } from 'react-hook-form';
import format from 'date-fns/format';

import LoadingSpin from '@/components/LoadingSpin';
import { MODE_PAIEMENT, getModePenaliteLabel } from '@/configs/enum';
import { Clipboard, FileSliders, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjet } from '@/context/ProjetContext';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
export default function Page() {
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;
  const router = useRouter();

  const params = useParams();
  const { user, token } = useAuth();
  const desistementId = params.desistementId;
  const accessToken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();
  const selectedProjet_id = selectedProjet?.id;
  //JSON.parse(localStorage.getItem('selectedProjet'))?.id ;
  // Refs and state
  const initialLoadComplete = useRef(false);
  const [loading, setLoading] = useState({
    form: true,
    submit: false,
    general: true,
    reject: false,
  });
  const [penalite, setPenalite] = useState(null);
  const [loading_bns, setLoading_bnq] = useState();
  const [statut_des, setStatut_des] = useState(false);
  const [desistementData, setDesistementData] = useState(null);
  const [reservationData, setReservationData] = useState([]);
  const [commentaire_rejete, setCommentaire_rejete] = useState('');
  const [showRejectComment, setShowRejectComment] = useState(false);
  const [activeModel, setActiveModel] = useState(null);

  const [banques, setBanques] = useState([]);

  // Fetch desistement data
  const fetchDesistementData = async () => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));

      const response = await axios.get(
        `${APIURL.ROOTV1}/desistements/${desistementId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const desistement = response.data.desistement;
      setDesistementData(desistement);
      setStatut_des(desistement.statut);
      setActiveModel(desistement.type); // Set the active model based on desistement type
      // Check if reservation_ancien exists before destructuring
      if (!desistement.reservation_ancien) {
        throw new Error('reservation_ancien not found in desistement data');
      }

      const {
        code_reservation,
        prix,
        date_reservation,
        bien,
        user: respoUser,
        aquereurs,
        aquereurs_ancien,
      } = desistement.reservation_ancien;

      const aquereursFinal =
        aquereurs?.length > 0 ? aquereurs : aquereurs_ancien;
      console.log('le code ress==>' + code_reservation);

      setReservationData({
        bien: bien,
        bienIdAncien: bien.id,
        codeRes: code_reservation,
        respo: `${respoUser.name} ${respoUser.prenom}`,
        dateRes: date_reservation,
        sumAvances: response.data.sum_avances_valides_ancien,
        prix,
        desisteurs: aquereursFinal,
      });

      // Set penalty flag if penalty exists
      setValue('commentaire', desistement.commentaire);
      if (response.data.penalite != null) {
        setPenalite(response.data.penalite);
      }

      // Set files flag if files exist
      if (desistement.piece_jointes && desistement.piece_jointes.length > 0) {
        setValue('files_desistement', desistement.piece_jointes || []);
        // You might want to pre-load existing files here
      }
      // Add similar blocks for other types (2 and 3) if needed
    } catch (error) {
      console.error('Error fetching desistement:', error);
    } finally {
      setLoading((prev) => ({ ...prev, form: false, general: false }));
    }
  };
    const userRole = user?.role;
        useEffect(() => {
          if (
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole) &&
            !isComptable(userRole)
          ) {
            router.push('/');
          }
        }, [router]);
        

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/ventes?tab=desistements');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
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
  // Form methods
  const methods = useForm({});

  const {
    setValue,
    formState: { errors },
  } = methods;
  // Fetch all initial data
  useEffect(() => {
    if (initialLoadComplete.current) return;
    initialLoadComplete.current = true;

    const fetchAllData = async () => {
      try {
        await fetchDesistementData();
        await fetchData_Select('banques', setBanques, setLoading_bnq);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    fetchAllData();
  }, [desistementId]);

 const handleValidation = async (statut) => {
  try {
    setLoading((prev) => ({
      ...prev,
      submit: statut == 1,
      reject: statut == 2,
    }));

    const data = {
      commentaire: statut == 2 ? commentaire_rejete : null,
      statut: statut,
    };

    // Use await without .then()
    const response = await axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/validation_desistement/${desistementId}`,
      data: data,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const message =
      statut == 1
        ? 'Désistement validé avec succès'
        : 'Désistement rejeté';

    toast.success(message);
    
    // Now response is defined
    const responseData = response.data;
    
    // Check if we need to redirect to a new reservation
    if (responseData.data?.new_reservation_id) {
      // Redirect to the new reservation
      router.push(
        `/ventes/reservations/${responseData.data.new_reservation_id}`
      );
    } else {
      // Fallback - go to reservations list
      router.push('/ventes?tab=reservations');
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    toast.error(
      `Erreur lors de ${statut == 1 ? 'la validation' : 'du rejet'}`
    );
  } finally {
    setLoading((prev) => ({ ...prev, submit: false, reject: false }));
  }
};
  const toggleRejectComment = () => {
    setShowRejectComment(!showRejectComment);
    if (!showRejectComment) {
      setCommentaire_rejete('');
    }
  };
  if (!desistementData || !reservationData) {
    return <LoadingSpin />;
  }

  return (
    <>
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={'/ventes?tab=desistements'}
          step={`Détail Désistement`}
        />
      </div>
      <div className="flex flex-col w-full min-h-screen bg-gray-100 p-4">
        <div className="w-full bg-white shadow-lg rounded-lg mb-4">
          <SideBar
            code_reservation={reservationData.codeRes}
            bien={reservationData.bien}
            prix={reservationData.prix}
            sum_avances_valides={reservationData.sumAvances}
            date_reservation={reservationData.dateRes}
            respo={reservationData.respo}
            desisteurs={reservationData.desisteurs}
            reservationId={desistementData.reservation_id}
            bien_id={reservationData.bienIdAncien}
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 hover:shadow-lg transition-all duration-300">
          {/* Grand Header with Icon */}
          <div className="flex flex-col items-center mb-1">
            <h2 className="text-3xl font-bold flex items-center mb-1">
              {desistementData.type_dp == null ? (
                <>
                  <Clipboard className="w-8 h-8 mr-3 text-indigo-600" />
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {type_dst[desistementData.type]?.label || 'Inconnu'}
                  </span>
                </>
              ) : (
                <>
                  {desistementData.type == 2 && desistementData.type_dp && (
                    <>
                      <Clipboard className="w-8 h-8 mr-3 text-indigo-600" />
                      <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        {type_dst_dp[desistementData.type_dp]?.label ||
                          'Sous-type inconnu'}
                      </span>
                    </>
                  )}
                </>
              )}
            </h2>
          </div>
        </div>
        <div
          // onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow mt-4"
        >
          {activeModel == 1 && (
            <Desistement_Definitif
              formData={desistementData}
              selectedProjet_id={selectedProjet_id}
              sum_avances_valides={reservationData.sumAvances}
              reservationId={desistementData.reservation_id}
              type_remb_get={desistementData.type_remb}
              accessToken={accessToken}
              code_reservation={reservationData.codeRes}
              user={user}
            />
          )}
          {activeModel == 2 && (
            <Desistement_Au_Profit
              formData={desistementData}
              desisteur_dp_proche_co={
                desistementData?.aquereurs_desisteurs?.map((aq) => ({
                  nom: aq.aquereur?.client?.nom,
                  prenom: aq.aquereur?.client?.prenom,
                  pourcentage: aq.aquereur?.pourcentage,
                })) || []
              }
            />
          )}

          {activeModel == 3 && (
            <Changement_De_Bien
              formData={desistementData}
              selectedProjet_id={selectedProjet_id}
              bien_ancien={reservationData?.bien}
              sum_avances_valides={reservationData.sumAvances}
              banques={banques}
              user={user}
              code_reservation={reservationData.codeRes}
              //remboursement
              reservationId={desistementData.reservation_id}
              type_remb_get={desistementData.type_remb}
              accessToken={accessToken}
            />
          )}

          {/* Attachments section - converted to show only */}
          <div className="border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium text-[rgb(35,110,233)]">
                  Pièces Jointes
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  desistementData.piece_jointes?.length > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {desistementData.piece_jointes?.length > 0
                  ? `${desistementData.piece_jointes.length} fichier(s)`
                  : 'Aucun fichier'}
              </div>
            </div>
          </div>

          {desistementData.piece_jointes?.length > 0 && (
            <div className="border-t border-gray-200 py-4 px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {desistementData.piece_jointes.map((file, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-3 bg-white rounded-md border border-gray-200"
                  >
                    <div className="flex items-center mb-2">
                      {getFileIcon(file.fichier)}
                      <a
                        href={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/desistements/${reservationData.codeRes}/${file.fichier}`}
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
          {/* Comment field - kept editable for validation/rejection */}
          <div className="border-t border-gray-200 py-4 px-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire :
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {desistementData.commentaire || ''}
              </p>
            </div>
          </div>
          {/* Penalty section - converted to show only */}
          <div className="border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium text-[rgb(35,110,233)]">
                  Pénalité
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  penalite != null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {penalite != null ? 'Appliquée' : 'Non appliquée'}
              </div>
            </div>
          </div>
          {penalite != null && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Penalty Mode Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Détails de la pénalité
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Mode Pénalité
                      </label>
                      <p className="text-gray-900 font-medium">
                        {getModePenaliteLabel(penalite.mode_penalite)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Montant
                      </label>
                      <p className="text-gray-900 font-medium">
                        {penalite.montant ? (
                          <span className="text-red-500">
                            {parseFloat(penalite.montant).toFixed(2)} DH
                          </span>
                        ) : (
                          ''
                        )}
                      </p>
                    </div>

                    {penalite.mode_penalite !== 'Montant' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Calculé sur
                        </label>
                        <p className="text-gray-900 font-medium">
                          {penalite.penalite_par == 'prix' ? 'Prix' : 'Avance'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Détails de paiement
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Mode de paiement
                      </label>
                      <p className="text-gray-900 font-medium">
                        {MODE_PAIEMENT[penalite.mode_paiement]?.label ||
                          'Non spécifié'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        SR
                      </label>
                      <p className="text-gray-900 font-medium">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            penalite.sr
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {penalite.sr ? 'Oui' : 'Non'}
                        </span>
                      </p>
                    </div>

                    {penalite.mode_paiement != 1 && (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Banque
                          </label>
                          <p className="text-gray-900 font-medium">
                            {banques.find((b) => b.id == penalite.banque_id)
                              ?.nom || ''}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            N° Paiement
                          </label>
                          <p className="text-gray-900 font-medium">
                            {penalite.numero_paiement || ''}
                          </p>
                        </div>
                      </>
                    )}

                    {penalite.mode_paiement != 1 &&
                      penalite.mode_paiement != 5 &&
                      penalite.mode_paiement != 6 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Échéance
                          </label>
                          <p className="text-gray-900 font-medium">
                            {penalite?.echeance
                              ? format(
                                  new Date(penalite?.echeance),
                                  'dd/MM/yyyy',
                                  {
                                    timeZone: 'UTC',
                                  }
                                )
                              : 'Non spécifiée'}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Attachments Section */}
                {penalite.piece_jointes?.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <svg
                        className="w-5 h-5 text-purple-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Fichiers joints ({penalite.piece_jointes.length})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {penalite.piece_jointes.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-150"
                        >
                          <div className="flex-shrink-0 pt-1">
                            {getFileIcon(file.fichier)}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <a
                              href={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/penalites/${reservationData.codeRes}/${file.fichier}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-700 hover:text-blue-600 truncate block"
                              title={file.fichier.split('/').pop()}
                            >
                              {file.fichier.split('/').pop()}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form actions - kept for validation/rejection */}
          {statut_des == 0 && user?.role <= 2 && (
            <div className="p-6 border-t border-gray-200">
              {showRejectComment && (
                <div className="py-1 ">
                  <TextField
                    label="Commentaire de rejet"
                    name="commentaire_rejete"
                    control={false}
                    value={commentaire_rejete}
                    onChange={(e) => setCommentaire_rejete(e.target.value)}
                    errors={{}}
                    backendErrors={{}}
                    isTextarea={true} // Specify it's a textarea
                    height="h-24"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 10 caractères requis
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                {!showRejectComment ? (
                  <>
                    <button
                      type="button"
                      onClick={toggleRejectComment}
                      style={{ color: 'red' }}
                      className="px-4 py-2 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValidation(1)}
                      disabled={loading.submit}
                      className={`px-4 py-2 rounded-md focus:outline-none transition-colors ${
                        loading.submit
                          ? 'bg-indigo-100 text-indigo-600 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {loading.submit ? (
                        <span className="flex items-center">
                          <LoadingSpin />
                          Valider
                        </span>
                      ) : (
                        'Valider'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleRejectComment}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValidation(2)}
                      disabled={
                        loading.reject || commentaire_rejete.length < 10
                      }
                      className={`px-4 py-2 rounded-md focus:outline-none transition-colors ${
                        loading.reject
                          ? 'bg-red-100 text-red-600 cursor-not-allowed'
                          : commentaire_rejete.length < 10
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {loading.reject ? (
                        <span className="flex items-center">
                          <LoadingSpin />
                          Confirmer rejet
                        </span>
                      ) : (
                        'Confirmer rejet'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
