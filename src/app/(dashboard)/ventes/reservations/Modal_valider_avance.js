'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { APIURL } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SelectInput from '@/components/SelectInput';
export default function Modal_valider_avance({
  onload_res_false,
  onload_res_true,
  id,
  av_id,
  first_num_recu,
  onClose_all,
  onClose,
  prix,
  avance,
}) {
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState(null);
  const [action, setAction] = useState(''); // Define action state

  const defaultValues = {
    action: '',
    statut_res: 1, // Make sure all fields you need are presen
    with_avance: 1,
    n_remise: '',
    date_encaiss: '',
    commentaire_av: '',
    av_id: av_id,
    statut_av: 1,
    prix: prix,
    avance: avance,
  };

  const validationSchemaRef = useRef(yup.object().shape({}));
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues: {
      ...defaultValues, // Spread your existing default values
      action: action, // Include the current action state
    },
  });

  //valider reservation with avance

  const onSubmit = (data) => {
    console.log('Form data:', data); // Should now show all form values

    // Manual validation
    const errors = {};

    if (data.action === '1') {
      if (!data.n_remise) {
        errors.n_remise = 'Le numéro de remise est requis';
      }
      if (!data.date_encaiss) {
        errors.date_encaiss = "La date d'encaissement est requise";
      }
    } else if (data.action === '2') {
      if (!data.commentaire_av) {
        errors.commentaire_av = "Le commentaire d'avance est requis";
      }
    }

    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((key) => {
        setError(key, {
          type: 'manual',
          message: errors[key],
        });
      });
      return;
    }

    // Proceed with form submission
    setLoading({ ...loading, form: true });
    setBackendErrors(null);
    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/traiter_reservation/${Number(id)}`,
      data: data,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setLoading({ ...loading, form: false });
        if (res.status == 200) {
          toast.success("La Réservation et l'avance sont Traités avec succès");
          onClose_all();
          localStorage.setItem('load_data_reservation', 1);
        }
      })
      .catch((error) => {
        setLoading({ ...loading, form: false });
        const response = error.response;
        if (response?.status === 422) {
          setBackendErrors(response.data.message || {});
          toast.error(response.data.message || 'Erreur de validation.');
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
  const statuts = [
    { id: '1', label: 'Validé ' },
    { id: '2', label: 'Rejeté' },
    // ... more statuses
  ];

  //valider reservation sans avancesetLoading_v
  const handle_annuler_avance = () => {
    onClose();
    onload_res_true();
    const formData = new FormData();
    formData.append('statut_res', 1);
    formData.append('with_avance', 0);
    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/traiter_reservation/${Number(id)}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        toast.success('Réservation Validé avec succès');

        onload_res_false();
        onClose_all();
        localStorage.setItem('load_data_reservation', 1);
      })
      .catch(() => {
        console.log('err');
      });
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-green-600 px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
           Etape 2: Traiter Premier Avance N° {first_num_recu}
          </h1>
        </div>
      </div>

      <div className="p-4 w-[600px] ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" mx-auto w-full max-w-[360px] flex flex-col items-center"
        >
          <div className="flex flex-col items-center justify-center w-full ">
            <div className="w-full max-w-md">
              {' '}
              {/* Control width of the content */}
              <TextField
                type="text"
                label="Prix:"
                disabled={true}
                name="prix"
                control={control}
                errors={errors}
                width="w-full" // Make it take full width of its container
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-md">
              {' '}
              {/* Control width of the content */}
              <TextField
                type="text"
                label="Avance:"
                disabled={true}
                name="avance"
                control={control}
                errors={errors}
                width="w-full" // Make it take full width of its container
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full ">
            <div className="w-full max-w-md">
              <SelectInput
                value={watch('action')}
                onChange={(e) => {
                  console.log('e==>' + JSON.stringify(e));
                  setValue('action', e);
                  setAction(e);
                }}
                options={statuts.map((status) => ({
                  value: status.id,
                  label: status.label,
                }))}
                placeholder="Choisir un Statut d Paiement"
                className="h-10 text-sm"
                width="w-90"
              />
            </div>
          </div>
          {/* Row for Input and MdPrint */}
          {watch('action') == 1 && (
            <>
              <div className="flex flex-col items-center justify-center w-full ">
                <div className="w-full max-w-md">
                  {' '}
                  {
                    <>
                      <TextField
                        type="number"
                        required
                        label="N° Encaissement:"
                        name="n_remise"
                        control={control}
                        errors={errors}
                        // Optional: Change height for textarea
                      />
                    </>
                  }
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-full ">
                <div className="w-full max-w-md">
                  {' '}
                  {
                    <>
                      <TextField
                        type="date"
                        required
                        label="Date Encaissement:"
                        name="date_encaiss"
                        control={control}
                        errors={errors}
                        // Optional: Change height for textarea
                      />
                    </>
                  }
                </div>
              </div>
            </>
          )}

          {watch('action') == 2 && (
            <div className="flex flex-col items-center justify-center w-full ">
              <div className="w-full max-w-md">
                {' '}
                {
                  <>
                    <TextField
                      label="Commentaire :"
                      name="commentaire_av"
                      required={true}
                      control={control}
                      errors={errors}
                      isTextarea={true} // Specify it's a textarea
                      height="h-24"
                      // Optional: Change height for textarea
                    />
                  </>
                }
              </div>
            </div>
          )}

          <div className="w-full">
            {backendErrors != null && (
              <p className="!text-red-600 text-sm mb-2">{backendErrors}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-[10%]">
            <Button type="button" onClick={handle_annuler_avance}>
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
           <div className="text-center pt-2">
              <button onClick={onClose} className="text-blue ">
                Retour à {'l\'étape'} précédente
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}