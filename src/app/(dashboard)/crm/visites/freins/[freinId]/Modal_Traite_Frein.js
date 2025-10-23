'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { APIURL } from '../../../../../../configs/api';
import { useAuth } from '../../../../../../context/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import {
  VISITE_INTERETS,
  VISITE_TYPE_NOTIF,
  ORIENTATIONS,
} from '@/configs/enum';
import { useRouter } from 'next/navigation';

import { useProjet } from '@/context/ProjetContext';
import { fetchDataByProjet } from '../../../../../../../src/configs/api-utils';
import AutocompleteMultiple from '@/components/AutocompleteMultiple';
import Pusher from 'pusher-js';
import BienAutocomplete from './BienAutocomplete';
export default function Modal_Traite_Frein({ onClose, id, biens }) {
  const router = useRouter();

  const { selectedProjet } = useProjet();
  const { token, user } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const [loading_biens, setLoading_biens] = useState(false);

  const [backendErrors, setBackendErrors] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const list_etages = [];
  const [list_biens_clickable] = useState([]);

  const [type_freins, setType_freins] = useState([]);
  const [list_typologies, setListTyplogies] = useState([]);
  const [list_vues, setList_Vues] = useState([]);
  const [list_tranches, setList_tranches] = useState([]);
  const [info_prix, setInfo_prix] = useState(null);
  const [info_sup, setInfo_sup] = useState(null);
  const [biens_dispos, setBiensDispo] = useState([]);

  const [bien_id, setBien_id] = useState(null);
  const [loading_tp_frein, setLoading_tp_frein] = useState(false);
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;

  /*
   setBiensDispo(
          response.data.all_biens.map(b => ({
            id: b.bien.id,
            propriete_dite_bien: b.bien.propriete_dite_bien,
            etat: b.bien.etat,
            is_proposed: b.is_proposed,
            disabled: false
          }))
        )

  */

  const defaultValues = {
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
    bien_id: '',
  };
  const validationSchemaRef = useRef(
    yup.object().shape({
      interet: yup.string().required('Interêt de visite est requis'),
      commentaire: yup.string().required('Commentaire est requis'),
    })
  );
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });
  if (list_etages.length === 0 && selectedProjet?.max_etages > 0) {
    for (var i = 0; i <= selectedProjet?.max_etages; i++) {
      list_etages.push({ value: i });
    }
  }

  // 1) Extract all your checks into a single function
  const validateFields = () => {
    let valid = true;

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
    console.log(id);
    setLoading({ ...loading, form: true });
    setBackendErrors();
    let method = 'put';
    const dataToSend = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // Exclure certains champs si `isOrigin` est vrai
      // Ajouter les autres champs normalement
      dataToSend.append(key, value);
    });
    if (list_biens_clickable.length > 0) {
      for (let i = 0; i < list_biens_clickable.length; i++) {
        dataToSend.append(
          `list_biens_clickable[${i}]`,
          JSON.stringify(list_biens_clickable[i].value)
        );
      }
    }

    axios({
      method: method,
      url: `${APIURL.ROOTV1}/traiter_bien_frein/` + Number(id),
      data: dataToSend,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setLoading({ ...loading, form: false });

        if (res.status === 200) {
          toast.success(`Frein Traité avec succès`);
          onClose();
          localStorage.removeItem('nom_prenom_frein');
          router.push('/crm/visites/freins')
        }
      })
      .catch((error) => {
        setLoading({ ...loading, form: false });

        const response = error.response;
        if (response?.status === 422) {
          setBackendErrors(response.data.message || {});
          toast.error(response.data.message || 'Erreur de validation.');
          setTimeout(() => setBackendErrors(null), 5000);
        } else {
          toast.error("Une erreur s'est produite.");
        }
      });
  };

  const isFormValid = () => {
    const interet = Number(watch('interet'));
    const commentaire = watch('commentaire');

    // Basic required fields that are always needed
    if (!interet || !commentaire) {
      return false;
    }

    // Check fields based on interest type
    switch (interet) {
      case 1: // Intérêt = 1
        if (!watch('bien_id')) {
          return false;
        }
        break;

      case 3: // Intérêt = 3 (Freins)
        const frein = watch('frein') || [];

        // Check if at least one frein is selected
        if (frein.length === 0) {
          return false;
        }

        // Check conditional required fields based on selected freins
        if (
          frein.includes('tranche') &&
          (!watch('tranches') || watch('tranches').length === 0)
        ) {
          return false;
        }
        if (
          frein.includes('etage') &&
          (!watch('etages') || watch('etages').length === 0)
        ) {
          return false;
        }
        if (
          frein.includes('orientation') &&
          (!watch('orientations') || watch('orientations').length === 0)
        ) {
          return false;
        }
        if (
          frein.includes('typologie') &&
          (!watch('typologies') || watch('typologies').length === 0)
        ) {
          return false;
        }
        if (
          frein.includes('vue') &&
          (!watch('vues') || watch('vues').length === 0)
        ) {
          return false;
        }
        if (frein.includes('avance') && !watch('avance')) {
          return false;
        }
        if (frein.includes('prix')) {
          if (!watch('prix_min') || !watch('prix_max')) {
            return false;
          }
          // Additional check for price validation
          if (Number(watch('prix_min')) > Number(watch('prix_max'))) {
            return false;
          }
        }
        if (frein.includes('superficie')) {
          if (!watch('sup_min') || !watch('sup_max')) {
            return false;
          }
          // Additional check for superficie validation
          if (Number(watch('sup_min')) > Number(watch('sup_max'))) {
            return false;
          }
        }
        if (frein.includes('autre') && !watch('description_autre')) {
          return false;
        }
        break;

      // For interest = 2, no additional required fields beyond the basic ones
      default:
        break;
    }

    return true;
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

  const handlePrixChange = (val) => (e) => {
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

  const handleChange_freins = (selectedValues) => {
    try {
      console.log('Freins changed:', selectedValues);
      if (Array.isArray(selectedValues)) {
        setValue('frein', selectedValues);
      }
    } catch (error) {
      console.error('Error in handleChange_freins:', error);
    }
  };

  const handleChange_tp_notif = (code) => {
    if (code) {
      setValue('mode_relance', code);
    }
  };
  const handleChange_interet = (v) => {
    setLoading_biens(false);
    console.log('v===>', v);

    if (v != null) {
      if (v === 1) {
        // Use strict equality
        setValue('bien_id', '');
      }
      //perdu
      else if (v === 3) {
        // Use strict equality
        fetchTypeFreins();
        fetchDataByProjet('tranches', setList_tranches, setLoading);
        fetchDataByProjet('vues', setList_Vues, setLoading);
        fetchDataByProjet('typologies', setListTyplogies, setLoading);
      }
    }
  };

  const orientationOptions = Object.keys(ORIENTATIONS).map((key) => ({
    code: ORIENTATIONS[key].code,
    label: ORIENTATIONS[key].label,
    description: ORIENTATIONS[key].description,
  }));

  const storebien_en_proposition = async (id) => {
    var old_id = bien_id;
    if (old_id == null) {
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
      .catch(() => {
        console.log('error');
      });
  };

  // Pusher function
  // Fix the pusher_function - remove async
  const pusher_function = () => {
    console.log('Initializing Pusher...');
    Pusher.logToConsole = true;

    const pusher = new Pusher(`${pusher_key_proposition}`, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');

    channel.bind('App\\Events\\PropositionUpdated', (data) => {
      console.log('bbbbbbbbbbbbbbbbbbbbb - Pusher event received!');
      console.log('Proposal status changed:', data);
      // Refresh the biens data when Pusher event is received
      fetchDataa();
    });

    console.log('Pusher initialized and listening for updates');

    // Return cleanup function
    return () => {
      console.log('Cleaning up Pusher...');
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };

  // Fix the useEffect - remove async/await
  useEffect(() => {
    console.log('Component mounted - initializing Pusher...');
    const cleanup = pusher_function();

    // Cleanup on component unmount
    return () => {
      console.log('Component unmounting - cleaning up Pusher...');
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []); // Empty dependency array - runs once on mount
  const handleSelectBien = (bien) => {
    if (bien) {
      console.log('Selected Bien in Traiter Frein:', bien);

      const isDisabled =
        bien.etat === 'ENCOURS_DE_PROPOSITION' &&
        bien.is_proposed != null &&
        user.id !== bien.is_proposed.user_id;

      if (isDisabled) {
        toast.error(
          `Ce bien est déjà proposé par ${bien.is_proposed.user?.name} ${bien.is_proposed.user?.prenom}`
        );
        setValue('bien_id', '');
        return;
      }

      list_biens_clickable.push({ value: bien.id });
      setBien_id(bien.id);
      setValue('bien_id', bien.id);
      storebien_en_proposition(bien.id);

      // Pusher is already initialized via useEffect, no need to call it here
    }
  };

  const fetchDataa = async () => {
    setLoading_biens(true);
    axios
      .get(`${APIURL.ROOTV1}/biens_by_frein/` + Number(id), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: 1,
          size: 10,
        }, // Increment page number by 1 for API
      })
      .then((response) => {
        setLoading_biens(false);
        setBiensDispo([]);
        console.log(' arra now');
        setBiensDispo(
          response.data.all_biens.map((b) => ({
            id: b.bien.id,
            propriete_dite_bien: b.bien.propriete_dite_bien,
            etat: b.bien.etat,
            is_proposed: b.is_proposed,
            disabled: false,
          }))
        );
      })

      .catch((error) => {
        console.error('Error fetching Avances details:', error);
        setLoading(false);
      });
  };
  // Fetch initial data
  useEffect(() => {
    fetchDataa();
  }, []);

  return (
    <div className=" bg-gray-50 flex items-center justify-center ">
      <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:w-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Traiter Frein
            </h1>
          </div>
        </div>
        {/* Form Container */}
        <div className="p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[600px] mx-auto"
          >
            <div className="space-y-6">
              {/* Interest Selection */}
              <div className="w-full">
                <SelectInput
                  label="Intérêt:"
                  name="interet"
                  required={true}
                  placeholder="Sélectionnez un intérêt"
                  options={[
                    {
                      value: 1,
                      label: VISITE_INTERETS[1].label,
                    },
                    {
                      value: 2,
                      label: VISITE_INTERETS[2].label,
                    },
                    {
                      value: 3,
                      label: VISITE_INTERETS[3].label,
                    },
                  ]}
                  onChange={(value) => {
                    setValue('interet', value);
                    handleChange_interet(value);
                  }}
                  value={watch('interet')}
                  error={errors.interet?.message}
                  submitted={formSubmitted}
                />
              </div>
              {/* Conditional sections based on interest */}
              {Number(watch('interet')) === 1 && (
                <div className="space-y-6">
                  <div className="w-full">
                    <SelectInput
                      label="Bien:"
                      name="bien_id"
                      required={true}
                      placeholder={
                        loading_biens
                          ? 'Chargement des biens...'
                          : 'Sélectionnez un bien'
                      }
                      options={biens_dispos.map((bien) => {
                        // Enhanced disabled logic with null checks
                        const isDisabled =
                          bien &&
                          bien.etat === 'ENCOURS_DE_PROPOSITION' &&
                          bien.is_proposed != null &&
                          bien.is_proposed.user_id != null &&
                          user.id !== bien.is_proposed.user_id;

                        // Enhanced label text logic
                        let labelText =
                          bien.propriete_dite_bien || 'Bien sans nom';

                        if (
                          bien.etat === 'ENCOURS_DE_PROPOSITION' &&
                          bien.is_proposed
                        ) {
                          if (bien.is_proposed.user_id === user.id) {
                            labelText += ' - Proposé par Moi Même';
                          } else if (bien.is_proposed.user) {
                            labelText += ` - Proposé par ${bien.is_proposed.user.name} ${bien.is_proposed.user.prenom}`;
                          } else {
                            labelText += ' - Déjà proposé';
                          }
                        }

                        return {
                          value: bien.id,
                          label: labelText,
                          disabled: isDisabled,
                        };
                      })}
                      onChange={(selectedValue) => {
                        if (!selectedValue) return;

                        const selectedBien = biens_dispos.find(
                          (b) => b.id === selectedValue
                        );

                        if (!selectedBien) {
                          console.error(
                            'Selected bien not found in biens_dispos'
                          );
                          return;
                        }

                        // Check if disabled
                        const isDisabled =
                          selectedBien.etat === 'ENCOURS_DE_PROPOSITION' &&
                          selectedBien.is_proposed != null &&
                          selectedBien.is_proposed.user_id != null &&
                          user.id !== selectedBien.is_proposed.user_id;

                        if (isDisabled) {
                          setValue('bien_id', '');
                          toast.error(
                            `Ce bien est déjà proposé par ${selectedBien.is_proposed.user?.name} ${selectedBien.is_proposed.user?.prenom}`
                          );
                        } else {
                          setValue('bien_id', selectedValue);
                          handleSelectBien(selectedBien);
                        }
                      }}
                      value={watch('bien_id')}
                      error={errors.bien_id?.message}
                      submitted={formSubmitted}
                      loading={loading_biens}
                    />
                  </div>
                  <div className="w-full">
                    <TextField
                      label="Rendez Vous:"
                      name="rdv"
                      type="datetime-local"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                    />
                  </div>
                </div>
              )}
              {Number(watch('interet')) === 2 && (
                <div className="space-y-6">
                  <div className="w-full">
                    <SelectInput
                      label="Mode Relance:"
                      name="mode_relance"
                      required={false}
                      placeholder="Sélectionnez un mode de relance"
                      options={Object.entries(VISITE_TYPE_NOTIF).map(
                        ([code, details]) => ({
                          value: code,
                          label: details.label || details,
                        })
                      )}
                      onChange={(selectedCode) => {
                        setValue('mode_relance', selectedCode);
                        handleChange_tp_notif(selectedCode);
                      }}
                      value={watch('mode_relance')}
                      error={errors.mode_relance?.message}
                      submitted={formSubmitted}
                    />
                  </div>
                  <div className="w-full">
                    <TextField
                      label="Date Relance:"
                      name="date_relance"
                      type="date"
                      control={control}
                      errors={errors}
                      backendErrors={backendErrors}
                    />
                  </div>
                </div>
              )}
              {Number(watch('interet')) === 3 && (
                <div className="space-y-6">
                  <div className="w-full">
                    <SelectInput
                      label="Freins:"
                      name="frein"
                      required={true}
                      isMulti={true}
                      placeholder="Sélectionnez un ou plusieurs freins"
                      options={type_freins.map((frein) => ({
                        value: frein.description.toLowerCase(),
                        label: frein.description,
                      }))}
                      onChange={(selectedValues) => {
                        handleChange_freins(selectedValues);
                      }}
                      value={
                        Array.isArray(watch('frein')) ? watch('frein') : []
                      }
                      error={
                        formSubmitted &&
                        (!watch('frein') || watch('frein').length === 0)
                          ? 'Veuillez renseigner le champ frein.'
                          : errors.frein?.message
                      }
                      submitted={formSubmitted}
                    />
                  </div>
                  {/* Conditional fields based on selected freins */}
                  {watch('frein')?.includes('autre') && (
                    <div className="w-full">
                      <TextField
                        label="Description Frein Autre:"
                        name="description_autre"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        required={watch('frein')?.includes('autre')}
                        multi
                        width="w-full" // Optionally set width, default is 'w-80'
                        height="h-full" // Optionally set height, default is 'h-10'
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('tranche') && (
                    <div className="w-full">
                      <SelectInput
                        label="Tranches:"
                        name="tranches"
                        required={true}
                        isMulti={true}
                        placeholder="Sélectionnez un ou plusieurs tranches"
                        options={list_tranches.map((tranche) => ({
                          value: tranche.id,
                          label: tranche.nom,
                        }))}
                        onChange={(selectedValues) => {
                          try {
                            if (Array.isArray(selectedValues)) {
                              setValue('tranches', selectedValues);
                            } else {
                              setValue('tranches', [selectedValues]);
                            }
                          } catch (error) {
                            console.error(
                              'Error in tranches onChange handler:',
                              error
                            );
                          }
                        }}
                        value={
                          Array.isArray(watch('tranches'))
                            ? watch('tranches')
                            : []
                        }
                        error={
                          formSubmitted &&
                          watch('frein')?.includes('tranche') &&
                          (!watch('tranches') || watch('tranches').length === 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                            : errors.tranches?.message
                        }
                        submitted={formSubmitted}
                        loading={loading}
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('etage') && (
                    <div className="w-full">
                      <SelectInput
                        label="Etages:"
                        name="etages"
                        required={true}
                        isMulti={true}
                        placeholder="Sélectionnez un ou plusieurs étages"
                        options={list_etages.map((etage) => ({
                          value: etage.value,
                          label: `Étage ${etage.value}`,
                        }))}
                        onChange={(selectedValues) => {
                          try {
                            if (Array.isArray(selectedValues)) {
                              setValue('etages', selectedValues);
                            } else {
                              setValue('etages', [selectedValues]);
                            }
                          } catch (error) {
                            console.error(
                              'Error in etages onChange handler:',
                              error
                            );
                          }
                        }}
                        value={
                          Array.isArray(watch('etages')) ? watch('etages') : []
                        }
                        error={
                          formSubmitted &&
                          watch('frein')?.includes('etage') &&
                          (!watch('etages') || watch('etages').length === 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'etage'."
                            : errors.etages?.message
                        }
                        submitted={formSubmitted}
                        loading={loading}
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('orientation') && (
                    <div className="w-full">
                      <SelectInput
                        label="Orientations:"
                        name="orientations"
                        required={true}
                        isMulti={true}
                        placeholder="Sélectionnez un ou plusieurs orientations"
                        options={orientationOptions.map((orientation) => ({
                          value: orientation.code,
                          label: orientation.label,
                        }))}
                        onChange={(selectedValues) => {
                          try {
                            if (Array.isArray(selectedValues)) {
                              setValue('orientations', selectedValues);
                            } else {
                              setValue('orientations', [selectedValues]);
                            }
                          } catch (error) {
                            console.error(
                              'Error in orientations onChange handler:',
                              error
                            );
                          }
                        }}
                        value={
                          Array.isArray(watch('orientations'))
                            ? watch('orientations')
                            : []
                        }
                        error={
                          formSubmitted &&
                          watch('frein')?.includes('orientation') &&
                          (!watch('orientations') ||
                            watch('orientations').length === 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'orientation'."
                            : errors.orientations?.message
                        }
                        submitted={formSubmitted}
                        loading={loading}
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('avance') && (
                    <div className="w-full">
                      <TextField
                        label="Avance:"
                        name="avance"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        required={watch('frein')?.includes('avance')}
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('prix') && (
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <TextField
                            label="Prix Min:"
                            name="prix_min"
                            type="number"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            onChange={handlePrixChange(1)}
                            required={watch('frein')?.includes('prix')}
                          />
                        </div>
                        <div>
                          <TextField
                            label="Prix Max:"
                            name="prix_max"
                            type="number"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            onChange={handlePrixChange(1)}
                            required={watch('frein')?.includes('prix')}
                          />
                        </div>
                      </div>
                      {info_prix && (
                        <div className="text-red-500 text-sm mt-1">
                          {info_prix}
                        </div>
                      )}
                    </div>
                  )}
                  {watch('frein')?.includes('superficie') && (
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <TextField
                            label="Superficie Min:"
                            name="sup_min"
                            type="number"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            onChange={handlePrixChange(2)}
                            required={watch('frein')?.includes('superficie')}
                          />
                        </div>
                        <div>
                          <TextField
                            label="Superficie Max:"
                            name="sup_max"
                            type="number"
                            control={control}
                            errors={errors}
                            backendErrors={backendErrors}
                            onChange={handlePrixChange(2)}
                            required={watch('frein')?.includes('superficie')}
                          />
                        </div>
                      </div>
                      {info_sup && (
                        <div className="text-red-500 text-sm mt-1">
                          {info_sup}
                        </div>
                      )}
                    </div>
                  )}
                  {watch('frein')?.includes('typologie') && (
                    <div className="w-full">
                      <SelectInput
                        label="Typologies:"
                        name="typologies"
                        required={true}
                        isMulti={true}
                        placeholder="Sélectionnez un ou plusieurs typologies"
                        options={list_typologies.map((typologie) => ({
                          value: typologie.id,
                          label: typologie.typologie,
                        }))}
                        onChange={(selectedValues) => {
                          try {
                            if (Array.isArray(selectedValues)) {
                              setValue('typologies', selectedValues);
                            } else {
                              setValue('typologies', [selectedValues]);
                            }
                          } catch (error) {
                            console.error(
                              'Error in typologies onChange handler:',
                              error
                            );
                          }
                        }}
                        value={
                          Array.isArray(watch('typologies'))
                            ? watch('typologies')
                            : []
                        }
                        error={
                          formSubmitted &&
                          watch('frein')?.includes('typologie') &&
                          (!watch('typologies') ||
                            watch('typologies').length === 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'typologie'."
                            : errors.typologies?.message
                        }
                        submitted={formSubmitted}
                        loading={loading}
                      />
                    </div>
                  )}
                  {watch('frein')?.includes('vue') && (
                    <div className="w-full">
                      <SelectInput
                        label="Vues:"
                        name="vues"
                        required={true}
                        isMulti={true}
                        placeholder="Sélectionnez un ou plusieurs vues"
                        options={list_vues.map((vue) => ({
                          value: vue.id,
                          label: vue.vue,
                        }))}
                        onChange={(selectedValues) => {
                          try {
                            if (Array.isArray(selectedValues)) {
                              setValue('vues', selectedValues);
                            } else {
                              setValue('vues', [selectedValues]);
                            }
                          } catch (error) {
                            console.error(
                              'Error in vues onChange handler:',
                              error
                            );
                          }
                        }}
                        value={
                          Array.isArray(watch('vues')) ? watch('vues') : []
                        }
                        error={
                          formSubmitted &&
                          watch('frein')?.includes('vue') &&
                          (!watch('vues') || watch('vues').length === 0)
                            ? "Ce champ est obligatoire lorsque 'frein' inclut 'vue'."
                            : errors.vues?.message
                        }
                        submitted={formSubmitted}
                        loading={loading}
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Comment Field - Always visible */}
              <div className="w-full">
                <TextField
                  label="Commentaire:"
                  name="commentaire"
                  required={true}
                  control={control}
                  errors={errors}
                  multi
                  width="w-full" // Optionally set width, default is 'w-80'
                  height="h-full" // Optionally set height, default is 'h-10'
                />
              </div>
              {/* Backend Errors */}
              {backendErrors && (
                <div className="w-full">
                  <p className="text-red-600 text-sm">{backendErrors}</p>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid() || loading.form}
                    loading={loading.form}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
