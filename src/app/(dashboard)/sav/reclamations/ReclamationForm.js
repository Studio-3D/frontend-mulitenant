import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import AutocompleteMultiple from '@/components/AutocompleteMultiple';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';
import BreadCrumb from '../../navigation/BreadCrumb';

import Autocomplete from '@/components/Autocomplete';

import Button from '@/components/Button'; // adjust the path as needed
import LoadingSpin from '@/components/LoadingSpin';
import TextField from '@/components/Textfield'; // Import the component
//import { useProjet } from '@/context/ProjetContext';


import ConfirmDialog from '@/components/dialog-File';
import { useProjet } from '@/context/ProjetContext';
import { Box, CircularProgress, Grid, IconButton, TextField as TextField1, Typography } from '@mui/material';

export default function ReclamationForm({ id }) {
  const { token } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const accessToken = token || localStorage.getItem('accessToken');
  const { user } = useAuth();
  const [problemes] = useState([
    { id: '1', description: 'Salle de Bain' },
    { id: '2', description: 'Cuisine' },
    { id: '3', description: 'Chambre' },
    { id: '4', description: 'Balcon' },
    { id: '5', description: 'Couloir' },
    { id: '6', description: 'Fuite' },
    { id: '7', description: 'Buanderie' },
    { id: '8', description: 'Placard' }
  ])
  //dialog
  const [info_client, setInfo_client] = useState(null);
  const [disabled_var, setDisabled_var] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [BIENS, setbiens] = useState([])

  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState({});
  const [problemes_value, setProblems_value] = useState([])

  const [PROJETS, setProjets] = useState([]);
  const [CLIENTSS, setClientss] = useState([]);
  const [clients, setClients] = useState('');
    const [loading_list, setLoading_list] = useState(false)
  const [filesList, setfilesList] = useState(null)
  const [selectedFiles_rsv, setSelectedFiles_rsv] = useState([])
  const [validerfile, setValiderfile] = useState(false)
  const [myfile, setMyfile] = useState(false)
  const [myfile_1, setMyfile_1] = useState(false)
  const { selectedProjet } = useProjet();

  //edit
  
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
      setServices(data.services);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  useEffect(() => {
    fetchServices()
    fetchbiens()
  }, []);
 

  const defaultValues = {
    bien_id: '',
    client_id: '',
    service_id: '',
    prestataire_id: '',
    date_reclamation: '',
    date_intervention: '',
    date_fin_intervention: '',
    problemes: '',
    projet_id: selectedProjet?.id,
  }

  const validationSchemaRef = useRef(
    yup.object().shape({
      date_reclamation: yup.string().required('la date reclamation est Obligatoire'),
      date_fin_intervention: yup.string().required('la date Intervention est Obligatoire'),
      date_intervention: yup.string().required('la date Fin Intervention est Obligatoire'),
      bien_id: yup.string().required('le Bien est Obligatoire'),
      client_id: yup.string().required('le Client est Obligatoire'),
      prestataire_id: yup.string().required('le Prestataire est Obligatoire')
    })
  )

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
  const isEditing = !!id
  useEffect(() => {
    if (isEditing) {
      axios
        .get(`${APIURL.ReclamationsSav}/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then(res => {
          if (res.status !== 200) router.back()
          const rec = res.data.reclamation
          setClients(
            res.data.bien.reservation.aquereurs.map(aq => ({
              id: aq.client.id,
              nom: aq.client.nom,
              prenom: aq.client.prenom
            }))
          )
          setPrestataires(
            res.data.prestataires.map(p => ({
              id: p.id,
              nom: p.nom,
              prenom: p.prenom
            }))
          )
          setValue('bien_id', rec.bien_id || '')
          setValue('client_id', rec.client_id || '')
          setValue('service_id', rec.prestataire.service_id || '')
          setValue('prestataire_id', rec.prestataire_id || '')
          setValue('date_reclamation', rec.date_reclamation || '')
          setValue('date_intervention', rec.date_intervention || '')
          setValue('date_fin_intervention', rec.date_fin_intervention || '')
          setValue('problemes', rec.problemes || '')

          if (rec.problemes.includes('Cuisine')) {
            setProblems_value(current => [...current, 'Cuisine'])
          }
          if (rec.problemes.includes('Salle de Bain')) {
            setProblems_value(current => [...current, 'Salle de Bain'])
          }
          if (rec.problemes.includes('Chambre')) {
            setProblems_value(current => [...current, 'Chambre'])
          }
          if (rec.problemes.includes('Balcon')) {
            setProblems_value(current => [...current, 'Balcon'])
          }
          if (rec.problemes.includes('Couloir')) {
            setProblems_value(current => [...current, 'Couloir'])
          }
          if (rec.problemes.includes('Fuite')) {
            setProblems_value(current => [...current, 'Fuite'])
          }
          if (rec.problemes.includes('Buanderie')) {
            setProblems_value(current => [...current, 'Buanderie'])
          }
          if (rec.problemes.includes('Placard')) {
            setProblems_value(current => [...current, 'Placard'])
          }
          setSelectedFiles_rsv(rec.piece_jointe)

          setFormData({})
        })

        .catch(error => console.log(error.message))
    } else {
      validationSchemaRef.current = validationSchemaRef.current.shape({
        ...validationSchemaRef.current.fields
      })
      reset(defaultValues, {
        errors: true,
        dirtyFields: true,
        isDirty: true
      })
    }
  }, [isEditing, reset, router])

  const fetchbiens = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${APIURL.ROOTV1}/getBiens_Vendu_ByProjet_Concat/` + selectedProjet?.id+'/BiensVendu',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      const { data } = response
      setbiens(data.biens)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => setValue(key, value));
    }
  }, [formData]);

  useEffect(() => {
    if (filesList == null) {
      fetchList_fichier()
    }

  }, [])

  

  const fetchList_fichier = async () => {
    setLoading_list(true)
    await axios
      .get(`${APIURL.ROOTV1}/files_docs/reclamations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(res => {
        setLoading_list(false)
        setfilesList(res.data)
      })
      .catch(() => {
        setLoading_list(false)
      })
  }

  const handleFileChange = event => {
    let selectedFiles = selectedFiles_rsv
    let fileList = filesList
    let a = 0

    const files = Array.from(event.target.files)
    event.target.value = null
    files.forEach(file => {
      if (selectedFiles.some(selectedFile => selectedFile.name === file.name || selectedFile.fichier === file.name)) {
        setValiderfile(true)
        setMyfile(files)
      } else if (fileList) {
        const fileName = file.name
        const fileExists = Object.values(fileList).includes(fileName)
        if (fileExists) {
          // Le fichier existe déjà dans la liste
          // Générer un nouveau nom de fichier en ajoutant un suffixe numérique
          let newFileName = fileName
          let fileNumber = 1

          while (Object.values(fileList).includes(newFileName)) {
            const [name, extension] = fileName.split('.')
            newFileName = `${name} (${fileNumber}).${extension}`
            fileNumber++
          }
          file = new File([file], newFileName, { type: file.type })
          if (
            selectedFiles.some(selectedFile => selectedFile.name === file.name || selectedFile.fichier === file.name)
          ) {
            setValiderfile(true)
            setMyfile_1(file)
          } else {
            setSelectedFiles_rsv([...selectedFiles_rsv, file])
          }
        }
      }
    })

    if (a === 0) {
      files.forEach(file => {
        if (
          !selectedFiles.some(selectedFile => selectedFile.name === file.name || selectedFile.fichier === file.name)
        ) {
          setSelectedFiles_rsv([...selectedFiles_rsv, file])
        }
      })
    }
  }

  const handleaddFile = () => {
    let selectedFiles = selectedFiles_rsv

    if (myfile !== null && Array.isArray(myfile)) {
      myfile.forEach(file => {
        const updatedFiles = selectedFiles.filter(
          selectedFile => selectedFile.fichier !== file.name && selectedFile.name !== file.name
        )
        setSelectedFiles_rsv([...updatedFiles, ...myfile])
      })
    } else if (myfile !== null && !Array.isArray(myfile)) {
      const updatedFiles = selectedFiles.filter(
        selectedFile => selectedFile.fichier !== myfile.name && selectedFile.name !== myfile.name
      )
      setSelectedFiles_rsv([...updatedFiles, myfile])
    } else if (myfile_1 !== null) {
      const updatedFiles = selectedFiles.filter(
        selectedFile => selectedFile.fichier !== myfile_1.name && selectedFile.name !== myfile_1.name
      )
      setSelectedFiles_rsv([...updatedFiles, myfile_1])
    }

    setMyfile(null)
    setMyfile_1(null)
    setValiderfile(false)
  }

  const handleDeleteFile = index => {
    const newFiles = [...selectedFiles_rsv]
    newFiles.splice(index, 1)
    setSelectedFiles_rsv(newFiles)
  }

  const handleFileClick = file => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/reclamations/${file}`,
      '_blank'
    )
  }

  const handleDownload = file => {
    const fileURL = URL.createObjectURL(file)
    window.open(fileURL)
  }
  

 

  const onSubmit = data => {
    setFormSubmitted(true);
    
    setLoading({ ...loading, form: true })
    setBackendErrors({})

    const dataToSend = new FormData()
    let url = APIURL.ReclamationsSav

    Object.entries(data).forEach(([key, value]) => {
      dataToSend.append(key, value)
    })

    if (!isEditing && selectedFiles_rsv.length !== 0) {
      selectedFiles_rsv.forEach((file, index) => {
        dataToSend.append(`files_reclamation[${index}]`, file)
      })
    }
    if (isEditing) {
      const files = selectedFiles_rsv.filter(file => file instanceof File)
      const objects = selectedFiles_rsv.filter(file => !(file instanceof File))

      if (objects.length !== 0) {
        objects.forEach((file, index) => {
          // convertir un objet en File avant de l'envoyer
          const blob = new Blob([file.fichier], { type: 'application/octet-stream' })
          const newFile = new File([blob], file.fichier)
          dataToSend.append(`files_reclamation[${index}]`, newFile)
        })
      }
      if (files.length !== 0) {
        for (let i = 0; i < files.length; i++) {
          dataToSend.append(`files_reclamation[${objects.length + i}]`, files[i])
        }
      }

      dataToSend.append('_method', 'PATCH')
      url = `${url}/${id}`
    }

    axios
      .post(url, dataToSend, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      .then(res => {
        let message = 'Quelque chose ne va pas bien'
        if (res.status === 200) {
          message = `Réclamation a été ${isEditing ? 'modifiée' : 'créée'} avec succès`
          reset(defaultValues)
          toast.success(message)
          router.push(ENDPOINTS.ReclamationsSav)
          localStorage.setItem('service_pre', null)
          localStorage.setItem('service_pre_id', null)
        } else if (res.status === 422) {
          message = res.data.message
          setBackendErrors(res.data.errors)
          setTimeout(() => setBackendErrors({}), 5000)
        }
      })
      .catch(error => {
        const response = error.response
        if (response && response.status === 422) {
          setBackendErrors(response.data.errors)
          setTimeout(() => setBackendErrors({}), 5000)
        } else {
          toast.error("Une erreur s'est produite lors de la soumission du formulaire.")
        }
      })
      .finally(() => setLoading({ ...loading, form: false }))
  }

  

 
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
            
      
      <Autocomplete
                label="Biens:"
                required
                name="bien_id"
                options={BIENS}
                loading={loading}
                value={BIENS.find((opt) => opt.id === Number(watch('bien_id'))) || null}
                getOptionLabel={(option) => option.propriete_dite_bien} // toujours getOptionLabel
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setValue('bien_id', newValue ? newValue.id : '');
                }}
              />

              <Autocomplete
                label="Clients:"
                required
                name="clients"
                options={CLIENTSS}
                loading={loading}
                value={CLIENTSS.find(opt => opt.id === Number(watch('clients'))) || null}
                getOptionLabel={(option) => `${option.nom} ${option.prenom}`} // toujours getOptionLabel
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setClients(newValue ? newValue.clients : '');
                  setValue('clients', newValue ? newValue.id : '');
                }}
              />

              <Autocomplete
                label="Service:"
                name="service_id"
                options={services}
                loading={loading}
                required
                value={services.find(opt => opt.id === Number(watch('service_id'))) || null}
                getOptionLabel={(option) => option.nom} // getOptionLabel
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setValue('service_id', newValue ? newValue.id : '');
                  setPrestataires(newValue?.prestataires?.map(p => ({
                    id: p.id,
                    nom: p.nom,
                    prenom: p.prenom
                  })) || []);
                }}
              />

              <Autocomplete
                label="Prestataire:"
                name="prestataire_id"
                options={prestataires}
                loading={loading}
                required
                value={prestataires.find((opt) => opt.id === Number(watch('prestataire_id'))) || null}
                getOptionLabel={(option) => `${option.nom} ${option.prenom}`} // toujours getOptionLabel
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                onChange={(newValue) => {
                  setValue('prestataire_id', newValue ? newValue.id : '');
                }}
              />       
              <TextField
                label="Date_reclamation:"
                name="date_reclamation"
                control={control}
                type='datetime-local'
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <TextField
                label="Date intervention:"
                name="date_intervention"
                type='date'
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              <TextField
                label="Date fin intervention:"
                name="date_fin_intervention"
                type='date'
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
              


              <AutocompleteMultiple
                label="Probleme :"
                nFame="probleme_id"
                value={watch('problemes')} // e.g. [12, 17]
                valueKey="id"
                required={true}
                options={problemes}
                choiceKey="description"
                onChange={(newValue) => {
                  try {
                    console.log('Selected tranches:', newValue);

                    if (Array.isArray(newValue)) {
                      const selectedIds = newValue.map(
                        (option) => option?.id
                      );
                      console.log('ids probleme', selectedIds);
                      setValue('problemes', selectedIds); // Set only IDs to the form field
                    } else {
                      console.error(
                        'Expected newValue to be an array of selected options, but received:',
                        newValue
                      );
                    }
                  } catch (error) {
                    console.error(
                      'Error in probleme onChange handler:',
                      error
                    );
                  }
                }}
                placeholder="sélectionnez un ou plusieurs Probleme"
                errors={{errors,
                  
                }}
                backendErrors={backendErrors}
                loading={loading}
              />
             
             
              
             <Grid item xs={12} sm={3} mt={2}>
                {loading_list ? (
                  <CircularProgress />
                ) : (
                  
                  <TextField1
                    label='Piéces Jointes'
                    fullWidth
                    sx={{ mt: 1 }}
                    type='file'
                    onChange={event => handleFileChange(event)}
                    size='small'
                    variant='outlined'
                    inputProps={{
                      accept: 'image/*, application/pdf'
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Grid>

              {selectedFiles_rsv?.length !== 0 ? (
                <>
                  <Grid item ml={10}>
                    <Typography variant='subtitle2' color={'primary'}>
                      Piéces jointes selectionnés
                    </Typography>

                    <Grid
                      container
                      spacing={2}
                      mt={1}
                      sx={{
                        pl: 2,
                        pt: 0.5,
                        pb: 0.5,
                        pr: 2,
                        width: '40vw',
                        height: 'auto',
                        borderRadius: 0.3,
                        cursor: 'pointer',
                        alignItems: 'center',
                        border: theme => `2px solid ${theme.palette.divider}`
                      }}
                    >
                      {selectedFiles_rsv.map((data, index) => (
                        <Box key={data}>
                          <Typography
                            sx={{
                              p: 0.3,
                              width: 'auto',
                              height: 'auto',
                              borderRadius: 0.5,
                              cursor: 'pointer',
                              alignItems: 'center',
                              border: theme => `2px solid ${theme.palette.divider}`,
                              mr: 0.48,
                              color: 'black',
                              fontWeight: 408,
                              fontSize: 11,
                              '&:hover': { color: 'blue' }
                            }}
                            style={{ backgroundColor: '#e0e0e0' }}
                            variant='body'
                          >
                            {data.fichier ? (
                              <span onClick={() => handleFileClick(data.fichier)}>{data.fichier}</span>
                            ) : (
                              <span onClick={() => handleDownload(data)}>{data.name}</span>
                            )}
                            <IconButton
                              color='error'
                              onClick={() => handleDeleteFile(index)}
                              sx={{ mb: 0.4 }}
                              title='supprimer'
                            >
                              <Typography
                                variant='body'
                                style={{ color: 'error' }}
                                sx={{ fontSize: 12, fontWeight: 510 }}
                              >
                                x
                              </Typography>
                            </IconButton>
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </>
              ) : (
                ''
              )}
            </div>
            
          
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>

            <Button type="submit" disabled={loading.form || disabled_var}>
              Enregistrer
            </Button>
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
