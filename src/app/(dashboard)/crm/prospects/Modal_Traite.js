'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { APIURL } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';
import {
  Statuts_Prospect_Traitement,
  getProspectStatusLabel,
} from '../../../../../src/configs/enum';
import Autocomplete from '@/components/Autocomplete';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
export default function Modal_Traite({
  onSuccess, // Ajouter cette prop

  onClose,
  id,
  num_tel,
  nom_prenom,
  from_prospect_show = false,
}) {
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState(null);
  const defaultValues = {
    rdv: '', // Make sure all fields you need are present
    statut: '',
    date_rappel: '',
    commentaire: '',
    nom_prenom: nom_prenom,
    telephone: num_tel,
  };
  const validationSchemaRef = useRef(
    yup.object().shape({
      statut: yup.string().required('Le statut est requis'),
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
  // First select: Source
  const handleStatutChange = (newValue) => {
    // You can access newValue.id or newValue.label here
    console.log('Selected option:', newValue);
  };

  const onSubmit = (data) => {
    console.log(id);
    setLoading({ ...loading, form: true });
    setBackendErrors();

    let url = `${APIURL.ROOTV1}/traiter_prospect/${JSON.stringify(id)}`;
    let method = 'put';

    axios({
      method: method,
      url: url,
      data: data,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setLoading({ ...loading, form: false });

        if (res.status === 200) {
          toast.success('Le Prospect est Traité avec succès');
          // Appeler onSuccess uniquement si le traitement est réussi
          if (onSuccess) {
            onSuccess();
          } else {
            // Fallback pour la compatibilité
            onClose();
          }
          if (from_prospect_show == false) {
            localStorage.setItem('load_data_prospect', 1);
          }
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
        console.error('Erreur détaillée:', error);
        toast.error("Une erreur s'est produite: " + (error.message || 'Erreur inconnue'));
      }
      // Toujours appeler onClose en cas d'erreur, mais sans onSuccess
      onClose();
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
                style={{ marginLeft: '-10px!important' }}
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
          <div className="mt-1 text-xs !text-red-600">
            <p>{errors[name]?.message}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-[#009FFF] px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Traiter Prospect
          </h1>
        </div>
      </div>

      <div className="p-4 w-[500px] ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 mx-auto w-full max-w-[360px] flex flex-col items-center"
        >
          {/* Row for Input and MdPrint */}
          <div className="flex items-center space-x-2 w-full">
            {
              <>
                <TextField
                  type="text"
                  label="Nom Complet:"
                  disabled={true}
                  name="nom_prenom"
                  control={control}
                  errors={errors}
                  width="w-80" // Optional: Change height for textarea
                />
              </>
            }
          </div>
          <div className="flex items-center space-x-2 w-full">
            {
              <>
                <TextField
                  type="text"
                  label="Téléphone:"
                  disabled={true}
                  name="telephone"
                  control={control}
                  errors={errors}
                  width="w-80" // Optional: Change height for textarea
                />
              </>
            }
          </div>
          <div className="flex items-center space-x-2 w-full">
            <Controller
              name="statut"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  label="Statut:"
                  required={true}
                  options={Object.values(Statuts_Prospect_Traitement)}
                  choix="label"
                  value={field.value}
                  onChange={(selectedOption) => {
                    // Store the numeric id; backend will store numbers, frontend maps to labels
                    field.onChange(selectedOption?.id || '');
                    handleStatutChange(selectedOption);
                  }}
                  errors={errors}
                  width="w-80"
                  name="statut"
                />
              )}
            />
          </div>
          {getProspectStatusLabel(watch('statut')) ==
            'Planification Rendez Vous' && (
            <div className="flex items-center space-x-2 w-full">
              {
                <>
                  <TextField
                    type="datetime-local"
                    label="Rendez vous:"
                    name="rdv"
                    required={
                      watch('statut') == 'Planification Rendez Vous'
                        ? true
                        : false
                    }
                    control={control}
                    errors={errors}
                  />
                </>
              }
            </div>
          )}
          {getProspectStatusLabel(watch('statut')) == 'Rappel' && (
            <div className="flex items-center space-x-2 w-full">
              {
                <>
                  <TextField
                    type="date"
                    label="Date Rappel:"
                    name="date_rappel"
                    required={watch('statut') == 'Rappel' ? true : false}
                    control={control}
                    errors={errors}
                    defaultValues={defaultValues}
                  />
                </>
              }
            </div>
          )}

          <div className="flex items-center space-x-2 w-full">
            {
              <>
                <TextField
                  label="Commentaire :"
                  name="commentaire"
                  required={false}
                  control={control}
                  errors={errors}
                  isTextarea={true} // Specify it's a textarea
                  height="h-24"
                  width="w-80" // Optional: Change height for textarea
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
