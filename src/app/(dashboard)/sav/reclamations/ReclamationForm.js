import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import SelectInput from '@/components/SelectInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';
import BreadCrumb from '../../navigation/BreadCrumb';

import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';

import ConfirmDialog from '@/components/dialog-File';
import { useProjet } from '@/context/ProjetContext';
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import Input from '@/components/Input';

export default function ReclamationForm({ id }) {
  const { token } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);

  const accessToken = token || localStorage.getItem('accessToken');
  const { user } = useAuth();
  const [emplacements] = useState([
    { id: '1', description: 'Salle de Bain' },
    { id: '2', description: 'Cuisine' },
    { id: '3', description: 'Chambre' },
    { id: '4', description: 'Balcon' },
    { id: '5', description: 'Couloir' },
    { id: '6', description: 'Fuite' },
    { id: '7', description: 'Buanderie' },
    { id: '8', description: 'Placard' },
  ]);

  const emplacementOptions = emplacements.map((s) => ({
    value: s.description,
    label: s.description,
  }));

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [BIENS, setbiens] = useState([]);

  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState({});

  const [clients, setClients] = useState([]);
  const [loading_list, setLoading_list] = useState(false);
  const [filesList, setfilesList] = useState(null);
  const [selectedFiles_rsv, setSelectedFiles_rsv] = useState([]);
  const [validerfile, setValiderfile] = useState(false);
  const [myfile, setMyfile] = useState(false);
  const [myfile_1, setMyfile_1] = useState(false);
  const { selectedProjet } = useProjet();


  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.back();
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
 const fetchServices = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/ServicesPrestataires/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { data } = response;
    
    // Filter services to only include those with prestataires
    const servicesWithPrestataires = data.services.filter(
      service => service.prestataires && service.prestataires.length > 0
    );
    
    setServices(servicesWithPrestataires);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  useEffect(() => {
    fetchbiens();
    fetchServices();
  }, []);

  const defaultValues = {
    bien_id: '',
    client_id: 1,
    service_id: '',
    date_reclamation: '',
    emplacements: '',
    projet_id: selectedProjet?.id,
    commentaires: '',
    problemes: '',
  };

  const validationSchemaRef = useRef(
    yup.object().shape({
      date_reclamation: yup
        .string()
        .required('la date reclamation est Obligatoire'),
      bien_id: yup.string().required('le Bien est Obligatoire'),
      client_id: yup.string().required('le Client est Obligatoire'),
    })
  );

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });
  const isEditing = !!id;
  useEffect(() => {
    if (isEditing) {
      axios
        .get(`${APIURL.ReclamationsSav}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) router.back();
          const rec = res.data.reclamation;
          setClients(
            res.data.bien.reservation.aquereurs.map((aq) => ({
              id: aq.client.id,
              nom: aq.client.nom,
              prenom: aq.client.prenom,
            }))
          );
          setValue('bien_id', rec.bien_id || '');
          setValue('client_id', rec.client_id || '');
          setValue('service_id', rec.service_id || '');
          setValue('date_reclamation', rec.date_reclamation || '');
          setValue('problemes', rec.problemes || '');
          const emplacementsArray = rec.emplacements
            .split(',')
            .map((emplacement) => emplacement.trim());
          setValue('emplacements', emplacementsArray);

          setSelectedFiles_rsv(rec.piece_jointe);

          setFormData({});
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

  const fetchbiens = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${APIURL.ROOTV1}/getBiens_Vendu_ByProjet_Concat/` +
          selectedProjet?.id +
          '/BiensVendu',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      //const { data } = response
      setbiens(response.data.biens || []);
      console.log(response.data.biens);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => setValue(key, value));
    }
  }, [formData]);

  useEffect(() => {
    if (filesList == null) {
      fetchList_fichier();
    }
  }, []);

  const fetchList_fichier = async () => {
    setLoading_list(true);
    await axios
      .get(`${APIURL.ROOTV1}/files_docs/reclamations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setLoading_list(false);
        setfilesList(res.data);
      })
      .catch(() => {
        setLoading_list(false);
      });
  };

  const handleFileChange = (event) => {
    let selectedFiles = selectedFiles_rsv;
    let fileList = filesList;
    let a = 0;

    const files = Array.from(event.target.files);
    event.target.value = null;
    files.forEach((file) => {
      if (
        selectedFiles.some(
          (selectedFile) =>
            selectedFile.name === file.name ||
            selectedFile.fichier === file.name
        )
      ) {
        setValiderfile(true);
        setMyfile(files);
      } else if (fileList) {
        const fileName = file.name;
        const fileExists = Object.values(fileList).includes(fileName);
        if (fileExists) {
          // Le fichier existe déjà dans la liste
          // Générer un nouveau nom de fichier en ajoutant un suffixe numérique
          let newFileName = fileName;
          let fileNumber = 1;

          while (Object.values(fileList).includes(newFileName)) {
            const [name, extension] = fileName.split('.');
            newFileName = `${name} (${fileNumber}).${extension}`;
            fileNumber++;
          }
          file = new File([file], newFileName, { type: file.type });
          if (
            selectedFiles.some(
              (selectedFile) =>
                selectedFile.name === file.name ||
                selectedFile.fichier === file.name
            )
          ) {
            setValiderfile(true);
            setMyfile_1(file);
          } else {
            setSelectedFiles_rsv([...selectedFiles_rsv, file]);
          }
        }
      }
    });

    if (a === 0) {
      files.forEach((file) => {
        if (
          !selectedFiles.some(
            (selectedFile) =>
              selectedFile.name === file.name ||
              selectedFile.fichier === file.name
          )
        ) {
          setSelectedFiles_rsv([...selectedFiles_rsv, file]);
        }
      });
    }
  };

  const handleaddFile = () => {
    let selectedFiles = selectedFiles_rsv;

    if (myfile !== null && Array.isArray(myfile)) {
      myfile.forEach((file) => {
        const updatedFiles = selectedFiles.filter(
          (selectedFile) =>
            selectedFile.fichier !== file.name &&
            selectedFile.name !== file.name
        );
        setSelectedFiles_rsv([...updatedFiles, ...myfile]);
      });
    } else if (myfile !== null && !Array.isArray(myfile)) {
      const updatedFiles = selectedFiles.filter(
        (selectedFile) =>
          selectedFile.fichier !== myfile.name &&
          selectedFile.name !== myfile.name
      );
      setSelectedFiles_rsv([...updatedFiles, myfile]);
    } else if (myfile_1 !== null) {
      const updatedFiles = selectedFiles.filter(
        (selectedFile) =>
          selectedFile.fichier !== myfile_1.name &&
          selectedFile.name !== myfile_1.name
      );
      setSelectedFiles_rsv([...updatedFiles, myfile_1]);
    }

    setMyfile(null);
    setMyfile_1(null);
    setValiderfile(false);
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...selectedFiles_rsv];
    newFiles.splice(index, 1);
    setSelectedFiles_rsv(newFiles);
  };

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/reclamations/${file}`,
      '_blank'
    );
  };

  const handleDownload = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  const onSubmit = (data) => {
    setFormSubmitted(true);

    setLoading({ ...loading, form: true });
    setBackendErrors({});

    const dataToSend = new FormData();
    let url = APIURL.ReclamationsSav;

    Object.entries(data).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    if (!isEditing && selectedFiles_rsv.length !== 0) {
      selectedFiles_rsv.forEach((file, index) => {
        dataToSend.append(`files_reclamation[${index}]`, file);
      });
    }
    if (isEditing) {
      const files = selectedFiles_rsv.filter((file) => file instanceof File);
      const objects = selectedFiles_rsv.filter(
        (file) => !(file instanceof File)
      );

      if (objects.length !== 0) {
        objects.forEach((file, index) => {
          // convertir un objet en File avant de l'envoyer
          const blob = new Blob([file.fichier], {
            type: 'application/octet-stream',
          });
          const newFile = new File([blob], file.fichier);
          dataToSend.append(`files_reclamation[${index}]`, newFile);
        });
      }
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i++) {
          dataToSend.append(
            `files_reclamation[${objects.length + i}]`,
            files[i]
          );
        }
      }

      dataToSend.append('_method', 'PATCH');
      url = `${url}/${id}`;
    }

    axios
      .post(url, dataToSend, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      .then((res) => {
        let message = 'Quelque chose ne va pas bien';
        if (res.status === 200) {
          message = `Réclamation a été ${
            isEditing ? 'modifiée' : 'créée'
          } avec succès`;
          reset(defaultValues);
          toast.success(message);
          router.push(ENDPOINTS.ReclamationsSav);
          localStorage.setItem('service_pre', null);
          localStorage.setItem('service_pre_id', null);
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

  if (isEditing && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={ENDPOINTS.ReclamationsSav}
            step={`${isEditing ? 'Modifier' : 'Ajouter'} Reclamation`}
          />
        </div>
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Bien SelectInput */}
            <Controller
              name="bien_id"
              control={control}
              rules={{ required: 'Le bien est obligatoire' }}
              render={({ field }) => (
                <SelectInput
                  label="Bien"
                  placeholder="Choisir un bien..."
                  options={
                    Array.isArray(BIENS)
                      ? BIENS.map((s) => ({
                          value: s.id,
                          label: NomBienComplet(s),
                        }))
                      : []
                  }
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    const newValue = BIENS.find((s) => s.id === value);

                    // Réinitialiser les clients si aucun bien n'est sélectionné
                    if (newValue?.clients?.length) {
                      setClients(
                        newValue.clients.map((aq) => ({
                          id: aq.client.id,
                          nom: aq.client.nom,
                          prenom: aq.client.prenom,
                        }))
                      );
                    } else {
                      setClients([]);
                    }

                    // Éventuellement, réinitialiser le champ client sélectionné
                    setValue('client_id', null);
                  }}
                  loading={loading}
                  error={
                    errors?.bien_id?.message || backendErrors?.bien_id?.[0]
                  }
                  required={true}
                />
              )}
            />

            {/* Client SelectInput */}
            <Controller
              name="client_id"
              control={control}
              rules={{ required: 'Le client est obligatoire' }}
              render={({ field }) => (
                <SelectInput
                  label="Client"
                  placeholder="Choisir un client..."
                  options={
                    Array.isArray(clients)
                      ? clients.map((c) => ({
                          value: c.id,
                          label: `${c.prenom} ${c.nom}`,
                        }))
                      : []
                  }
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  loading={loading}
                  error={
                    errors?.client_id?.message || backendErrors?.client_id?.[0]
                  }
                  required={true}
                />
              )}
            />

            {/* Service SelectInput */}
            <Controller
              name="service_id"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Service"
                  placeholder="Choisir un service..."
                  options={
                    Array.isArray(services)
                      ? services.map((s) => ({
                          value: s.id,
                          label: s.nom,
                        }))
                      : []
                  }
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    const newValue = services.find((s) => s.id === value);
                  }}
                  loading={loading}
                  error={
                    errors?.service_id?.message ||
                    backendErrors?.service_id?.[0]
                  }
                  required={true}
                />
              )}
            />

            <Input
              label="Date réclamation :"
              type="datetime-local"
              name="date_reclamation"
              value={watch('date_reclamation')}
              onChange={(e) => setValue('date_reclamation', e.target.value)}
              placeholder=""
              error={
                errors?.date_reclamation?.message ||
                backendErrors?.date_reclamation
              }
              required
            />
            {/* Emplacement Autocomplete */}
            <div className="w-full sm:col-span-2 md:col-span-2">
              <Controller
                name="emplacements"
                control={control}
                rules={{ required: "L'emplacement est obligatoire" }}
                render={({ field }) => (
                  <SelectInput
                    label="Emplacement :"
                    placeholder="Sélectionnez un ou plusieurs emplacements"
                    options={emplacementOptions}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    error={
                      errors?.emplacements?.message ||
                      backendErrors?.emplacements?.[0]
                    }
                    required={true}
                    loading={loading}
                    isMulti={true}
                  />
                )}
              />
            </div>
            <div className="w-full sm:col-span-2 md:col-span-2">
              <Input
                label="Problème(s) :"
                name="problemes"
                value={watch('problemes') || ''}
                onChange={(e) => setValue('problemes', e.target.value)}
                required
                multiline
                error={
                  errors?.problemes?.message || backendErrors?.problemes?.[0]
                }
              />
            </div>
          </div>
          <div className="mt-6">
            <Grid container spacing={2} alignItems="flex-start">
              {/* Input Fichier */}
              <Grid item xs={12} sm={4}>
                {loading_list ? (
                  <CircularProgress />
                ) : (
                  <Input
                    label="Pièce jointe"
                    type="file"
                    name="piece_jointe"
                    onChange={handleFileChange}
                    error={errors?.piece_jointe}
                    accept="image/*,application/pdf"
                  />
                )}
              </Grid>

              {/* Fichiers sélectionnés */}
              {selectedFiles_rsv?.length > 0 && (
                <Grid item xs={12} sm={8}>
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ mb: 1 }}
                  >
                    Piéces jointes sélectionnées :
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      p: 1,
                      border: (theme) => `0.5px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      width: '100%',
                      flexWrap: 'wrap',
                    }}
                  >
                    {selectedFiles_rsv.map((data, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#e0e0e0',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 12,
                            mr: 1,
                            cursor: 'pointer',
                            '&:hover': { color: 'blue' },
                          }}
                          onClick={() =>
                            data.fichier
                              ? handleFileClick(data.fichier)
                              : handleDownload(data)
                          }
                        >
                          {data.fichier || data.name}
                        </Typography>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteFile(index)}
                        >
                          <Typography sx={{ fontSize: 14 }}>×</Typography>
                        </IconButton>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </div>

          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>

            <Button type="submit"  disabled={formSubmitted}>Enregistrer</Button>
          </div>
        </form>
        <ConfirmDialog
          open={validerfile}
          onClose={() => setValiderfile(false)}
          onConfirm={handleaddFile}
          title="Fichier déjà existant, voulez-vous le remplacer ?"
          confirmText="Oui"
          cancelText="Non"
        />
      </div>
    </>
  );
}
