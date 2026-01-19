import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import { Box, DollarSign, HandCoins, Home, User, Wallet } from 'lucide-react';

export function RemboursementSection_Change_bien({
  inputListRemb,
  dossiers,
  loading_dos,
  dossierInfos,
  loadingInfos,
  get_info_dossier_id,
  NomBienComplet,
  handleModeChange,
  handleInputChange,
  handleFileChange_dd,
  sum_avances_moins_prix_new_bien, // Add this prop if you need it
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full">
      {inputListRemb?.map((item, index) => {
        const itemKey = item.aq_id ? `${item.aq_id}-${index}` : `item-${index}`;

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
          <div key={itemKey} className="mb-6">
            {' '}
            {/* KEY ON TOP-LEVEL DIV */}
            <div className="border-t border-gray-300 my-6"></div>
            <p className="text-indigo-600 font-bold mb-4">
              Montant à rembourser au client: {item.nom} {item.prenom}
              {currentMode != 'transfert' && (
                <span className="text-red-600 ml-2">
                  {watch(`inputList_remb.${index}.reste_a_rembourse`) || '0.00'}{' '}
                  DH
                </span>
              )}
            </p>
            {/* Rest of your component remains the same */}
            <div className="mb-4">
              <label className="block font-medium text-gray-700">
                Mode Remboursement :<span className="text-red-600">*</span>
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
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2">Direct</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={normalizedValue == 'transfert'}
                            onChange={() => {
                              handleModeChange(index, 'transfert');
                            }}
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
                      {error && <p style={{ color: 'red' }}>{error.message}</p>}
                    </>
                  );
                }}
              />
            </div>
            {showTransferSection && (
              <div className="">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">                  <div>
                    <SelectInput
                      label="Dossiers:"
                      name={`inputList_remb.${index}.dossier_id`}
                      value={watch(`inputList_remb.${index}.dossier_id`)}
                      required={true}
                      options={dossiers.map((dossier) => ({
                        value: dossier.id,
                        label:
                          dossier.code_reservation || `Dossier ${dossier.id}`,
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
                      error={
                        errors.inputList_remb?.[index]?.dossier_id?.message
                      }
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
                                    <Home className="w-5 h-5 mr-2 text-red-600" />
                                    Bien:
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {NomBienComplet(dossierInfos[index]?.bien)}
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
                                    ].sum_avances?.toLocaleString() + ' DH'}
                                  </div>
                                </td>
                              </tr>

                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center text-sm text-gray-900">
                                    <Wallet className="w-5 h-5 mr-2 text-red-600" />
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
                           <div className="col-span-1 lg:col-span-2">
      <div className="flex items-center space-x-4">
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
                                    const sum_total =
                                      (item.pourcentage / 100) *
                                      sum_avances_moins_prix_new_bien;
                                    let errorMessage = '';

                                    if (value <= 0) {
                                      errorMessage =
                                        'Le montant transféré ne doit pas être négatif ou égal à 0';
                                    } else {
                                      if (
                                        value > sum_total &&
                                        value > dossierInfos[index].reste
                                      ) {
                                        errorMessage = `Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                                          index
                                        ].reste
                                          .toFixed(2)
                                          .toLocaleString()} DH) ni le reste à rembourser (${sum_total
                                          .toFixed(2)
                                          .toLocaleString()} DH)`;
                                      } else if (
                                        value > sum_total
                                      ) {
                                        errorMessage = `Le montant transféré ne doit pas dépasser le reste à rembourser (${sum_total
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
                                        sum_total - value
                                      ).toFixed(2)
                                    );
                                  }}
                                />
                              
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
                                <p className="text-red-600 text-sm mt-1">
                                  {watch(`inputList_remb.${index}.error`)}
                                </p>
                              )}
                            </div>
                            {watch(`inputList_remb.${index}.reste_a_rembourse`)>0 && (
                              <>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-green-600 font-bold">
                      Remboursement de: {watch(`inputList_remb.${index}.reste_a_rembourse`)} DH
                    </p>                              <Controller
                                name={`inputList_remb.${index}.type_remb_transfere`}
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
                                        }}
                                      />
                                      <span className="ml-2">Après Vente</span>
                                    </label>
                                  </div>
                                )}
                              />
                            </div>
                            </>)}
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
                      handleInputChange(index, 'date_rembourse', e.target.value)
                    }
                    width="w-full"
                    height="h-[38px]"
                  />
                  {errors.inputList_remb?.[index]?.date_rembourse && (
                    <p style={{ color: 'red' }} className="mt-1 text-xs">
                      {errors.inputList_remb[index].date_rembourse.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remboursé par: <span className="text-red-600">*</span>
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
                        <p style={{ color: 'red' }} className="mt-1 text-xs">
                          {errors.inputList_remb[index].num_paiement.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full">
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
                          handleFileChange_dd(index, 'cheque_recu', e)
                        }
                        width="w-full"
                        height="h-[38px]"
                        accept="image/*, application/pdf"
                        existingFileName={
                          watch(`inputList_remb.${index}.cheque_recu`)
                            ? typeof watch(
                                `inputList_remb.${index}.cheque_recu`
                              ) === 'string'
                              ? watch(`inputList_remb.${index}.cheque_recu`)
                              : watch(`inputList_remb.${index}.cheque_recu`)
                                  ?.name
                            : null
                        }
                      />
                      {errors.inputList_remb?.[index]?.cheque_recu && (
                        <p style={{ color: 'red' }} className="mt-1 text-xs">
                          {errors.inputList_remb[index].cheque_recu.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pour le Compte: <span className="text-red-600">*</span>
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
                                  className="text-red-600 focus:ring-red-600"
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
                            handleFileChange_dd(
                              index,
                              'fichier_autorisation',
                              e
                            )
                          }
                          width="w-full"
                          height="h-[38px]"
                          accept="image/*, application/pdf"
                          existingFileName={
                            watch(
                              `inputList_remb.${index}.fichier_autorisation`
                            )
                              ? typeof watch(
                                  `inputList_remb.${index}.fichier_autorisation`
                                ) === 'string'
                                ? watch(
                                    `inputList_remb.${index}.fichier_autorisation`
                                  )
                                : watch(
                                    `inputList_remb.${index}.fichier_autorisation`
                                  )?.name
                              : null
                          }
                        />
                        {errors.inputList_remb?.[index]
                          ?.fichier_autorisation && (
                          <p style={{ color: 'red' }} className="mt-1 text-xs">
                            {
                              errors.inputList_remb[index].fichier_autorisation
                                .message
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
  );
}
