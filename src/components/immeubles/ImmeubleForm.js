'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import toast from 'react-hot-toast';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import Button from '../Button';
import InputSelect from '../inputSelect';
import Input from '../Input';
import { fetchDataByProjet_params } from '@/configs/api-utils';
import { useSearchParams } from 'next/navigation';
import { useProjet } from '@/context/ProjetContext';

export default function ImmeubleForm({ id, projetId, blocId, trancheId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [blocs, setBlocs] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [loadingBlocs, setLoadingBlocs] = useState(false);
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [selectedBloc, setSelectedBloc] = useState(null);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const searchParams = useSearchParams();
  trancheId = trancheId || searchParams.get('tranche');
  blocId = blocId || searchParams.get('bloc');
  const hasFetchedInitialData = useRef(false);
  const isSubmittingRef = useRef(false);
  const [trancheHasNoBlocs, setTrancheHasNoBlocs] = useState(false);
  const { selectedProjet  } = useProjet();

 /* // Get selected project from localStorage
  const selectedProjet = JSON.parse(
    localStorage.getItem('selectedProjet') || '{}'
  );
*/
  const defaultValues = {
    nom: '',
    bloc_id: blocId || '',
    tranche_id: trancheId || '',
    titre_foncier: '',
    nbre_biens: 0,
    projet_id: selectedProjet?.id,
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  const fetchImmeubleData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.immeuble) {
        const immeuble = response.data.immeuble;
        setFormData({
          nom: immeuble.nom || '',
          bloc_id: immeuble.bloc_id || '',
          tranche_id: immeuble.tranche_id || '',
          titre_foncier: immeuble.titre_foncier || '',
          nbre_biens: immeuble.nbre_biens || 0,
          projet_id: immeuble.projet_id || selectedProjet?.id,
        });

        if (immeuble.tranche) {
          setSelectedTranche(immeuble.tranche);
        }
        if (immeuble.bloc) {
          setSelectedBloc(immeuble.bloc);
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de l'immeuble");
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedProjet?.id]);

  // Simple cache et comparaison
  const [oldProjetId, setOldProjetId] = useState(null);
            console.log(`Old Projet: ${oldProjetId} -> ${selectedProjet.id}`);

  useEffect(() => {

    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé
        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet?.id}`);
        router.push('/projets/' + selectedProjet.id);
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  // Ensure tranche and bloc names when IDs provided
  useEffect(() => {
    const loadNamesIfNeeded = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (trancheId && !selectedTranche?.nom) {
          const tres = await axios.get(`${APIURL.TRANCHES}/${trancheId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tres.data?.tranche) setSelectedTranche(tres.data.tranche);
        }
        if (blocId && !selectedBloc?.nom) {
          const bres = await axios.get(`${APIURL.BLOCS}/${blocId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (bres.data?.bloc) setSelectedBloc(bres.data.bloc);
        }
      } catch (e) {
        console.error('Failed to fetch names', e);
      }
    };
    loadNamesIfNeeded();
  }, [trancheId, blocId, selectedTranche?.nom, selectedBloc?.nom]);


  // Fetch immeuble data if editing
  useEffect(() => {
    if (isEditing && id && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchImmeubleData();
    } else if (blocId && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      setFormData((prev) => ({
        ...prev,
        bloc_id: blocId,
      }));
    }
  }, [id, isEditing, fetchImmeubleData, blocId]);

  // Fetch tranches and blocs for the project
  useEffect(() => {
    if (!isEditing && !hasFetchedInitialData.current) {
      const fetchData = async () => {
        // Fetch tranches if needed
        if (
          selectedProjet.nbre_tranches !== 0 &&
          !trancheId &&
          !formData.tranche_id &&
          !blocId
        ) {
          await fetchDataByProjet_params(
            'tranches',
            setTranches,
            setLoadingTranches
          );
        }

        // Fetch blocs if needed
        if (selectedProjet.nbre_blocs !== 0) {
          if (
            !blocId &&
            (trancheId || formData.tranche_id) &&
            selectedProjet.nbre_tranches !== 0
          ) {
            await fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs, {
              tranche_id: trancheId || formData.tranche_id,
            });
          } else if (!blocId && selectedProjet.nbre_tranches === 0) {
            await fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs);
          }
        }
      };

      fetchData();
      hasFetchedInitialData.current = true;
    }
  }, [
    blocId,
    trancheId,
    formData.tranche_id,
    isEditing,
    selectedProjet.nbre_tranches,
    selectedProjet.nbre_blocs,
    selectedProjet.id,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  const handleselectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'tranche_id') {
      const currentTrancheId = value;
      const selectedTrancheObj = tranches.find(
        (t) => t.id.toString() === value.toString()
      );
      setSelectedTranche(selectedTrancheObj || null);

      // Reset bloc selection if tranche changes
      if (currentTrancheId !== formData.tranche_id) {
        setFormData((prev) => ({ ...prev, bloc_id: '' }));
        setSelectedBloc(null);
      }

      if (!blocId && currentTrancheId && selectedProjet.nbre_tranches !== 0) {
        fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs, {
          tranche_id: currentTrancheId,
        }).then(() => {
          // Check if blocs array is empty after fetching
          setTrancheHasNoBlocs(blocs.length === 0);
        });
      }
    }

    if (field === 'bloc_id' && value) {
      const selectedBlocObj = blocs.find(
        (b) => b.id.toString() === value.toString()
      );
      setSelectedBloc(selectedBlocObj || null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom de l'immeuble est requis";
    }
    if (tranches.length > 0 && !formData.tranche_id) {
      errors.tranche_id = 'La tranche est requise';
    }
    if (blocs.length > 0 && !formData.bloc_id) {
      errors.bloc_id = 'Le Bloc est requis';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prevent multiple submissions
    if (isSubmittingRef.current) return;

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setBackendErrors({});

    const token = localStorage.getItem('accessToken');
    let url = APIURL.IMMEUBLES;
    let method = 'post';

    if (isEditing) {
      url = `${url}/${id}`;
      method = 'put';
    }

    try {
      await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Immeuble ${isEditing ? 'modifié' : 'créé'} avec succès`);

      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        if (blocId) {
          localStorage.setItem(`bloc-${blocId}-activeTab`, 'immeuble');
          router.push(`/blocs/${blocId}`);
        } else if (trancheId) {
          localStorage.setItem(`tranche-${trancheId}-activeTab`, 'immeuble');

          router.push(`/tranches/${trancheId}`);
        } else if (selectedProjet.id) {
          localStorage.setItem(
            `project-${selectedProjet.id}-activeTab`,
            'immeuble'
          );
          router.push(`/projets/${selectedProjet.id}`);
        } else {
          router.push('/projets');
        }
      }, 100);
    } catch (error) {
      const response = error.response;
      if (response?.status === 422) {
        setBackendErrors(response.data.errors || {});
      } else {
        toast.error(
          "Une erreur s'est produite lors de la soumission du formulaire"
        );
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          onRoot={{ href: '/projets' }}
          items={[
            selectedProjet?.id
              ? {
                  label: selectedProjet?.nom || `Projet #${selectedProjet?.id}`,
                  href: `/projets/${selectedProjet?.id}`,
                }
              : { label: 'Projets', href: '/projets' },
            selectedTranche?.nom
              ? {
                  label:
                    selectedTranche?.nom ||
                    `Tranche #${selectedTranche?.nom}`,
                  href: `/tranches/${trancheId || selectedTranche?.id}`,
                }
              : null,
            selectedBloc?.nom
              ? {
                  label:
                    selectedBloc?.nom ||
                    `Bloc #${selectedBloc?.id}`,
                  href: `/blocs/${blocId || selectedBloc?.id}`,
                }
              : null,
            { label: `${id ? 'Modifier' : 'Ajouter'} un immeuble` },
          ].filter(Boolean)}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Nom"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={validationErrors.nom || backendErrors.nom}
              required
            />

            {isEditing && selectedProjet.nbre_tranches !== 0 && (
              <Input
                label="Tranche"
                value={selectedTranche?.nom}
                disabled={true}
              />
            )}

            {isEditing && selectedProjet.nbre_blocs !== 0 && (
              <Input label="Bloc" value={selectedBloc?.nom} disabled={true} />
            )}

            {!isEditing &&
              selectedProjet.nbre_tranches !== 0 &&
              !trancheId &&
              !blocId && (
                <InputSelect
                  label="Tranche"
                  options={tranches.map((t) => ({ label: t.nom, value: t.id }))}
                  value={formData.tranche_id}
                  onChange={(option) =>
                    handleselectChange('tranche_id', option?.value || null)
                  }
                  error={
                    validationErrors.tranche_id || backendErrors.tranche_id
                  }
                  isLoading={loadingTranches}
                  required
                />
              )}

            {!isEditing &&
              selectedProjet.nbre_tranches === 0 &&
              selectedProjet.nbre_blocs !== 0 &&
              !blocId && (
                <InputSelect
                  label="Bloc"
                  options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                  value={formData.bloc_id}
                  onChange={(option) =>
                    handleselectChange('bloc_id', option?.value || null)
                  }
                  error={validationErrors.bloc_id || backendErrors.bloc_id}
                  isLoading={loadingBlocs}
                  required
                />
              )}

            {!isEditing &&
              !formData.tranche_id &&
              selectedProjet.nbre_tranches !== 0 &&
              selectedProjet.nbre_blocs !== 0 &&
              !blocId &&
              !trancheId && (
                <Input
                  label="Bloc"
                  disabled={true}
                  value="Veuillez d'abord sélectionner une tranche"
                />
              )}

            {!isEditing &&
              (formData.tranche_id || trancheId) &&
              selectedProjet.nbre_tranches !== 0 &&
              selectedProjet.nbre_blocs !== 0 &&
              !blocId && (
                <>
                  <InputSelect
                    label="Bloc"
                    options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                    value={formData.bloc_id}
                    onChange={(option) =>
                      handleselectChange('bloc_id', option?.value || null)
                    }
                    error={validationErrors.bloc_id || backendErrors.bloc_id}
                    isLoading={loadingBlocs}
                    required
                  />

                  {trancheHasNoBlocs && blocs.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      Cette tranche ne contient aucun bloc
                    </p>
                  )}
                </>
              )}

            <Input
              label="Titre foncier"
              type="text"
              name="titre_foncier"
              value={formData.titre_foncier}
              onChange={handleChange}
            />

            <Input
              label="Nombre de biens"
              type="number"
              name="nbre_biens"
              value={formData.nbre_biens}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  {isEditing ? 'Modification en cours...' : 'Ajout en cours...'}
                </>
              ) : id ? (
                'Modifier'
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
