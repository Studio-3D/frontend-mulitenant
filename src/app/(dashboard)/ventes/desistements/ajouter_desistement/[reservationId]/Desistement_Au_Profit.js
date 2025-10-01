'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { lien_parentes, type_dst_dp } from '@/configs/enum';
import TextField from '@/components/Textfield'; // Import the component
import { Info } from 'lucide-react';
import AutocompleteMultipleDes from './AutocompleteMultipleDes';
import SelectInput from '@/components/SelectInput';
import Inputs_des_Profit from './Inputs_des_Profit';
export function Desistement_Au_Profit({
  isEditing,
  formData,
  desisteurs_testt,
  desisteurs,
  desisteutrs_profit_dp_partiell,
  desisteur_dp_proche_co, //editing
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
  const [desisteur_dp_proche, set_desisteur_dp_proche] = useState(() => {
    // Initialize with data if in editing mode
    return isEditing && formData ? desisteur_dp_proche_co : [];
  });

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
  const [desisteutrs_profit_dp_partiel, set_desisteurs_partiel] = useState(
    !isEditing ? watch('desisteutrs_profit_dp_partiel') : []
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Add this useEffect to pre-fill form data when in editing mode
  useEffect(() => {
    if (isEditing && formData && !isDataLoaded) {
      setValue('commentaire_rejete', formData.commentaire_rejete);

      // Make sure formData has the expected structure
      if (!formData.type_dp) {
        console.error('Missing type_dp in formData');
        return;
      }

      // Pre-fill form based on desistement type
      setValue('type_dp', formData.type_dp);
      switch (formData.type_dp) {
        case '1': // Désistement au profit d'un proche
          setValue('desisteur_dp_proche_co', desisteur_dp_proche_co);
          setValue(
            'nb_aquereurs_dp_proche',
            formData.nouvel_aquereurs_desistements?.length || 0
          );

          // Transform the nouvel_aquereurs_desistements data to match your inputList structure
          const transformedList =
            formData.nouvel_aquereurs_desistements?.map((item) => ({
              cin: item.cin,
              nom: item.nom,
              prenom: item.prenom,
              telephone_num1: item.telephone,
              pourcentage: item.pourcentage || 0, // Add default if missing
              // Keep the id if needed for updates
            })) || [];

          // Calculate sum of percentages from transformedList
          const sommePercent = transformedList.reduce((sum, item) => {
            return sum + Number(item.pourcentage) || 0;
          }, 0);
          // Set both state and form value

          setinputList(transformedList);
          setValue('inputList', transformedList);
          // Set the count of new aquereurs
          set_nb_aqu(transformedList.length);

          // Set the total percentage (calculated from transformedList)
          setValue('somme_percent', sommePercent);
          break;

        case '2': // Désistement au profit d'un co-réservataire
          setValue('desisteur_dp_proche_co', desisteur_dp_proche_co);
          const sommePercent_des = desisteur_dp_proche_co.reduce(
            (sum, item) => {
              return sum + Number(item.pourcentage) || 0;
            },
            0
          );
          setValue('somme_percent', sommePercent_des);
          const profit_dp_co_res =
            formData.aquereurs_profits?.map((item) => ({
              prenom: item.aquereur?.client?.prenom,
              nom: item.aquereur?.client?.nom,
              cl_id: item.aquereur?.client?.id,
              id: item.aquereur?.id,
              new_pourcentage: item.pourcentage,
            })) || [];
          setValue('profit_dp_co_reser', profit_dp_co_res || []);
          set_profit_dp_co_reser(profit_dp_co_res || []);
          set_clients_profit_de(profit_dp_co_res || []);
          //nkmaaaal clietn profit de
          break;

        case '3': // Désistement partiel
          const dp_partiel =
            formData.aquereurs_partiel?.map((item) => ({
              id: item?.aquereur?.id,
              cin: item?.aquereur?.client?.cin,
              nom: item?.aquereur?.client?.nom,
              prenom: item?.aquereur?.client?.prenom,
              telephone_num1: item?.aquereur?.client?.telephone_num1,
              pourcentage_: item.pourcentage || 0,
            })) || [];

          set_desisteurs_partiel(dp_partiel);
          setValue('desisteutrs_profit_dp_partiel', dp_partiel);

          const new_client_dp_partiel =
            formData.nouvel_aquereurs_desistements?.map((item, index) => {
              // Set individual form fields for each new client
              setValue(`new_clients_dp_partiel[${index}].cin`, item.cin);
              setValue(`new_clients_dp_partiel[${index}].nom`, item.nom);
              setValue(`new_clients_dp_partiel[${index}].prenom`, item.prenom);
              setValue(
                `new_clients_dp_partiel[${index}].telephone_num1`,
                item.telephone
              );
              setValue(
                `new_clients_dp_partiel[${index}].pourcentage`,
                item.pourcentage || 0
              );

              return {
                cin: item.cin,
                nom: item.nom,
                prenom: item.prenom,
                telephone_num1: item.telephone,
                pourcentage: item.pourcentage || 0,
              };
            }) || [];

          console.log(
            'les nex client==>' + JSON.stringify(new_client_dp_partiel)
          );

          // Set the array value
          setValue('new_clients_dp_partiel', new_client_dp_partiel);
          set_new_clients_dp_partiel(new_client_dp_partiel);
          setValue('nb_aquereurs_dp', new_client_dp_partiel.length);
          set_nb_aqu_part(new_client_dp_partiel.length);

          // Calculate percentages
          const sommePercent_old = dp_partiel.reduce(
            (sum, item) => sum + Number(item.pourcentage_) || 0,
            0
          );
          setValue('somme_percent_dp_patiel_old', sommePercent_old);

          const sommePercent_new = new_client_dp_partiel.reduce(
            (sum, item) => sum + Number(item.pourcentage) || 0,
            0
          );
          setValue('somme_percent_dp_patiel_new', sommePercent_new);
          break;
      }

      // Pre-fill common fields
      setValue('lien_parente', formData.lien_parente);
      setIsDataLoaded(true);
    }
  }, [isEditing, formData, isDataLoaded, setValue, desisteurs_testt]);

  useEffect(() => {
    if (!isEditing) {
      if (
        desisteutrs_profit_dp_partiell &&
        desisteutrs_profit_dp_partiell.length > 0 &&
        !isDataLoaded
      ) {
        set_desisteurs_partiel(desisteutrs_profit_dp_partiell);
        setValue(
          'desisteutrs_profit_dp_partiel',
          desisteutrs_profit_dp_partiell
        );
        setIsDataLoaded(true);
      }
    }
  }, [desisteutrs_profit_dp_partiell, isDataLoaded, setValue]);

  const [errors_new_dp_part, setErrors_new_dp_part] = useState({
    telephone: false,
    percentage: false,
    totalPercentage: false,
  });
  const handleinputchange = (e, index) => {
    const { name, value } = e.target;

    const newErrors = {
      telephone: false,
      percentage: false,
      totalPercentage: false,
    };

    if (isEditing) {
      // For edit mode - better field name extraction
      const fieldMatch = name.match(/inputList\[(\d+)\]\.(\w+)/);
      if (fieldMatch) {
        const fieldIndex = fieldMatch[1];
        const fieldName = fieldMatch[2];

        // Update form and local state
        setValue(`inputList[${fieldIndex}].${fieldName}`, value);

        const updatedList = [...inputList];
        updatedList[fieldIndex][fieldName] = value;
        setinputList(updatedList);

        // Edit mode specific validation
        if (fieldName == 'telephone_num1') {
          newErrors.telephone = value.length < 10 || value.length > 14;
        }

        if (fieldName == 'pourcentage') {
          const percentValue = parseInt(value) || 0;
          newErrors.percentage = percentValue < 0 || percentValue > 100;

          const totalPercentage = updatedList.reduce((sum, item) => {
            return sum + parseInt(item.pourcentage) || 0;
          }, 0);

          const targetPercentage = parseInt(watch('somme_percent')) || 0;
          newErrors.totalPercentage = totalPercentage !== targetPercentage;
        }
      }
    } else {
      // For non-edit mode - original behavior
      const parts = name.split('_');
      const fieldName = parts.slice(0, -1).join('_');

      const updatedList = inputList.map((item, i) =>
        i == index ? { ...item, [fieldName]: value } : item
      );

      setinputList(updatedList);
      setValue('inputList', updatedList);

      if (fieldName == 'telephone_num1') {
        newErrors.telephone = value.length < 10 || value.length > 14;
      }

      if (fieldName == 'pourcentage') {
        const percentValue = parseInt(value) || 0;
        newErrors.percentage = percentValue < 0 || percentValue > 100;
        const totalPercentage = updatedList.reduce((sum, item) => {
          return sum + parseInt(item.pourcentage) || 0;
        }, 0);
        const targetPercentage = parseInt(watch('somme_percent')) || 0;
        newErrors.totalPercentage = totalPercentage !== targetPercentage;
      }
    }

    setErrors_dp_proche(newErrors);
  };

  const handleinputchange_dp_co = (e, index) => {
    const { name, value } = e.target;

    // Editing mode handling
    if (isEditing && name.startsWith('profit_dp_co_reser')) {
      // Handle array-style field names (profit_dp_co_reser[index].new_pourcentage)
      const fieldMatch = name.match(/profit_dp_co_reser\[(\d+)\]\.(.+)/);
      if (fieldMatch) {
        const [, idx, fieldName] = fieldMatch;
        const numericIndex = parseInt(idx);

        const updatedList = profit_dp_co_reser.map((item, i) => {
          if (i == numericIndex) {
            return {
              ...item,
              [fieldName]: value,
              // Ensure pourcentage remains unchanged while editing new_pourcentage
              pourcentage: item.new_pourcentage,
            };
          }
          return item;
        });
        // Validate and update state
        validateAndUpdate(updatedList);
      }
    } else {
      // Handle simple field names (for non-editing mode if needed)
      const parts = name.split('_');
      const fieldName = parts.slice(0, -1).join('_');

      const updatedList = profit_dp_co_reser.map((item, i) =>
        i == index ? { ...item, [fieldName]: value } : item
      );

      // Validate and update state
      validateAndUpdate(updatedList);
    }
  };

  // Separate validation logic
  const validateAndUpdate = (updatedList) => {
    const newErrors = {
      new_pourcentage: {},
      totalPercentage: '',
    };

    // Validate each percentage
    updatedList.forEach((item, index) => {
      const percentValue = parseInt(item.new_pourcentage) || 0;
      if (percentValue < 0 || percentValue > 100) {
        newErrors.new_pourcentage[index] =
          'Le pourcentage doit être entre 0 et 100';
      }
    });

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
    setValue('profit_dp_co_reser', updatedList);
    setErrors_dp_co(newErrors);
  };
  const handleinputchange_dp_part = (e, index) => {
    const { name, value } = e.target;
    if (isEditing) {
      // Editing mode - handle array structure
      const fieldMatch = name.match(/dp_part\[(\d+)\]\.(\w+)/);
      if (fieldMatch) {
        const fieldIndex = fieldMatch[1];
        const fieldName = fieldMatch[2];

        // Convert value to number if it's the percentage field
        const processedValue =
          fieldName === 'pourcentage_' ? parseFloat(value) || 0 : value;
        // Update form and local state with the processed value
        setValue(`dp_part[${fieldIndex}].${fieldName}`, processedValue);
        const updatedList = [...desisteutrs_profit_dp_partiel];
        updatedList[fieldIndex][fieldName] = processedValue;
        set_desisteurs_partiel(updatedList);

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
        if (fieldName == 'pourcentage_') {
          const percentValue = parseFloat(value) || 0;
          if (percentValue < 0 || percentValue > 100) {
            newErrors.pourcentage_[fieldIndex] =
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

        if (combinedPercentage == 100) {
          setErrors_new_dp_part((prevState) => ({
            ...prevState,
            totalPercentage: '',
          }));
        }

        // Update states
        setValue('desisteutrs_profit_dp_partiel', updatedList);
        setValue('somme_percent_dp_patiel_old', totalOldPercentage);
        setErrors_dp_part(newErrors);
      }
    } else {
      // Non-editing mode - original behavior
      const parts = name.split('_');
      const fieldName = parts.slice(0, -1).join('_');

      const updatedList = [...desisteutrs_profit_dp_partiel].map((item, i) =>
        i == index ? { ...item, [fieldName]: value } : item
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
      if (fieldName == 'pourcentage_') {
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

      if (combinedPercentage == 100) {
        setErrors_new_dp_part((prevState) => ({
          ...prevState,
          totalPercentage: '',
        }));
      }
      // Update states
      set_desisteurs_partiel(updatedList);
      setValue('desisteutrs_profit_dp_partiel', updatedList);
      setValue('somme_percent_dp_patiel_old', totalOldPercentage);
      setErrors_dp_part(newErrors);
    }
  };

  const handleinputchange_dp_partiel_new = (e, index) => {
    const { name, value } = e.target;

    if (isEditing) {
      // Editing mode - handle array structure
      const fieldMatch = name.match(/new_clients_dp_partiel\[(\d+)\]\.(\w+)/);
      if (fieldMatch) {
        const fieldIndex = fieldMatch[1];
        const fieldName = fieldMatch[2];

        // Update form and local state
        setValue(`new_clients_dp_partiel[${fieldIndex}].${fieldName}`, value);

        const updatedList = [...new_clients_dp_partiel];
        updatedList[fieldIndex][fieldName] = value;
        set_new_clients_dp_partiel(updatedList);

        // Calculate errors
        const newErrors = {
          telephone: false,
          percentage: false,
          totalPercentage: false,
        };

        // Validate telephone
        if (fieldName == 'telephone_num1') {
          const isValid = value.length >= 10 && value.length <= 14;
          newErrors.telephone = !isValid;
        }

        // Validate percentage
        if (fieldName == 'pourcentage') {
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
        setErrors_new_dp_part(newErrors);
      }
    } else {
      // Non-editing mode - original behavior
      const parts = name.split('_');
      const fieldName = parts.slice(0, -1).join('_');

      const updatedList = new_clients_dp_partiel.map((item, i) =>
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
        const isValid = value.length >= 10 && value.length <= 14;
        newErrors.telephone = !isValid;
      }

      // Validate percentage
      if (fieldName == 'pourcentage') {
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
    }
  };
  useEffect(() => {
    if (!isEditing) {
      set_nb_aqu(0);
      setinputList([]);
      set_nb_aqu_part(0);
      set_new_clients_dp_partiel([]);
      //set_desisteur_dp_proche([]); // Clear selected desisteurs
      set_profit_dp_co_reser([]);
      setValue('desisteur_dp_proche_co', []); // Clear form value for desisteurs

      // Reset all form array values
      setValue('inputList', []);
      setValue('new_clients_dp_partiel', []);
      setValue('nb_aquereurs', '');
      setValue('nb_aquereurs_dp', '');
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
    }
  }, [type_dp, setValue]); // Add setValue to dependencies
  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-red-50 !text-red-800 rounded-md">
          <p className="font-medium">
            le Désistement est Rejeté a cause de {watch('commentaire_rejete')}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SelectInput
          label="Type Désistement Au Profit :"
          name="type_dp"
          value={isEditing ? watch('type_dp') : watch('type_dp')}
          required={true}
          options={
            // Handle both array and object formats for type_dst_dp
            !type_dst_dp ? [] :
            Array.isArray(type_dst_dp) ? type_dst_dp :
            typeof type_dst_dp === 'object' ? Object.entries(type_dst_dp).map(([key, value]) => ({
              value: key,
              label: typeof value === 'object' ? value.label || value.name || String(value) : String(value)
            })) :[]
          }
          onChange={(value) => {
            // Reset states before changing type
            set_nb_aqu(0);
            setinputList([]);
            set_nb_aqu_part(0);
            set_new_clients_dp_partiel([]);
            setValue('type_dp', value);
            setValue('desisteur_dp_proche_co', []); // Clear the selected desisteurs
            set_desisteur_dp_proche([]); // Clear local state
            setValue('nb_aquereurs_dp_proche', '');
            setValue('somme_percent', '');
          }}
          error={errors.type_dp?.message}
          placeholder="Sélectionnez un type de désistement"
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
                    <SelectInput
                      key={`desisteur-${autocompleteKey}`}
                      name="desisteur_dp_proche_co"
                      placeholder="Choisissez un/plusieurs Désisteurs"
                      required={true}
                      isMulti={true}
                      options={desisteurs.filter(
                        (desisteur) =>
                          !profit_dp_co_reser.some(
                            (profit) =>
                              profit.id ==
                              (isEditing ? desisteur.id : desisteur.client.id)
                          )
                      ).map(desisteur => ({
                        value: isEditing ? desisteur.id : desisteur.client.id,
                        label: `${isEditing ? desisteur.nom : desisteur.client.nom} ${isEditing ? desisteur.prenom : desisteur.client.prenom} (${desisteur.pourcentage}%)`,
                        originalData: desisteur
                      }))}
                      value={desisteur_dp_proche.map(item => item.id)}
                      onChange={(selectedValues) => {
                        let totalPercent = 0;
                        const selectedDesisteurs = [];

                        // Convert selected IDs back to full objects
                        selectedValues.forEach(value => {
                          const desisteur = desisteurs.find(d => 
                            (isEditing ? d.id : d.client.id) === value
                          );
                          if (desisteur) {
                            totalPercent += desisteur.pourcentage;
                            selectedDesisteurs.push({
                              id: desisteur.id,
                              cl_id: isEditing ? desisteur.cl_id : desisteur.client.id,
                              nom: isEditing ? desisteur.nom : desisteur.client.nom,
                              prenom: isEditing ? desisteur.prenom : desisteur.client.prenom,
                              pourcentage: desisteur.pourcentage,
                            });
                          }
                        });

                        set_desisteur_dp_proche(selectedDesisteurs);
                        setValue('desisteur_dp_proche_co', selectedDesisteurs);
                        setValue('somme_percent', totalPercent);
                        set_clients_profit_de(
                          getDifference(desisteurs_testt, selectedDesisteurs)
                        );
                      }}
                      error={errors.desisteur_dp_proche_co?.message}
                    />
                  )}
                />
              </div>
            </div>
            {/* Somme % Ajoutés */}

            <div className="md:col-span-3 md:ml-4">
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
                    <div className="md:col-span-3">
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
                            className="repeater-wrapper mb-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* CIN */}
                              <div className="md:col-span-2">
                                {isEditing ? (
                                  <TextField
                                    name={`inputList[${index}].cin`}
                                    label={'CIN:'}
                                    size="small"
                                    fullWidth
                                    required
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    errors={{}}
                                    backendErrors={{}}
                                  />
                                ) : (
                                  <TextField
                                    label={'CIN:'}
                                    size="small"
                                    fullWidth
                                    required
                                    control={control}
                                    name={`cin_${index}`}
                                    errors={{}}
                                    backendErrors={{}}
                                    value={inputList[index].cin}
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                  />
                                )}
                              </div>

                              {/* Nom */}
                              <div className="md:col-span-3">
                                {isEditing ? (
                                  <TextField
                                    name={`inputList[${index}].nom`}
                                    label={'Nom'}
                                    size="small"
                                    fullWidth
                                    required
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    errors={{}}
                                    backendErrors={{}}
                                  />
                                ) : (
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
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                  />
                                )}
                              </div>

                              {/* Prénom */}
                              <div className="md:col-span-3">
                                {isEditing ? (
                                  <TextField
                                    name={`inputList[${index}].prenom`}
                                    label={'Prénom'}
                                    size="small"
                                    fullWidth
                                    required
                                    errors={{}}
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    backendErrors={{}}
                                  />
                                ) : (
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
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                  />
                                )}
                              </div>

                              {/* Téléphone */}
                              <div className="md:col-span-2">
                                {isEditing ? (
                                  <TextField
                                    name={`inputList[${index}].telephone_num1`}
                                    label={'Téléphone:'}
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="06XXXXXXXX"
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    errors={{}}
                                    backendErrors={{}}
                                  />
                                ) : (
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
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                  />
                                )}
                              </div>

                              {/* Pourcentage */}
                              <div className="md:col-span-2">
                                {isEditing ? (
                                  <TextField
                                    name={`inputList[${index}].pourcentage`}
                                    label={'Pourcentage:'}
                                    size="small"
                                    fullWidth
                                    required
                                    type="number"
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    errors={{}}
                                    backendErrors={{}}
                                  />
                                ) : (
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
                                    onChange={(e) =>
                                      handleinputchange(e, index)
                                    }
                                    type="number"
                                  />
                                )}
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
                          name="profit_dp_co_reser"
                          control={control}
                          rules={{ required: 'Ce champ est requis' }}
                          defaultValue={profit_dp_co_reser || []} // Initialize with your selected values
                          render={({ field }) => (
                            <AutocompleteMultipleDes
                              key={`pro-${autocompleteKey}`} // This forces complete remount
                              label=""
                              name="client_pro"
                              required
                              options={clients_profit_de}
                              choiceKey="id" // Used for unique identification
                              value={profit_dp_co_reser}
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
                              <Info className="h-5 w-5 text-blue-400" />
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
                            {isEditing ? (
                              <Inputs_des_Profit
                                label={'Pourcentage:'}
                                name={`profit_dp_co_reser[${index}].new_pourcentage`}
                                value={
                                  item?.new_pourcentage ??
                                  item?.pourcentage ??
                                  0
                                } // Use new_pourcentage first, fallback to pourcentage
                                onChange={(e) =>
                                  handleinputchange_dp_co(e, index)
                                }
                                type="number"
                                required
                                errors={errors_dp_co?.new_pourcentage?.[index]}
                                helperText={
                                  errors_dp_co?.new_pourcentage?.[index]
                                    ? ''
                                    : ''
                                }
                                size="small"
                                fullWidth
                              />
                            ) : (
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
                                  errors_dp_co?.new_pourcentage?.[index]
                                    ? ''
                                    : ''
                                }
                                size="small"
                                fullWidth
                              />
                            )}
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
                      {isEditing ? (
                        <Inputs_des_Profit
                          label={'Pourcentage Ancien  Client:'}
                          name={`dp_part[${index}].pourcentage_`}
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
                      ) : (
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
                      )}
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
                    const newCount = parseInt(e.target.value) || 0;
                    const currentCount = nb_aqu_part;
                    set_nb_aqu_part(newCount);

                    if (isEditing) {
                      // Editing mode handling
                      if (newCount > currentCount) {
                        // Adding more clients - append empty fields
                        const additionalClients = Array(newCount - currentCount)
                          .fill()
                          .map(() => ({
                            cin: '',
                            nom: '',
                            prenom: '',
                            telephone_num1: '',
                            pourcentage: 0,
                            id: null, // Keep as null for new entries
                          }));

                        const updatedList = [
                          ...new_clients_dp_partiel,
                          ...additionalClients,
                        ];
                        set_new_clients_dp_partiel(updatedList);

                        // Initialize new form fields
                        for (let i = currentCount; i < newCount; i++) {
                          setValue(`new_clients_dp_partiel[${i}].cin`, '');
                          setValue(`new_clients_dp_partiel[${i}].nom`, '');
                          setValue(`new_clients_dp_partiel[${i}].prenom`, '');
                          setValue(
                            `new_clients_dp_partiel[${i}].telephone_num1`,
                            ''
                          );
                          setValue(
                            `new_clients_dp_partiel[${i}].pourcentage`,
                            0
                          );
                        }
                      } else if (newCount < currentCount) {
                        // Reducing count - keep only the first newCount clients
                        const updatedList = new_clients_dp_partiel.slice(
                          0,
                          newCount
                        );
                        set_new_clients_dp_partiel(updatedList);

                        // Clear any extra fields (optional)
                        for (let i = newCount; i < currentCount; i++) {
                          setValue(`new_clients_dp_partiel[${i}].cin`, '');
                          setValue(`new_clients_dp_partiel[${i}].nom`, '');
                          setValue(`new_clients_dp_partiel[${i}].prenom`, '');
                          setValue(
                            `new_clients_dp_partiel[${i}].telephone_num1`,
                            ''
                          );
                          setValue(
                            `new_clients_dp_partiel[${i}].pourcentage`,
                            0
                          );
                        }
                      }

                      // Always update the array form value
                      setValue(
                        'new_clients_dp_partiel',
                        new_clients_dp_partiel.slice(0, newCount)
                      );
                    } else {
                      // Non-editing mode (original behavior)
                      const newList = Array(newCount)
                        .fill()
                        .map(() => ({
                          cin: '',
                          nom: '',
                          prenom: '',
                          telephone_num1: '',
                          pourcentage: 0,
                        }));

                      set_new_clients_dp_partiel(newList);
                      setValue('new_clients_dp_partiel', newList);

                      // Set individual fields for non-editing mode
                      newList.forEach((item, index) => {
                        setValue(`cin_p${index}`, item.cin);
                        setValue(`nom_p${index}`, item.nom);
                        setValue(`prenom_p${index}`, item.prenom);
                        setValue(
                          `telephone_num1_p${index}`,
                          item.telephone_num1
                        );
                        setValue(`pourcentage_p${index}`, item.pourcentage);
                      });
                    }

                    setErrors_new_dp_part({
                      telephone: false,
                      percentage: false,
                      totalPercentage: false,
                    });
                  }}
                />
              </div>
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
                        {isEditing ? (
                          <TextField
                            name={`new_clients_dp_partiel[${index}].cin`}
                            label={'CIN:'}
                            size="small"
                            fullWidth
                            required
                            value={item.cin || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            errors={{}}
                            backendErrors={{}}
                          />
                        ) : (
                          <TextField
                            label={'CIN:'}
                            size="small"
                            fullWidth
                            required
                            control={control}
                            name={`cin_p${index}`}
                            errors={{}}
                            backendErrors={{}}
                            value={item.cin || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                          />
                        )}
                      </div>

                      {/* Nom */}
                      <div className="md:col-span-3">
                        {isEditing ? (
                          <TextField
                            name={`new_clients_dp_partiel[${index}].nom`}
                            label={'Nom:'}
                            size="small"
                            fullWidth
                            required
                            value={item.nom || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            errors={{}}
                            backendErrors={{}}
                          />
                        ) : (
                          <TextField
                            label={'Nom'}
                            size="small"
                            fullWidth
                            control={control}
                            required
                            name={`nom_p${index}`}
                            errors={{}}
                            backendErrors={{}}
                            value={item.nom || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                          />
                        )}
                      </div>

                      {/* Prénom */}
                      <div className="md:col-span-3">
                        {isEditing ? (
                          <TextField
                            name={`new_clients_dp_partiel[${index}].prenom`}
                            label={'Prénom'}
                            size="small"
                            fullWidth
                            required
                            value={item.prenom || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            errors={{}}
                            backendErrors={{}}
                          />
                        ) : (
                          <TextField
                            label={'Prénom'}
                            size="small"
                            fullWidth
                            required
                            control={control}
                            name={`prenom_p${index}`}
                            errors={{}}
                            backendErrors={{}}
                            value={item.prenom || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                          />
                        )}
                      </div>

                      {/* Téléphone */}
                      <div className="md:col-span-2">
                        {isEditing ? (
                          <TextField
                            name={`new_clients_dp_partiel[${index}].telephone_num1`}
                            label={'Téléphone:'}
                            size="small"
                            fullWidth
                            required
                            placeholder="06XXXXXXXX"
                            value={item.telephone_num1 || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            errors={{}}
                            backendErrors={{}}
                          />
                        ) : (
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
                            value={item.telephone_num1 || ''}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                          />
                        )}
                      </div>

                      {/* Pourcentage */}
                      <div className="md:col-span-2">
                        {isEditing ? (
                          <TextField
                            name={`new_clients_dp_partiel[${index}].pourcentage`}
                            label={'Pourcentage:'}
                            size="small"
                            fullWidth
                            required
                            type="number"
                            value={item.pourcentage || 0}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            errors={{}}
                            backendErrors={{}}
                          />
                        ) : (
                          <TextField
                            label={'Pourcentage:'}
                            size="small"
                            fullWidth
                            required
                            control={control}
                            name={`pourcentage_p${index}`}
                            errors={{}}
                            backendErrors={{}}
                            value={item.pourcentage || 0}
                            onChange={(e) =>
                              handleinputchange_dp_partiel_new(e, index)
                            }
                            type="number"
                          />
                        )}
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
          <SelectInput
            label="Lien de Parenté :"
            name="lien_parente"
            value={isEditing ? formData.lien_parente : watch('lien_parente')}
            required={true}
            options={
              // Handle both array and object formats for lien_parentes
              !lien_parentes ? [] :
              Array.isArray(lien_parentes) ? lien_parentes :
              typeof lien_parentes === 'object' ? Object.entries(lien_parentes).map(([key, value]) => ({
                value: key,
                label: typeof value === 'object' ? value.label || value.name || String(value) : String(value)
              })) :
              []
            }
            onChange={(value) => {
              console.log('Selected lien parenté:', value);
              setValue('lien_parente', value);
            }}
            error={errors.lien_parente?.message}
            placeholder="Sélectionnez un lien de parenté"
          />
        </div>
      )}
    </div>
  );
}
