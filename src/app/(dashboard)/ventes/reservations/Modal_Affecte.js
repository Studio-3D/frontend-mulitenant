'use client';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/Button';
import SelectInput from '@/components/SelectInput';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { APIURL } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';

export default function Modal_Affecte({
  old_notaire_id,
  onClose,
  code_reservation,
  id,
  notaires = [],
  res_show = false,
  onReservationUpdate,
}) {
  const [loading, setLoading] = useState({ form: false });
  const [backendErrors, setBackendErrors] = useState(null);
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');

  const [oldNotaireName, setOldNotaireName] = useState('');
  const [isModification, setIsModification] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  // Set default value and check if it's a modification
  useEffect(() => {
    if (old_notaire_id) {
      setIsModification(true);
      
      // Set the default value
      const stringValue = old_notaire_id.toString();
      setSelectedValue(stringValue);
      
      // Find and display the old notaire's name
      const oldNotaire = notaires.find(n => n.id == old_notaire_id);
      if (oldNotaire) {
        setOldNotaireName(`${oldNotaire.name || ''} ${oldNotaire.prenom || ''}`.trim());
      }
    } else {
      setIsModification(false);
      setSelectedValue('');
    }
  }, [old_notaire_id, notaires]);

  const defaultValues = {
    notaire_id: old_notaire_id ? old_notaire_id.toString() : '',
  };

  const validationSchema = yup.object().shape({
    notaire_id: yup.string().required('Veuillez sélectionner un notaire'),
  });

  const validationSchemaRef = useRef(validationSchema);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues: defaultValues,
  });

  // Watch for form value changes
  const watchedNotaireId = watch('notaire_id');

  // Update selectedValue when form value changes
  useEffect(() => {
    if (watchedNotaireId !== undefined) {
      setSelectedValue(watchedNotaireId);
    }
  }, [watchedNotaireId]);

  // Set initial value in form
  useEffect(() => {
    console.log('old not id===>',old_notaire_id)
    if (old_notaire_id && !selectedValue) {
      setValue('notaire_id', old_notaire_id.toString());
    }
  }, [old_notaire_id, setValue, selectedValue]);

  const formatNotairesOptions = () => {
    return notaires.map(notaire => {
      const isCurrent = old_notaire_id && notaire.id == old_notaire_id;
      return {
        value: notaire.id,
        label: isCurrent 
          ? `${notaire.name || ''} ${notaire.prenom || ''} (Actuel)` 
          : `${notaire.name || ''} ${notaire.prenom || ''}`,
        isCurrent: isCurrent
      };
    });
  };

  // AFFECTER/MODIFIER NOTAIRE - UPDATED
  const onSubmit = (data) => {
    setLoading({ ...loading, form: true });
    setBackendErrors(null);

    const requestData = {
      notaire_id: data.notaire_id,
    };

    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/affecter_notaire/${Number(id)}`,
      data: requestData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setLoading({ ...loading, form: false });
        
        if (isModification && data.notaire_id == old_notaire_id) {
          toast.success('Aucun changement effectué');
        } else if (isModification) {
          const oldNotaire = notaires.find(n => n.id == old_notaire_id);
          const newNotaire = notaires.find(n => n.id == data.notaire_id);
          const oldName = oldNotaire ? `${oldNotaire.name} ${oldNotaire.prenom}` : 'Ancien notaire';
          const newName = newNotaire ? `${newNotaire.name} ${newNotaire.prenom}` : 'Nouveau notaire';
          toast.success(`Notaire modifié de "${oldName}" à "${newName}"`);
        } else {
          toast.success('Réservation affectée au notaire avec succès');
        }

      
                if (res_show && onReservationUpdate) {
                  // If we're in res_show mode, call the callback to reload data
                  console.log('🔍 Calling onReservationUpdate callback from rejection');
                  onReservationUpdate();
                } else {
                  // Original behavior for other cases
                  localStorage.setItem('load_data_reservation', 1);
                }
      
        onClose();
      })
      .catch((error) => {
        console.error('Error affecting notaire:', error);
        setLoading({ ...loading, form: false });
        setBackendErrors(
          error.response?.data?.message || 
          'Erreur lors de l\'affectation/modification du notaire. Veuillez réessayer.'
        );
      });
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-blue-600 px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            {isModification ? 'Modifier le Notaire' : 'Affecter Réservation'}
          </h1>
        </div>
      </div>

      <div className="p-6 w-full max-w-[800px] mx-auto">
        {/* Reservation Information Section */}
        <div className="mb-8">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{code_reservation}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Code réservation</p>
            </div>
          </div>
        </div>

        {/* Notaire Selection Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 mx-auto w-full max-w-[500px] flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full">
           
            <div className="w-full">
              <SelectInput
                label={"Notaire"}
                name="notaire_id"
                required={true}
                control={control}
                errors={errors}
                placeholder="Sélectionner un notaire"
                options={formatNotairesOptions()}
                onChange={(value) => {
                  setValue('notaire_id', value);
                  setSelectedValue(value);
                }}
                width="w-full"
                value={selectedValue} // Pass the current value
              />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4 w-full">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {isModification ? "Après la modification" : "Après l'affectation"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {isModification 
                    ? "Le notaire sera modifié pour cette réservation"
                    : "La réservation sera automatiquement attribuée au notaire sélectionné"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            {backendErrors && (
              <p className="!text-red-600 text-sm mb-2 mt-4 p-2 bg-red-50 rounded">
                {backendErrors}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-4 mt-8 w-full">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="px-6 py-2"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading.form || !notaires.length}
              loading={loading.form}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
            >
              {isModification ? 'Modifier' : 'Affecter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}