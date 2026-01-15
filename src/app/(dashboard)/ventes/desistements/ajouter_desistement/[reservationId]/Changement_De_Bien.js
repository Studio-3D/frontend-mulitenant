import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@/components/Textfield';
import Autocomplete from '@/components/Autocomplete';
import SelectInput from '@/components/SelectInput';

import { APIURL } from '../../../../../../configs/api';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useAuth } from '../../../../../../context/AuthContext';
import { MODE_PAIEMENT } from '@/configs/enum';
import { data_by_projet_and_params } from '../../../../../../../src/configs/api-utils';
import { RemboursementSection_Change_bien } from './RemboursementSection_Change_bien'; // Import the component

export function Changement_De_Bien({
  formData,
  isEditing,
  selectedProjet_id,
  bien_ancien,
  sum_avances_valides,
  banques,
  filesList_avc,
  //remboursement
  inputListRemb_get,
  reservationId,

  // prix_reservation
}) {
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  //remboursement
  const [sum_avances_moins_prix_new_bien, set_sum_avances_moins_prix_new_bien] =
    useState(0);
  const [loading_dos, setLoading_dos] = useState();
  const [dossiers, setDossiers] = useState([]);
  const [loadingInfos, setLoadingInfos] = useState({});
  const [type_remb, set_type_remb] = useState(null);
  const [inputListRemb, set_inputList_remb] = useState([]);
  const [dossierInfos, setDossierInfos] = useState({});
  // Check if remboursement is needed

  const { user, token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);

  const [loading_bien_id, setLoading_bien_id] = useState(false);
  const [loading_bien, setLoading_bien] = useState(false);
  const [biensByProjet, setBiensByProjet] = useState([]);
  const [montant_a_ajouter, set_montant_a_ajouter] = useState(0);
  const [new_bien_id, set_new_bien_id] = useState(0);
  const [old_bien_id, set_old_bien_id] = useState(0);
  //Remboursement
  // Initialize inputListRemb from props
  useEffect(() => {
    if (inputListRemb_get) {
      set_inputList_remb(inputListRemb_get);
      setValue('inputList_remb', inputListRemb_get);
    }
  }, [inputListRemb_get, setValue]);
  // Add this useEffect to pre-fill form data when in editing mode
  useEffect(() => {
    if (isEditing && formData) {
      console.log('prix d nv bien==>' + formData?.bien_nouveau?.prix);
      setValue('commentaire_rejete', formData.commentaire_rejete);

      fetch_bien_ByProjet(formData?.bien_nouveau);
      set_new_bien_id(formData.bien_id_new);
      setValue('bien_id', formData.bien_id_new);
      setValue('new_bien_id', formData.bien_id_new);
      setValue('prix_nouveau_bien', formData?.bien_nouveau?.prix);
      //  show_bien(formData.bien_id_new);
      setValue('new_avance', formData?.bien_nouveau?.avance_minimale);
      set_montant_a_ajouter(formData.montant_a_ajouter);
      setValue('montant_a_ajouter', formData.montant_a_ajouter);
      setValue('sr', formData.sr);
      setValue('mode_paiement', formData.mode_paiement);
      setValue('numero_paiement', formData.numero_paiement);
      setValue('banque_id', formData.banque_id);
      setValue('echeance', formData.echeance);
      setSelectedFiles_avc(
        formData?.piece_jointes_des_montant_a_ajouter
          ? formData.piece_jointes_des_montant_a_ajouter
          : []
      );
      setValue(
        'files_avance',
        formData?.piece_jointes_des_montant_a_ajouter
          ? formData.piece_jointes_des_montant_a_ajouter
          : []
      );
    }
  }, [isEditing, formData, setValue]);

  /****************************************Remboursemnt**********************************************************/

  const fetchDossierData = async () => {
    try {
      setLoading_dos(true);
      // You might need to adjust this call based on your API
      await data_by_projet_and_params(
        'getDossiers',
        setDossiers,
        setLoading_dos,
        'reservations',
        selectedProjet_id,
        reservationId // You'll need to get this from somewhere
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
    try {
      if (dos_id) {
        setLoadingInfos((prev) => ({ ...prev, [index]: true }));

        const response = await axios.get(
          `${APIURL.ROOTV1}/show_dossier_in_dd/${dos_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const { reservation, sum_avances_valides } = response.data;

        const newDossierInfo = {
          clients: reservation.aquereurs,
          bien: reservation.bien,
          type: reservation.bien.type_bien?.type,
          prix: reservation.prix,
          sum_avances: sum_avances_valides,
          reste: reservation.prix - sum_avances_valides,
        };
        setDossierInfos((prev) => ({
          ...prev,
          [index]: newDossierInfo,
        }));
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    } finally {
      setLoadingInfos((prev) => ({ ...prev, [index]: false }));
    }
  };
  const handleTypeRembChange = (newType) => {
  set_type_remb(newType);
  setValue('type_remb', newType);
  
  // Update reste_a_rembourse for all clients
  inputListRemb?.forEach((item, index) => {
    const pourcentage = item.pourcentage || 0;
    const reste_a_rembourse = (sum_avances_moins_prix_new_bien * (pourcentage / 100)).toFixed(2);
    
    setValue(`inputList_remb.${index}.type_remb`, newType); // Always set to direct
    setValue(`inputList_remb.${index}.reste_a_rembourse`, reste_a_rembourse);
    
    // Clear transfer-related fields
    setValue(`inputList_remb.${index}.dossier_id`, '');
    setValue(`inputList_remb.${index}.montant_transferer`, '');
    setValue(`inputList_remb.${index}.error`, '');
    setValue(`inputList_remb.${index}.type_remb_transfere`, '');
    
    // Clear dossier info
    setDossierInfos((prev) => {
      const newInfos = { ...prev };
      delete newInfos[index];
      return newInfos;
    });
  });
};
  const handleModeChange = (index, newMode) => {
    const currentValues = watch(`inputList_remb.${index}`) || {};

    // Get the current item from inputListRemb to get the correct pourcentage
    const currentItem = inputListRemb[index] || currentValues;

    // Calculate the proper reste_a_rembourse based on pourcentage
    const sum = sum_avances_moins_prix_new_bien
      ? ((currentItem.pourcentage || 0) / 100) * sum_avances_moins_prix_new_bien
      : 0;

    // Create updated values
    const updatedValues = {
      ...currentValues,
      type_remb: newMode,
      dossier_id: '',
      montant_transferer: '',
      reste_a_rembourse: sum.toFixed(2),
      date_rembourse: '',
      mode_rembourse: '',
      num_paiement: '',
      pour_le_compte: '',
      error: '',
      type_remb_transfere:
        newMode == 'transfert_rem_direct'
          ? 'immediat'
          : newMode == 'transfert_rem_apres_vente'
          ? 'apres_vente'
          : currentValues.type_remb_transfere || 'immediat',
    };

    // Only clear cheque_recu and fichier_autorisation when switching from transfer to direct
    // or when switching to a mode that doesn't need these files
    if (
      newMode !== 'transfert_remb' &&
      newMode !== 'transfert_rem_direct' &&
      newMode !== 'transfert_rem_apres_vente'
    ) {
      updatedValues.cheque_recu = null;
      updatedValues.fichier_autorisation = null;
    } else if (newMode === 'direct') {
      // When switching to direct mode, clear both files
      updatedValues.cheque_recu = null;
      updatedValues.fichier_autorisation = null;
    } else {
      // For other modes, keep existing files if they exist
      updatedValues.cheque_recu = currentValues.cheque_recu || null;
      updatedValues.fichier_autorisation =
        currentValues.fichier_autorisation || null;
    }

    setValue(`inputList_remb.${index}`, updatedValues);

    setDossierInfos((prev) => {
      const newInfos = { ...prev };
      delete newInfos[index];
      return newInfos;
    });
  };
  const handleInputChange = (index, fieldName, value) => {
    setValue(`inputList_remb.${index}.${fieldName}`, value);
  };

  const handleFileChange_dd = (index, fieldName, event) => {
    if (event.target.files && event.target.files[0]) {
      setValue(`inputList_remb.${index}.${fieldName}`, event.target.files[0]);
    }
  };
  /***********************Fin Remboursement********************************************* */
  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }

  // Fetch biens by projet
  const fetch_bien_ByProjet = async (bien_new) => {
    setLoading_bien(true);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/getBiensByProjet_Concat/${selectedProjet_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      //add bien du desistement to res data biens(disponible)
      if (bien_new != null && bien_new != undefined) {
        response.data.biens.push({
          propriete_dite_bien: NomBienComplet(bien_new),
          id: bien_new?.id,
        });
      }
      setBiensByProjet(response.data.biens);
    } catch (error) {
      console.error('Error fetching biens:', error);
    } finally {
      setLoading_bien(false);
    }
  };

  useEffect(() => {
    // Set initial values
    setValue('bien_ancien', bien_ancien);
    setValue('sum_avances_valides', sum_avances_valides);
    if (!isEditing) {
      fetch_bien_ByProjet(null);
    } else {
      fetch_bien_ByProjet(formData?.bien_nouveau);
    }
  }, []);

  const handlechangeBien_id = (event, v) => {
    if (v != null) {
      const newId = v.id;
      set_new_bien_id(newId);
      setValue('new_bien_id', newId);
      setValue('sr', '');
      setValue('mode_paiement', '');
      setValue('numero_paiement', '');
      setValue('banque_id', '');
      setValue('echeance', '');
      show_bien(newId);

      // Store in proposition - first time old_id is 0, subsequent times it's the previous new_bien_id
      storebien_en_proposition(newId, old_bien_id);
      set_old_bien_id(newId); // Update old_id for next change

      pusher_function();
    }
  };

  const show_bien = async (bien_id) => {
    setLoading_bien_id(true);
    try {
      const response = await axios.get(`${APIURL.BIENS}/${bien_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const bien = response.data.bien;
      const avance_minimale = bien.avance_minimale;
      const prix_bien = bien.prix; // Get the price of the new bien
      console.log('Prix du nouveau bien:', prix_bien); // Debug log

      setValue('new_avance', avance_minimale);
      setValue('prix_nouveau_bien', prix_bien); // Store the new bien's priceF
      
       const diff =  watch('sum_avances_valides') - prix_bien;
        set_sum_avances_moins_prix_new_bien(diff);
        
        // If there's a difference, update all clients
        if (diff > 0) {
          inputListRemb?.forEach((item, index) => {
            const pourcentage = item.pourcentage || 0;
            const reste_a_rembourse = (diff * (pourcentage / 100)).toFixed(2);
            setValue(`inputList_remb.${index}.reste_a_rembourse`, reste_a_rembourse);
          });
        }
      // Calculate amount to add
      const amountToAdd =
        sum_avances_valides > avance_minimale
          ? 0
          : avance_minimale - sum_avances_valides;
      set_montant_a_ajouter(amountToAdd);
      setValue('montant_a_ajouter', amountToAdd);
    } catch (error) {
      console.error('Error fetching bien details:', error);
    } finally {
      setLoading_bien_id(false);
    }
  };

  const storebien_en_proposition = async (id, old_id = 0) => {
    try {
      await axios.put(
        `${APIURL.ROOTV1}/setPropostionBien/${id}/${old_id}`,
        {},
        {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Bien en proposition updated');
    } catch (error) {
      console.error('Error updating bien proposition:', error);
    }
  };

  const handleFileChange = (event, param) => {
    const files = Array.from(event.target.files);
    event.target.value = null; // Reset input

    if (files.length === 0) return;

    const updatedFiles = [...selectedFiles_avc];
    const existingFileNames = new Set(Object.values(filesList_avc || {}));
    const existingSelectedNames = new Set(
      selectedFiles_avc.map((f) => f.name || f.fichier)
    );

    for (const file of files) {
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');
      const baseName =
        lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
      const extension =
        lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex + 1);

      let finalFileName = fileName;

      // Check if file exists in either the existing files list or already selected files
      if (
        existingFileNames.has(fileName) ||
        existingSelectedNames.has(fileName)
      ) {
        let counter = 1;
        while (true) {
          finalFileName = extension
            ? `${baseName} (${counter}).${extension}`
            : `${baseName} (${counter})`;

          if (
            !existingFileNames.has(finalFileName) &&
            !existingSelectedNames.has(finalFileName)
          ) {
            break;
          }
          counter++;
        }
      }

      const finalFile =
        finalFileName === fileName
          ? file
          : new File([file], finalFileName, { type: file.type });

      updatedFiles.push(finalFile);
      existingSelectedNames.add(finalFileName);
    }

    if (updatedFiles.length > selectedFiles_avc.length) {
      setSelectedFiles_avc(updatedFiles);
      setValue('files_avance', updatedFiles);
    }
  };
  const handleFileClick = (filename) => {
    window.open(`${APIURL.ROOTV1}/storage/${filename}`);
  };

  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);

    window.open(fileURL);
  };

  const handleDeleteFile = async (index) => {
    const updatedFiles = selectedFiles_avc.filter((_, i) => i != index);
    setSelectedFiles_avc(updatedFiles);
    await Promise.resolve(); // Ensures state is updated
    setValue('files_avance', updatedFiles);
  };

  const pusher_function = () => {
    const pusher = new Pusher(pusher_key_proposition, {
      cluster: 'eu',
      encrypted: true,
    });

    const channel = pusher.subscribe('proposition-updates');
    channel.bind('App\\Events\\PropositionUpdated', (data) => {
      console.log('Proposal status changed:', data);
      if (!isEditing) {
        fetch_bien_ByProjet(null);
      } else {
        fetch_bien_ByProjet(formData?.bien_nouveau);
      }
    });

    return () => {
      channel.unbind('App\\Events\\PropositionUpdated');
      pusher.unsubscribe('proposition-updates');
    };
  };

  // Assuming biensByProjet is an array of objects with an 'id' property
  const uniqueBiens = biensByProjet.filter(
    (bien, index, self) => index == self.findIndex((b) => b.id == bien.id)
  );

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
        <TextField
          label="Ancien Bien:"
          name="bien_ancien"
          control={control}
          errors={errors}
          backendErrors={{}}
          disabled
        />

        <TextField
          label="Somme Avances:"
          name="sum_avances_valides"
          control={control}
          errors={errors}
          backendErrors={{}}
          disabled
        />
      </div>

      <div className="border-t border-gray-200 py-4 mt-4">
        <h3 className="text-md font-medium text-indigo-600 mb-4">
          Biens disponibles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SelectInput
            label="Nouveau Bien"
            name="new_bien_id"
            value={watch('new_bien_id')} // This should be the actual ID, not the JSON string
            required={true}
            options={
              Array.isArray(uniqueBiens)
                ? uniqueBiens.map((bien) => {
                    // Add the same disabled logic from your other component
                    const isDisabled =
                      bien.etat == 'ENCOURS_DE_PROPOSITION' &&
                      bien.is_proposed != null &&
                      user.id != bien.is_proposed.user_id;

                    // Add the same label text logic
                    const labelText =
                      bien.propriete_dite_bien +
                      (bien.etat === 'ENCOURS_DE_PROPOSITION'
                        ? bien?.is_proposed != null
                          ? user.id != bien?.is_proposed?.user_id
                            ? ` Proposé par ${bien?.is_proposed?.user?.name} ${bien?.is_proposed?.user?.prenom}`
                            : ' Proposé par Moi Même'
                          : ''
                        : '');

                    return {
                      value: bien.id, // Store just the ID, not JSON string
                      label:
                        labelText ||
                        bien.propriete_dite_bien ||
                        bien.nom ||
                        `Bien ${bien.id}`,
                      disabled: isDisabled,
                    };
                  })
                : []
            }
            onChange={(selectedId) => {
              if (selectedId) {
                const selectedOption = uniqueBiens.find(
                  (b) => b.id === selectedId
                );
                if (selectedOption) {
                  handlechangeBien_id(null, selectedOption);
                }
              } else {
                // Handle null/empty selection
                handlechangeBien_id(null, null);
              }
            }}
            error={errors.bien_id?.message}
            placeholder="Sélectionnez un nouveau bien"
            loading={loading_bien}
          />
          {/* Show additional fields when a new bien is selected           <p>s_aan{ watch('sum_avances_valides')} prix{ watch('prix_nouveau_bien')}  w id {new_bien_id}</p>
           */}
          {loading_bien_id ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {new_bien_id != 0 && (
                <>
                  {watch('sum_avances_valides') < watch('prix_nouveau_bien') ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <TextField
                        label="Avance Minimale:"
                        name="new_avance"
                        control={control}
                        errors={errors}
                        backendErrors={{}}
                        disabled
                      />
                      <TextField
                        label="Montant à Ajouter:"
                        name="montant_a_ajouter"
                        control={control}
                        errors={errors}
                        backendErrors={{}}
                        type="number"
                        value={montant_a_ajouter}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          set_montant_a_ajouter(value);
                          setValue('montant_a_ajouter', value);
                        }}
                        //required
                      />

                      {/* Add validation error message */}
                      {montant_a_ajouter >
                        (watch('prix_nouveau_bien') || 0) && (
                        <p className="text-red-500 text-sm mt-1">
                          Le montant à ajouter ne peut pas dépasser le prix du
                          nouveau bien ({watch('prix_nouveau_bien')} DH)
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
  {sum_avances_moins_prix_new_bien > 0 && (
  <div className="flex flex-col mt-3">
    {/* Price display card */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-4">
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-600">Prix du nouveau bien</p>
          <p className="text-xl font-bold text-gray-800">
            {watch('prix_nouveau_bien')?.toLocaleString('fr-FR')} DH
          </p>
        </div>
      </div>
    </div>

    {/* Remboursement type selection */}
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-700 font-medium mb-3">Choisissez le type de remboursement:</p>
      <Controller
        name="type_remb"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
              <input
                type="radio"
                {...field}
                value="direct"
                checked={field.value == 'direct'}
                className="h-4 w-4 text-blue-600"
                onChange={() => handleTypeRembChange('direct')}
              />
              <div className="ml-3">
                <span className="text-gray-800 font-medium">Remboursement immédiat</span>
                <p className="text-sm text-gray-600 mt-1">Le remboursement sera effectué directement</p>
              </div>
            </label>
            
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="radio"
                {...field}
                value="apres_vente"
                checked={field.value == 'apres_vente'}
                className="h-4 w-4 text-purple-600"
                onChange={() => handleTypeRembChange('apres_vente')}
              />
              <div className="ml-3">
                <span className="text-gray-800 font-medium">Remboursement après vente</span>
                <p className="text-sm text-gray-600 mt-1">Le remboursement sera effectué après la vente</p>
              </div>
            </label>
            
            {errors.type_remb && (
              <p className="text-red-600 text-sm mt-2">
                {errors.type_remb.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  </div>
)}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {!loading_bien_id && (
          <>
            {type_remb == 'direct' && inputListRemb?.length > 0 && (
              <RemboursementSection_Change_bien
                inputListRemb={inputListRemb}
                dossiers={dossiers}
                loading_dos={loading_dos}
                dossierInfos={dossierInfos}
                loadingInfos={loadingInfos}
                get_info_dossier_id={get_info_dossier_id}
                NomBienComplet={NomBienComplet}
                handleModeChange={handleModeChange}
                handleInputChange={handleInputChange}
                handleFileChange_dd={handleFileChange_dd}
                sum_avances_moins_prix_new_bien={
                  sum_avances_moins_prix_new_bien
                }
              />
            )}

            {/* Payment section when amount to add > 0 */}
            {montant_a_ajouter > 0 && (
              <>
                <div className="border-t border-gray-300 my-6"></div>

                <h4 className="text-md font-medium text-gray-800 mb-4">
                  Modalité de Paiement
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sr-checkbox"
                      checked={watch('sr') == 1} // This checks if sr equals 1
                      className="h-4 w-4 text-indigo-600 rounded"
                      onChange={(e) => setValue('sr', e.target.checked ? 1 : 0)} // Sets to 1 when checked, 0 when unchecked
                    />
                    <label
                      htmlFor="sr-checkbox"
                      className="ml-2 text-sm text-gray-700"
                    >
                      SR
                    </label>
                  </div>
                  <SelectInput
                    label="Mode de Paiement"
                    name="mode_paiement"
                    value={watch('mode_paiement')}
                    required={true}
                    options={
                      // Handle both array and object formats for MODE_PAIEMENT
                      !MODE_PAIEMENT
                        ? []
                        : Array.isArray(MODE_PAIEMENT)
                        ? MODE_PAIEMENT
                        : typeof MODE_PAIEMENT === 'object'
                        ? Object.entries(MODE_PAIEMENT).map(([key, value]) => ({
                            value: key,
                            label:
                              typeof value === 'object'
                                ? value.label || value.name || String(value)
                                : String(value),
                          }))
                        : []
                    }
                    onChange={(value) => {
                      setValue('mode_paiement', value);
                    }}
                    error={errors.mode_paiement_pen?.message}
                    placeholder="Sélectionnez un mode de paiement"
                  />

                  {watch('mode_paiement') && watch('mode_paiement') != 1 && (
                    <>
                      <TextField
                        label="N° Paiement"
                        name="numero_paiement"
                        value={watch('numero_paiement')}
                        required={watch('mode_paiement') != '1'}
                        control={control}
                        errors={errors}
                        backendErrors={{}}
                      />

                      <Autocomplete
                        label="Banque:"
                        name="banque_id"
                        required={watch('mode_paiement') != '1'}
                        options={banques}
                        value={watch('banque_id')}
                        control={control}
                        errors={{}}
                        backendErrors={{}}
                        onChange={(e) => {
                          setValue('banque_id', e.id);
                        }}
                        choix="nom"
                      />

                      {watch('mode_paiement') &&
                        !['1', '5', '6'].includes(watch('mode_paiement')) && (
                          <TextField
                            label="Échéance"
                            name="echeance"
                            value={watch('echeance')}
                            control={control}
                            required={
                              watch('mode_paiement') != 1 &&
                              watch('mode_paiement') != 6 &&
                              watch('mode_paiement') != 5
                            }
                            errors={errors}
                            backendErrors={{}}
                            type="date"
                          />
                        )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
