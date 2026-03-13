import { useEffect, useRef, useState } from 'react';

import { APIURL } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useProjet } from '@/context/ProjetContext';
import LoadingSpin from '@/components/LoadingSpin';
import { fetchDataByProjet } from '@/configs/api-utils';
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../../context/AuthContext';
import { useSociete } from '@/context/SocieteContext';

const EcheanceTrancheFormForm = ({ id = null }) => {
  const { selectedSociete } = useSociete();
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false); // Nouvel état pour contrôler l'affichage
  const router = useRouter();
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading_form, setLoading_form] = useState({ form: false });
  const [loading, setLoading] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState('');

  const [backendErrors, setBackendErrors] = useState({});
  const [tranches, setTranches] = useState([]);

  /************Inputs date Montant***** */
  const [inputs, setInputs] = useState([{ date: '', montant: '' }]);

  const handleAddInput = () => {
    const newInputs = [...inputs, { date: '', montant: '' }];
    setInputs(newInputs);
    setValue('inputs_date_montant', JSON.stringify(newInputs)); // Ajoutez JSON.stringify ici
  };
  const handleChange = (event, index, fieldName) => {
    let { value } = event.target;
    const updatedInputs = inputs.map((input, i) =>
      i === index ? { ...input, [fieldName]: value } : input
    );
    setInputs(updatedInputs);
    setValue('inputs_date_montant', JSON.stringify(updatedInputs));
  };

  const handleDeleteInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
    setValue('inputs_date_montant', JSON.stringify(newArray)); // Ajoutez JSON.stringify ici
  };

  const defaultValues = {
    tranche_id: '',
    inputs_date_montant: [],
  };
  const validationSchemaRef = useRef(
    yup.object().shape({
     // tranche_id: yup.string().required('La Tranche Obligatoire'),
    })
  );

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
    setLoading(true);
    if (isEditing) {
      axios
        .get(`${APIURL.ROOTV1}/list_echeances_byTrancheId/` + id, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status !== 200) router.back();
          setSelectedTranche(id);
          setValue('tranche_id', id);
          setValue('tranche', res.data.echeances[0].tranche.nom || '');
          setValue('inputs_date_montant', res.data.echeances);
          // Formater les données pour les inputs
          const formattedInputs = res.data.echeances.map((echeance) => ({
            date: echeance.date,
            montant: echeance.montant.toString(),
          }));
          console.log('Formatted inputs:', formattedInputs); // Ajoutez ce log

          setInputs(formattedInputs);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error.message);
          setLoading(false); // Ajouter setLoading(false) dans le catch aussi
        });
    } else {
     // Mode création
      fetchDataByProjet('get_tranches_without_echeances', setTranches, setLoading);
      setLoading(false);
    }
  }, [isEditing, reset, router]);
 

  const { selectedProjet } = useProjet();
  // Simple cache et comparaison for return back en cas de changer projet
        const [oldProjetId, setOldProjetId] = useState(null);
        const [oldSocieteId, setOldSocieteId] = useState(null);
      
      useEffect(() => {
        if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
          if (oldProjetId||oldSocieteId) {
            // Projet ou société a changé
           //   console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
           router.push('/administration/echeance-tranche');
          }
          setOldSocieteId(selectedSociete?.id)
          setOldProjetId(selectedProjet?.id);
        }
      }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  

  const validateFields = () => {
    const errors = {};
    let isValid = true;

    // En mode édition, tranche_id est toujours valide car c'est l'ID
    // En mode création, on valide que tranche_id est sélectionné
    if (!isEditing && !selectedTranche) {
      errors.tranche_id = 'La Tranche est obligatoire';
      isValid = false;
    }

    // Valider chaque input
    inputs.forEach((input, index) => {
      if (!input.date) {
        errors[`date_${index}`] = 'La date est obligatoire';
        isValid = false;
      }

      // Validation du montant
      if (!input.montant) {
        errors[`montant_${index}`] = 'Le montant est obligatoire';
        isValid = false;
      } else {
        const montantValue = parseFloat(input.montant);
        if (isNaN(montantValue)) {
          errors[`montant_${index}`] = 'Le montant doit être un nombre';
          isValid = false;
        } else if (montantValue <= 0) {
          errors[`montant_${index}`] = 'Le montant doit être positif';
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    return isValid;
  };
  // Validation en temps réel
  useEffect(() => {
    validateFields();
  }, [inputs, watch('tranche_id')]);

  const onSubmit = (data) => {
    const isValid = validateFields();
    setShowErrors(true); // Afficher les erreurs seulement après le submit

    if (!isValid) {
      toast.error('Veuillez corriger les erreurs avant de soumettre');
      setLoading_form({ form: false }); // Assurez-vous de désactiver le loading
      return; // Ajoutez return pour stopper l'exécution
    }

    setLoading_form({ form: true });
    setBackendErrors({});

    const dataToSend = new FormData();
    let url = APIURL.ECHEANCESTRANCE;

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
          message = `Echéance a été ${
            isEditing ? 'modifiée' : 'créée'
          } avec succès`;
          reset(defaultValues);
          toast.success(message);
          router.push('/administration/echeance-tranches');
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
      .finally(() => setLoading_form({ form: false }));
  };
  // Validation en temps réel

  if (loading) {
    return <LoadingSpin />;
  }
  // Ajoutez cette fonction pour obtenir toutes les erreurs sous forme de liste
  const getAllErrors = () => {
    const errorList = [];

    // Erreur tranche_id
    if (fieldErrors.tranche_id) {
      errorList.push(fieldErrors.tranche_id);
    }

    // Erreurs des inputs
    inputs.forEach((_, index) => {
      if (fieldErrors[`date_${index}`]) {
        errorList.push(
          `Échéance ${index + 1}: ${fieldErrors[`date_${index}`]}`
        );
      }
      if (fieldErrors[`montant_${index}`]) {
        errorList.push(
          `Échéance ${index + 1}: ${fieldErrors[`montant_${index}`]}`
        );
      }
    });

    return errorList;
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={'/administration/echeance-tranches'}
          step={`${id ? 'Modifier' : 'Ajouter'} un Échéance Tranche`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tranche Section */}
          <div className="p-6 border-b border-gray-200">
            {!isEditing ? (
              <>
                <SelectInput
                  placeholder="selectionner un Tranche"
                  label="Tranche :"
                  name="tranche_id"
                  value={watch('tranche_id')}
                  required={true}
                  options={Object.values(tranches).map((tr) => ({
                    value: tr.id,
                    label: tr.nom,
                  }))}
                  onChange={(value) => {
                    setValue('tranche_id', value);
                    setSelectedTranche(value)
                  }}
                  error={errors.tranche_id?.message || backendErrors.tranche_id}
                />
              </>
            ) : (
              <TextField
                label="Tranche:"
                name="tranche"
                disabled={true}
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
              />
            )}
          </div>
          {/* Echéances Section */}
          <div className="p-6">
            <div className="bg-blue-500 rounded-lg h-7 flex items-center justify-center mx-auto mb-6">
              <h3 className="text-white text-lg font-semibold text-center">
                Échéances
              </h3>
            </div>

            {inputs.map((item, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-start gap-4">
                  {/* Echéance Label */}
                  <div className="w-32 flex-shrink-0">
                    <label className="block text-sm font-medium text-blue-500 mt-3">
                      Échéance : {index + 1}
                    </label>
                  </div>

                  {/* Date and Montant Inputs */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Date:"
                      name={`date_${index}`}
                      type="date"
                      value={item.date}
                      control={false}
                      errors={{}} // Affiche seulement si showErrors
                      backendErrors={backendErrors}
                      onChange={(event) => handleChange(event, index, 'date')}
                    />

                    <TextField
                      label="Montant:"
                      name={`montant_${index}`}
                      type="number"
                      value={item.montant}
                      control={false}
                      errors={{}} // Affiche seulement si showErrors
                      backendErrors={backendErrors}
                      onChange={(event) =>
                        handleChange(event, index, 'montant')
                      }
                    />
                  </div>

                  {/* Action Buttons - Toujours présent pour maintenir l'espace */}
                  <div className="flex gap-2 mt-6 w-20 flex-shrink-0">
                    {inputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteInput(index)}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                    {index === inputs.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddInput}
                        className="px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        +
                      </button>
                    )}
                    {/* Espace vide pour les rows sans boutons */}
                    {inputs.length === 1 && index === 0 && (
                      <div className="w-10 h-10"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showErrors && getAllErrors().length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-red-800 font-semibold mb-2">
                Erreurs à corriger :
              </h4>
              <ul className="list-disc list-inside text-red-600">
                {getAllErrors().map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading_form.form}>
              {loading_form.form
                ? 'Chargement...'
                : id
                ? 'Modifier'
                : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EcheanceTrancheFormForm;
