import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import {
  fetchData_Select,
  fetchDataByProjet,
} from '../../../../../src/configs/api-utils';

import BreadCrumb from '../../navigation/BreadCrumb';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import toast from 'react-hot-toast';
import SelectInput from '@/components/SelectInput';

import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import { useProjet } from '@/context/ProjetContext';
import { useAuth } from '../../../../context/AuthContext';
import FreinsComponentEdit from './FreinsComponentEdit';

import {
  VISITE_INTERETS,
  VISITE_STATUT_FORM,
  VISITE_TYPE_NOTIF,
  MODE_FINANCE,
  MODE_PAIEMENT,
  ORIENTATIONS,
  ORIENTATION_ABBREVIATIONS,
  Statut_SUIVI_DOSSIER,
} from '@/configs/enum';
import Pusher from 'pusher-js';
import ProspectInformations from './ProspectInformations'; // Adjust path as needed
import { useSociete } from '@/context/SocieteContext';

export default function VisiteFormEdit({ id }) {
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);
  const { user } = useAuth();
  const [info_reservation, setInfo_reservation] = useState(null);
  const [Dossiers_Suivis, setDossiers_Suivis] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationErrorList, setValidationErrorList] = useState([]);
  const [showNouvelleAvance, setShowNouvelleAvance] = useState(false);

  const [loading_form, setLoading_form] = useState(false);
  const router = useRouter();
  const accessToken = localStorage.getItem('accessToken');
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_REALTIME;
  const [loading, setLoading] = useState({ form: false, visites: false });
  const [loading_tranches, setLoading_tranches] = useState(false);

  const [loading_vues, setLoading_vues] = useState(false);

  const [loading_typologies, setLoading_typologies] = useState(false);
  const { selectedProjet } = useProjet();
  const [backendErrors, setBackendErrors] = useState({});
  const [sources, setSources] = useState([]);
  const [loading_sources, setLoading_sources] = useState(false);
  const [loading_partenaires, setLoading_partenaire] = useState(false);
  const [loading_banques, setLoading_banques] = useState(false);

  const [partenaires, setPartenaires] = useState([]);

  const [disabled_var, setDisabled] = useState(false);
  const [partenaire_txt, setPartenaire_txt] = useState(null);
  const [biensByProjet, setBiensByProjet] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [email_required, setEmail_required] = useState(false);

  const current = new Date();
  var new_date = current.setDate(current.getDate());
  const [banques, setBanques] = useState([]);

  const [expanded, setExpanded] = useState('');
  const [loading_bien, setLoading_bien] = useState(false);
  const [type_freins, setType_freins] = useState([]);
  const [list_typologies, setListTyplogies] = useState([]);
  const [list_vues, setList_Vues] = useState([]);
  const [info_prix, setInfo_prix] = useState(null);
  const [info_sup, setInfo_sup] = useState(null);
  const list_etages = [];
  const [disabled_var_source, setDisabled_source] = useState(false);
  const [formData, setFormData] = useState(null);
  const [bien_propriete_o, setBien_propriete_o] = useState('');
  const [info_client, setInfo_client] = useState(null);
  const isEditing = !!id;
  const previousBienRef = useRef(null);
  const [currentSourceText, setSourceText] = useState('');

  const defaultValues = {
    //suvi dossier
    statut_client_id: '',
    statut_suivi: '',
    dossier_id_suivi: '',
    code_suivi:'',
    montant_suivi: '',
    num_paiement_suivi: '',
    banque_id_suivi: '',
    mode_paiement_suivi: '',
    date_paiement_suivi: new Date().toISOString().split('T')[0],
    commentaire_av_suivi: '',
    sr_suivi: false,
    num_remise_suivi: '',
    date_encaissement_suivi: '',

    selectedProjet: selectedProjet?.id || 1,
    prospect_id: '',
    cin: '',
    nom: '',
    email: '',
    prenom: '',
    telephone: '',
    telephone_num2: '',
    ville: '',
    notifie: 0,
    source_id: '',
    source_txt: '',
    partenaire_id: '',
    interet: '',
    date_relance: '',
    mode_relance: '',
    rdv: '',
    frein: [],
    frein_array: [],
    tranches: [],
    etages: '',
    orientations: [],
    avance: '',
    typologies: [],
    vues: [],
    commentaire: '',
    prix_max: '',
    prix_min: '',
    sup_min: '',
    sup_max: '',
    bien_id: '',
    old_bien_id: '',
    statut: '',
    description_autre: '',

    /**Reservation */
    date_reservation: '',
    code_reservation: '',
    prix: 0,
    reste: 0,
    mode_financement: '',

    commentaire_res: '',
    avance_res: '',
    sr: false,
    banque_id: '',
    numero_paiement: '',
    echeance: '',
    check_montant: false,

    mode_paiement: '',
    commentaireAvance: '',
    prix_remise: 0,
    prix_forfetaire: 0,
    num_remise: '',
    date_encaissement: '',

    ///
    bien_pre_reserve: '',
    bien_val: '',
    prix_val: '',
   /* Superficie_balcon_calculer: 0,
    superficie_jardin_calculer: 0,
    superficie_terrasse_calculer: 0,*/
    superficie_vendable:0,
    prix_box: 0,
    prix_parking: 0,
    prix_unitaire: 0,
    avance_minimale: '',
    date_reglement: new Date(new_date).toISOString().split('T')[0],
  };

  let list_statut = VISITE_STATUT_FORM;

  const validationSchemaRef = useRef(
    yup.object().shape({
      interet: yup.string().required('Interêt de visite est requis'),
    })
  );

  if (list_etages.length == 0 && selectedProjet.max_etages > 0) {
    for (var i = 0; i <= selectedProjet?.max_etages; i++) {
      list_etages.push({ value: i });
    }
  }

  // Simple cache et comparaison for return back en cas de changer projet
      const { selectedSociete } = useSociete();
       const [oldProjetId, setOldProjetId] = useState(null);
       const [oldSocieteId, setOldSocieteId] = useState(null);
     useEffect(() => {
   if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
     if (oldProjetId||oldSocieteId) {
       // Projet ou société a changé
       router.push('/crm?tab=visites');
     }
     setOldSocieteId(selectedSociete?.id)
     setOldProjetId(selectedProjet?.id);
   }
 }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  //fin multiple bien

  const pusher_function = async () => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(`${pusher_key_proposition}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');

    channel.bind("PropositionUpdated", (data) => {
      fetch_bien_ByProjet(
        watch('bien_id'),
        bien_propriete_o,
        'with_proposition'
      );
    });
    console.log('bien_to', biensByProjet);

    return () => {
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };

  const handleChange = (panel) => {
    setExpanded(
      (prev) =>
        prev.includes(panel)
          ? prev.filter((p) => p !== panel) // Collapse
          : [...prev, panel] // Expand
    );
  };

  const handleChange_code_res = (v) => {
    const timeout = setTimeout(() => {
      fetch_code_reservation(v);
    }, 3000);

    return () => clearTimeout(timeout);
  };
  const fetch_code_reservation = async (v) => {
    setLoading_form(false);

    await axios
      .get(`${APIURL.ROOTV1}/search_reservation_by_code/` + v, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        if (res.data.reservation != null) {
          setInfo_reservation(
            'Le Code Réservation  :' + v + 'est déjà existant '
          );
          setLoading_form(true);
        } else {
          setInfo_reservation(null);
          setLoading_form(false);
        }
      })
      .catch(() => {
        setInfo_reservation(null);
        setLoading_form(false);
      });
  };

  const storebien_en_proposition = async (id) => {
    var old_id = watch('old_bien_id');

    if (old_id == null) {
      old_id = 0;
    }

    //si il choisit le bien_pre_reserve autre fois
    if (id == watch('bien_pre_reserve')) {
      id = 0;
    }

    //si ancien bien_pre_reserve
    if (old_id === watch('bien_pre_reserve')) {
      old_id = 0;
    }

    axios({
      method: 'put',
      url: `${APIURL.ROOT}/v1/setPropostionBien/${id}/` + old_id,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        console.log('bien est en proposition');
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          toast.error(response.data.error);
        }
      });
  };

  const fetchTypeFreins = async () => {
    setLoading_tp_frein(true);
    await axios
      .get(`${APIURL.ROOTV1}/typefreins`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setType_freins(res.data.typefreins);
        setType_freins((current) => [
          { id: 'tout', description: 'Autre' },
          ...current,
        ]);
        setLoading_tp_frein(false);
      })
      .catch(() => {});
  };

  // Dans handleChange_statut_suivi
  const handleChange_statut_suivi = (code) => {
    if (code) {
      setValue('statut_suivi', code);

      // Afficher/masquer la section nouvelle avance
      if (code == '1') {
        setShowNouvelleAvance(true);
      } else {
        setShowNouvelleAvance(false);
        // Réinitialiser les champs d'avance si on change de statut
        setValue('montant_suivi', '');
        setValue('num_paiement_suivi', '');
        setValue('banque_id_suivi', '');
        setValue('mode_paiement_suivi', '');
        setValue('date_paiement_suivi', new Date().toISOString().split('T')[0]);
      }
    }
  };
  const handleChange_dossier_suivi = (id) => {
    if (id) {
      setValue('dossier_id_suivi', id);
    }
  };
  const handleChange_interet = (code) => {
    setValue('interet', code);
    if (code != null) {
      if (code === 2) {
        //setItemm(2)
      }

      //interesse
      else if (code == 1) {
        if (watch('cin') === '') {
          toast.error('Veuillez saisir un cin !');
        }

        //setItemm(1)
        fetch_bien_ByProjet(
          watch('bien_id'),
          bien_propriete_o,
          'without_proposition'
        );
      }

      //perdu
      else if (code == 3) {
        //setItemm(3)
        fetchTypeFreins();

        fetchDataByProjet('tranches', setTranches, setLoading_tranches);
        fetchDataByProjet('vues', setList_Vues, setLoading_vues);
        fetchDataByProjet(
          'typologies',
          setListTyplogies,
          setLoading_typologies
        );
      }
    }
  };
  const {
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    setError, // Add this line
    clearErrors, // Add this line if you need it
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      if (!isMounted) return;

      setLoading((prev) => ({ ...prev, form: true }));

      try {
        // Fetch initial data
        await fetchData_Select('sources', setSources, setLoading_sources);
        await fetchData_Select('banques', setBanques, setLoading_banques);

        // Fetch partenaires only if needed
        if (partenaires.length === 0) {
          await fetchDataByProjet(
            'partenaires',
            setPartenaires,
            setLoading_partenaire
          );
        }

        // Only fetch edit data if editing
        if (isEditing && id) {
          await fetchEditData();
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('Error fetching data:', error.message);
          toast.error('Erreur lors du chargement des données');
        }
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, form: false }));
        }
      }
    };

    const fetchEditData = async () => {
      try {
        const response = await axios.get(`${APIURL.ROOTV1}/edit_visite/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
          timeout: 15000,
        });

        if (response.status !== 200) {
          router.back();
          return;
        }

        const visite = response.data.visite;

        if (isMounted) {
          await processVisiteData(visite);
        }
      } catch (error) {
        if (isMounted && error.name !== 'CanceledError') {
          console.error('Error fetching edit data:', error.message);
          toast.error('Erreur lors du chargement de la visite');
        }
      }
    };

    const processVisiteData = async (visite) => {
      if (!visite || !isMounted) return;

      try {
        // Create form data object
        const newFormData = {
          statut_client_id: visite?.statut_client?.id || '',
          dossier_id_suivi: visite?.statut_client?.reservation_id || '',
          statut_suivi: visite?.statut_client?.statut || '',
          commentaire: visite?.statut_client?.commentaire || '',
          nom: visite?.prospect?.nom || '',
          prenom: visite?.prospect?.prenom || '',
          telephone: visite?.prospect?.telephone || '',
          telephone_num2: visite?.prospect?.telephone_num2 || '',
          email: visite?.prospect?.email || '',
          notifie: visite?.prospect?.notifie || 0,
          cin: visite?.prospect?.cin || '',
          interet: visite?.interet || '',
          ville: visite?.prospect?.ville || '',
          source_id: visite?.prospect?.source?.id || '',
          source_txt: visite?.prospect?.source?.source || '',
          mode_relance:
            visite?.relance_relation?.mode_relance ||
            visite?.mode_relance ||
            '',
          date_relance:
            visite?.relance_relation?.date_relance ||
            visite?.date_relance ||
            '',
          commentaire: visite?.commentaire || '',
          partenaire_id: visite?.prospect?.partenaire_id || '',
          bien_id: visite?.bien_id || 0,
          bien_pre_reserve: visite?.bien_id || '',
          rdv: visite?.rdv_relation?.rdv || '',
          statut: visite?.interet === '1' ? visite?.statut : '',
          bien_val: visite?.bien?.propriete_dite_bien || '',
          prix_val: visite?.bien?.prix || '',
          prix: visite?.bien?.prix || '',
          superficie_vendable:
            visite?.bien?.superficie_vendable || 0,
         /* superficie_balcon_calculer:
            visite?.bien?.superficie_balcon_calculer || 0,
          superficie_jardin_calculer:
            visite?.bien?.superficie_jardin_calculer || 0,
          superficie_terrasse_calculer:
            visite?.bien?.superficie_terrasse_calculer || 0,
          superficie_habitable: visite?.bien?.superficie_habitable || 0,*/
          prix_box: visite?.bien?.prix_box || 0,
          prix_parking: visite?.bien?.prix_parking || 0,
          prix_unitaire: visite?.bien?.prix_unitaire || 0,
          prix_remise: visite?.bien?.prix_unitaire || 0,
          avance_minimale: visite?.bien?.avance_minimale || 0,
          date_reservation: visite?.reservation?.date_reservation || '',
          code_reservation: visite?.reservation?.code_reservation || '',
        };
        setDossiers_Suivis(visite?.prospect?.client?.reservations);

        // ✅ Batch set all form values at once
        Object.entries(newFormData).forEach(([key, value]) => {
          setValue(key, value);
        });

        setValue('interet', visite.interet);

        // Handle interet-specific logic
        if (visite.interet === '1') {
          fetch_bien_ByProjet(
            visite.bien_id,
            NomBienComplet(visite?.bien),
            'without_proposition'
          );
          setBien_propriete_o(NomBienComplet(visite?.bien));
        }

        // Set partenaire text
        const partenaireTxt = !visite.prospect.partenaire_id
          ? ''
          : visite.prospect.partenaire.description;

        setPartenaire_txt(partenaireTxt);
        setValue('partenaire_txt', partenaireTxt);

        // Handle statut modifications
        handleStatutModifications(visite.statut);

        // Handle freins data
        if (visite.interet === '3') {
          await handleFreinsData(visite);
        }

        // ✅ Set formData state LAST for conditional rendering
        setFormData(newFormData);
      } catch (error) {
        console.error('Error processing visite data:', error);
      }
    };

    const handleStatutModifications = (statut) => {
      if (statut === '3') {
        const newStatut = { code: 3, label: 'Pré_Réservation_Perdu' };
        list_statut[3] = newStatut;
      }
      if (statut === '4') {
        const newStatut = { code: 4, label: 'Réservation_Perdu' };
        list_statut[4] = newStatut;
      }
    };

    const handleFreinsData = async (visite) => {
      if (!isMounted) return;

      try {
        // Fetch frein-related data in parallel
        await Promise.allSettled([
          fetchTypeFreins(),
          fetchDataByProjet('tranches', setTranches, setLoading),
          fetchDataByProjet('vues', setList_Vues, setLoading),
          fetchDataByProjet('typologies', setListTyplogies, setLoading),
        ]);

        if (isMounted && visite.freins) {
          processFreinsValues(visite.freins);
        }
      } catch (error) {
        console.error('Error handling freins data:', error);
      }
    };

    const processFreinsValues = (freins) => {
      if (!freins || !isMounted) return;

      const freinValue = [];

      // Process each frein type (your existing code remains the same)
      processEtageFreins(freins, freinValue);
      processVueFreins(freins, freinValue);
      processTypologieFreins(freins, freinValue);
      processTrancheFreins(freins, freinValue);
      processOrientationFreins(freins, freinValue);
      processOtherFreins(freins, freinValue);

      setValue('frein', freinValue);
    };

    // Your existing process functions remain the same...
    const processEtageFreins = (freins, freinValue) => {
      if (freins.frein_etage?.length > 0 && isMounted) {
        const etages = freins.frein_etage.map((item) => item.etage.toString());
        setValue('etages', etages);
        freinValue.push('ETAGE');
      }
    };

    const processVueFreins = (freins, freinValue) => {
      if (freins.frein_vue?.length > 0 && isMounted) {
        const vues = freins.frein_vue.map((item) => item.vue);
        setValue('vues', vues);
        freinValue.push('VUE');
      }
    };

    const processTypologieFreins = (freins, freinValue) => {
      if (freins.frein_typologie?.length > 0 && isMounted) {
        const typologies = freins.frein_typologie.map((item) => item.typologie);
        setValue('typologies', typologies);
        freinValue.push('TYPOLOGIE');
      }
    };

    const processTrancheFreins = (freins, freinValue) => {
      if (freins.frein_tranche?.length > 0 && isMounted) {
        const tranches = freins.frein_tranche.map((item) => item.tranche);
        setValue('tranches', tranches);
        freinValue.push('TRANCHE');
      }
    };

 const processOrientationFreins = (freins, freinValue) => {
  if (freins.frein_orientation?.length > 0 && isMounted) {
    const orientationMap = {
      'N': '1',
      'E': '2',
      'S': '3',
      'O': '4',
      'N_E': '5',
      'N_O': '6',
      'S_E': '7',
      'S_O': '8',
      'NORD_SUD': '9',
      'NORD_OUEST': '10',
      'SUD_EST': '11',
      'EST_OUEST': '12',
      'NO_SE': '13',
      'NORD_SUD_OUEST': '14',
      'NORD_SUD_EST': '15',
      'NORD_EST_OUEST': '16'
    };

    const orientations = freins.frein_orientation
      .map((item) => {
        const orientationValue = item.orientation?.trim();
        return orientationMap[orientationValue] || null;
      })
      .filter(code => code !== null && code !== '');

    // Nettoyer les valeurs vides et les doublons
    const uniqueOrientations = [...new Set(orientations)];
    
    console.log('Setting orientations:', uniqueOrientations);
    setValue('orientations', uniqueOrientations);
    freinValue.push('ORIENTATION');
  }
};

    const processOtherFreins = (freins, freinValue) => {
      if (!isMounted) return;

      // Handle direct properties
      if (freins.description_autre != null) {
        setValue('description_autre', freins.description_autre || '');
        freinValue.push('AUTRE');
      }

      if (freins.prix_min != null || freins.prix_max != null) {
        setValue('prix_min', freins.prix_min || '');
        setValue('prix_max', freins.prix_max || '');
        freinValue.push('PRIX');
      }

      if (freins.superficie_min != null || freins.superficie_max != null) {
        setValue('sup_min', freins.superficie_min || '');
        setValue('sup_max', freins.superficie_max || '');
        freinValue.push('SUPERFICIE');
      }

      if (freins.avance != null) {
        setValue('avance', freins.avance);
        freinValue.push('AVANCE');
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, isEditing, partenaires.length, accessToken, router, setValue]);

  useEffect(() => {
    if (watch('avance_res') !== '') {
      if (watch('avance_res') == 0 && (user?.role > 2 && user?.role !=10)) {
        setError('avance_res', {
          type: 'manual',
          message: 'Le montant ne peut pas être 0 pour votre rôle',
        });
      } else if (
        watch('avance_res') > 0 &&
        watch('avance_res') < watch('avance_minimale')
      ) {
        setError('avance_res', {
          type: 'manual',
          message: `Le montant doit être au moins ${watch('avance_minimale')}`,
        });
      } else {
        clearErrors('avance_res');
      }
    }
  }, [watch('avance_res'), watch('avance_minimale'), user?.role]);

  const handlePrixChange = (val) => {
    setTimeout(() => {
      let a, b, minField, maxField;

      if (val === 1) {
        a = Number(watch('prix_min'));
        b = Number(watch('prix_max'));
        minField = 'prix_min';
        maxField = 'prix_max';

        if (a > b) {
          setInfo_prix(
            `Le ${minField.replace(
              '_',
              ' '
            )} doit être inférieur ou égal au ${maxField.replace('_', ' ')}.`
          );
        } else {
          setInfo_prix(null);
        }
      } else if (val === 2) {
        a = Number(watch('sup_min'));
        b = Number(watch('sup_max'));
        minField = 'superficie min';
        maxField = 'superficie max';

        if (a > b) {
          setInfo_sup(
            `La ${minField.replace(
              '_',
              ' '
            )} doit être inférieure ou égale à la ${maxField.replace(
              '_',
              ' '
            )}.`
          );
        } else {
          setInfo_sup(null);
        }
      }
    }, 2000);
  };

  // 1) Extract all your checks into a single function
  const validateFields = () => {
    const errors = [];
  if (Number(watch('statut')) == 2) {
    if (!watch('nom') || watch('nom').trim() === '') {
      errors.push('Le nom est obligatoire pour une vente');
    }
  }
    // 17. Interet required
    if (!watch('interet') || watch('interet') === '') {
      errors.push("L'intérêt de visite est requis");
    }

    const email = watch('email') || '';

    // 1. Email validation
    if (email_required && !email) {
      errors.push('Email obligatoire');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Email invalide');
    }

    // 2. Partenaire validation
    if (watch('source_txt') === 'Partenaire' && !watch('partenaire_id')) {
      errors.push('Partenaire obligatoire');
    }

    // 3. Validation for interet == 1 (Intéressé)
    if (Number(watch('interet')) === 1) {
      if (!watch('bien_id') || watch('bien_id') === '') {
        errors.push('Le Bien est requis pour un prospect intéressé');
      }
      // Check if statut is selected
      if (!watch('statut') || watch('statut') === '') {
        errors.push('Le statut est requis pour un prospect intéressé');
      }

      // If statut is "Vendu" (2), validate reservation fields
      if (Number(watch('statut')) === 2) {
        // Check if bien is selected

        // Check required fields for sold biens
        if (
          !watch('code_reservation') ||
          watch('code_reservation').trim() === ''
        ) {
          errors.push('Le code de réservation est requis');
        }

        if (!watch('date_reservation')) {
          errors.push('La date de réservation est requise');
        }

        const avance = parseFloat(watch('avance_res') || 0);
        if (isNaN(avance) || avance < 0) {
          errors.push("Montant d'avance invalide");
        }

        if (avance == 0 && (user?.role > 2&& user?.role !=10)) {
          errors.push('Le montant ne peut pas être 0 pour votre rôle');
        }

        const avanceMinimale = parseFloat(watch('avance_minimale') || 0);
        if (avance < avanceMinimale  && (user?.role > 2 && user?.role !=10)) {
          errors.push(`Le montant doit être au moins ${avanceMinimale} MAD`);
        }

        if (!watch('mode_financement')) {
          errors.push('Le mode de financement est requis');
        }

        if ( avance > 0 && !watch('mode_paiement')) {
          errors.push('Le mode de paiement est requis');
        }

        if (watch('mode_paiement') && watch('mode_paiement') != 1) {
          if (!watch('banque_id')) {
            errors.push('La banque est requise pour ce mode de paiement');
          }

         // Validation for num_paiement (16 chiffres)
        if (watch('numero_paiement') && watch('numero_paiement').trim() !== '') {
          const numPaiement = watch('numero_paiement').toString().replace(/\s/g, '');
          if (numPaiement.length !== 16) {
            errors.push('Le numéro de paiement doit contenir exactement 16 chiffres');
          }
          if (!/^\d+$/.test(numPaiement)) {
            errors.push('Le numéro de paiement ne doit contenir que des chiffres');
          }
        }
          if (
            watch('mode_paiement') !==1 &&
            watch('mode_paiement') !== 5 &&
            watch('mode_paiement') !== 6
          ) {
            if (!watch('echeance') || watch('echeance') === '') {
              errors.push("La date d'échéance est requise");
            }
          }
        }

        // Check if user checked "reservation sans montant" but didn't provide comment
        if (
          watch('check_montant') === true &&
          (!watch('commentaireAvance') ||
            watch('commentaireAvance').trim() === '')
        ) {
          errors.push(
            'Le commentaire est requis pour une réservation sans montant'
          );
        }
      }
    }

    // 15. Freins validation for "Perdu"
    // 15. Freins validation for "Perdu"
    if (Number(watch('interet')) === 3) {
      const frein = watch('frein') || [];

      // Convert to uppercase for consistent checking
      const freinUpper = frein.map((f) => f.toUpperCase());

      if (freinUpper.length === 0) {
        errors.push('Veuillez sélectionner au moins un frein');
      }

      // Check all possible uppercase variations
      if (freinUpper.includes('VUE') && (watch('vues') || []).length === 0) {
        errors.push(
          'Vues obligatoires lorsque "vue" est sélectionné comme frein'
        );
      }

      if (
        freinUpper.includes('TYPOLOGIE') &&
        (watch('typologies') || []).length === 0
      ) {
        errors.push(
          'Typologies obligatoires lorsque "typologie" est sélectionné comme frein'
        );
      }

      if (
        freinUpper.includes('ORIENTATION') &&
        (watch('orientations') || []).length === 0
      ) {
        errors.push(
          'Orientations obligatoires lorsque "orientation" est sélectionné comme frein'
        );
      }

      if (
        freinUpper.includes('ETAGE') &&
        (watch('etages') || []).length === 0
      ) {
        errors.push(
          'Étage obligatoire lorsque "étage" est sélectionné comme frein'
        );
      }

      if (
        freinUpper.includes('TRANCHE') &&
        (watch('tranches') || []).length === 0
      ) {
        errors.push(
          'Tranche obligatoire lorsque "tranche" est sélectionné comme frein'
        );
      }
    }
    // 12. Suivi Dossier validation
    if (Number(watch('interet')) === 5) {
      if (!watch('dossier_id_suivi') || watch('dossier_id_suivi') === '') {
        errors.push('Veuillez sélectionner un dossier');
      }

      if (!watch('statut_suivi') || watch('statut_suivi') === '') {
        errors.push('Veuillez sélectionner un statut de suivi');
      }

      if (Number(watch('statut_suivi')) === 1) {
        const montant = parseFloat(watch('montant_suivi') || 0);

        if (
          !watch('montant_suivi') ||
          watch('montant_suivi') === '' ||
          isNaN(montant)
        ) {
          errors.push("Le montant de l'avance est requis");
        } else if (montant === 0) {
          errors.push('Le montant ne peut pas être 0');
        } else if (montant < 0) {
          errors.push('Le montant ne peut pas être négatif');
        } else if (montant < 100) {
          errors.push('Le montant minimum est 100 MAD');
        } else {
          // Vérifier si le montant ne dépasse pas le reste
          const dossierSelectionne = Dossiers_Suivis.find(
            (dossier) => dossier.id === watch('dossier_id_suivi')
          );

          if (dossierSelectionne) {
            const prixTotal = parseFloat(dossierSelectionne.prix) || 0;
            const avances =
              parseFloat(dossierSelectionne.avances_sum_montant) || 0;
            const reste = prixTotal - avances;

            if (montant > reste) {
              errors.push(
                `Le montant ne doit pas dépasser le reste (${reste.toLocaleString(
                  'fr-FR'
                )} MAD)`
              );
            }
          }
        }

        if (
          !watch('mode_paiement_suivi') ||
          watch('mode_paiement_suivi') === ''
        ) {
          errors.push('Le mode de paiement est requis');
        }

        if (
          !watch('date_paiement_suivi') ||
          watch('date_paiement_suivi') === ''
        ) {
          errors.push('La date de paiement est requise');
        }

        if (
          watch('mode_paiement_suivi') &&
          watch('mode_paiement_suivi') !== '1'
        ) {
          if (!watch('banque_id_suivi') || watch('banque_id_suivi') === '') {
            errors.push('La banque est requise pour ce mode de paiement');
          }

          // Validation for num_paiement_suivi (16 chiffres)
        if (watch('num_paiement_suivi') && watch('num_paiement_suivi').trim() !== '') {
          const numPaiementSuivi = watch('num_paiement_suivi').toString().replace(/\s/g, '');
          if (numPaiementSuivi.length !== 16) {
            errors.push('Le numéro de paiement (suivi) doit contenir exactement 16 chiffres');
          }
          if (!/^\d+$/.test(numPaiementSuivi)) {
            errors.push('Le numéro de paiement (suivi) ne doit contenir que des chiffres');
          }
        }
          if (
            watch('mode_paiement_suivi') !== 1 &&
            watch('mode_paiement_suivi') !== 5&&
            watch('mode_paiement_suivi') !== 6
          ) {
            if (!watch('echeance_suivi') || watch('echeance_suivi') === '') {
              errors.push("La date d'échéance est requise");
            }
          }
        }
      } else if (Number(watch('statut_suivi')) !== 1) {
        const commentaire = watch('commentaire') || '';
        if (!commentaire || commentaire.trim() === '') {
          errors.push('Le commentaire est requis pour ce type de suivi');
        }
      }
    }

    // 4. Loading form state
    if (loading_form) {
      errors.push('Le formulaire est en cours de chargement');
    }

    // 5. Price validation
    if (info_prix != null) {
      errors.push(info_prix);
    }

    // 6. Surface validation
    if (info_sup != null) {
      errors.push(info_sup);
    }

    // 9. Reservation validation
    if (info_reservation != null) {
      errors.push(info_reservation);
    }

    // 18. React Hook Form errors
    if (Object.keys(errors).length > 0 && formSubmitted) {
      Object.values(errors).forEach((error) => {
        if (error && error.message) {
          errors.push(error.message);
        }
      });
    }

    return errors;
  };
  const onSubmit = (data) => {
    const validationErrors = validateFields();

    // If there are validation errors, show them and stop submission
    if (validationErrors.length > 0) {
      // Store errors in state to display them
      setValidationErrorList(validationErrors);

      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });

      return;
    }

    // Clear any previous errors
    setValidationErrorList([]);
    setFormSubmitted(true);

    setLoading_form(true);
    setBackendErrors({});

    let url = APIURL.VISITES;
    let method = 'post';

    // Map object values to string IDs (or join them), depending on the field
    const transformMultiSelectField = (value, key) => {
      if (!value) return '';

      if (Array.isArray(value)) {
        if (value.length === 0) return '';

        // If array of objects with ID
        if (typeof value[0] === 'object') {
          return value.map((v) => v.id).join(',');
        }

        // If array of strings or numbers
        return value.join(',');
      }

      // If value is already a string or number
      return value;
    };

    // Create a list of all fields that need transformation
    const multiSelectFields = [
      'tranches',
      'typologies',
      'vues',
      'etages',
      'orientations',
    ];

    // Clone your original data
    const preparedData = { ...data };

    // Apply transformations only to the relevant fields
    multiSelectFields.forEach((field) => {
      preparedData[field] = transformMultiSelectField(data[field], field);
    });
    //frein MAJUSCULE
    if (preparedData.frein) {
      const freinStr = Array.isArray(preparedData.frein)
        ? preparedData.frein.join(',')
        : String(preparedData.frein);

      preparedData.frein = freinStr
        .split(',')
        .map((item) => item.toUpperCase())
        .join(',');
    }
    //ORIENTATION  1,2===>N,S
   // Nettoyer les orientations avant envoi
