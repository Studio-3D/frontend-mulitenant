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

  const { selectedProjet  } = useProjet();
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
  const [biens_dispos, setBiensDispo] = useState(() =>
    biens.map((b) => ({
      id: b.bien.id,
      propriete_dite_bien: b.bien.propriete_dite_bien,
      etat: b.bien.etat,
      is_proposed: b.is_proposed ?? false,
      disabled: false,
    }))
  );
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
  if (
    list_etages.length === 0 &&
    selectedProjet?.max_etages > 0
  ) {
    for (
      var i = 0;
      i <= selectedProjet?.max_etages;
      i++
    ) {
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
          // router.push('/crm/visites/freins')
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

  const TextField = ({
    label,
    name,
    type = 'text',
    required = false,
    control,
    errors,
    width = 'w-full',
    height = 'h-10',
    disabled = false,
    isTextarea = false, // New prop for handling textareas
  }) => {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium !text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) =>
            // Conditionally render input or textarea
            isTextarea ? (
              <textarea
                style={{ marginLeft: '-10px!important', width: '360px' }}
                {...field}
                id={name}
                name={name}
                className={`block ${width} ${height} px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors?.[name] ? 'border-red-500' : ''}`}
                disabled={disabled}
                required={required}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)} // Ensure React Hook Form handles the change
              />
            ) : (
              <input
                {...field}
                id={name}
                name={name}
                type={type}
                className={`block ${width} ${height} px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
                  disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors?.[name] ? 'border-red-500' : ''}`}
                required={required}
                disabled={disabled}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)} // Ensure React Hook Form handles the change
              />
            )
          }
        />
        {errors[name] && (
          <div className="mt-1 text-xs !text-red-600">
            <p>{errors[name]?.message}</p>
          </div>
        )}
      </div>
    );
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
    if (v === 1) { // Use strict equality
      setValue('bien_id', '');
    }
    //perdu
    else if (v === 3) { // Use strict equality
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
    });
    fetchDataa();

    return () => {
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };
  const fetchDataa = async (pageNumber = 0, size = 80) => {
    setLoading_biens(true);
    axios
      .get(`${APIURL.ROOTV1}/biens_by_frein/` + Number(id), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1,
          size,
        }, // Increment page number by 1 for API
      })
      .then((response) => {
        setLoading_biens(false);
        setBiensDispo([]);
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
  useEffect(() => {
    fetchDataa(0, 80);
  }, []);

  const handleSelectBien = (bien) => {
    console.log('heeeeeeeeeeere==>' + bien);

    if (bien) {
      list_biens_clickable.push({ value: bien.id });
      setBien_id(bien.id);
      setValue('bien_id', bien.id); // or bien.id depending on use
      storebien_en_proposition(bien.id);
      pusher_function();
    }
  };
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
                    setValue('interet', value)
                    handleChange_interet(value)
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
                      placeholder="Sélectionnez un bien"
                      options={biens_dispos.map((bien) => ({
                        value: bien.id,
                        label: `${bien.propriete_dite_bien} - ${bien.etat}`,
                      }))}
                      onChange={(selectedValue) => {
                        const selectedBien = biens_dispos.find(
                          (b) => b.id === selectedValue,
                        )
                        setValue('bien_id', selectedValue)
                        handleSelectBien(selectedBien)
                      }}
                      value={watch('bien_id')}
                      error={errors.bien_id?.message}
                      submitted={formSubmitted}
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
                        }),
                      )}
                      onChange={(selectedCode) => {
                        setValue('mode_relance', selectedCode)
                        handleChange_tp_notif(selectedCode)
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
                        handleChange_freins(selectedValues)
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
                        multi={true}
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        required={watch('frein')?.includes('autre')}
                        isTextarea={true}
                        height="h-24"
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
                              setValue('tranches', selectedValues)
                            } else {
                              setValue('tranches', [selectedValues])
                            }
                          } catch (error) {
                            console.error(
                              'Error in tranches onChange handler:',
                              error,
                            )
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
                              setValue('etages', selectedValues)
                            } else {
                              setValue('etages', [selectedValues])
                            }
                          } catch (error) {
                            console.error(
                              'Error in etages onChange handler:',
                              error,
                            )
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
                              setValue('orientations', selectedValues)
                            } else {
                              setValue('orientations', [selectedValues])
                            }
                          } catch (error) {
                            console.error(
                              'Error in orientations onChange handler:',
                              error,
                            )
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
                              setValue('typologies', selectedValues)
                            } else {
                              setValue('typologies', [selectedValues])
                            }
                          } catch (error) {
                            console.error(
                              'Error in typologies onChange handler:',
                              error,
                            )
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
                              setValue('vues', selectedValues)
                            } else {
                              setValue('vues', [selectedValues])
                            }
                          } catch (error) {
                            console.error(
                              'Error in vues onChange handler:',
                              error,
                            )
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
                  isTextarea={true}
                  height="h-24"
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
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading.form}
                  loading={loading.form}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
