import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { fetchData_Select } from '../../../../../src/configs/api-utils';

import BreadCrumb from '../../navigation/BreadCrumb';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import AutocompleteMultiple from '@/components/AutocompleteMultiple';

import Autocomplete from '@/components/Autocomplete';

import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import Modal_Propsepct_Exist from '../visites/Modal_Propsepct_Exist';

import {
  VISITE_INTERETS,
  VISITE_TYPE_NOTIF,
  getInteret_label,
  TYPES_APPELS,
  ORIENTATIONS,
  ORIENTATION_ABBREVIATIONS,
} from '@/configs/enum';
import { getStoredPerson } from '@/components/storageHelpers';
import useClearProspect from '../hook/useClearProspect';
import useClearProspectAppel from '../hook/useClearProspectAppel';

export default function AppelsForm({ id }) {
  const { token } = useAuth();
  const router = useRouter();
  useClearProspect();
  useClearProspectAppel();

  const [info_cin, setInfo_cin] = useState(null);
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);
  const [prospect_id, setProspect_id] = useState(null);

  const accessToken = token || localStorage.getItem('accessToken');

  //dialog
  const [info_client, setInfo_client] = useState(null);
  const [disabled_var, setDisabled_var] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [open_dialog, setOpen_Dialog] = useState(false);
  const [client_prospect, setClient_prospect] = useState(null);
  const [id_appel, setId_appel] = useState(null);
  const [id_visite, setId_visite] = useState(null);
  const [info_prix, setInfo_prix] = useState(null);
  const [info_sup, setInfo_sup] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState({});

  const [PROJETS, setProjets] = useState([]);
  const [SOURCES, setSources] = useState([]);
  const [source, setSource] = useState('');
  const [list_partenaires, setList_Partenaires] = useState([]);
  const [partenaire, setPartenaire] = useState('');
  const [tranches, setTranches] = useState([]);
  const [blocs, setBlocs] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [list_etages, setList_etages] = useState([]);
  const [type_freins, setType_freins] = useState([]);
  const [list_typologies, setListTyplogies] = useState([]);
  const [list_vues, setList_Vues] = useState([]);
  const [list_type_biens, setListType_biens] = useState([]);

  //edit

  const { person: selectedPerson, type: personType } = getStoredPerson();
  const orientationOptions = Object.keys(ORIENTATIONS).map((key) => ({
    code: ORIENTATIONS[key].code,
    label: ORIENTATIONS[key].label,
    description: ORIENTATIONS[key].description,
    key: key,
  }));

 // Safely get and parse the prospect data
const getProspectFromStorage = () => {
  try {
    const storedData = localStorage.getItem('selectedProspect_appel');
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    return parsedData?.prospect || null;
  } catch (error) {
    console.error("Error parsing prospect data:", error);
    return null;
  }
};

