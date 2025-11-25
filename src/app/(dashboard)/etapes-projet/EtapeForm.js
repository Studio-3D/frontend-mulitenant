import React from 'react';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

import BreadCrumb from '../navigation/BreadCrumb';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../configs/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import TextField from '@/components/Textfield'; // Import the component
import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import SelectInput from '@/components/SelectInput';
import { useProjet } from '@/context/ProjetContext';
export default function EtapeForm({ id, onClose, onSuccess }) {
  const { token } = useAuth();
  const router = useRouter();

  const accessToken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();

  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState({});
  const [loading_edit, setLoading_edit] = useState(false);

  const defaultValues = {
    description: '', // Make sure all fields you need are present
    date_debut_prevu: '',
    date_fin_prevu: '',
   // etat: '',
    projet_id: selectedProjet?.id, //''
  };

  const validationSchemaRef = useRef(
    yup.object().shape({
      description: yup.string().required('la Description est Obligatoire'),
      date_debut_prevu: yup.string().required('La Date de début prévu est Obligatoire'),
      date_fin_prevu: yup.string().required('La Date fin prévu est Obligatoire'),
     // etat: yup.string().required('Etat est Obligatoire'),
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

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/crm/prospects');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  useEffect(() => {
    if (isEditing) {
      setLoading_edit(true);
      axios
        .get(`${APIURL.ETAPESPROJET}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) router.back();
          const ech = res.data.ech;

          setValue('description', ech.description || '');
          setValue('date_debut_prevu', ech.date_debut_prevu || '');
          setValue('date_fin_prevu', ech.date_fin_prevu || '');
         // setValue('etat', ech.etat || '');

          setLoading_edit(false);
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



  // Replace your existing onSubmit function with this:
  const onSubmit = (data) => {
    setLoading({ ...loading, form: true });
    setBackendErrors({});
    const dataToSend = new FormData();
    let url = APIURL.ETAPESPROJET;

    Object.entries(data).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    if (isEditing) {
      dataToSend.append('_method', 'PATCH');
      url = `${url}/${id}`;
    }

    axios
      .post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      .then((res) => {
        let message = 'Quelque chose ne va pas bien';
        if (res.status === 200) {
          message = `Etape a été ${
            isEditing ? 'modifié' : 'créé'
          } avec succès`;
          reset(defaultValues);
          toast.success(message);
          router.push(ENDPOINTS.ETAPESPROJET);
        } else if (res.status === 422) {
          message = res.data.message;
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
      .finally(() => setLoading({ ...loading, form: false }));
  };

  if (loading_edit) {
    return <LoadingSpin />;
  }
 /* const etatOptions = [
    { value: '0', label: 'Non Commencé' },
    { value: '1', label: 'En Cours' },
    { value: '2', label: 'Terminé' },
  ];*/

  return (
    <>
      <div className="">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.ETAPESPROJET}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} une Etape`}
          />
        </div>
        <div className="p-6 mt-4 min-h-[89vh] bg-white shadow-md rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* First set of fields (Responsive grid) */}

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <div>
                  <TextField
                    label="Description:"
                    name="description"
                    control={control}
                    errors={errors}
                    type="text"
                    required
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </div>
                <div>
                  <TextField
                    label="Date de début prévue:"
                    name="date_debut_prevu"
                    type="date"
                    required
                    control={control}
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </div>
                <div>
                  <TextField
                    label="Date fin prévu:"
                    name="date_fin_prevu"
                    type="date"
                    control={control}
                    required
                    errors={errors}
                    backendErrors={backendErrors}
                    defaultValues={defaultValues}
                  />
                </div>
               {/* <div className="">
                  <Controller
                    name="etat"
                    control={control}
                    render={({ field }) => (
                      <SelectInput
                        {...field}
                        placeholder="Sélectionner un etat"
                        label="Etat:"
                        options={etatOptions}
                        required
                        loading={false}
                        errors={errors}
                        backendErrors={backendErrors}
                      />
                    )}
                  />
                </div>*/}
              </div>

              {/* Buttons */}
            </div>
            <div className="flex justify-center items-center gap-4 xl:mt-32">
              <Button
                type="button"
                onClick={() => {
                  router.back();
                }}
                disabled={loading.form} // Disable cancel during submit
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading.form}>
                {loading.form ? (
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
