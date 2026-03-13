import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import TextField from '@/components/Textfield';
import { PlusSquare, Trash2, X } from 'lucide-react';
import Button1 from '../Button';
import InputSelect from '../inputSelect';
import { useProjet } from '@/context/ProjetContext';

export default function BienImport({
  open,
  onClose,
  projetId,
  max_etages,
  tranches,
  tranche_id_get,
  hasTranches,
  hasBlocs,
  hasImmeubles
}) {

  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState([]);
  const [disabled_var, setDisabled_var] = useState(true);
  const fileInputRef = useRef(null);
  const [inputs, setInputs] = useState([{ type: '' }]);
  const [type_biens, setTypesBiens] = useState([]);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const accessToken = localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();
 // const selectedProjet = JSON.parse(localStorage.getItem("selectedProjet"));
  var err = 0;
  const [backendErrors_tp, setBackendErrors_tp] = useState(null);
  const [loading, setLoading] = useState({ form: false });

  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;

  const handleDialogToggle = () => {
    setFile(null);
    setSelectedTranche(null);
    onClose();
    setDisabled_var(false);
    setBackendErrors([]);
    setBackendErrors_tp(null);
  };

  const onSubmit_file = (e) => {
    e.preventDefault();

    // Only validate tranche selection if tranche_id_get doesn't exist
    if (hasTranches && !selectedTranche && !tranche_id_get) {
      toast.error('Veuillez sélectionner une tranche');
      return;
    }

    if (file != null) {
      console.log('File upload confirmed:', file);
      handleImportClick(file);
    }
  };

  /*const hasTranches = selectedProjet?.nbre_tranches > 0;
  const hasBlocs = selectedProjet?.nbre_blocs > 0;
  const hasImmeubles = selectedProjet?.nbre_immeubles > 0;*/

  const handleImportClick = async (file) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        let rows = XLSX.utils.sheet_to_json(sheet);

        // Priority: tranche_id_get > selectedTranche
        if (tranche_id_get) {
          rows = rows.map((row) => ({
            ...row,
            tranche_id: tranche_id_get,
          }));
          console.log('Rows with tranche_id from prop:', rows);
        } else if (hasTranches && selectedTranche) {
          rows = rows.map((row) => ({
            ...row,
            tranche_id: selectedTranche.value,
          }));
          console.log('Rows with tranche_id from select:', rows);
        }

        const rawHeaders = jsonData[0] || [];
        const normalizedHeaders = rawHeaders.map((h) =>
          h?.toString().trim().toLowerCase()
        );
        console.log('Headers Excel normalisés :', normalizedHeaders);

        let msg_error = [];

        let requiredHeaders = [
          'numero',
          'prix unitaire',
          'superficie totale',
          'superficie habitable',
          'type bien',
        ];
        if (hasBlocs || hasTranches || hasImmeubles) {
          requiredHeaders.push('etage');
        }

        /* if (hasTranches) {
          requiredHeaders.push('tranche');
        } else if (normalizedHeaders.includes('Tranche')) {
          msg_error.push({
            id: 0,
            msg: `Le projet ne contient pas de tranches, mais la colonne "Tranche" est présente dans le fichier Excel. Supprime-la.`,
          });
        }*/

        if (hasBlocs) {
          requiredHeaders.push('bloc');
        } else if (normalizedHeaders.includes('Bloc')) {
          msg_error.push({
            id: 0,
            msg: `Le projet ne contient pas de blocs, mais la colonne "Bloc" est présente dans le fichier Excel. Supprime-la.`,
          });
        }

        if (hasImmeubles) {
          requiredHeaders.push('immeuble');
        } else if (normalizedHeaders.includes('Immeuble')) {
          msg_error.push({
            id: 0,
            msg: `Le projet ne contient pas d'immeubles, mais la colonne "Immeuble" est présente dans le fichier Excel. Supprime-la.`,
          });
        }

        const missingHeaders = requiredHeaders.filter(
          (h) => !normalizedHeaders.includes(h)
        );
        if (missingHeaders.length > 0) {
          msg_error.push({
            id: 0,
            msg: `Les colonnes suivantes sont manquantes dans le fichier Excel : ${missingHeaders.join(
              ', '
            )}`,
          });
        }

        if (rows.length > 0) {
          let err = 0;
          setBackendErrors([]);
          setDisabled_var(false);

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if ('Superficie totale' in row && 'Superficie habitable' in row) {
              if (
                row['Superficie totale'] == 0 &&
                row['Superficie habitable'] == 0
              ) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${
                    i + 1
                  } ne dispose d'aucune surface existante, qu'elle soit habitable ou totale.`,
                });
                err = 1;
              }
            } else if (
              !('Superficie totale' in row) &&
              'Superficie habitable' in row
            ) {
              if (row['Superficie habitable'] == 0) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${
                    i + 1
                  } doit avoir une superficie supérieure à 0.`,
                });
                err = 1;
              }
            } else if (
              !('Superficie habitable' in row) &&
              'Superficie totale' in row
            ) {
              if (row['Superficie totale'] == 0) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${
                    i + 1
                  } doit avoir une superficie supérieure à 0.`,
                });
                err = 1;
              }
            } else {
              msg_error.push({
                id: i,
                msg: `La ligne ${
                  i + 1
                } ne dispose d'aucune surface existante, qu'elle soit habitable ou totale.`,
              });
              err = 1;
            }
          }

          if (err == 1 || msg_error.length > 0) {
            setBackendErrors(msg_error);
            setDisabled_var(true);
          } else {
            sendDataToBackend(rows);
            setDisabled_var(false);
          }
        } else {
          setBackendErrors([
            {
              id: 1,
              msg: 'Le fichier est vide. Veuillez renseigner les colonnes.',
            },
          ]);
          setDisabled_var(true);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erreur lors de l'import du fichier :", error);
    }
  };

  const sendDataToBackend = async (jsonData) => {
    if (err == 0) {
      onClose();
      const dataToSend = new FormData();
      dataToSend.append('projet_id', projetId);
      dataToSend.append('jsonData', JSON.stringify(jsonData));

      if (file != null) {
        dataToSend.append('piece_jointe', file);
      }
      axios
        .post(`${APIURL.ROOT}/v1/upload_excel_bien`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        .then(() => {
          setDisabled_var(false);
          toast.success(
            `Import programmé avec succès, consulter l'historique des imports pour plus de détails`
          );
          setBackendErrors([]);
        })
        .catch((err) => {
          const response = err.response;
          toast.error(response?.data?.error);
        });
    }
  };

  const handleFileClick = () => {
    let fileName = '';

    /*if (hasTranches && hasBlocs && hasImmeubles) {
      fileName = 'exemplaire_tranches_blocs_immeubles.xlsx';
    } else if (hasTranches && hasBlocs) {
      fileName = 'exemplaire_tranches_blocs.xlsx';
    } else if (hasTranches && hasImmeubles) {
      fileName = 'exemplaire_tranches_immeubles.xlsx';
    } else if (hasBlocs && hasImmeubles) {
      fileName = 'exemplaire_blocs_immeubles.xlsx';
    } else if (hasTranches) {
      fileName = 'exemplaire_tranches.xlsx';
    } else if (hasBlocs) {
      fileName = 'exemplaire_blocs.xlsx';
    } else if (hasImmeubles) {
      fileName = 'exemplaire_immeubles.xlsx';
    } else if (!hasTranches && !hasBlocs && !hasImmeubles) {
      fileName = 'exemplaire_biens.xlsx';
    } else {
      return;
    }*/

    if (hasBlocs && hasImmeubles) {
      fileName = 'exemplaire_blocs_immeubles.xlsx';
    } else if (hasBlocs) {
      fileName = 'exemplaire_blocs.xlsx';
    } else if (hasImmeubles) {
      fileName = 'exemplaire_immeubles.xlsx';
    }else if (hasTranches && !hasBlocs && !hasImmeubles) {
      fileName = 'exemplaire_biens.xlsx';
    } else if (!hasTranches && !hasBlocs && !hasImmeubles) {
      fileName = 'exemplaire_biens.xlsx';
    } else {
      return;
    }

    window.open(
      `${RESOURCE_URL.DOCS}/exemplaires-import-biens/${fileName}`,
      '_blank'
    );
  };

  const handleChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...inputs];
    onChangeValue[index][name] = value;
    setInputs(onChangeValue);

    // Clear backend errors when user starts typing
    if (backendErrors_tp && value.trim() !== '') {
      setBackendErrors_tp(null);
    }
  };

  const handleDeleteInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
  };

  const handleAddInput = () => {
    setInputs([...inputs, { type: '' }]);
  };

  // Validate that all type inputs are filled
  const validateTypeInputs = () => {
    const emptyInputs = inputs.filter(
      (input) => !input.type || input.type.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmit_type_bien = () => {
    // First check if all inputs are filled
    if (!validateTypeInputs()) {
      setBackendErrors_tp(
        'Veuillez remplir tous les types de biens avant de enregistrer.'
      );
      return;
    }

    // Then check for duplicates
    const dupli = [];
    const seenTypes = new Set();

    inputs.forEach((input) => {
      const type = input.type?.toLowerCase().trim();
      if (!type) return;

      if (seenTypes.has(type)) {
        if (!dupli.some((d) => d.type?.toLowerCase().trim() === type)) {
          dupli.push(input);
        }
      } else {
        seenTypes.add(type);
      }
    });

    if (dupli.length > 0) {
      setBackendErrors_tp(
        'Veuillez corriger les doublons présents dans la liste.'
      );
      return;
    }

    setBackendErrors_tp(null);
    setLoading((prev) => ({ ...prev, form: true }));

    const formData = new FormData();
    formData.append('donneesTypeBien', JSON.stringify(inputs));
    formData.append('projet_id', selectedProjet?.id);

    axios
      .post(`${APIURL.ROOTV1}/store_multiple_type_biens`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        setTypesBiens(res.data.type_biens);
        setDisabled_var(false);

        if (res.status === 200) {
          toast.success('Types des Biens créés avec succès');
          // Clear the inputs after successful submission
          setInputs([{ type: '' }]);
        } else if (res.status === 422) {
          setBackendErrors_tp(res.data.errors);
          setTimeout(() => setBackendErrors_tp({}), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response?.status === 422) {
          setBackendErrors_tp(response.data.errors);
          setTimeout(() => setBackendErrors_tp({}), 5000);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
        }
      })
      .finally(() => setLoading((prev) => ({ ...prev, form: false })));
  };

  const isSubmitDisabled = () => {
    const noTypesBiens =
      Object.keys(selectedProjet?.types_bien || {}).length === 0 &&
      type_biens.length === 0;

    // Only require tranche selection if tranche_id_get is not provided
    const trancheRequiredButNotSelected =
      hasTranches && !selectedTranche && !tranche_id_get;

    return disabled_var || noTypesBiens || trancheRequiredButNotSelected;
  };
  // Check if all type inputs are filled for the Enregistrer button
  const areAllTypesFilled = validateTypeInputs();

  if (!selectedProjet) {
    return <p>Chargement du projet...</p>;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-8 py-5 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-white text-xl">Importer des Biens</h1>
            <button
              onClick={handleDialogToggle}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Model Excel Info */}
        <div className="flex items-center justify-between bg-blue-100 border border-blue-300 rounded mx-6 mt-2 px-4 py-3 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-800">
            <p className="font-bold">📄 Modèle Excel :</p>
            <p className="text-sm">
              Utilisez ce fichier comme référence pour le format d{"'"}
              importation.
            </p>
          </div>
          <Button1
            variant="contained"
            size="small"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleFileClick}
          >
            Télécharger le modèle
          </Button1>
        </div>

        {/* Content */}
        <div className="bg-blue-50 px-10 py-8">
          <form
            onSubmit={onSubmit_file}
            className="flex flex-col items-center w-full max-w-3xl mx-auto gap-6"
          >
             {hasTranches && (
              <>
                {tranches?.length > 0 ? (
                  <InputSelect
                    label="Tranche"
                    options={tranches.map((t) => ({
                      label: t.nom,
                      value: t.id,
                    }))}
                    value={selectedTranche?.value}
                    onChange={(option) => {
                      setSelectedTranche(option);
                    }}
                    error={null}
                    required
                  />
                ) : (
                  <>
                    {!tranche_id_get ? (
                      <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded w-full">
                        <p className="text-center">
                          Merci d{"'"}ajouter une tranche en cliquant sur le
                          lien suivant{' '}
                          <a
                            href={`/tranches/ajouter?projet=${selectedProjet?.id}`}
                            className="text-red-600 underline"
                          >
                            Lien
                          </a>
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}

            {/* Info Alert */}
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded w-full">
              <p className="text-center">
                Merci de renseigner les colonnes avec les attributs
                correspondants.
              </p>
            </div>

            {/* Types des Biens Section */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">
                Types des Biens:
              </p>
              {Object.keys(selectedProjet?.types_bien).length > 0 ||
              type_biens.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="px-4 py-2">Type de Bien</th>
                      <th className="px-4 py-2">
                        Nombre à renseigner dans le fichier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-100">
                    {selectedProjet?.types_bien &&
                      Object.keys(selectedProjet.types_bien).map((key) => (
                        <tr key={key} className="border-b">
                          <td className="px-4 py-2">
                            {selectedProjet.types_bien[key].type}
                          </td>
                          <td className="px-4 py-2">
                            {selectedProjet.types_bien[key].id}
                          </td>
                        </tr>
                      ))}
                    {type_biens.map((key) => (
                      <tr key={key.id} className="border-b">
                        <td className="px-4 py-2">{key.type}</td>
                        <td className="px-4 py-2">{key.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p className="text-center">
                      Veuillez ajouter les types de biens pour ce projet.
                    </p>
                  </div>

                  {inputs.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 mt-4 w-full"
                    >
                      <label className="text-blue-800 whitespace-nowrap">
                        Type : {index + 1}{' '}
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <TextField
                        label=""
                        name="type"
                        type="text"
                        value={item.type}
                        control={false}
                        errors={{}}
                        backendErrors={null}
                        onChange={(e) => handleChange(e, index)}
                        width="w-full"
                        placeholder={`Entrez le type de bien ${index + 1}`}
                      />
                      {inputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteInput(index)}
                          className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                      {index === inputs.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddInput}
                          className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"
                        >
                          <PlusSquare size={20} />
                        </button>
                      )}
                    </div>
                  ))}

                  {backendErrors_tp && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                      <p className="text-red-600 font-medium">
                        {backendErrors_tp}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4 w-full">
                    <Button1
                      type="traite_rdv"
                      variant="contained"
                      onClick={handleSubmit_type_bien}
                      disabled={loading.form || !areAllTypesFilled}
                      className={`${
                        loading.form || !areAllTypesFilled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {loading.form ? 'Enregistrement...' : 'Enregistrer'}
                    </Button1>
                  </div>
                </>
              )}
            </div>

            {max_etages > 0 && (
              <>
                <hr className="w-full border-t border-gray-300 my-4" />

                <div className="w-full">
                  <p className="text-indigo-700 font-semibold mb-2">Étages:</p>
                  <table className="min-w-full bg-white rounded shadow text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2">Étage</th>
                        <th className="px-4 py-2">
                          Nombre à renseigner dans le fichier
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-blue-100">
                      <tr>
                        <td className="px-4 py-2">0</td>
                        <td className="px-4 py-2">RDC</td>
                      </tr>
                      {Array.from({ length: max_etages }, (_, i) => i + 1).map(
                        (floor) => (
                          <tr key={floor}>
                            <td className="px-4 py-2">{floor}</td>
                            <td className="px-4 py-2">
                              {floor === 1 ? '1er étage' : `${floor}ème étage`}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* Calculs automatiques table */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">
                Calculs automatiques:
              </p>
              <table className="min-w-full bg-white rounded shadow text-sm text-left">
                <thead className="bg-amber-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Colonne</th>
                    <th className="px-4 py-2">Calcul automatique si vide</th>
                  </tr>
                </thead>
                <tbody className="bg-amber-50">
                  <tr className="border-b border-amber-200">
                    <td className="px-4 py-2 font-medium">
                      Superficie balcon calculée
                    </td>
                    <td className="px-4 py-2">Superficie balcon ÷ 2</td>
                  </tr>
                  <tr className="border-b border-amber-200">
                    <td className="px-4 py-2 font-medium">
                      Superficie jardin calculée
                    </td>
                    <td className="px-4 py-2">Superficie jardin ÷ 2</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">
                      Superficie terrasse calculée
                    </td>
                    <td className="px-4 py-2">Superficie terrasse ÷ 2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* File Input Section */}
            <div className="w-full">
              <TextField
                control={false}
                label="Fichier Excel"
                name="file"
                type="file"
                accept=".xlsx,.xls"
                value={file}
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);
                  if (
                    Object.keys(selectedProjet.types_bien).length === 0 &&
                    type_biens.length === 0
                  ) {
                    setDisabled_var(true);
                  } else {
                    setDisabled_var(false);
                  }
                }}
                width="w-full"
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  Fichier sélectionné: {file.name}
                </p>
              )}
            </div>

            {backendErrors && backendErrors.length > 0 && (
              <div className="text-red-500 w-full bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold mb-2">Erreurs détectées:</p>
                {backendErrors.map((err, i) => (
                  <p key={i} className="text-sm">
                    • {err.msg}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-4 justify-end w-full mt-6">
              <Button1
                type="submit"
                variant="contained"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isSubmitDisabled()}
              >
                Importer
              </Button1>
              <Button1
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleDialogToggle}
              >
                Annuler
              </Button1>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
