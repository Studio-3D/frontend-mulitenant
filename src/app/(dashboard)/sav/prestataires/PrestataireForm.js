import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import BreadCrumb from '../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';

import { CIVILITES, getSCodeCivilite } from '@/components/client-utils';
import { useProjet } from '@/context/ProjetContext';
import SelectInput from '@/components/SelectInput';
import Input from '@/components/Input';
import { useSociete } from '@/context/SocieteContext';

const PrestataireForm = ({ id = null }) => {
  const { selectedSociete } = useSociete();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [backendErrors, setBackendErrors] = useState({});
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [info_client, setInfo_client] = useState(null);

  const [disabled, setDisabled] = useState(false);
  const [disabled_var, setDisabled_var] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  // Utilisation de react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cin: '',
      nom: '',
      prenom: '',
      telephone: '',
      civilite: '',
      service_id: '',
      email: '',
      adresse: '',
    },
  });

  // Simple cache et comparaison for return back en cas de changer projet
       const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    

  	 useEffect(() => {
  if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldProjetId||oldSocieteId) {
      // Projet ou société a changé
    //    console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
      router.push('/sav/prestataires');
    }
    setOldSocieteId(selectedSociete?.id)
    setOldProjetId(selectedProjet?.id);
  }
}, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  // Load prestataire data if editing
  useEffect(() => {
    if (id) {
      fetchPrestataireData(id);
    }
  }, [id]);

  const fetchPrestataireData = async (prestataireId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL.Prestataires}/${prestataireId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data?.prestataire) {
        const prestataireData = response.data.prestataire;
        // Remplir les champs avec les données de prestataire
        setValue('nom', prestataireData.nom || '');
        setValue('cin', prestataireData.cin || '');
        setValue('prenom', prestataireData.prenom || '');
        setValue('telephone', prestataireData.telephone || '');
        setValue('email', prestataireData.email || '');
        setValue('adresse', prestataireData.adresse || '');
        setValue('service_id', prestataireData.service?.id || '');
        setValue('civilite', getSCodeCivilite(prestataireData.civilite) || '');
      }
    } catch (error) {
      console.error('Error fetching prestataire data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      let url = APIURL.Prestataires;
      let method = 'post';

      if (id) {
        url = `${url}/${id}`;
        method = 'put';
      }

      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success(
        id
          ? 'Prestataire modifié avec succès'
          : 'Prestataire ajouté avec succès'
      );
      setTimeout(() => router.back(), 300);
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};
        setBackendErrors(backendErrors);
        Object.values(backendErrors).forEach((errorArray) => {
          errorArray.forEach((message) => toast.error(message));
        });
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Ajoute ça dans PrestataireForm.jsx

  const fetch_event_by_param = async (route, value, param) => {
    try {
      const res = await axios.get(
        `${APIURL.ROOTV1}/${route}/${param}/${value}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setInfo_client(null);
      setDisabled(false);

      if (res.data.prestataire != null) {
        setDisabled(true);
        setInfo_client(
          `Le ${param} que vous avez saisi appartient au prestataire : ${res.data.prestataire.nom} ${res.data.prestataire.prenom}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_cin_unique = async (value) => {
    try {
      const res = await axios.get(
        `${APIURL.ROOTV1}/get_info_cin_prestataire_unique/${id}/${value}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setInfo_client(null);
      setDisabled(false);

      if (res.data.pres_count > 0) {
        setInfo_client(
          'Le CIN que vous avez saisi appartient à un autre prestataire.'
        );
        setDisabled(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange_event = (name) => (event) => {
    const value = event.target.value;

    if (name === 'cin') {
      if (value.length >= 3) {
        clearTimeout(window.cinTimeout); // éviter plusieurs setTimeout empilés
        window.cinTimeout = setTimeout(async () => {
          await fetch_event_by_param(
            'search_prestataire_by_param',
            value,
            'cin'
          );
          if (id) {
            // Si c'est un edit
            await fetch_cin_unique(value);
          }
        }, 1000); // Réduit à 1 seconde pour que ce soit plus réactif
      }
    } else if (name === 'telephone') {
      if (value.length >= 10) {
        clearTimeout(window.telTimeout);
        window.telTimeout = setTimeout(() => {
          fetch_event_by_param(
            'search_prestataire_by_param',
            value,
            'telephone'
          );
        }, 1000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.Prestataires}
          step={`${id ? 'Modifier' : 'Ajouter'} un prestataire`}
        />
      </div>

      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        {info_client != null && (
          <div
            className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded"
            style={{ marginTop: '10px', marginBottom: '10px' }}
          >
            <p>{info_client}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Cin:"
              name="cin"
              value={watch('cin') || ''}
              onChange={(e) => {
                setValue('cin', e.target.value);
                handleChange_event('cin')(e);
              }}
              required
              error={errors?.cin?.message || backendErrors?.cin?.[0]}
            />

            <Input
              label="Nom:"
              name="nom"
              value={watch('nom') || ''}
              onChange={(e) => setValue('nom', e.target.value)}
              required
              error={errors?.nom?.message || backendErrors?.nom?.[0]}
            />

            <Input
              label="Prénom:"
              name="prenom"
              value={watch('prenom')}
              onChange={(e) => setValue('prenom', e.target.value)}
              required
              error={errors?.prenom?.message || backendErrors?.prenom?.[0]}
            />

            <Input
              label="Téléphone:"
              name="telephone"
              type="number"
              value={watch('telephone')}
              onChange={(e) => {
                setValue('telephone', e.target.value);
                handleChange_event('telephone')(e);
              }}
              disabled={disabled_var}
              required
              error={
                errors?.telephone?.message || backendErrors?.telephone?.[0]
              }
            />

            <Controller
              name="civilite"
              control={control}
              rules={{ required: 'La civilité est requise' }}
              render={({ field }) => (
                <SelectInput
                  label="Civilité :"
                  placeholder="Sélectionner une civilité"
                  options={Object.values(CIVILITES).map((item) => ({
                    value: item.code,
                    label: item.label,
                  }))}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  error={
                    errors?.civilite?.message || backendErrors?.civilite?.[0]
                  }
                   required={true}
                />
              )}
            />

            {/* REPLACED InputSelect with SelectInput */}
            <Controller
              name="service_id"
              control={control}
              rules={{ required: 'Le service est requis' }}
              render={({ field }) => (
                <SelectInput
                  label="Service :"
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
              label="Email:"
              name="email"
              value={watch('email')}
              onChange={(e) => setValue('email', e.target.value)}
              required
              error={errors?.email?.message || backendErrors?.email?.[0]}
            />

            <Input
              label="Adresse:"
              name="adresse"
              value={watch('adresse')}
              onChange={(e) => setValue('adresse', e.target.value)}
              error={errors?.adresse?.message || backendErrors?.adresse?.[0]}
            />
          </div>

          <div className="flex justify-center gap-4 items-center mt-20 mb-6">
            <Button
              type="button"
              onClick={() => router.back()}
              customColor="gray"
            >
              Quitter
            </Button>
            <Button
              type="submit"
              customColor="blue"
              variant="contained"
              disabled={submitting || loading || disabled}
            >
              {submitting ? 'Chargement...' : id ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrestataireForm;
