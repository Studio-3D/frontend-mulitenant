import { useState, useEffect } from 'react';
import Link from 'next/link';
import format from 'date-fns/format';
import axios from 'axios';
import {
  Loader2,
  FileText,
  Edit2,
  Upload,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  File,
  Image,
  ArrowLeft,
  FolderOpen,
  Eye,
  Download,
  Ban,
  Archive,
  FileImage,
  Calendar,
  PencilLine,
} from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

import { PDFDownloadLink } from '@react-pdf/renderer';
import Document_Compromis from './recu';
import Modal from '@/components/Modal';
import { RESOURCE_URL } from '@/configs/api';
const Compromis_show = ({
  user,
  reservationData,
  data_c,
  nb_compromis_annule,
  onCompromisCreated,
}) => {
  // Group by year function

  const reservationId = reservationData?.reservation.id;

  // State management
  const [loading, setLoading] = useState(true);
  const [loading_btn, setLoading_btn] = useState(false);
  const [loading_scann, setLoading_scann] = useState(false);
  const [data, setData] = useState([]);
  const [open_edit, setOpen_edit] = useState(false);
  const [open_histo, setOpen_histo] = useState(false);
  const [popupScanner, setPopupScanner] = useState(false);

  const [duree_echeance, set_duree_echeance] = useState(null);
  const [info, setInfo] = useState(null);
  const [date_echeance, set_date_echeance] = useState(null);
  const [date_sign_client, setDate_sign_client] = useState(null);
  const [num_recu, set_num_recu] = useState(null);

  const [date_sign_mo, setDate_sign_mo] = useState(null);
  const [date_enreg, setDate_enreg] = useState(null);
  const [commentaire, setCommentaire] = useState(null);
  const [errors_edit, setErrors_edit] = useState(null);
  const [display, setdisplay] = useState(false);
  const [compromis_id, setCompromis_id] = useState(0);
  const [etat_res, setEtat_res] = useState(1);
  const [fichier_scanner, setfichier_scanner] = useState(null);
  const [comp_sign, set_comp_signe] = useState(null);
  const [nb_comp_annule, set_nb_comp_annule] = useState(0);
  const [data_compromis_annule, setData_Compromis_annule] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  // Prepare the form values for the PDF document
  const formValues = {
    user: user,
    reservationDetails: {
      bien: {
        numero: reservationData.reservation?.bien?.numero,
        niveau: reservationData.reservation?.bien?.niveau,
        superficie_habitable:
          reservationData.reservation?.bien?.superficie_habitable,
        superficie_balcon: reservationData.reservation?.bien?.superficie_balcon,
        superficie_terrasse:
          reservationData.reservation?.bien?.superficie_terrasse,
        composition_bien:
          reservationData.reservation?.bien?.composition_bien || [],
        num_parking: reservationData.reservation?.bien?.num_parking,
        num_box: reservationData.reservation?.bien?.num_box,
        propriete_dite_bien: NomBienComplet(reservationData.reservation?.bien),
        type: reservationData.reservation?.bien?.type_bien?.type,
      },
      prix: reservationData.reservation?.prix,
    },
    clients: reservationData.reservation?.aquereurs || [],
    sum_avances_valides: reservationData?.sum_avances_valides || 0,
    num_recu: data.num_recu,
    form: {
      date_sign_client: date_sign_client,
      date_sign_mo: date_sign_mo,
      date_enreg: date_enreg,
      duree_echeance: duree_echeance,
      date_echeance: date_echeance,
      commentaire: commentaire,
    },
  };
  // Initialize component data
  const function_data = () => {
    setLoading(true);
    setData(data_c);
    setDate_sign_client(data_c.date_sign_client);
    setDate_sign_mo(data_c.date_sign_mo);
    setDate_enreg(data_c.date_enreg);
    set_duree_echeance(data_c.duree_echeance);
    set_date_echeance(data_c.date_echeance || ''); // Add fallback to empty string
    setCommentaire(data_c.commentaire);
    set_nb_comp_annule(nb_compromis_annule);
    setCompromis_id(data_c.id);
    setEtat_res(reservationData?.reservation.etat);
    set_comp_signe(data_c.compromis_signee);
    setLoading(false);
  };

  useEffect(() => {
    function_data();
  }, []);

  // Helper functions
  const handleEdit = () => setOpen_edit(!open_edit);
  const handle_compromis_annuler = () => fetchData_compromis_annule();

  const modifierErreur_edit = (message) => {
    setErrors_edit(message);
    setTimeout(() => setErrors_edit(''), 5000);
  };

  // API calls
  const fetchData_compromis = async (comp_id) => {
    setLoading(true);
    try {
      if (comp_id) {
        const response = await axios.get(
          `${apiUrl}/show_compromis/${comp_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const { compromis, compromis_annule_count } = response.data;

        setData(compromis);
        set_num_recu(compromis.num_recu);
        setDate_sign_client(compromis.date_sign_client);
        setDate_sign_mo(compromis.date_sign_mo);
        setDate_enreg(compromis.date_enreg);
        set_duree_echeance(compromis.duree_echeance);
        set_date_echeance(compromis.date_echeance);
        setCommentaire(compromis.commentaire);
        setCompromis_id(comp_id);
        set_nb_comp_annule(compromis_annule_count);
        setEtat_res(compromis.reservation.etat);
        set_comp_signe(compromis.compromis_signee);
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData_compromis_annule = async () => {
    try {
      if (reservationId) {
        const response = await axios.get(
          `${apiUrl}/get_compromis_annules_by_reservation/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setOpen_histo(true);
        setData_Compromis_annule(response.data.compromis_annule.data);
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    }
  };

  // Form handlers
  const onSubmit_edit = async (e) => {
    e.preventDefault();
    setLoading_btn(true);

    const formData = new FormData();
    formData.append('date_c', date_sign_client);
    formData.append('date_mo', date_sign_mo);
    formData.append('date_en', date_enreg);
    formData.append('duree', duree_echeance);
    formData.append('date_ech', date_echeance);
    formData.append('comment', commentaire);

    try {
      const response = await axios.put(
        `${apiUrl}/update_compromis/${compromis_id}`,
        formData,
        {
          headers: {
            'content-type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setOpen_edit(false);
      setInfo(null);
      fetchData_compromis(
        response.data.comp_id || response.data.original?.comp_id
      );
      toast.success('Votre Modification a été enregistré avec succès');
    } catch (err) {
      const response = err.response;
      if (response?.status === 422) {
        modifierErreur_edit(response.data.errors);
      }
    } finally {
      setLoading_btn(false);
    }
  };

  const handle_Scanne_recu = () => setPopupScanner(true);
  const closeScannerPopup = () => {
    setPopupScanner(false);
    setfichier_scanner(null);
  };

  const scanner_file = async (ev) => {
    ev.preventDefault();
    setLoading_scann(true);

    const formData = new FormData();
    formData.append('comp_id', compromis_id);
    formData.append('fichier_scanner', fichier_scanner);

    try {
      await axios.post(`${apiUrl}/scanner_compromis`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success('Le fichier a été scanné avec succès');
      closeScannerPopup();
      fetchData_compromis(compromis_id);
      // Call parent's onCompromisCreated to refresh ReservationSteps
      if (onCompromisCreated) {
        onCompromisCreated();
      }
    } catch (err) {
      console.error('Error scanning file:', err);
    } finally {
      setLoading_scann(false);
    }
  };

  const handleDownloadPDF = async () => {
  try {
    setLoading_btn(true);
    
    // Prepare the data to send to backend (using existing frontend data)
    const pdfData = {
      user: {
        id: user?.id,
        name: user?.name,
        prenom: user?.prenom,
        societe: {
          id: user?.societe?.id,
          raison_sociale: user?.societe?.raison_sociale,
          raison_sociale_concatene: user?.societe?.raison_sociale_concatene,
          adresse: user?.societe?.adresse,
          tel: user?.societe?.tel,
          email: user?.societe?.email,
          rc: user?.societe?.rc,
          ice: user?.societe?.ice,
          logo: user?.societe?.logo
        }
      },
      reservationDetails: {
        bien: {
          numero: reservationData?.reservation?.bien?.numero,
          niveau: reservationData?.reservation?.bien?.niveau,
          superficie_habitable: reservationData?.reservation?.bien?.superficie_habitable,
          superficie_balcon: reservationData?.reservation?.bien?.superficie_balcon,
          superficie_terrasse: reservationData?.reservation?.bien?.superficie_terrasse,
          composition_bien: reservationData?.reservation?.bien?.composition_bien || [],
          num_parking: reservationData?.reservation?.bien?.num_parking,
          num_box: reservationData?.reservation?.bien?.num_box,
          propriete_dite_bien: NomBienComplet(reservationData?.reservation?.bien),
          type: reservationData?.reservation?.bien?.type_bien?.type,
          projet: {
            titre_foncier: reservationData?.reservation?.bien?.projet?.titre_foncier
          }
        },
        prix: reservationData?.reservation?.prix,
      },
      clients: reservationData?.reservation?.aquereurs || [],
      sum_avances_valides: reservationData?.sum_avances_valides || 0,
      num_recu: data.num_recu,
      form: {
        date_sign_client: date_sign_client,
        date_sign_mo: date_sign_mo,
        date_enreg: date_enreg,
        duree_echeance: duree_echeance,
        date_echeance: date_echeance,
        commentaire: commentaire,
      }
    };

    const response = await axios.post(
      `${apiUrl}/generate-compromis-pdf`,
      { data: pdfData }, // Send the data directly
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
    link.setAttribute('download', `compromis_vente_${data.num_recu || 'temp'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('PDF généré avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération du PDF');
  } finally {
    setLoading_btn(false);
  }
};
  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/compromis_vente/${reservationData?.reservation?.code_reservation}/${file}`,
      '_blank'
    );
  };

  // Loading component
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
     <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="rounded-lg overflow-hidden mb-8">
              <div className="p-6 flex flex-col items-center">
                {/* Header */}
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Attestation de Vente
                </h2>
                <p className="text-gray-600 mb-6">
                  Responsable: {data.user.name} {data.user.prenom}
                </p>

                {/* Status badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {data.date_echeance && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Echéance:{' '}
                      {format(new Date(data.date_echeance), 'dd/MM/yyyy')}
                    </span>
                  )}
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    N°: {data.num_recu}
                  </span>
                </div>

                {/* Dates grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-700">
                      Date Signature Client
                    </h3>
                    <p className="text-gray-600">
                      {format(new Date(data.date_sign_client), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-700">
                      Date Signature MO
                    </h3>
                    <p className="text-gray-600">
                      {format(new Date(data.date_sign_mo), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-700">
                      Date Enregistrement
                    </h3>
                    <p className="text-gray-600">
                      {format(new Date(data.date_enreg), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>

                {/* Signed compromis */}
                {comp_sign && (
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-blue-700">
                      Attestation Signée
                    </h3>
                    <div className="flex items-center justify-center">
                      {comp_sign.toLowerCase().endsWith('.pdf') ? (
                        <File className="w-6 h-6 text-red-500 mr-2" />
                      ) : (
                        <Image className="w-6 h-6 text-blue-500 mr-2" />
                      )}
                      <button
                        onClick={() => handleFileClick(comp_sign)}
                        className="text-blue-500 hover:text-blue-800 hover:underline"
                      >
                        {comp_sign}
                      </button>
                      {etat_res == 1 && (
                        <button
                          onClick={handle_Scanne_recu}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Modifier Compromis Scanné"
                        >
                          <PencilLine className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  {!comp_sign && (
                    <>
                    <button
                      onClick={handleDownloadPDF}
                      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-indigo-700 ${
                        loading_btn ? 'opacity-50' : ''
                      }`}
                      title="Télécharger PDF"
                      disabled={loading_btn}
                    >
                      {loading_btn ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                          Génération en cours...
                        </>
                      ) : (
                        'Télécharger le PDF'
                      )}
                    </button>
                      {/*<PDFDownloadLink
                        document={<Document_Compromis data={formValues} />}
                        fileName={`compromis_vente_${
                          data.num_recu || 'temp'
                        }.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-indigo-700 ${
                              loading ? 'opacity-50' : ''
                            }`}
                            title="Télécharger PDF"
                            disabled={loading}
                          >
                            {loading
                              ? 'Génération en cours...'
                              : 'Télécharger fadle PDF'}
                          </button>
                        )}
                      </PDFDownloadLink>*/}
                      {etat_res == 1 && (
                        <>
                          <button
                            onClick={handleEdit}
                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            <PencilLine className="w-5 h-5 mr-2" />
                            Modifier
                          </button>
                          <button
                            onClick={handle_Scanne_recu}
                            className="flex items-center px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-700"
                          >
                            <Upload className="w-5 h-5 mr-2" />
                            Ajouter Attestation Signé
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {nb_comp_annule > 0 && (
                    <button
                      onClick={handle_compromis_annuler}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Attestation Annulés
                    </button>
                  )}
                </div>
                {commentaire != null && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Commentaire: {commentaire}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
     {/* Edit Modal - Using your Modal component */}
      {open_edit && (
        <Modal 
          isVisible={open_edit}
          onClose={() => setOpen_edit(false)}
          maxWidth="max-w-2xl" // Using max-w-2xl for the edit form
        >
          <div className="bg-blue-600 text-white py-4 px-6 rounded-t-lg">
            <h3 className="text-xl font-bold">Modifier Compromis</h3>
          </div>
          <div className="p-6">
            <form onSubmit={onSubmit_edit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-2">
                  <label
                    htmlFor="date_sign_client"
                    className="block text-[15px] font-medium text-gray-700 mb-1"
                  >
                    Date Signature Client{' '}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_sign_client"
                    defaultValue={format(
                      new Date(data.date_sign_client),
                      'yyyy-MM-dd'
                    )}
                    onChange={(e) => setDate_sign_client(e.target.value)}
                    className="block w-full h-[38px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="date_sign_mo"
                    className="block text-[15px] font-medium text-gray-700 mb-1"
                  >
                    Date Signature Maitre Ouvrage{' '}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_sign_mo"
                    defaultValue={format(
                      new Date(data.date_sign_mo),
                      'yyyy-MM-dd'
                    )}
                    onChange={(e) => setDate_sign_mo(e.target.value)}
                    className="block w-full h-[38px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="date_enreg"
                    className="block text-[15px] font-medium text-gray-700 mb-1"
                  >
                    Date Enregistrement{' '}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_enreg"
                    defaultValue={format(
                      new Date(data.date_enreg),
                      'yyyy-MM-dd'
                    )}
                    onChange={(e) => setDate_enreg(e.target.value)}
                    className="block w-full h-[38px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-600 text-white py-2 px-4 rounded">
                <h4 className="text-center font-medium">Echéance</h4>
              </div>
              
              {info && (
                <div className="rounded-lg bg-yellow-50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        {info}
                      </p>
                    </div>
                    <button
                      onClick={() => setdisplay(false)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <label className="font-medium text-gray-700 mb-1">
                    Durée Echéance
                  </label>
                  <div className="relative">
                    <select
                      value={duree_echeance ?? ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        set_duree_echeance(newValue);
                        setInfo(
                          "Toute modification de la durée ou de la date d'échéance entraînera l'annulation d'attestation et la création d'un nouveau automatique."
                        );
                        setdisplay(true);

                        if (newValue !== 'Autre') {
                          set_date_echeance(
                            format(
                              new Date(
                                new Date().setMonth(
                                  new Date().getMonth() +
                                    parseInt(newValue, 10)
                                )
                              ),
                              'yyyy-MM-dd'
                            )
                          );
                        } else {
                          set_date_echeance('');
                        }
                      }}
                      className="h-[38px] text-[15px] px-4 py-2 border border-gray-300 rounded-md cursor-pointer appearance-none w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-500"
                    >
                      <option value="" disabled>
                        Choisissez un Mode {"d'"}Echéance
                      </option>
                      <option value="3">3 Mois</option>
                      <option value="6">6 Mois</option>
                      <option value="12">12 Mois</option>
                      <option value="Autre">Autre</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
               <div className="mb-2">
                  <label
                    htmlFor="date_echeance"
                    className="block text-[15px] font-medium text-gray-700 mb-1"
                  >
                    Date Echéance
                  </label>
                  <input
                    type="date"
                    id="date_echeance"
                    value={date_echeance || ''}
                    onChange={(e) => set_date_echeance(e.target.value)}
                    disabled={!display || duree_echeance !== 'Autre'}
                    className={`block w-full h-[38px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                      (!display || duree_echeance !== 'Autre') 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  rows={3}
                  defaultValue={data.commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full px-3 py-2 border border-black-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                  placeholder="Commentaire"
                />
              </div>

              {errors_edit && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="ml-3">
                      {Object.keys(errors_edit).map((key) => (
                        <p key={key} className="text-sm text-red-700">
                          {errors_edit[key][0]}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                {loading_btn ? (
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    Enregistrer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen_edit(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Scanner Modal */}
      {popupScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-teal-700 text-white py-4 px-6 rounded-t-lg">
              <h3 className="text-xl font-bold">Scanner Comporomis Signé</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ajouter Attestation <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf, image/*"
                  onChange={(event) => {
                    const selectedFile = event.target.files[0];
                    if (selectedFile) {
                      setfichier_scanner(selectedFile);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-center pb-6 px-6 space-x-3">
              {loading_scann ? (
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
              ) : (
                <button
                  onClick={scanner_file}
                  disabled={!fichier_scanner}
                  className={`px-4 py-2 rounded flex items-center ${
                    fichier_scanner
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Enregistrer
                </button>
              )}
              <button
                onClick={closeScannerPopup}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      {/* History Modal */}
      {open_histo && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Red Header */}
            <div className="bg-red-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Historique des Attestations Annulés
                </h3>
                <p className="text-red-100 text-sm mt-1">
                  {data_compromis_annule?.length || 0} enregistrements
                </p>
              </div>
              <button
                onClick={() => setOpen_histo(false)}
                className="p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {data_compromis_annule?.length > 0 ? (
                <div className="space-y-6">
                  {data_compromis_annule.map((comp, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Status and ID */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Annulé
                        </span>
                        <span className="text-xs text-gray-500">
                          {comp.id && `#${comp.id}`}
                        </span>
                      </div>

                      {/* Horizontal Timeline */}
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-4 md:gap-6">
                          {/* Signature Client */}
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                              <p className="text-xs text-gray-500">
                                Signature Client
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {format(
                                new Date(comp.date_sign_client),
                                'dd/MM/yyyy'
                              )}
                            </p>
                          </div>

                          {/* Signature MO */}
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-xs text-gray-500">
                                Signature MO
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {format(
                                new Date(comp.date_sign_mo),
                                'dd/MM/yyyy'
                              )}
                            </p>
                          </div>

                          {/* Enregistrement */}
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <p className="text-xs text-gray-500">
                                Enregistrement
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {format(new Date(comp.date_enreg), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          {/* Duree */}
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <p className="text-xs text-gray-500">Durée</p>
                            </div>
                            <p className="font-medium text-sm">
                              {comp.duree_echeance!=null && (comp.duree_echeance + ' Mois')}
                            </p>
                          </div>

                          {/* Echéance */}
                          {comp.date_echeance && (
                            <div className="flex-1 min-w-[120px]">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <p className="text-xs text-gray-500">
                                  Échéance
                                </p>
                              </div>
                              <p className="font-medium text-sm">
                                {format(
                                  new Date(comp.date_echeance),
                                  'dd/MM/yyyy'
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Conditional Comment */}
                      {comp.commentaire && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">
                            Commentaire
                          </p>
                          <p className="text-gray-700 text-sm">
                            {comp.commentaire}
                          </p>
                        </div>
                      )}

                      {/* Documents */}
                      {/*comp.compromis_signee && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {comp.compromis_signee.split(',').map((file, i) => (
                        <button
                          key={i}
                          onClick={() => handleFileClick(file.trim())}
                          className="flex items-center px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 text-sm"
                        >
                          {file.trim().toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-4 h-4 text-red-500 mr-2" />
                          ) : (
                            <FileImage className="w-4 h-4 text-blue-500 mr-2" />
                          )}
                          <span className="truncate max-w-[120px]">
                            {file.trim().split('/').pop()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )*/}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Archive className="w-12 h-12 mb-3" />
                  <p className="text-lg font-medium text-gray-500">
                    Aucun Attestation annulé
                  </p>
                  <p className="text-sm">
                    Aucun document trouvé dans les archives
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-3 border-t flex justify-end">
              <button
                onClick={() => setOpen_histo(false)}
                className="px-4 py-2 bg-white border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Compromis_show;