if (preparedData.orientations) {
  // Si c'est un tableau, nettoyer les valeurs vides
  let cleanOrientations = [];
  
  if (Array.isArray(preparedData.orientations)) {
    cleanOrientations = preparedData.orientations.filter(v => v && v !== '' && v !== null);
  } else if (typeof preparedData.orientations === 'string') {
    cleanOrientations = preparedData.orientations.split(',').filter(v => v && v.trim() !== '');
  }
  
  // Supprimer les doublons
  cleanOrientations = [...new Set(cleanOrientations)];
  
  // Convertir en codes backend
  const orientationCodeMap = {
    '1': 'N', '2': 'E', '3': 'S', '4': 'O',
    '5': 'N_E', '6': 'N_O', '7': 'S_E', '8': 'S_O',
    '9': 'NORD_SUD', '10': 'NORD_OUEST', '11': 'SUD_EST', '12': 'EST_OUEST',
    '13': 'NO_SE', '14': 'NORD_SUD_OUEST', '15': 'NORD_SUD_EST', '16': 'NORD_EST_OUEST'
  };
  
  const mappedCodes = cleanOrientations
    .map(code => orientationCodeMap[code.toString()])
    .filter(Boolean);
  
  preparedData.orientations = mappedCodes.join(',');
}

    const dataToSend = new FormData();
    Object.entries(preparedData).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    if (isEditing) {
      url = `${url}/${id}`;
      method = 'put';
    }

    axios({
      method: method,
      url: url,
      data: dataToSend,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        let message =
          "Une erreur s'est produite lors de la soumission du formulaire.";
        if (res.status === 200) {
          message = `Visite ${isEditing ? 'modifiée' : 'créée'} avec succès`;
          toast.success(message);
          router.push(ENDPOINTS.CRM + '?tab=visites');
          reset(defaultValues);
        } else if (res.status === 422) {
          message = res.data.message;
          setBackendErrors(res.data.errors);

          // Effacer les erreurs après 5 secondes
          setTimeout(() => setBackendErrors({}), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response && response.status === 422) {
          setBackendErrors(response.data.errors);

          // Effacer les erreurs après 5 secondes
          setTimeout(() => setBackendErrors({}), 5000);
        } else if (response.status === 333) {
          toast.error(response.data.error_33);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
        }
      })
      .finally(() => setLoading_form(false));
  };

  const handleChange_event = (text) => (event) => {
    const value = event.target.value;
    if (text === 'cin') {
      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'cin');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } else if (text === 'Téléphone' || text === 'Téléphone2') {
      if (value.length >= 10) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'tel');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } else if (text === "l'email") {
      if (value.length >= 9) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'email');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    }
  };

  const fetch_event_visite = async (v, route, text, param) => {
    await axios
      .get(
        `${APIURL.ROOT}/v1/` +
          route +
          `/` +
          param +
          `/` +
          v +
          '/' +
          selectedProjet?.id,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data.prospect.length != 0) {
          setDisabled(true);
          if (res.data.prospect.cin != null) {
            setValue('cin', res.data.prospect.cin);
          }
          if (res.data.prospect.nom != null) {
            setValue('nom', res.data.prospect.nom);
          }
          if (res.data.prospect.prenom != null) {
            setValue('prenom', res.data.prospect.prenom);
          }
          if (res.data.prospect.telephone != null) {
            setValue('telephone', res.data.prospect.telephone);
          }
          if (res.data.prospect.telephone_num2 != null) {
            setValue('telephone_num2', res.data.prospect.telephone_num2);
          }
          if (res.data.prospect.email != null) {
            setValue('email', res.data.prospect.email);
          }

          if (res.data.prospect.source != null) {
            setValue('source_id', res.data.prospect.source.id);
            setValue('source_txt', res.data.prospect.source.source);
            setDisabled_source(true);
          } else {
            setValue('source_id', '');
            setValue('source_txt', '');
            setDisabled_source(false);
          }
          if (res.data.prospect.partenaire_id != null) {
            setPartenaire_txt(res.data.prospect.partenaire.description);
            setValue(
              'partenaire_txt',
              res.data.prospect.partenaire.description
            );
            setValue('partenaire_id', res.data.prospect.partenaire_id);
            setDisabled_source(true);
          } else {
            setPartenaire_txt(null);
            setValue('partenaire_txt', null);
            setValue('partenaire_id', null);
            setDisabled_source(false);
          }
          if (res.data.prospect.notifie != null) {
            setValue('notifie', res.data.prospect.notifie);
          }
          if (res.data.prospect.is_client === 0) {
            setInfo_client(
              'le ' +
                text +
                ' :' +
                v +
                ' appartient au prospect ' +
                res.data.prospect.nom +
                ' ' +
                res.data.prospect.prenom
            );
            setTimeout(() => {
              setInfo_client(null);
            }, 7000);
          } else {
            setInfo_client(
              'le ' +
                text +
                ' :' +
                v +
                ' appartient au client ' +
                res.data.prospect.nom +
                ' ' +
                res.data.prospect.prenom
            );
            setTimeout(() => {
              setInfo_client(null);
            }, 7000);
          }
        } else {
          if (disabled_var == true) {
            setValue('nom', '');
            setValue('prenom', '');
            if (text == 'Téléphone') {
              setValue('cin', '');
              setValue('telephone_num2', null);
              setValue('email', '');
            } else if (text == 'Téléphone2') {
              setValue('cin', '');
              setValue('telephone', '');
              setValue('email', '');
            } else if (text == 'cin') {
              setValue('telephone', '');
              setValue('telephone_num2', null);
              setValue('email', '');
            } else if (text == "l'email") {
              setValue('cin', '');
              setValue('telephone', '');
              setValue('telephone_num2', null);
              setValue('email', '');
            }
          }
          setValue('source_id', '');
          setValue('source_id', '');
          setValue('partenaire_id', null);
          setPartenaire_txt('');
          setValue('notifie', 0);
          setDisabled(false);
          setDisabled_source(false);
        }
      })
      .catch(() => {
        setDisabled(false);
        setDisabled_source(false);
        setInfo_client(null);
      });
  };

  const fetch_bien_ByProjet = async (bien_id_, bien_propriete, txt) => {
    if (watch('interet') == 1) {
      setLoading_bien(true);
      await axios
        .get(
          `${APIURL.ROOTV1}/getBiensByProjet_Concat_for_reservation_visite/` +
            bien_id_ +
            '/' +
            selectedProjet?.id,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((res) => {
          setLoading_bien(false);
          setBiensByProjet(res.data.biens);
          /* if (bien_propriete != undefined && bien_id_ != undefined) {
            // on cas de edit avec interet different au debut
            const exists = res.data.biens.some((b) => b.id == bien_id_);
            if (!exists) {
              res.data.biens.push({
                propriete_dite_bien: bien_propriete,
                id: bien_id_,
              });
            }
          } else {
            //si on modifier le bien deja pre reservé
            res.data.biens.push({
              propriete_dite_bien: bien_propriete_o,
              id: watch("bien_id"),
            });
          }
          setBiensByProjet(res.data.biens);*/
          /*  if (text == 'without_proposition') {
            if (bien_id_ != null) {
              for (var i = 0; i <= Number(res.data.biens.length) - 1; i++) {
                if (bien_id_ == res.data.biens[i].id) {
                  //setBienKey(i)
                }
              }
            }
          }*/
        })
        .catch(() => {
          setLoading_bien(false);
        });
    }
  };
  const getParsed = (val) => parseFloat(val) || 0;

  //10+30+4+10    //10+4500
 /* const getSurfaceTotal = () =>
    getParsed(watch('superficie_jardin_calculer')) +
    getParsed(watch('superficie_habitable')) +
    getParsed(watch('superficie_balcon_calculer')) +
    getParsed(watch('superficie_terrasse_calculer'));*/
 const getSurfaceVendable = () =>getParsed(watch('superficie_vendable'));
  const getPrixTotal = (unitPrice) =>
    unitPrice * getSurfaceVendable() +
    getParsed(watch('prix_box')) +
    getParsed(watch('prix_parking'));

const handlechangeprix_remise = (event) => {
  const prixRemise = getParsed(event.target.value);
  const prixUnitaire = getParsed(watch('prix_unitaire'));
  const prixForfetaire = getParsed(watch('prix_forfetaire'));
  
  // Utilise prix_remise SEULEMENT si c'est un nombre positif (> 0)
  // Si prix_remise est 0 ou null/undefined, utilise prix_unitaire
  let basePrice;
  if (prixRemise > 0) {
    basePrice = prixRemise;
  } else {
    basePrice = prixUnitaire;
  }
  
  const total = getPrixTotal(basePrice);
  const finalPrice = prixForfetaire > 0 ? total - prixForfetaire : total;
  
  setValue('prix', finalPrice);
  setValue('reste', finalPrice - getParsed(watch('avance_res')));
};

  const handlechangeprix_forfetaire = (event) => {
  const prixRemise = getParsed(watch('prix_remise'));
  const prixUnitaire = getParsed(watch('prix_unitaire'));
  const prixForfetaire = getParsed(event.target.value);
  
  // Utilise prix_remise SEULEMENT si c'est un nombre positif (> 0)
  let basePrice;
  if (prixRemise > 0) {
    basePrice = prixRemise;
  } else {
    basePrice = prixUnitaire;
  }
  
  const total = getPrixTotal(basePrice);
  const finalPrice = prixForfetaire > 0 ? total - prixForfetaire : total;
  
  setValue('prix', finalPrice);
  setValue('reste', finalPrice - getParsed(watch('avance_res')));
};
// Ouvrir les panels de réservation et paiement par défaut
useEffect(() => {
  if (watch('interet') === '1' && watch('statut') == 2 && watch('bien_id')) {
    // Ouvrir les deux panels
    if (!expanded.includes('panel_res')) {
      setExpanded(prev => [...prev, 'panel_res']);
    }
    if (!expanded.includes('panel_pai')) {
      setExpanded(prev => [...prev, 'panel_pai']);
    }
  }
}, [watch('interet'), watch('statut'), watch('bien_id')]);
useEffect(() => {
  if (watch('bien_id') && watch('interet') === '1') {
    const prixUnitaire = getParsed(watch('prix_unitaire'));
    const prixRemise = getParsed(watch('prix_remise'));
    const prixForfetaire = getParsed(watch('prix_forfetaire'));
    
    let basePrice;
    if (prixRemise > 0) {
      basePrice = prixRemise;
    } else {
      basePrice = prixUnitaire;
    }
    
    const total = getPrixTotal(basePrice);
    const finalPrice = prixForfetaire > 0 ? total - prixForfetaire : total;
    
    setValue('prix', finalPrice);
    setValue('reste', finalPrice - getParsed(watch('avance_res')));
  }
}, [watch('bien_id'), watch('prix_unitaire'), watch('prix_remise'), watch('prix_forfetaire')]);

  const handlechangeMontant = (event) => {
    const prixFinal = parseFloat(watch('prix')) || 0;
    const avance = parseFloat(event.target.value) || 0;
    setValue('reste', prixFinal - avance);
  };

  // First select: Source
  const handleSourceChange = (sourceId) => {
    const selectedSource = sources.find(
      (source) => source.id.toString() === sourceId
    );
    const sourceText = selectedSource ? selectedSource.source : '';

    setValue('partenaire_id', ''); // Reset partenaire ID when source changes
    setValue('source_txt', sourceText); // Set source text
    setValue('source_id', selectedSource ? selectedSource.id : ''); // Set source ID
    setPartenaire_txt(null);

    // Also update the source text in state for conditional rendering
    setSourceText(sourceText);
  };

  // Second select: Partenaire
  const handlePartenaireChange = (partenaireId) => {
    const selectedPartenaire = partenaires.find(
      (part) => part.id.toString() === partenaireId
    );
    setValue('partenaire_id', selectedPartenaire ? selectedPartenaire.id : ''); // Set partenaire ID
    setValue(
      'partenaire_txt',
      selectedPartenaire ? selectedPartenaire.description : ''
    ); // Set partenaire text
  };

  const handleChange_freins = (selectedValues) => {
    try {
      console.log('Selected freins:', selectedValues);

      let values = [];

      // If selectedValues is an array of objects (from SelectInput), extract values
      if (
        Array.isArray(selectedValues) &&
        selectedValues.length > 0 &&
        typeof selectedValues[0] === 'object'
      ) {
        values = selectedValues.map((item) => (item.value || '').toUpperCase());
      }
      // If it's already an array of strings (from initial data), use as is but convert to uppercase
      else if (Array.isArray(selectedValues)) {
        values = selectedValues.map((val) => val.toUpperCase());
      }
      // Fallback for single value or empty
      else {
        values = selectedValues ? [selectedValues.toUpperCase()] : [];
      }

      console.log('Processed frein values (uppercase):', values);
      setValue('frein', values);
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
  };

  const handleChange_tp_notif = (code) => {
    if (code) {
      setValue('mode_relance', code);
      if (code == 3) {
        setEmail_required(true);
      } else {
        setEmail_required(false);
      }
    }
  };

  const handleChange_mode_finance = (code) => {
    if (code) {
      setValue('mode_financement', code);
    }
  };
  const handleChange_mode_paiement = (code) => {
    if (code) {
      setValue('mode_paiement', code);
    }
  };
  const handleinputchange_banuqe = (e) => {
    if (e) {
      setValue('banque_id', e.target.value);
    }
  };

  const isDisabled =
    loading_form ||
    info_prix != null ||
    info_sup != null ||
    (watch('statut') == 2 &&
      (watch('code_reservation') == '' ||
        watch('bien_val') == null ||
        watch('prix_val') == null ||
        watch('date_reservation') == '' ||
        watch('avance_res') == null ||
        watch('avance_res') < 0 ||
        watch('mode_financement') == null ||
        watch('mode_paiement') == null ||
        (watch('check_montant') == true &&
          watch('commentaireAvance') != null &&
          watch('commentaireAvance').length == 0) ||
        (watch('avance_res') == 0 && watch('check_montant') == false) ||
        errors.avance_res)); // Add this check for avance_res errors

  function NomBienComplet(bien) {
    console.log('Full bien object:', bien); // Log the entire object
    const noms = [];

    if (bien.tranche?.nom) {
      console.log('Adding tranche:', bien.tranche.nom);
      noms.push(bien.tranche.nom);
    }

    if (bien.bloc?.nom) {
      console.log('Adding bloc:', bien.bloc.nom);
      noms.push(bien.bloc.nom);
    }

    if (bien.immeuble?.nom) {
      console.log('Adding immeuble:', bien.immeuble.nom);
      noms.push(bien.immeuble.nom);
    }

    console.log('Adding propriete_dite_bien:', bien.propriete_dite_bien);
    noms.push(bien.propriete_dite_bien);

    const result = noms.join(' - ');
    console.log('Final result:', result);
    return result;
  }
  if (isEditing && !formData) {
    return <LoadingSpin />;
  }

  const orientationOptions = Object.keys(ORIENTATIONS).map((key) => ({
    code: ORIENTATIONS[key].code,
    label: ORIENTATIONS[key].label,
    description: ORIENTATIONS[key].description,
  }));

  const handlechangeBien_id = (event, newBien) => {
    const previousBien = previousBienRef.current;

    console.log('✅ New Bien ID:', newBien?.id);
    console.log('🔁 Previous Bien ID:', previousBien?.id);

    if (newBien != null) {
      localStorage.removeItem('selectedBien');
      setValue('old_bien_id', previousBien?.id);

      setValue('bien_id', newBien?.id);
      setValue('bien_val', newBien.propriete_dite_bien);
      setValue('prix_val', newBien.prix);
      setValue('prix', newBien.prix);
      /*setValue(
        'superficie_balcon_calculer',
        newBien.superficie_balcon_calculer != null
          ? newBien.superficie_balcon_calculer
          : 0
      );
      setValue(
        'superficie_jardin_calculer',
        newBien.superficie_jardin_calculer != null
          ? newBien.superficie_jardin_calculer
          : 0
      );
      setValue(
        'superficie_terrasse_calculer',
        newBien.superficie_terrasse_calculer != null
          ? newBien.superficie_terrasse_calculer
          : 0
      );
      setValue(
        'superficie_habitable',
        newBien.superficie_habitable != null ? newBien.superficie_habitable : 0
      );*/
      setValue(
        'superficie_vendable',
        newBien.superficie_vendable != null
          ? newBien.superficie_vendable
          : 0
      );
      setValue('prix_box', newBien.prix_box ? newBien.prix_box : 0);
      setValue('prix_parking', newBien.prix_parking ? newBien.prix_parking : 0);
      setValue(
        'prix_unitaire',
        newBien.prix_unitaire ? newBien.prix_unitaire : 0
      );
       setValue(
        'prix_remise',
        newBien.prix_unitaire ? newBien.prix_unitaire : 0
      );
      setValue(
        'avance_minimale',
        newBien.avance_minimale ? newBien.avance_minimale : 0
      );

      localStorage.removeItem('selectedBien');
      localStorage.setItem('selectedBien', newBien.id);
      const storedBien = localStorage.getItem('selectedBien');
      if (storedBien) {
        storebien_en_proposition(storedBien);
        pusher_function();
      }
      // Update previous bien
      previousBienRef.current = newBien;
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.CRM + '?tab=visites'}
          step={`${isEditing ? 'Modifier' : 'Ajouter'} une Visite`}
        />
      </div>

      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        {info_client != null && (
          <div className="w-full">
            <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded">
              {info_client}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Client/Prospect Infor.mation */}
            <div className="col-span-3">
              <h2
                className="text-lg font-medium border-b pb-2 mb-4"
                style={{ color: '#231651' }}
              >
                Informations du prospect
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <>
                <ProspectInformations
                  control={control}
                  watch={watch}
                  errors={errors}
                  backendErrors={backendErrors}
                  defaultValues={defaultValues}
                  formSubmitted={formSubmitted}
                  email_required={email_required}
                  loading={loading}
                  loading_sources={loading_sources}
                  loading_partenaires={loading_partenaires}
                  sources={sources}
                  handleSourceChange={handleSourceChange}
                  partenaires={partenaires}
                  handlePartenaireChange={handlePartenaireChange}
                  disabled_var={disabled_var}
                  // selectedProspect={selectedProspect}
                  disabled_var_source={disabled_var_source}
                  partenaire_txt={partenaire_txt}
                  sourceValue={
                    sources.find((opt) => opt.id == watch('source_id')) || null
                  } // Ensure null when undefined
                  partenaireValue={
                    partenaires.find(
                      (opt) => opt.id == watch('partenaire_id')
                    ) || null
                  } // Ensure null when undefined
                  handleChange_event={handleChange_event}
                />
              </>
            </div>

            {/* Visite Information */}
            <div className="col-span-3 mt-4">
              <h2
                className="text-lg font-medium border-b pb-2 mb-4"
                style={{ color: '#231651' }}
              >
                Informations de la visite
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <SelectInput
                label="Intérêt:"
                name="interet"
                value={watch('interet')}
                required={true}
                options={
                  Dossiers_Suivis?.length > 0
                    ? // Si des dossiers existent, inclure toutes les options y compris "Suivi Dossier"
                      Object.values(VISITE_INTERETS)
                        .filter((interet) => interet.code !== 4) // Exclure "Injoignable"
                        .map((interet) => ({
                          value: interet.code.toString(),
                          label: interet.label,
                        }))
                    : // Si aucun dossier, exclure "Suivi Dossier"
                      Object.values(VISITE_INTERETS)
                        .filter(
                          (interet) => interet.code !== 4 && interet.code !== 5
                        ) // Exclure "Injoignable" ET "Suivi Dossier"
                        .map((interet) => ({
                          value: interet.code.toString(),
                          label: interet.label,
                        }))
                }
                onChange={(value) => handleChange_interet(value)}
                error={errors.interet?.message || backendErrors.interet}
                submitted={formSubmitted}
              />

              {Number(watch('interet')) === 2 && (
                <>
                  <SelectInput
                    label="Mode Relance:"
                    name="mode_relance"
                    placeholder="Sélectionner le mode de relance"
                    required={false}
                    value={watch('mode_relance')}
                    options={Object.values(VISITE_TYPE_NOTIF).map((item) => ({
                      value: item.code,
                      label: item.label,
                    }))}
                    onChange={(value) => handleChange_tp_notif(value)}
                    error={
                      errors.mode_relance?.message || backendErrors.mode_relance
                    }
                    submitted={formSubmitted}
                  />
                  <TextField
                    label="Date Relance:"
                    name="date_relance"
                    type="date"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </>
              )}

              {Number(watch('interet')) === 3 && (
                <FreinsComponentEdit
                  watch={watch}
                  control={control}
                  errors={errors}
                  backendErrors={backendErrors}
                  defaultValues={defaultValues}
                  formSubmitted={formSubmitted}
                  type_freins={type_freins}
                  list_tranches={tranches}
                  list_etages={list_etages}
                  orientationOptions={orientationOptions}
                  list_typologies={list_typologies}
                  list_vues={list_vues}
                  loading_tp_frein={loading_tp_frein}
                  loading={loading}
                  loading_tranches={loading_tranches}
                  loading_vues={loading_vues}
                  loading_typologies={loading_typologies}
                  handleChange_freins={handleChange_freins}
                  handlePrixChange={handlePrixChange}
                  setValue={setValue}
                  info_prix={info_prix}
                  info_sup={info_sup}
                  isEditMode={true} // Specify the mode here
                />
              )}

              {Number(watch('interet')) === 1 && (
                <>
                  <SelectInput
                    label="Bien:"
                    required={true}
                    placeholder="Sélectionner le bien"
                    name="bien_id"
                    value={watch('bien_id')}
                    options={biensByProjet.map((bien) => {
                      // Add the same disabled logic from your autocomplete
                      const isDisabled =
                        bien.etat === 'ENCOURS_DE_PROPOSITION' &&
                        bien.is_proposed !== null &&
                        user?.id !== bien.is_proposed.user_id;

                      // Add the same label text logic from your autocomplete
                      const labelText =
                        bien.propriete_dite_bien +
                        (bien.etat === 'ENCOURS_DE_PROPOSITION'
                          ? bien.is_proposed
                            ? user?.id !== bien.is_proposed.user_id
                              ? ` Proposé par ${bien.is_proposed.user?.name} ${bien.is_proposed.user?.prenom}`
                              : ' Proposé par Moi Même'
                            : ''
                          : '');

                      return {
                        value: bien.id,
                        label: labelText,
                        disabled: isDisabled, // Add disabled property
                      };
                    })}
                    onChange={(value) => {
                      const selectedBien = biensByProjet.find(
                        (b) => b.id === value
                      );
                      handlechangeBien_id(null, selectedBien);
                    }}
                    loading={loading_bien}
                    error={errors.bien_id?.message || backendErrors.bien_id}
                    submitted={formSubmitted}
                  />

                  {/* Statut */}
                  <div>
                    <SelectInput
                      label="Statut:"
                      placeholder="Sélectionner le statut"
                      name="statut"
                      value={watch('statut')}
                      required={true}
                      options={Object.values(VISITE_STATUT_FORM).map(
                        (item) => ({
                          value: item.code,
                          label: item.label,
                        })
                      )}
                      onChange={(value) => setValue('statut', value)}
                      error={errors.statut?.message || backendErrors.statut}
                      submitted={formSubmitted}
                    />
                  </div>

                  {/* Conditional RDV / Relance fields */}
                  {watch('statut') == 1 && (
                    <>
                      <TextField
                        label="Rendez Vous:"
                        name="rdv"
                        type="datetime-local"
                        //  disabled={watch('statut') == 3 || watch('statut') == 4}
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                      />

                      <SelectInput
                        label="Mode Relance:"
                        name="mode_relance"
                        required={false}
                        value={watch('mode_relance')}
                        options={Object.values(VISITE_TYPE_NOTIF).map(
                          (item) => ({
                            value: item.code,
                            label: item.label,
                          })
                        )}
                        onChange={(value) => handleChange_tp_notif(value)}
                        error={
                          errors.mode_relance?.message ||
                          backendErrors.mode_relance
                        }
                        submitted={formSubmitted}
                      />
                      <TextField
                        label="Date Relance:"
                        name="date_relance"
                        type="date"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                      />
                      <TextField
                        label="Commentaire:"
                        name="commentaire"
                        type="text"
                        multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                        control={control} // Passed from useForm hook
                        errors={errors} // Validation errors from React Hook Form
                        backendErrors={backendErrors} // Backend error messages if any
                        defaultValues={defaultValues} // Default values for the form
                        width="w-full" // Optionally set width, default is 'w-80'
                        height="h-full" // Optionally set height, default is 'h-10'
                      />
                    </>
                  )}
                </>
              )}
              {Number(watch('interet')) == 5 && (
                <>
                  <SelectInput
                    placeholder="Sélectionner un dossier"
                    required
                    label="Dossier :"
                    name="dossier_id_suivi"
                    value={watch('dossier_id_suivi')}
                    options={
                      Dossiers_Suivis?.length > 0
                        ? Dossiers_Suivis.map((dossier) => {
                            const prixTotal = parseFloat(dossier.prix) || 0;
                            const avances =
                              parseFloat(dossier.avances_sum_montant) || 0;
                            const reste = prixTotal - avances;

                            return {
                              value: dossier.id,
                              // Formater le label avec les informations
                              label: `${
                                dossier.code_reservation
                              } - ${prixTotal.toLocaleString(
                                'fr-FR'
                              )} MAD (Reste: ${reste.toLocaleString(
                                'fr-FR'
                              )} MAD)`,
                            };
                          })
                        : [
                            {
                              value: '',
                              label: 'Aucun dossier disponible',
                            },
                          ]
                    }
                    onChange={(value) => {
                      handleChange_dossier_suivi(value);
                       // If you want to directly set code_suivi here too:
                            if (value) {
                              const selectedDossier = Dossiers_Suivis.find(dossier => dossier.id == value);
                              if (selectedDossier) {
                                setValue('code_suivi', selectedDossier.code_reservation);
                              }
                            }
                      if (validationErrors.dossier_id_suivi) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.dossier_id_suivi;
                          return newErrors;
                        });
                      }
                    }}
                    error={validationErrors.dossier_id_suivi}
                  />

                  <SelectInput
                    placeholder="Sélectionner un statut"
                    label="Statut :"
                    required
                    name="statut_suivi"
                    value={watch('statut_suivi')}
                    options={Object.values(Statut_SUIVI_DOSSIER).map(
                      (suivi) => ({
                        value: suivi.code.toString(),
                        label: suivi.label,
                      })
                    )}
                    onChange={(value) => {
                      handleChange_statut_suivi(value);
                      // Nettoyer l'erreur quand l'utilisateur corrige
                      if (validationErrors.statut_suivi) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.statut_suivi;
                          return newErrors;
                        });
                      }
                    }}
                    error={validationErrors.statut_suivi}
                  />

                  {/* Section Nouvelle Avance - Conditionnelle */}
                  {showNouvelleAvance && (
                    <div className="col-span-3 border rounded-lg p-4 mt-4 bg-gray-50">
                      <h3
                        className="text-lg font-medium border-b pb-2 mb-4"
                        style={{ color: '#231651' }}
                      >
                        Informations de la Nouvelle Avance
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* SR Checkbox */}
                        <div className="flex items-center space-x-3 mt-2">
                          <Controller
                            name="sr_suivi"
                            control={control}
                            render={({ field }) => (
                              <>
                                <input
                                  type="checkbox"
                                  id="sr_suivi"
                                  checked={field.value || false}
                                  onChange={(e) =>
                                    field.onChange(e.target.checked)
                                  }
                                  className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                />
                                <label
                                  htmlFor="sr_suivi"
                                  className="text-sm font-medium"
                                >
                                  SR
                                </label>
                              </>
                            )}
                          />
                        </div>
                        {/* Montant */}
                        <div>
                          <TextField
                            label="Montant :"
                            name="montant_suivi"
                            type="number"
                            control={control}
                            errors={{
                              ...errors,
                              montant_suivi:
                                validationErrors.montant_suivi || null,
                            }}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            required={showNouvelleAvance}
                            inputProps={{
                              min: 0,
                              step: 100,
                            }}
                            onChange={(e) => {
                              // Nettoyer l'erreur quand l'utilisateur corrige
                              if (validationErrors.montant_suivi) {
                                setValidationErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.montant_suivi;
                                  return newErrors;
                                });
                              }

                              // Validation du montant
                              const montant = parseFloat(e.target.value);
                              if (montant == 0) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  montant_suivi:
                                    'Le montant ne doit pas être 0',
                                }));
                                return;
                              }
                              if (montant < 0) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  montant_suivi: 'Le montant doit être positif',
                                }));
                                return;
                              }
                              // Vérifier si le montant est inférieur à 100
                              if (montant < 100) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  montant_suivi:
                                    'Le montant minimum est 100 MAD',
                                }));
                                return;
                              }
                              // Vérification en temps réel si un dossier est sélectionné
                              if (montant > 0 && watch('dossier_id_suivi')) {
                                const dossierSelectionne = Dossiers_Suivis.find(
                                  (dossier) =>
                                    dossier.id == watch('dossier_id_suivi')
                                );

                                if (dossierSelectionne) {
                                  const prixTotal =
                                    parseFloat(dossierSelectionne.prix) || 0;
                                  const avances =
                                    parseFloat(
                                      dossierSelectionne.avances_sum_montant
                                    ) || 0;
                                  const reste = prixTotal - avances;

                                  if (montant > reste) {
                                    setValidationErrors((prev) => ({
                                      ...prev,
                                      montant_suivi: `Le montant ne doit pas dépasser le reste (${reste.toLocaleString(
                                        'fr-FR'
                                      )} MAD)`,
                                    }));
                                  } else if (montant == 0) {
                                  }
                                }
                              }
                            }}
                          />
                          {validationErrors.montant_suivi &&
                            !errors?.montant_suivi && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.montant_suivi}
                              </p>
                            )}
                        </div>

                        {/* Mode de Paiement */}
                        <div>
                          <SelectInput
                            label="Mode de Paiement :"
                            name="mode_paiement_suivi"
                            value={watch('mode_paiement_suivi')}
                            options={Object.values(MODE_PAIEMENT).map(
                              (paiement) => ({
                                value: paiement.code.toString(),
                                label: paiement.label,
                              })
                            )}
                            onChange={(value) => {
                              setValue('mode_paiement_suivi', value);
                              // Nettoyer l'erreur quand l'utilisateur corrige
                              if (validationErrors.mode_paiement_suivi) {
                                setValidationErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.mode_paiement_suivi;
                                  return newErrors;
                                });
                              }
                              // Réinitialiser les champs conditionnels si on change de mode
                              if (value == '1') {
                                setValue('banque_id_suivi', '');
                                setValue('num_paiement_suivi', '');
                                setValue('echeance_suivi', '');
                              }
                            }}
                            placeholder="Sélectionner un mode de paiement"
                            required={showNouvelleAvance}
                            error={validationErrors.mode_paiement_suivi}
                          />
                        </div>

                        {/* Date de Paiement */}
                        <div>
                          <TextField
                            label="Date de Paiement :"
                            name="date_paiement_suivi"
                            type="date"
                            control={control}
                            errors={{
                              ...errors,
                              date_paiement_suivi:
                                validationErrors.date_paiement_suivi || null,
                            }}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            required={showNouvelleAvance}
                            onChange={(e) => {
                              // Nettoyer l'erreur quand l'utilisateur corrige
                              if (validationErrors.date_paiement_suivi) {
                                setValidationErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.date_paiement_suivi;
                                  return newErrors;
                                });
                              }
                            }}
                          />
                          {validationErrors.date_paiement_suivi &&
                            !errors?.date_paiement_suivi && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.date_paiement_suivi}
                              </p>
                            )}
                        </div>

                        {/* Champs conditionnels pour paiement non-espèces */}
                        {watch('mode_paiement_suivi') &&
                          watch('mode_paiement_suivi') !== '1' && (
                            <>
                              {/* Banque */}
                              <div>
                                <SelectInput
                                  label="Banque :"
                                  name="banque_id_suivi"
                                  value={watch('banque_id_suivi')}
                                  options={banques.map((banque) => ({
                                    value: banque.id.toString(),
                                    label: banque.nom,
                                  }))}
                                  onChange={(value) => {
                                    setValue('banque_id_suivi', value);
                                    // Nettoyer l'erreur quand l'utilisateur corrige
                                    if (validationErrors.banque_id_suivi) {
                                      setValidationErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.banque_id_suivi;
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  placeholder="Sélectionner une banque"
                                  required={
                                    watch('mode_paiement_suivi') !== '1'
                                  }
                                  error={validationErrors.banque_id_suivi}
                                />
                              </div>

                              {/* Numéro de Paiement */}
                              <div>
                                <TextField
                                  label="N° Paiement :"
                                  name="num_paiement_suivi"
                                  type="text"
                                  control={control}
                                  errors={{
                                    ...errors,
                                    num_paiement_suivi:
                                      validationErrors.num_paiement_suivi ||
                                      null,
                                  }}
                                  backendErrors={backendErrors}
                                  defaultValues={defaultValues}
                                  required={
                                    watch('mode_paiement_suivi') !== '1'
                                  }
                                  inputProps={{
                                    placeholder: 'Numéro de chèque/virement',
                                  }}
                                  onChange={(e) => {
                                    // Nettoyer l'erreur quand l'utilisateur corrige
                                    if (validationErrors.num_paiement_suivi) {
                                      setValidationErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.num_paiement_suivi;
                                        return newErrors;
                                      });
                                    }
                                  }}
                                />
                                {validationErrors.num_paiement_suivi &&
                                  !errors?.num_paiement_suivi && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {validationErrors.num_paiement_suivi}
                                    </p>
                                  )}
                              </div>

                              {/* Date d'Échéance pour chèque */}
                              {watch('mode_paiement_suivi') !== '1' &&
                                watch('mode_paiement_suivi') !== '5' &&
                                watch('mode_paiement_suivi') !== '6' && (
                                  <div>
                                    <TextField
                                      label="Date d'Échéance :"
                                      name="echeance_suivi"
                                      type="date"
                                      control={control}
                                      errors={{
                                        ...errors,
                                        echeance_suivi:
                                          validationErrors.echeance_suivi ||
                                          null,
                                      }}
                                      backendErrors={backendErrors}
                                      defaultValues={defaultValues}
                                      required={
                                        watch('mode_paiement_suivi') !== '1'
                                      }
                                      onChange={(e) => {
                                        // Nettoyer l'erreur quand l'utilisateur corrige
                                        if (validationErrors.echeance_suivi) {
                                          setValidationErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.echeance_suivi;
                                            return newErrors;
                                          });
                                        }
                                      }}
                                    />
                                    {validationErrors.echeance_suivi &&
                                      !errors?.echeance_suivi && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {validationErrors.echeance_suivi}
                                        </p>
                                      )}
                                  </div>
                                )}
                            </>
                          )}
                        {(user.role <= 2 || user?.role ==10) && watch('montant_suivi') > 0 && (
                          <>
                            <div className="col-span-3">
                              <h2
                                className="text-lg font-medium border-b pb-2 mb-4"
                                style={{ color: '#231651' }}
                              >
                                Informations Encaissement
                              </h2>
                            </div>
                            {/* N° Remise */}
                            <div>
                              <TextField
                                label="N° Encaissement :"
                                name="num_remise_suivi"
                                type="number"
                                control={control}
                                errors={errors}
                                backendErrors={backendErrors}
                                defaultValues={defaultValues}
                                inputProps={{
                                  placeholder: 'Numéro de remise',
                                }}
                              />
                            </div>

                            {/* Date d'Encaissement */}
                            <div>
                              <TextField
                                label="Date d'Encaissement :"
                                name="date_encaissement_suivi"
                                type="date"
                                control={control}
                                errors={errors}
                                backendErrors={backendErrors}
                                defaultValues={defaultValues}
                                onChange={(e) => {
                                  // Optionally add validation here
                                }}
                              />
                            </div>
                          </>
                        )}
                        {/* Commentaire spécifique pour l'avance */}
                        <div className="col-span-3">
                          <TextField
                            label="Commentaire sur l'avance :"
                            name="commentaire_av_suivi"
                            multi={true}
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            width="w-full"
                            height="h-20"
                          />
                        </div>
                      </div>

                      {/* Bouton pour réinitialiser les champs d'avance */}
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setValue('montant_suivi', '');
                            setValue('num_paiement_suivi', '');
                            setValue('banque_id_suivi', '');
                            setValue('mode_paiement_suivi', '');
                            setValue(
                              'date_paiement_suivi',
                              new Date().toISOString().split('T')[0]
                            );
                            setValue('echeance_suivi', '');
                            setValue('commentaire_av_suivi', '');
                            setValue('sr_suivi', false);
                            setValue('num_remise_suivi', '');
                            setValue('date_encaissement_suivi', '');
                            // Nettoyer toutes les erreurs de cette section
                            const cleanedErrors = { ...validationErrors };
                            delete cleanedErrors.montant_suivi;
                            delete cleanedErrors.mode_paiement_suivi;
                            delete cleanedErrors.date_paiement_suivi;
                            delete cleanedErrors.banque_id_suivi;
                            delete cleanedErrors.num_paiement_suivi;
                            delete cleanedErrors.echeance_suivi;
                            setValidationErrors(cleanedErrors);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Réinitialiser les informations d{"'"}avance
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {watch('interet') == 1 &&
              watch('statut') == 2 &&
              watch('bien_id') != '' && (
                <div>
                  {watch('statut') == 2 && watch('bien_id') != null && (
                    <div className="border rounded-lg  mt-4">
                      {/* Accordion Header */}
                      <div
                        className="flex items-center justify-between px-4 py-2 cursor-pointer"
                        style={{ background: '#2f8a8bab' }}
                        onClick={() => handleChange(`panel_res`)}
                      >
                        <h3 className="text-white font-semibold">
                          Réservation du Bien {watch('bien_val')}
                        </h3>
                        <span className="text-white">
                          {expanded.includes(`panel_res`) ? '⌃' : '⌄'}
                        </span>
                      </div>

                      {/* Accordion Content */}
                      {expanded.includes(`panel_res`) && (
                        <div className="p-4 space-y-4 bg-white">
                          {info_reservation && (
                            <div className="bg-red-100 border-l-4 border-red-500 !text-red-700 p-4 text-center rounded">
                              {info_reservation}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <TextField
                              label="Code Réservation:"
                              required
                              name="code_reservation"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={(e) =>
                                handleChange_code_res(e.target.value)
                              }
                            />

                            <TextField
                              label="Bien:"
                              disabled
                              name="bien_val"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />
                            <TextField
                              label="Prix:"
                              disabled
                              name="prix_val"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />
                            <TextField
                              label="Date Réservation:"
                              name="date_reservation"
                              type="date"
                              required
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />
                            <TextField
                              label="Commentaire:"
                              name="commentaire_res"
                              type="text"
                              multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                              control={control} // Passed from useForm hook
                              errors={errors} // Validation errors from React Hook Form
                              backendErrors={backendErrors} // Backend error messages if any
                              defaultValues={defaultValues} // Default values for the form
                              width="w-full" // Optionally set width, default is 'w-80'
                              height="h-full" // Optionally set height, default is 'h-10'
                            />
                          </div>
                        </div>
                      )}
                      {/* Paiement */}
                      <div className="border rounded-lg  mt-4">
                        {/* Accordion Header */}
                        <div
                          className="flex items-center justify-between px-4 py-2 cursor-pointer"
                          style={{ background: '#2f8a8bab' }}
                          onClick={() => handleChange(`panel_pai`)}
                        >
                          <h3 className="text-white font-semibold">
                            Paiement du Bien {watch('bien_val')}
                          </h3>
                          <span className="text-white">
                            {expanded.includes(`panel_pai`) ? '⌃' : '⌄'}
                          </span>
                        </div>

                        {/* Accordion Content */}
                        {expanded.includes(`panel_pai`) && (
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white transition-all duration-300">
                            <div>
                              <label
                                className="flex items-center space-x-2"
                                style={{ marginTop: '30px' }}
                              >
                                <Controller
                                  name="sr"
                                  control={control}
                                  defaultValue={defaultValues['sr']} // Make sure it's a boolean
                                  render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`text-sm font-medium ${
                                          field.value ? 'text-purple-600' : ''
                                        }`}
                                      >
                                        SR:
                                      </span>
                                      <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                        className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                      />
                                    </div>
                                  )}
                                />
                              </label>
                            </div>

                            <TextField
                              label="Prix:"
                              name="prix_val"
                              type="number"
                              disabled
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />

                            <TextField
                              label="Prix Unitaire:"
                              name="prix_unitaire"
                              type="number"
                              disabled
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />
                            <TextField
                              label="Prix Unitaire Remisé:"
                              name="prix_remise"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={(e) => handlechangeprix_remise(e)}
                            />
                            <TextField
                              label="Remise Forfetaire:"
                              name="prix_forfetaire"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={(e) => handlechangeprix_forfetaire(e)}
                            />
                            <TextField
                              label="Prix Final:"
                              name="prix"
                              type="number"
                              disabled
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />

                            <TextField
                              label="Reste Avance:"
                              name="avance_minimale"
                              type="number"
                              disabled
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />

                            <TextField
                              label="Reste:"
                              name="reste"
                              type="number"
                              disabled
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                            />

                            <TextField
                              label="Montant:"
                              name="avance_res"
                              type="number"
                              required
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={(e) => handlechangeMontant(e)}
                            />

                            <SelectInput
                              label="Mode Financement:"
                              placeholder="Sélectionner le mode de financement"
                              name="mode_financement"
                              required={true}
                              value={watch('mode_financement')}
                              options={Object.values(MODE_FINANCE).map(
                                (item) => ({
                                  value: item.code,
                                  label: item.label,
                                })
                              )}
                              onChange={(value) =>
                                handleChange_mode_finance(value)
                              }
                              error={
                                errors.mode_financement?.message ||
                                backendErrors.mode_financement
                              }
                              submitted={formSubmitted}
                            />
                    {watch("avance_res") > 0 && (   
                      
                    <SelectInput
                              placeholder="Sélectionner le mode de paiement"
                              label="Mode Paiement:"
                              name="mode_paiement"
                              required={true}
                              value={watch('mode_paiement')}
                              options={Object.values(MODE_PAIEMENT).map(
                                (item) => ({
                                  value: item.code,
                                  label: item.label,
                                })
                              )}
                              onChange={(value) =>
                                handleChange_mode_paiement(value)
                              }
                              error={
                                errors.mode_paiement?.message ||
                                backendErrors.mode_paiement
                              }
                              submitted={formSubmitted}
                            />
)}
                           
                            {/* Conditional Fields */}
                            {watch('mode_paiement') !== 1 &&
                              watch('mode_paiement') !== '' && (
                                <>
                                  <SelectInput
                                    label="Banque:"
                                    name="banque_id"
                                    placeholder="Sélectionner La banque"
                                    value={watch('banque_id')}
                                    required={watch('mode_paiement') !== 1}
                                    options={banques.map((banque) => ({
                                      value: banque.id,
                                      label: banque.nom,
                                    }))}
                                    onChange={(value) =>
                                      setValue('banque_id', value)
                                    }
                                    error={
                                      errors.banque_id?.message ||
                                      backendErrors.banque_id
                                    }
                                    submitted={formSubmitted}
                                  />
                                  <TextField
                                    label="N° Paiement:"
                                    name="numero_paiement"
                                    type="number"
                                    required={
                                      watch('mode_paiement') !== 1 &&
                                      watch('mode_paiement') !== ''
                                    }
                                    control={control}
                                    errors={errors}
                                    backendErrors={backendErrors}
                                    defaultValues={defaultValues}
                                  />
                                </>
                              )}

                            {watch('mode_paiement') !== '' &&
                              watch('mode_paiement') !== 1 &&
                              watch('mode_paiement') !== 5 &&
                              watch('mode_paiement') !== 6 && (
                                <TextField
                                  label="Date Échéance:"
                                  name="echeance"
                                  required={
                                    watch('mode_paiement') !== 1 &&
                                    watch('mode_paiement') !== ''
                                  }
                                  type="date"
                                  control={control}
                                  errors={errors}
                                  backendErrors={backendErrors}
                                  defaultValues={defaultValues}
                                />
                              )}
                            {watch('avance_res') != '' &&
                              watch('avance_res') == 0 && (
                                <div>
                                  <label
                                    className="flex items-center space-x-2"
                                    style={{ marginTop: '19px' }}
                                  >
                                    <Controller
                                      name="check_montant"
                                      control={control}
                                      defaultValue={false}
                                      render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                          <span
                                            className={`text-sm font-medium ${
                                              field.value
                                                ? 'text-purple-600'
                                                : ''
                                            }`}
                                          >
                                            Voulez vous Enregistrer la
                                            Réservation sans montant (Prière de
                                            saisir un commentaire)
                                          </span>
                                          <input
                                            type="checkbox"
                                            {...field}
                                            checked={field.value}
                                            required={
                                              watch('avance_res') !== '' &&
                                              watch('avance_res') === 0
                                            }
                                            className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                            style={{ color: 'green' }}
                                          />
                                        </div>
                                      )}
                                    />
                                  </label>
                                </div>
                              )}
                            <TextField
                              label="Commentaire:"
                              name="commentaireAvance"
                              required={
                                watch('check_montant') == true ? true : false
                              }
                              multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                              control={control} // Passed from useForm hook
                              errors={errors} // Validation errors from React Hook Form
                              backendErrors={backendErrors} // Backend error messages if any
                              defaultValues={defaultValues} // Default values for the form
                              width="w-full" // Optionally set width, default is 'w-80'
                              height="h-500" // Optionally set height, default is 'h-10'
                            />
                            {(user.role <= 2|| user?.role ==10) && watch('avance_res') > 0 && (
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
                                  control={control}
                                  errors={errors}
                                  backendErrors={backendErrors}
                                  defaultValues={defaultValues}
                                />
                                <TextField
                                  label="Date Encaissement:"
                                  name="date_encaissement"
                                  type="date"
                                  control={control}
                                  errors={errors}
                                  backendErrors={backendErrors}
                                  defaultValues={defaultValues}
                                />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            {(Number(watch('interet')) === 2 ||
              Number(watch('interet')) === 3 ||
              Number(watch('interet')) == 5) && (
              <div className="flex-1 mt-4">
                <TextField
                  label="Commentaire:"
                  name="commentaire"
                  required={
                    Number(watch('interet')) == 5 &&
                    watch('statut_suivi') != '1'
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
              </div>
            )}
          </div>
          {validationErrorList.length > 0 && (
            <div className="col-span-full mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-700 font-semibold mb-2">
                Veuillez corriger les erreurs suivantes :
              </h3>
              <ul className="list-disc pl-5 text-red-600">
                {validationErrorList.map((error, index) => (
                  <li key={index} className="mb-1">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" loading={loading_form}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
