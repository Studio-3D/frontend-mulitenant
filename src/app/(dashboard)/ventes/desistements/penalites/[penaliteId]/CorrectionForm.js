'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import TextField from '@/components/Textfield';
import Autocomplete from '@/components/Autocomplete';
import {
  MODE_PAIEMENT,
  modes_penalites,
  getModePenaliteCode,
  getModePenaliteLabel,
} from '@/configs/enum';
import Button from '@/components/Button';

const CorrectionForm = ({
  penalite,
  setPenalite,
  banques,
  loadingSave,
  onSubmit,
  onCancel,
  sumAvances,
  prix,
  user,
  codeRes,
}) => {
  // Form methods
  const methods = useForm({
    defaultValues: {
      mode_penalite_value: getModePenaliteLabel(penalite.mode_penalite),
      mode_penalite: getModePenaliteCode(penalite.mode_penalite),
      penalite_montant: penalite.montant,
      penalite_par: penalite.penalite_par || 'avance',
      sr_pen: penalite.sr || false,
      mode_paiement_pen: penalite.mode_paiement,
      banque_pen: penalite.banque_id,
      numero_paiement_pen: penalite.numero_paiement,
      echeance_pen: penalite.echeance,
    },
  });

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;
  const [selectedFiles, setSelectedFiles] = useState(
    penalite?.piece_jointes ? penalite?.piece_jointes : []
  );

  const handlechange_mode_penalite = (code) => {
    const selectedMode = modes_penalites[code];
    console.log('Selected Mode:', selectedMode.label);

    if (selectedMode) {
      setValue('mode_penalite', getModePenaliteCode(selectedMode.label));
      setValue(
        'mode_penalite_value',
        modes_penalites[selectedMode.code]?.label
      );

      // Calculate penalty amount
      if (selectedMode.value != 'Montant') {
        const percentage = parseFloat(selectedMode.label);
        if (watch('penalite_par') == 'prix') {
          setValue('penalite_montant', (prix * percentage) / 100);
        } else {
          setValue('penalite_montant', (sumAvances * percentage) / 100);
        }
      }
    }
  };

  const handlechange_penalite = (event) => {
    const selectedType = event.target.value; // "prix" or "avance"
    setValue('penalite_par', selectedType);

    // Recalculate only if a penalty mode is selected and it's not "Montant"
    const currentMode = watch('mode_penalite');
    if (currentMode && currentMode != 'Montant') {
      const percentage = parseFloat(currentMode);
      const amount = selectedType == 'prix' ? prix : sumAvances;

      setValue('penalite_montant', (amount * percentage) / 100);
    }
  };
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const getFileIcon = (filename) => {
    const extension = filename?.split('.').pop().toLowerCase();
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
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      mode_penalite: watch('mode_penalite_value'),
      penalite_montant: watch('penalite_montant'),
      penalite_par: watch('penalite_par'),
      sr_pen: watch('sr_pen'),
      mode_paiement_pen: watch('mode_paiement_pen'),
      banque_pen: watch('banque_pen'),
      numero_paiement_pen: watch('numero_paiement_pen'),
      echeance_pen: watch('echeance_pen'),
      files: selectedFiles,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className=" py-4 px-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Mode Pénalité Dropdown */}
          <div className="flex-1 min-w-[200px] mt-1">
            <AutocompleteSelectComponent
              label="Mode Pénalité"
              name="mode_penalite"
              value={watch('mode_penalite')}
              control={control}
              options={modes_penalites}
              errors={errors}
              onChange={(value) => handlechange_mode_penalite(value)}
            />
          </div>
          {/* Conditional Fields */}
          {watch('mode_penalite') && (
            <>
              {watch('mode_penalite') == 'Montant' ||
              watch('mode_penalite') == '13' ? (
                <div className="flex-1 min-w-[200px] mt-3">
                  <TextField
                    label="Pénalité Montant "
                    name="penalite_montant"
                    type="number"
                    value={watch('penalite_montant')}
                    control={control}
                    errors={{}}
                    backendErrors={{}}
                    required
                    onChange={(e) =>
                      setValue('penalite_montant', e.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col md:flex-row gap-4 items-center">
                  {/* Radio Buttons (Prix/Avance) */}
                  <div className="min-w-[220px]">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Pénalité Par
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="penalite_par"
                            value="prix"
                            checked={watch('penalite_par') == 'prix'}
                            onChange={handlechange_penalite}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2">Prix</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="penalite_par"
                            value="avance"
                            checked={watch('penalite_par') == 'avance'}
                            onChange={handlechange_penalite}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2">Avance</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Auto-Calculated Penalty Amount */}
                  <div className="min-w-[180px]">
                    <TextField
                      label="Montant"
                      name="penalite_montant"
                      type="number"
                      control={control}
                      errors={errors}
                      backendErrors={{}}
                      required
                      disabled
                      value={watch('penalite_montant') || ''}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Details Section */}
        {watch('mode_penalite') && watch('penalite_montant') != '' && (
          <div className="border-t border-gray-200 py-4">
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900">
                Mode Paiement Pénalité:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="sr_pen"
                    checked={watch('sr_pen') || false}
                    onChange={(e) =>
                      setValue('sr_pen', e.target.checked ? 1 : 0)
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Sr</span>
                </label>
              </div>

              <div>
                <AutocompleteSelectComponent
                  label="Mode de Paiement"
                  required
                  value={watch('mode_paiement_pen')}
                  name="mode_paiement_pen"
                  control={control}
                  options={MODE_PAIEMENT}
                  errors={errors}
                  onChange={(value) => setValue('mode_paiement_pen', value)}
                />
              </div>
            </div>

            {watch('mode_paiement_pen') && watch('mode_paiement_pen') != 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Autocomplete
                    label="Banque:"
                    name="banque_pen"
                    required={watch('mode_paiement_pen') != '1'}
                    options={banques}
                    value={watch('banque_pen')}
                    control={control}
                    errors={{}}
                    backendErrors={{}}
                    onChange={(e) => {
                      setValue('banque_pen', e.id);
                    }}
                    choix="nom"
                  />
                </div>

                <div>
                  <TextField
                    label="N° Paiement:"
                    name="numero_paiement_pen"
                    type="number"
                    control={control}
                    errors={errors}
                    backendErrors={{}}
                    required
                    onChange={(e) =>
                      setValue('numero_paiement_pen', e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {watch('mode_paiement_pen') &&
              watch('mode_paiement_pen') != 1 &&
              watch('mode_paiement_pen') != 5 &&
              watch('mode_paiement_pen') != 6 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <TextField
                      label="Echéance:"
                      name="echeance_pen"
                      type="date"
                      control={control}
                      errors={errors}
                      backendErrors={{}}
                      required
                      onChange={(e) => setValue('echeance_pen', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        {/* File Attachment Section */}
        <div className="border-t border-gray-200 py-4 mt-2">
          <div className="mt-6">
            <div className="space-y-4">
              <TextField
                label="Fichiers de Pénalités:"
                control={control}
                errors={{}}
                backendErrors={{}}
                defaultValues={{}}
                name="files"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
              />

              {selectedFiles.length > 0 && (
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
                    Fichiers sélectionnés ({selectedFiles.length})
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                        >
                          <div className="flex items-center mb-2">
                            {getFileIcon(file.fichier || file.name)}
                            <a
                              href={
                                file.fichier
                                  ? `${process.env.NEXT_PUBLIC_IMG_URL}/Docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/penalites/${codeRes}/${file.fichier}`
                                  : URL.createObjectURL(file.file)
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                              title={file.fichier || file.name}
                            >
                              {file.fichier || file.name}
                            </a>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
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
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="submit" loading={loadingSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CorrectionForm;
