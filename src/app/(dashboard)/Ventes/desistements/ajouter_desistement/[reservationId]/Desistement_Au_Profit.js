'use client';
import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { lien_parentes, type_dst_dp } from '@/configs/enum';
import TextField from '@/components/Textfield'; // Import the component
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import AutocompleteMultipleDes from './AutocompleteMultipleDes';
import Inputs_des_Profit from './Inputs_des_Profit';
export function Desistement_Au_Profit({
  isEditing,
  formData,
  desisteurs_testt,
  desisteurs,
  desisteutrs_profit_dp_partiell,
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors }, // Destructure errors from formState
  } = useFormContext();
  // ** difference of twho aray
  function getDifference(array1, array2) {
    return array1.filter((object1) => {
      return !array2.some((object2) => {
        return object1.id == object2.id;
      });
    });
  }
  //dp profi co reservataire
  const [profit_dp_co_reser, set_profit_dp_co_reser] = useState([]);
  const [clients_profit_de, set_clients_profit_de] = useState();
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  const [desisteur_dp_proche, set_desisteur_dp_proche] = useState([]);

  //dp proche

  const [nb_aqu, set_nb_aqu] = useState(0);
  const [inputList, setinputList] = useState([]);

  const [errors_dp_proche, setErrors_dp_proche] = useState({
    telephone: false,
    percentage: false,
    totalPercentage: false,
  });
  const type_dp = watch('type_dp');
  const [errors_dp_co, setErrors_dp_co] = useState({
    new_pourcentage: {},
    totalPercentage: '',
  });
  const [errors_dp_part, setErrors_dp_part] = useState({
    pourcentage_: {},
    totalPercentage: '',
  });

  //dp_co
  const [nb_aqu_part, set_nb_aqu_part] = useState(0);
  const [new_clients_dp_partiel, set_new_clients_dp_partiel] = useState([]);
  const desisteutrs_profit_dp_partiel =
    watch('desisteutrs_profit_dp_partiel') || [];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  useEffect(() => {
    if (
      desisteutrs_profit_dp_partiell &&
      desisteutrs_profit_dp_partiell.length > 0 &&
      !isDataLoaded
    ) {
      setValue('desisteutrs_profit_dp_partiel', desisteutrs_profit_dp_partiell);
      setIsDataLoaded(true);
    }
  }, [desisteutrs_profit_dp_partiell, isDataLoaded, setValue]);

  // Reset when type_dp changes
  useEffect(() => {
    if (
      type_dp == 3 &&
      desisteutrs_profit_dp_partiell &&
      desisteutrs_profit_dp_partiell.length > 0
    ) {
      setValue('desisteutrs_profit_dp_partiel', desisteutrs_profit_dp_partiell);
    }
  }, [type_dp, desisteutrs_profit_dp_partiell, setValue]);
  const [errors_new_dp_part, setErrors_new_dp_part] = useState({
    telephone: false,
    percentage: false,
    totalPercentage: false,
  });
  const handleinputchange = (e, index) => {
    const { name, value } = e.target;

    // Reconstruct the original field name by joining parts after splitting
    const parts = name.split('_');
    const fieldName = parts.slice(0, -1).join('_'); // Join all parts except the last one (index)

    // Update only the specific field in the specific row
    const updatedList = inputList.map((item, i) =>
      i == index ? { ...item, [fieldName]: value } : item
    );

    // Calculate errors
    const newErrors = {
      telephone: false,
      percentage: false,
      totalPercentage: false,
    };

    // Validate telephone
    if (fieldName == 'telephone_num1') {
      newErrors.telephone = value.length < 10 || value.length > 14;
    }

    // Validate percentage
    if (fieldName == 'pourcentage') {
      const percentValue = parseInt(value) || 0;
      newErrors.percentage = percentValue < 0 || percentValue > 100;
      // Calculate total percentage
      const totalPercentage = updatedList.reduce((sum, item) => {
        return sum + (parseInt(item.pourcentage) || 0);
      }, 0);

      const targetPercentage = parseInt(watch('somme_percent')) || 0;
      newErrors.totalPercentage = totalPercentage != targetPercentage;
    }

    // Update state
    setinputList(updatedList);
    setValue('inputList', updatedList);
    setErrors_dp_proche(newErrors);
  };

  const handleinputchange_dp_co = (e, index) => {
    const { name, value } = e.target;

    // Extract the base field name (removing the index suffix)
    const parts = name.split('_');
    const fieldName = parts.slice(0, -1).join('_');

    // Update the specific field in the specific row
    const updatedList = profit_dp_co_reser.map((item, i) =>
      i == index ? { ...item, [fieldName]: value } : item
    );

    // Calculate errors
    const newErrors = {
      new_pourcentage: {},
      totalPercentage: '',
    };

    // Validate percentage
    if (fieldName == 'new_pourcentage') {
      const percentValue = parseInt(value) || 0;
      if (percentValue < 0 || percentValue > 100) {
        newErrors.new_pourcentage[index] =
          'Le pourcentage doit être entre 0 et 100';
      }
    }

    // Calculate total percentage
    const totalPercentage = updatedList.reduce((sum, item) => {
      return sum + (parseInt(item.new_pourcentage) || 0);
    }, 0);

    const targetPercentage = parseInt(watch('somme_percent')) || 0;
    if (totalPercentage != targetPercentage) {
      newErrors.totalPercentage = `La somme des pourcentages (${totalPercentage}%) doit être égale à ${targetPercentage}%`;
    }

    // Update state
    set_profit_dp_co_reser(updatedList);
    setValue('profit_dp_co_reser', updatedList); // Update form value if using react-hook-form
    setErrors_dp_co(newErrors);
  };
  const handleinputchange_dp_part = (e, index) => {
    const { name, value } = e.target;

    // Extract the base field name
    const parts = name.split('_');
    const fieldName = parts.slice(0, -1).join('_');

    // Update the specific field
    const updatedList = [...desisteutrs_profit_dp_partiel].map((item, i) =>
      i === index ? { ...item, [fieldName]: value } : item
    );

    // Calculate total percentage for old clients
    let totalOldPercentage = 0;
    updatedList.forEach((item) => {
      totalOldPercentage += parseFloat(item.pourcentage_) || 0;
    });

    // Calculate errors
    const newErrors = {
      pourcentage_: {},
      totalPercentage: '',
    };

    // Validate individual percentage
    if (fieldName === 'pourcentage_') {
      const percentValue = parseFloat(value) || 0;
      if (percentValue < 0 || percentValue > 100) {
        newErrors.pourcentage_[index] =
          'Le pourcentage doit être entre 0 et 100';
      }
    }

    // Calculate combined percentage (old + new)
    const totalNewPercentage =
      parseFloat(watch('somme_percent_dp_patiel_new')) || 0;
    const combinedPercentage = totalOldPercentage + totalNewPercentage;

    // Validate total percentage
    if (Math.abs(combinedPercentage - 100) > 0.01) {
      newErrors.totalPercentage = `La somme des pourcentages (${combinedPercentage.toFixed(
        2
      )}%) doit être égale à 100%`;
    }

    if (combinedPercentage === 100) {
      setErrors_new_dp_part((prevState) => ({
        ...prevState,
        totalPercentage: '',
      }));
    }
    // Update states
    setValue('desisteutrs_profit_dp_partiel', updatedList);
    setValue('somme_percent_dp_patiel_old', totalOldPercentage);
    setErrors_dp_part(newErrors);
  };

  const handleinputchange_dp_partiel_new = (e, index) => {
    const { name, value } = e.target;

    // Reconstruct the original field name
    const parts = name.split('_');
    const fieldName = parts.slice(0, -1).join('_');

    // Update the specific field
    const updatedList = new_clients_dp_partiel.map((item, i) =>
      i === index ? { ...item, [fieldName]: value } : item
    );

    // Calculate errors
    const newErrors = {
      telephone: false,
      percentage: false,
      totalPercentage: false,
    };

    // Validate telephone
    if (fieldName === 'telephone_num1') {
      const isValid = value.length >= 10 && value.length <= 14;
      newErrors.telephone = !isValid;
    }

    // Validate percentage
    if (fieldName === 'pourcentage') {
      const percentValue = parseFloat(value) || 0;
      newErrors.percentage = percentValue < 0 || percentValue > 100;

      // Calculate total percentage for new clients
      let totalNewPercentage = 0;
      updatedList.forEach((item) => {
        totalNewPercentage += parseFloat(item.pourcentage) || 0;
      });

      // Calculate combined percentage (old + new)
      const totalOldPercentage =
        parseFloat(watch('somme_percent_dp_patiel_old')) || 0;
      const combinedPercentage = totalNewPercentage + totalOldPercentage;

      // Update values
      setValue('somme_percent_dp_patiel_new', totalNewPercentage);
      setValue('targetPercentage_part_new', 100 - totalOldPercentage);

      // Validate total percentage
      if (Math.abs(combinedPercentage - 100) > 0.01) {
        newErrors.totalPercentage = true;
      } else {
        newErrors.totalPercentage = false;
      }
      if (combinedPercentage == 100) {
        setErrors_dp_part((prevState) => ({
          ...prevState,
          totalPercentage: '',
        }));
      }
    }
    // Update state
    set_new_clients_dp_partiel(updatedList);
    setValue('new_clients_dp_partiel', updatedList);
    setErrors_new_dp_part(newErrors);
  };
  useEffect(() => {
    console.log('type_dp changed, resetting all fields');

    // Clear ALL dynamic fields regardless of current state
    /*const clearAllDynamicFields = () => {
      // Clear inputList fields (type_dp 1)
      for (let i = 0; i < 20; i++) {
        setValue(`cin_${i}`, '');
        setValue(`nom_${i}`, '');
        setValue(`prenom_${i}`, '');
        setValue(`telephone_num1_${i}`, '');
        setValue(`pourcentage_${i}`, '');

        // Clear new_clients_dp_partiel fields (type_dp 3)
        setValue(`cin_p${i}`, '');
        setValue(`nom_p${i}`, '');
        setValue(`prenom_p${i}`, '');
        setValue(`telephone_num1_p${i}`, '');
        setValue(`pourcentage_p${i}`, '');

        // Clear profit_dp_co_reser fields (type_dp 2)
        setValue(`nom_${i}`, '');
        setValue(`prenom_${i}`, '');
        setValue(`new_pourcentage_${i}`, '');
      }
    };*/

    // First clear all fields
    // clearAllDynamicFields();

    // Then reset all states
    set_nb_aqu(0);
    setinputList([]);
    set_nb_aqu_part(0);
    set_new_clients_dp_partiel([]);
    set_desisteur_dp_proche([]); // Clear selected desisteurs
    set_profit_dp_co_reser([]);
    setValue('desisteur_dp_proche_co', []); // Clear form value for desisteurs

    // Reset all form array values
    setValue('inputList', []);
    setValue('new_clients_dp_partiel', []);
    setValue('nb_aquereurs', '');
    setValue('nb_aquereurs_dp', '');
    setValue('nb_aquereurs_dp_proche', '');
    setValue('profit_dp_co_reser', []);
    setValue('somme_percent', 0);
    setValue('somme_percent_dp_patiel_old', 0);
    setValue('somme_percent_dp_patiel_new', 0);
    setValue('targetPercentage_part_new', 0);

    // Reset errors
    setErrors_dp_proche({
      telephone: false,
      percentage: false,
      totalPercentage: false,
    });
    setErrors_new_dp_part({
      telephone: false,
      percentage: false,
      totalPercentage: false,
    });
    setErrors_dp_co({
      new_pourcentage: {},
      totalPercentage: '',
    });
    setErrors_dp_part({
      pourcentage_: {},
      totalPercentage: '',
    });
    // Force remount of autocomplete by changing its key
    setAutocompleteKey((prev) => prev + 1);
  }, [type_dp, setValue]); // Add setValue to dependencies
  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-yellow-50 !text-yellow-800 rounded-md">
          <p className="font-medium">Mode Édition</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AutocompleteSelectComponent
          label="Type Désistement Au Profit :"
          name="type_dp"
          value={isEditing && formData.typ_dp}
          control={control}
          options={type_dst_dp}
          errors={{}}
          required
          onChange={(value) => {
            // Reset states before changing type
            set_nb_aqu(0);
            setinputList([]);
            set_nb_aqu_part(0);
            set_new_clients_dp_partiel([]);
            setValue('type_dp', value);
            setValue('desisteur_dp_proche_co', []); // Clear the selected desisteurs
            set_desisteur_dp_proche([]); // Clear local state
          }}
        />
      </div>

      {(type_dp == 1 || type_dp == 2) && (
        <div className="border-t border-gray-200 py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            {/* Désisteurs */}
            <div className="md:col-span-5">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Désisteurs: <span className="text-red-500">*</span>
                </label>

                <Controller
                  name=""
                  control={control}
                  rules={{ required: 'Ce champ est requis' }}
                  render={({ field }) => (
                    <AutocompleteMultipleDes
                      key={`desisteur-${autocompleteKey}`} // This forces complete remount
                      label=""
                      name="desisteur_dp_proche_co"
                      required
                      value={field || []}
                      options={desisteurs}
                      choiceKey="id" // Used for unique identification
                      onChange={(newValue) => {
                        let totalPercent = 0;
                        const selectedDesisteurs = [];

                        set_desisteur_dp_proche([]);

                        newValue.forEach((item) => {
                          totalPercent += item.pourcentage;
                          selectedDesisteurs.push({
                            id: item.id,
                            cl_id: item.client.id,
                            nom: item.client.nom,
                            prenom: item.client.prenom,
                            pourcentage: item.pourcentage,
                          });
                        });

                        set_desisteur_dp_proche(selectedDesisteurs);

                        console.log('total percent=>' + totalPercent);
                        setValue('desisteur_dp_proche_co', selectedDesisteurs);
                        setValue('somme_percent', totalPercent);
                        set_clients_profit_de(
                          getDifference(desisteurs_testt, selectedDesisteurs)
                        );
                        field.onChange(newValue);
                      }}
                      placeholder="Choisissez un/plusieurs Désisteurs"
                      errors={{}}
                      backendErrors={{}}
                      valueKey="id" // Ensures proper value matching
                    />
                  )}
                />
              </div>
            </div>
            {/* Somme % Ajoutés */}

            <div className="md:col-span-3 md:ml-4 mt-2">
              <TextField
                label="Somme % Ajoutés:"
                disabled
                size="small"
                type="number"
                fullWidth
                name={'somme_percent'}
                control={control}
                errors={{}}
                backendErrors={{}}
              />
            </div>
            {desisteur_dp_proche.length > 0 && (
              <>
                {type_dp == 1 && (
                  <>
                    {/* Nb Des Nouveaux Acquéreurs */}
                    <div className="md:col-span-3 mt-2">
                      <TextField
                        label={'Nombre Des Nouveaux Acquéreurs:'}
                        name="nb_aquereurs_dp_proche"
                        size="small"
                        type="number"
                        fullWidth
                        required
                        errors={{}}
                        backendErrors={{}}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          set_nb_aqu(value);

                          // First clear all existing fields
                          for (let i = 0; i < inputList.length; i++) {
                            setValue(`cin_${i}`, '');
                            setValue(`nom_${i}`, '');
                            setValue(`prenom_${i}`, '');
                            setValue(`telephone_num1_${i}`, '');
                            setValue(`pourcentage_${i}`, '');
                          }

                          // Then create new empty fields
                          const newList = Array(value)
                            .fill()
                            .map(() => ({
                              cin: '',
                              nom: '',
                              prenom: '',
                              telephone_num1: '',
                              pourcentage: '',
                            }));

                          setinputList(newList);
                          setValue('inputList', newList);

                          setErrors_dp_proche({
                            telephone: false,
                            percentage: false,
                            totalPercentage: false,
                          });
                        }}
                      />
                    </div>

                    {nb_aqu > 0 && (
                      <div className="md:col-span-12 space-y-4 mt-4">
                        <h3 className="text-[rgb(55,65,81)] font-semibold">
                          Les Nouveaux Acquéreurs :
                        </h3>
                        {inputList.map((item, index) => (
                          <div
                            key={index}
                            className="repeater-wrapper border border-gray-200 rounded-lg p-4 mb-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* CIN */}
                              <div className="md:col-span-2">
                                <TextField
                                  label={'CIN:'}
                                  size="small"
                                  fullWidth
                                  required
                                  control={control}
                                  name={`cin_${index}`}
                                  // value={watch(`cin_${index}`) || ''}
                                  errors={{}}
                                  backendErrors={{}}
                                  value={inputList[index].cin}
                                  onChange={(e) => handleinputchange(e, index)}
                                />
                              </div>

                              {/* Nom */}
                              <div className="md:col-span-3">
                                <TextField
                                  label={'Nom'}
                                  size="small"
                                  fullWidth
                                  required
                                  control={control}
                                  name={`nom_${index}`}
                                  errors={{}}
                                  backendErrors={{}}
                                  value={inputList[index].nom}
                                  onChange={(e) => handleinputchange(e, index)}
                                />
                              </div>

                              {/* Prénom */}
                              <div className="md:col-span-3">
                                <TextField
                                  label={'Prénom'}
                                  size="small"
                                  fullWidth
                                  required
                                  control={control}
                                  name={`prenom_${index}`}
                                  errors={{}}
                                  backendErrors={{}}
                                  value={inputList[index].prenom}
                                  onChange={(e) => handleinputchange(e, index)}
                                />
                              </div>

                              {/* Téléphone */}
                              <div className="md:col-span-2">
                                <TextField
                                  label={'Téléphone:'}
                                  size="small"
                                  fullWidth
                                  required
                                  control={control}
                                  placeholder="06XXXXXXXX"
                                  name={`telephone_num1_${index}`}
                                  errors={{}}
                                  backendErrors={{}}
                                  value={inputList[index].telephone_num1}
                                  onChange={(e) => handleinputchange(e, index)}
                                />
                              </div>

                              {/* Pourcentage */}
                              <div className="md:col-span-2">
                                <TextField
                                  label={'Pourcentage:'}
                                  size="small"
                                  fullWidth
                                  required
                                  control={control}
                                  name={`pourcentage_${index}`}
                                  errors={{}}
                                  backendErrors={{}}
                                  value={inputList[index].pourcentage}
                                  onChange={(e) => handleinputchange(e, index)}
                                  type="number"
                                />
                                {errors_dp_proche.percentage && (
                                  <p className="text-red-500">
                                    Percentage must be between 0-100
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {type_dp == 2 && (
                  <>
                    <div className="md:col-span-5">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Au Profit de : <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name=""
                          control={control}
                          rules={{ required: 'Ce champ est requis' }}
                          render={({ field }) => (
                            <AutocompleteMultipleDes
                              key={`pro-${autocompleteKey}`} // This forces complete remount
                              label=""
                              name="client_pro"
                              required
                              options={clients_profit_de}
                              choiceKey="id" // Used for unique identification
                              value={field || []}
                              onChange={(newValue) => {
                                const selectedProfit = newValue.map((item) => ({
                                  id: item.id,
                                  cl_id: item.cl_id,
                                  nom: item.nom,
                                  prenom: item.prenom,
                                  new_pourcentage: 0,
                                }));
                                set_profit_dp_co_reser(selectedProfit);
                                setValue('profit_dp_co_reser', selectedProfit);
                                field.onChange(newValue);
                              }}
                              placeholder="Choisissez un/plusieurs Désisteurs"
                              errors={{}}
                              backendErrors={{}}
                              valueKey="id" // Ensures proper value matching
                            />
                          )}
                        />
                      </div>
                    </div>
                    {profit_dp_co_reser.length > 0 && (
                      <div className="md:col-span-12 text-center my-4">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Répartition des %
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {profit_dp_co_reser?.map((item, index) => (
                      <div
                        key={index}
                        className="md:col-span-12 border border-gray-200 rounded-lg p-4 my-2"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Nom */}
                          <div className="md:col-span-4">
                            <Inputs_des_Profit
                              label={'Nom :'}
                              name={`nom_${index}`}
                              value={item?.nom || ''}
                              onChange={(e) =>
                                handleinputchange_dp_co(e, index)
                              }
                              disabled
                              errors={errors_dp_co?.nom?.[index]}
                              helperText=""
                              size="small"
                              fullWidth
                            />
                          </div>

                          {/* Prénom */}
                          <div className="md:col-span-4">
                            <Inputs_des_Profit
                              label={'Prénom :'}
                              name={`prenom_${index}`}
                              value={item?.prenom || ''}
                              onChange={(e) =>
                                handleinputchange_dp_co(e, index)
                              }
                              disabled
                              errors={errors_dp_co?.prenom?.[index]}
                              helperText=""
                              size="small"
                              fullWidth
                            />
                          </div>

                          {/* Pourcentage */}
                          <div className="md:col-span-3">
                            <Inputs_des_Profit
                              label={'Pourcentage:'}
                              name={`new_pourcentage_${index}`}
                              value={item?.new_pourcentage || 0}
                              onChange={(e) =>
                                handleinputchange_dp_co(e, index)
                              }
                              type="number"
                              required
                              errors={errors_dp_co?.new_pourcentage?.[index]}
                              helperText={
                                errors_dp_co?.new_pourcentage?.[index] ? '' : ''
                              }
                              size="small"
                              fullWidth
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {errors_dp_co?.totalPercentage && (
                      <div className="md:col-span-12 mt-2">
                        <p className="text-red-500">
                          {errors_dp_co.totalPercentage}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {errors_dp_proche.telephone && (
        <p style={{ color: 'red' }}>
          Le numéro de téléphone doit contenir entre 10 et 14 caractères
        </p>
      )}
      {errors_dp_proche.percentage && (
        <p className="text-red-500">
          Le pourcentage doit être compris entre 0 et 100
        </p>
      )}
      {errors_dp_proche.totalPercentage && (
        <p className="text-red-500">
          Le pourcentage total doit être égal à {watch('somme_percent')}
        </p>
      )}
      {type_dp == 3 && (
        <>
          {desisteutrs_profit_dp_partiel.length > 0 && (
            <>
              {desisteutrs_profit_dp_partiel?.map((item, index) => (
                <div
                  key={index}
                  className="md:col-span-12 border border-gray-200 rounded-lg p-4 my-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Cin */}
                    <div className="md:col-span-3">
                      <Inputs_des_Profit
                        label={'Cin  Ancien Client:'}
                        name={`cin_${index}`}
                        value={item?.cin || ''}
                        onChange={(e) => handleinputchange_dp_part(e, index)}
                        disabled
                        errors={errors_dp_part?.cin?.[index]}
                        helperText=""
                        size="small"
                        fullWidth
                      />
                    </div>
                    {/* Nom */}
                    <div className="md:col-span-3">
                      <Inputs_des_Profit
                        label={'Nom Ancien Client:'}
                        name={`nom_${index}`}
                        value={item?.nom || ''}
                        onChange={(e) => handleinputchange_dp_part(e, index)}
                        disabled
                        errors={errors_dp_part?.nom?.[index]}
                        helperText=""
                        size="small"
                        fullWidth
                      />
                    </div>

                    {/* Prénom */}
                    <div className="md:col-span-3">
                      <Inputs_des_Profit
                        label={'Prénom Ancien Client :'}
                        name={`prenom_${index}`}
                        value={item?.prenom || ''}
                        onChange={(e) => handleinputchange_dp_part(e, index)}
                        disabled
                        errors={errors_dp_part?.prenom?.[index]}
                        helperText=""
                        size="small"
                        fullWidth
                      />
                    </div>
                    {/* Pourcentage */}
                    <div className="md:col-span-3">
                      <Inputs_des_Profit
                        label={'Pourcentage Ancien Client:'}
                        name={`pourcentage__${index}`}
                        value={item?.pourcentage_ || 0}
                        onChange={(e) => handleinputchange_dp_part(e, index)}
                        type="number"
                        required
                        errors={errors_dp_part?.pourcentage_?.[index]}
                        helperText={
                          errors_dp_part?.pourcentage_?.[index] ? '' : ''
                        }
                        size="small"
                        fullWidth
                      />
                      {errors_dp_part?.pourcentage_[index] && (
                        <p className="text-red-500">
                          {errors_dp_part.pourcentage_[index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {errors_dp_part?.totalPercentage && (
                <p className="text-red-500">{errors_dp_part.totalPercentage}</p>
              )}
            </>
          )}

          <>
            {/* Nb Des Nouveaux Acquéreurs */}
            <div className="md:col-span-1 mt-2">
              <TextField
                label={'Nombre Des Nouveaux Acquéreurs:'}
                name="nb_aquereurs_dp"
                size="small"
                type="number"
                fullWidth
                required
                errors={{}}
                backendErrors={{}}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  set_nb_aqu_part(value);

                  // Clear the existing new_clients_dp_partiel
                  const newList = [];
                  for (let i = 0; i < value; i++) {
                    newList.push({
                      cin: '',
                      nom: '',
                      prenom: '',
                      telephone_num1: '',
                      pourcentage: 0,
                    });
                  }

                  // Reset both state and form values
                  set_new_clients_dp_partiel(newList);
                  setValue('new_clients_dp_partiel', newList);

                  // Also reset individual fields in the form
                  for (let i = 0; i < new_clients_dp_partiel.length; i++) {
                    setValue(`cin_p${i}`, '');
                    setValue(`nom_p${i}`, '');
                    setValue(`prenom_p${i}`, '');
                    setValue(`telephone_num1_p${i}`, '');
                    setValue(`pourcentage_p${i}`, 0);
                  }

                  setErrors_new_dp_part({
                    telephone: false,
                    percentage: false,
                    totalPercentage: false,
                  });
                }}
              />
            </div>

            {nb_aqu_part > 0 && (
              <div className="md:col-span-12 space-y-4 mt-4">
                <h3 className="text-[rgb(55,65,81)] font-semibold">
                  Les Nouveaux Acquéreurs :
                </h3>
                {new_clients_dp_partiel.map((item, index) => (
                  <div
                    key={index}
                    className="repeater-wrapper border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* CIN */}
                      <div className="md:col-span-2">
                        <TextField
                          label={'CIN:'}
                          size="small"
                          fullWidth
                          required
                          control={control}
                          name={`cin_p${index}`}
                          errors={{}}
                          backendErrors={{}}
                          value={new_clients_dp_partiel[index].cin}
                          onChange={(e) =>
                            handleinputchange_dp_partiel_new(e, index)
                          }
                        />
                      </div>

                      {/* Nom */}
                      <div className="md:col-span-3">
                        <TextField
                          label={'Nom'}
                          size="small"
                          fullWidth
                          control={control}
                          required
                          name={`nom_p${index}`}
                          errors={{}}
                          backendErrors={{}}
                          value={new_clients_dp_partiel[index].nom}
                          onChange={(e) =>
                            handleinputchange_dp_partiel_new(e, index)
                          }
                        />
                      </div>

                      {/* Prénom */}
                      <div className="md:col-span-3">
                        <TextField
                          label={'Prénom'}
                          size="small"
                          fullWidth
                          required
                          control={control}
                          name={`prenom_p${index}`}
                          errors={{}}
                          backendErrors={{}}
                          value={new_clients_dp_partiel[index].prenom}
                          onChange={(e) =>
                            handleinputchange_dp_partiel_new(e, index)
                          }
                        />
                      </div>

                      {/* Téléphone */}
                      <div className="md:col-span-2">
                        <TextField
                          label={'Téléphone:'}
                          size="small"
                          fullWidth
                          required
                          control={control}
                          placeholder="06XXXXXXXX"
                          name={`telephone_num1_p${index}`}
                          errors={{}}
                          backendErrors={{}}
                          value={new_clients_dp_partiel[index].telephone_num1}
                          onChange={(e) =>
                            handleinputchange_dp_partiel_new(e, index)
                          }
                        />
                      </div>

                      {/* Pourcentage */}
                      <div className="md:col-span-2">
                        <TextField
                          label={'Pourcentage:'}
                          size="small"
                          fullWidth
                          required
                          control={control}
                          name={`pourcentage_p${index}`}
                          errors={{}}
                          backendErrors={{}}
                          value={new_clients_dp_partiel[index].pourcentage}
                          onChange={(e) =>
                            handleinputchange_dp_partiel_new(e, index)
                          }
                          type="number"
                        />
                        {errors_new_dp_part.percentage && (
                          <p className="text-red-500">
                            Percentage must be between 0-100
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {errors_new_dp_part.telephone && (
                  <p style={{ color: 'red' }}>
                    Le numéro de téléphone doit contenir entre 10 et 14
                    caractères
                  </p>
                )}
                {errors_new_dp_part.percentage && (
                  <p className="text-red-500">
                    Le pourcentage doit être compris entre 0 et 100
                  </p>
                )}
                {errors_new_dp_part.totalPercentage && (
                  <p className="text-red-500">
                    Le pourcentage total doit être égal à{' '}
                    {100 - (watch('somme_percent_dp_patiel_old') || 0)}%
                  </p>
                )}
              </div>
            )}
          </>
        </>
      )}

      {(type_dp == 1 || type_dp == 3) && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <AutocompleteSelectComponent
            label="Lien de Parenté :"
            name="lien_parente"
            value={isEditing && formData.lien_parente}
            control={control}
            options={lien_parentes}
            errors={{}}
            required
            onChange={(value) => setValue('lien_parente', value)}
          />
        </div>
      )}
    </div>
  );
}
