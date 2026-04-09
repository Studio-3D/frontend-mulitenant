'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import {
  fetchData_Select,
  fetchDataByProjet,
} from '../../../../../src/configs/api-utils';
import Modal from '@/components/Modal';
import format from 'date-fns/format';

import BreadCrumb from '../../navigation/BreadCrumb';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';

import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import Modal_Propsepct_Exist from './Modal_Propsepct_Exist';
import { useProjet } from '@/context/ProjetContext';
import InputField_Biens from './InputField_Biens'; // adjust path if needed
import ProspectInformations from './ProspectInformations'; // Adjust path as needed
import { getStoredPerson } from '@/components/storageHelpers';
import useClearProspect from '../hook/useClearProspect';

import {
  VISITE_INTERETS,
  VISITE_STATUT_FORM,
  VISITE_TYPE_NOTIF,
  MODE_FINANCE,
  MODE_PAIEMENT,
  ORIENTATIONS,
  Statut_SUIVI_DOSSIER,
} from '@/configs/enum';
import Pusher from 'pusher-js';
import Modal_OldVisites_Perdu from './Modal_OldVisites_Perdu';
import FreinsComponent from './FreinsComponent';
import SelectInput from '@/components/SelectInput';
import { useSociete } from '@/context/SocieteContext';

