'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef ,useCallback} from 'react';
import { fetchData_Select } from '../../../../../src/configs/api-utils';

import BreadCrumb from '../../navigation/BreadCrumb';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import SelectInput from '@/components/SelectInput'; // Updated import

import TextField from '@/components/Textfield';
import Button from '@/components/Button';
import LoadingSpin from '@/components/LoadingSpin';
import Modal_Propsepct_Exist from '../visites/Modal_Propsepct_Exist';
import { useProjet } from '@/context/ProjetContext';
import {
  VISITE_INTERETS,
  VISITE_TYPE_NOTIF,
  getInteret_label,
  TYPES_APPELS,
  ORIENTATIONS,
  ORIENTATION_ABBREVIATIONS,
} from '@/configs/enum';
import useClearProspectAppel from '../hook/useClearProspectAppel';
import useClearClientAppel from '../hook/useClearClientAppel';

export default function AppelsForm({ id }) {
  useClearProspectAppel();
  useClearClientAppel();

  // Add individual loading states
  const [validationErrors, setValidationErrors] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    prospectData: false,
    initialData: false,
    editData: false,
  });
  const { token } = useAuth();
  const router = useRouter();

  const { selectedProjet } = useProjet();

  const [info_cin, setInfo_cin] = useState(null);
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);

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

  const orientationOptions = Object.keys(ORIENTATIONS).map((key) => ({
    value: ORIENTATIONS[key].code,
    label: ORIENTATIONS[key].label,
    description: ORIENTATIONS[key].description,
    key: key,
  }));
  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/crm/appels');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  // Safely get and parse the prospect data
  const getProspectFromStorage = () => {
    try {
      const storedData = localStorage.getItem('selectedProspect_appel');
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);
      return parsedData?.prospect || null;
    } catch (error) {
      console.error('Error parsing prospect data:', error);
      return null;
    }
  };

  const getClientFromStorage = () => {
    try {
      const storedData = localStorage.getItem('selectedClient_appel');
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);
      return parsedData?.client || null;
    } catch (error) {
      console.error('Error parsing prospect data:', error);
      return null;
    }
  };
  const prospect_appel = getProspectFromStorage();
  const client_appel = getClientFromStorage();
  const defaultValues = {
    id_t_appel: '',
    prospect_id: prospect_appel != '' ? prospect_appel?.id : '',
    client_id: client_appel?.id || prospect_appel?.client_id || '',
    cin: client_appel?.cin || prospect_appel?.cin || '',
    nom: client_appel?.nom || prospect_appel?.nom || '',
    email: client_appel?.email || prospect_appel?.email || '',
    prenom: client_appel?.prenom || prospect_appel?.prenom || '',
    telephone: client_appel?.telephone_num1 || prospect_appel?.telephone || '',
    telephone_num2:
      client_appel?.telephone_num2 || prospect_appel?.telephone_num2 || null,
    ville: client_appel?.ville || prospect_appel?.ville || '',
    notifie: client_appel?.notifie || prospect_appel?.notifie || '',
    source:
      client_appel?.prospect?.source?.id || prospect_appel?.source?.id || '',
    source_txt:
      client_appel?.prospect?.source?.source ||
      prospect_appel?.source?.source ||
      '',
    partenaire_id:
      client_appel?.prospect?.partenaire_id ||
      prospect_appel?.partenaire_id ||
      '',
    partenaire_txt:
      client_appel?.prospect?.partenaire?.description ||
      prospect_appel?.partenaire?.description ||
      '',
    interet: '',
    type_appel: '',
    type_biens: '',
    projet_id: client_appel?.projet_id || prospect_appel?.projet_id || '',
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
    description_autre: '',
  };
  useEffect(() => {
    const loadProspectData = async () => {
      if (prospect_appel?.projet_id || client_appel?.projet_id) {
        setLoadingStates((prev) => ({ ...prev, prospectData: true }));

        const projetId = prospect_appel?.projet_id || client_appel?.projet_id;

        console.log(
          'Fetching data for projet_id from prospect_appel:',
          projetId
        );

        try {
          // Fetch all related data
          await Promise.all([
            fetchPartenaires(projetId),
            fetch_data_by_projetId(projetId),
            fetch_type_biens(projetId),
          ]);

          // Also set the projet_id in the form
          setValue('projet_id', projetId);
          setSource(
            prospect_appel?.source?.source ||
              client_appel.prospect?.source?.source
          );
        } catch (error) {
          console.error('Error loading prospect data:', error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, prospectData: false }));
        }
      }
    };

    loadProspectData();
  }, [prospect_appel?.projet_id]);

 const validationSchemaRef = useRef(
    yup.object().shape({
      
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
  // Supprimez yupResolver ou utilisez un schéma vide
  // resolver: yupResolver(validationSchemaRef.current),
  defaultValues,
});
  const isEditing = !!id;
  useEffect(() => {
    if (isEditing) {
      setLoadingStates((prev) => ({ ...prev, editData: true }));
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

          // First, fetch all the necessary data
          Promise.all([
            fetchPartenaires(tr_appel.appel.projet_id),
            fetch_data_by_projetId(tr_appel.appel.projet_id),
            fetch_type_biens(tr_appel.appel.projet_id),
          ]).then(() => {
            // After data is loaded, set the form values
            if (Array.isArray(tr_appel.type_biens)) {
              const selectedIds = tr_appel.type_biens.map(
                (option) => option?.type_bien_id
              );
              setValue('type_biens', selectedIds);
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

            setSource(tr_appel.appel.prospect.source?.source);
            setPartenaire(tr_appel.appel.prospect?.partenaire?.id);

            let freinValue = [];
            if (intere_label == 'Perdu') {
              // Fetch additional data for Perdu case
              Promise.all([
                fetch_type_Freins(),
                fetch_vues(tr_appel.appel.projet_id),
                fetch_typologies(tr_appel.appel.projet_id),
              ]).then(() => {
                if (frein_n != null) {
                  // Handle direct properties
                  // Handle "Autre" frein first
                  if (
                    frein_n.description_autre != null &&
                    frein_n.description_autre !== ''
                  ) {
                    setValue(
                      'description_autre',
                      frein_n.description_autre || ''
                    );
                    freinValue.push('autre');
                  }
                  if (frein_n.frein_etage.length > 0) {
                    const etages = frein_n.frein_etage.map((item) =>
                      item.etage.toString()
                    );

                    console.log('Setting etages:', etages);
                    setValue('etages', etages);
                    freinValue.push('etage');
                  }

                  if (frein_n.frein_vue.length > 0) {
                    const vues = frein_n.frein_vue.map((item) => item.vue.id);
                    console.log('Setting vues:', vues);

                    // Filter out any null/undefined values and convert to strings for SelectInput
                    const vuesFiltered = vues
                      .filter((id) => id != null)
                      .map((id) => id);
                    setValue('vues', vuesFiltered);
                    freinValue.push('vue');
                  }

                  if (frein_n.frein_typologie.length > 0) {
                    const typologies = frein_n.frein_typologie.map(
                      (item) => item.typologie.id
                    );
                    // Filter out any null/undefined values and convert to strings for SelectInput
                    const typologiesFiltered = typologies
                      .filter((id) => id != null)
                      .map((id) => id);
                    console.log('typologiess=+>' + typologiesFiltered);
                    setValue('typologies', typologiesFiltered);
                    freinValue.push('typologie');
                  }

                  if (frein_n.frein_tranche.length > 0) {
                    // Extract just the tranche IDs
                    const trancheIds = frein_n.frein_tranche.map(
                      (item) => item.tranche?.id
                    );

                    // Filter out any null/undefined values and convert to strings for SelectInput
                    const trancheIdsFiltered = trancheIds
                      .filter((id) => id != null)
                      .map((id) => id);

                    setValue('tranches_id', trancheIdsFiltered);
                    freinValue.push('tranche');
                  }

                  if (frein_n.frein_orientation.length > 0) {
                    const firstLetterToCode = {
                      N: ORIENTATIONS[1].code,
                      S: ORIENTATIONS[2].code,
                      E: ORIENTATIONS[3].code,
                      O: ORIENTATIONS[4].code,
                      N_E: ORIENTATIONS[5].code,
                      N_o: ORIENTATIONS[6].code,
                      S_E: ORIENTATIONS[7].code,
                      S_O: ORIENTATIONS[8].code,
                    };

                    const orientations = frein_n.frein_orientation.map(
                      (item) => {
                        const letter = item.orientation
                          ?.trim()
                          .charAt(0)
                          .toUpperCase();
                        return firstLetterToCode[letter];
                      }
                    );

                    console.log('Setting orientations:', orientations);
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
                  console.log('Setting freins:', freinValue);
                  setValue('freins', freinValue);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log(error.message);
          setLoadingStates((prev) => ({ ...prev, editData: false }));
        })
        .finally(() => {
          setLoadingStates((prev) => ({ ...prev, editData: false }));
        });
    } else {
   
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
        // FIX: Properly add "Autre" option
        setType_freins([
          ...(res.data.typeFreins || []), // Keep the original freins
          { id: 'autre', description: 'Autre' }, // Add "Autre" option
        ]);
        setLoading_tp_frein(false);
      })
      .catch(() => {});
  };
  useEffect(() => {
    fetchData_Select('projets', setProjets, setLoading);
    fetchSources();
  }, []);

  // Ajoutez cet état au début du composant

  // Ajoutez cette fonction pour collecter toutes les erreurs
  const collectAllValidationErrors = (formData, interetValue) => {
    const errors = [];

    // 1. Erreurs Yup de base (form-level)
    if (formSubmitted) {
      // Vérifiez les erreurs du formulaire
      if (!formData.telephone) errors.push('Le numéro de téléphone est requis');
      if (!formData.type_appel) errors.push("Le type d'appel est obligatoire");
      if (!formData.interet) errors.push("L'intérêt est obligatoire");
      if (!formData.projet_id) errors.push('Le projet est obligatoire');
      if (!formData.source) errors.push('La source est obligatoire');

      // Validation téléphone
      if (formData.telephone) {
        if (formData.telephone.length < 10)
          errors.push('Le téléphone doit avoir au moins 10 chiffres');
        if (formData.telephone.length > 14)
          errors.push('Le téléphone ne doit pas dépasser 14 chiffres');
        if (!/^\d+$/.test(formData.telephone))
          errors.push('Le téléphone ne doit contenir que des chiffres');
      }

      // Validation téléphone 2 si rempli
      if (formData.telephone_num2 && formData.telephone_num2 !== 'null') {
        if (formData.telephone_num2.length < 10)
          errors.push('Le téléphone 2 doit avoir au moins 10 chiffres');
        if (formData.telephone_num2.length > 14)
          errors.push('Le téléphone 2 ne doit pas dépasser 14 chiffres');
      }
    }

    // 2. Erreurs basées sur l'intérêt
    if (Number(interetValue) === 1) {
      // Intéressé
      if (!formData.type_biens || formData.type_biens.length === 0) {
        errors.push(
          'Le type de bien est obligatoire pour un prospect intéressé'
        );
      }
      if (!formData.orientation) {
        errors.push("L'orientation est obligatoire pour un prospect intéressé");
      }
    }

    if (Number(interetValue) === 3) {
      // Perdu
      const freins = formData.freins || [];

      if (freins.length === 0) {
        errors.push(
          'Au moins un frein doit être sélectionné pour un prospect perdu'
        );
      }

      // Vérifications spécifiques par type de frein
      if (
        freins.includes('vue') &&
        (!formData.vues || formData.vues.length === 0)
      ) {
        errors.push(
          "Les vues sont obligatoires lorsque le frein 'vue' est sélectionné"
        );
      }

      if (
        freins.includes('typologie') &&
        (!formData.typologies || formData.typologies.length === 0)
      ) {
        errors.push(
          "Les typologies sont obligatoires lorsque le frein 'typologie' est sélectionné"
        );
      }

      if (
        freins.includes('orientation') &&
        (!formData.orientations || formData.orientations.length === 0)
      ) {
        errors.push(
          "Les orientations sont obligatoires lorsque le frein 'orientation' est sélectionné"
        );
      }

      if (
        freins.includes('etage') &&
        (!formData.etages || formData.etages.length === 0)
      ) {
        errors.push(
          "Les étages sont obligatoires lorsque le frein 'étage' est sélectionné"
        );
      }

      if (
        freins.includes('tranche') &&
        (!formData.tranches_id || formData.tranches_id.length === 0)
      ) {
        errors.push(
          "Les tranches sont obligatoires lorsque le frein 'tranche' est sélectionné"
        );
      }

      if (
        freins.includes('autre') &&
        (!formData.description_autre ||
          formData.description_autre.trim() === '')
      ) {
        errors.push(
          "La description est obligatoire lorsque le frein 'autre' est sélectionné"
        );
      }

      if (freins.includes('prix')) {
        if (!formData.prix_min && !formData.prix_max) {
          errors.push(
            "Au moins un prix (min ou max) doit être renseigné lorsque le frein 'prix' est sélectionné"
          );
        }
      }

      if (freins.includes('superficie')) {
        if (!formData.sup_min && !formData.sup_max) {
          errors.push(
            "Au moins une superficie (min ou max) doit être renseignée lorsque le frein 'superficie' est sélectionné"
          );
        }
      }

      if (freins.includes('avance') && !formData.avance) {
        errors.push(
          "L'avance est obligatoire lorsque le frein 'avance' est sélectionné"
        );
      }
    }

    // 3. Validation partenaire
    if (formData.source_txt === 'Partenaire' && !formData.partenaire_id) {
      errors.push(
        "Le partenaire est obligatoire lorsque la source est 'Partenaire'"
      );
    }

    // 4. Validation prix/min-max
    if (
      formData.prix_min &&
      formData.prix_max &&
      Number(formData.prix_min) > Number(formData.prix_max)
    ) {
      errors.push('Le prix minimum ne peut pas être supérieur au prix maximum');
    }

    if (
      formData.sup_min &&
      formData.sup_max &&
      Number(formData.sup_min) > Number(formData.sup_max)
    ) {
      errors.push(
        'La superficie minimum ne peut pas être supérieure à la superficie maximum'
      );
    }

    return errors;
  };
 const validateFields = () => {
  const interetValue = watch('interet');
  const formData = watch(); // Récupère toutes les valeurs du formulaire
  
  const errors = collectAllValidationErrors(formData, interetValue);
  
  if (errors.length > 0) {
    setValidationErrors(errors);
    return false;
  }
  
  setValidationErrors([]);
  return true;
};

  const onSubmit = (data) => {
    setFormSubmitted(true);
    if (!validateFields()) {
      return;
    }
    // Collecter toutes les erreurs de validation
    const interetValue = watch('interet');
    const allErrors = collectAllValidationErrors(data, interetValue);

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    setLoading({ ...loading, form: true });
    setIsSubmitting(true);
    setBackendErrors({});
    setValidationErrors([]); // Nettoyer les erreurs avant soumission

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
      description_autre: data.description_autre || '', // Make sure this is included
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
      // Also handle single orientation field if needed
      if (preparedData.orientation && ORIENTATIONS[preparedData.orientation]) {
        preparedData.orientation =
          ORIENTATION_ABBREVIATIONS[
            ORIENTATIONS[preparedData.orientation].label
          ] || '';
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
          /*router.push(ENDPOINTS.CRM + '?tab=appels');
          localStorage.removeItem('selectedProspect_appel');
          localStorage.removeItem('selectedClient_appel');*/
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

        console.log('Réponse API:', res.data); // Debug

        // Vérifier si on a soit un client, soit un prospect
        if (res.data.client != null || res.data.prospect != null) {
          console.log('psss22 - Données trouvées');

          // PRIORITÉ: Si on a un CLIENT (même si on a aussi un prospect)
          if (res.data.client != null) {
            console.log('Client trouvé - Priorité au client');

            prospect_id = res.data.client.prospect_id;
            cin = res.data.client.cin;
            nom = res.data.client.nom;
            prenom = res.data.client.prenom;
            ville = res.data.client.ville;
            tel = res.data.client.telephone_num1;
            tel_2 = res.data.client.telephone_num2;
            source_id = res.data.client.prospect?.source?.id;
            source = res.data.client.prospect?.source?.source;
            partenaire_id = res.data.client.prospect?.partenaire_id;
            partenaire_txt = res.data.client.prospect?.partenaire?.description;

            setInfo_client(res.data.client.nom + ' ' + res.data.client.prenom);
            setClient_prospect('Est un client');

            console.log("ooeer - Modal client va s'ouvrir");
            setOpen_Dialog(true);
          }
          // Sinon, si on a seulement un PROSPECT (sans client)
          else if (res.data.prospect != null) {
            console.log('Prospect trouvé (pas de client)');

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
            setOpen_Dialog(true);
          }

          // Remplir le formulaire avec les données
          setValue('prospect_id', prospect_id);
          setValue('nom', nom);
          setValue('cin', cin);
          setValue('prenom', prenom);
          setValue('telephone', tel);

          if (tel_2 != null && tel_2 !== '') {
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

          // Utiliser le projet_id du prospect (client ou prospect)
          const projetId =
            res.data.client?.prospect?.projet_id ||
            res.data.prospect?.projet_id;
          setValue('projet_id', projetId);

          if (projetId) {
            fetchPartenaires(projetId);
            fetch_data_by_projetId(projetId);
            fetch_type_biens(projetId);
          }

          setValue('partenaire_id', partenaire_id);

          // Gérer appels et visites
          if (res.data.prospect?.appels != null) {
            setId_appel(res.data.prospect.appels?.id);
          }
          if (res.data.prospect?.visite_first != null) {
            setId_visite(res.data.prospect.visite_first?.id);
          }
        } else {
          console.log('Aucune donnée trouvée');
          defaultValues['prospect_id'] = null;
          setOpen_Dialog(false);
        }
      })
      .catch((error) => {
        console.error('Erreur API:', error.response?.data || error.message);
        setOpen_Dialog(false);
      });
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
    // Reset states
    [
      setTranches,
      setBlocs,
      setImmeubles,
      setList_etages,
      setListTyplogies,
      setList_Vues,
    ].forEach((setter) => setter([]));

    try {
      const {
        data: { projet },
      } = await axios.get(`${APIURL.PROJETS}/${projet_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Mise à jour synchrone des states
      setTranches(projet.tranche);
      setBlocs(projet.bloc);
      setImmeubles(projet.immeuble);
      setListTyplogies(projet.typologies);
      setList_Vues(projet.vues);
      setList_etages(generateEtagesArray(projet.max_etages));

      return {
        tranches: projet.tranche,
        blocs: projet.bloc,
        immeubles: projet.immeuble,
        etages: generateEtagesArray(projet.max_etages),
      };
    } catch (error) {
      console.error('Error fetching project data:', error);
      // Gestion d'erreur optionnelle
      throw error; // Propager l'erreur si nécessaire
    }
  };

  const generateEtagesArray = (maxEtages) => {
    if (!maxEtages || maxEtages <= 0) return [];

    return Array.from({ length: maxEtages + 1 }, (_, index) => ({
      id: index + 1,
      value: index === 0 ? '0' : index.toString(),
    }));
  };

const handleChange_interet = useCallback((code) => {
  if (code) {
    setValue('interet', code, { shouldValidate: false }); // Ajoutez shouldValidate: false
    
    if ((code == 1 || code == 3) && watch('projet_id') == '') {
      toast.error('Veuillez Choisir un Projet');
    }
    
    // Utilisez un batch pour les mises à jour
    setValue('mode_relance', '', { shouldValidate: false });
    setValue('date_relance', '', { shouldValidate: false });
    setValue('rdv', '', { shouldValidate: false });
    
    if (code == 3) {
      fetch_type_Freins();
      fetch_vues(watch('projet_id'));
      fetch_typologies(watch('projet_id'));
    }
  }
}, [setValue, watch]); // Ajoutez les dépendances


  // Combined loading check
  // Enhanced loading check
  const isLoading =
    loadingStates.prospectData ||
    loadingStates.initialData ||
    loadingStates.editData ||
    (isEditing && !formData);
  // Check if essential data is loaded for the current interet
  /* (Number(watch('interet')) === 3 && loading_tp_frein) ||
    // Check if project data is loaded when project is selected
    (watch('projet_id') &&
      (tranches.length === 0 ||
        list_type_biens.length === 0 ||
        list_etages.length === 0));*/

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
        {/*<span className="ml-2 text-gray-600">
        {loadingStates.editData ? "Chargement des données d'édition..." :
         loadingStates.prospectData ? 'Chargement des données du prospect...' :
         loadingStates.initialData ? 'Chargement des données initiales...' :
         loading_tp_frein ? 'Chargement des types de freins...' :
         'Chargement des données...'}
      </span>*/}
      </div>
    );
  }

  return (
    <>
      {open_dialog == true && (
        <>
          <Modal_Propsepct_Exist
            info_param={'téléphone'}
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
            baseUrl={ENDPOINTS.CRM + '?tab=appels'}
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
              <SelectInput
                placeholder="selectionner un projet"
                label="Projet:"
                required
                name="projet_id"
                options={PROJETS.map((projet) => ({
                  value: projet.id,
                  label: projet.nom,
                }))}
                value={watch('projet_id')}
                onChange={(value) => {
                  setValue('projet_id', value);
                  setValue('tranche_id', '');
                  setValue('bloc_id', '');
                  setValue('immeuble_id', '');
                  setValue('etage', '');
                  if (value) {
                    fetchPartenaires(value);
                    fetch_data_by_projetId(value);
                    fetch_type_biens(value);
                  }
                }}
                error={errors.projet_id?.message || backendErrors.projet_id}
                submitted={formSubmitted}
              />
              <SelectInput
                placeholder="selectionner un type dappel"
                label="Type Appel :"
                name="type_appel"
                value={watch('type_appel')}
                required={true}
                options={Object.values(TYPES_APPELS).map((type) => ({
                  value: type.code,
                  label: type.label,
                }))}
                onChange={(value) => {
                  setValue('type_appel', value);
                }}
                error={errors.type_appel?.message || backendErrors.type_appel}
                submitted={formSubmitted}
              />
              <SelectInput
                placeholder="selectionner une source"
                label="Source:"
                required
                name="source"
                options={SOURCES.map((source) => ({
                  value: source.id,
                  label: source.source,
                }))}
                value={watch('source')}
                onChange={(value) => {
                  setSource(SOURCES.find((s) => s.id === value)?.source || '');
                  setValue('source', value);

                  if (
                    SOURCES.find((s) => s.id === value)?.source === 'Partenaire'
                  ) {
                    setValue('source_txt', 'Partenaire');
                  } else {
                    setValue('source_txt', '');
                  }
                  if (
                    !watch('projet_id') &&
                    watch('source_txt') === 'Partenaire'
                  ) {
                    toast.error('Veuillez Choisir un Projet');
                  }
                }}
                error={errors.source?.message || backendErrors.source}
                submitted={formSubmitted}
              />
              {source?.toLowerCase() == 'partenaire' && (
                <SelectInput
                  placeholder="selectionner un partenaire"
                  label="Partenaire:"
                  name="partenaire_id"
                  required={watch('source_txt') == 'Partenaire'}
                  options={list_partenaires.map((partenaire) => ({
                    value: partenaire.id,
                    label: partenaire.description,
                  }))}
                  value={watch('partenaire_id')}
                  onChange={(value) => {
                    setValue('partenaire_id', value);
                  }}
                  error={
                    (formSubmitted &&
                    watch('source_txt') == 'Partenaire' &&
                    !watch('partenaire_id')
                      ? 'Partenaire est obligatoire'
                      : null) || backendErrors.partenaire_id
                  }
                  submitted={formSubmitted}
                />
              )}
              {/* Intérêt (toujours visible) */}
              <div className="sm:col-span-1">
                <SelectInput
                  placeholder="selectionner un intérêt"
                  label="Intérêt:"
                  name="interet"
                  value={watch('interet')}
                  required={true}
                  options={Object.values(VISITE_INTERETS).map((interet) => ({
                    value: interet.code,
                    label: interet.label,
                  }))}
                  disabled={watch('telephone') == ''}
                  onChange={handleChange_interet}
                  error={errors.interet?.message || backendErrors.interet}
                  submitted={formSubmitted}
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
                  <SelectInput
                    placeholder="selectionner une tranche"
                    label="Tranche:"
                    name="tranche_id"
                    options={tranches.map((tranche) => ({
                      value: tranche.id,
                      label: tranche.nom,
                    }))}
                    value={watch('tranche_id')}
                    onChange={(value) => {
                      setValue('tranche_id', value);
                    }}
                    error={
                      errors.tranche_id?.message || backendErrors.tranche_id
                    }
                    submitted={formSubmitted}
                  />
                  <div className="mt-1">
                    <SelectInput
                      placeholder="selectionner un bloc"
                      label="Bloc:"
                      name="bloc_id"
                      value={watch('bloc_id')}
                      options={blocs.map((bloc) => ({
                        value: bloc.id,
                        label: bloc.nom,
                      }))}
                      onChange={(value) => {
                        setValue('bloc_id', value);
                      }}
                      error={errors.bloc_id?.message || backendErrors.bloc_id}
                      submitted={formSubmitted}
                    />
                  </div>
                  <div className="mt-1">
                    <SelectInput
                      placeholder="selectionner un immeuble"
                      label="Immeuble:"
                      name="immeuble_id"
                      options={immeubles.map((immeuble) => ({
                        value: immeuble.id,
                        label: immeuble.nom,
                      }))}
                      value={watch('immeuble_id')}
                      onChange={(value) => {
                        setValue('immeuble_id', value);
                      }}
                      error={
                        errors.immeuble_id?.message || backendErrors.immeuble_id
                      }
                      submitted={formSubmitted}
                    />
                  </div>

                  <div className="mt-1">
                    <SelectInput
                      placeholder="selectionner un type de bien"
                      label="Types Biens :"
                      name="type_biens"
                      required={true}
                      options={list_type_biens.map((type) => ({
                        value: type.id,
                        label: type.type,
                      }))}
                      value={watch('type_biens')}
                      isMulti={true}
                      onChange={(value) => {
                        setValue('type_biens', value);
                      }}
                      error={
                        (formSubmitted && Number(watch('interet')) == 1
                          ? "Ce champ est obligatoire lorsque 'interet' est 'interessé'."
                          : null) || backendErrors.type_biens
                      }
                      submitted={formSubmitted}
                    />
                  </div>
                  <div className="mt-1">
                    <SelectInput
                      placeholder="selectionner une orientation"
                      label="Orientation :"
                      required={true}
                      name="orientation"
                      value={watch('orientation')}
                      options={orientationOptions}
                      onChange={(value) => {
                        setValue('orientation', value);
                      }}
                      error={
                        (formSubmitted && Number(watch('interet')) == 1
                          ? "Ce champ est obligatoire lorsque 'interet' est 'interessé'."
                          : null) || backendErrors.orientation
                      }
                      submitted={formSubmitted}
                    />
                  </div>

                  <div className="mt-1">
                    <SelectInput
                      placeholder="selectionner un etage"
                      label="Etage:"
                      name="etage"
                      options={list_etages.map((etage) => ({
                        value: etage.value,
                        label: etage.value,
                      }))}
                      value={watch('etage')}
                      onChange={(value) => {
                        setValue('etage', value);
                      }}
                      error={errors.etage?.message || backendErrors.etage}
                      submitted={formSubmitted}
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
                    <SelectInput
                      placeholder="selectionner un mode de relance"
                      label="Mode Relance:"
                      name="mode_relance"
                      value={watch('mode_relance')}
                      options={Object.values(VISITE_TYPE_NOTIF).map(
                        (notif) => ({
                          value: notif.code,
                          label: notif.label,
                        })
                      )}
                      onChange={(value) => setValue('mode_relance', value)}
                      error={
                        errors.mode_relance?.message ||
                        backendErrors.mode_relance
                      }
                      submitted={formSubmitted}
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
                  <SelectInput
                    placeholder="selectionner un mode de relance"
                    label="Mode Relance:"
                    name="mode_relance"
                    value={watch('mode_relance')}
                    options={Object.values(VISITE_TYPE_NOTIF).map((notif) => ({
                      value: notif.code,
                      label: notif.label,
                    }))}
                    onChange={(value) => setValue('mode_relance', value)}
                    error={
                      errors.mode_relance?.message || backendErrors.mode_relance
                    }
                    submitted={formSubmitted}
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
                  <SelectInput
                    placeholder="selectionner des freins"
                    label="Freins :"
                    name="freins"
                    value={watch('freins')}
                    required={true}
                    options={type_freins.map((frein) => ({
                      value: frein.description.toLowerCase(),
                      label: frein.description,
                    }))}
                    isMulti={true}
                    onChange={(value) => {
                      setValue('freins', value);
                    }}
                    error={
                      (formSubmitted &&
                      (!watch('freins') || watch('freins').length == 0)
                        ? 'Veuillez renseigner le champ frein.'
                        : null) || backendErrors.freins
                    }
                    submitted={formSubmitted}
                    loading={loading_tp_frein}
                  />

                  {watch('freins')?.includes('tranche') && ( // Safe access using optional chaining
                    <SelectInput
                      placeholder="selectionner des tranches"
                      label="Tranches :"
                      name="tranches_id"
                      value={watch('tranches_id')}
                      isMulti={true}
                      options={tranches.map((tranche) => ({
                        value: tranche.id,
                        label: tranche.nom,
                      }))}
                      required={true}
                      onChange={(value) => {
                        setValue('tranches_id', value);
                      }}
                      error={
                        (formSubmitted &&
                        watch('freins')?.includes('tranche') &&
                        (!watch('tranches_id') ||
                          watch('tranches_id').length == 0)
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                          : null) || backendErrors.tranches_id
                      }
                      submitted={formSubmitted}
                    />
                  )}
                  {watch('freins')?.includes('etage') && (
                    <SelectInput
                      placeholder="selectionner des etages"
                      label="Etages :"
                      name="etages"
                      required={true}
                      options={list_etages.map((etage) => ({
                        value: etage.value.toString(), // Ensure string values
                        label: etage.value.toString(), // Ensure string labels
                      }))}
                      value={
                        Array.isArray(watch('etages'))
                          ? watch('etages').map((item) => item.toString())
                          : []
                      }
                      isMulti={true}
                      onChange={(value) => {
                        setValue('etages', value);
                      }}
                      error={
                        (formSubmitted &&
                        watch('freins')?.includes('etage') &&
                        (!watch('etages') || watch('etages').length == 0)
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'etage'."
                          : null) || backendErrors.etages
                      }
                      submitted={formSubmitted}
                    />
                  )}
                  {watch('freins')?.includes('orientation') && (
                    <div>
                      <SelectInput
                        placeholder="selectionner des orientations"
                        label="Orientations :"
                        name="orientations" // This should be 'orientations' (plural)
                        value={watch('orientations')}
                        options={orientationOptions.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                        required={true}
                        isMulti={true} // This should be multi-select for freins
                        onChange={(value) => {
                          setValue('orientations', value);
                        }}
                        error={
                          (formSubmitted &&
                          watch('freins')?.includes('orientation') &&
                          (!watch('orientations') ||
                            watch('orientations').length == 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'orientation'."
                            : null) || backendErrors.orientations
                        }
                        submitted={formSubmitted}
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
                        required={watch('freins')?.includes('avance')}
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
                      <SelectInput
                        placeholder="selectionner des typologies"
                        label="Typologies :"
                        name="typologies"
                        required={true}
                        value={watch('typologies')}
                        options={list_typologies.map((typologie) => ({
                          value: typologie.id,
                          label: typologie.typologie,
                        }))}
                        isMulti={true}
                        onChange={(value) => {
                          setValue('typologies', value);
                        }}
                        error={
                          (formSubmitted &&
                          watch('freins')?.includes('typologie') &&
                          (!watch('typologies') ||
                            watch('typologies').length == 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'typologie'."
                            : null) || backendErrors.typologies
                        }
                        submitted={formSubmitted}
                      />
                    </div>
                  )}
                  {watch('freins')?.includes('vue') && (
                    <div>
                      <SelectInput
                        placeholder="selectionner des vues"
                        label="vue :"
                        name="vues"
                        required={true}
                        options={list_vues.map((vue) => ({
                          value: vue.id,
                          label: vue.vue,
                        }))}
                        value={watch('vues')}
                        isMulti={true}
                        onChange={(value) => {
                          setValue('vues', value);
                        }}
                        error={
                          (formSubmitted &&
                          watch('freins')?.includes('vue') &&
                          (!watch('vues') || watch('vues').length == 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'vue'."
                            : null) || backendErrors.vues
                        }
                        submitted={formSubmitted}
                      />
                    </div>
                  )}
                  {/* Description Autre Field */}
                  {watch('freins')?.includes('autre') && (
                    <div>
                      <TextField
                        label="Description Frein Autre:"
                        name="description_autre"
                        multi={true}
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        required={watch('freins')?.includes('autre')}
                        width="w-full"
                        height="h-full"
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
          {validationErrors.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {validationErrors.length} erreur
                      {validationErrors.length > 1 ? 's' : ''} à corriger
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
