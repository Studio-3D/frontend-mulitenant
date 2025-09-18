import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Box } from '@mui/material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  Grid,
  IconButton,
  Button,
  Alert,
} from '@mui/material';
import { APIURL, RESOURCE_URL } from '@/configs/api';

import { PlusSquare, Trash2 } from 'lucide-react';
import Button1 from '../Button';
//import {Button as Button1} from '../Button'

export default function BienImport({ open, onClose, projetId }) {
  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState([]);
  const [disabled_var, setDisabled_var] = useState(true);
  const fileInputRef = useRef(null);
  const [inputs, setInputs] = useState([{ type: '' }]);
  const [type_biens, setTypesBiens] = useState([]);
  const accessToken = localStorage.getItem('accessToken');

  //pour consulter si errur de surface en cas d'importation
  var err = 0;
  const [backendErrors_tp, setBackendErrors_tp] = useState(null);

  const [loading, setLoading] = useState({ form: false });

  const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet'));
  //const [open, setOpen] = useState(false)
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;
  const handleDialogToggle = () => {
    setFile(null);
    onClose();
    setDisabled_var(false);
    setBackendErrors([]);
    setBackendErrors_tp(null);
  };

  const onSubmit_file = (e) => {
    e.preventDefault();

    //setDisabled_var(true)
    if (file != null) {
      console.log('File upload confirmed:', file);
      handleImportClick(file);
    }
  };

  const hasTranches = selectedProjet?.nbre_tranches > 0;
  const hasBlocs = selectedProjet?.nbre_blocs > 0;
  const hasImmeubles = selectedProjet?.nbre_immeubles > 0;

  const handleImportClick = async (file) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array
        const rows = XLSX.utils.sheet_to_json(sheet); // données avec objets

        const rawHeaders = jsonData[0] || [];
        const normalizedHeaders = rawHeaders.map((h) =>
          h?.toString().trim().toLowerCase()
        );
        console.log('Headers Excel normalisés :', normalizedHeaders);

        let msg_error = [];

        // Colonnes obligatoires (normalisées en minuscules)
        let requiredHeaders = [
          'numero',
          'prix unitaire',
          // 'superficie architecte', ← retiré si non présent
          'superficie totale',
          'superficie habitable',
          'type bien',
          'etage',
        ];

        if (hasTranches) {
          requiredHeaders.push('tranche');
        } else if (normalizedHeaders.includes('Tranche')) {
          msg_error.push({
            id: 0,
            msg: `Le projet ne contient pas de tranches, mais la colonne "Tranche" est présente dans le fichier Excel. Supprime-la.`,
          });
        }

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
            msg: `Le projet ne contient pas d’immeubles, mais la colonne "Immeuble" est présente dans le fichier Excel. Supprime-la.`,
          });
        }

        // Vérification des colonnes manquantes
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

        // Validation des lignes
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
    //si il ya aucune errur du superficie
    if (err == 0) {
      onClose();
      const dataToSend = new FormData();
      dataToSend.append('projet_id', projetId);
      dataToSend.append('jsonData', JSON.stringify(jsonData));

      //dataToSend.append('tranche_id', trancheId)
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

          //load nb tranche bloc immeuble apres store du fichier
          // localStorage.setItem('load_data_bien', 1)
          toast.success(
            `Le fichier est en cours d'importation,consulter le Menu Importation des ficiher`
          );

          setBackendErrors([]);
        })
        .catch((err) => {
          const response = err.response;
          toast.error(response?.data?.error);

          //setBackendErrors(response?.data?.error)
        });
    }
  };

  const handleFileClick = () => {
    let fileName = '';

    if (hasTranches && hasBlocs && hasImmeubles) {
      fileName = 'import_bien_tr_bl_imm.xlsx';
    } else if (hasTranches && hasBlocs) {
      fileName = 'import_bien_tr_bl.xlsx';
    } else if (hasTranches && hasImmeubles) {
      fileName = 'import_bien_tr_imm.xlsx';
    } else if (hasBlocs && hasImmeubles) {
      fileName = 'import_bien_bl_imm.xlsx';
    } else if (hasTranches) {
      fileName = 'import_bien_tr.xlsx';
    } else if (hasBlocs) {
      fileName = 'import_bien_bl.xlsx';
    } else if (hasImmeubles) {
      fileName = 'import_bien_imm.xlsx';
    } else if (!hasTranches && !hasBlocs && !hasImmeubles) {
      fileName = 'import_bien_.xlsx';
    } else {
      return; // Aucun fichier à ouvrir
    }

    window.open(`${RESOURCE_URL.DOCS}/exemplaires/${fileName}`, '_blank');
  };

  //ajouter types de biens

  const handleChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...inputs];
    onChangeValue[index][name] = value;
    setInputs(onChangeValue);
  };

  const handleDeleteInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
  };

  const handleAddInput = () => {
    setInputs([...inputs, { type: '' }]);
  };

  const style = {
    height: '30px',
    marginTop: '13px',
    marginLeft: '8px',
  };

  const handleSubmit_type_bien = () => {
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

  if (!selectedProjet) {
    return <p>Chargement du projet...</p>;
  }

  return (
    <Dialog open={open} onClose={handleDialogToggle} fullWidth maxWidth="md">
      <div className="bg-blue-600 text-white text-center px-8 py-5 rounded-t-md">
        <Typography
          variant="h4"
          component="span"
          className="font-bold text-white"
        >
          Importer des Biens
        </Typography>
      </div>
      <Box className="flex items-center justify-between bg-blue-100 border border-blue-300 rounded px-4 py-3 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-800">
          <Typography variant="body1" fontWeight="bold">
            📄 Modèle Excel :
          </Typography>
          <Typography variant="body2">
            Utilisez ce fichier comme référence pour le format {"d'"}
            importation.
          </Typography>
        </div>
        <Button
          variant="contained"
          size="small"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleFileClick}
        >
          Télécharger le modèle
        </Button>
      </Box>



      <DialogContent className="bg-blue-50 px-10 py-8">
        <form
          onSubmit={onSubmit_file}
          className="flex flex-col items-center w-full max-w-3xl mx-auto gap-6"
        >
          <Alert severity="info" className="w-full text-center">
            Merci de renseigner les colonnes avec les attributs correspondants.
          </Alert>

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
                <Alert severity="warning" className="w-full text-center">
                  Veuillez ajouter les types de biens pour ce projet.
                </Alert>

                {inputs.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 mt-4 w-full"
                  >
                    <label className="text-blue-800">Type : {index + 1}</label>
                    <TextField
                      label="Type de Bien"
                      name="type"
                      required
                      size="small"
                      fullWidth
                      variant="outlined"
                      value={item.date}
                      onChange={(e) => handleChange(e, index)}
                    />
                    {inputs.length > 1 && (
                      <Button
                        onClick={() => handleDeleteInput(index)}
                        title="Supprimer"
                        className="text-red-600"
                      >
                        <Trash2 size={20} />
                      </Button>
                    )}
                    {index === inputs.length - 1 && (
                      <Button
                        onClick={handleAddInput}
                        title="Ajouter +"
                        className="text-green-600"
                      >
                        <PlusSquare size={20} />
                      </Button>
                    )}
                  </div>
                ))}

                {backendErrors_tp && (
                  <p className="text-red-600">{backendErrors_tp}</p>
                )}

                <div className="flex justify-end mt-4 w-full">
                  <Button
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit_type_bien}
                    disabled={loading.form}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Enregistrer
                  </Button>
                </div>
              </>
            )}
          </div>

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
                <tr>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">1er étage</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">2</td>
                  <td className="px-4 py-2">2ème étage</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">3ème étage</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="w-full border-t border-gray-300 my-4" />

          {/* Calculs automatiques table */}
          <div className="w-full">
            <p className="text-indigo-700 font-semibold mb-2">Calculs automatiques:</p>
            <table className="min-w-full bg-white rounded shadow text-sm text-left">
              <thead className="bg-amber-500 text-white">
                <tr>
                  <th className="px-4 py-2">Colonne</th>
                  <th className="px-4 py-2">Calcul automatique si vide</th>
                </tr>
              </thead>
              <tbody className="bg-amber-50">
                <tr className="border-b border-amber-200">
                  <td className="px-4 py-2 font-medium">Superficie balcon calculée</td>
                  <td className="px-4 py-2">Superficie balcon ÷ 2</td>
                </tr>
                <tr className="border-b border-amber-200">
                  <td className="px-4 py-2 font-medium">Superficie jardin calculée</td>
                  <td className="px-4 py-2">Superficie jardin ÷ 2</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Superficie terrasse calculée</td>
                  <td className="px-4 py-2">Superficie terrasse ÷ 2</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="w-full border-t border-gray-300 my-4" />

          <div className="w-full flex items-center gap-4 ml-14">
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Fichier"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files[0]);
                if (
                  Object.keys(selectedProjet.types_bien).length === 0 &&
                  type_biens.length === 0
                ) {
                  setDisabled_var(true);
                } else {
                  setDisabled_var(false);
                }
              }}
              onClick={(event) => (event.target.value = null)}
              inputRef={fileInputRef}
              size="small"
            />
          </div>

          {backendErrors && backendErrors.length > 0 && (
            <div className="text-red-500 w-full">
              {backendErrors.map((err, i) => (
                <p key={i}>{err.msg}</p>
              ))}
            </div>
          )}

          <div className="flex gap-4 justify-end w-full mt-6">
            <Button1
              type="submit"
              variant="contained"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={
                disabled_var ||
                (Object.keys(selectedProjet.types_bien).length === 0 &&
                  type_biens.length === 0)
              }
            >
              Enregistrer
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
      </DialogContent>
    </Dialog>
  );
}