const VisiteForm = ({ prospect_id, origin, client_reservations = [] }) => {
  const router = useRouter();
  useClearProspect();
  const { user } = useAuth();
  const [email_required, setEmail_required] = useState(false);
  const [validationErrorList, setValidationErrorList] = useState([]);

  //dialog
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [open_dialog, setOpen_Dialog] = useState(false);
  const [info_client_1, setInfo_client_1] = useState(null);
  const [info_param, setInfo_param] = useState(null);

  const [client_prospect, setClient_prospect] = useState(null);
  const [id_appel, setId_appel] = useState(null);
  const [id_visite, setId_visite] = useState(null);
  const accessToken = localStorage.getItem('accessToken');
  const { person: selectedPerson, type: personType } = getStoredPerson();
  // Initialize Dossiers_Suivis with client_reservations if provided
  const [Dossiers_Suivis, setDossiers_Suivis] = useState(() => {
    if (client_reservations && client_reservations.length > 0) {
      // Transform reservations to match Dossiers_Suivis format
      return client_reservations.map((reservation) => ({
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        prix: reservation.prix,
        avances_sum_montant: reservation.avances_sum_montant || 0,
      }));
    } else if (selectedPerson?.client?.reservations?.length > 0) {
      return selectedPerson?.client?.reservations?.map((reservation) => ({
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        prix: reservation.prix,
        avances_sum_montant: reservation.avances_sum_montant || 0,
      }));
    } else if (selectedPerson?.reservations?.length > 0) {
      return selectedPerson?.reservations?.map((reservation) => ({
        id: reservation.id,
        code_reservation: reservation.code_reservation,
        prix: reservation.prix,
        avances_sum_montant: reservation.avances_sum_montant || 0,
      }));
    }
    return [];
  });
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const [loading, setLoading] = useState(false);
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading_form, setLoading_form] = useState(false);

  const { selectedProjet } = useProjet();
  const [backendErrors, setBackendErrors] = useState({});
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [loading_sources, setLoading_sources] = useState(false);
  const [loading_partenaires, setLoading_partenaire] = useState(false);
  const [loading_banques, setLoading_banques] = useState(false);
  const [disabled_var, setDisabled] = useState(false);

  const [OldBiens_pre, setOldBiens_pre] = useState([]);
  const [biensByProjet, setBiensByProjet] = useState(null);
  const [input_biens, setinput_biens] = useState([]);
  const [check_save, setCheck_save] = useState(true);
  const [list_tranches, setList_tranches] = useState([]);
  const [loading_tranches, setLoading_tranches] = useState(false);

  const [loading_vues, setLoading_vues] = useState(false);

  const [loading_typologies, setLoading_typologies] = useState(false);

  // const user = JSON.parse(localStorage.getItem('authUser'));
  const current = new Date();
  var new_date = current.setDate(current.getDate());
  const date_reservation = useState(
    new Date(new_date).toISOString().split('T')[0]
  );
  const date_reglement = new Date(new_date).toISOString().split('T')[0];
  const [check_total, setCheck_total] = useState(0);
  const [banques, setBanques] = useState([]);
  const [expanded, setExpanded] = useState([]);
  //const [expandedVendu, setExpandedVendu] = useState([]);
  const [loading_button_save_1, setLoading_button_save_1] = useState(false);
  const [loading_bien, setLoading_bien] = useState(false);
  const [type_freins, setType_freins] = useState([]);
  const [list_typologies, setListTyplogies] = useState([]);
  const [list_vues, setList_Vues] = useState([]);
  const [info_prix, setInfo_prix] = useState(null);
  const [info_sup, setInfo_sup] = useState(null);
  const [reset1, setReset1] = useState(0);
  const [input_biens_vendu, setinput_biens_vendu] = useState([]);
  const [check_save_1, setCheck_save_1] = useState(true);
  const [info_reservation, setInfo_reservation] = useState(null);
  const list_etages = [];
  const [disabled_var_source, setDisabled_source] = useState(false);
  const [display_cin, setdisplay_cin] = useState(false);
  const [display_cin_1, setdisplay_cin_1] = useState(false);
  const [paper_exist, setpaper_exist] = useState(0);
  const [old_visites_perdu, setOld_visites_perdu] = useState([]);
  const [reset_perdu, setReset_perdu] = useState(0);
  const [loading_button_save_perdu, setLoading_button_save_perdu] =
    useState(false);
  const [open_D_P, setOpen_D_P] = useState(false);
  const handleCloseD_P = () => {
    setOpen_D_P(false);
    const hasAnyVisite = old_visites_perdu.length > 0;
    const allActionsEmpty = old_visites_perdu.every(
      (v) => v.action == 0 || v.action == '' || v.action == null
    );

    if (hasAnyVisite && allActionsEmpty) {
      setLoading_form(false);
    }
  };

  const [check_save_perdu, setCheck_save_perdu] = useState(false);
  const isOrigin = !!origin;
  const [partenaire_txt, setPartenaire_txt] = useState(
    selectedPerson?.partenaire?.description
      ? selectedPerson.partenaire.description
      : null
  );
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digit characters except '+'
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Morocco: +212|00212|212 -> 0 + rest (9 digits after prefix)
    if (cleaned.match(/^(\+212|00212|212)/)) {
      let rest = cleaned.replace(/^(\+212|00212|212)/, '');
      // Ensure we have exactly 9 digits after prefix
      if (rest.length > 9) rest = rest.slice(0, 9);
      return '0' + rest;
    }
    
    // France: +33|0033|0 -> 0 + rest (9 digits after prefix)
    if (cleaned.match(/^(\+33|0033|0)/)) {
      let rest = cleaned.replace(/^(\+33|0033|0)/, '');
      // Ensure we have exactly 9 digits after prefix
      if (rest.length > 9) rest = rest.slice(0, 9);
      return '0' + rest;
    }
    
    // USA/Canada: +1|001|1 -> keep as is (10 digits)
    if (cleaned.match(/^(\+1|001|1)/)) {
      let rest = cleaned.replace(/^(\+1|001|1)/, '');
      if (rest.length > 10) rest = rest.slice(0, 10);
      return '+1' + rest;
    }
    
    // UK: +44|0044|0 -> 0 + rest (10 digits after prefix)
    if (cleaned.match(/^(\+44|0044|0)/)) {
      let rest = cleaned.replace(/^(\+44|0044|0)/, '');
      if (rest.length > 10) rest = rest.slice(0, 10);
      return '0' + rest;
    }
    
    // Morocco local: starts with 05,06,07, etc.
    if (cleaned.match(/^0[5-9]/)) {
      if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
      return cleaned;
    }
    
    // France local: starts with 01-09
    if (cleaned.match(/^0[1-9]/)) {
      if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
      return cleaned;
    }
    
    // Default: return cleaned number
    return cleaned;
  };
  const defaultValues = {
    //suvi dossier
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

    interet: '',
    selectedProjet: selectedProjet?.id,
    client_id: personType == 'client' ? selectedPerson?.id : '',
    id_t_appel: selectedPerson?.id_t_appel || '',
    prospect_id: selectedPerson?.id || prospect_id || '',
    last_origin_id_of_prospect: null,
    cin: selectedPerson?.cin || '',
    nom: selectedPerson?.nom || '',
    email: selectedPerson?.email || '',
    prenom: selectedPerson?.prenom || '',
    telephone:
      personType == 'prospect'
        ? formatPhoneNumber(selectedPerson?.telephone)
        : personType == 'client'
        ? formatPhoneNumber(selectedPerson?.telephone_num1)
        : '',
    telephone_num2: selectedPerson?.telephone_num2 || null,
    ville: selectedPerson?.ville || '',
    notifie: selectedPerson?.notifie || '',
    source_id: selectedPerson?.source?.id || '',
    source_txt: selectedPerson?.source?.source || '',
    partenaire_id: selectedPerson?.partenaire_id || '',
    partenaire_txt: partenaire_txt,
    interet: '',
    date_relance: '',
    mode_relance: '',
    rdv: '',
    frein: [],
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
    description_autre: '',
    loading_b_pre: false,
    nb_bien_added: '',

    /**request bien interesse*/

    list_bien_interesse: [],
    list_bien_transfere_vendu: [],
  };

  const validationSchemaRef = useRef(
    yup.object().shape({
      ...(!isOrigin && {
        prenom: yup.string().required('Le prénom est requis'),
        telephone: yup
          .string()
          .required('Le num de telephone est requis')
          .matches(/^\d*$/, 'Seulement des chiffres') // allow only digits if filled
          .min(10, 'Minimum 10 chiffres')
          .max(14, 'Maximum 14 chiffres'),

        source_id: yup.string().required('La Source est requis'),
        telephone_num2: yup
          .string()
          .transform((value, originalValue) => {
            // Convert string "null" or empty string to actual null
            return originalValue == 'null' || originalValue == ''
              ? null
              : originalValue;
          })
          .nullable()
          .notRequired()
          .min(10, 'Minimum 10 chiffres')
          .max(14, 'Maximum 14 chiffres'),
      }),
      interet: yup.string().required('Interêt de visite est requis'),
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

  if (list_etages.length == 0 && selectedProjet?.max_etages > 0) {
    for (let i = 0; i <= selectedProjet?.max_etages; i++) {
      list_etages.push({ id: i + 1, value: i });
    }
  }

  const pusher_function = async () => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(`${pusher_key_proposition}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');

    channel.bind('App\\Events\\PropositionUpdated', (data) => {
      console.log('Proposal status changed:', data);
      fetch_bien_ByProjet();
    });
    console.log('bien_to', biensByProjet);

    return () => {
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };
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

  const handleChange = (panel) => {
    setExpanded(
      (prev) =>
        prev.includes(panel)
          ? prev.filter((p) => p !== panel) // Collapse
          : [...prev, panel] // Expand
    );
  };

  const set_bien_disponible = async (id) => {
    axios
      .delete(`${APIURL.ROOTV1}/libererBien/` + id, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        console.log('bien est liberé');
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          console.error(response.data.error);
        }
      });
  };

  const fetchTypeFreins = async () => {
    setLoading_tp_frein(true);
    try {
      const res = await axios.get(`${APIURL.ROOTV1}/typefreins`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('frein', res.data.typefreins);

      // The API returns objects with 'description' field, not 'frein.description'
      setType_freins([
        { id: 'tout', description: 'Autre' },
        ...(res.data.typefreins || []),
      ]);
    } catch (e) {
      // Optionally handle error here
    } finally {
      setLoading_tp_frein(false);
    }
  };
  // Ajoutez cet état
  const [showNouvelleAvance, setShowNouvelleAvance] = useState(false);

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
    if (code) {
      setValue('interet', code);

      // Si on sélectionne "Suivi Dossier", réinitialiser les biens
      if (code == 5) {
        setValue('list_bien_interesse', []);
        setValue('list_bien_transfere_vendu', []);
        setValue('nb_bien_added', '');
        setCheck_save(true);
        setdisplay_cin_1(false);

        // Réinitialiser les biens pré-réservés
        input_biens.forEach((input) => {
          if (input.bien_id != '') {
            set_bien_disponible(input.bien_id);
          }
        });
      }

      // Réinitialiser les champs de suivi dossier si on change d'intérêt (sauf si on va vers Suivi Dossier)
      if (Number(code) !== 5) {
        setValue('dossier_id_suivi', '');
        setValue('statut_suivi', '');
      }

      if (code == 2) {
        // Réceptif - clear both arrays
        setValue('list_bien_interesse', []);
        setValue('list_bien_transfere_vendu', []);
        setValue('nb_bien_added', '');
        setCheck_save(true);
        setdisplay_cin_1(false);
        input_biens.forEach((input) => {
          //check if one of inputs bien_id !=null
          if (input.bien_id != '') {
            set_bien_disponible(input.bien_id);
          }
        });
        pusher_function();
      }

      //interesse
      else if (code == 1) {
        setValue('nb_bien_added', '');

        // Check if list_bien_transfere_vendu has data
        const currentVendu = watch('list_bien_transfere_vendu');
        console.log(
          'Current vendu data when switching to intéressé:',
          currentVendu
        );

        // If vendu array is empty or doesn't exist, clear it
        // Otherwise, keep it (because user might have marked some biens as "vente")
        if (
          !currentVendu ||
          currentVendu.length == 0 ||
          currentVendu == '[]' ||
          currentVendu == '""' ||
          (typeof currentVendu == 'string' && currentVendu.trim() == '')
        ) {
          setValue('list_bien_transfere_vendu', []);
        }
        // Else: DO NOT clear it - keep the existing vendu biens

        if (watch('cin') == '' && !isOrigin) {
          setdisplay_cin_1(true);
        }
        if (watch('cin') == '' && isOrigin && display_cin) {
          setdisplay_cin_1(true);
        }
        fetch_bien_ByProjet();
        pusher_function();
      }

      //perdu
      else if (code == 3) {
        // Perdu - clear both arrays
        setValue('list_bien_interesse', []);
        setValue('list_bien_transfere_vendu', []);
        setdisplay_cin_1(false);
        setValue('nb_bien_added', '');
        setCheck_save(true);
        fetchTypeFreins();
        fetchDataByProjet('tranches', setList_tranches, setLoading_tranches);
        fetchDataByProjet('vues', setList_Vues, setLoading_vues);
        fetchDataByProjet(
          'typologies',
          setListTyplogies,
          setLoading_typologies
        );
        input_biens.forEach((input) => {
          //check if one of inputs bien_id !=null
          if (input.bien_id != '') {
            set_bien_disponible(input.bien_id);
          }
        });
        pusher_function();
      }
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
  const fetch_visite_bien_pre_reserve = async () => {
    if (isOrigin) {
      try {
        setValue('loading_b_pre', true);
        const response = await axios.get(
          `${APIURL.ROOTV1}/get_oldBien_visite_pre_reserve/${origin}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setOldBiens_pre([]);

        if (response.data.biens_visite?.length > 0) {
          const newOldBiens = response.data.biens_visite.map((visite) => ({
            propriete_dite_bien: visite.bien.propriete_dite_bien,
            prix: visite.bien.prix,
            prix_unitaire: visite.bien.prix_unitaire,
            bien_id: visite.bien_id,
            visite_id: visite.id,
            superficie_jardin_calculer: visite.bien.superficie_jardin_calculer,
            superficie_habitable: visite.bien.superficie_habitable,
            superficie_balcon_calculer: visite.bien.superficie_balcon_calculer,
            superficie_terrasse_calculer:
              visite.bien.superficie_terrasse_calculer,
            prix_box: visite.bien.prix_box,
            prix_parking: visite.bien.prix_parking,
            avance_minimale: visite.bien.avance_minimale,
            action: 0,
          }));
          setOldBiens_pre(newOldBiens);
        }

        if (response.data.biens_traitement_freins?.length > 0) {
          const traitementFreins = response.data.biens_traitement_freins.map(
            (frein) => ({
              propriete_dite_bien: frein.bien.propriete_dite_bien,
              prix: frein.bien.prix,
              prix_unitaire: frein.bien.prix_unitaire,
              bien_id: frein.bien_id,
              traitement_frein_id: frein.id,
              superficie_jardin_calculer: frein.bien.superficie_jardin_calculer,
              superficie_habitable: frein.bien.superficie_habitable,
              superficie_balcon_calculer: frein.bien.superficie_balcon_calculer,
              superficie_terrasse_calculer:
                frein.bien.superficie_terrasse_calculer,
              prix_box: frein.bien.prix_box,
              prix_parking: frein.bien.prix_parking,
              avance_minimale: frein.bien.avance_minimale,
              action: 0,
            })
          );
          setOldBiens_pre((prev) => [...prev, ...traitementFreins]);
        }

        setValue('loading_b_pre', false);
      } catch (error) {
        console.error('Error fetching visite details:', error);
        setValue('loading_b_pre', false);
        console.error('Erreur lors de la récupération des biens pré-réservés');
      }
    }
  };

  // Ajouter ce useEffect après les autres useEffect
  useEffect(() => {
    const avanceRes = input_biens.find((bien) => bien.statut == 2)?.avance_res;

    if (avanceRes === 0 || avanceRes === '0') {
      // Pour tous les biens avec statut 2 (vendu) et montant 0
      const updatedBiens = input_biens.map((bien) => {
        if (
          bien.statut == 2 &&
          (bien.avance_res === 0 || bien.avance_res === '0')
        ) {
          return {
            ...bien,
            mode_paiement: '1',
            banque_id: '',
            numero_paiement: '',
            echeance: '',
          };
        }
        return bien;
      });

      setinput_biens(updatedBiens);
      setValue('list_bien_interesse', JSON.stringify(updatedBiens));

      // Même logique pour input_biens_vendu
      const updatedBiensVendu = input_biens_vendu.map((bien) => {
        if (
          bien.statut == 2 &&
          (bien.avance_res === 0 || bien.avance_res === '0')
        ) {
          return {
            ...bien,
            mode_paiement: '1',
            banque_id: '',
            numero_paiement: '',
            echeance: '',
          };
        }
        return bien;
      });

      setinput_biens_vendu(updatedBiensVendu);
      setValue('list_bien_transfere_vendu', JSON.stringify(updatedBiensVendu));
    }
  }, [input_biens, input_biens_vendu, setValue]);
  useEffect(() => {
    //set on show visite le cadre est null pour saffiche par premier cadre
    localStorage.setItem('v_id_cadre', null);
    localStorage.setItem('v_id_org', null);
    if (isOrigin) {
      axios
        .get(`${APIURL.VISITES}/${origin}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          //setFirst_visite(response.data.visite)
          if (response.data.visites[0].prospect.cin == null) {
            setdisplay_cin(true);
          }
          setValue('prospect_id', response.data.visites[0]?.prospect?.id);
          setOld_visites_perdu([]);
          for (var i = 0; i <= Number(response.data.visites.length) - 1; i++) {
            if (response.data.visites[i].interet == '3') {
              //si le frein est active
              if (
                response.data.visites[i]?.freins?.etat == 1 ||
                response.data.visites[i]?.freins?.etat == 2 ||
                response.data.visites[i]?.freins?.etat == 6
              ) {
                let date = format(
                  new Date(response.data.visites[i].created_at),
                  'dd/MM/yyyy '
                );
                let fr_id = response.data.visites[i]?.freins.id;
                let origin_id = response.data.visites[i].origin_id;
                let v_cadre_id = response.data.visites[i].related_show_id;
                let frein_exp = '';
                if (response.data.visites[i]?.freins.frein_tranche.length > 0) {
                  frein_exp += 'Tranche ,';
                }
                if (response.data.visites[i]?.freins.frein_etage.length > 0) {
                  frein_exp += 'Etage ,';
                }

                if (
                  response.data.visites[i]?.freins.frein_orientation.length > 0
                ) {
                  frein_exp += 'Orientation ,';
                }
                if (
                  response.data.visites[i]?.freins.frein_typologie.length > 0
                ) {
                  frein_exp += 'Typologie ,';
                }
                if (response.data.visites[i]?.freins.frein_vue.length > 0) {
                  frein_exp += 'Vue ,';
                }
                if (
                  (response.data.visites[i]?.freins.prix_min != null &&
                    response.data.visites[i]?.freins.prix_min != 0) ||
                  (response.data.visites[i]?.freins.prix_max != null &&
                    response.data.visites[i]?.freins.prix_max != 0)
                ) {
                  frein_exp += 'Prix ,';
                }
                if (
                  (response.data.visites[i]?.freins.superficie_min != null &&
                    response.data.visites[i]?.freins.superficie_min != 0) ||
                  (response.data.visites[i]?.freins.superficie_max != null &&
                    response.data.visites[i]?.freins.superficie_max != 0)
                ) {
                  frein_exp += 'Superficie ,';
                }
                if (response.data.visites[i]?.freins.avance != null) {
                  frein_exp += 'Avance ,';
                }
                if (
                  response.data.visites[i]?.freins.description_autre != null
                ) {
                  frein_exp += 'Frein Autre,';
                }

                setOld_visites_perdu((v) => [
                  ...v,
                  {
                    origin_id: origin_id,
                    v_cadre_id: v_cadre_id,
                    date: date,
                    fr_id: fr_id,
                    frein: frein_exp,
                    action: 0,
                  },
                ]);
              }
            }
          }
          console.log(
            'les visites Perdus==>' + JSON.stringify(old_visites_perdu)
          );
        })
        .catch((error) => {
          console.error('Error fetching projet details:', error);
        });

      fetch_visite_bien_pre_reserve();
    } else {
      fetchData_Select('sources', setSources, setLoading);

      if (partenaires.length == 0) {
        fetchDataByProjet('partenaires', setPartenaires, setLoading);
      }
    }
    fetchData_Select('banques', setBanques, setLoading);

    // Fetch data using visiteId and update projetDetails state
  }, [accessToken, isOrigin, origin]);

  const handlePrixChange = (val) => {
    setTimeout(() => {
      let a, b, minField, maxField;

      if (val == 1) {
        a = Number(watch('prix_min')); // Convertir en nombre
        b = Number(watch('prix_max')); // Convertir en nombre
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
      } else if (val == 2) {
        a = Number(watch('sup_min')); // Convertir en nombre
        b = Number(watch('sup_max')); // Convertir en nombre
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
  const [validationErrors, setValidationErrors] = useState({});

  // 1) Extract all your checks into a single function
  const validateFields = () => {
    const errors = [];
    // 19. Check if pre-reserved biens need action
    if (OldBiens_pre.length > 0 && paper_exist == 0) {
      const hasUnprocessedBiens = OldBiens_pre.some(
        (bien) => !bien.action || bien.action == 0 || bien.action == ''
      );

      if (hasUnprocessedBiens) {
        errors.push(
          'Vous devez traiter tous les biens pré-réservés avant de soumettre le formulaire'
        );
      }
    }
    // 16. Basic required fields for non-origin
    if (!isOrigin) {
      if (!watch('prenom') || watch('prenom').trim() === '') {
        errors.push('Le prénom est requis');
      }

      if (!watch('telephone') || watch('telephone').trim() === '') {
        errors.push('Le téléphone est requis');
      } else if (
        watch('telephone').length < 10 ||
        watch('telephone').length > 14
      ) {
        errors.push('Le téléphone doit contenir 10 à 14 chiffres');
      }

      if (!watch('source_id') || watch('source_id') === '') {
        errors.push('La source est requise');
      }

      // Telephone 2 validation
      if (watch('telephone_num2')) {
        if (
          watch('telephone_num2').length < 10 ||
          watch('telephone_num2').length > 14
        ) {
          errors.push('Le téléphone 2 doit contenir 10 à 14 chiffres');
        }
      }
    }

    // 17. Interet required
    if (!watch('interet') || watch('interet') === '') {
      errors.push("L'intérêt de visite est requis");
    }
    // 3. Interet validation for nb_bien_added
    if (Number(watch('interet')) === 1) {
      const nbBiensAdded = Number(watch('nb_bien_added'));

      // Check if it's required based on whether there are already vendu biens
      if (input_biens_vendu.length === 0) {
        // No existing vendu biens, so we need at least 1 bien
        if (isNaN(nbBiensAdded) || nbBiensAdded < 1) {
          errors.push('Nombre de biens obligatoire (minimum 1)');
        }
      } else {
        // Already have vendu biens, so 0 is acceptable
        if (isNaN(nbBiensAdded) || nbBiensAdded < 0) {
          errors.push('Veuillez entrer un nombre valide (0 ou plus)');
        }
      }
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

    // 7. Check save validation
    if (check_save == false) {
      errors.push('Certains champs de biens ne sont pas correctement remplis');
    }

    // 8. Old biens pre-reserved validation
    if (OldBiens_pre.length > 0 && !isOrigin && paper_exist == 0) {
      errors.push('Des biens pré-réservés nécessitent une action');
    }

    // 9. Reservation validation
    if (info_reservation != null) {
      errors.push(info_reservation);
    }

    // 10. Dialog open validation
    if (open_D_P) {
      errors.push('Veuillez traiter les anciennes visites perdues');
    }

    // 11. Biens transférés validation
    if (Number(watch('interet')) === 1) {
      const venduBiensCount = input_biens_vendu.length;
      const newBiensCount = Number(watch('nb_bien_added')) || 0;
      const totalBiens = venduBiensCount + newBiensCount;

      if (totalBiens === 0) {
        errors.push(
          'Vous devez avoir au moins un bien (transféré ou ajouté) lorsque vous êtes intéressé'
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

          if (
            !watch('num_paiement_suivi') ||
            watch('num_paiement_suivi') === ''
          ) {
            errors.push('Le numéro de paiement est requis');
          }

          if (
            watch('mode_paiement_suivi') !== '1' &&
            watch('mode_paiement_suivi') !== '5' &&
            watch('mode_paiement_suivi') !== '6'
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
    if (Number(watch('interet')) === 1) {
      const newBiensCount = Number(watch('nb_bien_added')) || 0;

      if (newBiensCount > 0) {
        // Check each input_bien only if we're adding new biens
        input_biens.forEach((x, index) => {
          if (!x.bien_id) {
            errors.push(
              `Bien ${
                input_biens_vendu.length + index + 1
              }: La sélection d'un bien est requise`
            );
          }

          if (!x.statut) {
            errors.push(
              `Bien ${
                input_biens_vendu.length + index + 1
              }: Le statut est requis`
            );
          }
        });
      }
    }
    // 13. Avance validation for input_biens
    input_biens.forEach((x, index) => {
      if (x.statut == 2 && x.bien_id != null) {
        // Check required fields for sold biens
        if (!x.code_reservation || x.code_reservation.trim() === '') {
          errors.push(`Bien ${index + 1}: Le code de réservation est requis`);
        }

        if (!x.date_reservation) {
          errors.push(`Bien ${index + 1}: La date de réservation est requise`);
        }

        const avance = parseFloat(x.avance_res || 0);
        if (isNaN(avance) || avance < 0) {
          errors.push(`Bien ${index + 1}: Montant d'avance invalide`);
        }

        if (avance == 0 && user?.role > 2) {
          errors.push(
            `Bien ${index + 1}: Le montant ne peut pas être 0 pour votre rôle`
          );
        }

        if (avance > 0 && avance < parseFloat(x.avance_minimale || 0)) {
          errors.push(
            `Bien ${index + 1}: Le montant doit être au moins ${
              x.avance_minimale
            } MAD`
          );
        }

        if (!x.mode_financement) {
          errors.push(`Bien ${index + 1}: Le mode de financement est requis`);
        }

        if (!x.mode_paiement) {
          errors.push(`Bien ${index + 1}: Le mode de paiement est requis`);
        }

        if (x.mode_paiement !== '1') {
          if (!x.banque_id) {
            errors.push(`Bien ${index + 1}: La banque est requise`);
          }

          if (!x.numero_paiement) {
            errors.push(`Bien ${index + 1}: Le numéro de paiement est requis`);
          }
        }
      }
    });

    // 14. Avance validation for input_biens_vendu
    input_biens_vendu.forEach((x, index) => {
      if (x.statut == 2 && x.bien_id != null) {
        // Check required fields for sold biens
        if (!x.code_reservation || x.code_reservation.trim() === '') {
          errors.push(
            `Bien vendu ${index + 1}: Le code de réservation est requis`
          );
        }

        if (!x.date_reservation) {
          errors.push(
            `Bien vendu ${index + 1}: La date de réservation est requise`
          );
        }

        const avance = parseFloat(x.avance_res || 0);
        if (isNaN(avance) || avance < 0) {
          errors.push(`Bien vendu ${index + 1}: Montant d'avance invalide`);
        }

        if (avance == 0 && user?.role > 2) {
          errors.push(
            `Bien vendu ${
              index + 1
            }: Le montant ne peut pas être 0 pour votre rôle`
          );
        }

        if (avance > 0 && avance < parseFloat(x.avance_minimale || 0)) {
          errors.push(
            `Bien vendu ${index + 1}: Le montant doit être au moins ${
              x.avance_minimale
            } MAD`
          );
        }

        if (!x.mode_financement) {
          errors.push(
            `Bien vendu ${index + 1}: Le mode de financement est requis`
          );
        }

        if (!x.mode_paiement) {
          errors.push(
            `Bien vendu ${index + 1}: Le mode de paiement est requis`
          );
        }

        if (x.mode_paiement !== '1') {
          if (!x.banque_id) {
            errors.push(`Bien vendu ${index + 1}: La banque est requise`);
          }

          if (!x.numero_paiement) {
            errors.push(
              `Bien vendu ${index + 1}: Le numéro de paiement est requis`
            );
          }
        }
      }
    });

    // 15. Freins validation for "Perdu"
    if (Number(watch('interet')) === 3) {
      const frein = watch('frein') || [];

      if (frein.length === 0) {
        errors.push('Veuillez sélectionner au moins un frein');
      }

      if (frein.includes('vue') && (watch('vues') || []).length === 0) {
        errors.push(
          'Vues obligatoires lorsque "vue" est sélectionné comme frein'
        );
      }

      if (
        frein.includes('typologie') &&
        (watch('typologies') || []).length === 0
      ) {
        errors.push(
          'Typologies obligatoires lorsque "typologie" est sélectionné comme frein'
        );
      }

      if (
        frein.includes('orientation') &&
        (watch('orientations') || []).length === 0
      ) {
        errors.push(
          'Orientations obligatoires lorsque "orientation" est sélectionné comme frein'
        );
      }

      if (frein.includes('etage') && (watch('etages') || []).length === 0) {
        errors.push(
          'Étage obligatoire lorsque "étage" est sélectionné comme frein'
        );
      }

      if (frein.includes('tranche') && (watch('tranches') || []).length === 0) {
        errors.push(
          'Tranche obligatoire lorsque "tranche" est sélectionné comme frein'
        );
      }
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
    setFormSubmitted(true);
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
    // Prepare data - ensure list_bien_transfere_vendu is stringified if it's an array
    const finalData = { ...data };

    // If list_bien_transfere_vendu is an array (not stringified), stringify it
    if (Array.isArray(finalData.list_bien_transfere_vendu)) {
      finalData.list_bien_transfere_vendu = JSON.stringify(
        finalData.list_bien_transfere_vendu
      );
    }

    // Same for list_bien_interesse if needed
    if (Array.isArray(finalData.list_bien_interesse)) {
      finalData.list_bien_interesse = JSON.stringify(
        finalData.list_bien_interesse
      );
    }

    console.log('Final data to send:', finalData);
    //si exist visites Perdu il faut repondre au dialog apres enregristrer sera activer
    if (old_visites_perdu.length > 0) {
      setOpen_D_P(true);
      setLoading_form(true);
    } else {
      //set on show visite le cadre est null pour saffiche par premier cadre
      localStorage.setItem('v_id_cadre', null);
      localStorage.setItem('v_id_org', null);
      setOpen_D_P(false);

      setIsSubmitting(true);
      setBackendErrors({});

      const dataToSend = new FormData();
      let url = APIURL.VISITES;
      let method = 'post';

      Object.entries(data).forEach(([key, value]) => {
        //console.log(`Checking key: ${key}, value:`, value, typeof value);

        // Always include prospect_id regardless of isOrigin
        if (key == 'prospect_id') {
          dataToSend.append(key, value);
          return;
        }
        // Normalize value: trim and lowercase
        if (
          typeof value == 'string' &&
          value.trim().replace(/['"]/g, '').toLowerCase() == 'null'
        ) {
          // console.log(`Converting ${key} from string "null" to actual null`);
          data[key] = null;
        }
        // Exclure certains champs si `isOrigin` est vrai
        if (
          isOrigin &&
          [
            'nom',
            'email',
            'prenom',
            'telephone',
            'telephone_num2',
            'source_id',
            'source_txt',
            'partenaire_id',
            'notifie',
            'ville',
          ].includes(key)
        ) {
          // Ne pas ajouter ces champs à `dataToSend`
          return;
        }

        // Ajouter les autres champs normalement
        dataToSend.append(key, value);
      });

      if (isOrigin) {
        url = `${APIURL.ROOT}/v1/store_n_visite/` + origin;
      }
      console.log('ana ghadya');
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
          let message = "Une erreur s'est produite";
          if (res.status == 200) {
            message = `Visite crée avec succès`;
            toast.success(message);
            router.push(ENDPOINTS.CRM + '?tab=visites');
            localStorage.removeItem('selectedProspect');
            localStorage.removeItem('selectedClient');
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
            console.error(response.data.error_33);
          } else {
            console.error(
              "Une erreur s'est produite lors de la soumission du formulaire."
            );
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const handleChange_event = (text) => (event) => {
    const value = event.target.value;
    setInfo_param(text);
    if (text == 'cin') {
      if (value.length >= 3) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'cin');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } else if (text == 'Téléphone' || text == 'Téléphone2') {
      if (value.length >= 10) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'tel');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } else if (text == "l'email") {
      if (value.length >= 4) {
        const timeout = setTimeout(() => {
          fetch_event_visite(value, 'search_prospect_by_param', text, 'email');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    }
  };

  const orientationOptions = Object.keys(ORIENTATIONS).map((key) => ({
    code: ORIENTATIONS[key].code,
    label: ORIENTATIONS[key].label,
    description: ORIENTATIONS[key].description,
  }));

  const fetch_event_visite = async (v, route, text, param) => {
    try {
      const res = await axios.get(
        `${APIURL.ROOT}/v1/${route}/${param}/${v}/${selectedProjet?.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Réinitialiser certains états
      setInfo_client_1(null);
      setClient_prospect(null);
      setId_appel(null);
      setId_visite(null);
      setOldBiens_pre([]);
      setDisabled(false);
      setDisabled_source(false);

      const { client, prospect } = res.data;

      // Vérifier si le client a des réservations et les ajouter à Dossiers_Suivis
      if (client?.reservations && client.reservations.length > 0) {
        const dossiers = client.reservations.map((reservation) => ({
          id: reservation.id,
          code_reservation: reservation.code_reservation,
          prix: reservation.prix,
          avances_sum_montant: reservation.avances_sum_montant || 0,
        }));

        // Only set if we have new reservations, don't overwrite existing ones
        setDossiers_Suivis((prev) => {
          // Create a map of existing reservations by ID
          const existingMap = new Map(prev.map((d) => [d.id, d]));

          // Merge new reservations, keeping existing ones
          dossiers.forEach((newDossier) => {
            existingMap.set(newDossier.id, newDossier);
          });

          return Array.from(existingMap.values());
        });
      }
      // Si ni prospect ni client n'est présent, on laisse les champs inchangés
      if (prospect || client) {
        setDisabled(true);
        const isClient = client != null;
        const contactData = isClient ? client : prospect;

        // Extraire les champs communs seulement si `contactData` existe

        const prospect_id = client
          ? contactData?.prospect?.id
          : contactData?.id;
        const cin = contactData.cin;
        const nom = contactData.nom;
        const prenom = contactData.prenom;
        const tel = contactData.telephone_num1 || contactData.telephone;
        const tel_2 = contactData.telephone_num2;
        const email = contactData.email;
        const source = client
          ? contactData.prospect.source
          : contactData.source;
        const partenaire = client
          ? contactData.prospect.partenaire
          : contactData.partenaire;
        const notifie = client
          ? contactData.prospect?.notifie
          : contactData.notifie;
        const visite_pre_reserves = prospect?.visite_pre_reserves || [];
        const biens_traitement_freins = res.data.biens_traitement_freins || [];

        // Définir les états et valeurs des champs seulement si `contactData` est défini
        setInfo_client_1(`${nom} ${prenom}`);
        setClient_prospect(isClient ? 'Client' : 'Prospect');
        setValue('prospect_id', prospect_id);
        setValue('cin', cin || '');
        setValue('nom', nom || '');
        setValue('prenom', prenom || '');
        setValue('telephone', tel || '');
        setValue('telephone_num2', tel_2 || null);
        setValue('email', email || '');
        setValue('notifie', notifie || 0);

        // Définir les données de `source`
        if (source) {
          setValue('source_id', source.id || '');
          setValue('source_txt', source.source || '');
          setDisabled_source(true);
        } else {
          setValue('source_txt', '');
          setDisabled_source(false);
        }

        // Définir les données de `partenaire`
        if (partenaire) {
          setValue('partenaire_id', partenaire.id || '');
          setValue('partenaire_txt', partenaire.description);
          setPartenaire_txt(partenaire.description || '');
          setDisabled_source(true);
        } else {
          setValue('partenaire_id', '');
          setPartenaire_txt(null);
          setValue('partenaire_txt', '');
        }

        // Traiter les données de `visite_pre_reserves`
        if (
          visite_pre_reserves.length > 0 ||
          biens_traitement_freins.length > 0
        ) {
          setValue('loading_b_pre', true);
          if (visite_pre_reserves.length > 0) {
            const oldBiens = visite_pre_reserves.map(
              ({ bien, bien_id, id }) => ({
                propriete_dite_bien: bien.propriete_dite_bien,
                bien_id,
                visite_id: id,
                prix: bien.prix,
                prix_unitaire: bien.prix_unitaire,
                superficie_jardin_calculer: bien.superficie_jardin_calculer,
                superficie_habitable: bien.superficie_habitable,
                superficie_balcon_calculer: bien.superficie_balcon_calculer,
                superficie_terrasse_calculer: bien.superficie_terrasse_calculer,
                prix_box: bien.prix_box,
                prix_parking: bien.prix_parking,
                avance_minimale: bien.avance_minimale,
                action: 0,
              })
            );
            setOldBiens_pre(oldBiens);
          }
          if (res.data.biens_traitement_freins.length > 0) {
            for (
              var n = 0;
              n <= Number(res.data.biens_traitement_freins.length) - 1;
              n++
            ) {
              let propriete =
                res.data.biens_traitement_freins[n].bien.propriete_dite_bien;
              let bien_id = res.data.biens_traitement_freins[n].bien_id;
              let t_f_id = res.data.biens_traitement_freins[n].id;
              let avancee =
                res.data.biens_traitement_freins[n].bien.avance_minimale;
              let prixx = res.data.biens_traitement_freins[n].bien.prix;
              let prixx_uni =
                res.data.biens_traitement_freins[n].bien.prix_unitaire;
              let sup_jardin =
                res.data.biens_traitement_freins[n].bien
                  .superficie_jardin_calculer;
              let sup_habit =
                res.data.biens_traitement_freins[n].bien.superficie_habitable;
              let sup_balcon =
                res.data.biens_traitement_freins[n].bien
                  .superficie_balcon_calculer;
              let sup_terrase =
                res.data.biens_traitement_freins[n].bien
                  .superficie_terrasse_calculer;
              let p_box = res.data.biens_traitement_freins[n].bien.prix_box;
              let p_parking =
                res.data.biens_traitement_freins[n].bien.prix_parking;
              setOldBiens_pre((OldBiens_pre) => [
                ...OldBiens_pre,
                {
                  propriete_dite_bien: propriete,
                  prix: prixx,
                  prix_unitaire: prixx_uni,
                  bien_id: bien_id,
                  traitement_frein_id: t_f_id,
                  superficie_jardin_calculer: sup_jardin,
                  superficie_habitable: sup_habit,
                  superficie_balcon_calculer: sup_balcon,
                  superficie_terrasse_calculer: sup_terrase,
                  prix_box: p_box,
                  prix_parking: p_parking,
                  avance_minimale: avancee,
                  action: 0,
                },
              ]);
            }
          }
          setValue('loading_b_pre', false);
        } else {
          setValue('loading_b_pre', false);
        }

        // Gérer les données de dialogue
        if (prospect?.appels) setId_appel(prospect.appels.id);
        if (prospect?.visites_perdu?.length) {
          setValue('last_origin_id_of_prospect', prospect?.visite_first?.id);
          setId_visite(prospect?.visite_first?.id);

          setOld_visites_perdu([]);
          for (var i = 0; i <= Number(prospect.visites_perdu.length) - 1; i++) {
            if (
              prospect.visites_perdu[i].interet == '3' &&
              prospect.visites_perdu[i].etat == 1
            ) {
              if (
                prospect.visites_perdu[i]?.freins?.etat == 1 ||
                prospect.visites_perdu[i]?.freins?.etat == 2 ||
                prospect.visites_perdu[i]?.freins?.etat == 6
              ) {
                let date = format(
                  new Date(prospect.visites_perdu[i].created_at),
                  'dd/MM/yyyy '
                );
                let fr_id = prospect.visites_perdu[i]?.freins.id;
                let v_cadre_id = prospect.visites_perdu[i].related_show_id;
                let origin_id = prospect.visites_perdu[i].origin_id;
                let frein_exp = '';
                if (
                  prospect.visites_perdu[i]?.freins.frein_tranche.length > 0
                ) {
                  frein_exp += 'Tranche ,';
                }
                if (prospect.visites_perdu[i]?.freins.frein_etage.length > 0) {
                  frein_exp += 'Etage ,';
                }

                if (
                  prospect.visites_perdu[i]?.freins.frein_orientation.length > 0
                ) {
                  frein_exp += 'Orientation ,';
                }
                if (
                  prospect.visites_perdu[i]?.freins.frein_typologie.length > 0
                ) {
                  frein_exp += 'Typologie ,';
                }
                if (prospect.visites_perdu[i]?.freins.frein_vue.length > 0) {
                  frein_exp += 'Vue ,';
                }
                if (
                  (prospect.visites_perdu[i]?.freins.prix_min != null &&
                    prospect.visites_perdu[i]?.freins.prix_min != 0) ||
                  (prospect.visites_perdu[i]?.freins.prix_max != null &&
                    prospect.visites_perdu[i]?.freins.prix_max != 0)
                ) {
                  frein_exp += 'Prix ,';
                }
                if (
                  (prospect.visites_perdu[i]?.freins.superficie_min != null &&
                    prospect.visites_perdu[i]?.freins.superficie_min != 0) ||
                  (prospect.visites_perdu[i]?.freins.superficie_max != null &&
                    prospect.visites_perdu[i]?.freins.superficie_max != 0)
                ) {
                  frein_exp += 'Superficie ,';
                }
                if (prospect.visites_perdu[i]?.freins.avance != null) {
                  frein_exp += 'Avance ,';
                }
                if (
                  prospect.visites_perdu[i]?.freins.description_autre != null
                ) {
                  frein_exp += 'Frein Autre,';
                }
                setOld_visites_perdu((v) => [
                  ...v,
                  {
                    origin_id: origin_id,
                    v_cadre_id: v_cadre_id,
                    date: date,
                    fr_id: fr_id,
                    frein: frein_exp,
                    action: 0,
                  },
                ]);
              }
            }
          }
        }

        setOpen_Dialog(true);
      } else {
        // Pas de client ni de prospect trouvé, garder les champs inchangés
        setValue('loading_b_pre', false);
        setOpen_Dialog(false);
        //si on store_n_visite tjr garder meme prospect_id  else ''
        setValue('prospect_id', isOrigin ? watch('prospect_id') : '');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la visite:', error);
      setDisabled(false);
      setDisabled_source(false);
    }
  };
  //selectedProjet?.id
  const fetch_bien_ByProjet = async () => {
    if (Number(watch('interet')) == 1) {
      setLoading_bien(true);
      await axios

        .get(
          `${APIURL.ROOT}/v1/getBiensByProjet_Concat/` + selectedProjet?.id ||
            1,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((res) => {
          setLoading_bien(false);

          // setBiensByProjet(res.data.biens)
          setBiensByProjet(
            res.data.biens.map((bien) => ({
              id: bien.id,
              propriete_dite_bien: bien.propriete_dite_bien,
              etat: bien.etat,
              is_proposed: bien.is_proposed,
              disabled: false,
            }))
          );

          //setBiensByProjet(res.data.biens)
        })
        .catch(() => {
          setLoading_bien(false);
        });
    }
  };

  const handleChange_NbrBien = (e) => {
    const nbBiens = Number(e.target.value);
    setValue('nb_bien_added', nbBiens);

    if (biensByProjet) {
      for (var j = 0; j <= Number(biensByProjet.length) - 1; j++) {
        biensByProjet[j].disabled = false;
      }
    }

    setinput_biens([]);
    for (var i = 0; i <= Number(e.target.value) - 1; i++) {
      setinput_biens((input_biens) => [
        ...input_biens,
        {
          bien_id: null,
          old_bien_id: '',
          propriete_dite_bien: '',
          statut: '',
          rdv: '',
          date_relance: '',
          mode_relance: '',
          commentaire: '',
          prix: '',
          prix_final: '',
          superficie_balcon_calculer: '',
          superficie_terrasse_calculer: '',
          superficie_jardin_calculer: '',
          superficie_habitable: '',
          prix_box: '',
          prix_parking: '',
          prix_unitaire: '',
          avance_minimale: '',

          /*Reservation*/
          code_reservation: '',
          mode_financement: '',
          date_reservation: date_reservation[0],
          commentaire_res: '',
          avance_res: '',
          reste: '',
          sr: false,
          banque_id: '',
          numero_paiement: '',
          echeance: '',
          check_montant: '',
          selectedFiles_rsv: [],

          //fichier_avance:fich!=null?fich:0,
          mode_paiement: '',
          commentaireAvance: '',
          date_reglement: date_reglement,
          prix_remise: 0,
          prix_forfetaire: 0,
          docs_resv: '',
          num_remise: '',
          date_encaissement: null,
          check_save: true,
          selectedFiles_avc: [],
        },
      ]);
    }
    const initialExpandedPanels = Array.from(
      { length: nbBiens },
      (_, i) => `panel_bien${i + 1}`
    );
    setExpanded(initialExpandedPanels);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    console.log('Clicked panel:', panel);
    console.log('Before update:', expanded);
    setExpanded((prevExpanded) =>
      prevExpanded.includes(panel)
        ? prevExpanded.filter((p) => p !== panel)
        : [...prevExpanded, panel]
    );
    console.log('After update:', expanded);
  };

  const handlechangeprix_remise = (value, index, name) => {
    const list = [...(name ? input_biens_vendu : input_biens)];

    const item = list[index];

    const superficieTotale =
      parseFloat(item['superficie_jardin_calculer'] || 0) +
      parseFloat(item['superficie_habitable'] || 0) +
      parseFloat(item['superficie_balcon_calculer'] || 0) +
      parseFloat(item['superficie_terrasse_calculer'] || 0);

    const prixBox = parseFloat(item['prix_box'] || 0);
    const prixParking = parseFloat(item['prix_parking'] || 0);
    const prixUnitaire = parseFloat(item['prix_unitaire'] || 0);
    const remiseValue = parseFloat(value || 0);

    const prixM2 = value ? remiseValue : prixUnitaire;

    const total = prixM2 * superficieTotale + prixBox + prixParking;

    setCheck_total(0); // Reset before any logic

    if (remiseValue !== 0) {
      const prixForfetaire = parseFloat(item['prix_forfetaire'] || 0);
      item['prix_final'] = prixForfetaire ? total - prixForfetaire : total;
    }

    setCheck_total(check_total + 1);

    name != null ? setinput_biens_vendu(list) : setinput_biens(list);
  };

  const handlechangeprix_forfetaire = (value, index, name) => {
    const list = [...(name ? input_biens_vendu : input_biens)];

    const item = list[index];

    const superficieTotale =
      parseFloat(item['superficie_jardin_calculer'] || 0) +
      parseFloat(item['superficie_habitable'] || 0) +
      parseFloat(item['superficie_balcon_calculer'] || 0) +
      parseFloat(item['superficie_terrasse_calculer'] || 0);

    const prixBox = parseFloat(item['prix_box'] || 0);
    const prixParking = parseFloat(item['prix_parking'] || 0);
    const prixRemise = parseFloat(item['prix_remise'] || 0);
    const prixUnitaire = parseFloat(item['prix_unitaire'] || 0);
    const prixForfetaire = parseFloat(value || 0);

    const totalRemise = prixRemise * superficieTotale + prixBox + prixParking;
    const totalUnitaire =
      prixUnitaire * superficieTotale + prixBox + prixParking;

    setCheck_total(0); // Reset

    let finalPrice = 0;

    if (!value) {
      finalPrice = prixRemise ? totalRemise : totalUnitaire;
    } else {
      finalPrice = prixRemise
        ? totalRemise - prixForfetaire
        : totalUnitaire - prixForfetaire;
    }

    item['prix_final'] = parseFloat(finalPrice);

    setCheck_total(check_total + 1);
    name != null ? setinput_biens_vendu(list) : setinput_biens(list);
  };

  const show_bien = async (v, index) => {
    await axios
      .get(`${APIURL.ROOTV1}/biens/${v}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        const list = [...input_biens];
        if (res.data.bien.length != 0) {
          list[index]['old_bien_id'] = v;
          list[index]['propriete_dite_bien'] =
            res.data.bien.propriete_dite_bien;
          list[index]['prix'] = res.data.bien.prix;
          list[index]['prix_final'] = res.data.bien.prix;
          list[index]['superficie_balcon_calculer'] =
            res.data.bien.superficie_balcon_calculer;
          list[index]['superficie_jardin_calculer'] =
            res.data.bien.superficie_jardin_calculer;
          list[index]['superficie_terrasse_calculer'] =
            res.data.bien.superficie_terrasse_calculer;
          list[index]['superficie_habitable'] =
            res.data.bien.superficie_habitable;
          list[index]['prix_box'] = res.data.bien.prix_box;
          list[index]['prix_parking'] = res.data.bien.prix_parking;
          list[index]['prix_unitaire'] = res.data.bien.prix_unitaire;
          list[index]['avance_minimale'] = res.data.bien.avance_minimale;
        }
      })
      .catch(() => {});
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

  const handleinputchange_bien_vendu = (e, index) => {
    const { name, value } = e.target;
    const list = [...input_biens_vendu];
    list[index][name] = value;
    if (name == 'sr') {
      list[index]['sr'] = e.target.checked;
    }
    if (name == 'check_montant') {
      list[index]['check_montant'] = e.target.checked;
    }
    if (name == 'avance_res') {
      list[index]['reste'] = list[index]['prix_final'] - e.target.value;
      // Si montant = 0, définir automatiquement mode paiement sur "1"
      if (value === 0 || value === '0') {
        list[index]['mode_paiement'] = '1';
        list[index]['banque_id'] = '';
        list[index]['numero_paiement'] = '';
        list[index]['echeance'] = '';
      }
    }
    setinput_biens_vendu(list);
    setValue('list_bien_transfere_vendu', JSON.stringify(list));
    console.log('Updated list_bien_transfere_vendu:', list);

    if (
      list[index]['statut'] == 2 &&
      (list[index]['code_reservation'] == '' ||
        list[index]['bien_id'] == '' ||
        list[index]['prix'] == '' ||
        list[index]['date_reservation'] == '' ||
        Number(list[index]['avance_res']) < 0 || // Ensure it's treated as a number
        list[index]['mode_financement'] == '' ||
        list[index]['mode_paiement'] == '' ||
        (list[index]['check_montant'] == true &&
          list[index]['commentaireAvance'].length == 0) ||
        (Number(list[index]['avance_res']) == 0 &&
          list[index]['check_montant'] == false))
    ) {
      list[index]['check_save'] = false;
    } else {
      list[index]['check_save'] = true;
    }
    setCheck_save(true); //check save principal
    if (name == 'prix_remise') {
      handlechangeprix_remise(value, index, 'bien_transfere_vendu');
    }
    if (name == 'prix_forfetaire') {
      handlechangeprix_forfetaire(value, index, 'bien_transfere_vendu');
    }
    input_biens_vendu.forEach((input) => {
      //check if one of inputs check_save == false  btn enregistrer=disabled
      if (input.check_save == false) {
        console.log(input); // ✅ log the whole input object
        setCheck_save(false);
      }
    });

    //added

    if (name == 'code_reservation') {
      if (value.length >= 3) {
        setInfo_reservation(null);
        setTimeout(() => {
          fetch_code_reservation(value, index);
        }, 2000);
      }
    }
  };

  const handle_action_change = (e, index, param) => {
    const { name, value } = e.target;
    const list = [...OldBiens_pre];
    list[index][name] = value;
    if (param == 'action') {
      list[index]['action'] = value;
    }
    setOldBiens_pre(list);

    const allActionsFilled = OldBiens_pre.every(
      (input) => input.action && input.action.trim() !== ''
    );
    setCheck_save_1(!allActionsFilled);

    //  console.log('les action du bien est  =>' + JSON.stringify(OldBiens_pre));
  };

  /*************************Circuit si les derniers visites dont perdu==> afficher les action pour Garder ou Annuler Frein  */
  const set_all_action_perdu_null = () => {
    setReset_perdu(0);
    for (var j = 0; j <= Number(old_visites_perdu.length) - 1; j++) {
      old_visites_perdu[j].action = 0;
    }
    setReset_perdu(reset_perdu + 1);
    setCheck_save_perdu(true);
    console.log(
      'les action du perdu est  =>' + JSON.stringify(old_visites_perdu)
    );
  };

  const show_visite = (origin_id, v_id) => {
    localStorage.setItem('v_id_cadre', v_id);
    localStorage.setItem('v_id_org', origin_id);
    window.open(`/crm/visites/${origin_id}`, '_blank');
  };

  const handle_action_change_perdu = (e, index, param) => {
    const { name, value } = e.target;
    const list = [...old_visites_perdu];
    list[index][name] = value;
    if (param == 'action') {
      list[index]['action'] = value;
    }
    setOld_visites_perdu(list);

    const allActionsFilled = old_visites_perdu.every(
      (input) => input.action && input.action.trim() !== ''
    );
    setCheck_save_perdu(!allActionsFilled);

    /*console.log(
      'les action du Perdu est  =>' + JSON.stringify(old_visites_perdu)
    );*/
  };

  const requestData_action_perdu = {
    list_freins: old_visites_perdu,
  };

  const handleSubmit_action_perdu = (ev) => {
    ev.preventDefault();

    setLoading_button_save_perdu(true);
    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/desactiver_freins/0`,
      data: requestData_action_perdu,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setOpen_D_P(false);
        setLoading_button_save_perdu(false);
        toast.success('Données enregistrées avec succès');
        setOld_visites_perdu([]);

        //active Enregistrer du form
        setLoading_form(false);
      })
      .catch(() => {
        console.log('errror');
      });
  };

  const requestData_action = {
    list_biens_visite: OldBiens_pre,
  };
  const handleSubmit_action = (ev) => {
    ev.preventDefault();
    setLoading_button_save_1(true);

    const updatedBiensVendu = [];

    for (var i = 0; i <= Number(OldBiens_pre.length) - 1; i++) {
      if (OldBiens_pre[i].action == '3' || OldBiens_pre[i].action == 3) {
        console.log('Adding bien to vendu list');
        const bienData = {
          visite_id: OldBiens_pre[i].visite_id || null, // ← AJOUTER CE CHAMP
          traitement_frein_id: OldBiens_pre[i].traitement_frein_id || null,
          bien_id: OldBiens_pre[i].bien_id,
          old_bien_id: '',
          propriete_dite_bien: OldBiens_pre[i].propriete_dite_bien,
          statut: 2,
          rdv: '',
          date_relance: '',
          mode_relance: '',
          commentaire: '',
          prix: OldBiens_pre[i].prix,
          prix_final: OldBiens_pre[i].prix,
          superficie_balcon_calculer:
            OldBiens_pre[i].superficie_balcon_calculer,
          superficie_terrasse_calculer:
            OldBiens_pre[i].superficie_terrasse_calculer,
          superficie_jardin_calculer:
            OldBiens_pre[i].superficie_jardin_calculer,
          superficie_habitable: OldBiens_pre[i].superficie_habitable,
          prix_box: OldBiens_pre[i].prix_box,
          prix_parking: OldBiens_pre[i].prix_parking,
          prix_unitaire: OldBiens_pre[i].prix_unitaire,
          avance_minimale: OldBiens_pre[i].avance_minimale,

          /*Reservation*/
          code_reservation: '',
          mode_financement: '',
          date_reservation: date_reservation[0],
          commentaire_res: '',
          avance_res: '',
          reste: OldBiens_pre[i].prix,
          sr: false,
          banque_id: '',
          numero_paiement: '',
          echeance: '',
          check_montant: '',
          selectedFiles_rsv: [],

          mode_paiement: '',
          commentaireAvance: '',
          date_reglement: date_reglement,
          prix_remise: 0,
          prix_forfetaire: 0,
          docs_resv: '',
          num_remise: '',
          date_encaissement: null,
          check_save: true,
          selectedFiles_avc: [],
        };
        updatedBiensVendu.push(bienData);
      }
    }

    // Update state and form value
    setinput_biens_vendu(updatedBiensVendu);
    // CRITICAL: Stringify the array like list_bien_interesse
    setValue('list_bien_transfere_vendu', JSON.stringify(updatedBiensVendu));

    console.log('Updated biens vendu:', updatedBiensVendu);
    console.log('Form value after update:', watch('list_bien_transfere_vendu'));

    // Expand panels for the new biens vendu
    const initialExpandedPanels = Array.from(
      { length: updatedBiensVendu.length },
      (_, i) => `panel_bienn${i + 1}`
    );
    setExpanded(initialExpandedPanels);

    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/update_visite_bien_pre_reserve/0`,
      data: requestData_action,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setLoading_button_save_1(false);
        toast.success('Données enregistrées avec succès');
        setOldBiens_pre([]);
        setValue('loading_b_pre', false);
        setpaper_exist(1);
      })
      .catch((error) => {
        console.log('Error:', error);
        setLoading_button_save_1(false);
      });
  };
  //added
  const set_all_action_null = () => {
    setReset1(0);
    for (var j = 0; j <= Number(OldBiens_pre.length) - 1; j++) {
      OldBiens_pre[j].action = '';
    }
    setReset1(reset1 + 1);
    setCheck_save_1(true);
    console.log('les action du bien est  =>' + JSON.stringify(OldBiens_pre));
  };

  const handleinputchange = (e, index) => {
    const { name, value } = e.target;
    const list = [...input_biens];
    list[index][name] = value;

    // Handle bien_id changes
    if (name == 'bien_id') {
      show_bien(value, index);
      storebien_en_proposition(value, index);
      pusher_function();
    }

    // Handle avance_res and other fields
    if (name == 'avance_res') {
      list[index]['reste'] = list[index]['prix_final'] - e.target.value;
      // Si montant = 0, définir automatiquement mode paiement sur "1"
      if (value === 0 || value === '0') {
        list[index]['mode_paiement'] = '1';
        list[index]['banque_id'] = '';
        list[index]['numero_paiement'] = '';
        list[index]['echeance'] = '';
      }
    }
    if (name == 'sr') {
      list[index]['sr'] = e.target.checked;
    }
    if (name == 'check_montant') {
      list[index]['check_montant'] = e.target.checked;
    }

    // Update input_biens state
    setinput_biens(list);

    // Set the form value for list_bien_interesse
    setValue('list_bien_interesse', JSON.stringify(list));

    // Additional checks and updates
    if (
      list[index]['statut'] == 2 &&
      (list[index]['code_reservation'] == '' ||
        list[index]['bien_id'] == '' ||
        list[index]['prix'] == '' ||
        list[index]['date_reservation'] == '' ||
        Number(list[index]['avance_res']) < 0 || // Ensure it's treated as a number
        list[index]['mode_financement'] == '' ||
        list[index]['mode_paiement'] == '' ||
        (list[index]['check_montant'] == true &&
          list[index]['commentaireAvance'].length == 0) ||
        (Number(list[index]['avance_res']) == 0 &&
          list[index]['check_montant'] == false))
    ) {
      console.log('hop', list[index]);

      list[index]['check_save'] = false;
    } else {
      list[index]['check_save'] = true;
    }

    setCheck_save(true);

    input_biens.forEach((input) => {
      if (name == 'bien_id') {
        for (let j = 0; j <= Number(biensByProjet.length) - 1; j++) {
          if (biensByProjet[j].id == JSON.stringify(input.bien_id)) {
            biensByProjet[j].disabled = true;
          }
          if (list[index]['old_bien_id'] !== '') {
            if (biensByProjet[j].id == list[index]['old_bien_id']) {
              biensByProjet[j].disabled = false;
            }
          }
        }
      }

      //vente
      if (
        input.check_save == false ||
        input.bien_id == '' ||
        input.statut == ''
      ) {
        setCheck_save(false);
      }

      if (name == 'code_reservation') {
        if (value.length >= 3) {
          setInfo_reservation(null);
          setTimeout(() => {
            fetch_code_reservation(value, index);
          }, 2000);
        }
      }
    });

    if (name == 'prix_remise') {
      handlechangeprix_remise(value, index, null);
    }
    if (name == 'prix_forfetaire') {
      handlechangeprix_forfetaire(value, index, null);
    }

    console.log('les biens =>' + JSON.stringify(input_biens));
    setValue('list_bien_interesse', JSON.stringify(input_biens));
  };

  const storebien_en_proposition = async (id, index) => {
    const list = [...input_biens];
    var old_id = list[index]['old_bien_id'];
    if (old_id == null || old_id == '') {
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
        if (response && response.status == 422) {
          console.error(response.data.error);
        }
      });
  };

  // Update handleSourceChange to work with SelectInput
  const handleSourceChange = (optionValue) => {
    const selectedOption = sources.find(
      (source) => source.id.toString() == optionValue
    );
    setValue('partenaire_id', ''); // Reset partenaire ID when source changes
    setValue('source_txt', selectedOption ? selectedOption.source : ''); // Set source text
    setValue('source_id', optionValue || ''); // Set source ID

    // Only clear partenaire_txt if the new source is not "Partenaire"
    if (selectedOption && selectedOption.source !== 'Partenaire') {
      setPartenaire_txt(null);
    }
  };

  // Update handlePartenaireChange to work with SelectInput
  const handlePartenaireChange = (optionValue) => {
    const selectedOption = partenaires.find(
      (partenaire) => partenaire.id.toString() == optionValue
    );
    setValue('partenaire_id', optionValue || ''); // Set partenaire ID

    // Set the partenaire text for display
    setPartenaire_txt(selectedOption ? selectedOption.description : '');
    setValue(
      'partenaire_txt',
      selectedOption ? selectedOption.description : ''
    );
  };

  // In VisiteForm component
  const handleChange_freins = (selectedValues) => {
    try {
      setValue('frein', selectedValues); // This should be an array of strings
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
  };

  // Replace the complex conditions with clearer logic
  const showMainForm =
    !isOrigin ||
    (isOrigin && OldBiens_pre.length == 0) ||
    (isOrigin && OldBiens_pre.length > 0 && paper_exist == 1);

  const showPreReservedSection =
    OldBiens_pre.length > 0 &&
    (isOrigin || !isOrigin) &&
    !watch('loading_b_pre');
  return (
    <div>
      <Modal isVisible={open_D_P} onClose={() => handleCloseD_P()} maxWidth = 'max-w-2xl'>
        <Modal_OldVisites_Perdu
          open={open_D_P}
          onClose={handleCloseD_P}
          oldVisites={old_visites_perdu}
          handleSubmit={handleSubmit_action_perdu}
          handleChange={handle_action_change_perdu}
          showVisite={show_visite}
          loading={loading_button_save_perdu}
          checkDisabled={check_save_perdu}
          resetActions={set_all_action_perdu_null}
        />
      </Modal>
      {open_dialog == true && (
        <>
          <Modal_Propsepct_Exist
            info_param={info_param}
            info_client_1={info_client_1}
            id_appel={id_appel}
            id_visite={id_visite}
            client_prospect={client_prospect}
            onClose={() => setOpen_Dialog(false)}
          />
        </>
      )}{' '}
      <div className="">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.CRM + '?tab=visites'}
            step={`Ajouter Visite`}
          />
        </div>
      </div>
      {/* Show loading spinner when loading_b_pre is true in store_n_visite mode */}
      {watch('loading_b_pre') && isOrigin ? (
        <div className="flex justify-center items-center min-h-[89vh]">
          <LoadingSpin />
        </div>
      ) : (
        <div>
          {showMainForm && (
            <div className="p-6 mt-4 min-h-[89vh] bg-white shadow-md rounded-md">
              {/* Warning message for pre-reserved biens */}
              {OldBiens_pre.length > 0 && paper_exist == 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="text-yellow-800 font-semibold mb-1">
                        Action requise
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Vous devez traiter les {OldBiens_pre.length} bien(s)
                        pré-réservé(s) ci-dessous avant de pouvoir enregistrer
                        la nouvelle visite.
                      </p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Veuillez choisir une action (Garder/Annuler/Vendre) pour
                        chaque bien pré-réservé.
                      </p>
                    </div>
                  </div>
                </div>
              )}{' '}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  {/* Client/Prospect Information */}
                  {!isOrigin && (
                    <>
                      <div>
                        <h2 className="text-xl font-medium border-b pb-2">
                          Informations du prospect
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                          source_d={watch('source_id')}
                          disabled_var_source={disabled_var_source}
                          partenaire_txt={partenaire_txt}
                          handleChange_event={handleChange_event}
                        />
                      </div>
                    </>
                  )}

                  {isOrigin && display_cin && display_cin_1 && (
                    <>
                      <div>
                        <h2 className="text-xl font-medium border-b pb-2">
                          Informations du prospect
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        <TextField
                          label="Cin:"
                          name="cin"
                          control={control}
                          errors={errors}
                          backendErrors={backendErrors}
                          defaultValues={defaultValues}
                          onChange={handleChange_event('cin')}
                          required={Number(watch('interet')) == 1}
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-3 mt-4">
                    <h2 className="text-xl font-medium  border-b pb-2 mb-4">
                      Informations de la visite <p>{'prospec++>'+watch('prospect_id')}</p>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {input_biens_vendu.length == 0 && (
                      <>
                        {watch('loading_b_pre') == false && (
                          <>
                            <div className="">
                              <SelectInput
                                placeholder="selectionner un intérêt"
                                label="Intérêt :"
                                name="interet"
                                value={watch('interet')}
                                required={true}
                                options={
                                  input_biens_vendu.length > 0
                                    ? [{ value: '1', label: 'Intéressé' }] // Only interested option
                                    : Dossiers_Suivis.length > 0
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
                                          (interet) =>
                                            interet.code !== 4 &&
                                            interet.code !== 5
                                        ) // Exclure "Injoignable" ET "Suivi Dossier"
                                        .map((interet) => ({
                                          value: interet.code.toString(),
                                          label: interet.label,
                                        }))
                                }
                                disabled={
                                  isOrigin ? false : watch('telephone') == ''
                                }
                                onChange={handleChange_interet}
                                error={
                                  errors?.interet?.message ||
                                  backendErrors?.interet
                                }
                              />
                            </div>
                            {Number(watch('interet')) == 1 && (
                              <>
                                <TextField
                                  label="Nombre de Biens à ajouter:"
                                  name="nb_bien_added"
                                  type="number"
                                  control={control}
                                  errors={{
                                    ...errors,
                                    nb_bien_added:
                                      formSubmitted &&
                                      Number(watch('interet')) == 1 &&
                                      !watch('nb_bien_added') &&
                                      watch('nb_bien_added') !== 0
                                        ? 'Ce champ est obligatoire lorsque interet est Intéressé.'
                                        : Number(watch('nb_bien_added')) < 0
                                        ? 'Veuillez entrer un nombre positif.'
                                        : null,
                                  }}
                                  backendErrors={backendErrors}
                                  defaultValues={{ nb_bien_added: 0 }}
                                  required={Number(watch('interet')) == 1}
                                  inputProps={{
                                    min: 0,
                                    inputMode: 'numeric',
                                  }}
                                  onChange={(e) => {
                                    let value = e.target.value;

                                    // Remove leading 0 when user starts typing
                                    if (
                                      value.length > 1 &&
                                      value.startsWith('0')
                                    ) {
                                      value = value.replace(/^0+/, '');
                                    }

                                    // Only allow digits (optional extra check)
                                    if (/^\d*$/.test(value)) {
                                      e.target.value = value;
                                      handleChange_NbrBien(e);
                                    }
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {Number(watch('interet')) == 2 && (
                      <>
                        <div className="">
                          <SelectInput
                            placeholder="selectionner un mode de relance"
                            label="Mode Relance:"
                            name="mode_relance"
                            required={false}
                            options={Object.values(VISITE_TYPE_NOTIF).map(
                              (notif) => ({
                                value: notif.code.toString(),
                                label: notif.label,
                              })
                            )}
                            value={watch('mode_relance')?.toString()}
                            onChange={handleChange_tp_notif}
                          />
                        </div>
                        <div>
                          <TextField
                            label="Date Relance:"
                            name="date_relance"
                            type="date"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                          />
                        </div>
                      </>
                    )}
                    {Number(watch('interet')) == 3 && (
                      <FreinsComponent
                        watch={watch}
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        formSubmitted={formSubmitted}
                        type_freins={type_freins}
                        list_tranches={list_tranches}
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
                        isEditMode={false} // Specify the mode here
                      />
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
                            Dossiers_Suivis.length > 0
                              ? Dossiers_Suivis.map((dossier) => {
                                  const prixTotal =
                                    parseFloat(dossier.prix) || 0;
                                  const avances =
                                    parseFloat(dossier.avances_sum_montant) ||
                                    0;
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
                                        montant_suivi:
                                          'Le montant doit être positif',
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
                                    if (
                                      montant > 0 &&
                                      watch('dossier_id_suivi')
                                    ) {
                                      const dossierSelectionne =
                                        Dossiers_Suivis.find(
                                          (dossier) =>
                                            dossier.id ==
                                            watch('dossier_id_suivi')
                                        );

                                      if (dossierSelectionne) {
                                        const prixTotal =
                                          parseFloat(dossierSelectionne.prix) ||
                                          0;
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
                                      validationErrors.date_paiement_suivi ||
                                      null,
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
                                          if (
                                            validationErrors.banque_id_suivi
                                          ) {
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
                                          placeholder:
                                            'Numéro de chèque/virement',
                                        }}
                                        onChange={(e) => {
                                          // Nettoyer l'erreur quand l'utilisateur corrige
                                          if (
                                            validationErrors.num_paiement_suivi
                                          ) {
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
                                            {
                                              validationErrors.num_paiement_suivi
                                            }
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
                                              watch('mode_paiement_suivi') !==
                                              '1'
                                            }
                                            onChange={(e) => {
                                              // Nettoyer l'erreur quand l'utilisateur corrige
                                              if (
                                                validationErrors.echeance_suivi
                                              ) {
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
                                                {
                                                  validationErrors.echeance_suivi
                                                }
                                              </p>
                                            )}
                                        </div>
                                      )}
                                  </>
                                )}
                              {user.role <= 2 && watch('montant_suivi') > 0 && (
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
                                      label="N° Remise :"
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
                  {/*<PanelInteresse_vendu
                  input_biens_vendu={input_biens_vendu}
                  //handleAccordionChange={handleAccordionChangeVendu}
                  //expanded={expandedVendu}
                  handleChange={handleChange}
                  handleinputchange_bien_vendu={handleinputchange_bien_vendu}
                  info_reservation={info_reservation}
                  MODE_FINANCE={MODE_FINANCE}
                  MODE_PAIEMENT={MODE_PAIEMENT}
                  check_total={check_total}
                  user={user}
                  banques={banques}
                />*/}
                  {/*Pannel Interesse Vendu**/}
                  {input_biens_vendu.map((x, j) => {
                    return (
                      <div key={`panel_bienn${j + 1}`}>
                        {/* Top Divider */}

                        {/* Accordion */}
                        <div className="border mt-4 rounded-md  shadow">
                          <button
                            type="button"
                            className="w-full flex justify-between items-center px-4 py-3  text-white text-base font-medium focus:outline-none"
                            style={{
                              background:
                                'rgb(35 22 81 / var(--tw-text-opacity, 1))',
                            }}
                            onClick={handleAccordionChange(
                              `panel_bienn${j + 1}`
                            )}
                          >
                            <span>{`Bien  ${j + 1}`}</span>
                            <span className="text-xl">
                              {expanded.includes(`panel_bienn${j + 1}`)
                                ? '−'
                                : '+'}
                            </span>
                          </button>

                          {/* Accordion Content */}
                          {expanded.includes(`panel_bienn${j + 1}`) && (
                            <>
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {/* Bien Autocomplete */}
                                  <div>
                                    {/* Replace with your own Autocomplete or HeadlessUI */}
                                    {x.bien_id != null && (
                                      <InputField_Biens
                                        label="Bien"
                                        name=""
                                        type="text"
                                        value={x.propriete_dite_bien}
                                        disabled
                                      />
                                    )}
                                  </div>

                                  {/* Statut */}
                                  <div>
                                    <InputField_Biens
                                      label="Statut"
                                      name=""
                                      type="text"
                                      value={'Vendu'}
                                      disabled
                                    />
                                  </div>

                                  {/* Commentaire */}
                                  <div className="md:col-span-3">
                                    <InputField_Biens
                                      label="Commentaire"
                                      name="commentaire"
                                      multi
                                      value={x.commentaire}
                                      onChange={(e) =>
                                        handleinputchange_bien_vendu(e, j)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Réservation */}
                              {x.statut == 2 && x.bien_id != null && (
                                <div className="border rounded-lg  mt-4 mx-5">
                                  {/* Accordion Header */}
                                  <div
                                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                                    style={{ background: '#2f8a8bab' }}
                                    onClick={() =>
                                      handleChange(`panel_ress${j + 1}`)
                                    }
                                  >
                                    <h3 className="text-white font-semibold">
                                      Réservation du Bien {j + 1}
                                    </h3>
                                    <span className="text-white">
                                      {expanded.includes(`panel_ress${j + 1}`)
                                        ? '⌃'
                                        : '⌄'}
                                    </span>
                                  </div>

                                  {/* Accordion Content */}
                                  {expanded.includes(`panel_ress${j + 1}`) && (
                                    <div className="p-4 space-y-4 bg-white">
                                      {info_reservation && (
                                        <div
                                          className="bg-red-100 border-l-4 border-red-500 p-4 text-center rounded"
                                          style={{ color: 'red!important' }}
                                        >
                                          {info_reservation}
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputField_Biens
                                          label="Code Réservation:"
                                          name="code_reservation"
                                          type="text"
                                          placeholder="Code Réservation"
                                          value={x.code_reservation}
                                          onChange={(e) =>
                                            handleinputchange_bien_vendu(e, j)
                                          }
                                          required
                                        />

                                        <InputField_Biens
                                          label="Bien:"
                                          name=""
                                          type="text"
                                          value={x.propriete_dite_bien}
                                          disabled
                                        />

                                        <InputField_Biens
                                          label="Prix:"
                                          name=""
                                          type="number"
                                          value={x.prix}
                                          disabled
                                        />

                                        <InputField_Biens
                                          label="Date Réservation:"
                                          name="date_reservation"
                                          type="date"
                                          value={x.date_reservation}
                                          onChange={(e) =>
                                            handleinputchange_bien_vendu(e, j)
                                          }
                                          required
                                        />
                                        <InputField_Biens
                                          label="Commentaire:"
                                          name="commentaire_res"
                                          multi
                                          value={x.commentaire_res}
                                          onChange={(e) =>
                                            handleinputchange_bien_vendu(e, j)
                                          }
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Paiement */}
                              {x.statut == 2 && x.bien_id != null && (
                                <div className="border rounded-lg  mt-4 mx-5 mb-5">
                                  {/* Accordion Header */}
                                  <div
                                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                                    style={{ background: '#2f8a8bab' }}
                                    onClick={() =>
                                      handleChange(`panel_paii${j + 1}`)
                                    }
                                  >
                                    <h3 className="text-white font-semibold">
                                      Paiement du Bien {j + 1}
                                    </h3>
                                    <span className="text-white">
                                      {expanded.includes(`panel_paii${j + 1}`)
                                        ? '⌃'
                                        : '⌄'}
                                    </span>
                                  </div>

                                  {/* Accordion Content */}
                                  {expanded.includes(`panel_paii${j + 1}`) && (
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white transition-all duration-300">
                                      <div>
                                        <label
                                          className="flex items-center space-x-2"
                                          style={{ marginTop: '30px' }}
                                        >
                                          <span
                                            className={`text-sm font-medium ${
                                              x.sr == true
                                                ? 'text-purple-600'
                                                : ''
                                            }`}
                                          >
                                            SR:
                                          </span>
                                          <input
                                            type="checkbox"
                                            name="sr"
                                            value={x.sr}
                                            checked={x.sr}
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                            className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                          />
                                        </label>
                                      </div>
                                      <InputField_Biens
                                        label="Prix :"
                                        name="prix"
                                        type="number"
                                        value={x.prix}
                                        disabled
                                      />
                                      <InputField_Biens
                                        label="Prix Unitaire:"
                                        name="prix_unitaire"
                                        type="number"
                                        value={x.prix_unitaire}
                                        disabled
                                      />
                                      <InputField_Biens
                                        label="Prix Unitaire Remisé:"
                                        name="prix_remise"
                                        type="number"
                                        value={x.prix_remise}
                                        onChange={(e) =>
                                          handleinputchange_bien_vendu(e, j)
                                        }
                                      />
                                      <InputField_Biens
                                        label="Remise Forfaitaire:"
                                        name="prix_forfetaire"
                                        type="number"
                                        value={x.prix_forfetaire}
                                        onChange={(e) =>
                                          handleinputchange_bien_vendu(e, j)
                                        }
                                      />
                                      <InputField_Biens
                                        label="Prix Final:"
                                        name="prix_final"
                                        type="number"
                                        value={check_total >= 0 && x.prix_final}
                                        disabled
                                      />
                                      <InputField_Biens
                                        label="Reste Avance:"
                                        name="avance_minimale"
                                        type="number"
                                        value={x.avance_minimale}
                                        disabled
                                      />
                                      <InputField_Biens
                                        label="Reste:"
                                        name="reste"
                                        type="number"
                                        value={x.reste}
                                        disabled
                                      />
                                      <InputField_Biens
                                        label="Montant:"
                                        name="avance_res"
                                        type="number"
                                        required
                                        value={x.avance_res}
                                        error={
                                          x.avance_res != '' &&
                                          x.avance_res == 0 &&
                                          user?.role > 2
                                            ? 'Le montant ne peut pas être 0 pour votre rôle'
                                            : x.avance_res > 0 &&
                                              x.avance_res < x.avance_minimale
                                            ? `Le montant doit être au moins ${x.avance_minimale}`
                                            : null
                                        }
                                        onChange={(e) =>
                                          handleinputchange_bien_vendu(e, j)
                                        }
                                      />
                                      <SelectInput
                                        label="Mode Financement:"
                                        name="mode_financement"
                                        options={Object.values(
                                          MODE_FINANCE
                                        ).map((finance) => ({
                                          value: finance.code.toString(),
                                          label: finance.label,
                                        }))}
                                        value={x.mode_financement?.toString()}
                                        onChange={(selectedValue) => {
                                          // Create a synthetic event to match handleinputchange's expected format
                                          const syntheticEvent = {
                                            target: {
                                              name: 'mode_financement',
                                              value: selectedValue,
                                            },
                                          };
                                          handleinputchange_bien_vendu(
                                            syntheticEvent,
                                            j
                                          );
                                        }}
                                        placeholder="Sélectionner un Mode de Financement"
                                        required
                                      />

                                      {x.avance_res > 0 && (
                                        <SelectInput
                                          label="Mode Paiement:"
                                          name="mode_paiement"
                                          options={Object.values(
                                            MODE_PAIEMENT
                                          ).map((paiement) => ({
                                            value: paiement.code.toString(),
                                            label: paiement.label,
                                          }))}
                                          value={x.mode_paiement?.toString()}
                                          onChange={(selectedValue) => {
                                            // Create a synthetic event to match handleinputchange's expected format
                                            const syntheticEvent = {
                                              target: {
                                                name: 'mode_paiement',
                                                value: selectedValue,
                                              },
                                            };
                                            handleinputchange_bien_vendu(
                                              syntheticEvent,
                                              j
                                            );
                                          }}
                                          placeholder="Sélectionner un Mode de Paiement"
                                          required
                                        />
                                      )}
                                      {/* Conditional Fields */}
                                      {x.mode_paiement !== '1' &&
                                        x.mode_paiement !== '' &&
                                        x.avance_res > 0 && (
                                          <>
                                            <SelectInput
                                              label="Banque:"
                                              name="banque_id"
                                              options={banques.map(
                                                (banque) => ({
                                                  value: banque.id.toString(),
                                                  label: banque.nom,
                                                })
                                              )}
                                              value={x.banque_id?.toString()}
                                              onChange={(selectedValue) => {
                                                const syntheticEvent = {
                                                  target: {
                                                    name: 'banque_id',
                                                    value: selectedValue,
                                                  },
                                                };
                                                handleinputchange_bien_vendu(
                                                  syntheticEvent,
                                                  j
                                                );
                                              }}
                                              placeholder="Sélectionner une Banque"
                                              required={x.mode_paiement !== '1'}
                                            />
                                            <InputField_Biens
                                              label="N° Paiement:"
                                              name="numero_paiement"
                                              type="number"
                                              required={
                                                x.mode_paiement !== '1' &&
                                                x.avance_res > 0
                                              }
                                              value={x.numero_paiement}
                                              onChange={(e) =>
                                                handleinputchange_bien_vendu(
                                                  e,
                                                  j
                                                )
                                              }
                                            />
                                          </>
                                        )}
                                      {x.mode_paiement !== '' &&
                                        x.mode_paiement !== '1' &&
                                        x.mode_paiement !== '5' &&
                                        x.mode_paiement !== '6' &&
                                        x.avance_res > 0 && (
                                          <InputField_Biens
                                            label="Date Échéance:"
                                            name="echeance"
                                            required={
                                              x.mode_paiement !== '1' &&
                                              x.avance_res > 0
                                            }
                                            type="date"
                                            value={x.echeance}
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                          />
                                        )}
                                      {x.avance_res != '' &&
                                        x.avance_res == 0 && (
                                          <div>
                                            <label
                                              className="flex items-center space-x-2"
                                              style={{ marginTop: '19px' }}
                                            >
                                              <span
                                                className={`text-sm font-medium ${
                                                  x.check_montant == true
                                                    ? 'text-purple-600'
                                                    : ''
                                                }`}
                                              >
                                                {' '}
                                                Voulez vous Enregistrer la
                                                Réservation sans montant (Prière
                                                de saisir un commentaire)
                                              </span>
                                              <input
                                                style={{ color: 'green' }}
                                                type="checkbox"
                                                name="check_montant"
                                                value={x.check_montant}
                                                checked={x.check_montant}
                                                required={
                                                  x.avance_res != '' &&
                                                  x.avance_res == 0
                                                }
                                                onChange={(e) =>
                                                  handleinputchange_bien_vendu(
                                                    e,
                                                    j
                                                  )
                                                }
                                                className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                              />
                                            </label>
                                          </div>
                                        )}
                                      <InputField_Biens
                                        label="Commentaire:"
                                        name="commentaireAvance"
                                        multi
                                        required={
                                          x.check_montant == true ? true : false
                                        }
                                        value={x.commentaireAvance}
                                        onChange={(e) =>
                                          handleinputchange_bien_vendu(e, j)
                                        }
                                      />
                                      {user.role <= 2 && x.avance_res > 0 && (
                                        <>
                                          <div className="col-span-3">
                                            <h2
                                              className="text-lg font-medium border-b pb-2 mb-4"
                                              style={{ color: '#231651' }}
                                            >
                                              Informations Encaissement
                                            </h2>
                                          </div>

                                          <InputField_Biens
                                            label="N° Remise:"
                                            name="num_remise"
                                            type="number"
                                            value={x.num_remise}
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                          />
                                          <InputField_Biens
                                            label="Date Encaissement:"
                                            name="date_encaissement"
                                            type="date"
                                            value={x.date_encaissement}
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                          />
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          {/* Bottom Divider */}
                        </div>
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {input_biens_vendu.length > 0 && (
                      <>
                        {watch('loading_b_pre') == false && (
                          <>
                            <div className="">
                              <SelectInput
                                placeholder="selectionner un intérêt"
                                label="Intérêt :"
                                name="interet"
                                value={watch('interet')}
                                required={true}
                                options={[{ value: '1', label: 'Intéressé' }]}
                                disabled={
                                  isOrigin ? false : watch('telephone') == ''
                                }
                                error={
                                  errors?.interet?.message ||
                                  backendErrors?.interet
                                }
                                onChange={handleChange_interet}
                              />
                            </div>
                            {Number(watch('interet')) == 1 && (
                              <>
                                <TextField
                                  label="Nombre de Biens à ajouter:"
                                  name="nb_bien_added"
                                  type="number"
                                  control={control}
                                  errors={{
                                    ...errors,
                                    nb_bien_added:
                                      formSubmitted &&
                                      Number(watch('interet')) == 1 &&
                                      (watch('nb_bien_added') === '' ||
                                        watch('nb_bien_added') === null)
                                        ? 'Ce champ est obligatoire'
                                        : Number(watch('nb_bien_added')) < 0
                                        ? 'Veuillez entrer un nombre positif ou zéro'
                                        : input_biens_vendu.length === 0 &&
                                          Number(watch('nb_bien_added')) === 0
                                        ? 'Vous devez ajouter au moins 1 bien'
                                        : null,
                                  }}
                                  backendErrors={backendErrors}
                                  defaultValues={{ nb_bien_added: 0 }}
                                  required={Number(watch('interet')) == 1}
                                  inputProps={{
                                    min: input_biens_vendu.length > 0 ? 0 : 1,
                                    inputMode: 'numeric',
                                  }}
                                  onChange={(e) => {
                                    let value = e.target.value;

                                    // Remove leading 0 when user starts typing
                                    if (
                                      value.length > 1 &&
                                      value.startsWith('0')
                                    ) {
                                      value = value.replace(/^0+/, '');
                                    }

                                    // Only allow digits (optional extra check)
                                    if (/^\d*$/.test(value)) {
                                      e.target.value = value;
                                      handleChange_NbrBien(e);
                                    }
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                        {/*isOrigin && display_cin && display_cin_1 && (
                        <div>
                          <TextField
                            label="Cin:"
                            name="cin"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            onChange={handleChange_event('cin')}
                            required={Number(watch('interet')) == 1}
                          />
                        </div>
                      )*/}
                      </>
                    )}
                  </div>
                  <div>
                    {/*watch('nb_bien_added') !== '' && (
                    <PanelInteresse
                      input_biens={input_biens}
                      input_biens_vendu={input_biens_vendu}
                      handleAccordionChange={handleAccordionChange}
                      expanded={expanded}
                      handleChange={handleChange}
                      handleinputchange={handleinputchange}
                      user={user}
                      biensByProjet={biensByProjet}
                      loading_bien={loading_bien}
                      info_reservation={info_reservation}
                      banques={banques}
                      MODE_FINANCE={MODE_FINANCE}
                      VISITE_STATUT_FORM={VISITE_STATUT_FORM}
                    />
                  )*/}
                    {watch('nb_bien_added') !== '' &&
                      input_biens.map((x, i) => (
                        <div key={`panel_bien${i + 1}`}>
                          {/* Top Divider */}

                          {/* Accordion */}
                          <div className="border mt-4 rounded-md">
                            <button
                              type="button"
                              className="bg-[#009FFF] rounded-t-md w-full flex justify-between items-center px-4 py-3  text-white font-medium focus:outline-none"
                              onClick={handleAccordionChange(
                                `panel_bien${i + 1}`
                              )}
                            >
                              <span>{`Bien ${
                                input_biens_vendu.length + i + 1
                              }`}</span>
                              <span className="text-xl">
                                {expanded.includes(`panel_bien${i + 1}`)
                                  ? '−'
                                  : '+'}
                              </span>
                            </button>

                            {/* Accordion Content */}
                            {expanded.includes(`panel_bien${i + 1}`) && (
                              <>
                                <div className="p-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                                    <div>
                                      <SelectInput
                                        required
                                        label="Bien:"
                                        name="bien_id"
                                        options={
                                          biensByProjet
                                            ? biensByProjet
                                                .filter(
                                                  (bien) =>
                                                    bien &&
                                                    bien.id &&
                                                    bien.propriete_dite_bien
                                                )
                                                .map((bien) => {
                                                  // Add the same disabled logic from your old autocomplete
                                                  const isDisabled =
                                                    bien.etat ==
                                                      'ENCOURS_DE_PROPOSITION' &&
                                                    bien.is_proposed != null &&
                                                    user.id !=
                                                      bien.is_proposed.user_id;

                                                  // Add the same label text logic
                                                  const labelText =
                                                    bien.propriete_dite_bien +
                                                    (bien.etat ==
                                                    'ENCOURS_DE_PROPOSITION'
                                                      ? bien?.is_proposed !==
                                                        null
                                                        ? user.id !==
                                                          bien?.is_proposed
                                                            ?.user_id
                                                          ? ` Proposé par ${bien?.is_proposed?.user?.name} ${bien?.is_proposed?.user?.prenom}`
                                                          : ' Proposé par Moi Même'
                                                        : ''
                                                      : '');

                                                  return {
                                                    value: bien.id.toString(),
                                                    label: labelText, // Remove debug text here
                                                    disabled: isDisabled,
                                                  };
                                                })
                                            : []
                                        }
                                        value={x.bien_id}
                                        onChange={(selectedValue) => {
                                          const syntheticEvent = {
                                            target: {
                                              name: 'bien_id',
                                              value: selectedValue,
                                            },
                                          };
                                          handleinputchange(syntheticEvent, i);
                                        }}
                                        placeholder="Sélectionner un bien"
                                        loading={loading_bien}
                                        // required={x.statut == 2}
                                      />
                                    </div>

                                    {/* Statut Selection */}
                                    <div>
                                      <SelectInput
                                        label="Statut:"
                                        name="statut"
                                        options={Object.values(
                                          VISITE_STATUT_FORM
                                        ).map((statut) => ({
                                          value: statut.code.toString(),
                                          label: statut.label,
                                        }))}
                                        value={x.statut?.toString()}
                                        onChange={(selectedValue) => {
                                          // Create a synthetic event to match handleinputchange's expected format
                                          const syntheticEvent = {
                                            target: {
                                              name: 'statut',
                                              value: selectedValue,
                                            },
                                          };
                                          handleinputchange(syntheticEvent, i);
                                        }}
                                        placeholder="Sélectionner un statut"
                                        required
                                      />
                                    </div>

                                    {/* Conditional RDV / Relance fields */}
                                    {x.statut == 1 && (
                                      <>
                                        <div>
                                          <InputField_Biens
                                            label="Rendez Vous"
                                            name="rdv"
                                            type="datetime-local"
                                            value={x.rdv}
                                            onChange={(e) =>
                                              handleinputchange(e, i)
                                            }
                                          />
                                        </div>
                                        <div>
                                          <SelectInput
                                            label="Mode de Relance:"
                                            name="mode_relance"
                                            options={Object.values(
                                              VISITE_TYPE_NOTIF
                                            ).map((notif) => ({
                                              value: notif.code.toString(),
                                              label: notif.label,
                                            }))}
                                            value={x.mode_relance?.toString()}
                                            onChange={(selectedValue) => {
                                              const syntheticEvent = {
                                                target: {
                                                  name: 'mode_relance',
                                                  value: selectedValue,
                                                },
                                              };
                                              handleinputchange(
                                                syntheticEvent,
                                                i
                                              );
                                            }}
                                            placeholder="Sélectionner un Mode de Relance"
                                          />
                                        </div>
                                        <div>
                                          <InputField_Biens
                                            label="Date de relance"
                                            name="date_relance"
                                            type="date"
                                            value={x.date_relance}
                                            onChange={(e) =>
                                              handleinputchange(e, i)
                                            }
                                          />
                                        </div>
                                      </>
                                    )}

                                    {/* Commentaire */}
                                    <div className="md:col-span-3">
                                      <InputField_Biens
                                        label="Commentaire"
                                        name="commentaire"
                                        multi
                                        value={x.commentaire}
                                        onChange={(e) =>
                                          handleinputchange(e, i)
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Divider */}
                                {/* Réservation */}
                                {x.statut == 2 && x.bien_id != null && (
                                  <div className="border rounded-lg  mt-4 mx-5">
                                    {/* Accordion Header */}
                                    <div
                                      className="flex items-center justify-between px-4 py-2 cursor-pointer"
                                      style={{ background: '#2f8a8bab' }}
                                      onClick={() =>
                                        handleChange(`panel_res${i + 1}`)
                                      }
                                    >
                                      <h3 className="text-white font-semibold">
                                        Réservation du Bien{' '}
                                        {input_biens_vendu.length + (i + 1)}
                                      </h3>
                                      <span className="text-white">
                                        {expanded.includes(`panel_res${i + 1}`)
                                          ? '⌃'
                                          : '⌄'}
                                      </span>
                                    </div>

                                    {/* Accordion Content */}
                                    {expanded.includes(`panel_res${i + 1}`) && (
                                      <div className="p-4 space-y-4 bg-white">
                                        {info_reservation && (
                                          <div className="bg-red-100 border-l-4 border-red-500 !text-red-700 p-4 text-center rounded">
                                            {info_reservation}
                                          </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          <InputField_Biens
                                            label="Code Réservation:"
                                            name="code_reservation"
                                            type="text"
                                            placeholder="Code Réservation"
                                            value={x.code_reservation}
                                            onChange={(e) =>
                                              handleinputchange(e, i)
                                            }
                                            required
                                          />

                                          <InputField_Biens
                                            label="Bien:"
                                            name=""
                                            type="text"
                                            value={x.propriete_dite_bien}
                                            disabled
                                          />

                                          <InputField_Biens
                                            label="Prix:"
                                            name=""
                                            type="number"
                                            value={x.prix}
                                            disabled
                                          />

                                          <InputField_Biens
                                            label="Date Réservation:"
                                            name="date_reservation"
                                            type="date"
                                            value={x.date_reservation}
                                            onChange={(e) =>
                                              handleinputchange(e, i)
                                            }
                                            required
                                          />
                                          <InputField_Biens
                                            label="Commentaire:"
                                            name="commentaire_res"
                                            multi
                                            value={x.commentaire_res}
                                            onChange={(e) =>
                                              handleinputchange(e, i)
                                            }
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Paiement */}
                                {x.statut == 2 && x.bien_id != null && (
                                  <div className="border rounded-lg  mt-4 mx-5 mb-5">
                                    {/* Accordion Header */}
                                    <div
                                      className="flex items-center justify-between px-4 py-2 cursor-pointer"
                                      style={{ background: '#2f8a8bab' }}
                                      onClick={() =>
                                        handleChange(`panel_pai${i + 1}`)
                                      }
                                    >
                                      <h3 className="text-white font-semibold">
                                        Paiement du Bien{' '}
                                        {input_biens_vendu.length + (i + 1)}
                                      </h3>
                                      <span className="text-white">
                                        {expanded.includes(`panel_pai${i + 1}`)
                                          ? '⌃'
                                          : '⌄'}
                                      </span>
                                    </div>

                                    {/* Accordion Content */}
                                    {expanded.includes(`panel_pai${i + 1}`) && (
                                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white transition-all duration-300">
                                        <div>
                                          <label
                                            className="flex items-center space-x-2"
                                            style={{ marginTop: '30px' }}
                                          >
                                            <span
                                              className={`text-sm font-medium ${
                                                x.sr == true
                                                  ? 'text-purple-600'
                                                  : ''
                                              }`}
                                            >
                                              SR:
                                            </span>
                                            <input
                                              type="checkbox"
                                              name="sr"
                                              value={x.sr}
                                              checked={x.sr}
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                              className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                            />
                                          </label>
                                        </div>
                                        <InputField_Biens
                                          label="Prix :"
                                          name="prix"
                                          type="number"
                                          value={x.prix}
                                          disabled
                                        />
                                        <InputField_Biens
                                          label="Prix Unitaire:"
                                          name="prix_unitaire"
                                          type="number"
                                          value={x.prix_unitaire}
                                          disabled
                                        />
                                        <InputField_Biens
                                          label="Prix Unitaire Remisé:"
                                          name="prix_remise"
                                          type="number"
                                          value={x.prix_remise}
                                          onChange={(e) =>
                                            handleinputchange(e, i)
                                          }
                                        />
                                        <InputField_Biens
                                          label="Remise Forfaitaire:"
                                          name="prix_forfetaire"
                                          type="number"
                                          value={x.prix_forfetaire}
                                          onChange={(e) =>
                                            handleinputchange(e, i)
                                          }
                                        />
                                        <InputField_Biens
                                          label="Prix Final:"
                                          name="prix_final"
                                          type="number"
                                          value={
                                            check_total >= 0 && x.prix_final
                                          }
                                          disabled
                                        />
                                        <InputField_Biens
                                          label="Montant:"
                                          name="avance_res"
                                          type="number"
                                          required
                                          value={x.avance_res}
                                          error={
                                            x.avance_res != '' &&
                                            x.avance_res == 0 &&
                                            user?.role > 2
                                              ? 'Le montant ne peut pas être 0 pour votre rôle'
                                              : x.avance_res > 0 &&
                                                x.avance_res < x.avance_minimale
                                              ? `Le montant doit être au moins ${x.avance_minimale}`
                                              : null
                                          }
                                          onChange={(e) =>
                                            handleinputchange(e, i)
                                          }
                                        />
                                        <InputField_Biens
                                          label="Reste:"
                                          name="reste"
                                          type="number"
                                          value={x.reste}
                                          disabled
                                        />
                                        {/* Mode Financement Selection */}
                                        <div>
                                          <SelectInput
                                            label="Mode Financement:"
                                            name="mode_financement"
                                            options={Object.values(
                                              MODE_FINANCE
                                            ).map((finance) => ({
                                              value: finance.code.toString(),
                                              label: finance.label,
                                            }))}
                                            value={x.mode_financement?.toString()}
                                            onChange={(selectedValue) => {
                                              // Create a synthetic event to match handleinputchange's expected format
                                              const syntheticEvent = {
                                                target: {
                                                  name: 'mode_financement',
                                                  value: selectedValue,
                                                },
                                              };
                                              handleinputchange(
                                                syntheticEvent,
                                                i
                                              );
                                            }}
                                            placeholder="Sélectionner un Mode de Financement"
                                            required
                                          />
                                        </div>

                                        {/* Mode Paiement Selection */}

                                        <div>
                                          {x.avance_res > 0 && (
                                            <SelectInput
                                              label="Mode Paiement:"
                                              name="mode_paiement"
                                              options={Object.values(
                                                MODE_PAIEMENT
                                              ).map((paiement) => ({
                                                value: paiement.code.toString(),
                                                label: paiement.label,
                                              }))}
                                              value={x.mode_paiement?.toString()}
                                              onChange={(selectedValue) => {
                                                // Create a synthetic event to match handleinputchange's expected format
                                                const syntheticEvent = {
                                                  target: {
                                                    name: 'mode_paiement',
                                                    value: selectedValue,
                                                  },
                                                };
                                                handleinputchange(
                                                  syntheticEvent,
                                                  i
                                                );
                                              }}
                                              placeholder="Sélectionner un Mode de Paiement"
                                              required
                                            />
                                          )}
                                        </div>
                                        {/* Conditional Fields */}
                                        {x.mode_paiement !== '1' &&
                                          x.mode_paiement !== '' &&
                                          x.avance_res > 0 && (
                                            <>
                                              <SelectInput
                                                label="Banque:"
                                                name="banque_id"
                                                options={banques.map(
                                                  (banque) => ({
                                                    value: banque.id.toString(),
                                                    label: banque.nom,
                                                  })
                                                )}
                                                value={x.banque_id?.toString()}
                                                onChange={(selectedValue) => {
                                                  const syntheticEvent = {
                                                    target: {
                                                      name: 'banque_id',
                                                      value: selectedValue,
                                                    },
                                                  };
                                                  handleinputchange(
                                                    syntheticEvent,
                                                    i
                                                  );
                                                }}
                                                placeholder="Sélectionner une Banque"
                                                required={
                                                  x.mode_paiement !== '1'
                                                }
                                              />
                                              <InputField_Biens
                                                label="N° Paiement:"
                                                name="numero_paiement"
                                                type="number"
                                                required={
                                                  x.mode_paiement !== '1'
                                                }
                                                value={x.numero_paiement}
                                                onChange={(e) =>
                                                  handleinputchange(e, i)
                                                }
                                              />
                                            </>
                                          )}
                                        {x.mode_paiement !== '' &&
                                          x.mode_paiement !== '1' &&
                                          x.mode_paiement !== '5' &&
                                          x.mode_paiement !== '6' &&
                                          x.avance_res > 0 && (
                                            <InputField_Biens
                                              label="Date Échéance:"
                                              name="echeance"
                                              required={
                                                x.mode_paiement !== '1' &&
                                                x.avance_res > 0
                                              }
                                              type="date"
                                              value={x.echeance}
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                            />
                                          )}
                                        {x.avance_res != '' &&
                                          x.avance_res == 0 && (
                                            <div>
                                              <label
                                                className="flex items-center space-x-2"
                                                style={{ marginTop: '19px' }}
                                              >
                                                <span
                                                  className={`text-sm font-medium ${
                                                    x.check_montant == true
                                                      ? 'text-purple-600'
                                                      : ''
                                                  }`}
                                                >
                                                  {' '}
                                                  Voulez vous Enregistrer la
                                                  Réservation sans montant
                                                  (Prière de saisir un
                                                  commentaire)
                                                </span>
                                                <input
                                                  style={{ color: 'green' }}
                                                  type="checkbox"
                                                  name="check_montant"
                                                  value={x.check_montant}
                                                  checked={x.check_montant}
                                                  required={
                                                    x.avance_res != '' &&
                                                    x.avance_res == 0
                                                  }
                                                  onChange={(e) =>
                                                    handleinputchange(e, i)
                                                  }
                                                  className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                                                />
                                              </label>
                                            </div>
                                          )}
                                        <InputField_Biens
                                          label="Commentaire:"
                                          name="commentaireAvance"
                                          multi
                                          required={
                                            x.check_montant == true
                                              ? true
                                              : false
                                          }
                                          value={x.commentaireAvance}
                                          onChange={(e) =>
                                            handleinputchange(e, i)
                                          }
                                        />
                                        {user.role <= 2 && x.avance_res > 0 && (
                                          <>
                                            <div className="col-span-3">
                                              <h2
                                                className="text-lg font-medium border-b pb-2 mb-4"
                                                style={{ color: '#231651' }}
                                              >
                                                Informations Encaissement
                                              </h2>
                                            </div>

                                            <InputField_Biens
                                              label="N° Remise:"
                                              name="num_remise"
                                              type="number"
                                              value={x.num_remise}
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                            />
                                            <InputField_Biens
                                              label="Date Encaissement:"
                                              name="date_encaissement"
                                              type="date"
                                              value={x.date_encaissement}
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                            />
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {(Number(watch('interet')) == 2 ||
                    Number(watch('interet')) == 3 ||
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
                <div className="flex justify-center items-center gap-4 xl:mt-32">
                  <Button type="button" onClick={() => router.back()}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={OldBiens_pre.length > 0 && paper_exist == 0}
                    className={
                      OldBiens_pre.length > 0 && paper_exist == 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enregistrement...
                      </div>
                    ) : OldBiens_pre.length > 0 && paper_exist == 0 ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Enregistrer (désactivé)
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      {showPreReservedSection && (
        <div className="p-3">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-blue-800 font-semibold">
                  Biens pré-réservés en attente
                </h3>
                <p className="text-blue-700 text-sm">
                  Le formulaire principal est désactivé jusqu{"'"}à ce que vous
                  ayez traité ces biens.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 mt-4 bg-white shadow-md rounded-md">
            <div className="text-white rounded-t-lg p-4 bg-[#5483b3]">
              <h3 className="text-xl font-semibold">Information</h3>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-5">
                <div className="col-span-1">
                  <p className="text-sm font-semibold"></p>
                </div>

                {OldBiens_pre.length > 0 && (
                  <>
                    <div className="col-span-1">
                      <h5 className="text-left mt-5  text-lg font-medium">
                        Ce Client a déja les pré-réservations suivantes :
                      </h5>
                    </div>

                    <form onSubmit={handleSubmit_action}>
                      {OldBiens_pre.map((x, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ml-5"
                        >
                          <div className="sm:col-span-1">
                            <p className="text-base font-medium">
                              Bien {i + 1}
                            </p>
                            <input
                              width={'70%'}
                              type="text"
                              value={x.propriete_dite_bien}
                              onChange={(e) => handle_action_change(e, i, null)}
                              name="propriete"
                              className="block w-[70%] p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          <div className="sm:col-span-1 ml-5">
                            <p className="text-base font-medium">
                              Veuillez choisir une action :
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                value="1"
                                className={`py-1 px-2 rounded-md ${
                                  x.action == '1'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-[rgb(231,239,255)]'
                                }`}
                                onClick={(e) =>
                                  handle_action_change(e, i, 'action')
                                }
                              >
                                Garder
                              </button>
                              <button
                                type="button"
                                value="2"
                                className={`py-1 px-2 rounded-md ${
                                  x.action == '2'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-[rgb(231,239,255)]'
                                }`}
                                onClick={(e) =>
                                  handle_action_change(e, i, 'action')
                                }
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                value="3"
                                className={`py-1 px-2 rounded-md ${
                                  x.action == '3'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[rgb(231,239,255)]'
                                }`}
                                onClick={(e) =>
                                  handle_action_change(e, i, 'action')
                                }
                              >
                                Vente
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <hr className="my-4 border-gray-300" />

                      <div className="flex gap-4">
                        {loading_button_save_1 ? (
                          <div className="flex items-center justify-center">
                            <span className="animate-spin border-t-2 border-gray-500 w-6 h-6 rounded-full"></span>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                            disabled={check_save_1}
                          >
                            Enregistrer
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={set_all_action_null}
                          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                          RÉINITIALISER
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisiteForm;