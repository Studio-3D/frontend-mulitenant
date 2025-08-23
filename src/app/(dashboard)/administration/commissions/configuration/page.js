'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import { APIURL, ENDPOINTS } from '@/configs/api';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

export default function CommissionConfigForm({ onClose, onSuccess }) {
  const router = useRouter();
  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet_id = JSON.parse(
    localStorage.getItem('selectedProjet')
  )?.id;
  const [msg_alert, setMsg_alert] = useState(null);
  const [inputs, setInputs] = useState([{ de: '', a: '', pourcentage: '' }]);
  const [loading, setLoading] = useState({ form: false });
  const [loading_config, setLoadingConfig] = useState(true);
  const [backendErrors, setBackendErrors] = useState({});

  const defaultValues = {
    projet_id: selectedProjet_id,
    commission_montant: '',
    configuration: [],
  };

  const validationSchemaRef = useRef(yup.object().shape({}));

  const { handleSubmit, reset, setValue, watch } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  const fetchData_commission_montant = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/commission_montant/` + selectedProjet_id,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { data } = response;
      setValue('commission_montant', data.commission_montant?.montant);
      setLoading(false); // Data is loaded, set loading to false
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Fonction pour charger la configuration existante
  const fetchData_Configuration = async () => {
    try {
      const res = await axios.get(
        `${APIURL.ROOTV1}/configurations_commissions/${selectedProjet_id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.data.configurations && res.data.configurations.length > 0) {
        setInputs(res.data.configurations); // Remplit le state inputs avec la config récupérée
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de la configuration.');
    }
  };

  useEffect(() => {
    fetchData_Configuration();
    fetchData_commission_montant();
  }, []);

  const handleAddInput = () => {
    setInputs([...inputs, { de: '', a: '', pourcentage: '' }]);
  };

  const handleChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...inputs];
    onChangeValue[index][name] = value;
    setInputs(onChangeValue);
    setValue('configuration', JSON.stringify(onChangeValue));

    if (name === 'pourcentage') {
      if (value == 0 || value < 0) {
        setMsg_alert(
          'Le pourcentage ne doit pas être égal à zéro ni être négatif. Ligne ' +
            (index + 1)
        );
      } else if (value > 100) {
        setMsg_alert(
          'Le pourcentage ne doit pas dépasser 100 % dans la ligne ' +
            (index + 1)
        );
      } else {
        setMsg_alert(null);
      }
    }

    if (name === 'de' && index > 0) {
      if (value <= +inputs[index - 1]['a']) {
        setMsg_alert(
          'La case De ne doit pas débuter par ' +
            value +
            ' à la ligne : ' +
            (index + 1)
        );
      } else {
        setMsg_alert(null);
      }
    }
  };

  const handleDeleteInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
    setValue('configuration', newArray);
  };

  const onSubmit = (data) => {
    inputs.forEach((ar, index) => {
      if (index > 0 && ar.de <= +inputs[index - 1]['a']) {
        setMsg_alert(
          'La case De ne doit pas débuter par ' +
            ar.de +
            ' à la ligne : ' +
            (index + 1)
        );
      }
    });

    setLoading({ ...loading, form: true });
    setBackendErrors({});

    const dataToSend = new FormData();
    let url = APIURL.COMMISSIONSCONFIGURATIONS;

    Object.entries(data).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });

    axios
      .post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success('Commissions créées avec succès');
          reset(defaultValues);
          if (onSuccess) {
            onSuccess(); // Appeler la fonction passée en prop
          } else {
            // Par défaut, rediriger vers tableau de bord
            router.push('/commissions/commissionMensuelleAtt');
          }
        } else if (res.status === 422) {
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

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={'/'}
            step={`Configurer les Commissions`}
          />
        </div>
        <div className="p-6 mt-4 bg-white shadow-md rounded-md">
          {msg_alert && (
            <div
              className="bg-yellow-100 border border-yellow-400 text-black-700 px-4 py-3 rounded mb-4 text-center"
              role="alert"
            >
              {msg_alert}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Modified Montant Fixe section - now centered */}
            <div className="flex flex-col items-center justify-center space-y-4 mb-6">
              <label
                htmlFor="commission_montant"
                className="text-gray-700 font-medium text-lg"
              >
                Montant Fixe
              </label>
              <input
                id="commission_montant"
                type="number"
                required
                className="w-full max-w-xs border border-gray-300 rounded px-4 py-3 text-center focus:outline-none hover:border-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-indigo-200"
                value={watch('commission_montant')}
                onChange={(e) => setValue('commission_montant', e.target.value)}
              />
            </div>

            <div className="bg-indigo-700 rounded p-2 text-white text-center font-semibold mb-4">
              Configuration
            </div>

            {inputs.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 border border-gray-300 rounded p-4 mb-4"
              >
                <div className="w-full sm:w-1/6 mb-2 sm:mb-0 font-semibold text-indigo-600">
                  Configuration : {index + 1}
                </div>

                <input
                  type="number"
                  name="de"
                  required
                  min={1}
                  placeholder="De"
                  className="w-full sm:w-1/6 border border-gray-300 rounded px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                  value={item.de}
                  onChange={(e) => handleChange(e, index)}
                />
                <input
                  type="number"
                  name="a"
                  required
                  min={1}
                  placeholder="À"
                  className="w-full sm:w-1/6 border border-gray-300 rounded px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                  value={item.a}
                  onChange={(e) => handleChange(e, index)}
                />
                <input
                  type="number"
                  name="pourcentage"
                  required
                  min={1}
                  max={100}
                  placeholder="Commission en %"
                  className="w-full sm:w-1/6 border border-gray-300 rounded px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                  value={item.pourcentage}
                  onChange={(e) => handleChange(e, index)}
                />

                <div className="flex w-full sm:w-1/6 justify-end space-x-2">
                  <div className="w-8 flex justify-center">
                    {inputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteInput(index)}
                        disabled={msg_alert != null}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        aria-label="Supprimer"
                      >
                        {/* Icône "X" */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="w-8 flex justify-center">
                    {index === inputs.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddInput}
                        disabled={msg_alert != null}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        aria-label="Ajouter"
                      >
                        {/* Icône "+" */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {Object.keys(backendErrors).length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {Object.keys(backendErrors).map((key) => (
                  <p key={key}>{backendErrors[key][0]}</p>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-4 items-center mt-6 mb-6">
              <Button
                type="button"
                onClick={() => {
                  if (onClose) {
                    onClose(); // ferme le popup
                  } else {
                    router.push('/commissions/commissionMensuelleAtt'); // sinon revient en arrière
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  loading.form ||
                  watch('commission_montant') === '' ||
                  msg_alert != null
                }
                loading={loading.form}
              >
                {loading.form ? 'Chargement...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
