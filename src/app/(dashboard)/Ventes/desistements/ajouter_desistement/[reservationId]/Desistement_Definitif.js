import React, { useState, useEffect, useRef } from 'react';
import { motif_desistements } from '@/configs/enum';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@/components/Textfield'; // Import the component
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
  inputListRemb,
  sum_avances_valides,
  reservationId
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors }, // Destructure errors from formState
  } = useFormContext();
  const [info, setInfo] = useState(null);

  const [loading_info_doss, setLoading_info_doss] = useState(false);
  const [loading_dos, setLoading_dos] = useState();
  const [dossiers, setDossiers] = useState([]);
  const [dossierInfo, setDossierInfo] = useState(null);

  const type_remb = watch('type_remb');

  // This will update the form data when inputs change
  const handleInputChange = (index, fieldName, value) => {
    setValue(`inputList_remb.${index}.${fieldName}`, value);
  };

  const handleFileChange = (index, fieldName, event) => {
    if (event.target.files && event.target.files[0]) {
      setValue(`inputList_remb.${index}.${fieldName}`, event.target.files[0]);
    }
  };
  // Fetch dossier data (only for model 1)
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

  // Fetch all initial data
  useEffect(() => {
    fetchDossierData();
  }, []);

  const get_info_dossier_id = async (dos_id) => {
    try {
      if (dos_id) {
        setLoading_info_doss(true);
        const response = await axios.get(
          `${APIURL.ROOTV1}/reservations/${dos_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const { reservation, sum_avances_valides } = response.data;
        setDossierInfo({
          clients: reservation.aquereurs,
          bien: reservation.bien.propriete_dite_bien,
          type: reservation.bien.type_bien.type,
          prix: reservation.prix,
          sum_avances: sum_avances_valides,
          reste: reservation.prix - sum_avances_valides,
        });
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    } finally {
      setLoading_info_doss(false);
    }
  };
  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
          <p className="font-medium">
            Mode Édition: Vous modifiez un désistement existant
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AutocompleteSelectComponent
          label="Motif :"
          name="motif"
          value={isEditing && formData.motif}
          control={control}
          options={motif_desistements}
          errors={{}}
          required
          onChange={(value) => setValue('motif', value)}
        />
      </div>
      {sum_avances_valides > 0 && (
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-row space-x-4">
            <Controller
              name="type_remb"
              control={control}
              render={({ field }) => (
                <div>
                  <div className="flex flex-row space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="direct"
                        checked={field.value == 'direct'}
                        className="text-blue-600 focus:ring-blue-500"
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
                      />
                      <span className="ml-2">Rem.Aprés Vente</span>
                    </label>

                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="transfert"
                        checked={field.value == 'transfert'}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2">Transfert dossier</span>
                    </label>

                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="transfert_remb"
                        checked={field.value == 'transfert_remb'}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2">Transfert et Remboursement</span>
                    </label>
                  </div>
                  {errors.type_remb && (
                    <p style={{ color: 'red' }}>{errors.type_remb.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}
      {type_remb == 'direct' && (
        <>
          <div className="border-t border-gray-300 my-4"></div>
          <div className="w-full">
            {inputListRemb?.map((item, index) => (
              <div
                key={`${item.aq_id}-${index}`}
                className="mb-6 p-4 border border-gray-200 rounded-lg"
              >
                <p className="text-indigo-600 font-semibold mb-4">
                  Remboursement du Client: {item.nom} {item.prenom}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Remboursement */}
                  <>
                    <div className="w-full">
                      {' '}
                      {/* This wrapper ensures proper layout */}
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
                        <p style={{ color: 'red' }} className="mt-1 text-xs">
                          {' '}
                          {/* Added margin and text styling */}
                          {errors.inputList_remb[index].date_rembourse.message}
                        </p>
                      )}
                    </div>
                  </>
                  {/* Mode Remboursement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode Remboursement:{' '}
                      <span className="text-red-500">*</span>
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
                                  handleInputChange(
                                    index,
                                    'mode_rembourse',
                                    'cheque'
                                  );
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
                                  handleInputChange(
                                    index,
                                    'mode_rembourse',
                                    'virement'
                                  );
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

                  {/* Conditional fields - only show if mode_rembourse is set */}
                  {watch(`inputList_remb.${index}.mode_rembourse`) && (
                    <>
                      {/* Numéro Paiement */}
                      <div className="w-full">
                        {' '}
                        {/* This wrapper ensures proper layout */}
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
                          <p style={{ color: 'red' }} className="mt-1 text-xs">
                            {' '}
                            {/* Added margin and text styling */}
                            {errors.inputList_remb[index].num_paiement.message}
                          </p>
                        )}
                      </div>

                      {/* Chèque/Reçu */}

                      <div className="w-full">
                        {' '}
                        {/* This wrapper ensures proper layout */}
                        <TextField
                          label="Chéque/Reçu"
                          name={`inputList_remb.${index}.cheque_recu`}
                          required={
                            watch(`inputList_remb.${index}.mode_rembourse`) ==
                            'cheque'
                          }
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
                        />
                        {errors.inputList_remb?.[index]?.cheque_recu && (
                          <p style={{ color: 'red' }} className="mt-1 text-xs">
                            {' '}
                            {/* Added margin and text styling */}
                            {errors.inputList_remb[index].cheque_recu.message}
                          </p>
                        )}
                      </div>

                      {/* Pour le Compte */}
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
                          defaultValue={undefined} // ESSENTIEL: ne pas mettre de valeur par défaut
                          render={({ field, fieldState: { error } }) => (
                            <div>
                              <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    {...field} // Utilise les props de field directement
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

                      {/* Fichier Autorisation (conditional) */}
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
                              handleFileChange(index, 'fichier_autorisation', e)
                            }
                            width="w-full"
                            height="h-[38px]"
                            accept="image/*, application/pdf"
                          />
                          {errors.inputList_remb?.[index]
                            ?.fichier_autorisation && (
                            <p
                              style={{ color: 'red' }}
                              className="mt-1 text-xs"
                            >
                              {' '}
                              {/* Added margin and text styling */}
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
              </div>
            ))}
          </div>
        </>
      )}

      {(type_remb == 'transfert' || type_remb == 'transfert_remb') && (
        <div className="border-t border-gray-200 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Autocomplete */}
            <div>
              <Autocomplete
                label="Dossiers:"
                required
                name="dossier_id"
                options={dossiers}
                loading={loading_dos}
                choix="code_reservation"
                control={control}
                errors={{}}
                backendErrors={{}}
                onChange={(newValue) => {
                  setValue('dossier_id', newValue?.id || '');
                  get_info_dossier_id(newValue?.id);
                }}
              />
              {errors.dossier_id && (
                <p style={{ color: 'red' }} className="mt-1 text-xs">
                  {' '}
                  {/* Added margin and text styling */}
                  {errors.dossier_id}
                </p>
              )}
            </div>

            {/* Right Column - Dossier Info or Loading Spinner */}
            {loading_info_doss ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : dossierInfo ? (
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
                              {dossierInfo.clients.map((client, index) => (
                                <div key={index}>
                                  {client.client.nom} {client.client.prenom}{' '}
                                  {client.pourcentage}%
                                </div>
                              ))}
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
                              {dossierInfo.bien}
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
                              {dossierInfo.type}
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
                              {dossierInfo.prix.toLocaleString()} DH
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
                              {dossierInfo.sum_avances.toLocaleString()} DH
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
                              {dossierInfo.reste.toLocaleString()} DH
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div>
            {type_remb == 'transfert_remb' && watch('dossier_id') && (
              <>
                <div className="border-t border-gray-200 my-4 ">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Montant à Transférer */}
                    <div className="flex items-center">
                      <TextField
                        label="Montant à Transférer"
                        name="montant_transferer"
                        required
                        type="number"
                        defaultValue={0}
                        control={control}
                        errors={{}}
                        backendErrors={{}}
                        onChange={(e) => {
                          const value = e.target.value;
                          setValue('montant_transferer', value);
                          if (value > sum_avances_valides) {
                            setInfo(
                              'Le montant transféré ne doit pas dépasser la somme des avances'
                            );
                          } else {
                            setInfo(null);
                          }
                          setValue(
                            'reste_a_rembourse',
                            sum_avances_valides - value
                          );
                        }}
                      />
                      {info && <p style={{ color: 'red' }}>{info}</p>}
                    </div>

                    {/* Reste à Rembourser */}
                    <div className="flex items-center">
                      <TextField
                        label="Reste à Rembourser"
                        name="reste_a_rembourse"
                        required
                        type="number"
                        value={watch('reste_a_rembourse') || 0}
                        disabled
                        control={control}
                        errors={{}}
                        backendErrors={{}}
                      />
                    </div>
                  </div>

                  {/* Remboursement Options */}

                  <div className="mb-6">
                    <Controller
                      name="type_remb_transfere"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-row space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              {...field}
                              value="immediat"
                              checked={field.value == 'immediat'}
                              className="text-blue-600 focus:ring-blue-500"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue('type_remb_transfere', e.target.value);
                              }}
                            />
                            <span className="ml-2">Immédiat</span>
                          </label>

                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              {...field}
                              value="apres_vente"
                              checked={field.value == 'apres_vente'}
                              className="text-purple-600 focus:ring-purple-500"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue('type_remb_transfere', e.target.value);
                              }}
                            />
                            <span className="ml-2">Après Vente</span>
                          </label>
                        </div>
                      )}
                    />
                  </div>

                  {/* Immediate Refund Section */}
                  {watch('type_remb_transfere') == 'immediat' && (
                    <>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div className="space-y-6">
                        {inputListRemb?.map((item, index) => (
                          <div
                            key={`${item.aq_id}-${index}`}
                            className="mb-6 p-4 border border-gray-200 rounded-lg"
                          >
                            <p className="text-indigo-600 font-semibold mb-4">
                              Remboursement du Client: {item.nom} {item.prenom}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Date Remboursement */}
                              <>
                                <div className="w-full">
                                  {' '}
                                  {/* This wrapper ensures proper layout */}
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
                                  {errors.inputList_remb?.[index]
                                    ?.date_rembourse && (
                                    <p
                                      style={{ color: 'red' }}
                                      className="mt-1 text-xs"
                                    >
                                      {' '}
                                      {/* Added margin and text styling */}
                                      {
                                        errors.inputList_remb[index]
                                          .date_rembourse.message
                                      }
                                    </p>
                                  )}
                                </div>
                              </>
                              {/* Mode Remboursement */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Mode Remboursement:{' '}
                                  <span className="text-red-500">*</span>
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
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <>
                                      <div className="flex gap-4">
                                        <label className="inline-flex items-center">
                                          <input
                                            type="radio"
                                            checked={field.value == 'cheque'}
                                            onChange={() => {
                                              handleInputChange(
                                                index,
                                                'mode_rembourse',
                                                'cheque'
                                              );
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
                                              handleInputChange(
                                                index,
                                                'mode_rembourse',
                                                'virement'
                                              );
                                              field.onChange('virement');
                                            }}
                                            className="text-purple-600 focus:ring-purple-500"
                                          />
                                          <span className="ml-2">Virement</span>
                                        </label>
                                      </div>
                                      {error && (
                                        <p style={{ color: 'red' }}>
                                          {error.message}
                                        </p>
                                      )}
                                    </>
                                  )}
                                />
                              </div>

                              {/* Conditional fields - only show if mode_rembourse is set */}
                              {watch(
                                `inputList_remb.${index}.mode_rembourse`
                              ) && (
                                <>
                                  {/* Numéro Paiement */}
                                  <div className="w-full">
                                    {' '}
                                    {/* This wrapper ensures proper layout */}
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
                                    {errors.inputList_remb?.[index]
                                      ?.num_paiement && (
                                      <p
                                        style={{ color: 'red' }}
                                        className="mt-1 text-xs"
                                      >
                                        {' '}
                                        {/* Added margin and text styling */}
                                        {
                                          errors.inputList_remb[index]
                                            .num_paiement.message
                                        }
                                      </p>
                                    )}
                                  </div>

                                  {/* Chèque/Reçu */}

                                  <div className="w-full">
                                    {' '}
                                    {/* This wrapper ensures proper layout */}
                                    <TextField
                                      label="Chéque/Reçu"
                                      name={`inputList_remb.${index}.cheque_recu`}
                                      required={
                                        watch(
                                          `inputList_remb.${index}.mode_rembourse`
                                        ) == 'cheque'
                                      }
                                      type="file"
                                      control={control}
                                      errors={{}}
                                      backendErrors={{}}
                                      onChange={(e) =>
                                        handleFileChange(
                                          index,
                                          'cheque_recu',
                                          e
                                        )
                                      }
                                      width="w-full"
                                      height="h-[38px]"
                                      accept="image/*, application/pdf"
                                    />
                                    {errors.inputList_remb?.[index]
                                      ?.cheque_recu && (
                                      <p
                                        style={{ color: 'red' }}
                                        className="mt-1 text-xs"
                                      >
                                        {' '}
                                        {/* Added margin and text styling */}
                                        {
                                          errors.inputList_remb[index]
                                            .cheque_recu.message
                                        }
                                      </p>
                                    )}
                                  </div>

                                  {/* Pour le Compte */}
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
                                          message:
                                            'Vous devez choisir une option',
                                        },
                                      }}
                                      defaultValue={undefined} // ESSENTIEL: ne pas mettre de valeur par défaut
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <div>
                                          <div className="flex gap-4">
                                            <label className="inline-flex items-center">
                                              <input
                                                type="radio"
                                                {...field} // Utilise les props de field directement
                                                value="lui_meme"
                                                checked={
                                                  field.value == 'lui_meme'
                                                }
                                                onChange={(e) => {
                                                  field.onChange(
                                                    e.target.value
                                                  );
                                                  handleInputChange(
                                                    index,
                                                    'pour_le_compte',
                                                    e.target.value
                                                  );
                                                }}
                                                className="text-red-600 focus:ring-red-500"
                                              />
                                              <span className="ml-2">
                                                lui même
                                              </span>
                                            </label>
                                            <label className="inline-flex items-center">
                                              <input
                                                type="radio"
                                                {...field}
                                                value="autre"
                                                checked={field.value == 'autre'}
                                                onChange={(e) => {
                                                  field.onChange(
                                                    e.target.value
                                                  );
                                                  handleInputChange(
                                                    index,
                                                    'pour_le_compte',
                                                    e.target.value
                                                  );
                                                }}
                                                className="text-yellow-600 focus:ring-yellow-500"
                                              />
                                              <span className="ml-2">
                                                Autre
                                              </span>
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

                                  {/* Fichier Autorisation (conditional) */}
                                  {watch(
                                    `inputList_remb.${index}.pour_le_compte`
                                  ) == 'autre' && (
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
                                      />
                                      {errors.inputList_remb?.[index]
                                        ?.fichier_autorisation && (
                                        <p
                                          style={{ color: 'red' }}
                                          className="mt-1 text-xs"
                                        >
                                          {' '}
                                          {/* Added margin and text styling */}
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
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
