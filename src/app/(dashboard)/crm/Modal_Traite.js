'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { APIURL } from '../../../configs/api';
import { useAuth } from '../../../context/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
export default function Modal_Traite({ onClose, id, text, client, type_menu }) {
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState(null);
  const defaultValues = {
    date: null, // Make sure all fields you need are presen
    commentaire: '',
    nom_prenom: client,
  };
  const validationSchemaRef = useRef(
    yup.object().shape({
      commentaire: yup.string().required('La Commentaire est requis'),
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

  const onSubmit = (data) => {
    console.log(id);
    setLoading({ ...loading, form: true });
    setBackendErrors();

    // Simplified URL logic
    const isAppel =
      type_menu == 1 || (!client && type_menu != 3) || type_menu == 4;
    const url = isAppel
      ? `${APIURL.ROOTV1}/traiter_relance_rdv_appel/${Number(id)}`
      : `${APIURL.ROOTV1}/traiter_relance_rdv_visite/${Number(id)}`;

    axios({
      method: 'put',
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
        console.log('type_menu==>', type_menu); // Verify this shows 3

        if (res.status === 200) {
          const action = watch('date') != null ? 'Modifié' : 'Traité';
          const entity = text === 'RDV' ? 'Le Rendez Vous' : 'La Relance';
          toast.success(`${entity} est ${action} avec succès`);
          onClose();
          const key =
            type_menu == 1
              ? 'load_data_rdv_relance_appels'
              : type_menu == 2
              ? 'load_data_rdv_relance_visites'
              : type_menu == 3
              ? 'visite_fetch_show'
              : type_menu == 4
              ? 'load_data_journaux'
              : '';

          localStorage.setItem(key, 1);
          console.log('final key==>', key); // Should now show correct value
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
                style={{ marginLeft: '-10px!important' }}
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

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-blue-600 px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Traiter {text == 'RDV' ? 'un Rendez-vous' : 'une Relance'}
          </h1>
        </div>
      </div>

      <div className="p-4 w-[500px] ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 mx-auto w-full max-w-[360px] flex flex-col items-center"
        >
          {/* Row for Input and MdPrint */}
          {client && (
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
          )}
          <div className="flex items-center space-x-2 w-full">
            {
              <>
                <TextField
                  type={text == 'RDV' ? 'datetime-local' : 'date'}
                  label={
                    text == 'RDV'
                      ? 'Nouveau Rendez Vous'
                      : 'Nouvelle Date Relance'
                  }
                  name={'date'}
                  //required={true}//if is full means new relance/rdv otherwise is treated
                  control={control}
                  errors={errors}
                />
              </>
            }
          </div>

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
