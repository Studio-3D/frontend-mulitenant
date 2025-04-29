"use client";
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

import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import Modal_Propsepct_Exist from './Modal_Propsepct_Exist';
//import { useProjet } from '@/context/ProjetContext';
import AutocompleteBien from './AutocompleteBien'; // adjust path if needed
import AutocompleteStatut_ModeRelance_Biens from './AutocompleteStatut_ModeRelance_Biens';
import InputField_Biens from './InputField_Biens'; // adjust path if needed
import ProspectInformations from './ProspectInformations'; // Adjust path as needed
import {
  VISITE_INTERETS,
  VISITE_STATUT_FORM,
  VISITE_TYPE_NOTIF,
  MODE_FINANCE,
  MODE_PAIEMENT,
  ORIENTATIONS,
} from '@/configs/enum';
import Pusher from 'pusher-js';
import Modal_OldVisites_Perdu from './Modal_OldVisites_Perdu';
import FreinsComponent from './FreinsComponent';
import PanelInteresse from './PanelInteresse';
import PanelInteresse_vendu from './PanelInteresse_Vendu';
import useClearProspect from "./hook/useClearProspect";
const VisiteForm = (id, origin) => {
  const router = useRouter();
  useClearProspect(); // Clear localstorage prospect when changing route /reload/or close page
  const { user } = useAuth();
  const [email_required, setEmail_required] = useState(false);

  //dialog
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [open_dialog, setOpen_Dialog] = useState(false);
  const [info_client_1, setInfo_client_1] = useState(null);
  const [client_prospect, setClient_prospect] = useState(null);
  const [id_appel, setId_appel] = useState(null);
  const [id_visite, setId_visite] = useState(null);

 // const router = useRouter();
  const accessToken = localStorage.getItem('accessToken');
  const stored = JSON.parse(localStorage.getItem('selectedProspect'));
  const selectedProspect = stored?.dataProspect;
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const [loading, setLoading] = useState(false);
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);

  const [loading_form, setLoading_form] = useState(false);

  //  const { selectedProjet } = useProjet();
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || 1;
  const [backendErrors, setBackendErrors] = useState({});
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);

  const [disabled_var, setDisabled] = useState(false);

  const [OldBiens_pre, setOldBiens_pre] = useState([]);
  const [biensByProjet, setBiensByProjet] = useState(null);
  const [input_biens, setinput_biens] = useState([]);
  const [check_save, setCheck_save] = useState(true);
  const [list_tranches, setList_tranches] = useState([]);
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
  const [check_save_1, setCheck_save_1] = useState(false);
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
      (v) => v.action === 0 || v.action === '' || v.action === null
    );

    if (hasAnyVisite && allActionsEmpty) {
      setLoading_form(false);
    }
  };
  const [check_save_perdu, setCheck_save_perdu] = useState(false);

  const isEditing = id && Object.keys(id).length > 0;
  const isOrigin = !!origin;
  //selectedProjet?.id
  /* const [partenaire_txt, setPartenaire_txt] = useState(
    selectedProspect?.partenaire
      ? selectedProspect.partenaire.description &&
          setValue('partenaire_txt', selectedProspect.partenaire.description)
      : null
  );*/
  const [partenaire_txt, setPartenaire_txt] = useState(
    selectedProspect?.partenaire?.description
      ? selectedProspect.partenaire.description
      : null
  );
  const defaultValues = {
    interet: '',
    selectedProjet: selectedProjet?.id || 1,
    id_t_appel: selectedProspect?.id_t_appel || '',
    prospect_id: selectedProspect?.id || '',
    cin: selectedProspect?.cin || '',
    nom: selectedProspect?.nom || '',
    email: selectedProspect?.email || '',
    prenom: selectedProspect?.prenom || '',
    telephone: selectedProspect?.telephone || '',
    telephone_num2: selectedProspect?.telephone_num2 || null,
    ville: selectedProspect?.ville || '',
    notifie: selectedProspect?.notifie || '',
    source_id: selectedProspect?.source?.id || '',
    source_txt: selectedProspect?.source?.source || '',
    partenaire_id: selectedProspect?.partenaire_id || '',
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
            return originalValue === 'null' || originalValue === ''
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
  //selectedProjet?.max_etages insted of 1
  if (list_etages.length === 0 && 1 > 0) {
    for (let i = 0; i <= 1; i++) {
      list_etages.push({ id: i + 1, value: i });
    }
  }
  /*
 if (list_etages.length === 0 && selectedProjet?.max_etages > 0) {
    for (let i = 0; i <= selectedProjet?.max_etages; i++) {
      list_etages.push({ id: i + 1, value: i });
    }
  }
*/

  //fin multiple bien

  const mystyle_Grid = {
    width: '100%',
    background: 'rgb(102 108 255)',
    borderRadius: '10px',
    marginTop: '20px',
    marginLeft: '15px',
  };

  const pusher_function = async () => {
    console.log('je suis en pusher');
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

  const handleChange_interet = (code) => {
    console.log('Selected:', code); // Debug the selected option
    if (code) {
      setValue('interet', code);

      if (code === 2) {
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
        setValue('list_bien_transfere_vendu', []);
        if (watch('cin') === '' && !isOrigin) {
          setdisplay_cin_1(true);
          toast.error('Veuillez saisir un cin !');
        }
        if (watch('cin') === '' && isOrigin && display_cin) {
          setdisplay_cin_1(true);
          toast.error('Veuillez saisir un cin !');
        }
        fetch_bien_ByProjet();
        pusher_function();
      }

      //perdu
      else if (code == 3) {
        setValue('list_bien_interesse', []);
        setValue('list_bien_transfere_vendu', []);
        setdisplay_cin_1(false);
        setValue('nb_bien_added', '');
        setCheck_save(true);
        fetchTypeFreins();
        fetchDataByProjet('tranches', setList_tranches, setLoading);
        fetchDataByProjet('vues', setList_Vues, setLoading);
        fetchDataByProjet('typologies', setListTyplogies, setLoading);
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
      setValue('loading_b_pre', true);
      axios
        .get(`${APIURL.ROOTV1}/get_oldBien_visite_pre_reserve/${origin}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setOldBiens_pre([]);

          //bien visites
          if (response.data.biens_visite.length > 0) {
            for (
              var i = 0;
              i <= Number(response.data.biens_visite.length) - 1;
              i++
            ) {
              let propriete =
                response.data.biens_visite[i].bien.propriete_dite_bien;
              let bien_id = response.data.biens_visite[i].bien_id;
              let v_id = response.data.biens_visite[i].id;
              let avancee = response.data.biens_visite[i].bien.avance_minimale;
              let prixx = response.data.biens_visite[i].bien.prix;
              let prixx_uni = response.data.biens_visite[i].bien.prix_unitaire;
              let sup_jardin =
                response.data.biens_visite[i].bien.superficie_jardin_calculer;
              console.log('sup jardin=>' + sup_jardin);
              let sup_habit =
                response.data.biens_visite[i].bien.superficie_habitable;
              let sup_balcon =
                response.data.biens_visite[i].bien.superficie_balcon_calculer;
              let sup_terrase =
                response.data.biens_visite[i].bien.superficie_terrasse_calculer;
              let p_box = response.data.biens_visite[i].bien.prix_box;
              let p_parking = response.data.biens_visite[i].bien.prix_parking;
              setOldBiens_pre((OldBiens_pre) => [
                ...OldBiens_pre,
                {
                  propriete_dite_bien: propriete,
                  prix: prixx,
                  prix_unitaire: prixx_uni,
                  bien_id: bien_id,
                  visite_id: v_id,
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

          //biens Traitement frein
          if (response.data.biens_traitement_freins.length > 0) {
            for (
              var n = 0;
              n <= Number(response.data.biens_traitement_freins.length) - 1;
              n++
            ) {
              let propriete =
                response.data.biens_traitement_freins[n].bien
                  .propriete_dite_bien;
              let bien_id = response.data.biens_traitement_freins[n].bien_id;
              let t_f_id = response.data.biens_traitement_freins[n].id;
              let avancee =
                response.data.biens_traitement_freins[n].bien.avance_minimale;
              let prixx = response.data.biens_traitement_freins[n].bien.prix;
              let prixx_uni =
                response.data.biens_traitement_freins[n].bien.prix_unitaire;
              let sup_jardin =
                response.data.biens_traitement_freins[n].bien
                  .superficie_jardin_calculer;
              let sup_habit =
                response.data.biens_traitement_freins[n].bien
                  .superficie_habitable;
              let sup_balcon =
                response.data.biens_traitement_freins[n].bien
                  .superficie_balcon_calculer;
              let sup_terrase =
                response.data.biens_traitement_freins[n].bien
                  .superficie_terrasse_calculer;
              let p_box =
                response.data.biens_traitement_freins[n].bien.prix_box;
              let p_parking =
                response.data.biens_traitement_freins[n].bien.prix_parking;
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
        })
        .catch((error) => {
          setValue('loading_b_pre', false);

          console.error('Error fetching visite details:', error);
        });
    }
  };

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
          if (response.data.visite.prospect.cin == null) {
            setdisplay_cin(true);
          }
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

      if (partenaires.length === 0) {
        fetchDataByProjet('partenaires', setPartenaires, setLoading);
      }
    }
    fetchData_Select('banques', setBanques, setLoading);

    // Fetch data using visiteId and update projetDetails state
  }, [accessToken, isOrigin, origin]);

  const handlePrixChange = (val) => {
    setTimeout(() => {
      let a, b, minField, maxField;

      if (val === 1) {
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
      } else if (val === 2) {
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

  // 1) Extract all your checks into a single function
  const validateFields = () => {
    let valid = true;
    const email = watch('email') || '';

    // Email required?
    if (email_required && !email) {
      valid = false;
      console.error('Email obligatoire');
    }
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      valid = false;
      console.error('Email invalide');
    }
    // Partenaire required if source_txt is 'Partenaire'
    if (watch('source_txt') === 'Partenaire' && !watch('partenaire_id')) {
      valid = false;
      console.error('Partenaire obligatoire');
    }

    if (Number(watch('interet')) === 1) {
      if (Number(watch('nb_bien_added')) < 0) {
        valid = false;
        console.error('Nb Bien obligatoire');
      }
    }
    // If interet === 3, then all those frein checks
    if (Number(watch('interet')) === 3) {
      const frein = watch('frein') || [];
      const checks = [
        frein.length > 0,
        !frein.includes('vue') || (watch('vues') || []).length > 0,
        !frein.includes('typologie') || (watch('typologies') || []).length > 0,
        !frein.includes('orientation') ||
          (watch('orientations') || []).length > 0,
        !frein.includes('etage') || (watch('etages') || []).length > 0,
        !frein.includes('tranche') || (watch('tranches') || []).length > 0,
      ];

      const checkNames = [
        'frein.length > 0',
        "'vue' => vues.length > 0",
        "'typologie' => typologies.length > 0",
        "'orientation' => orientations.length > 0",
        "'etage' => etages.length > 0",
        "'tranche' => tranches.length > 0",
      ];

      if (!checks.every(Boolean)) {
        valid = false;
        console.error('Certains freins ne sont pas remplis correctement.');
        checks.forEach((check, index) => {
          if (!check) {
            console.warn(`Échec du test: ${checkNames[index]}`);
          }
        });
      }
    }

    return valid;
  };

  const onSubmit = (data) => {
    setFormSubmitted(true);
    if (!validateFields()) {
      // there were validation errors → bail out
      return;
    }

    //si exist visites Perdu il faut repondre au dialog apres enregristrer sera activer
    if (old_visites_perdu.length > 0) {
      setOpen_D_P(true);
      setLoading_form(true);
    } else {
      //set on show visite le cadre est null pour saffiche par premier cadre
      localStorage.setItem('v_id_cadre', null);
      localStorage.setItem('v_id_org', null);
      setOpen_D_P(false);
      setLoading_form(true);
      setBackendErrors({});

      const dataToSend = new FormData();
      let url = APIURL.VISITES;
      let method = 'post';

      Object.entries(data).forEach(([key, value]) => {
        //console.log(`Checking key: ${key}, value:`, value, typeof value);

        // Normalize value: trim and lowercase
        if (
          typeof value === 'string' &&
          value.trim().replace(/['"]/g, '').toLowerCase() === 'null'
        ) {
          // console.log(`Converting ${key} from string "null" to actual null`);
          data[key] = null;
        }
        // Exclure certains champs si `isOrigin` est vrai
        if (
          isOrigin &&
          [
            'prospect_id',
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
          let message = 'Quelque chose ne va pas bien';
          if (res.status === 200) {
            message = `La visite a été ${
              isEditing ? 'modifiée' : 'créée'
            } avec succès`;
            toast.success(message);
            router.push(ENDPOINTS.VISITES);
            localStorage.removeItem('selectedProspect');
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
    }
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
      const res = await axios.get(`${APIURL.ROOT}/v1/${route}/${param}/${v}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Réinitialiser certains états
      setInfo_client_1(null);
      setClient_prospect(null);
      setId_appel(null);
      setId_visite(null);
      setOldBiens_pre([]);
      setDisabled(false);
      setDisabled_source(false);

      const { client, prospect } = res.data;

      // Si ni prospect ni client n'est présent, on laisse les champs inchangés
      if (prospect || client) {
        setDisabled(true);
        const isClient = client != null;
        const contactData = isClient ? client : prospect;

        // Extraire les champs communs seulement si `contactData` existe

        const prospect_id = client ? contactData.prospect.id : contactData.id;
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
        setInfo_client_1(`Nom & Prénom: ${nom} ${prenom}`);
        setClient_prospect(isClient ? 'Est un client' : 'Est un Prospect');
        setValue('prospect_id', prospect_id || '');
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
          setValue('loading_b_pre', true);
        } else {
          setValue('loading_b_pre', false);
        }

        // Gérer les données de dialogue
        if (prospect?.appels) setId_appel(prospect.appels.id);
        if (prospect?.visites?.length) {
          setId_visite(prospect.visites[0].id);

          setOld_visites_perdu([]);
          for (var i = 0; i <= Number(prospect.visites.length) - 1; i++) {
            if (prospect.visites[i].interet == '3') {
              if (
                prospect.visites[i]?.freins?.etat == 1 ||
                prospect.visites[i]?.freins?.etat == 2 ||
                prospect.visites[i]?.freins?.etat == 6
              ) {
                let date = format(
                  new Date(prospect.visites[i].created_at),
                  'dd/MM/yyyy '
                );
                let fr_id = prospect.visites[i]?.freins.id;
                let v_cadre_id = prospect.visites[i].related_show_id;
                let origin_id = prospect.visites[i].origin_id;
                let frein_exp = '';
                if (prospect.visites[i]?.freins.frein_tranche.length > 0) {
                  frein_exp += 'Tranche ,';
                }
                if (prospect.visites[i]?.freins.frein_etage.length > 0) {
                  frein_exp += 'Etage ,';
                }

                if (prospect.visites[i]?.freins.frein_orientation.length > 0) {
                  frein_exp += 'Orientation ,';
                }
                if (prospect.visites[i]?.freins.frein_typologie.length > 0) {
                  frein_exp += 'Typologie ,';
                }
                if (prospect.visites[i]?.freins.frein_vue.length > 0) {
                  frein_exp += 'Vue ,';
                }
                if (
                  (prospect.visites[i]?.freins.prix_min != null &&
                    prospect.visites[i]?.freins.prix_min != 0) ||
                  (prospect.visites[i]?.freins.prix_max != null &&
                    prospect.visites[i]?.freins.prix_max != 0)
                ) {
                  frein_exp += 'Prix ,';
                }
                if (
                  (prospect.visites[i]?.freins.superficie_min != null &&
                    prospect.visites[i]?.freins.superficie_min != 0) ||
                  (prospect.visites[i]?.freins.superficie_max != null &&
                    prospect.visites[i]?.freins.superficie_max != 0)
                ) {
                  frein_exp += 'Superficie ,';
                }
                if (prospect.visites[i]?.freins.avance != null) {
                  frein_exp += 'Avance ,';
                }
                if (prospect.visites[i]?.freins.description_autre != null) {
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
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la visite:', error);
      setDisabled(false);
      setDisabled_source(false);
    }
  };
  //selectedProjet?.id
  const fetch_bien_ByProjet = async () => {
    if (Number(watch('interet')) === 1) {
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

  /*const handleAccordionChangeVendu = (panel) => (event, isExpanded) => {
    console.log('Clicked panel:', panel);
    console.log('Before update:', expanded);
    setExpandedVendu((prevExpanded) =>
      prevExpanded.includes(panel)
        ? prevExpanded.filter((p) => p !== panel)
        : [...prevExpanded, panel]
    );
    console.log('After update:', expanded);
  };*/

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
    }
    setinput_biens_vendu(list);
    setValue('list_bien_transfere_vendu', JSON.stringify(list));
    console.log('les biens =>' + JSON.stringify(input_biens_vendu));

    if (
      list[index]['statut'] == 2 &&
      (list[index]['code_reservation'] === '' ||
        list[index]['bien_id'] === '' ||
        list[index]['prix'] === '' ||
        list[index]['date_reservation'] === '' ||
        Number(list[index]['avance_res']) < 0 || // Ensure it's treated as a number
        list[index]['mode_financement'] === '' ||
        list[index]['mode_paiement'] === '' ||
        (list[index]['check_montant'] === true &&
          list[index]['commentaireAvance'].length === 0) ||
        (Number(list[index]['avance_res']) === 0 &&
          list[index]['check_montant'] === false))
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
    window.open(`/visites/show/${origin_id}`, '_blank');
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

    setinput_biens_vendu([]);
    for (var i = 0; i <= Number(OldBiens_pre.length) - 1; i++) {
      if (OldBiens_pre[i].action == 3) {
        let bien_idd = OldBiens_pre[i].bien_id;
        let bien_proprietee = OldBiens_pre[i].propriete_dite_bien;
        let prixx = OldBiens_pre[i].prix;
        let prixx_uni = OldBiens_pre[i].prix_unitaire;
        let sup_jardin = OldBiens_pre[i].superficie_jardin_calculer;
        console.log('on submit vendu ==>' + sup_jardin);
        let sup_habit = OldBiens_pre[i].superficie_habitable;
        let sup_balcon = OldBiens_pre[i].superficie_balcon_calculer;
        let sup_terrase = OldBiens_pre[i].superficie_terrasse_calculer;
        let p_box = OldBiens_pre[i].prix_box;
        let p_parking = OldBiens_pre[i].prix_parking;
        let avancee = OldBiens_pre[i].avance_minimale;
        let visite_idd = OldBiens_pre[i].visite_id;
        let t_f_id = OldBiens_pre[i].traitement_frein_id;
        setinput_biens_vendu((input_biens_vendu) => [
          ...input_biens_vendu,
          {
            visite_id: visite_idd,
            traitement_frein_id: t_f_id,
            bien_id: bien_idd,
            old_bien_id: '',
            propriete_dite_bien: bien_proprietee,
            statut: 2,
            rdv: '',
            date_relance: '',
            mode_relance: '',
            commentaire: '',
            prix: prixx,
            prix_final: prixx,
            superficie_balcon_calculer: sup_balcon,
            superficie_terrasse_calculer: sup_terrase,
            superficie_jardin_calculer: sup_jardin,
            superficie_habitable: sup_habit,
            prix_box: p_box,
            prix_parking: p_parking,
            prix_unitaire: prixx_uni,
            avance_minimale: avancee,

            /*Reservation*/
            code_reservation: '',
            mode_financement: '',
            date_reservation: date_reservation[0],
            commentaire_res: '',
            avance_res: '',
            reste: prixx,
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
        setValue(
          'list_bien_transfere_vendu',
          JSON.stringify(input_biens_vendu)
        );
      }
      const initialExpandedPanels = Array.from(
        { length: Number(OldBiens_pre.length) },
        (_, i) => `panel_bienn${i + 1}`
      );
      setExpanded(initialExpandedPanels);
    }

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
      .catch(() => {
        console.log('errror');
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
    if (name === 'bien_id') {
      show_bien(value, index);
      storebien_en_proposition(value, index);
      pusher_function();
    }

    // Handle avance_res and other fields
    if (name === 'avance_res') {
      list[index]['reste'] = list[index]['prix_final'] - e.target.value;
    }
    if (name === 'sr') {
      list[index]['sr'] = e.target.checked;
    }
    if (name === 'check_montant') {
      list[index]['check_montant'] = e.target.checked;
    }

    // Update input_biens state
    setinput_biens(list);

    // Set the form value for list_bien_interesse
    setValue('list_bien_interesse', JSON.stringify(list));

    // Additional checks and updates
    if (
      list[index]['statut'] == 2 &&
      (list[index]['code_reservation'] === '' ||
        list[index]['bien_id'] === '' ||
        list[index]['prix'] === '' ||
        list[index]['date_reservation'] === '' ||
        Number(list[index]['avance_res']) < 0 || // Ensure it's treated as a number
        list[index]['mode_financement'] === '' ||
        list[index]['mode_paiement'] === '' ||
        (list[index]['check_montant'] === true &&
          list[index]['commentaireAvance'].length === 0) ||
        (Number(list[index]['avance_res']) === 0 &&
          list[index]['check_montant'] === false))
    ) {
      console.log('hop', list[index]);

      list[index]['check_save'] = false;
    } else {
      list[index]['check_save'] = true;
    }

    setCheck_save(true);

    input_biens.forEach((input) => {
      if (name === 'bien_id') {
        for (let j = 0; j <= Number(biensByProjet.length) - 1; j++) {
          if (biensByProjet[j].id === JSON.stringify(input.bien_id)) {
            biensByProjet[j].disabled = true;
          }
          if (list[index]['old_bien_id'] !== '') {
            if (biensByProjet[j].id === list[index]['old_bien_id']) {
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
        console.log('faaadwa');
        setCheck_save(false);
      }

      if (name === 'code_reservation') {
        if (value.length >= 3) {
          setInfo_reservation(null);
          setTimeout(() => {
            fetch_code_reservation(value, index);
          }, 2000);
        }
      }
    });

    if (name === 'prix_remise') {
      handlechangeprix_remise(value, index, null);
    }
    if (name === 'prix_forfetaire') {
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
        if (response && response.status === 422) {
          toast.error(response.data.error);
        }
      });
  };

  // First select: Source
  const handleSourceChange = (newValue) => {
    setValue('partenaire_id', ''); // Reset partenaire ID when source changes
    setValue('source_txt', newValue ? newValue.source : ''); // Set source ID
    setValue('source_id', newValue ? newValue.id : ''); // Set source ID
    setPartenaire_txt(null);
  };
  // Second select: Partenaire
  const handlePartenaireChange = (newValue) => {
    // setPartenaire_txt(newValue ? newValue : ''); // Set partenaire value
    setValue('partenaire_id', newValue ? newValue.id : ''); // Set partenaire ID
  };

  /*const handleChange_freins = (selectedValues) => {
    try {
      console.log('Changed:', selectedValues);

      const descriptions = selectedValues
        .map((item) => item?.description?.toLowerCase() || '')
        .join(', ');
      console.log('Descriptions:', descriptions);

      setValue('frein', descriptions);
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
  };
*/
  const handleChange_freins = (selectedValues) => {
    try {
      console.log('Changed:', selectedValues);
      const descriptions = selectedValues
        .map((item) => item?.description?.toLowerCase() || '')
        .join(', ');
      console.log('Descriptions:', descriptions);

      setValue('frein', descriptions);
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
  };
  const isDisabled =
    loading_form ||
    info_prix != null ||
    info_sup != null ||
    check_save == false ||
    (OldBiens_pre.length > 0 && !isOrigin) ||
    info_reservation != null ||
    open_D_P ||
    (watch('list_bien_transfere_vendu').length == 0 &&
      watch('interet') == 1 &&
      watch('nb_bien_added') == 0);

  return (
    <div>
      <Modal isVisible={open_D_P} onClose={() => handleCloseD_P()}>
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
          <Modal isVisible={true} onClose={() => setOpen_Dialog(false)}>
            <Modal_Propsepct_Exist
              info_client_1={info_client_1}
              id_appel={id_appel}
              id_visite={id_visite}
              client_prospect={client_prospect}
              onClose={() => setOpen_Dialog(false)}
            />
          </Modal>
        </>
      )}{' '}
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.VISITES}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} une Visite`}
          />
        </div>
        {(!isOrigin ||
          (isOrigin && OldBiens_pre.length > 0 && paper_exist == 1) ||
          (isOrigin &&
            OldBiens_pre.length == 0 &&
            !watch('loading_b_pre'))) && (
          <div className="p-6 mt-4 bg-white shadow-md rounded-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Client/Prospect Information */}
                <div className="col-span-3">
                  <h2
                    className="text-lg font-medium border-b pb-2 mb-4"
                    style={{ color: '#231651' }}
                  >
                    Informations du prospect
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {!isOrigin && (
                    <ProspectInformations
                      control={control}
                      watch={watch}
                      errors={errors}
                      backendErrors={backendErrors}
                      defaultValues={defaultValues}
                      formSubmitted={formSubmitted}
                      email_required={email_required}
                      loading={loading}
                      sources={sources}
                      handleSourceChange={handleSourceChange}
                      partenaires={partenaires}
                      handlePartenaireChange={handlePartenaireChange}
                      disabled_var={disabled_var}
                      selectedProspect={selectedProspect}
                      disabled_var_source={disabled_var_source}
                      partenaire_txt={partenaire_txt}
                      handleChange_event={handleChange_event}
                    />
                  )}
                </div>
                <div className="col-span-3 mt-4">
                  <h2
                    className="text-lg font-medium border-b pb-2 mb-4"
                    style={{ color: '#231651' }}
                  >
                    Informations de la visite
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {input_biens_vendu.length == 0 && (
                    <>
                      {watch('loading_b_pre') == false && (
                        <>
                          <div className="">
                            <AutocompleteSelectComponent
                              label="Intérêt :"
                              name="interet"
                              required={true}
                              //  options={VISITE_INTERETS}
                              options={
                                input_biens_vendu.length > 0
                                  ? {
                                      1: VISITE_INTERETS[1],
                                      // 3: VISITE_INTERETS[3],
                                    }
                                  : {
                                      1: VISITE_INTERETS[1],
                                      2: VISITE_INTERETS[2],
                                      3: VISITE_INTERETS[3],
                                    }
                              }
                              disabled={watch('telephone') == ''}
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
                                    Number(watch('interet')) === 1 &&
                                    !watch('nb_bien_added')
                                      ? 'Ce champ est obligatoire lorsque interet est Intéressé.'
                                      : null,
                                }}
                                backendErrors={backendErrors}
                                defaultValues={defaultValues}
                                onChange={handleChange_NbrBien}
                                required={Number(watch('interet')) === 1}
                              />
                            </>
                          )}
                        </>
                      )}
                      {isOrigin && display_cin && display_cin_1 && (
                        <div>
                          <TextField
                            label="Cin:"
                            name="cin"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            onChange={handleChange_event('cin')}
                            required={Number(watch('interet')) === 1}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {Number(watch('interet')) === 2 && (
                    <>
                      <div className="">
                        <AutocompleteSelectComponent
                          label="Mode Relance:"
                          name="mode_relance"
                          required={false}
                          options={VISITE_TYPE_NOTIF}
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
                  {Number(watch('interet')) === 3 && (
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
                      handleChange_freins={handleChange_freins}
                      handlePrixChange={handlePrixChange}
                      setValue={setValue}
                      info_prix={info_prix}
                      info_sup={info_sup}
                      isEditMode={false} // Specify the mode here
                    />
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
                          onClick={handleAccordionChange(`panel_bienn${j + 1}`)}
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
                                            x.sr === true
                                              ? 'text-purple-600'
                                              : ''
                                          }`}
                                        >
                                          Sr:
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
                                      label="Prix Remisé:"
                                      name="prix_remise"
                                      type="number"
                                      value={x.prix_remise}
                                      onChange={(e) =>
                                        handleinputchange_bien_vendu(e, j)
                                      }
                                    />
                                    <InputField_Biens
                                      label="Prix Forfaitaire:"
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
                                      onChange={(e) =>
                                        handleinputchange_bien_vendu(e, j)
                                      }
                                    />
                                    <AutocompleteStatut_ModeRelance_Biens
                                      name={'mode_financement'}
                                      label={'Mode Financement:'}
                                      placeholder={
                                        'Sélectionner un Mode de Financement'
                                      }
                                      code="code"
                                      labelKey="label"
                                      options={Object.values(MODE_FINANCE)}
                                      value={x.mode_financement}
                                      onChange={(e) =>
                                        handleinputchange_bien_vendu(e, j)
                                      }
                                      required
                                    />{' '}
                                    <AutocompleteStatut_ModeRelance_Biens
                                      name={'mode_paiement'}
                                      label={'Mode Paiement:'}
                                      placeholder={
                                        'Sélectionner un Mode de Paiement'
                                      }
                                      options={Object.values(MODE_PAIEMENT)}
                                      value={x.mode_paiement}
                                      code="code"
                                      labelKey="label"
                                      onChange={(e) =>
                                        handleinputchange_bien_vendu(e, j)
                                      }
                                      required
                                    />
                                    {/* Conditional Fields */}
                                    {x.mode_paiement !== 1 &&
                                      x.mode_paiement !== '' && (
                                        <>
                                          <AutocompleteStatut_ModeRelance_Biens
                                            name={'banque_id'}
                                            label={'Banque:'}
                                            placeholder={
                                              'Sélectionner un Mode de Paiement'
                                            }
                                            options={banques}
                                            value={x.banque_id}
                                            required={x.mode_paiement !== 1}
                                            code="id"
                                            labelKey="nom"
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                          />
                                          <InputField_Biens
                                            label="N° Paiment:"
                                            name="numero_paiement"
                                            type="number"
                                            required={x.mode_paiement !== 1}
                                            value={x.numero_paiement}
                                            onChange={(e) =>
                                              handleinputchange_bien_vendu(e, j)
                                            }
                                          />
                                        </>
                                      )}
                                    {x.mode_paiement !== '' &&
                                      x.mode_paiement !== 1 &&
                                      x.mode_paiement !== 5 &&
                                      x.mode_paiement !== 6 && (
                                        <InputField_Biens
                                          label="Date Échéance:"
                                          name="echeance"
                                          required={x.mode_paiement !== 1}
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
                                                x.check_montant === true
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
                            <AutocompleteSelectComponent
                              label="Intérêt :"
                              name="interet"
                              required={true}
                              //  options={VISITE_INTERETS}
                              options={
                                input_biens_vendu.length > 0
                                  ? {
                                      1: VISITE_INTERETS[1],
                                      // 3: VISITE_INTERETS[3],
                                    }
                                  : {
                                      1: VISITE_INTERETS[1],
                                      2: VISITE_INTERETS[2],
                                      3: VISITE_INTERETS[3],
                                    }
                              }
                              disabled={watch('telephone') == ''}
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
                                    Number(watch('interet')) === 1 &&
                                    !watch('nb_bien_added')
                                      ? 'Ce champ est obligatoire lorsque interet est Intéressé.'
                                      : null,
                                }}
                                backendErrors={backendErrors}
                                defaultValues={defaultValues}
                                onChange={handleChange_NbrBien}
                                required={Number(watch('interet')) === 1}
                              />
                            </>
                          )}
                        </>
                      )}
                      {isOrigin && display_cin && display_cin_1 && (
                        <div>
                          <TextField
                            label="Cin:"
                            name="cin"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            defaultValues={defaultValues}
                            onChange={handleChange_event('cin')}
                            required={Number(watch('interet')) === 1}
                          />
                        </div>
                      )}
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
                        <div className="border mt-4 rounded-md  shadow">
                          <button
                            type="button"
                            className="w-full flex justify-between items-center px-4 py-3  text-white text-base font-medium focus:outline-none"
                            style={{
                              background:
                                'rgb(35 22 81 / var(--tw-text-opacity, 1))',
                            }}
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {/* Bien Autocomplete */}
                                  <div>
                                    {/* Replace with your own Autocomplete or HeadlessUI */}
                                    <AutocompleteBien
                                      x={x}
                                      i={i}
                                      user={user}
                                      biensByProjet={biensByProjet}
                                      handleinputchange={handleinputchange}
                                      loading={loading_bien}
                                    />
                                  </div>

                                  {/* Statut */}
                                  <div>
                                    <AutocompleteStatut_ModeRelance_Biens
                                      name={'statut'}
                                      label={'statut'}
                                      placeholder={'Sélectionner un statut'}
                                      options={Object.values(
                                        VISITE_STATUT_FORM
                                      )}
                                      value={x.statut}
                                      code="code"
                                      labelKey="label"
                                      onChange={(e) => handleinputchange(e, i)}
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
                                        <AutocompleteStatut_ModeRelance_Biens
                                          name={'mode_relance'}
                                          label={'Mode de Relance'}
                                          placeholder={
                                            'Sélectionner un Mode de Relance'
                                          }
                                          options={Object.values(
                                            VISITE_TYPE_NOTIF
                                          )}
                                          code="code"
                                          labelKey="label"
                                          value={x.mode_relance}
                                          onChange={(e) =>
                                            handleinputchange(e, i)
                                          }
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
                                      onChange={(e) => handleinputchange(e, i)}
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
                                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-center rounded">
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
                                              x.sr === true
                                                ? 'text-purple-600'
                                                : ''
                                            }`}
                                          >
                                            Sr:
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
                                        label="Prix Remisé:"
                                        name="prix_remise"
                                        type="number"
                                        value={x.prix_remise}
                                        onChange={(e) =>
                                          handleinputchange(e, i)
                                        }
                                      />
                                      <InputField_Biens
                                        label="Prix Forfaitaire:"
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
                                        onChange={(e) =>
                                          handleinputchange(e, i)
                                        }
                                      />
                                      <AutocompleteStatut_ModeRelance_Biens
                                        name={'mode_financement'}
                                        label={'Mode Financement:'}
                                        placeholder={
                                          'Sélectionner un Mode de Financement'
                                        }
                                        code="code"
                                        labelKey="label"
                                        options={Object.values(MODE_FINANCE)}
                                        value={x.mode_financement}
                                        onChange={(e) =>
                                          handleinputchange(e, i)
                                        }
                                        required
                                      />{' '}
                                      <AutocompleteStatut_ModeRelance_Biens
                                        name={'mode_paiement'}
                                        label={'Mode Paiement:'}
                                        placeholder={
                                          'Sélectionner un Mode de Paiement'
                                        }
                                        options={Object.values(MODE_PAIEMENT)}
                                        value={x.mode_paiement}
                                        code="code"
                                        labelKey="label"
                                        onChange={(e) =>
                                          handleinputchange(e, i)
                                        }
                                        required
                                      />
                                      {/* Conditional Fields */}
                                      {x.mode_paiement !== 1 &&
                                        x.mode_paiement !== '' && (
                                          <>
                                            <AutocompleteStatut_ModeRelance_Biens
                                              name={'banque_id'}
                                              label={'Banque:'}
                                              placeholder={
                                                'Sélectionner un Mode de Paiement'
                                              }
                                              options={banques}
                                              value={x.banque_id}
                                              required={x.mode_paiement !== 1}
                                              code="id"
                                              labelKey="nom"
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                            />
                                            <InputField_Biens
                                              label="N° Paiment:"
                                              name="numero_paiement"
                                              type="number"
                                              required={x.mode_paiement !== 1}
                                              value={x.numero_paiement}
                                              onChange={(e) =>
                                                handleinputchange(e, i)
                                              }
                                            />
                                          </>
                                        )}
                                      {x.mode_paiement !== '' &&
                                        x.mode_paiement !== 1 &&
                                        x.mode_paiement !== 5 &&
                                        x.mode_paiement !== 6 && (
                                          <InputField_Biens
                                            label="Date Échéance:"
                                            name="echeance"
                                            required={x.mode_paiement !== 1}
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
                                                  x.check_montant === true
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
                                          x.check_montant == true ? true : false
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
                {(Number(watch('interet')) === 2 ||
                  Number(watch('interet')) === 3) && (
                  <div className="flex-1 mt-4">
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
                )}
              </div>
              <div className="flex justify-center gap-4 items-center mt-6 mb-6">
                <Button type="button" onClick={() => router.back()}>
                  Annuler
                </Button>
                {/*isDisabled && (
                  <ul className="text-sm text-red-500 mt-2">
                    {loading_form && <li>Chargement du formulaire</li>}
                    {info_prix && <li>Conflit information sur le prix</li>}
                    {info_sup && <li>Conflit information supplémentaire</li>}
                    {check_save == false && (
                      <li>Vérification de sauvegarde non validée</li>
                    )}
                    {OldBiens_pre.length > 0 && !isOrigin && (
                      <li>Ancien bien transféré non original</li>
                    )}
                    {info_reservation && <li>Bien déjà réservé</li>}
                    {open_D_P && <li>Fenêtre D_P ouverte</li>}
                    {watch('list_bien_transfere_vendu').length === 0 &&
                      watch('interet') == 1 &&
                      watch('nb_bien_added') == 0 && (
                        <li>Aucun bien transféré ou ajouté</li>
                      )}
                  </ul>
                )*/}
                <Button
                  type="submit"
                  disabled={isDisabled}
                  loading={loading_form}
                >
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      {watch('loading_b_pre') && isOrigin ? (
        <LoadingSpin />
      ) : (
        ((watch('loading_b_pre') === true && !isOrigin) ||
          (isOrigin && OldBiens_pre.length > 0)) && (
          <div className="p-3">
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
                          Ce Client à déja des Pré Réservations des biens
                          suivant :
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
                                onChange={(e) =>
                                  handle_action_change(e, i, null)
                                }
                                name="propriete"
                                className="block w-[70%] p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                            <div className="sm:col-span-1 ml-5">
                              <p className="text-base font-medium">
                                Action du Pré Réservation Bien {i + 1}:
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  value="1"
                                  className={`py-1 px-2 rounded-md ${
                                    x.action === '1'
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
                                    x.action === '2'
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
                                    x.action === '3'
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
        )
      )}
    </div>
  );
};

export default VisiteForm;
