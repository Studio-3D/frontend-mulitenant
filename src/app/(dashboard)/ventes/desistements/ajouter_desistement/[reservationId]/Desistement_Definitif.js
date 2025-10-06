import React, { useState, useEffect } from 'react';
import { motif_desistements } from '@/configs/enum';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import SelectInput from '@/components/SelectInput';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@/components/Textfield';
import Autocomplete from '@/components/Autocomplete';
import { data_by_projet_and_params } from '../../../../../../../src/configs/api-utils';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';
import { User, Home, Box, DollarSign, HandCoins, Wallet } from 'lucide-react';

export function Desistement_Definitif({
  isEditing,
  formData,
  accessToken,
  selectedProjet_id,
  inputListRemb_get,
  sum_avances_valides,
  reservationId,
  onDossierInfosChange,
  type_remb_get,
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const [loading_dos, setLoading_dos] = useState();
  const [dossiers, setDossiers] = useState([]);
  const [loadingInfos, setLoadingInfos] = useState({});
  const [type_remb, set_type_remb] = useState(null);
  const [inputListRemb, set_inputList_remb] = useState([]);
  const [dossierInfos, setDossierInfos] = useState({});

  // Debug motif_desistements
  useEffect(() => {
    console.log('=== motif_desistements DEBUG ===');
    console.log('motif_desistements:', motif_desistements);
    console.log('motif_desistements type:', typeof motif_desistements);
    console.log('Is array?', Array.isArray(motif_desistements));
    console.log('Is object?', typeof motif_desistements === 'object' && motif_desistements !== null);
    
    if (typeof motif_desistements === 'object' && motif_desistements !== null) {
      console.log('Object keys:', Object.keys(motif_desistements));
      console.log('Object values:', Object.values(motif_desistements));
      console.log('Object entries:', Object.entries(motif_desistements));
      
      const entries = Object.entries(motif_desistements);
      if (entries.length > 0) {
        console.log('First entry:', entries[0]);
        console.log('First entry key:', entries[0][0]);
        console.log('First entry value:', entries[0][1]);
        console.log('First entry value type:', typeof entries[0][1]);
        
        // Check if value is an object with code/label
        if (typeof entries[0][1] === 'object' && entries[0][1] !== null) {
          console.log('First entry value properties:', Object.keys(entries[0][1]));
        }
      }
    }
  }, []);

  // Helper function to safely format options
  const getMotifOptions = () => {
    console.log('=== getMotifOptions called ===');
    
    if (!motif_desistements) {
      console.log('motif_desistements is null or undefined');
      return [];
    }

    if (Array.isArray(motif_desistements)) {
      console.log('motif_desistements is an array, mapping directly');
      const options = motif_desistements.map(item => ({
        value: item.code || item.value || item.id,
        label: item.label || item.name || item.description
      }));
      console.log('Array options:', options);
      return options;
    }

    if (typeof motif_desistements === 'object') {
      console.log('motif_desistements is an object, converting with Object.entries');
      const entries = Object.entries(motif_desistements);
      console.log('Number of entries:', entries.length);
      
      const options = entries.map(([key, value]) => {
        console.log(`Processing entry - key: ${key}, value:`, value);
        
        // If value is an object with code/label properties
        if (typeof value === 'object' && value !== null) {
          const option = {
            value: value.code || value.value || key,
            label: value.label || value.name || value.description || String(value)
          };
          console.log('Created object option:', option);
          return option;
        }
        // If value is a simple string/number
        const option = {
          value: key,
          label: String(value)
        };
        console.log('Created simple option:', option);
        return option;
      });
      console.log('Final object options:', options);
      return options;
    }

    console.log('motif_desistements is neither array nor object, returning empty array');
    return [];
  };

  // Test with hardcoded options to verify SelectInput works
  const testOptions = [
    { value: 'test1', label: 'Test Option 1' },
    { value: 'test2', label: 'Test Option 2' },
    { value: 'test3', label: 'Test Option 3' }
  ];

  useEffect(() => {
    if (isEditing && formData) {
      set_type_remb(type_remb_get);
      setValue('motif', formData.motif);
      setValue('type_remb', type_remb_get);
      setValue('commentaire_rejete', formData.commentaire_rejete);

      const list =
        formData?.remboursement?.length > 0
          ? formData.remboursement.map((item) => ({
              cl_id: item?.aquereur?.client_id,
              aq_id: item?.aquereur_id,
              nom: item?.aquereur?.client.nom,
              pourcentage: item.aquereur?.pourcentage,
              prenom: item?.aquereur?.client.prenom,
              date_rembourse: item.date_rembourse,
              mode_rembourse: item.mode_rembourse_client,
              type_remb:
                item.mode_rembourse ==
                ('transfert_rem_direct' || 'transfert_rem_apres_vente')
                  ? 'transfert_remb'
                  : item.mode_rembourse,
              montant_transferer: item.montant_transfert,
              reste_a_rembourse: item.montant_a_rembourser,
              num_paiement: item.num_paiement,
              cheque_recu: item.cheque,
              pour_le_compte: item.pour_le_compte,
              fichier_autorisation: item.fichier_autorisation,
              montant_a_rembourser: item.montant_a_rembourser,
              dossier_id: item.dossier_id_transfert,
              type_remb_transfere:
                item.mode_rembourse === 'transfert_rem_direct'
                  ? 'immediat'
                  : item.mode_rembourse === 'transfert_rem_apres_vente'
                  ? 'apres_vente'
                  : '',
            }))
          : [];

      set_inputList_remb(list);
      setValue('inputList_remb', list);

      list.forEach((item, index) => {
        if (item.cheque_recu) {
          setValue(`inputList_remb.${index}.cheque_recu`, item.cheque_recu);
        }
        if (item.fichier_autorisation) {
          setValue(
            `inputList_remb.${index}.fichier_autorisation`,
            item.fichier_autorisation
          );
        }
        setValue(
          `inputList_remb.${index}.reste_a_rembourse`,
          item.montant_a_rembourser
        );
        if (item.dossier_id) {
          get_info_dossier_id(item.dossier_id, index);
        }
      });
    } else {
      set_inputList_remb(inputListRemb_get || []);
      setValue('inputList_remb', inputListRemb_get || []);
    }
  }, [isEditing, formData, setValue]);

  const handleInputChange = (index, fieldName, value) => {
    setValue(`inputList_remb.${index}.${fieldName}`, value);
  };

  const handleFileChange = (index, fieldName, event) => {
    if (event.target.files && event.target.files[0]) {
      setValue(`inputList_remb.${index}.${fieldName}`, event.target.files[0]);
    } else if (isEditing) {
      const existingFile = inputListRemb[index]?.[fieldName];
      if (existingFile) {
        setValue(`inputList_remb.${index}.${fieldName}`, existingFile);
      }
    }
  };

  const fetchDossierData = async () => {
    try {
      setLoading_dos(true);
      await data_by_projet_and_params(
        'getDossiers',
        setDossiers,
        setLoading_dos,
        'reservations',
        selectedProjet_id,
        reservationId
      );
    } catch (error) {
      console.error('Error fetching dossiers:', error);
    } finally {
      setLoading_dos(false);
    }
  };

  useEffect(() => {
    fetchDossierData();
  }, []);

  const get_info_dossier_id = async (dos_id, index) => {
    console.log('doos id==>' + dos_id);
    try {
      if (dos_id) {
        setLoadingInfos((prev) => ({ ...prev, [index]: true }));

        const response = await axios.get(
          `${APIURL.ROOTV1}/reservations/${dos_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const { reservation, sum_avances_valides } = response.data;

        const newDossierInfo = {
          clients: reservation.aquereurs,
          bien: reservation.bien.propriete_dite_bien,
          type: reservation.bien.type_bien.type,
          prix: reservation.prix,
          sum_avances: sum_avances_valides,
          reste: reservation.prix - sum_avances_valides,
        };
        setDossierInfos((prev) => ({
          ...prev,
          [index]: newDossierInfo,
        }));

        if (onDossierInfosChange) {
          onDossierInfosChange(index, newDossierInfo);
        }
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    } finally {
      setLoadingInfos((prev) => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    if (!isEditing) {
      inputListRemb?.forEach((item, index) => {
        setValue(`inputList_remb.${index}`, {
          ...item,
          type_remb: item.type_remb || 'direct',
          mode_rembourse: item.mode_rembourse || '',
          reste_a_rembourse: item.reste_a_rembourse || 'fadwa',
        });
      });
    }
  }, [type_remb, inputListRemb, setValue]);

  const handleModeChange = (index, newMode) => {
    const currentValues = watch(`inputList_remb.${index}`) || {};

    setValue(`inputList_remb.${index}`, {
      ...currentValues,
      type_remb: newMode,
      dossier_id: '',
      montant_transferer: '',
      reste_a_rembourse: '',
      date_rembourse: '',
      mode_rembourse: '',
      num_paiement: '',
      cheque_recu: null,
      pour_le_compte: '',
      fichier_autorisation: null,
      error: '',
      type_remb_transfere:
        newMode == 'transfert_rem_direct'
          ? 'immediat'
          : newMode == 'transfert_rem_apres_vente'
          ? 'apres_vente'
          : currentValues.type_remb_transfere || 'immediat',
    });

    setDossierInfos((prev) => {
      const newInfos = { ...prev };
      delete newInfos[index];
      return newInfos;
    });
  };

  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-red-50 !text-red-800 rounded-md">
          <p className="font-medium">
            le Désistement est Rejeté a cause de {watch('commentaire_rejete')}
          </p>
        </div>
      )}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-1/2">
          <SelectInput
            label="Motif :"
            name="motif"
            value={isEditing ? formData.motif : watch('motif')}
            required={true}
            options={getMotifOptions()}
            onChange={(value) => {
              console.log('Selected motif value:', value);
              setValue('motif', value);
            }}
            error={errors.motif?.message}
            placeholder="Sélectionnez un motif"
          />
        </div>

        {sum_avances_valides > 0 && (
          <div className="flex flex-col">
            <Controller
              name="type_remb"
              control={control}
              render={({ field }) => (
                <div>
                  <div className="flex flex-row items-center space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="direct"
                        checked={field.value == 'direct'}
                        className="text-blue-600 focus:ring-blue-500"
                        onChange={() => {
                          field.onChange('direct');
                          set_type_remb('direct');
                        }}
                      />
                      <span className="ml-2">Rem.immediat</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="apres_vente"
                        checked={field.value == 'apres_vente'}
                        className="text-purple-600 focus:ring-purple-500"
                        onChange={() => {
                          field.onChange('apres_vente');
                          set_type_remb('apres_vente');
                        }}
                      />
                      <span className="ml-2">Rem.Aprés Vente</span>
                    </label>
                  </div>
                  {errors.type_remb && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type_remb.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        )}
      </div>
      {type_remb == 'direct' && (
        <>
          <div className="border-t border-gray-300 my-4"></div>
          <div className="w-full">
            {inputListRemb?.map((item, index) => {
              const itemKey = item.aq_id
                ? `${item.aq_id}-${index}`
                : `item-${index}`;

              const currentMode = watch(`inputList_remb.${index}.type_remb`);
              const showTransferSection =
                currentMode == 'transfert' ||
                currentMode == 'transfert_remb' ||
                currentMode == 'transfert_rem_direct' ||
                currentMode == 'transfert_rem_apres_vente';

              const showDirectFields =
                currentMode == 'direct' ||
                ((currentMode == 'transfert_remb' ||
                  currentMode == 'transfert_rem_direct' ||
                  currentMode == 'transfert_rem_apres_vente') &&
                  watch(`inputList_remb.${index}.type_remb_transfere`) ==
                    'immediat' &&
                  parseFloat(
                    watch(`inputList_remb.${index}.reste_a_rembourse`) || 0
                  ) > 0);
              return (
                <div
                  key={`${itemKey}`}
                  className=""
                >
                  <p className="text-indigo-600 font-bold mb-4">
                    Montant à rembourser au client: {item.nom} {item.prenom}
                    {currentMode !== 'transfert' && (
                      <span className="text-red-500 ml-2">
                        {item.reste_a_rembourse || 0} DH
                      </span>
                    )}
                  </p>
                  <div className="mb-4">
                    <label className="block font-medium text-gray-700">
                      Mode Remboursement :
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`inputList_remb.${index}.type_remb`}
                      control={control}
                      defaultValue={item.type_remb || 'direct'}
                      rules={{
                        required: {
                          value: true,
                          message: 'Vous devez choisir une option',
                        },
                      }}
                      render={({ field, fieldState: { error } }) => {
                        const normalizedValue =
                          field.value == 'transfert_rem_direct' ||
                          field.value == 'transfert_rem_apres_vente'
                            ? 'transfert_remb'
                            : field.value == 'transfert'
                            ? 'transfert'
                            : field.value;

                        return (
                          <>
                            <div className="flex gap-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={normalizedValue == 'direct'}
                                  onChange={() => {
                                    handleModeChange(index, 'direct');
                                    setValue(
                                      `inputList_remb.${index}.reste_a_rembourse`,
                                      item.reste_a_rembourse.toFixed(2)
                                    );
                                  }}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2">Direct</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={normalizedValue == 'transfert'}
                                  onChange={() =>
                                    handleModeChange(index, 'transfert')
                                  }
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2">Transfert</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={normalizedValue == 'transfert_remb'}
                                  onChange={() => {
                                    handleModeChange(index, 'transfert_remb');
                                  }}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2">
                                  Transfert et Remboursement
                                </span>
                              </label>
                            </div>
                            {error && (
                              <p style={{ color: 'red' }}>{error.message}</p>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                  {showTransferSection && (
                    <div className="">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                          <SelectInput
                            label="Dossiers:"
                            name={`inputList_remb.${index}.dossier_id`}
                            value={watch(`inputList_remb.${index}.dossier_id`)}
                            required={true}
                            options={dossiers.map(dossier => ({
                              value: dossier.id,
                              label: dossier.code_reservation || `Dossier ${dossier.id}`
                            }))}
                            loading={loading_dos}
                            onChange={(selectedValue) => {
                              const dossierId = selectedValue;
                              setValue(
                                `inputList_remb.${index}.dossier_id`,
                                dossierId
                              );
                              if (dossierId) {
                                get_info_dossier_id(dossierId, index);
                              } else {
                                setDossierInfos((prev) => {
                                  const newInfos = { ...prev };
                                  delete newInfos[index];
                                  return newInfos;
                                });
                              }
                            }}
                            error={errors.inputList_remb?.[index]?.dossier_id?.message}
                            placeholder="Sélectionnez un dossier"
                          />
                        </div>

                        {loadingInfos[index] ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        ) : dossierInfos[index] ? (
                          <>
                            <div className="border border-gray-200 rounded-lg p-4 min-h-[300px]">
                              <h2 className="text-xl font-bold text-green-600 mb-4">
                                Information Du Dossier :
                              </h2>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <User className="w-5 h-5 mr-2 text-blue-500" />
                                          Clients :
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[index].clients.map(
                                            (client, i) => (
                                              <div key={i}>
                                                {client.client.nom}{' '}
                                                {client.client.prenom}{' '}
                                                {client.pourcentage}%
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <Home className="w-5 h-5 mr-2 text-red-500" />
                                          Bien:
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[index].bien}
                                        </div>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <Box className="w-5 h-5 mr-2 text-gray-600" />
                                          Type Bien :
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[index].type}
                                        </div>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
                                          Prix :
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[
                                            index
                                          ].prix?.toLocaleString() + ' DH'}
                                        </div>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <HandCoins className="w-5 h-5 mr-2 text-green-500" />
                                          Montant :
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[
                                            index
                                          ].sum_avances?.toLocaleString() +
                                            ' DH'}
                                        </div>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                          <Wallet className="w-5 h-5 mr-2 text-red-500" />
                                          Reste :
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {dossierInfos[
                                            index
                                          ].reste?.toLocaleString() + ' DH'}
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {(currentMode == 'transfert_remb' ||
                              currentMode == 'transfert_rem_direct' ||
                              currentMode == 'transfert_rem_apres_vente') &&
                              watch(`inputList_remb.${index}.dossier_id`) && (
                                <>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <div className="flex items-center">
                                      <TextField
                                        label="Montant à Transférer"
                                        name={`inputList_remb.${index}.montant_transferer`}
                                        required
                                        type="number"
                                        control={control}
                                        errors={{}}
                                        backendErrors={{}}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setValue(
                                            `inputList_remb.${index}.montant_transferer`,
                                            value
                                          );
                                          const sum_avance_by_aq_percent =
                                            (item.pourcentage / 100) *
                                            sum_avances_valides;
                                          let errorMessage = '';

                                          if (value <= 0) {
                                            errorMessage =
                                              'Le montant transféré ne doit pas être négatif ou égal à 0';
                                          }
                                          else {
                                            if (
                                              value >
                                                sum_avance_by_aq_percent &&
                                              value > dossierInfos[index].reste
                                            ) {
                                              errorMessage = `Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                                                index
                                              ].reste
                                                .toFixed(2)
                                                .toLocaleString()} DH) ni le reste à rembourser (${sum_avance_by_aq_percent
                                                .toFixed(2)
                                                .toLocaleString()} DH)`;
                                            } else if (
                                              value > sum_avance_by_aq_percent
                                            ) {
                                              errorMessage = `Le montant transféré ne doit pas dépasser le reste à rembourser (${sum_avance_by_aq_percent
                                                .toFixed(2)
                                                .toLocaleString()} DH)`;
                                            } else if (
                                              value > dossierInfos[index].reste
                                            ) {
                                              errorMessage = `Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                                                index
                                              ].reste
                                                .toFixed(2)
                                                .toLocaleString()} DH)`;
                                            }
                                          }

                                          setValue(
                                            `inputList_remb.${index}.error`,
                                            errorMessage
                                          );
                                          setValue(
                                            `inputList_remb.${index}.reste_a_rembourse`,
                                            (
                                              sum_avance_by_aq_percent - value
                                            ).toFixed(2)
                                          );
                                        }}
                                      />
                                    </div>

                                    <div className="flex items-center">
                                      <TextField
                                        label="Reste à Rembourser"
                                        name={`inputList_remb.${index}.reste_a_rembourse`}
                                        type="number"
                                        control={control}
                                        errors={{}}
                                        backendErrors={{}}
                                        disabled
                                      />
                                    </div>
                                    {watch(`inputList_remb.${index}.error`) && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {watch(`inputList_remb.${index}.error`)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <Controller
                                      name={`inputList_remb.${index}.type_remb_transfere`}
                                      control={control}
                                      render={({ field }) => (
                                        <div className="flex flex-row space-x-4">
                                          <label className="inline-flex items-center">
                                            <input
                                              type="radio"
                                              {...field}
                                              value="immediat"
                                              checked={
                                                field.value == 'immediat'
                                              }
                                              className="text-blue-600 focus:ring-blue-500"
                                              onChange={(e) => {
                                                field.onChange(e.target.value);
                                              }}
                                            />
                                            <span className="ml-2">
                                              Immédiat
                                            </span>
                                          </label>

                                          <label className="inline-flex items-center">
                                            <input
                                              type="radio"
                                              {...field}
                                              value="apres_vente"
                                              checked={
                                                field.value == 'apres_vente'
                                              }
                                              className="text-purple-600 focus:ring-purple-500"
                                              onChange={(e) => {
                                                field.onChange(e.target.value);
                                              }}
                                            />
                                            <span className="ml-2">
                                              Après Vente
                                            </span>
                                          </label>
                                        </div>
                                      )}
                                    />
                                  </div>
                                </>
                              )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {showDirectFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="w-full">
                        <TextField
                          label="Date Remboursement"
                          name={`inputList_remb.${index}.date_rembourse`}
                          required
                          type="date"
                          control={control}
                          errors={{}}
                          backendErrors={{}}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              'date_rembourse',
                              e.target.value
                            )
                          }
                          width="w-full"
                          height="h-[38px]"
                        />
                        {errors.inputList_remb?.[index]?.date_rembourse && (
                          <p
                            style={{ color: 'red' }}
                            className="mt-1 text-xs"
                          >
                            {
                              errors.inputList_remb[index].date_rembourse
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remboursé par: <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name={`inputList_remb.${index}.mode_rembourse`}
                          control={control}
                          rules={{
                            required: {
                              value: true,
                              message: 'Vous devez choisir une option',
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <>
                              <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    checked={field.value == 'cheque'}
                                    onChange={() => {
                                      field.onChange('cheque');
                                    }}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2">Chèque</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    checked={field.value == 'virement'}
                                    onChange={() => {
                                      field.onChange('virement');
                                    }}
                                    className="text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="ml-2">Virement</span>
                                </label>
                              </div>
                              {error && (
                                <p style={{ color: 'red' }}>{error.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      {watch(`inputList_remb.${index}.mode_rembourse`) && (
                        <>
                          <div className="w-full">
                            <TextField
                              label="N° Paiement"
                              name={`inputList_remb.${index}.num_paiement`}
                              required
                              type="number"
                              control={control}
                              errors={{}}
                              backendErrors={{}}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  'num_paiement',
                                  e.target.value
                                )
                              }
                              width="w-full"
                              height="h-[38px]"
                            />
                            {errors.inputList_remb?.[index]?.num_paiement && (
                              <p
                                style={{ color: 'red' }}
                                className="mt-1 text-xs"
                              >
                                {
                                  errors.inputList_remb[index].num_paiement
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          <div className="w-full">
                            <TextField
                              label="Chéque/Reçu"
                              name={`inputList_remb.${index}.cheque_recu`}
                              required={
                                watch(
                                  `inputList_remb.${index}.mode_rembourse`
                                ) == 'cheque'
                              }
                              value={`inputList_remb.${index}.cheque_recu`}
                              type="file"
                              control={control}
                              errors={{}}
                              backendErrors={{}}
                              onChange={(e) =>
                                handleFileChange(index, 'cheque_recu', e)
                              }
                              width="w-full"
                              height="h-[38px]"
                              accept="image/*, application/pdf"
                              existingFileName={
                                isEditing ? item.cheque_recu : null
                              }
                            />
                            {errors.inputList_remb?.[index]?.cheque_recu && (
                              <p
                                style={{ color: 'red' }}
                                className="mt-1 text-xs"
                              >
                                {
                                  errors.inputList_remb[index].cheque_recu
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pour le Compte:{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name={`inputList_remb.${index}.pour_le_compte`}
                              control={control}
                              rules={{
                                required: {
                                  value: true,
                                  message: 'Vous devez choisir une option',
                                },
                              }}
                              defaultValue={undefined}
                              render={({ field, fieldState: { error } }) => (
                                <div>
                                  <div className="flex gap-4">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="radio"
                                        {...field}
                                        value="lui_meme"
                                        checked={field.value == 'lui_meme'}
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                          handleInputChange(
                                            index,
                                            'pour_le_compte',
                                            e.target.value
                                          );
                                        }}
                                        className="text-red-600 focus:ring-red-500"
                                      />
                                      <span className="ml-2">lui même</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                      <input
                                        type="radio"
                                        {...field}
                                        value="autre"
                                        checked={field.value == 'autre'}
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                          handleInputChange(
                                            index,
                                            'pour_le_compte',
                                            e.target.value
                                          );
                                        }}
                                        className="text-yellow-600 focus:ring-yellow-500"
                                      />
                                      <span className="ml-2">Autre</span>
                                    </label>
                                  </div>
                                  {error && (
                                    <p className="mt-1 text-sm text-red-600">
                                      {error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>

                          {watch(`inputList_remb.${index}.pour_le_compte`) ==
                            'autre' && (
                            <div>
                              <TextField
                                label="Fichier Autorisation"
                                name={`inputList_remb.${index}.fichier_autorisation`}
                                required={true}
                                type="file"
                                control={control}
                                errors={{}}
                                backendErrors={{}}
                                onChange={(e) =>
                                  handleFileChange(
                                    index,
                                    'fichier_autorisation',
                                    e
                                  )
                                }
                                width="w-full"
                                height="h-[38px]"
                                accept="image/*, application/pdf"
                                existingFileName={
                                  isEditing ? item.fichier_autorisation : null
                                }
                              />
                              {errors.inputList_remb?.[index]
                                ?.fichier_autorisation && (
                                <p
                                  style={{ color: 'red' }}
                                  className="mt-1 text-xs"
                                >
                                  {
                                    errors.inputList_remb[index]
                                      .fichier_autorisation.message
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}