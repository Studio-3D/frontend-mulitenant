import React, { forwardRef, useEffect, useState } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PrinterIcon,
  XCircle,
  BellRingIcon, // For relance icon
  CheckIcon, // For "oui" icon
  XIcon,
  PencilIcon,
  AlertTriangle,
  ArrowLeft,
  X,
  AlertCircle,
  HistoryIcon, // For "non" icon
} from 'lucide-react';
import axios from 'axios';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptDocument from '../../../app/(dashboard)/ventes/reservations/rdv/recu_rdv';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import AddRdvModal from './AddRdvModal';
import Pusher from 'pusher-js';
import { isAdmin, isCommercial, isNotaire, isRespoCommercial, isRespoLivraison } from '@/configs/enum';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Traite: {
      icon: <CheckCircleIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-green-100 text-green-800',
    },
    En_Attente: {
      icon: <ClockIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-blue-100 text-blue-800',
    },
    'Non_traite': {
      icon: <XCircleIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-orange-100 text-orange-800',
    },
  };

  const config = statusConfig[status] || statusConfig['En_Attente'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor}`}
    >
      {config.icon}
      {status.replace('_', ' ')}
    </span>
  );
};

export const RendezVousTab = ({ reservationData, user, onRdvChange }) => {
const [isAddingRelance, setIsAddingRelance] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const reservationId = reservationData?.reservation?.id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const pusher_key_rdv_list = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_LIST;

  // State variables
  const [rdvs, setRdvs] = useState([]);
  const [newRdv, setNewRdv] = useState('');
  const [type, setType] = useState('');
  const [rdvId, setRdvId] = useState('');
  const [rdvEdit, setRdvEdit] = useState('');
  const [typeEdit, setTypeEdit] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [errors, setErrors] = useState(null);
  const etatRes = reservationData?.reservation?.etat;
  const contratVente = reservationData?.reservation?.contrat_vente;
  const [isLoading, setIsLoading] = useState(true);
  const [listStatut] = useState([
    { title: 'En_Attente', value: 1 },
    { title: 'Traite', value: 2 },
    { title: 'Non_traite', value: 3 }, // Changed from 'Raté' to 'Non_traite'
    { title: 'Annulé Automatique', value: 4 }, // Changed from 'Raté' to 'Non_traite'

  ]);

// Fonction simple pour formater l'heure
const formatTimeFromBackend = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Extraire directement les composants d'heure
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};
  // Dialog states
  const [openAddRdv, setOpenAddRdv] = useState(false);
  const [openEditRdv, setOpenEditRdv] = useState(false);
  const [openValidation, setOpenValidation] = useState(false);
  const [openRejet, setOpenRejet] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openTraiterRdv, setOpenTraiterRdv] = useState(false);
  const [txtInfo, setTxtInfo] = useState('');
  const [confirmRejet, setConfirmRejet] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [traiterAction, setTraiterAction] = useState(null); // 'oui' or 'non'
  const [relanceComment, setRelanceComment] = useState('');

  const types = [
    { title: 'Attestation de vente', value: 1 },
    { title: 'Contrat de vente', value: 2 },
  ];

  const imageUrl = `${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

  // Fetch data
  const fetchData = async () => {
    try {
      if (reservationId) {
        setIsLoading(true);
        const response = await axios.get(
          `${apiUrl}/get_rdvs_reservation/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page: 1, pageSize: 20 },
          }
        );

        const { data } = response;
        setRdvs(data.rdv);
        if (onRdvChange) {
          onRdvChange(data.rdv.length);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Initialize Pusher
    const initializePusher = () => {
      if (!pusher_key_rdv_list || !reservationId) {
        console.log('Pusher key or reservation ID missing');
        return () => {};
      }

      Pusher.logToConsole = true;
      console.log(
        'Initializing Pusher for rdv list, reservation:',
        reservationId
      );

      const pusher = new Pusher(pusher_key_rdv_list, {
        cluster: 'eu',
        encrypted: true,
        forceTLS: true,
        wsHost: 'ws-eu.pusher.com',
        wssPort: 443,
        enabledTransports: ['ws', 'wss'],
      });

      const channelName = `rdv-list-updates-${reservationId}`;
      console.log('Subscribing to channel:', channelName);

      try {
        const channel = pusher.subscribe(channelName);

        channel.bind('RdvEvent', (data) => {
          console.log('Refreshing rdv data via Pusher');
          fetchData();
        });

        channel.bind('pusher:subscription_succeeded', () => {
          console.log('✅ Successfully subscribed to channel:', channelName);
        });

        channel.bind('pusher:subscription_error', (status) => {
          console.error('❌ Pusher subscription error:', status);
        });

        pusher.connection.bind('connected', () => {
          console.log('✅ Pusher connected successfully');
        });

        pusher.connection.bind('disconnected', () => {
          console.log('🔴 Pusher disconnected');
        });
      } catch (error) {
        console.error('Error subscribing to Pusher channel:', error);
      }

      return () => {
        console.log('Cleaning up Pusher subscription for:', channelName);
        if (pusher) {
          pusher.disconnect();
        }
      };
    };

    const cleanupPusher = initializePusher();

    return cleanupPusher;
  }, [reservationId, pusher_key_rdv_list]);

  const handleRdvAdded = (newRdv) => {
    fetchData();
    toast.success('Rendez-vous ajouté avec succès');
  };

  const getStatut = (statutId) => {
    const statut = listStatut.find((item) => item.value == statutId);
    return statut ? statut.title : '';
  };


// Ajouter cet état avec les autres états
const [openRelance, setOpenRelance] = useState(false);
const [prochaineRelanceDate, setProchaineRelanceDate] = useState('');
const [relanceError, setRelanceError] = useState('');

// Fonction pour gérer l'ajout de la prochaine relance
const handleAddProchaineRelance = async () => {
  if (!prochaineRelanceDate) {
    setRelanceError('Veuillez sélectionner une date');
    return;
  }

  const selectedDate = new Date(prochaineRelanceDate);
  const now = new Date();

  if (selectedDate <= now) {
    setRelanceError('La date de relance doit être supérieure à maintenant');
    return;
  }

  try {
    setIsAddingRelance(true); // Activer le chargement
    // OPTION 2: Utiliser application/json
    const data = {
      prochaine_relance: prochaineRelanceDate
    };

    console.log('Sending data:', data);

    const response = await axios.put(
      `${APIURL.ROOTV1}/add_prochaine_relance/${rdvId}`,
      data,
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (response.status === 200) {
      console.log('Response data:', response.data);
      toast.success('Prochaine relance programmée avec succès');
      setOpenRelance(false);
      setProchaineRelanceDate('');
      setRelanceError('');
      fetchData();
    }
  }  catch (error) {
    console.error('Error adding prochaine relance:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      toast.error(`Erreur: ${error.response.data.error || 'Erreur inconnue'}`);
    } else {
      toast.error('Erreur lors de la programmation de la relance');
    }
  } finally {
    setIsAddingRelance(false); // Désactiver le chargement dans tous les cas
  }
};

  const handleEditRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rdv', rdvEdit);
    formData.append('type', typeEdit);
    formData.append('statut', 1);

    axios
      .put(`${apiUrl}/update_rdv_reservation/${rdvId}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        fetchData();
        toast.success(
          <>
            {user.role == 3
              ? 'Rendez-vous modifié (en attente de validation)'
              : 'Rendez-vous modifié'}
          </>
        );
        setOpenEditRdv(false);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          setErrors(response.data.errors);
          toast.error('Erreur de validation');
        }
      });
  };

  /* const handleValiderRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('statut', 1);

    axios({
      method: 'put',
      url: `${apiUrl}/traiter_rdv_reservation/${rdvId}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        fetchData();
        toast.success('Rendez-vous validé');
        setOpenValidation(false);
      })
      .catch((err) => {
        console.error('Error validating appointment:', err);
        toast.error(' Erreur lors de la validation');
      });
  };

  const handleRejeterRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('statut', 2);
    formData.append('commentaire', commentaire);

    axios({
      method: 'put',
      url: `${apiUrl}/traiter_rdv_reservation/${rdvId}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        fetchData();
        toast.success('Rendez-vous rejeté');
        setOpenRejet(false);
        setCommentaire('');
      })
      .catch((err) => {
        console.error('Error rejecting appointment:', err);
        toast.error('Erreur lors du rejet');
      });
  }; */

  const handleTraiterRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('statut', traiterAction === 'oui' ? 2 : 3); // 2 for Validé, 3 for Non_traite
    if (traiterAction !=null) {
      formData.append('commentaire', relanceComment);
    }

    axios({
      method: 'put',
      url: `${apiUrl}/traiter_rdv_reservation/${rdvId}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        fetchData();
        toast.success(`Rendez-vous ${traiterAction === 'oui' ? 'validé' : 'marqué comme non traité'}`);
        setOpenTraiterRdv(false);
        setTraiterAction(null);
        setRelanceComment('');
      })
      .catch((err) => {
        console.error('Error treating appointment:', err);
        toast.error('Erreur lors du traitement');
      });
  };

  const handleDeleteRdv = (id, date) => {
    setSelectedId(id);
    setSelectedDate(format(new Date(date), 'dd/MM/yyyy HH:mm'));
    setShowDeleteModal(true);
  };
  // Ajouter cet état avec les autres états
const [openHistoryModal, setOpenHistoryModal] = useState(false);
const [relancesHistory, setRelancesHistory] = useState([]);
const [isLoadingHistory, setIsLoadingHistory] = useState(false);

// Fonction pour charger l'historique
const loadRelancesHistory = async (rdvId) => {
  try {
    setIsLoadingHistory(true);
    const response = await axios.get(
      `${APIURL.ROOTV1}/get_relances_history/${rdvId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (response.status === 200) {
      setRelancesHistory(response.data.relances_history || []);
      setOpenHistoryModal(true);
    }
  } catch (error) {
    console.error('Error loading relances history:', error);
    toast.error('Erreur lors du chargement de l\'historique');
  } finally {
    setIsLoadingHistory(false);
  }
};



  // Render
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 min-h-[50vh]">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
          Rendez-vous
        </h2>
        {(isAdmin(user?.role)||isCommercial(user?.role)||isRespoCommercial(user.role)||isNotaire(user?.role)||isRespoLivraison(user.role)) && (
          <>
           {reservationData?.reservation?.statut==1 && etatRes == 1 && contratVente == null && (
          <button
            onClick={() => setOpenAddRdv(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un rendez-vous
          </button>
        )}
          </>
        )}
       
      </div>
      
      {etatRes != 1 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-500">
                Le dossier est désisté. Vous ne pouvez pas ajouter un Rendez Vous.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Appointments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rdvs.map((rdv) => {
          const isTodayAppointment = (() => {
            const appointmentDate = new Date(rdv.rdv);
            const today = new Date();
            
            return appointmentDate.getDate() === today.getDate() &&
              appointmentDate.getMonth() === today.getMonth() &&
              appointmentDate.getFullYear() === today.getFullYear();
          })(); 
         const isPastAppointment = new Date(rdv.rdv) <= new Date();
          
          return (
            <div
              key={rdv.id}
              className={`border rounded-lg p-4 ${
                isTodayAppointment
                  ? 'bg-blue-50 border-blue-300'
                  : isPastAppointment
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-white border-gray-200'
              } hover:shadow-md transition-shadow relative`}
            >
              {/* Today badge */}
              {isTodayAppointment && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Aujourd{"'"}hui
                </div>
              )}
              
              {/* Appointment header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      rdv.statut == 2
                        ? 'bg-green-50'
                        : rdv.statut == 1
                        ? 'bg-blue-50'
                        : rdv.statut == 3
                        ? 'bg-red-50'
                        : rdv.statut == 4
                        ? 'bg-gray-70'
                        : 'bg-gray-50'
                    }`}
                  >
                    <CalendarIcon
                      className={`h-5 w-5 ${
                        rdv.statut == 2
                          ? 'text-green-600'
                          : rdv.statut == 1
                          ? 'text-blue-500'
                          : rdv.statut == 3
                          ? 'text-red-500'
                          : rdv.statut == 4
                          ? 'text-gray-800'
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {rdv.type == 1
                        ? 'Attestation de vente'
                        : 'Contrat de vente'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(rdv.rdv), 'dd/MM/yyyy')} à{' '}
                      {formatTimeFromBackend(rdv.rdv)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {etatRes == 1 && contratVente == null && (
                    <>
                      {/* Traiter RDV button - show only for today's appointments with statut 0 */}
                      {(isTodayAppointment||isPastAppointment) && rdv.statut == 1  && user.role ==5 && (
                        <button
                          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                          onClick={() => {
                            setRdvId(rdv.id);
                            setSelectedDate(rdv.rdv);
                            setOpenTraiterRdv(true);
                          }}
                          title="Traiter ce rendez-vous"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Validation and rejection buttons for admins 
                      {(user.role <= 3 || user.role ==5  || user.role ==6)&& rdv.statut == 1 && (
                        <>
                          <button
                            className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                            onClick={() => {
                              setRdvId(rdv.id);
                              setSelectedDate(rdv.rdv);
                              setOpenEditRdv(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                         
                        </>
                      )}*/}
                      {(isAdmin(user?.role)||isCommercial(user?.role)||isRespoCommercial(user.role)||isNotaire(user?.role)||isRespoLivraison(user.role))  &&rdv.statut==1 && (
                      <button
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteRdv(rdv.id, rdv.rdv)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      )}
                      
                      {/* Relance button - show for past appointments or non-traite 
                      {(rdv.statut ==  1 && user.role ==5 ) && (
                        <button
                          className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                          onClick={() => {
                            setRdvId(rdv.id);
                            setSelectedDate(rdv.rdv);
                            setOpenRelance(true);
                          }}
                          title="Faire une relance"
                        >
                          <BellRingIcon className="h-4 w-4" />
                        </button>
                      )}*/}
                    </>
                  )}
                </div>
              </div>

              {/* Appointment details */}
              <div className="mt-4 text-sm">
                <p className="flex items-center text-gray-600 mb-1">
                  <span className="font-medium w-24">Responsable:</span>
                  <span className="flex-1">
                    {rdv.user.name} {rdv.user.prenom}
                  </span>
                </p>
                <p className="flex items-center text-gray-600 mb-1">
                  <span className="font-medium w-24">Statut:</span>
                  <StatusBadge status={getStatut(rdv.statut)} />
                </p>
                {rdv.commentaire!=null&&(
               <div className="flex items-center text-gray-600 mb-1">
                  <span className="font-medium w-24">Commentaire:</span>
                  <p>{rdv?.commentaire}</p>
                </div>
                )}
                
                {rdv.statut == 1 && (
                  <p className="flex items-center text-gray-600 mb-1">
                    <span className="font-medium w-24">Fiche:</span>
                    <PDFDownloadLink
                      document={
                        <ReceiptDocument
                          data={[
                            rdv.reservation.code_reservation,
                            rdv.reservation.bien.propriete_dite_bien,
                            rdv.type == 1
                              ? 'Attestation de vente'
                              : 'Contrat de vente',
                            format(new Date(rdv.rdv), 'dd/MM/yyyy kk:mm'),
                            rdv.num_recu,
                            imageUrl,
                          ]}
                        />
                      }
                      fileName="fiche_rdv.pdf"
                    >
                      {({ loading }) => (
                        <button
                          className="inline-flex items-center text-sm text-blue-500 hover:text-blue-800 disabled:opacity-50"
                          disabled={loading}
                        >
                          <PrinterIcon className="h-4 w-4 mr-1" />
                          {loading ? 'Génération...' : 'Télecharger'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  </p>
                )}
               
                {rdv.statut == 3 && (
                  <button
                    className="inline-flex items-center text-sm text-orange-500 hover:text-orange-800"
                    onClick={() => {
                      setTxtInfo(
                        `Le rendez-vous du ${format(
                          new Date(rdv.rdv),
                          'dd/MM/yyyy kk:mm'
                        )} a été marqué comme non traité${rdv.commentaire ? ` avec le commentaire: ${rdv.commentaire}` : ''}`
                      );
                      setOpenInfo(true);
                    }}
                  >
                    Voir les détails
                  </button>
                )}
               
                {rdv.prochaine_relance != null && (
                <div className="flex items-center">
                    <span className="font-medium w-24">Prochaine Relance:</span>
                    <span className="text-orange-600 font-medium">
                    {format(new Date(rdv.prochaine_relance), 'dd/MM/yyyy • HH:mm')}
                    </span>
                    {rdv.relances_history!=null && (
                        <button
                        onClick={() => {
                            setRdvId(rdv.id);
                            setSelectedDate(rdv.rdv);
                            loadRelancesHistory(rdv.id);
                        }}
                        className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                        title="Voir l'historique des relances"
                        >
                        <HistoryIcon className="h-3 w-3" />
                        </button>
                    )}
                  
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

 {/* Modal pour afficher l'historique */}
    {openHistoryModal && (
    <Modal
        isVisible={openHistoryModal}
        onClose={() => {
        setOpenHistoryModal(false);
        setRelancesHistory([]);
        }}
    >
        <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-5 border-b bg-blue-50">
            <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-gray-900">
                Historique des relances
            </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
            Rendez-vous du {selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy • HH:mm')}
            </p>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
            {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            ) : relancesHistory.length > 0 ? (
            <div className="space-y-4">
                {/* Relance actuelle */}
                {relancesHistory.find(r => r.statut === 'actuelle') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <h4 className="font-medium text-green-800">Relance actuelle</h4>
                    </div>
                    <div className="ml-5">
                    <p className="text-sm text-green-700">
                        Programmée pour le: {relancesHistory.find(r => r.statut === 'actuelle').formatted_date_programmee}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        Programmée le: {relancesHistory.find(r => r.statut === 'actuelle').formatted_date_creation}
                    </p>
                    </div>
                </div>
                )}
                
                {/* Anciennes relances */}
                <div>
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Anciennes relances ({relancesHistory.filter(r => r.statut !== 'actuelle').length})</h4>
                <div className="space-y-3">
                    {relancesHistory
                    .filter(r => r.statut !== 'actuelle')
                    .map((relance, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                            <p className="text-sm font-medium text-gray-900">
                                {relance.formatted_date_programmee}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Programmé le: {relance.formatted_date_creation}
                            </p>
                            {relance.user_name && (
                                <p className="text-xs text-gray-500">
                                Par: {relance.user_name}
                                </p>
                            )}
                            {relance.raison && (
                                <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600">Raison:</p>
                                <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded mt-1">
                                    {relance.raison}
                                </p>
                                </div>
                            )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            relance.statut === 'reprogrammee' 
                                ? 'bg-orange-100 text-orange-800' 
                                : relance.statut === 'terminee'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {relance.statut === 'reprogrammee' ? 'Reprogrammée' : 
                            relance.statut === 'terminee' ? 'Terminée' : relance.statut}
                            </span>
                        </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
            ) : (
            <div className="text-center py-8">
                <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun historique de relance disponible</p>
            </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t">
            <button
            onClick={() => {
                setOpenHistoryModal(false);
                setRelancesHistory([]);
            }}
            className="w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
            Fermer
            </button>
        </div>
        </div>
    </Modal>
    )}
    <Modal
    maxWidth='max-w-5xl'
        isVisible={openAddRdv}
        onClose={() => {
        setOpenAddRdv(false);
        }}
    >
      <AddRdvModal
      
          open={openAddRdv}
          reservation_id={reservationId}
          onClose={() => {
              setOpenAddRdv(false);
          }}
          onRdvAdded={handleRdvAdded}
          />
    </Modal>
          {/* Edit RDV Dialog */}

      {/* Validation Dialog 
      {openValidation && (
        <Modal
          isVisible={openValidation}
          onClose={() => setOpenValidation(false)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Validation du rendez-vous
              </h3>
              <button
                onClick={() => setOpenValidation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <p className="mb-6">
              Êtes-vous sûr de vouloir valider le rendez-vous du{' '}
              {selectedDate &&
                format(new Date(selectedDate), 'dd/MM/yyyy kk:mm')}{' '}
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenValidation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleValiderRdv}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </Modal>
      )}*/}

      {/* Rejet Dialog
      {openRejet && (
        <Modal
          isVisible={openRejet}
          onClose={() => setOpenRejet(false)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {confirmRejet ? 'Motif du rejet' : 'Rejet du rendez-vous'}
              </h3>
              <button
                onClick={() => setOpenRejet(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            {confirmRejet ? (
              <form onSubmit={handleRejeterRdv}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setOpenRejet(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="mb-6">
                  Êtes-vous sûr de vouloir rejeter le rendez-vous du{' '}
                  {selectedDate &&
                    format(new Date(selectedDate), 'dd/MM/yyyy kk:mm')}{' '}
                  ?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setOpenRejet(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setConfirmRejet(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Confirmer
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )} */}

{openRelance && (
  <Modal
    isVisible={openRelance}
    onClose={() => {
      setOpenRelance(false);
      setProchaineRelanceDate('');
      setRelanceError('');
    }}
  >
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Header */}
      <div className="p-5 border-b bg-orange-50">
        <div className="flex items-center">
          <BellRingIcon className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="font-medium text-gray-900">
            Programmer une relance
          </h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Rendez-vous du {selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy • HH:mm')}
        </p>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date et heure de la prochaine relance <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <input
              type="datetime-local"
              value={prochaineRelanceDate}
              onChange={(e) => {
                setProchaineRelanceDate(e.target.value);
                if (relanceError) setRelanceError('');
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          {relanceError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {relanceError}
            </p>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Information importante :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La date doit être supérieure à la date actuelle</li>
                  <li>Une notification sera envoyée à la date sélectionnée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setOpenRelance(false);
              setProchaineRelanceDate('');
              setRelanceError('');
            }}
            className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          
         <button
            onClick={handleAddProchaineRelance}
            disabled={!prochaineRelanceDate || isAddingRelance}
            className={`flex-1 py-2.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors ${
                (!prochaineRelanceDate || isAddingRelance) ? 'opacity-50 cursor-not-allowed' : ''
            } flex items-center justify-center`}
            >
            {isAddingRelance ? (
                <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                En cours...
                </>
            ) : (
                <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Programmer la relance
                </>
            )}
            </button>
        </div>
      </div>
    </div>
  </Modal>
)}
      {/* Traiter RDV Dialog */}
{openTraiterRdv && (
  <Modal
    isVisible={openTraiterRdv}
    onClose={() => {
      setOpenTraiterRdv(false);
      setTraiterAction(null);
      setRelanceComment('');
    }}
  >
    <div className="bg-white rounded-lg shadow-lg ">
      {/* Header */}
      <div className="p-5 border-b bg-lime-200">
        <h3 className="font-medium text-gray-900">
          Traiter le rendez-vous
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy • HH:mm')}
        </p>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-3">
            Le rendez-vous a-t-il eu lieu ?
          </p>
          
          {/* Options en ligne */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setTraiterAction('oui')}
              className={`flex-1 py-3 rounded-lg border ${
                traiterAction === 'oui'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                <span>Oui</span>
              </div>
            </button>
            
            <button
              onClick={() => setTraiterAction('non')}
              className={`flex-1 py-3 rounded-lg border ${
                traiterAction === 'non'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 text-gray-700 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                <span>Non</span>
              </div>
            </button>
          </div>

          {/* Champ commentaire obligatoire si "Non" */}
          {traiterAction !=null && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
               Commentaire  {traiterAction=='non' && (<span className="text-red-500 ml-1">*</span>)}
              </label>
              <textarea
               
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={relanceComment}
                onChange={(e) => setRelanceComment(e.target.value)}
                placeholder="Veuillez indiquer le Commentaire"
                rows={3}
              />
             
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setOpenTraiterRdv(false);
              setTraiterAction(null);
              setRelanceComment('');
            }}
            className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          
          <button
            onClick={handleTraiterRdv}
            disabled={!traiterAction || (traiterAction === 'non' && !relanceComment.trim())}
            className={`flex-1 py-2.5 text-sm rounded-lg ${
              traiterAction === 'oui'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : traiterAction === 'non'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${(traiterAction === 'non' && !relanceComment.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {traiterAction === 'oui' ? 'Valider' : 
             traiterAction === 'non' ? 'Rejeter' : 'Sélectionner'}
          </button>
        </div>
      </div>
    </div>
  </Modal>
)}
      {/* Info Dialog */}
      {openInfo && (
        <Modal
          isVisible={openInfo}
          onClose={() => setOpenInfo(false)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Information</h3>
              <button
                onClick={() => setOpenInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <p className="mb-6">{txtInfo}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setOpenInfo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={`${apiUrl}/destroy_rdv_reservation`}
            message={`Êtes-vous sûr de vouloir supprimer le rendez-vous du ${selectedDate}`}
            Id={selectedId}
            type="Rendez-vous"
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData();
            }}
          />
        </Modal>
      )}
    </div>
  );
};