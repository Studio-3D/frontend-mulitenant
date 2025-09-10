import React from 'react';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { fetchData_Select, fetchDataByProjet, } from '../../../../../src/configs/api-utils';

import BreadCrumb from '../../navigation/BreadCrumb';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import Autocomplete from '@/components/Autocomplete';
import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import SelectInput from '@/components/SelectInput';
export default function ProspectForm({ id, onClose, onSuccess }) {
  const { token } = useAuth();
  const router = useRouter();

  const accessToken = token || localStorage.getItem('accessToken');
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || null;
  /*const searchParams = useSearchParams();
  const id = searchParams.get('id');*/

  const [formData, setFormData] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState({});
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [source_txt, setSource_txt] = useState(null);
  const [partenaire, setPartenaire] = useState(null);
  const [check, set_check] = useState(false);
  const [check_p, set_check_p] = useState(false);
  const [info_client, setInfo_client] = useState(false);
  const [info_prospect, setInfo_prospect] = useState(false);
  const [loading_auto, setLoading_auto] = useState(false);

  const defaultValues = {
    nom: '', // Make sure all fields you need are present
    prenom: '',
    telephone: '',
    telephone_num2: '',
    email: '',
    source: '',
    cin: '',
    partenaire_id: '',
    message: '',
    notifie: 0,
    projet_id: selectedProjet?.id || 1, //''
  };

  const validationSchemaRef = useRef(
    yup.object().shape({
      telephone: yup
        .string()
        .matches(/^\d*$/, 'Le numéro de téléphone doit être un nombre')
        .required('Le numéro de téléphone est requis')
        .min(10, 'Le numéro de téléphone doit avoir au moins 10 chiffres')
        .max(14, 'Le numéro de téléphone ne doit pas dépasser 14 chiffres'),
      /*  telephone_num2: yup
        .string()
        .matches(/^\d*$/, 'Le numéro de téléphone doit être un nombre')
        .min(10, 'Le numéro de téléphone doit avoir au moins 10 chiffres')
        .max(14, 'Le numéro de téléphone ne doit pas dépasser 14 chiffres')
        .nullable() // allows null value
        .notRequired(), // makes it optional, so null is acceptable*/
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
  const isEditing = !!id;

  useEffect(() => {
    fetchData_Select('sources', setSources, setLoading_auto);

    if (source_txt === 'Partenaire') {
      // Fetch partenaires when source_txt is 'Partenaire'
      fetchDataByProjet('partenaires', setPartenaires, setLoading_auto);
    }
  }, [source_txt]);

  useEffect(() => {
    setLoading({ ...loading, form: true }); // Set loading to true when starting to fetch data

    if (isEditing) {
      axios
        .get(`${APIURL.PROSPECTS}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) {
            router.back();
            return;
          }

          const prospect = res.data.prospect;

          // Utility function to handle `null` values gracefully
          const getValue = (field) =>
            field !== null && field !== undefined ? field : '';

          setFormData({
            telephone: getValue(prospect.telephone),
            nom: getValue(prospect.nom),
            prenom: getValue(prospect.prenom),
            telephone_num2:
              prospect.telephone_num2 === 'null'
                ? null
                : getValue(prospect.telephone_num2),

            email: prospect.email === 'null' ? null : getValue(prospect.email),
            notifie: getValue(prospect.notifie),
            cin: getValue(prospect.cin),
            message: getValue(prospect.message),
            partenaire_id: getValue(prospect.partenaire_id),
          });
          // Handling source and partenaire if they exist
          if (prospect.source) {
            setValue('source', prospect.source.id || '');
            setSource_txt(prospect.source.source || '');
          } else {
            setValue('source', '');
            setSource_txt('');
          }

          setPartenaire(prospect.partenaire?.id || '');
        })
        .catch((error) => console.log(error.message))
        .finally(() => {
          setLoading({ ...loading, form: false }); // Ensure loading is set to false after fetching data
        });
    } else {
      reset(defaultValues, { errors: true, dirtyFields: true, isDirty: true });
      setLoading({ ...loading, form: false }); // Ensure loading is set to false for a new form (no data fetching)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id, isEditing, reset, router]);

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [formData, setValue]);

  // Replace your existing onSubmit function with this:
  const onSubmit = async (data) => {
    console.log(data);

    setIsSubmitting(true); // Set manual loading state
    setBackendErrors({});

    try {
      const dataToSend = new FormData();
      let url = APIURL.PROSPECTS;
      let method = 'post';

      // Convert "null" string to actual null before appending to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value === 'null') value = null;
        dataToSend.append(key, value === null ? '' : value);
      });

      if (isEditing) {
        url = `${url}/${id}`;
        method = 'put';
      }

      const res = await axios({
        method,
        url,
        data: dataToSend,
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let message = 'Quelque chose ne va pas bien';
      if (res.status === 200 || res.status === 201) {
        message = `Le prospect a été ${
          isEditing ? 'modifié' : 'créé'
        } avec succès`;
        reset(defaultValues);
        toast.success(message);
        localStorage.setItem('visite_fetch_show', 1);

        if (onSuccess) onSuccess();
        if (onClose) onClose();
        else router.push(ENDPOINTS.PROSPECTS);
      } else if (res.status === 422) {
        message = res.data.message;
        setBackendErrors(res.data.errors);
        setTimeout(() => setBackendErrors({}), 5000);
      }
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        setBackendErrors(response.data.errors);
        setTimeout(() => setBackendErrors({}), 5000);
      }
    } finally {
      setIsSubmitting(false); // Reset manual loading state
    }
  };

  const handleChange_email = (event) => {
    const inputText = event.target.value || ''; // Ensure inputText is at least an empty string

    if (inputText.length >= 3) {
      const timeout = setTimeout(() => {
        fetch_cin_tel_email(inputText, 'email');
      }, 3000);

      return () => clearTimeout(timeout); // Clear timeout on subsequent calls
    }
  };

  const handleChange_cin = (event) => {
    console.log('le evenet==>' + event);
    const inputText = event.target.value || ''; // Ensure inputText is at least an empty string

    if (inputText.length >= 3) {
      const timeout = setTimeout(() => {
        fetch_cin_tel_email(inputText, 'cin');
      }, 3000);

      return () => clearTimeout(timeout); // Clear timeout on subsequent calls
    }
  };

  const handleChange_tele = (event) => {
    const inputText = event.target.value || ''; // Ensure inputText is at least an empty string
    if (inputText.length >= 10) {
      const timeout = setTimeout(() => {
        fetch_cin_tel_email(event.target.value, 'tel');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  };

  const fetch_cin_tel_email = async (v, text) => {
    var route = ' ';
    if (text == 'cin') {
      route = 'search_client_by_cin';
    } else if (text == 'tel') {
      route = 'search_client_by_phone';
    } else {
      route = 'search_client_by_email';
    }

    //seeach by cin
    await axios
      .get(`${APIURL.ROOT}/v1/` + route + `/` + v, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        //result client
        if (res.data.client != null) {
          setInfo_client(
            'le ' +
              text +
              ':' +
              v +
              ' appartient au Client ' +
              res?.data?.client?.nom +
              ' ' +
              res?.data?.client?.prenom +
              '.Veuillez changer ce Cin !'
          );
          set_check(true);
          setValue('nom', res.data.client.nom);
          setValue('prenom', res.data.client.prenom);
          setValue('email', res.data.client.email);
          setValue('telephone', res.data.client.telephone_num1);
          setValue('telephone_num2', res.data.client.telephone_num2);
        } else {
          setInfo_client('');
          set_check(false);
        }

        //resultat prospect

        if (res.data.prospect != null) {
          setInfo_prospect(
            'le ' +
              text +
              ':' +
              v +
              ' appartient au Prospect ' +
              res?.data?.prospect?.nom +
              ' ' +
              res?.data?.prospect?.prenom
          );
          set_check_p(true);
          setValue('nom', res.data.prospect.nom);
          setValue('prenom', res.data.prospect.prenom);
          setValue('email', res.data.prospect.email);
          setValue('telephone', res.data.prospect.telephone);
          setValue('telephone_num2', res.data.prospect.telephone_num2);

          set_check_p(true);
        } else {
          set_check_p(false);
        }
      })
      .catch(() => {});
  };

// Update your handleSourceChange function
const handleSourceChange = (optionValue) => {
  const selectedOption = sourceOptions.find(opt => opt.value === optionValue);
  setValue('partenaire_id', '');
  setSource_txt(selectedOption ? selectedOption.label : '');
  setValue('source', optionValue || '');
};

// Update your handlePartenaireChange function
const handlePartenaireChange = (optionValue) => {
  const selectedOption = partenaireOptions.find(opt => opt.value === optionValue);
  setPartenaire(optionValue || '');
  setValue('partenaire_id', optionValue || '');
};

// Transform your data
const sourceOptions = sources.map(source => ({
  value: source.id.toString(),
  label: source.source
}));

const partenaireOptions = partenaires.map(partenaire => ({
  value: partenaire.id.toString(),
  label: partenaire.description
}));

  if (isEditing && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.PROSPECTS}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} un prospect`}
          />
        </div>
        <div className="p-6 mt-4 min-h-[89vh] bg-white shadow-md rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {check && info_client && (
                <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded">
                  <p>{info_client}</p>
                </div>
              )}

              {check_p && info_prospect && (
                <div className="bg-blue-100 !text-blue-700 border-l-4 border-blue-500 p-4 text-center rounded">
                  <p>{info_prospect}</p>
                </div>
              )}

              {/* First set of fields (Responsive grid) */}
              <div>
                <h2 className="text-xl font-medium border-b pb-2">
                  Informations du prospect
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <div>
                  <TextField
                    label="Nom:"
                    name="nom"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </div>
                <div>
                  <TextField
                    label="Prenom:"
                    name="prenom"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </div>
                <div>
                  <TextField
                    label="Cin:"
                    name="cin"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    onChange={handleChange_cin}
                  />
                </div>
              </div>

              {/* Second set of fields (Responsive grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <div>
                  <TextField
                    label="Email:"
                    name="email"
                    type="email"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    onChange={handleChange_email}
                  />
                </div>
                <div>
                  <TextField
                    label="Téléphone:"
                    required
                    name="telephone"
                    type="number"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    onChange={handleChange_tele}
                  />
                </div>
                <div>
                  <TextField
                    label="Téléphone 2:"
                    name="telephone_num2"
                    type="number"
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                    onChange={handleChange_tele}
                  />
                </div>
                {/* Source Select */}
                  <div className="">
                    <SelectInput
                      placeholder='Sélectionner une source'
                      name="source"
                      label="Source:"
                      options={sourceOptions}
                      value={watch('source')?.toString()}
                      loading={loading_auto} // Pass loading state to component
                      errors={errors}
                      backendErrors={backendErrors}
                      onChange={handleSourceChange}
                    />
                  </div>

                {/* Third set of fields (Responsive grid) */}
                {/* Accepte d'être contacté */}
                <div className="flex items-center justify-between w-full mt-4">
                  <Controller
                    name="notifie"
                    control={control}
                    defaultValue={defaultValues['notifie'] || 0}
                    render={({ field }) => (
                      <label className="flex justify-center items-center space-x-2">
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value === 1}
                          onChange={(e) =>
                            field.onChange(e.target.checked ? 1 : 0)
                          }
                          className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                        />
                        <span
                          className={`text-sm font-medium ${
                            field.value === 1 ? 'text-[#009FFF]' : ''
                          }`}
                        >
                          Accepte {"d'"}être contacté 
                        </span>
                      </label>
                    )}
                  />
                </div>

                {/* Partenaire Select (conditionally rendered) */}
                <div className="">
                  {source_txt === 'Partenaire' && (
                    <SelectInput
                      placeholder='Sélectionner un partenaire'
                      name="partenaire_id"
                      label="Partenaire:"
                      options={partenaireOptions}
                      value={watch('partenaire_id')?.toString()}
                      loading={loading_auto} // Pass loading state to component
                      onChange={handlePartenaireChange}
                      errors={errors}
                      backendErrors={backendErrors}
                    />
                  )}
                </div>
              </div>

              {/* Message field in the next row */}
              <div className="flex-1 mt-4 ">
                <TextField
                  label="Message:"
                  name="message"
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

              {/* Buttons */}
            </div>
            <div className="flex justify-center items-center gap-4 xl:mt-32">
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
              <Button type="submit" disabled={isSubmitting || check || check_p}>
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
      </div>
    </>
  );
}
