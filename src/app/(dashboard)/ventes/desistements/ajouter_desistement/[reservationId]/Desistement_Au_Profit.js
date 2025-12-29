'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { lien_parentes, type_dst_dp } from '@/configs/enum';
import TextField from '@/components/Textfield';
import { Info } from 'lucide-react';
import SelectInput from '@/components/SelectInput';
import Inputs_des_Profit from './Inputs_des_Profit';

export function Desistement_Au_Profit({
  isEditing,
  formData,
  desisteurs_testt,
  desisteurs,
  desisteutrs_profit_dp_partiell,
  desisteur_dp_proche_co,
}) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

 // Enhanced helper function to convert data structure to SelectInput format
const convertToSelectOptions = (dataArray) => {
  if (!dataArray || !Array.isArray(dataArray)) {
    return [];
  }
  
  const options = dataArray.map(item => {
    if (!item) {
      return null;
    }

    // Extract name and percentage based on data structure
    let nom, prenom, pourcentage;
    
    if (isEditing) {
      // Editing mode: data comes directly from props
      nom = item.nom;
      prenom = item.prenom;
      pourcentage = item.pourcentage;
    } else {
      // Non-editing mode: data might be nested under client
      nom = item.client?.nom || item.nom;
      prenom = item.client?.prenom || item.prenom;
      pourcentage = item.pourcentage || item.client?.pourcentage;
    }

    // Create the display label with percentage
    const baseLabel = `${prenom || ''} ${nom || ''}`.trim();
    const label = pourcentage ? 
      `${baseLabel} (${pourcentage}%)` : 
      baseLabel;
    
    // Get the ID value
    const value = isEditing ? 
      (item.id ? item.id.toString() : '') : 
      (item.client?.id ? item.client.id.toString() : (item.id ? item.id.toString() : ''));
    return {
      label: label || 'Nom non disponible',
      value: value,
    };
  }).filter(Boolean); // Remove null items
  return options;
};

  // ** difference of two arrays
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
    return isEditing && formData ? desisteur_dp_proche_co : [];
  });

  // State for SelectInput values
  const [selectDesisteurValue, setSelectDesisteurValue] = useState([]);
  const [selectProfitValue, setSelectProfitValue] = useState([]);

  //dp proche
  const [nb_aqu, set_nb_aqu] = useState(0);
  const [inputList, setinputList] = useState([]);

  const [errors_dp_proche, setErrors_dp_proche] = useState({
    telephone: {},
    percentage: {},
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

  const [errors_new_dp_part, setErrors_new_dp_part] = useState({
    telephone: {},
    percentage: {},
    totalPercentage: false,
  });

  // Add this useEffect to pre-fill form data when in editing mode
  useEffect(() => {
    if (isEditing && formData && !isDataLoaded) {
      setValue('commentaire_rejete', formData.commentaire_rejete);

      if (!formData.type_dp) {
        console.error('Missing type_dp in formData');
        return;
      }

      setValue('type_dp', formData.type_dp);
      switch (formData.type_dp) {
        case '1': // Désistement au profit d'un proche
          setValue('desisteur_dp_proche_co', desisteur_dp_proche_co);
          setValue(
            'nb_aquereurs_dp_proche',
            formData.nouvel_aquereurs_desistements?.length || 0
          );

          const transformedList =
            formData.nouvel_aquereurs_desistements?.map((item) => ({
              cin: item.cin,
              nom: item.nom,
              prenom: item.prenom,
              telephone_num1: item.telephone,
              pourcentage: item.pourcentage || 0,
            })) || [];

          const sommePercent = transformedList.reduce((sum, item) => {
            return sum + Number(item.pourcentage) || 0;
          }, 0);

          setinputList(transformedList);
          setValue('inputList', transformedList);
          set_nb_aqu(transformedList.length);
          setValue('somme_percent', sommePercent);

          // Set SelectInput value for desisteurs
          if (desisteur_dp_proche_co && desisteur_dp_proche_co.length > 0) {
            const selectValues = desisteur_dp_proche_co.map(item => 
              isEditing ? item.id : (item.client?.id || item.id)
            );
            setSelectDesisteurValue(selectValues);
          }
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

          // Set SelectInput values
          if (desisteur_dp_proche_co && desisteur_dp_proche_co.length > 0) {
            const selectValues = desisteur_dp_proche_co.map(item => 
              isEditing ? item.id : (item.client?.id || item.id)
            );
            setSelectDesisteurValue(selectValues);
          }
          if (profit_dp_co_res && profit_dp_co_res.length > 0) {
            const selectProfitValues = profit_dp_co_res.map(item => item.id);
            setSelectProfitValue(selectProfitValues);
          }
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

          setValue('new_clients_dp_partiel', new_client_dp_partiel);
          set_new_clients_dp_partiel(new_client_dp_partiel);
          setValue('nb_aquereurs_dp', new_client_dp_partiel.length);
          set_nb_aqu_part(new_client_dp_partiel.length);

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

  // Enhanced desisteur selection handler
const handleDesisteurChange = (selectedValues) => {
  console.log('Selected values:', selectedValues);
  setSelectDesisteurValue(selectedValues);
  
  let totalPercent = 0;
  const selectedDesisteurs = [];

  // Get the full objects from the selected values
  selectedValues.forEach(value => {
    const foundDesisteur = desisteurs.find(desisteur => {
      // Try different ID locations based on data structure
      const desisteurId = isEditing ? 
        (desisteur.id ? desisteur.id.toString() : '') : 
        (desisteur.client?.id ? desisteur.client.id.toString() : (desisteur.id ? desisteur.id.toString() : ''));
      
      return desisteurId === value;
    });
    
    if (foundDesisteur) {
      const pourcentage = foundDesisteur.pourcentage || 0;
      totalPercent += pourcentage;
      
      selectedDesisteurs.push({
        id: foundDesisteur.id,
        cl_id: isEditing ? foundDesisteur.cl_id : foundDesisteur.client?.id,
        nom: isEditing ? foundDesisteur.nom : foundDesisteur.client?.nom,
        prenom: isEditing ? foundDesisteur.prenom : foundDesisteur.client?.prenom,
        pourcentage: pourcentage,
      });
    } else {
      console.warn('Could not find desisteur for value:', value);
    }
  });

  console.log('Selected desisteurs objects:', selectedDesisteurs);
  
  set_desisteur_dp_proche(selectedDesisteurs);
  setValue('desisteur_dp_proche_co', selectedDesisteurs);
  setValue('somme_percent', totalPercent);
  
  // Update clients available for profit selection
  if (desisteurs_testt) {
    const difference = getDifference(desisteurs_testt, selectedDesisteurs);
    console.log('Clients profit difference:', difference);
    set_clients_profit_de(difference);
  }
};

  // Handle profit selection change
  const handleProfitChange = (selectedValues) => {
    setSelectProfitValue(selectedValues);
    
    const selectedProfit = selectedValues.map(value => {
      const foundClient = clients_profit_de.find(client => client.id === value);
      return foundClient ? {
        id: foundClient.id,
        cl_id: foundClient.cl_id,
        nom: foundClient.nom,
        prenom: foundClient.prenom,
        new_pourcentage: 0,
      } : null;
    }).filter(Boolean);

    set_profit_dp_co_reser(selectedProfit);
    setValue('profit_dp_co_reser', selectedProfit);
  };

  // Enhanced filter function
const getFilteredDesisteurOptions = () => {
  if (!desisteurs || !Array.isArray(desisteurs)) {
    console.log('getFilteredDesisteurOptions: No desisteurs array');
    return [];
  }
  
  console.log('All desisteurs:', desisteurs);
  console.log('Profit dp co reser:', profit_dp_co_reser);

  const filtered = desisteurs.filter(desisteur => {
    if (!profit_dp_co_reser || profit_dp_co_reser.length === 0) {
      return true;
    }
    
    const desisteurId = isEditing ? 
      (desisteur.id ? desisteur.id.toString() : '') : 
      (desisteur.client?.id ? desisteur.client.id.toString() : (desisteur.id ? desisteur.id.toString() : ''));
    
    const isExcluded = profit_dp_co_reser.some(profit => {
      const profitId = profit.id ? profit.id.toString() : '';
      return profitId === desisteurId;
    });
    
    return !isExcluded;
  });

  console.log('Filtered desisteurs:', filtered);
  const options = convertToSelectOptions(filtered);
  return options;
};

  const handleinputchange = (e, index) => {
    const { name, value } = e.target;

    // Create new errors structure that tracks by index
    const newErrors = {
      telephone: { ...errors_dp_proche.telephone },
      percentage: { ...errors_dp_proche.percentage },
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

        // Validate ALL telephone numbers when any field changes
        updatedList.forEach((item, idx) => {
          if (item.telephone_num1) {
            const isValid =
              item.telephone_num1.length >= 10 &&
              item.telephone_num1.length <= 14;
            newErrors.telephone[idx] = !isValid;
          }
        });

        // Validate ALL percentages when any field changes
        updatedList.forEach((item, idx) => {
          if (item.pourcentage !== undefined && item.pourcentage !== null) {
            const percentValue = parseInt(item.pourcentage) || 0;
            newErrors.percentage[idx] = percentValue < 0 || percentValue > 100;
          }
        });

        // Calculate total percentage
        const totalPercentage = updatedList.reduce((sum, item) => {
          return sum + parseInt(item.pourcentage) || 0;
        }, 0);

        const targetPercentage = parseInt(watch('somme_percent')) || 0;
        newErrors.totalPercentage = totalPercentage !== targetPercentage;
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

      // Validate ALL telephone numbers when any field changes
      updatedList.forEach((item, idx) => {
        if (item.telephone_num1) {
          const isValid =
            item.telephone_num1.length >= 10 &&
            item.telephone_num1.length <= 14;
          newErrors.telephone[idx] = !isValid;
        }
      });

      // Validate ALL percentages when any field changes
      updatedList.forEach((item, idx) => {
        if (item.pourcentage !== undefined && item.pourcentage !== null) {
          const percentValue = parseInt(item.pourcentage) || 0;
          newErrors.percentage[idx] = percentValue < 0 || percentValue > 100;
        }
      });

      // Calculate total percentage
      const totalPercentage = updatedList.reduce((sum, item) => {
        return sum + parseInt(item.pourcentage) || 0;
      }, 0);

      const targetPercentage = parseInt(watch('somme_percent')) || 0;
      newErrors.totalPercentage = totalPercentage !== targetPercentage;
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

        // Calculate errors - ALWAYS validate ALL fields when any field changes
        const newErrors = {
          telephone: {},
          percentage: {},
          totalPercentage: false,
        };

        // Validate ALL telephone numbers in the list
        updatedList.forEach((item, idx) => {
          if (item.telephone_num1) {
            const isValid =
              item.telephone_num1.length >= 10 &&
              item.telephone_num1.length <= 14;
            if (!isValid) {
              newErrors.telephone[idx] =
                'Le numéro de téléphone doit contenir entre 10 et 14 caractères';
            }
          }
        });

        // Validate ALL percentages in the list
        updatedList.forEach((item, idx) => {
          if (item.pourcentage !== undefined && item.pourcentage !== null) {
            const percentValue = parseFloat(item.pourcentage) || 0;
            if (percentValue < 0 || percentValue > 100) {
              newErrors.percentage[idx] =
                'Le pourcentage doit être entre 0 et 100';
            }
          }
        });

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

        // Update state with ALL errors
        setErrors_new_dp_part(newErrors);
      }
    } else {
      // Non-editing mode - similar logic but with different field names
      const parts = name.split('_');
      const fieldName = parts.slice(0, -1).join('_');

      const updatedList = new_clients_dp_partiel.map((item, i) =>
        i == index ? { ...item, [fieldName]: value } : item
      );

      // Calculate errors - ALWAYS validate ALL fields
      const newErrors = {
        telephone: {},
        percentage: {},
        totalPercentage: false,
      };

      // Validate ALL telephone numbers
      updatedList.forEach((item, idx) => {
        if (item.telephone_num1) {
          const isValid =
            item.telephone_num1.length >= 10 &&
            item.telephone_num1.length <= 14;
          if (!isValid) {
            newErrors.telephone[idx] = true;
          }
        }
      });

      // Validate ALL percentages
      updatedList.forEach((item, idx) => {
        if (item.pourcentage !== undefined && item.pourcentage !== null) {
          const percentValue = parseFloat(item.pourcentage) || 0;
          if (percentValue < 0 || percentValue > 100) {
            newErrors.percentage[idx] = true;
          }
        }
      });

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
      set_profit_dp_co_reser([]);
      setValue('desisteur_dp_proche_co', []);
      setValue('inputList', []);
      setValue('new_clients_dp_partiel', []);
      setValue('nb_aquereurs', '');
      setValue('nb_aquereurs_dp', '');
      setValue('profit_dp_co_reser', []);
      setValue('somme_percent', 0);
      setValue('somme_percent_dp_patiel_old', 0);
      setValue('somme_percent_dp_patiel_new', 0);
      setValue('targetPercentage_part_new', 0);

      // Reset SelectInput values
      setSelectDesisteurValue([]);
      setSelectProfitValue([]);

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
      setAutocompleteKey((prev) => prev + 1);
    }
  }, [type_dp, setValue]);

  useEffect(() => {
    // Validate all fields whenever inputList changes (for proche type)
    if (inputList.length > 0) {
      const newErrors = {
        telephone: {},
        percentage: {},
        totalPercentage: false,
      };

      inputList.forEach((item, index) => {
        // Validate telephone
        if (item.telephone_num1) {
          const isValid =
            item.telephone_num1.length >= 10 &&
            item.telephone_num1.length <= 14;
          if (!isValid) {
            newErrors.telephone[index] = true;
          }
        }

        // Validate percentage
        if (item.pourcentage !== undefined && item.pourcentage !== null) {
          const percentValue = parseInt(item.pourcentage) || 0;
          if (percentValue < 0 || percentValue > 100) {
            newErrors.percentage[index] = true;
          }
        }
      });

      // Calculate total percentage
      const totalPercentage = inputList.reduce((sum, item) => {
        return sum + parseInt(item.pourcentage) || 0;
      }, 0);

      const targetPercentage = parseInt(watch('somme_percent')) || 0;
      newErrors.totalPercentage = totalPercentage !== targetPercentage;

      setErrors_dp_proche(newErrors);
    }
  }, [inputList, watch('somme_percent')]);

  useEffect(() => {
    // Validate all fields whenever new_clients_dp_partiel changes
    if (new_clients_dp_partiel.length > 0) {
      const newErrors = {
        telephone: {},
        percentage: {},
        totalPercentage: false,
      };

      new_clients_dp_partiel.forEach((item, index) => {
        // Validate telephone
        if (item.telephone_num1) {
          const isValid =
            item.telephone_num1.length >= 10 &&
            item.telephone_num1.length <= 14;
          if (!isValid) {
            newErrors.telephone[index] = true;
          }
        }

        // Validate percentage
        if (item.pourcentage !== undefined && item.pourcentage !== null) {
          const percentValue = parseFloat(item.pourcentage) || 0;
          if (percentValue < 0 || percentValue > 100) {
            newErrors.percentage[index] = true;
          }
        }
      });

      // Calculate total percentage
      let totalNewPercentage = 0;
      new_clients_dp_partiel.forEach((item) => {
        totalNewPercentage += parseFloat(item.pourcentage) || 0;
      });

      const totalOldPercentage =
        parseFloat(watch('somme_percent_dp_patiel_old')) || 0;
      const combinedPercentage = totalNewPercentage + totalOldPercentage;

      if (Math.abs(combinedPercentage - 100) > 0.01) {
        newErrors.totalPercentage = true;
      }

      setErrors_new_dp_part(newErrors);
    }
  }, [new_clients_dp_partiel, watch('somme_percent_dp_patiel_old')]);

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
      name="desisteur_dp_proche_co"
      control={control}
      rules={{ required: 'Ce champ est requis' }}
      render={({ field }) => (
        <SelectInput
          key={`desisteur-${autocompleteKey}`}
          label=""
          placeholder="Choisissez un/plusieurs Désisteurs"
          options={getFilteredDesisteurOptions()}
          value={selectDesisteurValue}
          onChange={handleDesisteurChange}
          isMulti={true}
          required={true}
          error={errors.desisteur_dp_proche_co}
          name="desisteur_dp_proche_co"
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

                          for (let i = 0; i < inputList.length; i++) {
                            setValue(`cin_${i}`, '');
                            setValue(`nom_${i}`, '');
                            setValue(`prenom_${i}`, '');
                            setValue(`telephone_num1_${i}`, '');
                            setValue(`pourcentage_${i}`, '');
                          }

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
                                {errors_dp_proche.telephone &&
                                  errors_dp_proche.telephone[index] && (
                                    <p
                                      style={{
                                        color: 'red',
                                        fontSize: '0.75rem',
                                        marginTop: '4px',
                                      }}
                                    >
                                      Le numéro de téléphone doit contenir entre
                                      10 et 14 caractères
                                    </p>
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
                                {errors_dp_proche.percentage &&
                                  errors_dp_proche.percentage[index] && (
                                    <p
                                      className="text-red-500"
                                      style={{
                                        fontSize: '0.75rem',
                                        marginTop: '4px',
                                      }}
                                    >
                                      Le pourcentage doit être compris entre 0
                                      et 100
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
                          defaultValue={profit_dp_co_reser || []}
                          render={({ field }) => (
                            <SelectInput
                              key={`pro-${autocompleteKey}`}
                              label=""
                              placeholder="Choisissez un/plusieurs Désisteurs"
                              options={convertToSelectOptions(clients_profit_de)}
                              value={selectProfitValue}
                              onChange={handleProfitChange}
                              isMulti={true}
                              required={true}
                              error={errors.profit_dp_co_reser}
                              name="profit_dp_co_reser"
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
                                }
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
                        {/* Show telephone error for this specific index */}
                        {errors_new_dp_part.telephone &&
                          errors_new_dp_part.telephone[index] && (
                            <p
                              style={{
                                color: 'red',
                                fontSize: '0.75rem',
                                marginTop: '4px',
                              }}
                            >
                              Le numéro de téléphone doit contenir entre 10 et
                              14 caractères
                            </p>
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

                        {/* Show percentage error for this specific index */}
                        {errors_new_dp_part.percentage &&
                          errors_new_dp_part.percentage[index] && (
                            <p
                              className="text-red-500"
                              style={{
                                fontSize: '0.75rem',
                                marginTop: '4px',
                              }}
                            >
                              Le pourcentage doit être compris entre 0 et 100
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
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