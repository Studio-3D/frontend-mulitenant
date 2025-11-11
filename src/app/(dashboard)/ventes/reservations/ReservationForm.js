import React, { useState, Fragment, useRef, useEffect } from 'react';
import {
  CheckIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  PlusIcon,
  XIcon,
  UserPlusIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Percent,
  Pencil,
  Heart,
  UserX,
  UserCog,
  Calendar,
  PencilLine,
} from 'lucide-react';

import Button from '@/components/Button'; // Import the component

import TextField from '@/components/Textfield'; // Import the component
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import Pusher from 'pusher-js';
import BreadCrumb from '../../navigation/BreadCrumb';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingSpin from '@/components/LoadingSpin';
import SelectInput from '@/components/SelectInput';

import {
  fetchData_Select,
  fetchList_fichier_exist_by_Code,
} from '../../../../../src/configs/api-utils';

//import Modal from '@/components/Modal';
//import Modal_File from './Modal_file';
import {
  TYPE_CLIENT,
  SITUATION_FAMILIALLE,
  MODE_FINANCE,
  MODE_PAIEMENT,
} from '@/configs/enum';
import { CIVILITES } from '@/components/client-utils';
import { useProjet } from '@/context/ProjetContext';
export default function ReservationForm({ id }) {
  const storedValue = localStorage.getItem('selectedClient_show_client');
  const selectedClient =
    storedValue && !isNaN(Number(storedValue)) ? Number(storedValue) : '';
  const [formSubmitted_client, setFormSubmitted_client] = useState(false);
  const current = new Date();
  const [old_bien_id, setOld_bien_id] = useState('');

  const [loading, setLoading] = useState({ form: false, reservations: false });
  const [clientToEdit, setClientToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  var new_date = current.setDate(current.getDate());
  const [backendErrors, setBackendErrors] = useState({});
  const [info_reservation, setInfo_reservation] = useState(null);
  const [biensByProjet, setBiensByProjet] = useState([]);
  const [bien_id, setBien_id] = useState(null);
  const [selectedFiles_rsv, setSelectedFiles_rsv] = useState([]);
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);

  const { user, token } = useAuth();
  const router = useRouter();
  const accessToken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const [formData, setFormData] = useState(null);
  const isEditing = !!id;
  const [loading_bien, setLoading_bien] = useState(isEditing ? false : true);

  const [banques, setBanques] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [loading_list, setLoading_list] = useState(false);
  const [loading_clients, setLoadingClients] = useState(false);
  const [validerfile, setValiderfile] = useState(false);
  const [myfile, setMyfile] = useState(false);
  const [myfile_1, setMyfile_1] = useState(false);
  const [clientsExist, setClientsExist] = useState([]);
  const [enabled, setenabled] = useState('none');
  const [disabled_var, setDisabled] = useState(!isEditing ? true : false);
  const [oldClients, setoldClients] = useState([]);

  const [check, set_check] = useState(false);
  const [check_p, set_check_p] = useState(false);
  const [addOreditPopup, setAddOreditPopup] = useState(0);
  const [filesList, setfilesList] = useState([]);
  const [filesList_avc, setfilesList_avc] = useState([]);
  const [loading_1, setLoading_1] = useState(false);

  const [addedClients, setAddedClients] = useState([]);

  const step_ = window.localStorage.getItem('step_res_edit');

  const [currentStep, setCurrentStep] = useState(isEditing ? Number(step_) : 0);

  //clients select
  const [inputList1, setinputList1] = useState([
    {
      id: '',
      pourcentage: '',
    },
  ]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const [numberOfForms, setNumberOfForms] = useState(1);
  const [newClientForms, setNewClientForms] = useState([
    {
      cin: '',
      nom: '',
      prenom: '',
      telephone_num1: '',
      pourcentage: '',
      address: '',
      type_client: '',
      partenaire_id: '',
      prospect_id: null,
      info_client: '',
      info_prospect: '',
      projet_id: selectedProjet ? selectedProjet.id : '',
      situation_familliale: null,
      nom_mari: null,
      date_mariage: null,
      lieu_mariage: null,
      notifie: '0',
      civilite: '',
    },
  ]);

  const steps = [
    {
      name: 'Réservation',
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: 'Acquéreurs',
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      name: 'Paiement',
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
  ];

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/ventes/reservations');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addClientEntry = () => {
    setinputList1([
      ...inputList1,
      {
        id: '',
        pourcentage: '',
      },
    ]);
  };

  const removeClientEntry = (index, text) => {
    const clientToRemove = inputList1[index];

    const updatedList = inputList1.filter((_, i) => i !== index);
    const finalList =
      updatedList.length > 0 ? updatedList : [{ id: '', pourcentage: '' }];

    // Re-enable the removed client in the dropdown
    if (clientToRemove.id) {
      setClientsExist((prevClients) =>
        prevClients.map((client) =>
          client.id === clientToRemove.id
            ? { ...client, disabled: false }
            : client
        )
      );
    }

    // Update state first
    setinputList1(finalList);

    // Calculate percentages using the UPDATED list
    const sum_percent_select = finalList.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    const totalPercentage_client_form = addedClients.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    const totalPercentage = sum_percent_select + totalPercentage_client_form;

    console.log(
      `After removal - InputList: ${sum_percent_select}, AddedClients: ${totalPercentage_client_form}, Total: ${totalPercentage}`
    );

    // Update form values
    setValue('pourcentages', totalPercentage);

    // Always validate percentage total after removal
    const isValid = totalPercentage == 100;
    setValue('verifierPourcentages', isValid);
    setenabled(isValid ? 'none' : 'block');

    // Update oldClients
    setoldClients(finalList);
    setValue('oldClients', JSON.stringify(finalList));
  };
  // Reset all client disabled states when component unmounts or form resets
  useEffect(() => {
    return () => {
      setClientsExist((prevClients) =>
        prevClients.map((client) => ({ ...client, disabled: false }))
      );
    };
  }, []);

  const handleNumberOfFormsChange = (value) => {
    const newValue = Math.max(1, Math.min(10, value)); // Limit between 1 and 10
    setNumberOfForms(newValue);
    setNewClientForms(
      Array(newValue)
        .fill(null)
        .map((_, index) => ({
          cin: newClientForms[index]?.cin || '',
          nom: newClientForms[index]?.nom || '',
          prenom: newClientForms[index]?.prenom || '',
          telephone_num1: newClientForms[index]?.email || '',
          pourcentage: newClientForms[index]?.pourcentage || '',
          address: newClientForms[index]?.address || '',
          type_client: newClientForms[index]?.type_client || '',
          partenaire_id: newClientForms[index]?.partenaire_id || '',
          prospect_id: newClientForms[index]?.prospect_id || '',
          info_client: newClientForms[index]?.info_client || '',
          info_prospect: newClientForms[index]?.info_prospect || '',
          projet_id: selectedProjet ? selectedProjet.id : '',
          situation_familliale:
            newClientForms[index]?.situation_familliale || '',
          nom_mari: newClientForms[index]?.nom_mari || '',
          date_mariage: newClientForms[index]?.date_mariage || null,
          lieu_mariage: newClientForms[index]?.lieu_mariage || '',
          notifie: newClientForms[index]?.notifie || '',
          civilite: newClientForms[index]?.civilite || '',
        }))
    );
  };

  const updateFormField = (formIndex, field, value) => {
    setNewClientForms((prevForms) => {
      const updatedForms = prevForms.map((form, index) =>
        index === formIndex ? { ...form, [field]: value } : form
      );

      // Log the specific form being updated
      console.log('Updated form:', updatedForms[formIndex]);

      // Log all forms (optional)
      console.log('All forms:', updatedForms);

      return updatedForms;
    });
  };
  const defaultValues = {
    projet_id: selectedProjet ? selectedProjet.id : '',
    bien_id: '',
    nb_acquereurs: '',
    clients: addedClients || [],
    oldClients: [],

    /**Reservation */
    date_reservation: new Date(new_date).toISOString().split('T')[0],
    code_reservation: '',
    prix: 0,
    prix_final: 0,
    mode_financement: '',
    commentaire: '',
    avance: '',
    sr: 0,
    banque_id: '',
    numero_paiement: '',
    echeance: '',
    check_montant: false,
    origin: 'reservation',
    mode_paiement: '',
    commentaireAvance: '',
    prix_remise: 0,
    prix_forfetaire: 0,
    num_remise: '',
    date_encaissement: '',
    date_reglement: new Date(new_date).toISOString().split('T')[0],
    verifierPourcentages: isEditing ? true : false,
    montant_encaisse: 0,

    ///
    reste: 0,
    prix_val: '',
    Superficie_balcon_calculer: 0,
    superficie_jardin_calculer: 0,
    superficie_terrasse_calculer: 0,
    prix_box: 0,
    prix_parking: 0,
    prix_unitaire: 0,
    avance_minimale: '',
    pourcentages: 0,
  };
  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => setValue(key, value));
    }
  }, [formData]);

  const validationSchemaRef = useRef(
    yup.object().shape({
      //nom: yup.string().required('Interêt de visite est requis')
    })
  );

  const hasExecuted = useRef(false);

  useEffect(() => {
    if (selectedClient && !hasExecuted.current) {
      setinputList1([{ id: selectedClient, pourcentage: '' }]);
      hasExecuted.current = true;
    }
  }, [selectedClient]);
  const {
    control,
    getValues,
    watch,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  useEffect(() => {
    setLoading(true);
    if (isEditing) {
      axios
        .get(`${APIURL.RESERVATIONS}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          if (response.status !== 200) router.back();
          const reservation = response.data.reservation;
          console.log('Reservation data:', reservation);
          console.log('le mode finance==>' + reservation?.mode_financement);
          setOld_bien_id(reservation?.bien_id);
          setFormData({
            code_reservation: reservation.code_reservation,
            date_reservation: reservation?.date_reservation || '',
            mode_financement: reservation?.mode_financement || '',
            commentaire: reservation?.commentaire || '',
            bien_id: reservation?.bien_id || '',
            prix_val: reservation?.prix || '',
            prix: reservation?.prix || '',
            Superficie_balcon_calculer:
              reservation?.bien != null
                ? reservation?.bien?.superficie_balcon_calculer
                : 0,
            superficie_jardin_calculer:
              reservation?.bien != null
                ? reservation?.bien?.superficie_balcon_calculer
                : 0,
            superficie_terrasse_calculer:
              reservation?.bien != null
                ? reservation?.bien?.superficie_terrasse_calculer
                : 0,
            superficie_habitable:
              reservation?.bien != null
                ? reservation?.bien?.superficie_habitable
                : 0,
            prix_box:
              reservation?.bien != null ? reservation?.bien?.prix_box : 0,
            prix_parking:
              reservation?.bien != null ? reservation?.bien?.prix_parking : 0,
            prix_unitaire:
              reservation?.bien != null ? reservation?.bien?.prix_unitaire : 0,
            avance_minimale:
              reservation?.bien != null
                ? reservation?.bien?.avance_minimale
                : 0,
            prix_remise: reservation.prix_remise || 0,
            prix_forfetaire: reservation.prix_forfetaire || 0,
          });

          //set_Bien_id_vendu(reservation.bien_id)
          fetch_bien_ByProjet(
            reservation.bien_id,
            /*  response.data.propriete_dite_bien.original,
            reservation.prix,
            'without_proposition',*/
            'edit_mode'
          );

          // Initialize inputList1 with existing aquereurs
          const aquereurs = reservation.aquereurs.map((aq_dst) => ({
            id: aq_dst.client_id,
            pourcentage: aq_dst.pourcentage,
          }));
          setinputList1(aquereurs);
          setoldClients(aquereurs);
          setValue('nb_acquereurs', Number(reservation.aquereurs.length || 0));
          setValue('oldClients', JSON.stringify(aquereurs));

          // Get all aquereur client IDs
          const aquereurClientIds = aquereurs.map((aq) => aq.id);

          // Update clientsExist with disabled states
          fetchDataClients().then(() => {
            setClientsExist((prevClients) =>
              prevClients.map((client) => ({
                ...client,
                disabled: aquereurClientIds.includes(client.id),
              }))
            );
          });

          setSelectedFiles_rsv(reservation.piece_jointe);
          setLoading(false);
          fetchList_fichier_exist_by_Code(
            setfilesList,
            'rsv',
            reservation.code_reservation,
            setLoading_list
          );

          fetchList_fichier_exist_by_Code(
            setfilesList_avc,
            'avc',
            reservation.code_reservation,
            setLoading_list
          );
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
        });
    }
  }, [accessToken]);
  const onSubmit = (data) => {
    setLoading({ ...loading, form: true });
    // Validate files first
    if (!validateFilesBeforeSubmit()) {
      toast.error(
        'Certains fichiers sont invalides. Veuillez vérifier les fichiers sélectionnés.'
      );
      return;
    }

    setBackendErrors({});
    // FILTER OUT CLIENTS WITH EMPTY OR INVALID PERCENTAGES
    const validOldClients = oldClients.filter(
      (client) =>
        client.id &&
        client.id !== '' &&
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage) &&
        Number(client.pourcentage) > 0
    );

    const validAddedClients = addedClients.filter(
      (client) =>
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage) &&
        Number(client.pourcentage) > 0
    );
    const totalAcquereurs = addedClients.length + oldClients.length;

    const dataToSend = new FormData();
    let url = APIURL.RESERVATIONS;

    // Append all form data including the calculated nb_acquereurs
    Object.entries({
      ...data,
      nb_acquereurs: totalAcquereurs, // Override with current count
      oldClients: JSON.stringify(validOldClients), // Use filtered oldClients
      clients: JSON.stringify(validAddedClients), // Use filtered addedClients
    }).forEach(([key, value]) => {
      // Handle array/object data properly
      if (key === 'clients' || key === 'oldClients') {
        dataToSend.append(key, value);
      } else {
        dataToSend.append(key, value);
      }
    });

    // Debug: Log files before sending
    console.log('Files to send - Reservation:', selectedFiles_rsv);
    console.log('Files to send - Avance:', selectedFiles_avc);

    // Handle reservation files
    if (!isEditing && selectedFiles_rsv.length > 0) {
      selectedFiles_rsv.forEach((file, index) => {
        // Check if file is a valid File object
        if (file instanceof File) {
          dataToSend.append(`files_reservation[${index}]`, file);
          console.log(`Added reservation file: ${file.name}`);
        } else if (file && file.fichier) {
          // Handle existing files from edit mode
          console.log('Skipping existing file in create mode:', file.fichier);
        }
      });
    }

    // Handle avance files
    if (!isEditing && selectedFiles_avc.length > 0) {
      selectedFiles_avc.forEach((file, index) => {
        if (file instanceof File) {
          dataToSend.append(`files_avance[${index}]`, file);
          console.log(`Added avance file: ${file.name}`);
        }
      });
    }

    // For editing mode, handle file updates differently
    if (isEditing) {
      const newFiles_rsv = selectedFiles_rsv.filter(
        (file) => file instanceof File
      );
      const existingFiles_rsv = selectedFiles_rsv.filter(
        (file) => !(file instanceof File)
      );

      // Append new files
      newFiles_rsv.forEach((file, index) => {
        dataToSend.append(`files_reservation[${index}]`, file);
      });

      // You might want to handle existing files deletion/keeping here
      // based on your backend requirements

      dataToSend.append('_method', 'PATCH');
      url = `${url}/${id}`;
    }

    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let pair of dataToSend.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    // Requête API avec axios
    axios
      .post(url, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        let message = 'Quelque chose ne va pas bien';
        if (res.status == 200) {
          message = `Réservation ${
            isEditing ? 'modifiée' : 'créée'
          } avec succès`;
          toast.success(message);
          localStorage.removeItem('step_res_edit');
          localStorage.removeItem('selectedClient_show_client');
          router.push(ENDPOINTS.VENTE + '?tab=reservations');
          reset(defaultValues);
        } else if (res.status == 422) {
          message = res.data.message;
          setBackendErrors(res.data.errors);

          // Effacer les erreurs après 5 secondes
          setTimeout(() => setBackendErrors({}), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response && response.status == 422) {
          setBackendErrors(response.data.errors);

          // Effacer les erreurs après 5 secondes
          setTimeout(() => setBackendErrors({}), 5000);
        } else if (response.status == 333) {
          toast.error(response.data.error_33);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
          setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
      })
      .finally(() => setLoading({ ...loading, form: false }));
  };

  const fetch_code_reservation = async (event) => {
    const val = event.target.value;

    // First check for invalid characters
    if (/[\\/]/.test(val)) {
      setInfo_reservation('Les caractères / et \\ ne sont pas autorisés');
      return; // Exit early if invalid characters found
    } else {
      setInfo_reservation(null);
      console.log('le code est==>' + val);

      if (val.length >= 3) {
        try {
          const res = await axios.get(
            `${APIURL.ROOTV1}/search_reservation_by_code/` + val,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (res.data.reservation != null) {
            setInfo_reservation(
              'Le Code Réservation : ' + val + ' est déjà existant'
            );
          } else {
            setInfo_reservation(null);
          }
        } catch (error) {
          setInfo_reservation(null);
        }
      }
    }
  };

  const handleSelectBien = (event, v) => {
    if (v == null) {
      setBien_id(null);
    } else {
      setBien_id(v.id);
      setValue('bien_id', v.id);
      setValue('prix_val', v.prix);
      setValue('prix', v.prix);
      setValue('prix_final', v.prix);
      setValue(
        'Superficie_balcon_calculer',
        v.superficie_balcon_calculer != null ? v.superficie_balcon_calculer : 0
      );
      setValue(
        'superficie_jardin_calculer',
        v.superficie_jardin_calculer != null ? v.superficie_jardin_calculer : 0
      );
      setValue(
        'superficie_terrasse_calculer',
        v.superficie_terrasse_calculer != null
          ? v.superficie_terrasse_calculer
          : 0
      );
      setValue(
        'superficie_habitable',
        v.superficie_habitable != null ? v.superficie_habitable : 0
      );
      setValue('prix_box', v.prix_box ? v.prix_box : 0);
      setValue('prix_parking', v.prix_parking ? v.prix_parking : 0);
      setValue('prix_unitaire', v.prix_unitaire ? v.prix_unitaire : 0);
      setValue('avance_minimale', v.avance_minimale ? v.avance_minimale : 0);
      storebien_en_proposition(v.id);
      pusher_function();
    }
  };

  const fetch_bien_ByProjet = async (bien_id, from) => {
    setLoading_bien(true);
    console.log('fetch_bien_ByProjet called with:', { bien_id, from });

    let route = null;
    //on reservation edit
    if (isEditing && bien_id) {
      route = 'getBiensByProjet_Concat_for_reservation_visite/' + bien_id;
    } else {
      route = 'getBiensByProjet_Concat';
    }
    try {
      // Fetch all biens for the project from the single endpoint
      const response = await axios.get(
        `${APIURL.ROOTV1}/${route}/${selectedProjet.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let biens = response.data.biens;
      console.log('API response biens:', biens);

      // If we're in edit mode and have a bien_id, check if it exists in the response
      if (
        bien_id &&
        from === 'edit_mode' &&
        !biens.some((b) => b.id === bien_id)
      ) {
        // If the bien is not in the API response, we need to handle this case
        console.warn(`Bien ID ${bien_id} not found in API response`);

        // Since we can't call the other API, we'll create a minimal representation
        // OR you might want to show an error/toast to the user
        toast.error(
          `Le bien sélectionné (ID: ${bien_id}) n'est plus disponible`
        );

        // Optional: Add a placeholder if you still want to show it
        const placeholderBien = {
          id: bien_id,
          propriete_dite_bien: `Bien #${bien_id} (Non disponible)`,
          prix: 0,
          etat: 'NON_DISPONIBLE',
        };
        biens = [placeholderBien, ...biens];
      }

      setBiensByProjet(biens);
      console.log('Final biens array:', biens);
    } catch (error) {
      console.error('Error fetching biens:', error);
      toast.error('Erreur lors du chargement des biens');
    } finally {
      setLoading_bien(false);
    }
  };

  const pusher_function = async () => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(`${pusher_key_proposition}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');

    channel.bind('App\\Events\\PropositionUpdated', (data) => {
      if (isEditing) fetch_bien_ByProjet(old_bien_id, 'edit');
      else fetch_bien_ByProjet(null, null);
    });

    return () => {
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };
  const storebien_en_proposition = async (id) => {
    var old_id = bien_id;
    if (old_id == null) {
      old_id = 0;
    }
    axios({
      method: 'put',

      url: `${APIURL.ROOTV1}/setPropostionBien/${id}/` + old_id,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        console.log('bien est en proposition');
      })
      .catch(() => {
        console.log('error');
      });
  };

  const fetchDataClients = async () => {
    try {
      setLoadingClients(true);

      const response = await axios.get(
        `${APIURL.ROOTV1}/projets/${selectedProjet.id}/clients/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (isEditing) {
        const selectedClientIds = [
          ...inputList1.map((item) => item.id),
          ...addedClients.map((client) => client.id),
        ];
        setClientsExist(
          response.data.clients.map((client) => ({
            id: client.id,
            nom: client.nom,
            prenom: client.prenom,
            disabled: selectedClientIds.includes(client.id),
          }))
        );
      } else {
        setClientsExist(
          response.data.clients.map((client) => ({
            id: client.id,
            nom: client.nom,
            prenom: client.prenom,
            // disabled: false,
            disabled: selectedClient ? client.id === selectedClient : false,
          }))
        );
      }

      setLoadingClients(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      fetch_bien_ByProjet(null, null);

      if (banques.length == 0) {
        fetchData_Select('banques', setBanques, setLoading_1);
      }
    }

    if (partenaires.length == 0) {
      fetchData_Select('partenaires', setPartenaires, setLoading_1);
    }

    if (clientsExist.length == 0) {
      fetchDataClients();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/reservations/${file}`,
      '_blank'
    );
  };
  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);

    window.open(fileURL);
  };
  const handleDeleteFile = (index, fileType) => {
    if (fileType == 'rsv') {
      setSelectedFiles_rsv((prev) => prev.filter((_, i) => i !== index));
    } else if (fileType == 'avc') {
      setSelectedFiles_avc((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (event, param) => {
    const selectedFiles = param == 1 ? selectedFiles_rsv : selectedFiles_avc;
    const setSelectedFiles =
      param == 1 ? setSelectedFiles_rsv : setSelectedFiles_avc;
    const fileList = param == 1 ? filesList : filesList_avc;

    const files = Array.from(event.target.files);

    // Reset input to allow selecting same file again
    event.target.value = '';

    const newFiles = files
      .filter((file) => {
        const fileName = file.name;

        // Check if file exists in selected files
        const fileExistsInSelected = selectedFiles.some((selectedFile) => {
          if (selectedFile instanceof File) {
            return selectedFile.name === fileName;
          } else {
            return selectedFile.fichier === fileName;
          }
        });

        // Check if file exists in existing file list
        const fileExistsInList = Object.values(fileList).includes(fileName);

        if (fileExistsInSelected) {
          setAddOreditPopup(param == 1 ? 1 : 2);
          setValiderfile(true);
          setMyfile(files);
          return false;
        } else if (fileExistsInList) {
          // Generate unique filename
          let newFileName = fileName;
          let fileNumber = 1;

          const fileParts = fileName.split('.');
          const extension = fileParts.pop();
          const baseName = fileParts.join('.');

          while (
            Object.values(fileList).includes(newFileName) ||
            selectedFiles.some(
              (sf) =>
                (sf instanceof File && sf.name === newFileName) ||
                (!(sf instanceof File) && sf.fichier === newFileName)
            )
          ) {
            newFileName = `${baseName} (${fileNumber}).${extension}`;
            fileNumber++;
          }

          // Create new file with modified name
          const newFile = new File([file], newFileName, { type: file.type });
          return newFile;
        } else {
          return file;
        }
      })
      .filter(Boolean); // Remove any false values

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };
  const validateFilesBeforeSubmit = () => {
    // Check if all files are valid File objects
    const allRsvFilesValid = selectedFiles_rsv.every(
      (file) => file instanceof File || (file && file.fichier)
    );

    const allAvcFilesValid = selectedFiles_avc.every(
      (file) => file instanceof File || (file && file.fichier)
    );

    if (!allRsvFilesValid) {
      console.error('Invalid reservation files detected');
      return false;
    }

    if (!allAvcFilesValid) {
      console.error('Invalid avance files detected');
      return false;
    }

    return true;
  };

  const isButtonDisabled = () => {
    // Cache all watched values at start
    const {
      avance,
      avance_minimale,
      mode_paiement,
      mode_financement,
      check_montant,
      commentaireAvance,
      banque_id,
      num_paiement,
      date_echeance,
    } = watch();

    // Always disabled conditions
    if (info_reservation || loading.form || !mode_financement) {
      return true;
    }

    // Non-editing validations
    if (!isEditing) {
      // Basic amount validations
      if (avance < 0 || avance === '') return true;

      // Payment method validation
      if (!mode_paiement) return true;

      // Check payment method specific rules
      const isCheckPayment = [2, 3, 4].includes(mode_paiement?.code); // Chèque types
      const isTransferPayment = [5, 6].includes(mode_paiement?.code); // Virement/Versement

      if (isCheckPayment) {
        if (!banque_id || !num_paiement || !date_echeance) return true;
      }

      if (isTransferPayment) {
        if (!banque_id || !num_paiement) return true;
      }

      // Comment validation when check_montant is true
      if (check_montant && !commentaireAvance) return true;

      // Special role validation for zero amount
      if (user?.role > 2 && avance === 0 && !check_montant) return true;
    }

    // Minimum amount validation
    if (avance > 0 && avance < avance_minimale) return true;

    return false;
  };
  // Helper functions (add these outside your component)
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
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleinputchange1 = (e, index, text) => {
    const { name, value } = e.target;
    const list = [...inputList1];

    // Store the previous ID before updating
    const previousId = list[index].id;

    // Update the list with new value
    list[index][name] = value;
    setinputList1(list);

    if (inputList1.length != 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }

    // Handle client selection changes
    if (text == 'select_client') {
      // Enable the previously selected client (if any)
      if (previousId && previousId !== value) {
        setClientsExist((prevClients) =>
          prevClients.map((client) =>
            client.id === previousId ? { ...client, disabled: false } : client
          )
        );
      }

      // Disable the newly selected client
      if (value) {
        setClientsExist((prevClients) =>
          prevClients.map((client) =>
            client.id === value ? { ...client, disabled: true } : client
          )
        );
      }
    }

    // Calculate percentages - only count valid percentages
    const sum_percent_select = list.reduce((sum, client) => {
      // Only count if percentage is valid and not empty
      if (
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
      ) {
        return sum + Number(client.pourcentage);
      }
      return sum;
    }, 0);

    const totalPercentage_client_form = addedClients.reduce((sum, client) => {
      if (
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
      ) {
        return sum + Number(client.pourcentage);
      }
      return sum;
    }, 0);

    console.log(
      'toto percentselect =>' +
        sum_percent_select +
        'totalPercentage_client_form==>' +
        totalPercentage_client_form
    );

    const totalPercentage = sum_percent_select + totalPercentage_client_form;
    setValue('pourcentages', totalPercentage);

    if (text == 'percent') {
      // Validate if total is exactly 100
      const isValid = totalPercentage == 100;
      setValue('verifierPourcentages', isValid);
      setenabled(isValid ? 'none' : 'block');
    }
    // Only include clients with valid percentages in oldClients
    const validClients = list.filter(
      (client) =>
        client.id &&
        client.id !== '' &&
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
    );

    /* var arrayinputList1 = Object.values(list);
    var arrayClient1 = [];
    for (let i = 0; i < arrayinputList1.length; i++) {
      const propertyValues = arrayinputList1[i];
      arrayClient1.push(propertyValues);
    }*/

    setoldClients(validClients);
    setValue('oldClients', JSON.stringify(validClients));
    console.log(' the final list==>' + JSON.stringify(validClients));
  };
  const validateClientStep = () => {
    // Filter out empty/invalid clients first
    const validSelectedClients = inputList1.filter(
      (client) =>
        client.id &&
        client.id !== '' &&
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
    );

    const validAddedClients = addedClients.filter(
      (client) =>
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
    );

    // If no valid clients at all, return false
    if (validSelectedClients.length === 0 && validAddedClients.length === 0) {
      return false;
    }

    // Calculate current total percentage - only count valid clients
    const sum_percent_select = validSelectedClients.reduce((sum, client) => {
      return sum + Number(client.pourcentage);
    }, 0);

    const totalPercentage_client_form = validAddedClients.reduce(
      (sum, client) => {
        return sum + Number(client.pourcentage);
      },
      0
    );

    const totalPercentage = sum_percent_select + totalPercentage_client_form;
    const totalValid = totalPercentage === 100;

    console.log(
      `Validation - Selected: ${sum_percent_select}, Added: ${totalPercentage_client_form}, Total: ${totalPercentage}, Valid: ${totalValid}`
    );

    return totalValid;
  };
  // Add this function to clean up empty client entries
  const cleanupEmptyClients = () => {
    const cleanedList = inputList1.filter(
      (client) => !(client.id === '' && client.pourcentage === '')
    );

    if (cleanedList.length !== inputList1.length) {
      setinputList1(
        cleanedList.length > 0 ? cleanedList : [{ id: '', pourcentage: '' }]
      );
    }
  };

  // Call this before important operations or add it to useEffect
  useEffect(() => {
    cleanupEmptyClients();
  }, [currentStep]);
  /*const validateClientStep = () => {
    // Check if all selected clients have both id and pourcentage
    const allSelectedClientsValid = inputList1.every(
      (client) =>
        client.id &&
        client.id !== '' &&
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
    );

    // Check if all added clients have required fields
    const allAddedClientsValid = addedClients.every(
      (client) =>
        client.nom &&
        client.nom.trim() !== '' &&
        client.pourcentage &&
        client.pourcentage !== '' &&
        !isNaN(client.pourcentage)
    );

    // Calculate current total percentage
    const sum_percent_select = inputList1.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    const totalPercentage_client_form = addedClients.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    const totalPercentage = sum_percent_select + totalPercentage_client_form;
    const totalValid = totalPercentage === 100;

    console.log(
      `Validation - Selected: ${sum_percent_select}, Added: ${totalPercentage_client_form}, Total: ${totalPercentage}, Valid: ${totalValid}`
    );

    return allSelectedClientsValid && allAddedClientsValid && totalValid;
  };*/

  const handleAnnuler_form = () => {
    // Calculate total percentage of selected clients
    const totalPercentage = newClientForms.reduce(
      (sum, client) => sum + Number(client.pourcentage || 0),
      0
    );

    // Get current value of pourcentages field
    const old_value_pourcentages = getValues('pourcentages');

    // Calculate and set new value
    const newValue = old_value_pourcentages - totalPercentage;
    setValue('pourcentages', newValue);

    // Validate if total is exactly 100

    setenabled(newValue == 100 ? 'none' : 'block');
  };
  const handleAnnuler_client_added = (percent) => {
    // Get current value of pourcentages field
    const old_value_pourcentages = getValues('pourcentages');

    // Calculate and set new value
    const newValue = old_value_pourcentages - percent;

    setValue('pourcentages', newValue);

    // Validate if total is exactly 100

    setenabled(newValue == 100 ? 'none' : 'block');
  };

  const calculateTotalPercentage_new_form = (currentClients) => {
    // Calculate sum of new clients (using passed currentClients)
    const newClientsSum = currentClients.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    // Calculate sum of old clients
    const oldClientsSum = inputList1.reduce((sum, client) => {
      return sum + (Number(client.pourcentage) || 0);
    }, 0);

    const total = newClientsSum + oldClientsSum;

    console.log(
      `Calculation: ${newClientsSum} (new) + ${oldClientsSum} (old) = ${total}`
    );

    // Update all states
    setValue('pourcentages', total);
    // Validate
    const isValid = total == 100;
    setValue('verifierPourcentages', isValid);
    setenabled(isValid ? 'none' : 'block');
  };
  const handleFakeSubmit = (e) => {
    e.preventDefault(); // Prevent actual form submission
    if (isFormValid()) {
      // Proceed with submission
    } else {
      console.error('Form validation failed');
    }
  };
  // Add this useEffect to recalculate totals when inputList1 or addedClients change
  useEffect(() => {
    if (currentStep === 1) {
      const sum_percent_select = inputList1.reduce((sum, client) => {
        return sum + (Number(client.pourcentage) || 0);
      }, 0);

      const totalPercentage_client_form = addedClients.reduce((sum, client) => {
        return sum + (Number(client.pourcentage) || 0);
      }, 0);

      const totalPercentage = sum_percent_select + totalPercentage_client_form;

      setValue('pourcentages', totalPercentage);

      const isValid = totalPercentage === 100;
      setValue('verifierPourcentages', isValid);
      setenabled(isValid ? 'none' : 'block');
    }
  }, [inputList1, addedClients, currentStep, setValue]);
  const isFormValid = () => {
    return newClientForms.every((form) => {
      // Basic field validation
      const hasRequiredFields =
        form.cin?.trim() !== '' &&
        form.nom?.trim() !== '' &&
        form.prenom?.trim() !== '' &&
        String(form.telephone_num1 || '').length >= 8 &&
        !isNaN(form.telephone_num1) &&
        form.pourcentage !== '' &&
        !isNaN(form.pourcentage) &&
        Number(form.pourcentage) >= 0 &&
        Number(form.pourcentage) <= 100 &&
        form.situation_familliale !== '' && // Situation familiale is required
        form.civilite != '' &&
        form.notifie != '';
      // Type client validation
      const hasValidType = form.type_client !== '';

      // Partenaire validation (only required if type is Société)
      const hasValidPartenaire =
        form.type_client !== '2' || // Not Société
        (form.type_client === '2' && form.partenaire_id !== ''); // Or has partenaire

      // Marriage validation (only required if situation is Marié)
      const hasValidMarriage =
        form.situation_familliale !== '2' || // Not Marié
        (form.situation_familliale === '2' &&
          form.nom_mari?.trim() !== '' &&
          form.date_mariage &&
          form.lieu_mariage?.trim() !== ''); // Or has all marriage fields

      const hasValidNotifie =
        form.notifie !== undefined && form.notifie !== null;
      return (
        hasRequiredFields &&
        hasValidType &&
        hasValidPartenaire &&
        hasValidMarriage &&
        hasValidNotifie
      );
    });
  };

  const handleFakeSubmit_Edit = (e) => {
    e.preventDefault(); // Prevent actual form submission
    if (isFormValid_Edit()) {
      // Proceed with submission
    } else {
      console.error('Form validation failed');
    }
  };

  const isFormValid_Edit = () => {
    // Basic field validation
    const hasRequiredFields =
      clientToEdit.cin?.trim() !== '' &&
      clientToEdit.nom?.trim() !== '' &&
      clientToEdit.prenom?.trim() !== '' &&
      String(clientToEdit.telephone_num1 || '').length >= 8 &&
      !isNaN(clientToEdit.telephone_num1) &&
      clientToEdit.pourcentage !== '' &&
      !isNaN(clientToEdit.pourcentage) &&
      Number(clientToEdit.pourcentage) >= 0 &&
      Number(clientToEdit.pourcentage) <= 100 &&
      clientToEdit.situation_familliale != '' &&
      clientToEdit.civilite != '' &&
      clientToEdit.notifie != ''; // Situation familiale is required

    // Type client validation
    const hasValidType = clientToEdit.type_client !== '';

    // Partenaire validation (only required if type is Société)
    const hasValidPartenaire =
      clientToEdit.type_client !== '2' || // Not Société
      (clientToEdit.type_client === '2' && clientToEdit.partenaire_id !== ''); // Or has partenaire

    // Marriage validation (only required if situation is Marié)
    const hasValidMarriage =
      clientToEdit.situation_familliale !== '2' || // Not Marié
      (clientToEdit.situation_familliale === '2' &&
        clientToEdit.nom_marie?.trim() !== '' &&
        clientToEdit.date_mariage &&
        clientToEdit.lieu_mariage?.trim() !== ''); // Or has all marriage fields

    return (
      hasRequiredFields &&
      hasValidType &&
      hasValidPartenaire &&
      hasValidMarriage
    );
  };

  const fetch_cin_tel = async (
    text,
    value,
    formIndex,
    accessToken,
    updateFormField
  ) => {
    const prefix = text == 'tel' ? 'Le numéro de téléphone ' : 'La Cin ';

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/search_prospect_by_param/${text}/${value}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data) {
        if (response.data.prospect) {
          // Show alert if phone exists
          if (response.data.prospect.telephone) {
            toast.error(
              ` ${prefix} ${value} appartient au Prospect ${
                response.data.prospect.nom + ' ' + response.data.prospect.prenom
              }`,
              {
                position: 'top-center',
                duration: 5000,
              }
            );
          }

          // Update prospect info if needed
          updateFormField(formIndex, 'prospect_id', response.data.prospect.id);
          set_check_p(true); // Set prospect check to true
        } else {
          set_check_p(false); // Set prospect check to false
        }

        if (response.data.client) {
          toast.error(
            ` ${prefix} ${value} appartient au Client ${
              response.data.client.nom + ' ' + response.data.client.prenom
            }`,
            {
              position: 'top-center',
              duration: 5000,
            }
          );
          set_check(true); // Set client check to true
        } else {
          set_check(false); // Set client check to false
        }
      }
    } catch (error) {
      console.error('Error checking phone number:', error);
      // You might want to add error handling toast here
      toast.error('Erreur lors de la vérification du numéro de téléphone', {
        position: 'top-center',
        duration: 5000,
      });
    }
  };
  // Helper function to safely parse float values
  const parseSafeFloat = (value) => parseFloat(value) || 0;

  // Common calculation logic extracted to a separate function
  const calculateTotalPrice = (values) => {
    const {
      prix_remise,
      prix_unitaire,
      prix_forfetaire,
      superficie_jardin_calculer,
      superficie_habitable,
      superficie_balcon_calculer,
      superficie_terrasse_calculer,
      prix_box,
      prix_parking,
    } = values;

    const superficieTotal =
      parseSafeFloat(superficie_jardin_calculer) +
      parseSafeFloat(superficie_habitable) +
      parseSafeFloat(superficie_balcon_calculer) +
      parseSafeFloat(superficie_terrasse_calculer);

    const basePrice =
      parseSafeFloat(prix_remise) || parseSafeFloat(prix_unitaire);
    const fixedCosts = parseSafeFloat(prix_box) + parseSafeFloat(prix_parking);

    return (
      basePrice * superficieTotal + fixedCosts - parseSafeFloat(prix_forfetaire)
    );
  };

  const handleChangePrixRemise = (event) => {
    const values = {
      prix_remise: event.target.value,
      prix_unitaire: watch('prix_unitaire'),
      prix_forfetaire: watch('prix_forfetaire'),
      superficie_jardin_calculer: watch('superficie_jardin_calculer'),
      superficie_habitable: watch('superficie_habitable'),
      superficie_balcon_calculer: watch('Superficie_balcon_calculer'),
      superficie_terrasse_calculer: watch('superficie_terrasse_calculer'),
      prix_box: watch('prix_box'),
      prix_parking: watch('prix_parking'),
    };
    setValue('prix_final', calculateTotalPrice(values));
  };

  const handleChangePrixForfetaire = (event) => {
    const values = {
      prix_remise: watch('prix_remise'),
      prix_unitaire: watch('prix_unitaire'),
      prix_forfetaire: event.target.value,
      superficie_jardin_calculer: watch('superficie_jardin_calculer'),
      superficie_habitable: watch('superficie_habitable'),
      superficie_balcon_calculer: watch('Superficie_balcon_calculer'),
      superficie_terrasse_calculer: watch('superficie_terrasse_calculer'),
      prix_box: watch('prix_box'),
      prix_parking: watch('prix_parking'),
    };

    setValue('prix_final', calculateTotalPrice(values));
  };

  if (isEditing && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.VENTE + '?tab=reservations'}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} Reservation`}
          />
        </div>
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <Fragment key={index}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index < currentStep
                      ? 'bg-blue-600 border-blue-600'
                      : index == currentStep
                      ? 'border-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`${
                        index == currentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {steps[index].icon}
                    </span>
                  )}
                </div>
                <span
                  className={`ml-3 text-lg font-medium ${
                    index <= currentStep ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {`0${index + 1}`} {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 mx-4 h-1 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </Fragment>
          ))}
        </div>

        {currentStep == 0 && (
          <div className="space-y-6 mt-[50px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <TextField
                  label="Code Réservation:"
                  name="code_reservation"
                  required={true}
                  control={control}
                  errors={errors}
                  backendErrors={backendErrors}
                  defaultValues={defaultValues}
                  onChange={(e) => {
                    fetch_code_reservation(e);
                  }}
                />
                {info_reservation != null && (
                  <p style={{ color: 'red' }}>{info_reservation}</p>
                )}
              </div>

              <div>
                <SelectInput
                  label={'Bien :'}
                  name="bien_id"
                  required={true}
                  loading={loading_bien}
                  options={biensByProjet.map((bien) => {
                    // Add the same disabled logic from your other component
                    const isDisabled =
                      bien.etat == 'ENCOURS_DE_PROPOSITION' &&
                      bien.is_proposed != null &&
                      user.id != bien.is_proposed.user_id;

                    // Add the same label text logic
                    const labelText =
                      bien.propriete_dite_bien +
                      (bien.etat === 'ENCOURS_DE_PROPOSITION'
                        ? bien?.is_proposed !== null
                          ? user.id !== bien?.is_proposed?.user_id
                            ? ` Proposé par ${bien?.is_proposed?.user?.name} ${bien?.is_proposed?.user?.prenom}`
                            : ' Proposé par Moi Même'
                          : ''
                        : '');

                    return {
                      value: bien.id,
                      label: labelText || `Bien #${bien.id}`,
                      original: bien,
                      disabled: isDisabled,
                    };
                  })}
                  value={watch('bien_id')}
                  onChange={(value) => {
                    const selectedOption = biensByProjet.find(
                      (b) => b.id === value
                    );
                    if (selectedOption) {
                      handleSelectBien(null, selectedOption);
                    }
                  }}
                  error={
                    errors['bien_id']?.message || backendErrors['bien_id']?.[0]
                  }
                  disabled={isEditing && user?.role > 2 ? true : false}
                  placeholder="Sélectionnez un bien"
                />
              </div>
              <div>
                <TextField
                  label="Date Réservation:"
                  name="date_reservation"
                  type="date"
                  required={true}
                  control={control}
                  errors={errors}
                  backendErrors={backendErrors}
                  defaultValues={defaultValues}
                />
              </div>
            </div>
            <div>
              <TextField
                label="Commentaire:"
                name="commentaire"
                required={false}
                multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                control={control} // Passed from useForm hook
                errors={errors} // Validation errors from React Hook Form
                backendErrors={backendErrors} // Backend error messages if any
                defaultValues={defaultValues} // Default values for the form
                width="w-full" // Optionally set width, default is 'w-80'
                height="h-full" // Optionally set height, default is 'h-10'
              />
            </div>
            <div>
              <div className="space-y-4">
                {/* File Input */}
                <div className="relative">
                  <TextField
                    label="Fichiers Réservation:"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    name=""
                    type="file"
                    onChange={(e) => handleFileChange(e, 1)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Specify accepted file types
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Formats acceptés: PDF, JPG, PNG, DOC (Taille max: 10MB)
                  </p>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles_rsv.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Fichiers sélectionnés ({selectedFiles_rsv.length})
                    </h3>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {selectedFiles_rsv.map((data, index) => (
                          <div
                            key={data.id || data.name || index}
                            className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                          >
                            <div className="flex items-center mb-2">
                              {/* File icon based on type */}
                              {getFileIcon(data.name || data.fichier)}

                              <button
                                onClick={() =>
                                  data.fichier
                                    ? handleFileClick(data.fichier)
                                    : handleDownloadFile(data)
                                }
                                className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                title={data.fichier || data.name}
                              >
                                {data.fichier || data.name}
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(data.size)}
                              </span>
                              <button
                                onClick={() => handleDeleteFile(index, 'rsv')}
                                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep == 1 && (
          <div className="space-y-6 mt-[50px]">
            <h2 className="text-xl font-medium !text-gray-700 mb-4">
              Ajouter les acquéreurs de cette Réservation
            </h2>
            <div className="space-y-4">
              <div className="space-y-4">
                {inputList1.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client <span className="text-red-500">*</span>
                        </label>
                        <SelectInput
                          name={`client_${index}`}
                          value={entry.id}
                          required={true}
                          options={
                            Array.isArray(clientsExist)
                              ? clientsExist.map((client) => ({
                                  value: client.id,
                                  label: `${client.nom} ${client.prenom}`,
                                  disabled: client.disabled || false,
                                }))
                              : []
                          }
                          loading={loading_clients}
                          onChange={(value) => {
                            const syntheticEvent = {
                              target: {
                                name: 'id',
                                value: value,
                              },
                            };
                            handleinputchange1(
                              syntheticEvent,
                              index,
                              'select_client'
                            );
                          }}
                          error={
                            errors.inputList1?.[index]?.id?.message ||
                            backendErrors?.inputList1?.[index]?.id
                          }
                          disabled={loading_clients || entry.disabled}
                          placeholder="Sélectionnez un client"
                        />
                        {inputList1.length > 1 && (
                          <>
                            {!entry.id && currentStep === 1 && (
                              <p className="text-red-500 text-xs mt-1">
                                La sélection {"d'"}un client est requise
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`percentage-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Pourcentage: <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`percentage-${index}`}
                          type="number"
                          name="pourcentage"
                          value={entry.pourcentage}
                          disabled={
                            selectedClient && index == 0 ? false : disabled_var
                          }
                          onChange={(e) =>
                            handleinputchange1(e, index, 'percent')
                          }
                          className={`w-full px-3 py-2 border ${
                            inputList1.length > 1 &&
                            !entry.pourcentage &&
                            currentStep === 1
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-gray-800`}
                          placeholder="Entrez un pourcentage (0-100)"
                          min="0"
                          max="100"
                        />
                        {inputList1.length > 1 && (
                          <>
                            {!entry.pourcentage && currentStep === 1 && (
                              <p className="text-red-500 text-xs mt-1">
                                Le pourcentage est requis
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <p style={{ display: enabled, color: 'red' }}>
                        {'la somme des pourcentages doit être 100% !'}
                      </p>
                    </div>
                    {inputList1.length > 1 && (
                      <button
                        onClick={() =>
                          removeClientEntry(index, 'without_new_client')
                        }
                        className="mt-7 p-2 text-white hover:text-red-700 hover:bg-red rounded-md transition-colors bg-[red]"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={addClientEntry}
                className="flex items-center justify-center gap-2 px-4 py-2  text-white rounded-full hover:bg-blue-100 bg-[#2563eb]"
              >
                <PlusIcon className="w-5 h-5" />
                <UsersIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setFormSubmitted_client(false);
                  setShowNewClientForm(true);
                  // Reset form state when opening
                  setNumberOfForms(1);
                  setNewClientForms([
                    {
                      cin: '',
                      nom: '',
                      prenom: '',
                      telephone_num1: '',
                      pourcentage: '',
                      address: '',
                      type_client: '',
                      partenaire_id: '',
                      prospect_id: null,
                      info_client: '',
                      info_prospect: '',
                      projet_id: selectedProjet ? selectedProjet.id : '',
                      situation_familliale: null,
                      nom_mari: null,
                      date_mariage: null,
                      lieu_mariage: null,
                      notifie: '',
                      civilite: '',
                    },
                  ]);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
              >
                <UserPlusIcon className="w-5 h-5" />
                <span>Nouveau Client</span>
              </button>
            </div>

            {showNewClientForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Nouveau Client
                    </h3>
                    <button
                      onClick={() => {
                        setFormSubmitted_client(false);
                        setShowNewClientForm(false);
                        setNumberOfForms(1);
                        setNewClientForms([
                          {
                            cin: '',
                            nom: '',
                            prenom: '',
                            telephone_num1: '',
                            pourcentage: '',
                            address: '',
                            type_client: '',
                            partenaire_id: '',
                            prospect_id: null,
                            info_client: '',
                            info_prospect: '',
                            projet_id: selectedProjet ? selectedProjet.id : '',
                            situation_familliale: null,
                            nom_mari: null,
                            date_mariage: null,
                            lieu_mariage: null,
                            notifie: '',
                            civilite: '',
                          },
                        ]);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Number of Forms Control */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de formulaires:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numberOfForms}
                      onChange={(e) =>
                        handleNumberOfFormsChange(parseInt(e.target.value) || 1)
                      }
                      className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <form onSubmit={handleFakeSubmit} className="w-full">
                    <div className="space-y-6">
                      {newClientForms.map((form, formIndex) => (
                        <div
                          key={formIndex}
                          className="border-t pt-4 first:border-t-0 first:pt-0"
                        >
                          <h4 className="text-md font-medium text-gray-900 mb-3">
                            Client {formIndex + 1}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Type Client */}
                            <div className="sm:col-span-2 md:col-span-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type Client{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={form.type_client || ''}
                                onChange={(e) => {
                                  updateFormField(
                                    formIndex,
                                    'type_client',
                                    e.target.value
                                  );
                                  if (e.target.value != '2') {
                                    updateFormField(
                                      formIndex,
                                      'partenaire_id',
                                      ''
                                    );
                                  }
                                }}
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client && !form.type_client
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              >
                                <option value="">Sélectionnez un type</option>
                                {Object.values(TYPE_CLIENT).map((type) => (
                                  <option
                                    key={type.code}
                                    value={type.code.toString()}
                                  >
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              {formSubmitted_client && !form.type_client && (
                                <p className="text-red-500 text-xs mt-1">
                                  Type client est obligatoire
                                </p>
                              )}
                            </div>

                            {/* Partenaire (conditional) */}
                            {form.type_client == '2' && (
                              <div className="sm:col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Partenaire{' '}
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={form.partenaire_id || ''}
                                  onChange={(e) =>
                                    updateFormField(
                                      formIndex,
                                      'partenaire_id',
                                      e.target.value
                                    )
                                  }
                                  className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                    formSubmitted_client &&
                                    form.type_client == '2' &&
                                    !form.partenaire_id
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  } rounded-md focus:outline-none focus:border-gray-500`}
                                >
                                  <option value="">
                                    Sélectionnez un partenaire
                                  </option>
                                  {partenaires.map((partenaire) => (
                                    <option
                                      key={partenaire.id}
                                      value={partenaire.id}
                                    >
                                      {partenaire.description}
                                    </option>
                                  ))}
                                </select>
                                {formSubmitted_client &&
                                  form.type_client === '2' &&
                                  !form.partenaire_id && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Partenaire est obligatoire
                                    </p>
                                  )}
                              </div>
                            )}

                            {/* CIN */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CIN <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.cin}
                                onChange={async (e) => {
                                  const value = e.target.value;
                                  updateFormField(formIndex, 'cin', value);
                                  if (value.length >= 3) {
                                    await fetch_cin_tel(
                                      'cin',
                                      value,
                                      formIndex,
                                      accessToken,
                                      updateFormField
                                    );
                                  }
                                }}
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client &&
                                  form.cin?.trim() === ''
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {formSubmitted_client &&
                                form.cin?.trim() === '' && (
                                  <p className="text-red-500 text-xs mt-1">
                                    CIN est obligatoire
                                  </p>
                                )}
                            </div>

                            {/* Nom */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.nom}
                                onChange={(e) =>
                                  updateFormField(
                                    formIndex,
                                    'nom',
                                    e.target.value
                                  )
                                }
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client && form.nom?.trim() == ''
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {formSubmitted_client &&
                                form.nom?.trim() == '' && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Nom est obligatoire
                                  </p>
                                )}
                            </div>

                            {/* Prénom */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.prenom}
                                onChange={(e) =>
                                  updateFormField(
                                    formIndex,
                                    'prenom',
                                    e.target.value
                                  )
                                }
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client &&
                                  form.prenom?.trim() === ''
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {formSubmitted_client &&
                                form.prenom?.trim() === '' && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Prénom est obligatoire
                                  </p>
                                )}
                            </div>

                            {/* Civilité */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Civilité <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={form.civilite || ''}
                                onChange={(e) =>
                                  updateFormField(
                                    formIndex,
                                    'civilite',
                                    e.target.value
                                  )
                                }
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client && !form.civilite
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              >
                                <option value="">
                                  Sélectionnez un Civilité
                                </option>
                                {Object.values(CIVILITES).map((type) => (
                                  <option
                                    key={type.code}
                                    value={type.code.toString()}
                                  >
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              {formSubmitted_client && !form.civilite && (
                                <p className="text-red-500 text-xs mt-1">
                                  Civilité est obligatoire
                                </p>
                              )}
                            </div>

                            {/* Pourcentage */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pourcentage{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                min="0"
                                max="100"
                                value={form.pourcentage}
                                onChange={(e) =>
                                  updateFormField(
                                    formIndex,
                                    'pourcentage',
                                    e.target.value
                                  )
                                }
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  (formSubmitted_client &&
                                    form.pourcentage == '') ||
                                  isNaN(Number(form.pourcentage)) ||
                                  Number(form.pourcentage) < 0 ||
                                  Number(form.pourcentage) > 100
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {(formSubmitted_client &&
                                form.pourcentage == '') ||
                                (isNaN(Number(form.pourcentage)) && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Pourcentage est obligatoire
                                  </p>
                                ))}
                              {formSubmitted_client &&
                                !isNaN(Number(form.pourcentage)) &&
                                (Number(form.pourcentage) < 0 ||
                                  Number(form.pourcentage) > 100) && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Doit être entre 0 et 100
                                  </p>
                                )}
                              <p style={{ display: enabled, color: 'red' }}>
                                {'la somme des pourcentages doit être 100% !'}
                              </p>
                            </div>

                            {/* Téléphone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Téléphone{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                pattern="[0-9]{8,}"
                                value={form.telephone_num1}
                                onChange={async (e) => {
                                  const value = e.target.value;
                                  updateFormField(
                                    formIndex,
                                    'telephone_num1',
                                    value
                                  );
                                  if (value.length >= 8) {
                                    await fetch_cin_tel(
                                      'tel',
                                      value,
                                      formIndex,
                                      accessToken,
                                      updateFormField
                                    );
                                  }
                                }}
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  (formSubmitted_client &&
                                    String(form.telephone_num1 || '').length <
                                      8) ||
                                  isNaN(form.telephone_num1)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {formSubmitted_client &&
                                String(form.telephone_num1 || '').length <
                                  8 && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Minimum 8 chiffres
                                  </p>
                                )}
                            </div>

                            {/* Situation Familiale */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Situation Familiale{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={form.situation_familliale || ''}
                                onChange={(e) => {
                                  const newSituation = e.target.value;
                                  updateFormField(
                                    formIndex,
                                    'situation_familliale',
                                    newSituation
                                  );
                                  if (newSituation != '2') {
                                    updateFormField(formIndex, 'nom_mari', '');
                                    updateFormField(
                                      formIndex,
                                      'date_mariage',
                                      null
                                    );
                                    updateFormField(
                                      formIndex,
                                      'lieu_mariage',
                                      ''
                                    );
                                  }
                                }}
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client &&
                                  !form.situation_familliale
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              >
                                <option value="">
                                  Sélectionnez une situation
                                </option>
                                {Object.values(SITUATION_FAMILIALLE).map(
                                  (situation) => (
                                    <option
                                      key={situation.code}
                                      value={situation.code.toString()}
                                    >
                                      {situation.label}
                                    </option>
                                  )
                                )}
                              </select>
                              {formSubmitted_client &&
                                !form.situation_familliale && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Situation familiale est obligatoire
                                  </p>
                                )}
                            </div>

                            {/* Marriage Fields (conditional) */}
                            {form.situation_familliale == '2' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marié(e) à M/MME{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={form.nom_mari || ''}
                                    onChange={(e) =>
                                      updateFormField(
                                        formIndex,
                                        'nom_mari',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                      formSubmitted_client &&
                                      form.situation_familliale == '2' &&
                                      (form.nom_mari || '').trim() === ''
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:border-gray-500`}
                                  />
                                  {formSubmitted_client &&
                                    form.situation_familliale == '2' &&
                                    form.nom_mari?.trim() === '' && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Nom du conjoint est obligatoire
                                      </p>
                                    )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de Mariage{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    value={form.date_mariage || ''}
                                    onChange={(e) =>
                                      updateFormField(
                                        formIndex,
                                        'date_mariage',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                      formSubmitted_client &&
                                      form.situation_familliale == '2' &&
                                      (form.date_mariage || '').trim() === ''
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:border-gray-500`}
                                  />
                                  {formSubmitted_client &&
                                    form.situation_familliale == '2' &&
                                    !form.date_mariage && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Date de mariage est obligatoire
                                      </p>
                                    )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lieu de Mariage{' '}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={form.lieu_mariage || ''}
                                    onChange={(e) =>
                                      updateFormField(
                                        formIndex,
                                        'lieu_mariage',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                      formSubmitted_client &&
                                      form.situation_familliale == '2' &&
                                      (form.lieu_mariage || '').trim() === ''
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:border-gray-500`}
                                  />
                                  {formSubmitted_client &&
                                    form.situation_familliale == '2' &&
                                    form.lieu_mariage?.trim() === '' && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Lieu de mariage est obligatoire
                                      </p>
                                    )}
                                </div>
                              </>
                            )}

                            {/* Notifié */}
                            <div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Accepte {"d'"}être contacté{' '}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`notifie_${formIndex}`} // Make name unique per client
                                      value="1" // Use consistent values (1 for Oui, 0 for Non)
                                      checked={form.notifie === '1'}
                                      onChange={(e) =>
                                        updateFormField(
                                          formIndex,
                                          'notifie',
                                          e.target.value
                                        )
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                      Oui
                                    </span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name={`notifie_${formIndex}`} // Same unique name
                                      value="0"
                                      checked={form.notifie === '0'}
                                      onChange={(e) =>
                                        updateFormField(
                                          formIndex,
                                          'notifie',
                                          e.target.value
                                        )
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                      Non
                                    </span>
                                  </label>
                                </div>
                                {formSubmitted_client &&
                                  form.notifie === undefined && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Cette sélection est obligatoire
                                    </p>
                                  )}
                              </div>
                              {formSubmitted_client && !form.notifie && (
                                <p className="text-red-500 text-xs mt-1">
                                  Cette sélection est obligatoire
                                </p>
                              )}
                            </div>

                            {/* Adresse */}
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse
                              </label>
                              <textarea
                                value={form.address}
                                onChange={(e) =>
                                  updateFormField(
                                    formIndex,
                                    'address',
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormSubmitted_client(false);
                          handleAnnuler_form();
                          setShowNewClientForm(false);
                          setNumberOfForms(1);
                          setNewClientForms([
                            {
                              cin: '',
                              nom: '',
                              prenom: '',
                              telephone_num1: '',
                              pourcentage: '',
                              address: '',
                              type_client: '',
                              partenaire_id: '',
                              prospect_id: null,
                              info_client: '',
                              info_prospect: '',
                              projet_id: selectedProjet
                                ? selectedProjet.id
                                : '',
                              situation_familliale: null,
                              nom_mari: null,
                              date_mariage: null,
                              lieu_mariage: null,
                              notifie: '',
                              civilite: '',
                            },
                          ]);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={!isFormValid() || check || check_p}
                        onClick={() => {
                          setFormSubmitted_client(true);
                          if (isFormValid()) {
                            const updatedClients = [
                              ...addedClients,
                              ...newClientForms,
                            ];
                            calculateTotalPercentage_new_form(updatedClients);
                            setAddedClients(updatedClients);
                            setValue('clients', updatedClients);
                            setShowNewClientForm(false);
                            setNumberOfForms(1);
                            setNewClientForms([
                              {
                                cin: '',
                                nom: '',
                                prenom: '',
                                telephone_num1: '',
                                pourcentage: '',
                                address: '',
                                type_client: '',
                                partenaire_id: '',
                                prospect_id: null,
                                info_client: '',
                                info_prospect: '',
                                projet_id: selectedProjet
                                  ? selectedProjet.id
                                  : '',
                                situation_familliale: null,
                                nom_mari: null,
                                date_mariage: null,
                                lieu_mariage: null,
                                notifie: '',
                                civilite: '',
                              },
                            ]);
                          }
                        }}
                        className={`px-6 py-2 rounded-md ${
                          !isFormValid() || check || check_p
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <>
              {addedClients.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Clients ajoutés
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addedClients.map((client, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                                <h4 className="font-medium text-gray-900 truncate">
                                  {client.cin}
                                </h4>
                              </div>
                              <div className="flex items-center mb-2">
                                <User className="w-4 h-4 text-gray-500 mr-2" />
                                <h4 className="font-medium text-gray-900 truncate">
                                  {client.nom} {client.prenom}
                                </h4>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Percent className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span
                                    className="truncate "
                                    style={{
                                      color: 'green',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {client.pourcentage != undefined &&
                                      client.pourcentage}
                                  </span>
                                </div>
                                {client.telephone_num1 && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span>{client.telephone_num1}</span>
                                  </div>
                                )}
                                {client.address && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="truncate">
                                      {client.address}
                                    </span>
                                  </div>
                                )}
                                {client.type_client && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Briefcase className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="truncate">
                                      {client.type_client && (
                                        <div className="flex items-center text-sm text-gray-600">
                                          <span className="truncate">
                                            {client.type_client === '1'
                                              ? 'Particulier'
                                              : `Partenaire(${
                                                  partenaires.find(
                                                    (p) =>
                                                      p.id ==
                                                      client.partenaire_id
                                                  )?.description || 'inconnu'
                                                })`}
                                          </span>
                                        </div>
                                      )}
                                    </span>
                                  </div>
                                )}

                                {/* Situation Familiale Display */}
                                {client.situation_familliale && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center text-sm text-gray-600">
                                      {client.situation_familliale === '1' ? (
                                        <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      ) : client.situation_familliale ===
                                        '2' ? (
                                        <Heart className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      ) : client.situation_familliale ===
                                        '3' ? (
                                        <UserX className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      ) : (
                                        <UserCog className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                      )}
                                      <span>
                                        {SITUATION_FAMILIALLE[
                                          client.situation_familliale
                                        ]?.label || 'Inconnue'}
                                      </span>
                                    </div>

                                    {/* Marriage Details - Only shown when "Marié" */}
                                    {client.situation_familliale === '2' && (
                                      <>
                                        {client.nom_mari && (
                                          <div className="flex items-center text-sm text-gray-600 ml-6">
                                            <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>
                                              Conjoint: {client.nom_mari}
                                            </span>
                                          </div>
                                        )}
                                        {client.date_mariage && (
                                          <div className="flex items-center text-sm text-gray-600 ml-6">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>
                                              Marié depuis:{' '}
                                              {new Date(
                                                client.date_mariage
                                              ).toLocaleDateString('fr-FR')}
                                            </span>
                                          </div>
                                        )}
                                        {client.lieu_mariage && (
                                          <div className="flex items-center text-sm text-gray-600 ml-6">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                            <span>
                                              Lieu: {client.lieu_mariage}
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {client.notifie == '1' && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                          {client.notifie == '1' &&
                                            "Accepte d'être contacté"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {/* Edit button */}
                              <button
                                onClick={() => {
                                  setClientToEdit({
                                    ...client,
                                    originalIndex: index,
                                  });
                                  setShowEditModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200"
                                aria-label="Modifier le client"
                              >
                                <PencilLine className="w-5 h-5" />
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => {
                                  handleAnnuler_client_added(
                                    client.pourcentage
                                  );

                                  // Update both state and form value
                                  const updatedClients = addedClients.filter(
                                    (_, i) => i !== index
                                  );
                                  setAddedClients(updatedClients);
                                  setValue('clients', updatedClients);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
                                aria-label="Supprimer le client"
                              >
                                <XIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Client Modal */}
              {showEditModal && clientToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Modifier Client
                      </h3>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XIcon className="w-6 h-6" />
                      </button>
                    </div>
                    <form onSubmit={handleFakeSubmit_Edit} className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type Client Select */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type Client{' '}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            value={clientToEdit.type_client || ''}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setClientToEdit({
                                ...clientToEdit,
                                type_client: newType,
                                // Reset partenaire_id when changing from Société to Particulier
                                ...(newType != '2' && { partenaire_id: '' }),
                              });
                            }}
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              !clientToEdit.type_client
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          >
                            <option value="">Sélectionnez un type</option>
                            {Object.values(TYPE_CLIENT).map((type) => (
                              <option
                                key={type.code}
                                value={type.code.toString()}
                              >
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {!clientToEdit.type_client && (
                            <p className="text-red-500 text-xs mt-1">
                              Type client est obligatoire
                            </p>
                          )}
                        </div>

                        {/* Conditional Partenaire Select - only shows when type_client === "2" */}
                        {clientToEdit.type_client == '2' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Partenaire{' '}
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                              value={clientToEdit.partenaire_id || ''}
                              onChange={(e) =>
                                setClientToEdit({
                                  ...clientToEdit,
                                  partenaire_id: e.target.value,
                                })
                              }
                              className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                clientToEdit.type_client === '2' &&
                                !clientToEdit.partenaire_id
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } rounded-md focus:outline-none focus:border-gray-500`}
                            >
                              <option value="">
                                Sélectionnez un partenaire
                              </option>
                              {partenaires.map((partenaire) => (
                                <option
                                  key={partenaire.id}
                                  value={partenaire.id}
                                >
                                  {partenaire.description}
                                </option>
                              ))}
                            </select>
                            {clientToEdit.type_client == '2' &&
                              !clientToEdit.partenaire_id && (
                                <p className="text-red-500 text-xs mt-1">
                                  Partenaire est obligatoire pour Société
                                </p>
                              )}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cin<span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={clientToEdit.cin}
                            onChange={async (e) => {
                              const value = e.target.value;
                              setClientToEdit({
                                ...clientToEdit,
                                cin: e.target.value,
                              });

                              // Only make API call if CIN has sufficient length
                              if (value.length >= 8) {
                                await fetch_cin_tel(
                                  'cin',
                                  value,
                                  0, // Default formIndex or pass the correct index
                                  accessToken,
                                  updateFormField
                                );
                              }
                            }}
                            onBlur={async (e) => {
                              const value = e.target.value;
                              // Optional: Validate again when leaving the field
                              if (value.length >= 8) {
                                await fetch_cin_tel(
                                  'cin',
                                  value,
                                  0, // Default formIndex or pass the correct index
                                  accessToken,
                                  updateFormField
                                );
                              }
                            }}
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              clientToEdit.cin?.trim() === ''
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          />
                          {clientToEdit.cin?.trim() === '' && (
                            <p className="text-red-500 text-xs mt-1">
                              CIN est obligatoire
                            </p>
                          )}
                        </div>

                        {/* NOM */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={clientToEdit.nom}
                            onChange={(e) =>
                              setClientToEdit({
                                ...clientToEdit,
                                nom: e.target.value,
                              })
                            }
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              clientToEdit.nom?.trim() === ''
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          />
                          {clientToEdit.nom?.trim() === '' && (
                            <p className="text-red-500 text-xs mt-1">
                              Nom est obligatoire
                            </p>
                          )}
                        </div>

                        {/* PRÉNOM */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={clientToEdit.prenom}
                            onChange={(e) =>
                              setClientToEdit({
                                ...clientToEdit,
                                prenom: e.target.value,
                              })
                            }
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              clientToEdit.prenom?.trim() === ''
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          />
                          {clientToEdit.prenom?.trim() === '' && (
                            <p className="text-red-500 text-xs mt-1">
                              Prénom est obligatoire
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Civilité{' '}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            value={clientToEdit.civilite || ''}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setClientToEdit({
                                ...clientToEdit,
                                civilite: newType,
                              });
                            }}
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              !clientToEdit.civilite
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          >
                            <option value="">Sélectionnez un type</option>
                            {Object.values(CIVILITES).map((type) => (
                              <option
                                key={type.code}
                                value={type.code.toString()}
                              >
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {!clientToEdit.civilite && (
                            <p className="text-red-500 text-xs mt-1">
                              Civilité est obligatoire
                            </p>
                          )}
                        </div>

                        {/* POURCENTAGE */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pourcentage{' '}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={clientToEdit.pourcentage}
                            onChange={(e) =>
                              setClientToEdit({
                                ...clientToEdit,
                                pourcentage: e.target.value,
                              })
                            }
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              clientToEdit.pourcentage === '' ||
                              isNaN(Number(clientToEdit.pourcentage)) ||
                              Number(clientToEdit.pourcentage) < 0 ||
                              Number(clientToEdit.pourcentage) > 100
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          />
                          {clientToEdit.pourcentage == '' ||
                            (isNaN(Number(clientToEdit.pourcentage)) && (
                              <p className="text-red-500 text-xs mt-1">
                                Pourcentage est obligatoire
                              </p>
                            ))}
                          {!isNaN(Number(clientToEdit.pourcentage)) &&
                            (Number(clientToEdit.pourcentage) < 0 ||
                              Number(clientToEdit.pourcentage) > 100) && (
                              <p className="text-red-500 text-xs mt-1">
                                Doit être entre 0 et 100
                              </p>
                            )}
                        </div>

                        {/* TÉLÉPHONE */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone{' '}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="tel"
                            pattern="[0-9]{8,}"
                            value={clientToEdit.telephone_num1}
                            onChange={async (e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
                              setClientToEdit({
                                ...clientToEdit,
                                telephone_num1: value,
                              });

                              // Only make API call if phone number has sufficient length
                              if (value.length >= 8) {
                                await fetch_cin_tel(
                                  'tel', // Changed from 'cin' to 'tel' since this is a telephone field
                                  value,
                                  0,
                                  accessToken,
                                  updateFormField
                                );
                              }
                            }}
                            onBlur={async (e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              // Validate again when leaving the field
                              if (value.length >= 8) {
                                await fetch_cin_tel(
                                  'tel',
                                  value,
                                  0, // Default formIndex or pass the correct index
                                  accessToken,
                                  updateFormField
                                );
                              }
                            }}
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              String(clientToEdit.telephone_num1 || '').length <
                                8 || isNaN(clientToEdit.telephone_num1)
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          />
                          {String(clientToEdit.telephone_num1 || '').length <
                            8 && (
                            <p className="text-red-500 text-xs mt-1">
                              Minimum 8 chiffres
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Situation Familiale{' '}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            value={clientToEdit.situation_familliale || ''}
                            onChange={(e) => {
                              const newSituation = e.target.value;
                              setClientToEdit({
                                ...clientToEdit,
                                situation_familliale: newSituation,
                                // Clear marriage fields when not married
                                ...(newSituation != '2' && {
                                  nom_mari: '',
                                  date_mariage: null,
                                  lieu_mariage: '',
                                }),
                              });
                            }}
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              !clientToEdit.situation_familliale
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500`}
                          >
                            <option value="">Sélectionnez une situation</option>
                            {Object.values(SITUATION_FAMILIALLE).map(
                              (situation) => (
                                <option
                                  key={situation.code}
                                  value={situation.code.toString()}
                                >
                                  {situation.label}
                                </option>
                              )
                            )}
                          </select>
                          {!clientToEdit.situation_familliale && (
                            <p className="text-red-500 text-xs mt-1">
                              Situation familiale est obligatoire
                            </p>
                          )}
                        </div>

                        {/* Conditional Marriage Fields */}
                        {clientToEdit.situation_familliale == '2' && (
                          <div className="mt-4 space-y-4">
                            {/* Spouse Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marié(e) à M/MME
                              </label>
                              <input
                                type="text"
                                value={clientToEdit.nom_mari || ''}
                                onChange={(e) =>
                                  setClientToEdit({
                                    ...clientToEdit,
                                    nom_mari: e.target.value,
                                  })
                                }
                                className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                  formSubmitted_client &&
                                  clientToEdit.situation_familliale == '2' &&
                                  clientToEdit.nom_mari?.trim() === ''
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md focus:outline-none focus:border-gray-500`}
                              />
                              {formSubmitted_client &&
                                clientToEdit.situation_familliale == '2' &&
                                clientToEdit.nom_mari?.trim() === '' && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Nom du conjoint est obligatoire
                                  </p>
                                )}
                            </div>

                            {/* Marriage Date and Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Marriage Date */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date de Mariage
                                </label>
                                <input
                                  type="date"
                                  value={clientToEdit.date_mariage || ''}
                                  onChange={(e) =>
                                    setClientToEdit({
                                      ...clientToEdit,
                                      date_mariage: e.target.value,
                                    })
                                  }
                                  className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                    formSubmitted_client &&
                                    clientToEdit.situation_familliale == '2' &&
                                    !clientToEdit.date_mariage
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  } rounded-md focus:outline-none focus:border-gray-500`}
                                />
                                {formSubmitted_client &&
                                  clientToEdit.situation_familliale == '2' &&
                                  !clientToEdit.date_mariage && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Date de mariage est obligatoire
                                    </p>
                                  )}
                              </div>

                              {/* Marriage Location */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Lieu de Mariage
                                </label>
                                <input
                                  type="text"
                                  value={clientToEdit.lieu_mariage || ''}
                                  onChange={(e) =>
                                    setClientToEdit({
                                      ...clientToEdit,
                                      lieu_mariage: e.target.value,
                                    })
                                  }
                                  className={`w-full h-[38px] px-3 py-2 text-sm border ${
                                    formSubmitted_client &&
                                    clientToEdit.situation_familliale == '2' &&
                                    clientToEdit.lieu_mariage?.trim() === ''
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  } rounded-md focus:outline-none focus:border-gray-500`}
                                />
                                {formSubmitted_client &&
                                  clientToEdit.situation_familliale == '2' &&
                                  clientToEdit.lieu_mariage?.trim() === '' && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Lieu de mariage est obligatoire
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Accepte{"d'"}être contacté
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <div
                            className={`w-full h-[38px] px-3 py-2 text-sm border ${
                              clientToEdit.notifie === undefined ||
                              clientToEdit.notifie === null
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:border-gray-500 flex items-center`}
                          >
                            <div className="flex space-x-4">
                              {/* Yes Radio Button */}
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name="notifie"
                                  value="1"
                                  checked={clientToEdit.notifie == '1'}
                                  onChange={(e) => {
                                    console.log(
                                      'Selected value:',
                                      e.target.value
                                    );
                                    setClientToEdit({
                                      ...clientToEdit,
                                      notifie: e.target.value,
                                    });
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Oui
                                </span>
                              </label>

                              {/* No Radio Button */}
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name="notifie"
                                  value="0"
                                  checked={clientToEdit.notifie == ''}
                                  onChange={(e) => {
                                    console.log(
                                      'Selected value:',
                                      e.target.value
                                    );
                                    setClientToEdit({
                                      ...clientToEdit,
                                      notifie: e.target.value,
                                    });
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Non
                                </span>
                              </label>
                            </div>
                          </div>

                          {(clientToEdit.notifie === undefined ||
                            clientToEdit.notifie === null) && (
                            <p className="text-red-500 text-xs mt-1">
                              Cette sélection est obligatoire
                            </p>
                          )}
                        </div>
                        {/* ADDRESS (Optional) */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse
                          </label>
                          <textarea
                            value={clientToEdit.address}
                            onChange={(e) =>
                              setClientToEdit({
                                ...clientToEdit,
                                address: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-0"
                          ></textarea>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => setShowEditModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={!isFormValid_Edit()}
                          className={`px-6 py-2 rounded-md ${
                            !isFormValid_Edit()
                              ? 'bg-gray-400 cursor-not-allowed' // Disabled style
                              : 'bg-blue-600 hover:bg-blue-700' // Enabled style
                          } text-white`}
                          onClick={() => {
                            if (isFormValid_Edit()) {
                              // Update the client in the addedClients array
                              const updatedClients = [...addedClients];
                              updatedClients[clientToEdit.originalIndex] = {
                                cin: clientToEdit.cin,
                                nom: clientToEdit.nom,
                                prenom: clientToEdit.prenom,
                                telephone_num1: clientToEdit.telephone_num1,
                                pourcentage: clientToEdit.pourcentage,
                                address: clientToEdit.address,
                                type_client: clientToEdit.type_client,
                                partenaire_id:
                                  clientToEdit.type_client === '2'
                                    ? clientToEdit.partenaire_id
                                    : null,
                                situation_familliale:
                                  clientToEdit.situation_familliale,
                                // Clear marriage fields if not married
                                nom_mari:
                                  clientToEdit.situation_familliale == '2'
                                    ? clientToEdit.nom_mari
                                    : null,
                                date_mariage:
                                  clientToEdit.situation_familliale == '2'
                                    ? clientToEdit.date_mariage
                                    : null,
                                lieu_mariage:
                                  clientToEdit.situation_familliale == '2'
                                    ? clientToEdit.lieu_mariage
                                    : null,
                                civilite: clientToEdit.civilite,
                                notifie: clientToEdit.notifie,
                              };
                              setAddedClients(updatedClients);
                              setValue('clients', updatedClients);

                              // Then calculate with the NEW updatedClients array
                              const sum_percent_select = inputList1.reduce(
                                (sum, nombres) =>
                                  sum + Number(nombres.pourcentage) || 0,
                                0
                              );

                              const totalPercentage_client_form =
                                updatedClients.reduce(
                                  (sum, client) =>
                                    sum + Number(client.pourcentage || 0),
                                  0
                                );

                              const totalPercentage =
                                sum_percent_select +
                                totalPercentage_client_form;
                              setValue('pourcentages', totalPercentage);

                              const isValid = totalPercentage === 100;
                              setValue('verifierPourcentages', isValid);
                              setenabled(isValid ? 'none' : 'block');
                              console.log(
                                'total==>' +
                                  totalPercentage +
                                  'w valid==>' +
                                  getValues('verifierPourcentages')
                              );

                              setShowEditModal(false);
                            }
                          }}
                        >
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <p style={{ display: 'none' }}>
                {currentStep === 0 &&
                  watch('bien_id') === '' &&
                  '• Select a property\n'}
                {currentStep === 0 &&
                  watch('code_reservation') === '' &&
                  '• Enter reservation code\n'}
                {currentStep === 0 &&
                  watch('date_reservation') === '' &&
                  '• Choose reservation date\n'}
                {currentStep === 0 &&
                  info_reservation !== null &&
                  '• Reservation already exists\n'}
                {currentStep === 0 &&
                  loading_bien &&
                  '• Loading property data...\n'}
                {currentStep === 1 &&
                  !watch('verifierPourcentages') &&
                  '• Fix percentage distribution (must total 100%)\n'}
              </p>
            </>
          </div>
        )}

        {currentStep == 2 && (
          <div className="space-y-6 mt-[50px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {!isEditing && (
                <div className="flex items-center">
                  <Controller
                    name="sr"
                    control={control}
                    defaultValue={defaultValues?.sr || ''}
                    render={({ field }) => (
                      <div className="flex items-center">
                        <input
                          {...field}
                          id="sr"
                          type="checkbox"
                          checked={field.value == '1'} // Or whatever string value you use
                          onChange={(e) =>
                            field.onChange(e.target.checked ? '1' : '0')
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="sr"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          SR
                        </label>
                      </div>
                    )}
                  />
                </div>
              )}

              <TextField
                label="Prix:"
                name="prix"
                control={control}
                errors={errors}
                disabled={true}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />

              <TextField
                label="Prix Unitaire:"
                name="prix_unitaire"
                control={control}
                errors={errors}
                disabled={true}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <p style={{ display: 'none' }}>
                {'superficie_jardin_calculer' +
                  watch('superficie_jardin_calculer') +
                  'sup habitable=>' +
                  watch('superficie_habitable') +
                  'superficie_balcon_calculer=>' +
                  watch('Superficie_balcon_calculer') +
                  'sup terrasse==>' +
                  watch('superficie_terrasse_calculer') +
                  'prix box==>' +
                  watch('prix_box') +
                  'prix parking==>' +
                  watch('prix_parking') +
                  'prix remis=>' +
                  watch('prix_remise') +
                  'prix forfetaire=>' +
                  watch('prix_forfetaire')}
              </p>
              <TextField
                label="Prix unitaire remisé:"
                name="prix_remise"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={(e) => {
                  handleChangePrixRemise(e);
                }}
              />

              <TextField
                label="Remise Forfétaire:"
                name="prix_forfetaire"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={(e) => {
                  handleChangePrixForfetaire(e);
                }}
              />

              <TextField
                label="Prix Final:"
                name="prix_final"
                control={control}
                errors={errors}
                disabled={true}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              {!isEditing && (
                <>
                  <TextField
                    label="Reste Avance:"
                    name="avance_minimale"
                    control={control}
                    errors={errors}
                    disabled={true}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                  <div>
                    {' '}
                    <TextField
                      label="Montant:"
                      name="avance"
                      required={true}
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      type="number"
                      onChange={(e) => {
                        setValue('reste', watch('prix_final') - e.target.value);
                      }}
                    />
                    {watch('avance') != '' &&
                      watch('avance') == 0 &&
                      user?.role > 2 && (
                        <p style={{ color: 'red' }}>
                          Le montant ne peut pas être 0 pour votre rôle
                        </p>
                      )}
                    {watch('avance') > 0 &&
                      watch('avance') < watch('avance_minimale') && (
                        <p style={{ color: 'red' }}>
                          Le montant doit être au moins{' '}
                          {watch('avance_minimale')}
                        </p>
                      )}
                  </div>
                  <TextField
                    label="Reste:"
                    name="reste"
                    control={control}
                    errors={errors}
                    disabled={true}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </>
              )}
              {isEditing && (
                <SelectInput
                  label="Mode Financement :"
                  placeholder="Sélectionner un mode de financement"
                  name="mode_financement"
                  value={watch('mode_financement')}
                  required={true}
                  options={Object.values(MODE_FINANCE || {}).map((item) => ({
                    value: item.code || item.value,
                    label: item.label || item.name,
                  }))}
                  onChange={(value) => {
                    setValue('mode_financement', value);
                  }}
                  error={
                    errors.mode_financement?.message ||
                    backendErrors?.mode_financement
                  }
                />
              )}
            </div>

            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput
                  label="Mode Financement :"
                  placeholder="Sélectionner un mode de financement"
                  name="mode_financement"
                  value={watch('mode_financement')}
                  required={true}
                  options={Object.values(MODE_FINANCE || {}).map((item) => ({
                    value: item.code || item.value,
                    label: item.label || item.name,
                  }))}
                  onChange={(value) => {
                    setValue('mode_financement', value);
                  }}
                  error={
                    errors.mode_financement?.message ||
                    backendErrors?.mode_financement
                  }
                />

                <>
                  <SelectInput
                    label="Mode Paiement :"
                    placeholder="Sélectionner un mode de paiement"
                    name="mode_paiement"
                    value={watch('mode_paiement')}
                    required={true}
                    options={Object.values(MODE_PAIEMENT || {}).map((item) => ({
                      value: item.code || item.value,
                      label: item.label || item.name,
                    }))}
                    onChange={(value) => {
                      setValue('mode_paiement', value);
                    }}
                    error={
                      errors.mode_paiement?.message ||
                      backendErrors?.mode_paiement
                    }
                  />
                  {watch('mode_paiement') != 1 &&
                    watch('mode_paiement') != '' && (
                      <>
                        <SelectInput
                          label="Banque:"
                          placeholder="Sélectionner une banque"
                          name="banque_id"
                          value={watch('banque_id')}
                          required={true}
                          options={
                            Array.isArray(banques)
                              ? banques.map((banque) => ({
                                  value: banque.id,
                                  label:
                                    banque.nom ||
                                    banque.name ||
                                    `Banque ${banque.id}`,
                                }))
                              : []
                          }
                          loading={loading_1}
                          onChange={(value) => {
                            setValue('banque_id', value);
                          }}
                          error={
                            errors.banque_id?.message ||
                            backendErrors?.banque_id
                          }
                        />

                        <TextField
                          label="N° Paiement:"
                          name="numero_paiement"
                          control={control}
                          errors={errors}
                          required={true}
                          backendErrors={backendErrors}
                          defaultValues={defaultValues}
                        />
                      </>
                    )}

                  {watch('mode_paiement') != '' &&
                    watch('mode_paiement') != 1 &&
                    watch('mode_paiement') != 6 &&
                    watch('mode_paiement') != 5 && (
                      <TextField
                        label="Date Echéance:"
                        name="echeance"
                        type="date"
                        required={true}
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                      />
                    )}
                  {watch('avance') != '' && watch('avance') == 0 && (
                    <Controller
                      name="check_montant"
                      control={control}
                      defaultValue={defaultValues?.check_montant || ''}
                      render={({ field }) => (
                        <div className="flex items-center">
                          <input
                            {...field}
                            id="check_montant"
                            type="checkbox"
                            checked={field.value == true} // Or whatever string value you use
                            onChange={(e) =>
                              field.onChange(e.target.checked ? true : false)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="check_montant"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Voulez vous Enregistrer la Réservation sans montant?
                            (Prière de saisir un commentaire)
                          </label>
                        </div>
                      )}
                    />
                  )}
                  <TextField
                    label="Commentaire:"
                    name="commentaireAvance"
                    required={
                      watch('avance') == 0 || watch('check_montant')
                        ? true
                        : false
                    }
                    multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                    control={control} // Passed from useForm hook
                    errors={errors} // Validation errors from React Hook Form
                    backendErrors={backendErrors} // Backend error messages if any
                    defaultValues={defaultValues} // Default values for the form
                    width="w-full" // Optionally set width, default is 'w-80'
                    height="h-full" // Optionally set height, default is 'h-10'
                  />
                  {watch('avance') != '' && watch('avance') != 0 && (
                    <div>
                      <div className="space-y-4F">
                        {/* File Input */}
                        <div className="relative">
                          <TextField
                            label="Fichiers Paiement:"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            name=""
                            type="file"
                            onChange={(e) => handleFileChange(e, 2)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Specify accepted file types
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Formats acceptés: PDF, JPG, PNG, DOC (Taille max:
                            10MB)
                          </p>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles_avc.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-primary-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Fichiers sélectionnés ({selectedFiles_avc.length})
                            </h3>

                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {selectedFiles_avc.map((data, index) => (
                                  <div
                                    key={data.id || data.name || index}
                                    className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                                  >
                                    <div className="flex items-center mb-2">
                                      {/* File icon based on type */}
                                      {getFileIcon(data.name || data.fichier)}

                                      <button
                                        onClick={() =>
                                          data.fichier
                                            ? handleFileClick(data.fichier)
                                            : handleDownloadFile(data)
                                        }
                                        className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                        title={data.fichier || data.name}
                                      >
                                        {data.fichier || data.name}
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                      <span className="text-xs text-gray-500">
                                        {formatFileSize(data.size)}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleDeleteFile(index, 'avc')
                                        }
                                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                        title="Supprimer"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {user?.role <= 2 && watch('avance') > 0 && (
                          <>
                            <div className="col-span-3">
                              <h2
                                className="text-lg font-medium border-b pb-2 mb-4"
                                style={{ color: '#231651' }}
                              >
                                Informations Encaissement
                              </h2>
                            </div>

                            <TextField
                              label="N° Encaissement:"
                              name="num_remise"
                              type="number"
                              required={
                                watch('date_encaissement') != '' ? true : false
                              }
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />

                            <TextField
                              label="Date Encaissement:"
                              name="date_encaissement"
                              type="date"
                              required={
                                watch('num_remise') != '' ? true : false
                              }
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button" // Prevent accidental form submission
            onClick={goToPrevStep}
            className={`px-6 py-2 rounded-md border border-gray-300 text-gray-700 ${
              currentStep == 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50'
            }`}
            disabled={currentStep == 0}
          >
            Précédent
          </button>

          {currentStep == steps.length - 1 ? (
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isButtonDisabled()}
              loading={loading.form}
              className={isButtonDisabled() ? '!bg-[rgb(45_133_72_/_28%)]' : ''}
            >
              Enregistrer
            </Button>
          ) : (
            <button
              type="button"
              onClick={goToNextStep}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                (currentStep == 0 &&
                  (watch('bien_id') == '' ||
                    watch('code_reservation') == '' ||
                    watch('date_reservation') == '' ||
                    info_reservation != null ||
                    loading_bien == true)) ||
                (currentStep == 1 && !validateClientStep())
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={
                (currentStep == 0 &&
                  (watch('bien_id') == '' ||
                    watch('code_reservation') == '' ||
                    watch('date_reservation') == '' ||
                    info_reservation != null ||
                    loading_bien == true)) ||
                (currentStep == 1 && !validateClientStep())
              }
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </>
  );
}
