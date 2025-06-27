import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import TextField from '@/components/Textfield';
import AutocompleteBien from './AutocompleteBien';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import Autocomplete from '@/components/Autocomplete';

import { APIURL } from '../../../../../../configs/api';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useAuth } from '../../../../../../context/AuthContext';
import { MODE_PAIEMENT } from '@/configs/enum';

export function Changement_De_Bien({
  formData,
  isEditing,
  selectedProjet_id,
  bien_ancien,
  sum_avances_valides,
  banques,
  filesList_avc,
}) {
  const pusher_key_proposition = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP;
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { user, token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [selectedFiles_avc, setSelectedFiles_avc] = useState([]);

  const [loading_bien_id, setLoading_bien_id] = useState(true);
  const [loading_bien, setLoading_bien] = useState(false);
  const [biensByProjet, setBiensByProjet] = useState([]);
  const [montant_a_ajouter, set_montant_a_ajouter] = useState(0);
  const [new_bien_id, set_new_bien_id] = useState(0);
  const [old_bien_id, set_old_bien_id] = useState(0);

  // Add this useEffect to pre-fill form data when in editing mode
  useEffect(() => {
    if (isEditing && formData) {
      setValue('commentaire_rejete', formData.commentaire_rejete);

      fetch_bien_ByProjet(formData?.bien_nouveau);
      set_new_bien_id(formData.bien_id_new);
      setValue('bien_id', formData.bien_id_new);
      setValue('new_bien_id', formData.bien_id_new);
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

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  // Helper functions (add these outside your component)
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const iconClass = 'w-5 h-5 flex-shrink-0 text-gray-400';

    switch (extension) {
      case 'pdf':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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
      const response = await axios.get(`${APIURL.ROOTV1}/biens/${bien_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const avance_minimale = response.data.bien.avance_minimale;
      setValue('new_avance', avance_minimale);

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
    const updatedFiles = selectedFiles_avc.filter((_, i) => i !== index);
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
          Biens disponible
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <AutocompleteBien
            name="bien_id"
            user={user}
            control={control}
            biensByProjet={uniqueBiens}
            value={watch('bien_id')}
            onChange={handlechangeBien_id}
            loading={loading_bien}
            error={errors.bien_id}
            label="Nouveau Bien"
          />
          {/* Show additional fields when a new bien is selected */}
          {new_bien_id != 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <TextField
                label="Nouvelle Avance:"
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
                required
              />
            </div>
          )}
        </div>

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
                  Sr
                </label>
              </div>
              <AutocompleteSelectComponent
                label="Mode de Paiement"
                required
                value={watch('mode_paiement')}
                name="mode_paiement"
                control={control}
                options={MODE_PAIEMENT}
                errors={errors}
                onChange={(value) => setValue('mode_paiement', value)}
              />

              {watch('mode_paiement') && watch('mode_paiement') !== 1 && (
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
                    ![1, 5, 6].includes(watch('mode_paiement')) && (
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

            <div>
              <div className="space-y-4">
                {/* File Input */}
                <div className="relative">
                  <TextField
                    label="Fichiers Paiement:"
                    control={control}
                    errors={{}}
                    backendErrors={{}}
                    defaultValues={{}}
                    name="files_avance_"
                    type="file"
                    onChange={(e) => handleFileChange(e, 2)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Specify accepted file types
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Formats acceptés: PDF, JPG, PNG, DOC (Taille max: 10MB)
                  </p>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles_avc.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Fichiers sélectionnés ({selectedFiles_avc.length})
                    </h3>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {selectedFiles_avc.map((data, index) => (
                          <div
                            key={data.id || data.name || index}
                            className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                          >
                            <div className="flex items-center mb-2">
                              {/* File icon based on type */}
                              {getFileIcon(data.name || data.fichier)}

                              <button
                                onClick={() =>
                                  data.fichier
                                    ? handleFileClick(data.fichier)
                                    : handleDownloadFile(data)
                                }
                                className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                title={data.fichier || data.name}
                              >
                                {data.fichier || data.name}
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(data.size)}
                              </span>
                              <button
                                onClick={() => handleDeleteFile(index)}
                                className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