const prospect_appel = getProspectFromStorage();

  const defaultValues = {
    id_t_appel: '',
    prospect_id:
      personType === 'prospect'
        ? selectedPerson?.id
        : personType === 'client'
        ? selectedPerson?.prospect_id
        : prospect_appel != ''
        ? prospect_appel?.id
        : '',
    client_id: personType === 'client' ? selectedPerson?.id : '',
    cin: selectedPerson?.cin || prospect_appel?.cin || '',
    nom: selectedPerson?.nom || prospect_appel?.nom || '',
    email: selectedPerson?.email || prospect_appel?.email || '',
    prenom: selectedPerson?.prenom || prospect_appel?.prenom || '',
    telephone:
      personType === 'prospect'
        ? selectedPerson?.telephone
        : personType === 'client'
        ? selectedPerson?.telephone_num1
        : prospect_appel != ''
        ? prospect_appel?.telephone
        : '',
    telephone_num2:
      selectedPerson?.telephone_num2 || prospect_appel?.telephone_num2 || null,
    ville: selectedPerson?.ville || prospect_appel?.ville || '',
    notifie: selectedPerson?.notifie || prospect_appel?.notifie || '',
    source: selectedPerson?.source?.id || prospect_appel?.source?.id || '',
    source_txt:
      selectedPerson?.source?.source || prospect_appel?.source?.source || '',
    partenaire_id:
      selectedPerson?.partenaire_id || prospect_appel?.partenaire_id || '',
    partenaire_txt:
      selectedPerson?.partenaire?.description ||
      prospect_appel?.partenaire?.description ||
      '',
    interet: '',
    type_appel: '',
    type_biens: '',
    projet_id:
      selectedPerson?.projet_id ||
      prospect_appel?.projet_id ||
      '',
    date_relance: '',
    mode_relance: '',
    tranche_id: '',
    bloc_id: '',
    immeuble_id: '',
    etage: '',
    orientation: '',
    rdv: '',
    freins: [],
    tranches_id: [],
    etages: [],
    orientations: [],
    avance: '',
    typologies: [],
    vues: [],
    commentaire: null,
    prix_max: '',
    prix_min: '',
    sup_min: '',
    sup_max: '',
  };
  const validationSchemaRef = useRef(
    yup.object().shape({
      telephone: yup
        .string()
        .required('Le num de telephone est requis')
        .matches(/^\d*$/, 'Seulement des chiffres') // allow only digits if filled
        .min(10, 'Minimum 10 chiffres')
        .max(14, 'Maximum 14 chiffres'),
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
      type_appel: yup.string().required("Le Type d'appel est Obligatoire"),
      interet: yup.string().required("L'interet est Obligatoire"),
      projet_id: yup.string().required('Le Projet est Obligatoire'),
      source: yup.string().required('Le Source est Obligatoire'),
    })
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });
  const isEditing = !!id;
  useEffect(() => {
    if (isEditing) {
      axios
        .get(`${APIURL.ROOTV1}/show_t_appel/` + id, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) router.back();
          const tr_appel = res.data.tr_appel;
          const frein_n = res.data.frein;
          let intere_label = getInteret_label(tr_appel.interet);

          if (Array.isArray(tr_appel.type_biens)) {
            const selectedIds = tr_appel.type_biens.map(
              (option) => option?.type_bien_id
            );
            setValue('type_biens', selectedIds); // Set only IDs to the form field
          }
          setFormData((prevFormData) => ({
            ...prevFormData,
            nom: tr_appel.appel.prospect.nom || '',
            cin: tr_appel.appel.prospect.cin || '',
            prenom: tr_appel.appel.prospect.prenom || '',
            prospect_id: tr_appel?.appel?.prospect?.id || '',
            telephone: tr_appel?.appel?.prospect?.telephone || '',
            telephone_num2: tr_appel?.appel?.prospect?.telephone_num2 || '',
            ville: tr_appel.appel.prospect.ville || '',
            interet: tr_appel.interet || '',
            type_appel: tr_appel.type_appel || '',
            projet_id: tr_appel.appel.projet_id || '',
            source: tr_appel.appel.prospect.source?.id || '',
            source_txt:
              tr_appel.appel.prospect?.source?.source === 'Partenaire'
                ? 'Partenaire'
                : null,
            partenaire_id: tr_appel.appel.prospect?.partenaire_id || '',
            date_relance: tr_appel.relance?.date_relance || '',
            mode_relance: tr_appel.relance?.mode_relance || '',
            tranche_id: tr_appel.tranche_id || '',
            bloc_id: tr_appel.bloc_id || '',
            immeuble_id: tr_appel.immeuble_id || '',
            etage: tr_appel.etage || '',
            orientation: tr_appel.orientation || '',
            rdv: tr_appel.rdv?.rdv || '',
            avance: frein_n?.avance || '',
            commentaire: tr_appel.commentaire || '',
            prix_max: frein_n?.prix_max || '',
            prix_min: frein_n?.prix_min || '',
            sup_min: frein_n?.superficie_min || '',
            sup_max: frein_n?.superficie_max || '',
          }));

          fetchPartenaires(tr_appel.appel.projet.id);
          fetch_data_by_projetId(tr_appel.appel.projet.id);
          fetch_type_biens(tr_appel.appel.projet.id);
          setSource(tr_appel.appel.prospect.source?.source);
          setPartenaire(tr_appel.appel.prospect?.partenaire?.id);
          let freinValue = [];
          if (intere_label == 'Perdu') {
            fetch_type_Freins();
            fetch_vues(tr_appel.appel.projet.id);
            fetch_typologies(tr_appel.appel.projet.id);

            if (frein_n != null) {
              if (frein_n.frein_etage.length > 0) {
                const etages = frein_n.frein_etage.map((item) => item.etage);
                setValue('etages', etages);
                freinValue.push('etage');
              }

              if (frein_n.frein_vue.length > 0) {
                const vues = frein_n.frein_vue.map((item) => item.vue);
                setValue('vues', vues);
                freinValue.push('vue');
              }

              if (frein_n.frein_typologie.length > 0) {
                const typologies = frein_n.frein_typologie.map(
                  (item) => item.typologie
                );
                setValue('typologies', typologies);
                freinValue.push('typologie');
              }

              if (frein_n.frein_tranche.length > 0) {
                const tranches = frein_n.frein_tranche.map(
                  (item) => item.tranche
                );
                setValue('tranches_id', tranches);
                freinValue.push('tranche');
              }

              if (frein_n.frein_orientation.length > 0) {
                const firstLetterToCode = {
                  N: ORIENTATIONS[1].code, // Nord
                  S: ORIENTATIONS[2].code, // Sud
                  E: ORIENTATIONS[3].code, // Est
                  O: ORIENTATIONS[4].code, // Ouest
                  N_E: ORIENTATIONS[5].code, // Ouest
                  N_o: ORIENTATIONS[6].code, // Ouest
                  S_E: ORIENTATIONS[7].code, // Ouest
                  S_O: ORIENTATIONS[8].code, // Ouest
                };

                const orientations = frein_n.frein_orientation.map((item) => {
                  const letter = item.orientation
                    ?.trim()
                    .charAt(0)
                    .toUpperCase();
                  return firstLetterToCode[letter];
                });

                setValue('orientations', orientations);
                freinValue.push('orientation');
              }
              if (frein_n.prix_min != null || frein_n.prix_max != null) {
                setValue('prix_min', frein_n?.prix_min || '');
                setValue('prix_max', frein_n?.prix_max || '');
                freinValue.push('prix');
              }

              if (
                frein_n?.superficie_min != null ||
                frein_n?.superficie_max != null
              ) {
                setValue('sup_min', frein_n?.superficie_min || '');
                setValue('sup_max', frein_n?.superficie_max || '');
                freinValue.push('superficie');
              }

              if (frein_n?.avance != null) {
                setValue('avance', frein_n?.avance);
                freinValue.push('avance');
              }

              // Finally set the 'frein' array:
              setValue('freins', freinValue);
              console.log('list==>' + freinValue);
            }
          }
        })

        .catch((error) => console.log(error.message));
    } else {
      validationSchemaRef.current = validationSchemaRef.current.shape({
        ...validationSchemaRef.current.fields,
      });
      reset(defaultValues, {
        errors: true,
        dirtyFields: true,
        isDirty: true,
      });
    }
  }, [isEditing, reset, router]);

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => setValue(key, value));
    }
  }, [formData]);

  const fetchPartenaires = async (projet_id) => {
    await axios
      .get(`${APIURL.ROOTV1}/get_partenaires/` + projet_id, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setList_Partenaires(res.data.partenaires);
      })
      .catch(() => {});
  };
  const fetchSources = async () => {
    await axios
      .get(`${APIURL.ROOTV1}/get_sources`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setSources(res.data.sources);
      })
      .catch(() => {});
  };

  const fetch_typologies = async (projetId) => {
    await axios
      .get(`${APIURL.ROOTV1}/get_typologiesByProjet/` + projetId, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setListTyplogies(res.data.typologies);
      })
      .catch(() => {});
  };

  const fetch_type_biens = async (projetId) => {
    setListType_biens([]);
    await axios
      .get(`${APIURL.ROOTV1}/get_typeBiensByProjet/` + projetId, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setListType_biens(res.data.typeBiens);
      })
      .catch(() => {});
  };

  const fetch_vues = async (projetId) => {
    await axios
      .get(`${APIURL.ROOTV1}/get_vuesByProjet/` + projetId, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setList_Vues(res.data.vues);
      })
      .catch(() => {});
  };

  const fetch_type_Freins = async () => {
    setLoading_tp_frein(true);
    await axios
      .get(`${APIURL.ROOTV1}/get_typeFreins`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setType_freins(res.data.typeFreins);
        setLoading_tp_frein(false);
      })
      .catch(() => {});
  };
  useEffect(() => {
    fetchData_Select('projets', setProjets, setLoading);
    fetchSources();
  }, []);

  // 1) Extract all your checks into a single function
  const validateFields = () => {
    let valid = true;

    // Partenaire required if source_txt is 'Partenaire'
    if (watch('source_txt') == 'Partenaire' && !watch('partenaire_id')) {
      valid = false;
      console.error('Partenaire obligatoire');
    }

    if (Number(watch('interet')) == 1) {
      if (!watch('type_biens')) {
        valid = false;
        console.error('Type Biens Obligatoire');
      }
      if (!watch('orientation')) {
        valid = false;
        console.error('Orientation Obligatoire');
      }
    }
    // If interet == 3, then all those frein checks
    if (Number(watch('interet')) == 3) {
      const frein = watch('freins') || [];
      const checks = [
        frein.length > 0,
        !frein.includes('vue') || (watch('vues') || []).length > 0,
        !frein.includes('typologie') || (watch('typologies') || []).length > 0,
        !frein.includes('orientation') ||
          (watch('orientations') || []).length > 0,
        !frein.includes('etage') || (watch('etages') || []).length > 0,
        !frein.includes('tranche') || (watch('tranches_id') || []).length > 0,
      ];

      const checkNames = [
        'frein.length > 0',
        "'vue' => vues.length > 0",
        "'typologie' => typologies.length > 0",
        "'orientation' => orientations.length > 0",
        "'etage' => etages.length > 0",
        "'tranche' => tranches_id.length > 0",
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
      return;
    }
    setLoading({ ...loading, form: true });
    setIsSubmitting(true);
    setBackendErrors({});

    // Enhanced field handler that properly handles untouched multi-select fields
    const handleField = (value) => {
      if (value === null || value === undefined) return null;

      // Handle array case
      if (Array.isArray(value)) {
        // If array contains objects with 'id' property, extract IDs
        if (value.length > 0 && value[0]?.id) {
          return value.map((item) => item.id).join(',');
        }
        return value.join(',');
      }

      // Handle object case (when field wasn't touched in edit mode)
      if (typeof value === 'object' && value !== null) {
        return ''; // Return empty string for untouched fields
      }

      // Handle string case (including "[object Object]")
      if (typeof value === 'string') {
        return value.startsWith('[object Object]') ? '' : value;
      }

      return value;
    };

    // Prepare the data structure
    const preparedData = {
      ...data,
      // Handle all fields that might be multi-select
      freins: Array.isArray(data.freins)
        ? data.freins.join(', ')
        : typeof data.freins === 'string'
        ? data.freins
        : '',
      tranches_id: handleField(data.tranches_id),
      etages: handleField(data.etages),
      orientations: handleField(data.orientations),
      typologies: handleField(data.typologies),
      vues: handleField(data.vues),
      type_biens: handleField(data.type_biens),
    };

    // For editing mode transformations
    if (isEditing) {
      // Safely map orientation IDs to N/S/E/W codes
      if (preparedData.orientations && preparedData.orientations !== '') {
        const codes = String(preparedData.orientations)
          .split(',')
          .map((s) => {
            const num = parseInt(s.trim(), 10);
            return isNaN(num) ? '' : num;
          })
          .filter((i) => ORIENTATIONS[i])
          .map((i) => ORIENTATION_ABBREVIATIONS[ORIENTATIONS[i].label] || '')
          .filter(Boolean);

        preparedData.orientations = codes.length ? codes.join(',') : '';
      }

      // Normalize freins format
      if (preparedData.freins) {
        preparedData.freins = preparedData.freins
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
          .join(', ');
      }
    }

    // Create payload
    const payload = { ...preparedData };

    // For debugging
    console.log('Final payload:', payload);

    axios({
      method: isEditing ? 'put' : 'post',
      url: isEditing ? `${APIURL.APPELS}/${id}` : APIURL.APPELS,
      data: payload,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          const message = `Appel a été ${
            isEditing ? 'modifiée' : 'créée'
          } avec succès`;
          reset(defaultValues);
          toast.success(message);
          router.push(ENDPOINTS.APPELS);
          localStorage.removeItem('selectedProspect_appel');
          localStorage.removeItem('selectedProspect');
          localStorage.removeItem('selectedClient');
        } else if (res.status === 422) {
          setBackendErrors(res.data.errors);
          setTimeout(() => setBackendErrors({}), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response && response.status === 422) {
          setBackendErrors(response.data.errors);
          setTimeout(() => setBackendErrors({}), 5000);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const fetch_event_by_param = async (route, value, param) => {
    await axios
      .get(`${APIURL.ROOTV1}/` + route + `/` + param + `/` + value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setInfo_client(null);
        setClient_prospect(null);
        setId_appel(null);
        setId_visite(null);
        var prospect_id,
          cin,
          nom,
          prenom,
          ville,
          tel,
          tel_2,
          source_id,
          source,
          partenaire_id,
          partenaire_txt = null;

        if (res.data.prospect != null || res.data.client != null) {
          if (
            (res.data.client != null && res.data.prospect != null) ||
            (res.data.client != null && res.data.prospect == null)
          ) {
            prospect_id = res.data.client.prospect_id || res.data.prospect_id;
            cin = res.data.client.cin || res.data.prospect.cin;
            nom = res.data.client.nom || res.data.prospect.nom;
            prenom = res.data.client.prenom || res.data.prospect.prenom;
            ville = res.data.client.ville || res.data.prospect.ville;
            tel = res.data.client.telephone_num1 || res.data.prospect.telephone;
            tel_2 =
              res.data.client.telephone_num2 ||
              res.data.prospect.telephone_num2;
            source_id =
              res.data.client.prospect?.source?.id ||
              res.data.prospect.source?.id;
            source =
              res.data.client.prospect?.source?.source ||
              res.data.prospect.source?.source;
            partenaire_id =
              res.data.client.prospect?.partenaire_id ||
              res.data.prospect.partenaire_id;
            partenaire_txt =
              res.data.client.prospect?.partenaire?.description ||
              res.data.prospect.partenaire.description;
            setInfo_client(
              (res.data.client?.nom || res.data.prospect?.nom || '') +
                ' ' +
                (res.data.client?.prenom || res.data.prospect?.prenom || '')
            );
            setClient_prospect('Est un client');
          } else {
            prospect_id = res.data.prospect.id;
            cin = res.data.prospect.cin;
            nom = res.data.prospect.nom;
            prenom = res.data.prospect.prenom;
            tel = res.data.prospect.telephone;
            tel_2 = res.data.prospect.telephone_num2;
            ville = res.data.prospect.ville;
            source_id = res.data.prospect.source?.id;
            source = res.data.prospect.source?.source;
            partenaire_id = res.data.prospect?.partenaire_id;
            partenaire_txt = res.data.prospect?.partenaire?.description;

            setInfo_client(
              res.data.prospect.nom + ' ' + res.data.prospect.prenom
            );
            setClient_prospect('Est un prospect');
          }
          setOpen_Dialog(true);

          setValue('prospect_id', prospect_id);
          setValue('nom', nom);
          setValue('cin', cin);
          setValue('prenom', prenom);
          setValue('telephone', tel);
          if (tel_2 != null) {
            setValue('telephone_num2', tel_2);
          } else {
            setValue('telephone_num2', null);
          }
          setValue('ville', ville);
          setSource(source);
          setPartenaire(partenaire_txt);
          setValue('source', source_id);
          if (source == 'Partenaire') {
            setValue('source_txt', 'Partenaire');
          } else {
            setValue('source_txt', null);
          }
          setValue('partenaire_id', partenaire_id);

          if (res.data.prospect.appels != null) {
            setId_appel(res.data.prospect.appels?.id);
          }
          if (res.data.prospect.visites.length > 0) {
            setId_visite(res.data.prospect.visites[0].id);
          }
        } else {
          defaultValues['prospect_id'] = null;
          setOpen_Dialog(false);
        }
      })
      .catch(() => {});
  };

  const fetch_cin_unique = async (value) => {
    await axios
      .get(
        `${APIURL.ROOTV1}/get_info_cin_unique/` + prospect_id + '/' + value,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((res) => {
        setInfo_cin(null);
        setDisabled_var(false);
        if (res.data.prospect_count > 0) {
          setInfo_cin(
            'Le Cin que vous avez saisi appartient à un autre prospect'
          );
          setDisabled_var(true);
        } else {
          setInfo_cin(null);
          setDisabled_var(false);
        }
      })
      .catch(() => {});
  };

  const handleChange_event = (name) => (event) => {
    if (name == 'cin') {
      const timeout = setTimeout(() => {
        if (event.target.value.length >= 3) {
          fetch_event_by_param(
            'search_prospect_by_param',
            event.target.value,
            'cin'
          );
          if (isEditing) {
            fetch_cin_unique(event.target.value);
          }
        }
      }, 3000);

      return () => clearTimeout(timeout);
    } else if (name == 'telephone' || name == 'telephone_num2') {
      const timeout = setTimeout(() => {
        if (event.target.value.length >= 10) {
          fetch_event_by_param(
            'search_prospect_by_param',
            event.target.value,
            'tel'
          );
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  };
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

  const fetch_data_by_projetId = async (projet_id) => {
    setTranches([]);
    setBlocs([]);
    setImmeubles([]);
    setList_etages([]);
    await axios
      .get(`${APIURL.PROJETS}/` + projet_id, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setTranches(res.data.projet.tranche);
        setBlocs(res.data.projet.bloc);
        setImmeubles(res.data.projet.immeuble);
        const array_etages = [];
        if (res.data.projet.max_etages > 0) {
          for (var i = 0; i <= res.data.projet.max_etages; i++) {
            if (i == 0) {
              array_etages.push({ id: i + 1, value: '0' });
            } else {
              array_etages.push({ id: i + 1, value: i });
            }
          }
        }
        setList_etages(array_etages);
      })
      .catch(() => {});
  };

  const handleChange_interet = (code) => {
    if (code) {
      setValue('interet', code);
      if ((code == 1 || code == 3) && watch('projet_id') == '') {
        toast.error('Veuillez Choisir un Projet');
      }
      setValue('mode_relance', '');
      setValue('date_relance', '');
      setValue('rdv', '');
      if (code == 3) {
        fetch_type_Freins();
        fetch_vues(watch('projet_id'));
        fetch_typologies(watch('projet_id'));
      }
    }
  };

  const handleChange_freins = (selectedValues) => {
    try {
      const descriptions = selectedValues
        .map((item) => item?.description?.toLowerCase() || '')
        .join(', ');

      setValue('freins', descriptions);
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
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
      {open_dialog == true && (
        <>
          <Modal_Propsepct_Exist
            info_client_1={info_client}
            id_appel={id_appel}
            id_visite={id_visite}
            client_prospect={client_prospect}
            onClose={() => setOpen_Dialog(false)}
          />
        </>
      )}
      <div className="">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.APPELS}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} Appel`}
          />
        </div>
      </div>
      <div className="p-6  mt-4 min-h-[89vh] bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {info_cin && (
              <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded">
                <p>{info_cin}</p>
              </div>
            )}
            <div className="col-span-3">
              <h2
                className="text-lg font-medium border-b pb-2 mb-4"
                style={{ color: '#231651' }}
              >
                Informations du prospect
              </h2>
            </div>
            {/* First set of fields (Responsive grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <TextField
                label="Nom:"
                name="nom"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <TextField
                label="Prénom:"
                name="prenom"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <TextField
                label="Cin:"
                name="cin"
               // required={Number(watch('interet')) == 1}
                control={control}
                errors={errors}
                /*errors={{
                  ...errors,
                  cin:
                    formSubmitted && (Number(watch('interet')) == 1) == 1
                      ? 'Ce champ est obligatoire lorsque interet est interessé.'
                      : null,
                }}*/
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handleChange_event('cin')}
              />
              <TextField
                label="Téléphone:"
                required
                name="telephone"
                type="number"
                disabled={disabled_var}
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handleChange_event('telephone')}
              />

              <TextField
                label={'Téléphone 2:'}
                name="telephone_num2"
                type="number"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handleChange_event('telephone_num2')}
              />
              <TextField
                label="Ville:"
                name="ville"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <Autocomplete
                label="Projet:"
                required
                name="projet_id" // Name for field identification
                options={PROJETS}
                loading={loading}
                value={
                  PROJETS.find((opt) => opt.id == watch('projet_id')) || null
                }
                choix="nom"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setValue('projet_id', newValue ? newValue.id : '');
                  setValue('tranche_id', '');
                  setValue('bloc_id', '');
                  setValue('immeuble_id', '');
                  setValue('etage', '');
                  if (newValue?.id) {
                    fetchPartenaires(newValue.id);
                    fetch_data_by_projetId(newValue.id);
                    fetch_type_biens(newValue.id);
                  }
                }}
              />
              <AutocompleteSelectComponent
                label="Type Appel :"
                name="type_appel"
                value={watch('type_appel')}
                errors={errors}
                backendErrors={backendErrors}
                required={true}
                control={control}
                options={TYPES_APPELS}
                onChange={(code) => {
                  setValue('type_appel', code);
                }}
              />
              <Autocomplete
                label="Source:"
                required
                name="source" // Name for field identification
                options={SOURCES}
                loading={loading}
                choix="source"
                value={SOURCES.find((opt) => opt.id == watch('source')) || null}
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setSource(newValue ? newValue.source : '');
                  setValue('source', newValue ? newValue.id : '');

                  if (newValue?.source == 'Partenaire') {
                    setValue('source_txt', 'Partenaire');
                  } else {
                    setValue('source_txt', '');
                  }
                  if (
                    !watch('projet_id') &&
                    watch('source_txt', 'Partenaire')
                  ) {
                    toast.error('Veuillez Choisir un Projet');
                  }
                }}
              />
              {source?.toLowerCase() == 'partenaire' && (
                <Autocomplete
                  label="Partenaire:"
                  name="partenaire_id"
                  required={watch('source_txt') == 'Partenaire'}
                  options={list_partenaires}
                  value={
                    list_partenaires.find((opt) => opt.id == partenaire) || null
                  }
                  loading={loading}
                  choix="description"
                  control={control}
                  errors={{
                    ...errors,
                    partenaire_id:
                      // 1) required if email_required and empty on submit
                      formSubmitted &&
                      watch('source_txt') == 'Partenaire' &&
                      !watch('partenaire_id')
                        ? { message: 'Prtenaire est  obligatoire' }
                        : null,
                  }}
                  backendErrors={backendErrors}
                  onChange={(newValue) => {
                    setValue('partenaire_id', newValue ? newValue.id : ''); // Set partenaire ID
                  }}
                />
              )}
              {/* Intérêt (toujours visible) */}
              <div className="sm:col-span-1">
                <AutocompleteSelectComponent
                  label="Intérêt:"
                  name="interet"
                  value={watch('interet')}
                  required={true}
                  options={VISITE_INTERETS}
                  disabled={watch('telephone') == ''}
                  onChange={handleChange_interet}
                />
              </div>
            </div>
            {Number(watch('interet')) != '' &&
              Number(watch('interet')) != '4' && (
                <div className="col-span-3 mt-4">
                  <h2
                    className="text-lg font-medium border-b pb-2 mb-4"
                    style={{ color: '#231651' }}
                  >
                    Informations {"d'appel"}
                  </h2>
                </div>
              )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {/* Tranche et Bloc si interet == 1 */}
              {Number(watch('interet')) == 1 && (
                <>
                  <Autocomplete
                    label="Tranche:"
                    name="tranche_id"
                    options={tranches}
                    loading={loading}
                    value={
                      tranches.find((opt) => opt.id == watch('tranche_id')) ||
                      null
                    }
                    choix="nom"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    onChange={(newValue) => {
                      setValue('tranche_id', newValue ? newValue.id : '');
                    }}
                  />
                  <div className="mt-1">
                    <Autocomplete
                      label="Bloc:"
                      name="bloc_id"
                      value={
                        blocs.find((opt) => opt.id == watch('bloc_id')) || null
                      }
                      options={blocs}
                      loading={loading}
                      choix="nom"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      onChange={(newValue) => {
                        setValue('bloc_id', newValue ? newValue.id : '');
                      }}
                    />
                  </div>
                  <div className="mt-1">
                    <Autocomplete
                      label="Immeuble:"
                      name="immeuble_id"
                      options={immeubles}
                      value={
                        immeubles.find(
                          (opt) => opt.id == watch('immeuble_id')
                        ) || null
                      }
                      loading={loading}
                      choix="nom"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      onChange={(newValue) => {
                        setValue('immeuble_id', newValue ? newValue.id : '');
                      }}
                    />
                  </div>

                  <div className="mt-1">
                    <AutocompleteMultiple
                      label="Types Biens :"
                      name="type_biens"
                      required={true}
                      options={list_type_biens}
                      value={list_type_biens.filter((opt) =>
                        watch('type_biens')?.includes(opt.id)
                      )}
                      choiceKey="type"
                      onChange={(newValue) => {
                        try {
                          if (Array.isArray(newValue)) {
                            const selectedIds = newValue.map(
                              (option) => option?.id
                            );
                            console.log('ids tp b', selectedIds);
                            setValue('type_biens', selectedIds); // Set only IDs to the form field
                          } else {
                            console.error(
                              'Expected newValue to be an array of selected options, but received:',
                              newValue
                            );
                          }
                        } catch (error) {
                          console.error(
                            'Error in type biens onChange handler:',
                            error
                          );
                        }
                      }}
                      placeholder="sélectionnez un ou plusieurs Typologies"
                      errors={{
                        ...errors,
                        type_biens:
                          formSubmitted && Number(watch('interet')) == 1
                            ? "Ce champ est obligatoire lorsque 'interet' est 'interessé'."
                            : null,
                      }}
                      loading={loading}
                      backendErrors={backendErrors}
                    />
                  </div>
                  <div className="mt-1">
                    <AutocompleteSelectComponent
                      label="Orientation :"
                      name="orientation"
                      value={watch('orientation')}
                      errors={{
                        ...errors,
                        orientation:
                          formSubmitted && Number(watch('interet')) == 1
                            ? "Ce champ est obligatoire lorsque 'interet' est 'interessé'."
                            : null,
                      }}
                      backendErrors={backendErrors}
                      required={true}
                      control={control}
                      options={orientationOptions}
                      onChange={(code) => {
                        setValue('orientation', code);
                      }}
                    />
                  </div>

                  <div className="mt-1">
                    <Autocomplete
                      label="Etage:"
                      name="etage"
                      options={list_etages}
                      value={
                        list_etages.find(
                          (opt) => opt.value == Number(watch('etage'))
                        ) || null
                      }
                      loading={loading}
                      choix="value"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      onChange={(newValue) => {
                        setValue('etage', newValue ? newValue.value : '');
                      }}
                    />
                  </div>

                  <div className="mt-1">
                    <TextField
                      label="Rendez Vous:"
                      name="rdv"
                      value={watch('rdv')}
                      type="datetime-local"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      defaultValues={defaultValues}
                    />
                  </div>
                  <div className="mt-1">
                    <AutocompleteSelectComponent
                      label="Mode Relance:"
                      name="mode_relance"
                      value={watch('mode_relance')}
                      control={control}
                      options={VISITE_TYPE_NOTIF}
                      errors={errors}
                      backendErrors={backendErrors}
                      onChange={(code) => setValue('mode_relance', code)}
                    />
                  </div>
                  <div className="mt-1">
                    <TextField
                      label="Date Relance:"
                      name="date_relance"
                      type="date"
                      value={watch('mode_relance')}
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                      defaultValues={defaultValues}
                    />
                  </div>
                </>
              )}

              {/* Mode Relance et Date Relance si interet == 2 */}
              {Number(watch('interet')) == 2 && (
                <>
                  <AutocompleteSelectComponent
                    label="Mode Relance:"
                    name="mode_relance"
                    value={watch('mode_relance')}
                    control={control}
                    options={VISITE_TYPE_NOTIF}
                    errors={errors}
                    backendErrors={backendErrors}
                    onChange={(code) => setValue('mode_relance', code)}
                  />
                  <TextField
                    label="Date Relance:"
                    name="date_relance"
                    value={watch('date_relance')}
                    type="date"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </>
              )}
              {/*Perdu*/}

              {Number(watch('interet')) == 3 && (
                <>
                  <AutocompleteMultiple
                    label="Freins :"
                    name="freins"
                    value={(Array.isArray(watch('freins'))
                      ? watch('freins')
                      : []
                    ).map((word) =>
                      typeof word === 'string'
                        ? word.toLowerCase()
                        : word?.description?.toLowerCase()
                    )}
                    required={true}
                    options={type_freins}
                    choiceKey="description"
                    onChange={handleChange_freins}
                    placeholder="sélectionnez un ou plusieurs freins"
                    errors={{
                      ...errors,
                      freins:
                        formSubmitted && watch('freins').length == 0
                          ? 'Veuillez renseigner le champ frein.'
                          : null,
                    }}
                    loading={loading_tp_frein}
                    backendErrors={backendErrors}
                  />

                  {watch('freins')?.includes('tranche') && ( // Safe access using optional chaining
                    <AutocompleteMultiple
                      label="Tranches :"
                      name="tranches_id"
                      value={watch('tranches_id')} // e.g. [12, 17]
                      valueKey="id"
                      required={true}
                      options={tranches}
                      choiceKey="nom"
                      onChange={(newValue) => {
                        try {
                          console.log('Selected tranches:', newValue);

                          if (Array.isArray(newValue)) {
                            const selectedIds = newValue.map(
                              (option) => option?.id
                            );
                            console.log('ids tranches', selectedIds);
                            setValue('tranches_id', selectedIds); // Set only IDs to the form field
                          } else {
                            console.error(
                              'Expected newValue to be an array of selected options, but received:',
                              newValue
                            );
                          }
                        } catch (error) {
                          console.error(
                            'Error in tranches onChange handler:',
                            error
                          );
                        }
                      }}
                      placeholder="sélectionnez un ou plusieurs Tranches"
                      errors={{
                        ...errors,
                        tranche:
                          formSubmitted &&
                          watch('freins')?.includes('tranche') &&
                          watch('tranches_id').length == 0
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                            : null,
                      }}
                      backendErrors={backendErrors}
                      loading={loading}
                    />
                  )}

                  {watch('freins')?.includes('etage') && (
                    <AutocompleteMultiple
                      label="Etages :"
                      name="etages"
                      required={true}
                      options={list_etages}
                      choiceKey="value"
                      valueKey="value"
                      value={
                        Array.isArray(watch('etages')) ? watch('etages') : []
                      }
                      onChange={(newValue) => {
                        try {
                          console.log('Selected etages:', newValue);
                          if (Array.isArray(newValue)) {
                            const selectedVal = newValue.map(
                              (option) => option?.value
                            ); // option.value should be a number like 1 or 2
                            const etagesArray = selectedVal.join(','); // no need to map again!
                            console.log('etagesArray:', etagesArray); // Output: "1,2"
                            setValue('etages', etagesArray); // ✔️ correct usage
                          } else {
                            console.error(
                              'Expected newValue to be an array of selected options, but received:',
                              newValue
                            );
                          }
                        } catch (error) {
                          console.error(
                            'Error in etages onChange handler:',
                            error
                          );
                        }
                      }}
                      placeholder="sélectionnez un ou plusieurs etages"
                      errors={{
                        ...errors,
                        etages:
                          formSubmitted &&
                          watch('freins')?.includes('etage') &&
                          watch('etages').length == 0
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'etage'."
                            : null,
                      }}
                      loading={loading}
                      backendErrors={backendErrors}
                    />
                  )}
                  {watch('freins')?.includes('orientation') && (
                    <div>
                      <AutocompleteMultiple
                        label="Orientations :"
                        name="orientations"
                        required={true}
                        options={orientationOptions}
                        choiceKey="label"
                        value={
                          Array.isArray(watch('orientations'))
                            ? orientationOptions.filter((opt) =>
                                watch('orientations').includes(opt.code)
                              )
                            : []
                        }
                        valueKey="code"
                        onChange={(newValue) => {
                          try {
                            console.log(
                              'Selected orientationOptions:',
                              newValue
                            );

                            if (Array.isArray(newValue)) {
                              const selectedCode = newValue.map(
                                (option) => option?.code
                              );
                              console.log('code orientations', selectedCode);
                              setValue('orientations', selectedCode); // Set only IDs to the form field
                            } else {
                              console.error(
                                'Expected newValue orientations to be an array of selected options, but received:',
                                newValue
                              );
                            }
                          } catch (error) {
                            console.error(
                              'Error in orientations onChange handler:',
                              error
                            );
                          }
                        }}
                        placeholder="sélectionnez un ou plusieurs orientations"
                        errors={{
                          ...errors,
                          orientations:
                            formSubmitted &&
                            watch('freins')?.includes('orientation') &&
                            watch('orientations').length == 0
                              ? "Ce champ est obligatoire lorsque 'frein' inclut 'orientation'."
                              : null,
                        }}
                        loading={loading}
                        backendErrors={backendErrors}
                      />
                    </div>
                  )}
                  {watch('freins')?.includes('avance') && (
                    <div>
                      <TextField
                        label="Avance:"
                        name="avance"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        required={watch('frein')?.includes('avance')}
                      />
                    </div>
                  )}

                  {watch('freins')?.includes('prix') && (
                    <>
                      <div>
                        <div className="sm:col-span-2 flex gap-4">
                          <div className="w-1/2">
                            <TextField
                              label="Prix Min:"
                              name="prix_min"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={handlePrixChange(1)}
                              required={watch('freins')?.includes('prix')}
                            />
                            {info_prix != null && (
                              <div className="text-red-500 text-sm mt-1">
                                {info_prix}
                              </div>
                            )}
                          </div>
                          <div className="w-1/2">
                            <TextField
                              label="Prix Max:"
                              name="prix_max"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={handlePrixChange(1)}
                              required={watch('freins')?.includes('prix')}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {watch('freins')?.includes('superficie') && (
                    <>
                      <div>
                        <div className="sm:col-span-2 flex gap-4">
                          <div className="w-1/2">
                            <TextField
                              label="Sup Min:"
                              name="sup_min"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={handlePrixChange(2)}
                              required={watch('freins')?.includes('superficie')}
                            />
                            {info_sup != null && (
                              <div className="text-red-500 text-sm mt-1">
                                {info_sup}
                              </div>
                            )}
                          </div>
                          <div className="w-1/2">
                            <TextField
                              label="Sup Max:"
                              name="sup_max"
                              type="number"
                              control={control}
                              errors={errors}
                              backendErrors={backendErrors}
                              defaultValues={defaultValues}
                              onChange={handlePrixChange(2)}
                              required={watch('freins')?.includes('superficie')}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {watch('freins')?.includes('typologie') && (
                    <div>
                      <AutocompleteMultiple
                        label="Typologies :"
                        name="typologies"
                        required={true}
                        value={watch('typologies')}
                        options={list_typologies}
                        choiceKey="typologie"
                        valueKey="id"
                        onChange={(newValue) => {
                          try {
                            console.log('Selected typologies:', newValue);

                            if (Array.isArray(newValue)) {
                              const selectedIds = newValue.map(
                                (option) => option?.id
                              );
                              console.log('ids tranches', selectedIds);
                              setValue('typologies', selectedIds); // Set only IDs to the form field
                            } else {
                              console.error(
                                'Expected newValue to be an array of selected options, but received:',
                                newValue
                              );
                            }
                          } catch (error) {
                            console.error(
                              'Error in typologies onChange handler:',
                              error
                            );
                          }
                        }}
                        placeholder="sélectionnez un ou plusieurs Typologies"
                        errors={{
                          ...errors,
                          typologies:
                            formSubmitted &&
                            watch('freins')?.includes('typologie') &&
                            watch('typologies').length == 0
                              ? "Ce champ est obligatoire lorsque 'frein' inclut 'typologie'."
                              : null,
                        }}
                        loading={loading}
                        backendErrors={backendErrors}
                      />
                    </div>
                  )}
                  {watch('freins')?.includes('vue') && (
                    <div>
                      <AutocompleteMultiple
                        label="vue :"
                        name="vues"
                        required={true}
                        options={list_vues}
                        choiceKey="vue"
                        value={watch('vues') || []}
                        valueKey="id"
                        onChange={(newValue) => {
                          try {
                            console.log('Selected vues:', newValue);

                            if (Array.isArray(newValue)) {
                              const selectedIds = newValue.map(
                                (option) => option?.id
                              );
                              console.log('ids vues', selectedIds);
                              setValue('vues', selectedIds); // Set only IDs to the form field
                            } else {
                              console.error(
                                'Expected newValue to be an array of selected options, but received:',
                                newValue
                              );
                            }
                          } catch (error) {
                            console.error(
                              'Error in vues onChange handler:',
                              error
                            );
                          }
                        }}
                        placeholder="sélectionnez un ou plusieurs Vues"
                        errors={{
                          ...errors,
                          vues:
                            formSubmitted &&
                            watch('freins')?.includes('vue') &&
                            watch('vues').length == 0
                              ? "Ce champ est obligatoire lorsque 'frein' inclut 'vue'."
                              : null,
                        }}
                        loading={loading}
                        backendErrors={backendErrors}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex-1 mt-4">
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
          </div>
          <div className="flex justify-center gap-4 items-center xl:mt-32">
            <Button
              type="button"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  router.back();
                }
              }}
              disabled={isSubmitting} // Disable cancel during submit
            >
              Annuler
            </Button>

            <Button type="submit" disabled={isSubmitting || disabled_var}>
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
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
