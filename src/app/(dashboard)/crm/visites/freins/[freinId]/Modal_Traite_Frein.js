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
import {
  VISITE_INTERETS,
  VISITE_TYPE_NOTIF,
  ORIENTATIONS,
} from '@/configs/enum';
import { useRouter } from 'next/navigation';

import {
  
  fetchDataByProjet,
} from '../../../../../../../src/configs/api-utils';
import AutocompleteMultiple from '@/components/AutocompleteMultiple';
import Pusher from 'pusher-js';
import BienAutocomplete from './BienAutocomplete';
export default function Modal_Traite_Frein({ onClose, id, biens }) {
  const router = useRouter();

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
    JSON.parse(localStorage.getItem('selectedProjet'))?.max_etages > 0
  ) {
    for (
      var i = 0;
      i <= JSON.parse(localStorage.getItem('selectedProjet'))?.max_etages;
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
          localStorage.setItem('nom_prenom_frein', null);
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
          className="block text-sm font-medium text-gray-700"
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
                className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors[name] ? 'border-red-500' : ''
                }`}
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
                className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors[name] ? 'border-red-500' : ''
                }`}
                required={required}
                disabled={disabled}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)} // Ensure React Hook Form handles the change
              />
            )
          }
        />
        {errors[name] && (
          <div className="mt-1 text-xs text-red-600">
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

  const handleChange_tp_notif = (code) => {
    if (code) {
      setValue('mode_relance', code);
    }
  };
  const handleChange_interet = (v) => {
    setLoading_biens(false);
    console.log('v===>' + v);
    setValue('interet', v);
    if (v != null) {
      if (v == 1) {
        setValue('bien_id', '');
      }

      //perdu
      else if (v == 3) {
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
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-blue-600 px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Traiter Frein
          </h1>
        </div>
      </div>

      <div className="p-4 w-[600px] ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 mx-auto w-full max-w-[360px] flex flex-col items-center"
        >
          {/* Row for Input and MdPrint */}
          <div className="flex items-center space-x-2 w-full">
            <AutocompleteSelectComponent
              label="Intérêt:"
              name="interet"
              required={true}
              options={{
                1: VISITE_INTERETS[1],
                2: VISITE_INTERETS[2],
                3: VISITE_INTERETS[3],
              }}
              onChange={handleChange_interet}
            />
          </div>

          {Number(watch('interet')) == 1 && (
            <>
              <div className="flex items-center space-x-2 w-full">
                <Controller
                  name="bien_id"
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <BienAutocomplete
                      biens={biens_dispos}
                      user={user}
                      value={field.value}
                      onChange={(bien) => {
                        field.onChange(bien); // Updates form state
                        handleSelectBien(bien); // Your logic
                      }}
                      required={true}
                      errors={errors}
                      name="bien_id"
                    />
                  )}
                />
              </div>
              <div className="flex items-center space-x-2 w-full">
                <TextField
                  label="Rendez Vous:"
                  name="rdv"
                  type="datetime-local"
                  control={control}
                  errors={errors}
                  backendErrors={backendErrors}
                  defaultValues={defaultValues}
                />
              </div>
            </>
          )}
          {Number(watch('interet')) == 2 && (
            <>
              <div className="flex items-center space-x-2 w-full">
                <AutocompleteSelectComponent
                  label="Mode Relance:"
                  name="mode_relance"
                  required={false}
                  options={VISITE_TYPE_NOTIF}
                  onChange={handleChange_tp_notif}
                />
              </div>
              <div className="flex items-center space-x-2 w-full">
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
            <>
              <div className="flex items-center space-x-2 w-full">
                <AutocompleteMultiple
                  label="Freins :"
                  name="frein"
                  required={true}
                  options={type_freins}
                  choiceKey="description"
                  onChange={handleChange_freins}
                  placeholder="sélectionnez un ou plusieurs freins"
                  errors={{
                    ...errors,
                    frein:
                      formSubmitted && watch('frein').length == 0
                        ? 'Veuillez renseigner le champ frein.'
                        : null,
                  }}
                  loading={loading_tp_frein}
                  backendErrors={backendErrors}
                />
              </div>

              {watch('frein').includes('autre') && (
                <div className="flex items-center space-x-2 w-full">
                  <TextField
                    label="Description Frein Autre:"
                    name="description_autre"
                    multi={true}
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    required={watch('frein').includes('autre')}
                    width="w-full" // Optionally set width, default is 'w-80'
                    height="h-full"
                    isTextarea={true}
                  />
                </div>
              )}

              {watch('frein')?.includes('tranche') && ( // Safe access using optional chaining
                <div className="flex items-center space-x-2 w-full">
                  <AutocompleteMultiple
                    label="Tranches :"
                    name="tranche"
                    required={true}
                    options={list_tranches}
                    choiceKey="nom"
                    onChange={(newValue) => {
                      try {
                        console.log('Selected tranches:', newValue);

                        if (Array.isArray(newValue)) {
                          const selectedIds = newValue.map(
                            (option) => option?.id
                          );
                          console.log('ids tranches', selectedIds);
                          setValue('tranches', selectedIds); // Set only IDs to the form field
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
                        watch('frein')?.includes('tranche') &&
                        watch('tranches').length === 0
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                          : null,
                    }}
                    backendErrors={backendErrors}
                    loading={loading}
                  />
                </div>
              )}

              {watch('frein')?.includes('etage') && (
                <div className="flex items-center space-x-2 w-full">
                  <AutocompleteMultiple
                    label="Etages :"
                    name="etages"
                    required={true}
                    options={list_etages}
                    choiceKey="value"
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
                        watch('frein')?.includes('etage') &&
                        watch('etages').length === 0
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'etage'."
                          : null,
                    }}
                    loading={loading}
                    backendErrors={backendErrors}
                  />
                </div>
              )}
              {watch('frein').includes('orientation') && (
                <div className="flex items-center space-x-2 w-full">
                  <AutocompleteMultiple
                    label="Orientations :"
                    name="orientations"
                    required={true}
                    options={orientationOptions}
                    choiceKey="label"
                    onChange={(newValue) => {
                      try {
                        console.log('Selected orientationOptions:', newValue);

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
                        watch('frein')?.includes('orientation') &&
                        watch('orientations').length === 0
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'orientation'."
                          : null,
                    }}
                    loading={loading}
                    backendErrors={backendErrors}
                  />
                </div>
              )}
              {watch('frein').includes('avance') && (
                <div className="flex items-center space-x-2 w-full">
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

              {watch('frein').includes('prix') && (
                <>
                  <div>
                    {info_prix != null && (
                      <div className="w-full">
                        <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded">
                          {info_prix}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <TextField
                        label="Prix Min:"
                        name="prix_min"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        onChange={handlePrixChange(1)}
                        required={watch('frein')?.includes('prix')}
                      />
                      <TextField
                        label="Prix Max:"
                        name="prix_max"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        onChange={handlePrixChange(1)}
                        required={watch('frein')?.includes('prix')}
                      />
                    </div>
                  </div>
                </>
              )}
              {watch('frein').includes('superficie') && (
                <>
                  <div>
                    {info_sup != null && (
                      <div className="w-full">
                        <div className="bg-blue-100 text-blue-700 p-3 rounded-md border-l-4 border-blue-500 p-4 text-center rounded">
                          {info_sup}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <TextField
                        label="Sup Min:"
                        name="sup_min"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        onChange={handlePrixChange(2)}
                        required={watch('frein')?.includes('superficie')}
                      />
                      <TextField
                        label="Sup Max:"
                        name="sup_max"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={backendErrors}
                        defaultValues={defaultValues}
                        onChange={handlePrixChange(2)}
                        required={watch('frein')?.includes('superficie')}
                      />
                    </div>
                  </div>
                </>
              )}
              {watch('frein').includes('typologie') && (
                <div className="flex items-center space-x-2 w-full">
                  <AutocompleteMultiple
                    label="Typologies :"
                    name="typologies"
                    required={true}
                    options={list_typologies}
                    choiceKey="typologie"
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
                        watch('frein')?.includes('typologie') &&
                        watch('typologies').length === 0
                          ? "Ce champ est obligatoire lorsque 'frein' inclut 'typologie'."
                          : null,
                    }}
                    loading={loading}
                    backendErrors={backendErrors}
                  />
                </div>
              )}
              {watch('frein').includes('vue') && (
                <div className="flex items-center space-x-2 w-full">
                  <AutocompleteMultiple
                    label="vue :"
                    name="vues"
                    required={true}
                    options={list_vues}
                    choiceKey="vue"
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
                        console.error('Error in vues onChange handler:', error);
                      }
                    }}
                    placeholder="sélectionnez un ou plusieurs Vues"
                    errors={{
                      ...errors,
                      vues:
                        formSubmitted &&
                        watch('frein')?.includes('vue') &&
                        watch('vues').length === 0
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
          <div className="flex items-center space-x-2 w-full">
            {
              <>
                <TextField
                  label="Commentaire :"
                  name="commentaire"
                  required={true}
                  control={control}
                  errors={errors}
                  isTextarea={true} // Specify it's a textarea
                  height="h-24"
                  width="w-full" // Optional: Change height for textarea
                />
              </>
            }
          </div>

          <div className="w-full">
            {backendErrors != null && (
              <p className="!text-red-600 text-sm mb-2">{backendErrors}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-[10%]">
            <Button type="button" onClick={onClose}>
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
        </form>
      </div>
    </div>
  );
}
