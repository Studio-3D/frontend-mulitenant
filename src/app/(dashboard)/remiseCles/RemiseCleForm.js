'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Importez vos composants Input, InputSelect, SelectInput ici
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS, RESOURCE_URL } from '@/configs/api';
import BreadCrumb from '../navigation/BreadCrumb';
import Button from '@/components/Button';
import LoadingSpin from '@/components/LoadingSpin';
import { useSociete } from '@/context/SocieteContext';

// Create schema based on user role
const createSchema = (userRole) => {
  const baseSchema = {
    date_remise: yup.string().required('La Date De Remise est Obligatoire'),
    bien_id: yup.string().required('Le Bien est obligatoire'),
    fichier: yup
      .mixed()
      .test('fileRequired', 'Le fichier est requis', (value) => {
        // This validation will only work if you're using a custom file input
        // For standard file inputs, we'll handle validation manually
        return true; // Bypass Yup validation for files
      }),
  };

  // Add user_id_remise validation only for users with role <= 2
  if (userRole <= 2) {
    baseSchema.user_id_remise = yup
      .string()
      .required('Le Commercial est obligatoire');
  }

  return yup.object().shape(baseSchema);
};

const RemiseCleForm = ({ id = null }) => {
  const router = useRouter();
  const { selectedSociete } = useSociete();
  const { selectedProjet } = useProjet();
  const { user } = useAuth();

  const [biens, setBiens] = useState([]);
  const [cc, setCC] = useState([]);
  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loading_b, setLoading_b] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const accessToken = localStorage.getItem('accessToken');
  const [formData, setFormData] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const defaultValues = {
    date_remise: '',
    user_id_remise: user?.role == 3 ? user.user_id_origin : '',
    bien_id: '',
    fichier: '',
    bien_prop: '',
    projet_id: selectedProjet?.id || '',
  };

  const schema = createSchema(user?.role);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const isEditing = Boolean(id);

  const [newFile, setNewFile] = useState(null);
  const [newFileUrl, setNewFileUrl] = useState(null);

  const handleReplaceFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setNewFile(file);
      setNewFileUrl(tempUrl);
      setExistingFileUrl(null);
      setFileName(file.name);
      setFile(file);
      setValue('fichier', file.name); // Set the file name for validation
    }
  };

  // Simple cache et comparaison for return back en cas de changer projet
       const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    

  	 useEffect(() => {
  if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldProjetId||oldSocieteId) {
      // Projet ou société a changé
      //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
      router.push('/remiseCles');
    }
    setOldSocieteId(selectedSociete?.id)
    setOldProjetId(selectedProjet?.id);
  }
}, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);

  // Fonction utilitaire pour afficher le nom complet du bien
  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }

  const fetch_cc = async () => {
    try {
      if (!accessToken) {
        console.warn("Pas de token d'accès");
        return;
      }
      const response = await axios.get(
        `${APIURL.ROOTV1}/commerciaux/${selectedProjet?.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const { data } = response;
      setCC(data.data);
    } catch (error) {
      console.error('Erreur fetch_cc:', error);
    }
  };

  const fetchbiens = async () => {
    try {
      if (!accessToken) {
        console.warn("Pas de token d'accès");
        return;
      }
      setLoading_b(true);
      const response = await axios.get(
        `${APIURL.ROOTV1}/getBiens_Vendu_ByProjet_Concat/${selectedProjet?.id}/BiensNonRemise`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      console.log('fetchbiens response:', response.data);
      setBiens(response.data.biens || []);
    } catch (error) {
      console.error('Erreur fetchbiens:', error);
    } finally {
      setLoading_b(false);
    }
  };

  useEffect(() => {
    fetch_cc();
    fetchbiens();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setLoadingData(true);
      axios
        .get(`${APIURL.REMISECLES}/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          if (res.status === 200) {
            const remise = res.data.remise;
            setValue('date_remise', remise.date_remise || '');
            setValue('user_id_remise', remise.user_id_remis || '');
            setValue('bien_prop', NomBienComplet(remise.bien) || '');
            setValue('bien_id', remise.bien?.id || '');
            setValue('fichier', remise.fichier || '');
            setExistingFileUrl(remise.fichier);
            setFormData({});
          } else {
            toast.error('Remise clé introuvable');
            router.back();
          }
        })
        .catch(() => {
          toast.error('Erreur lors du chargement de la remise clé');
          router.back();
        })
        .finally(() => setLoadingData(false));
    } else {
      reset(defaultValues);
    }
  }, [id, isEditing, setValue, reset]);

  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Seuls les fichiers images sont acceptés');
        e.target.value = null;
        return;
      }
      setValue('fichier', selectedFile.name); // Set the file name for validation
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setExistingFileUrl(null);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data) => {
    // Manual file validation
    if (!isEditing && !file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setBackendErrors({});

    try {
      const formData = new FormData();
      formData.append('date_remise', data.date_remise);

      // Only append user_id_remise if user role is <= 2
      if (user?.role <= 2) {
        formData.append('user_id_remise', data.user_id_remise);
      }

      formData.append('bien_id', data.bien_id);
      formData.append('projet_id', data.projet_id);

      if (file) {
        formData.append('fichier', file);
      }

      let url = APIURL.REMISECLES;
      if (isEditing) {
        formData.append('_method', 'PATCH');
        url = `${url}/${id}`;
      }

      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        toast.success(
          `Remise Clé ${isEditing ? 'modifiée' : 'créée'} avec succès`
        );
        router.push(ENDPOINTS.REMISECLES);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setBackendErrors(error.response.data.errors || {});
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error('Une erreur est survenue lors de la soumission');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.REMISECLES}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} Remise Clé`}
          />
        </div>
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=""
          encType="multipart/form-data"
        >
          {/* Ligne 1 : Date, Bien, Responsable (conditionnel) */}
          <div
            className={`grid gap-6 ${
              user?.role <= 2
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {!isEditing ? (
              <SelectInput
                label="Bien"
                name="bien_id"
                value={watch('bien_id')}
                required={true}
                options={
                  Array.isArray(biens)
                    ? biens.map((s) => ({
                        value: s.id,
                        label: NomBienComplet(s),
                      }))
                    : []
                }
                loading={loading_b}
                onChange={(value) => {
                  // Handle both direct value and object with value property
                  const selectedValue = value?.value || value;
                  setValue('bien_id', selectedValue || null);
                }}
                error={errors?.bien_id?.message}
                placeholder="Choisir un bien"
              />
            ) : (
              <Input
                type="text"
                label={'Bien'}
                value={watch('bien_prop')}
                disabled={true}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
            )}

            {/* Only show Responsable field for users with role <= 2 */}
            {user?.role <= 2 && (
              <SelectInput
                label="Responsable"
                name="user_id_remise"
                value={watch('user_id_remise')}
                required={true}
                options={
                  Array.isArray(cc)
                    ? cc.map((c) => ({
                        value: c.user.id,
                        label: `${c.user.prenom} ${c.user.name}`,
                      }))
                    : []
                }
                loading={loading}
                onChange={(value) => {
                  // Handle both string/number values and potential object values
                  const selectedValue =
                    value?.value !== undefined ? value.value : value;
                  setValue('user_id_remise', selectedValue || null);
                }}
                error={errors?.user_id_remise?.message}
                placeholder="Choisir un commercial"
              />
            )}
            <Input
              label="Date Remise :"
              name="date_remise"
              type="date"
              value={watch('date_remise')}
              onChange={(e) => setValue('date_remise', e.target.value)}
              required
              error={
                errors?.date_remise?.message || backendErrors?.date_remise?.[0]
              }
            />
          </div>

          {/* Ligne 2 : Fichier + Aperçu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mt-4">
            {!isEditing && (
              <div>
                {/* Use Controller for file input with custom rendering */}
                <Controller
                  name="fichier"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col w-full">
                      <label className="font-medium !text-gray-700">
                        Pièce Jointe :
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={(e) => {
                            handleFileChange(e);
                            field.onChange(e.target.files[0]?.name || '');
                          }}
                          className={`h-[38px] text-[15px] px-4 py-1 outline-none border rounded-md w-full
                            ${
                              fieldState.error || backendErrors?.fichier?.[0]
                                ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                                : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
                            }
                          `}
                          required={!isEditing}
                        />
                      </div>
                      {(fieldState.error || backendErrors?.fichier?.[0]) && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldState.error?.message ||
                            backendErrors?.fichier?.[0]}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {(existingFileUrl || newFileUrl) && (
              <div className="relative w-28 h-28 mt-2 group">
                <img
                  src={
                    newFileUrl
                      ? newFileUrl
                      : `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${existingFileUrl}`
                  }
                  alt="Aperçu pièce jointe"
                  className="w-full h-full object-cover rounded shadow cursor-pointer hover:scale-105 transition-transform"
                  onClick={() =>
                    window.open(
                      newFileUrl
                        ? newFileUrl
                        : `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${existingFileUrl}`,
                      '_blank'
                    )
                  }
                  title="Cliquer pour agrandir"
                />

                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label
                    className="bg-white p-1 rounded-full shadow hover:bg-gray-100 cursor-pointer"
                    title="Remplacer"
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleReplaceFile}
                    />
                    ✏️
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RemiseCleForm;
