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
  Percent,
} from 'lucide-react';
import TextField from '@/components/Textfield'; // Import the component
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import Pusher from 'pusher-js';
import AutocompleteClient from './AutocompleteClient';
import BreadCrumb from '../../navigation/BreadCrumb';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AutocompleteBien from './AutocompleteBien';
import {
  fetchData_Select,
  fetchDataByProjet,
  fetchDataByProjet_2,
  fetchList_fichier_exist,
} from '../../../../../src/configs/api-utils';
import Modal from '@/components/Modal';
import Modal_File from './Modal_file';

export default function ReservationForm({ id }) {
  const current = new Date();
  const [loading_bien, setLoading_bien] = useState(true);
  const [loading, setLoading] = useState({ form: false, reservations: false });

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
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || null;
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const [formData, setFormData] = useState(null);
  const isEditing = !!id;

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
  const [varInputlist, setVarInputlist] = useState(false);
  const [alert_client, set_alert_client] = useState(false);
  const [check, set_check] = useState(false);
  const [check_p, set_check_p] = useState(false);
  const [addOreditPopup, setAddOreditPopup] = useState(0);
  const [filesList, setfilesList] = useState([]);
  const [filesList_avc, setfilesList_avc] = useState([]);
  const save_buttonColor = process.env.NEXT_PUBLIC_save_buttonColor;
  const [loading_1, setLoading_1] = useState(false);
  const selectedClient = localStorage.getItem('selectedClient');

  const [addedClients, setAddedClients] = useState([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [inputList, setinputList] = useState([
    {
      nom: '',
      prenom: '',
      pourcentage: '',
      email: null,
      telephone_num1: '',
      telephone_num2: null,
      notifie: '',
      civilite: '',
      adresse: null,
      ville: null,
      pays: null,
      profession: null,
      cin: '',
      lieu_naissance: null,
      nationalite: null,
      date_naissance: null,
      age: null,
      nom_responsable: null,
      relation_familliale: null,
      situation_familliale: null,
      nom_mari: null,
      date_mariage: null,
      lieu_mariage: null,
      nom_pere: null,
      nom_mere: null,
      type_client: null,
      partenaire_id: null,
      prospect_id: null,
      info_client: '',
      info_prospect: '',
      projet_id: selectedProjet ? selectedProjet.id : '',

      // if delete frein==true l'etat du frein=2 comme traite le client ne plus perdu
      delete_frein: false,
    },
  ]);

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
    { cin: '', firstName: '', lastName: '', phone: '', pourcentage: 0 },
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
    const list = inputList1.filter((_, i) => i !== index);
    setinputList1(
      list.length
        ? list
        : [
            {
              id: '',
              pourcentage: '',
            },
          ]
    );
    let commentCount2 = 0;
    let get_id_selected = 0;
    for (var k = 0; k <= Number(inputList1.length) - 1; k++) {
      if (index == k) {
        get_id_selected = inputList1[k].id;
      }
    }
    //var total = parseInt(pourcentages - inputList1[index].pourcentage1)
    list.forEach((nombres) => {
      var stringtoInt = parseInt(nombres.pourcentage1);
      commentCount2 += stringtoInt;
    });
    if (isNaN(commentCount2)) {
      setValue('verifierPourcentages', false);
      setenabled('none');
    } else if (commentCount2 == 100) {
      setValue('verifierPourcentages', true);
      setenabled('none');
    } else {
      setValue('verifierPourcentages', false);
      setenabled('block');
    }

    //la list des clients
    oldClients.splice(index, 1);
    for (var j = 0; j <= Number(clientsExist.length) - 1; j++) {
      if (clientsExist[j].id == get_id_selected) {
        var old_etat = clientsExist[j].disabled;
        clientsExist[j].disabled = false;
        if (
          text == 'without_new_client' &&
          old_etat != clientsExist[j].disabled
        ) {
          //remove and etat disabled changed
          setValue('nb_acquereurs', watch('nb_acquereurs') - 1);
        }
      }
    }
  };

  const handleNumberOfFormsChange = (value) => {
    const newValue = Math.max(1, Math.min(10, value)); // Limit between 1 and 10
    setNumberOfForms(newValue);
    setNewClientForms(
      Array(newValue)
        .fill(null)
        .map((_, index) => ({
          cin: newClientForms[index]?.cin || '',
          firstName: newClientForms[index]?.firstName || '',
          lastName: newClientForms[index]?.lastName || '',
          email: newClientForms[index]?.email || '',
          phone: newClientForms[index]?.phone || '',
          address: newClientForms[index]?.address || '',
        }))
    );
  };

  const updateFormField = (formIndex, field, value) => {
    // Update the form field
    const updatedForms = [...newClientForms];
    updatedForms[formIndex] = {
      ...updatedForms[formIndex],
      [field]: value,
    };
    setNewClientForms(updatedForms);

    // Calculate percentages - ensure numeric values
    const commentCount = updatedForms.reduce((sum, nombres) => {
      return sum + Number(nombres.pourcentage) || 0;
    }, 0);

    const count_old_client = inputList1.reduce((sum, nombres) => {
      return sum + Number(nombres.pourcentage) || 0;
    }, 0);

    const totalPercentage = commentCount + count_old_client;

    console.log(`la somme des pourcentages ==> ${totalPercentage}%`);

    // Update form values
    setValue('pourcentages', totalPercentage);

    // Validate if total is exactly 100
    const isValid = totalPercentage == 100;
    setValue('verifierPourcentages', isValid);
    setenabled(isValid ? 'none' : 'block');
  };
  const defaultValues = {
    projet_id: selectedProjet ? selectedProjet.id : '',
    bien_id: '',
    nb_acquereurs: '',
    clients: [],
    oldClients: [],

    /**Reservation */
    date_reservation: new Date(new_date).toISOString().split('T')[0],
    code_reservation: '',
    prix: 0,
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

  const {
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  const onSubmit = (data) => {
    setLoading({ ...loading, form: true });
    setBackendErrors({});

    const dataToSend = new FormData();
    let url = APIURL.RESERVATIONS;
    Object.entries(data).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    if (!isEditing && selectedFiles_rsv.length !== 0) {
      for (let i = 0; i < selectedFiles_rsv.length; i++) {
        dataToSend.append(`files_reservation[${i}]`, selectedFiles_rsv[i]);
      }
    }
    if (!isEditing && selectedFiles_avc.length !== 0) {
      selectedFiles_avc.forEach((file, index) => {
        dataToSend.append(`files_avance[${index}]`, file);
      });
    }

    if (isEditing) {
      const files = selectedFiles_rsv.filter((file) => file instanceof File);
      const objects = selectedFiles_rsv.filter(
        (file) => !(file instanceof File)
      );

      if (objects.length !== 0) {
        objects.forEach((file, index) => {
          // convertir un objet en File avant de l'envoyer
          const blob = new Blob([file.fichier], {
            type: 'application/octet-stream',
          });
          const newFile = new File([blob], file.fichier);
          dataToSend.append(`files_reservation[${index}]`, newFile);
        });
      }
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i++) {
          dataToSend.append(
            `files_reservation[${objects.length + i}]`,
            files[i]
          );
        }
      }

      dataToSend.append('_method', 'PATCH');
      url = `${url}/${id}`;
    }

    // Requête API avec axios
    axios
      .post(url, dataToSend, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        let message = 'Quelque chose ne va pas bien';
        if (res.status == 200) {
          message = `La réservation a été ${
            isEditing ? 'modifiée' : 'créée'
          } avec succès`;
          toast.success(message);
          localStorage.removeItem('step_res_edit');
          localStorage.removeItem('selectedClient');
          router.push(ENDPOINTS.RESERVATIONS);
          reset(defaultValues);
        } else if (res.status == 422) {
          message = res.data.message;
          setBackendErrors(res.data.errors);

          // Effacer les erreurs après 5 secondes
          setTimeout(() => setBackendErrors({}), 5000);
        }
      })
      .catch((error) => {
        console.log('dataToSend3', dataToSend);

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
    console.log('le code est==>' + event.target.value);
    let val = event.target.value;
    if (val.length >= 3) {
      setInfo_reservation(null);
      await axios
        .get(`${APIURL.ROOTV1}/search_reservation_by_code/` + val, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.data.reservation != null) {
            setInfo_reservation(
              'Le Code Réservation  :' + val + ' est déjà existant '
            );
          } else {
            setInfo_reservation(null);
          }
        })
        .catch(() => {
          setInfo_reservation(null);
        });
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
  const fetch_bien_ByProjet = async (bien_id, bien_propriete, prix, text) => {
    setLoading_bien(true);
    await axios
      .get(`${APIURL.ROOTV1}/getBiensByProjet_Concat/` + selectedProjet.id, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setLoading_bien(false);

        //add bien pre reserve ou vendu to res data biens(disponible)
        if (bien_propriete != undefined) {
          res.data.biens.push({
            propriete_dite_bien: bien_propriete,
            id: bien_id,
            prix: prix,
          });
        }
        setBiensByProjet(res.data.biens);
        if (text == 'without_proposition') {
          if (bien_id != null) {
            for (var i = 0; i <= Number(res.data.biens.length) - 1; i++) {
              if (bien_id == res.data.biens[i].id) {
                //setBienKey(i)
              }
            }
          }
        }
      })

      .catch(() => {
        setLoading_bien(false);
      });
  };
  const pusher_function = async () => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(`${pusher_key_proposition}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');

    channel.bind('App\\Events\\PropositionUpdated', (data) => {
      if (isEditing) fetch_bien_ByProjet();
      else
        fetchDataByProjet_2(
          'getBiensByProjet_Concat',
          'biens',
          setBiensByProjet,
          setLoading_bien
        );
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

      setClientsExist(
        response.data.clients.map((client) => ({
          id: client.id,
          nom: client.nom,
          prenom: client.prenom,
          disabled: false,
        }))
      );

      setLoadingClients(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (partenaires.length == 0) {
      fetchData_Select('partenaires', setPartenaires, setLoading_1);
    }

    if (clientsExist.length == 0) {
      fetchDataClients();
    }
    if (filesList.length == 0) {
      fetchList_fichier_exist(setfilesList, 'rsv', setLoading_list);
    }
    if (!isEditing) {
      fetchDataByProjet_2(
        'getBiensByProjet_Concat',
        'biens',
        setBiensByProjet,
        setLoading_bien
      );
      if (banques.length == 0) {
        fetchData_Select('banques', setBanques, setLoading_1);
      }

      if (filesList_avc.length == 0) {
        fetchList_fichier_exist(setfilesList_avc, 'avc', setLoading_list);
      }
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
  const handleDeleteFile = (index, param) => {
    var selectedFiles = param == 1 ? selectedFiles_rsv : selectedFiles_avc;

    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    if (param == 1) {
      setSelectedFiles_rsv(newFiles);
    } else {
      setSelectedFiles_avc(newFiles);
    }
  };
  const handleFileChange = (event, param) => {
    const selectedFiles = param == 1 ? selectedFiles_rsv : selectedFiles_avc;
    const fileList = param == 1 ? filesList : filesList_avc;

    const files = Array.from(event.target.files);
    event.target.value = null;

    files.forEach((file) => {
      const fileName = file.name;
      const fileExistsInList = Object.values(fileList).includes(fileName); // Vérifie si le fichier existe déjà dans la liste filesList
      const fileExistsInSelected = selectedFiles.some(
        (selectedFile) =>
          selectedFile.name == fileName || selectedFile.fichier == fileName
      ); // Vérifie si le fichier existe déjà dans la sélection

      if (fileExistsInSelected) {
        setAddOreditPopup(param == 1 ? 1 : 2);
        setValiderfile(true);
        setMyfile(files);
      } else if (fileExistsInList) {
        // Si le fichier existe déjà dans filesList, on génère un nouveau nom
        let newFileName = fileName;
        let fileNumber = 1;

        // Séparer le nom et l'extension de manière plus robuste
        const fileParts = fileName.split('.');
        const extension = fileParts.pop(); // Extraire l'extension
        const baseName = fileParts.join('.'); // Joindre le reste comme nom de fichier

        // Tant que le nom généré existe déjà dans filesList, on continue à ajouter un suffixe
        while (Object.values(fileList).includes(newFileName)) {
          newFileName = `${baseName} (${fileNumber}).${extension}`;
          fileNumber++;
        }

        // Créer un nouveau fichier avec le nom modifié
        const newFile = new File([file], newFileName, { type: file.type });

        // Vérifier si le nouveau fichier existe dans les fichiers sélectionnés
        if (
          selectedFiles.some(
            (selectedFile) =>
              selectedFile.name == newFileName ||
              selectedFile.fichier == newFileName
          )
        ) {
          setAddOreditPopup(param == 1 ? 1 : 2);
          setValiderfile(true);
          setMyfile_1(newFile);
        } else {
          // Ajouter le fichier renommé à la liste des fichiers sélectionnés
          if (param == 1) {
            setSelectedFiles_rsv([...selectedFiles_rsv, newFile]);
          } else {
            setSelectedFiles_avc([...selectedFiles_avc, newFile]);
          }
        }
      } else {
        // Si le fichier n'existe pas dans filesList ou selectedFiles, on l'ajoute simplement
        if (param == 1) {
          setSelectedFiles_rsv([...selectedFiles_rsv, file]);
        } else {
          setSelectedFiles_avc([...selectedFiles_avc, file]);
        }
      }
    });
  };

  const handleaddFile = () => {
    var selectedFiles =
      addOreditPopup == 1
        ? selectedFiles_rsv
        : addOreditPopup == 2
        ? selectedFiles_avc
        : null;

    if (myfile !== null && Array.isArray(myfile)) {
      myfile.forEach((file) => {
        const updatedFiles = selectedFiles.filter(
          (selectedFile) =>
            selectedFile.fichier !== file.name &&
            selectedFile.name !== file.name
        );

        if (addOreditPopup == 1) {
          setSelectedFiles_rsv([...updatedFiles, ...myfile]);
        } else if (addOreditPopup == 2) {
          setSelectedFiles_avc([...updatedFiles, ...myfile]);
        }
      });
    } else if (myfile !== null && !Array.isArray(myfile)) {
      // If myfile is not an array (i.e., a single file)
      const updatedFiles = selectedFiles.filter(
        (selectedFile) =>
          selectedFile.fichier !== myfile.name &&
          selectedFile.name !== myfile.name
      );
      if (addOreditPopup == 1) {
        setSelectedFiles_rsv([...updatedFiles, myfile]);
      } else if (addOreditPopup == 2) {
        setSelectedFiles_avc([...updatedFiles, myfile]);
      }
    } else if (myfile_1 !== null) {
      // If myfile_1 exists (for handling the case when a file already exists in the list)
      const updatedFiles = selectedFiles.filter(
        (selectedFile) =>
          selectedFile.fichier !== myfile_1.name &&
          selectedFile.name !== myfile_1.name
      );

      if (addOreditPopup == 1) {
        setSelectedFiles_rsv([...updatedFiles, myfile_1]);
      } else if (addOreditPopup == 2) {
        setSelectedFiles_avc([...updatedFiles, myfile_1]);
      }
    }

    setMyfile(null);
    setMyfile_1(null);
    setValiderfile(false);
    setAddOreditPopup(null);
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

  const handleaddclick = () => {
    var kk = 0;
    let total = 0;
    if (varInputlist === false) {
      setVarInputlist(true);
      kk = 1;
    } else {
      setinputList([
        ...inputList,
        {
          nom: '',
          prenom: '',
          pourcentage: '',
          email: null,
          telephone_num1: '',
          telephone_num2: null,
          notifie: '',
          civilite: '',
          adresse: null,
          ville: null,
          pays: null,
          profession: null,
          cin: '',
          lieu_naissance: null,
          nationalite: null,
          date_naissance: null,
          age: null,
          nom_responsable: null,
          relation_familliale: null,
          situation_familliale: null,
          nom_mari: null,
          date_mariage: null,
          lieu_mariage: null,
          nom_pere: null,
          nom_mere: null,
          type_client: null,
          partenaire_id: null,
          prospect_id: null,
          info_client: '',
          info_prospect: '',
          projet_id: selectedProjet ? selectedProjet.id : '',

          // if delete frein==true l'etat du frein=2 comme traite le client ne plus perdu
          delete_frein: false,
        },
      ]);
      kk = 2;
    }
    if (kk == 1) {
      total = inputList.length;
    } else if (kk == 2) {
      total = Number(inputList.length) + 1;
    }
    setValue('nb_acquereurs', oldClients.length + total);
  };

  const handleinputchange1 = (e, index, text) => {
    if (selectedClient) {
      // Assurez-vous que l'ID par défaut du client est assigné au premier élément
      const updatedList = [...inputList1];
      updatedList[0].id = selectedClient;
      setinputList1(updatedList);
      clientsExist[0].disabled = true;
    }
    const { name, value } = e.target;
    const list = [...inputList1];
    list[index][name] = value;
    setinputList1(list);

    if (inputList1.length != 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }

    var nb_selected = 0;
    inputList1.forEach((nombres) => {
      /*var stringtoInt = parseInt(nombres.pourcentage);
      if (isNaN(stringtoInt)) {
        stringtoInt = 0;
      }
      commentCount1 += stringtoInt;*/

      //disbled client selected

      if (text == 'select_client' && e.target.value) {
        setClientsExist((prevClients) =>
          prevClients.map((client) =>
            client.id == nombres.id ? { ...client, disabled: true } : client
          )
        );
        nb_selected++;
      }
    });

    // ONLY RUN THIS FOR CLIENT SELECTION CHANGES
    if (text == 'select_client') {
      var id_cl_selectionne = [];
      for (var j = 0; j <= Number(inputList1.length) - 1; j++) {
        id_cl_selectionne.push(inputList1[j].id);
      }

      for (j = 0; j <= Number(clientsExist.length) - 1; j++) {
        if (id_cl_selectionne.length > 0) {
          if (id_cl_selectionne.includes(clientsExist[j].id) == false) {
            clientsExist[j].disabled = false;
          }
        }
      }
    }

    if (text != 'percent') {
      setValue('nb_acquereurs', nb_selected);
    }

    /*****clientnouveau  get pourcentage* */

    // Calculate percentages - ensure numeric values
    const commentCount = inputList1.reduce((sum, nombres) => {
      return sum + Number(nombres.pourcentage) || 0;
    }, 0);

    const count_old_client = newClientForms.reduce((sum, nombres) => {
      return sum + Number(nombres.pourcentage) || 0;
    }, 0);

    const totalPercentage = commentCount + count_old_client;

    console.log(
      `la somme des pourcentages ==> ${totalPercentage}%` +
        'count hadi==>' +
        commentCount +
        'w d old==>' +
        count_old_client
    );
    setValue('pourcentages', totalPercentage);

    if (text == 'percent') {
      // Validate if total is exactly 100
      const isValid = totalPercentage == 100;
      setValue('verifierPourcentages', isValid);
      setenabled(isValid ? 'none' : 'block');
    }

    var arrayinputList1 = Object.values(inputList1);
    var arrayClient1 = [];
    for (let i = 0; i < arrayinputList1.length; i++) {
      const propertyValues = arrayinputList1[i];
      arrayClient1.push(propertyValues);
    }
    setoldClients(arrayClient1);
    console.log('les clients =>' + JSON.stringify(inputList1));
    setValue('oldClients', JSON.stringify(arrayClient1));
  };
  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.RESERVATIONS}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} Reservation`}
          />
        </div>
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        {info_reservation != null && (
          <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded mb-4">
            <p>{info_reservation}</p>
          </div>
        )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
              <div>
                <AutocompleteBien
                  user={user}
                  biensByProjet={biensByProjet}
                  value={watch('bien_id')}
                  onChange={handleSelectBien}
                  loading={loading_bien}
                  error={errors['bien_id'] || backendErrors['bien_id']}
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
              <div>
                <TextField
                  label="Prix:"
                  name="prix"
                  disabled={true}
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
                    name="reservation_files"
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
                                onClick={() => handleDeleteFile(index, 1)}
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
           
            <div
              className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded mb-4"
              style={{ display: enabled }}
            >
              <p>{'la somme des pourcentages doit être 100% !'}</p>
            </div>

            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Ajouter les clients participer à cette Réservation
            </h2>
            <div className="space-y-4">
              {inputList1.map((entry, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <AutocompleteClient
                        options={clientsExist}
                        value={entry.id}
                        onChange={handleinputchange1}
                        loading={loading_clients}
                        index={index}
                        selectedClient={selectedClient}
                        disabled={loading_clients}
                        errors={errors}
                        backendErrors={backendErrors}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`percentage-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Pourcentage: *
                      </label>
                      <input
                        id={`percentage-${index}`}
                        type="number"
                        name="pourcentage" // Add this name
                        value={entry.pourcentage}
                        disabled={
                          selectedClient && index == 0 ? false : disabled_var
                        }
                        onChange={(e) =>
                          handleinputchange1(e, index, 'percent')
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  {inputList1.length > 1 && (
                    <button
                      onClick={() =>
                        removeClientEntry(index, 'without_new_client')
                      }
                      className="mt-7 p-2 text-red-600 hover:text-red-700 hover:bg-red rounded-md transition-colors bg-[red]"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={addClientEntry}
                className="flex items-center justify-center gap-2 px-4 py-2  text-blue-600 rounded-full hover:bg-blue-100 bg-[#2563eb]"
              >
                <PlusIcon className="w-5 h-5" />
                <UsersIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowNewClientForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
              >
                <UserPlusIcon className="w-5 h-5" />
                <span>Nouveau Client</span>
              </button>
            </div>

            {showNewClientForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Nouveau Client
                    </h3>
                    <button
                      onClick={() => setShowNewClientForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mb-6">
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-8">
                    <div
                      className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded mb-4"
                      style={{ display: enabled }}
                    >
                      <p>{'la somme des pourcentages doit être 100% !'}</p>
                    </div>
                    {newClientForms.map((form, formIndex) => (
                      <div
                        key={formIndex}
                        className="border-t pt-6 first:border-t-0 first:pt-0"
                      >
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Client {formIndex + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cin *
                            </label>
                            <input
                              type="text"
                              value={form.cin}
                              onChange={(e) =>
                                updateFormField(
                                  formIndex,
                                  'cin',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Cin"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom *
                            </label>
                            <input
                              type="text"
                              value={form.lastName}
                              onChange={(e) =>
                                updateFormField(
                                  formIndex,
                                  'lastName',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nom"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              value={form.firstName}
                              onChange={(e) =>
                                updateFormField(
                                  formIndex,
                                  'firstName',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Prénom"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pourcentage *
                            </label>
                            <input
                              type="number"
                              value={form.pourcentage}
                              onChange={(e) =>
                                updateFormField(
                                  formIndex,
                                  'pourcentage',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Téléphone *
                            </label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) =>
                                updateFormField(
                                  formIndex,
                                  'phone',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="+33 X XX XX XX XX"
                            />
                          </div>
                          <div className="md:col-span-2">
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
                              placeholder="Adresse complète"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowNewClientForm(false);
                        setNumberOfForms(1);
                        setNewClientForms([
                          {
                            cin: '',
                            firstName: '',
                            lastName: '',
                            phone: '',
                            pourcentage: '',
                          },
                        ]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        // Add the new clients to the addedClients state
                        setAddedClients([...addedClients, ...newClientForms]);
                        setShowNewClientForm(false);
                        setNumberOfForms(1);
                        setNewClientForms([
                          {
                            cin: '',
                            firstName: '',
                            lastName: '',
                            phone: '',
                            pourcentage: '',
                          },
                        ]);
                      }}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                        currentStep === 1 &&
                        (!watch('verifierPourcentages') ||
                          alert_client === true)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={
                        currentStep === 1 &&
                        (!watch('verifierPourcentages') ||
                          alert_client === true)
                      }
                    >
                      Ajouter
                    </button>
                  </div>
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
                                  {client.firstName} {client.lastName}
                                </h4>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Percent className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate">
                                    {client.pourcentage != undefined &&
                                      client.pourcentage}
                                  </span>
                                </div>
                                {client.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span>{client.phone}</span>
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
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setAddedClients(
                                  addedClients.filter((_, i) => i !== index)
                                )
                              }
                              className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
                              aria-label="Supprimer le client"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          </div>
        )}

        {currentStep == 2 && (
          <div className="space-y-6 mt-[50px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  id="sr"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="sr"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Sr
                </label>
              </div>
              <div>
                <label
                  htmlFor="price-main"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prix: *
                </label>
                <input
                  id="price-main"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="45000"
                />
              </div>
              <div>
                <label
                  htmlFor="unit-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prix unitaire: *
                </label>
                <input
                  id="unit-price"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prix remise: *
                </label>
                <input
                  id="discount"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="flat-rate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prix forfaitaire: *
                </label>
                <input
                  id="flat-rate"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="final-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prix final: *
                </label>
                <input
                  id="final-price"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="45000"
                />
              </div>
              <div>
                <label
                  htmlFor="remaining"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reste Avant: *
                </label>
                <input
                  id="remaining"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="rest"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reste: *
                </label>
                <input
                  id="rest"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Montant: *
                </label>
                <input
                  id="amount"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Montant"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="financing"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mode Financement *:
                </label>
                <select
                  id="financing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un mode</option>
                  <option value="cash">Espèces</option>
                  <option value="credit">Crédit</option>
                  <option value="transfer">Virement</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="payment-method"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mode paiement *:
                </label>
                <select
                  id="payment-method"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un mode</option>
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="check">Chèque</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="payment-comments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Commentaire:
              </label>
              <textarea
                id="payment-comments"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez vos commentaires ici"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichiers paiement:
              </label>
              <div className="flex items-center mt-1">
                <label className="px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">
                    Choisir un fichier
                  </span>
                  <input type="file" className="sr-only" />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  Aucun fichier choisi
                </span>
              </div>
            </div>
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
            <button
              type="submit" // This will submit the form
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={handleSubmit(onSubmit)}
              disabled={
                info_reservation != null ||
                loading.form ||
                watch('mode_financement') == '' ||
                (!isEditing &&
                  (watch('avance') < 0 ||
                    watch('avance') == '' ||
                    watch('mode_paiement') == '' ||
                    (watch('check_montant') === true &&
                      watch('commentaireAvance') == '') ||
                    (watch('avance') === 0 &&
                      watch('check_montant') === false)))
              }
            >
              Enregistrer
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextStep}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                (currentStep === 0 &&
                  (watch('bien_id') === '' ||
                    watch('code_reservation') === '' ||
                    watch('date_reservation') === '' ||
                    info_reservation != null ||
                    loading_bien === true)) ||
                (currentStep === 1 &&
                  (!watch('verifierPourcentages') || alert_client === true))
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={
                (currentStep === 0 &&
                  (watch('bien_id') === '' ||
                    watch('code_reservation') === '' ||
                    watch('date_reservation') === '' ||
                    info_reservation != null ||
                    loading_bien === true)) ||
                (currentStep === 1 &&
                  (!watch('verifierPourcentages') || alert_client === true))
              }
            >
              Suivant
            </button>
          )}
        </div>
      </div>
      {validerfile == true && (
        <>
          <Modal isVisible={true} onClose={() => setValiderfile(false)}>
            <Modal_File
              onConfirm={handleaddFile}
              onClose={() => setValiderfile(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
}
