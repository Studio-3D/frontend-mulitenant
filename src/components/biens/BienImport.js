import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import TextField from '@/components/Textfield';
import { PlusSquare, Trash2, X, Upload } from 'lucide-react';
import Button1 from '../Button';
import InputSelect from '../inputSelect';
import { useProjet } from '@/context/ProjetContext';
import { ORIENTATIONS } from '@/configs/enum';

export default function BienImport({
  open,
  onClose,
  projetId,
  max_etages,
  tranches,
  tranche_id_get,
  hasTranches,
  hasBlocs,
  hasImmeubles, typologies_get, vues_get, typeBiens
}) {
  console.log('typologies===>' + JSON.stringify(typologies_get));

  // Récupérer les orientations depuis ORIENTATIONS avec le bon mapping
  const orientationList = [
    { code: 1, label: 'Nord', value: 'N' },
    { code: 2, label: 'Sud', value: 'S' },
    { code: 3, label: 'Est', value: 'E' },
    { code: 4, label: 'Ouest', value: 'O' },
    { code: 5, label: 'Nord-Est', value: 'N_E' },
    { code: 6, label: 'Nord-Ouest', value: 'N_O' },
    { code: 7, label: 'Sud-Est', value: 'S_E' },
    { code: 8, label: 'Sud-Ouest', value: 'S_O' },
    { code: 9, label: 'Nord / Sud', value: 'NORD_SUD' },
    { code: 10, label: 'Nord-Ouest', value: 'NORD_OUEST' },
    { code: 11, label: 'Sud-Est', value: 'SUD_EST' },
    { code: 12, label: 'Est / Ouest', value: 'EST_OUEST' },
    { code: 13, label: 'Nord-Ouest / Sud-Est', value: 'NO_SE' },
    { code: 14, label: 'Nord / Sud / Ouest', value: 'NORD_SUD_OUEST' },
    { code: 15, label: 'Nord / Sud / Est', value: 'NORD_SUD_EST' },
    { code: 16, label: 'Nord / Est / Ouest', value: 'NORD_EST_OUEST' }
  ];

  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState([]);
  const [disabled_var, setDisabled_var] = useState(true);
  const fileInputRef = useRef(null);
  
  // Type biens states
  const [inputs, setInputs] = useState([{ type: '' }]);
  const [type_biens, setTypesBiens] = useState([]);
  
  // Typologies states
  const [typologiesInputs, setTypologiesInputs] = useState([{ typologie: '' }]);
  const [typologies, setTypologies] = useState([]);
  const [typologiesBackendErrors, setTypologiesBackendErrors] = useState(null);
  const [typologiesLoading, setTypologiesLoading] = useState(false);
  
  // Vues states
  const [vuesInputs, setVuesInputs] = useState([{ vue: '' }]);
  const [vues, setVues] = useState([]);
  const [vuesBackendErrors, setVuesBackendErrors] = useState(null);
  const [vuesLoading, setVuesLoading] = useState(false);

  const [selectedTranche, setSelectedTranche] = useState(null);
  const accessToken = localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();
  const [isDragging, setIsDragging] = useState(false);
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
    setTypologiesBackendErrors(null);
    setVuesBackendErrors(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit_file = (e) => {
    e.preventDefault();

    if (hasTranches && !selectedTranche && !tranche_id_get) {
      toast.error('Veuillez sélectionner une tranche');
      return;
    }

    if (file != null) {
      console.log('File upload confirmed:', file);
      handleImportClick(file);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      droppedFile.type === 'application/vnd.ms-excel')) {
      setFile(droppedFile);
      setBackendErrors([]);
      
      if (Object.keys(selectedProjet.types_bien).length === 0 && type_biens.length === 0) {
        setDisabled_var(true);
      } else {
        setDisabled_var(false);
      }
    } else {
      toast.error('Veuillez déposer un fichier Excel valide (.xlsx, .xls)');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setBackendErrors([]);
      setDisabled_var(false);
      
      if (Object.keys(selectedProjet.types_bien).length === 0 && type_biens.length === 0) {
        setDisabled_var(true);
      } else {
        setDisabled_var(false);
      }
    }
  };

  // Validation functions
  const validateTypologie = (value) => {
    if (!value || value === '') return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const validateVue = (value) => {
    if (!value || value === '') return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const validateTypeBien = (value) => {
    if (!value || value === '') return true;
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const validateEtage = (value) => {
    if (!value || value === '') return true;
    const normalizedValue = value.toString().trim().toLowerCase();
    if (normalizedValue === 'rdc') return true;
    if (normalizedValue === '1er étage' || normalizedValue === '1er etage') return true;
    if (/^\d+[èe]me étage$/.test(normalizedValue)) return true;
    if (!isNaN(parseFloat(value)) && isFinite(value)) return true;
    return false;
  };

  const handleClearFile = () => {
    setFile(null);
    setBackendErrors([]);
    setDisabled_var(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

        if (tranche_id_get) {
          rows = rows.map((row) => ({
            ...row,
            tranche_id: tranche_id_get,
          }));
        } else if (hasTranches && selectedTranche) {
          rows = rows.map((row) => ({
            ...row,
            tranche_id: selectedTranche.value,
          }));
        }

        const rawHeaders = jsonData[0] || [];
        const normalizedHeaders = rawHeaders.map((h) =>
          h?.toString().trim().toLowerCase()
        );

        let msg_error = [];

        let requiredHeaders = [
          'numero',
          'prix unitaire',
          'superficie vendable',
          'superficie habitable',
          'superficie architecte',
          'type bien',
        ];
        if (hasBlocs || hasTranches || hasImmeubles) {
          requiredHeaders.push('etage');
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
            msg: `Le projet ne contient pas d'immeubles, mais la colonne "Immeuble" est présente dans le fichier Excel. Supprime-la.`,
          });
        }

        const missingHeaders = requiredHeaders.filter(
          (h) => !normalizedHeaders.includes(h)
        );
        if (missingHeaders.length > 0) {
          msg_error.push({
            id: 0,
            msg: `Les colonnes suivantes sont manquantes dans le fichier Excel : ${missingHeaders.join(', ')}`,
          });
        }

        if (rows.length > 0) {
          let hasError = false;
          setBackendErrors([]);
          setDisabled_var(false);

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row['Prix unitaire'] || row['Prix unitaire'] === '' || parseFloat(row['Prix unitaire']) <= 0) {
              msg_error.push({
                id: i,
                msg: `La ligne ${i + 1} doit avoir un prix unitaire supérieur à 0.`,
              });
              hasError = true;
            }

            if ('Superficie architecte' in row && 'Superficie habitable' in row) {
              if (row['Superficie architecte'] == 0 && row['Superficie habitable'] == 0) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${i + 1} ne dispose d'aucune surface existante, qu'elle soit habitable ou architecte.`,
                });
                hasError = true;
              }
            } else if (!('Superficie architecte' in row) && 'Superficie habitable' in row) {
              if (row['Superficie habitable'] == 0) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${i + 1} doit avoir une superficie supérieure à 0.`,
                });
                hasError = true;
              }
            } else if (!('Superficie habitable' in row) && 'Superficie architecte' in row) {
              if (row['Superficie architecte'] == 0) {
                msg_error.push({
                  id: i,
                  msg: `La ligne ${i + 1} doit avoir une superficie supérieure à 0.`,
                });
                hasError = true;
              }
            } else {
              msg_error.push({
                id: i,
                msg: `La ligne ${i + 1} ne dispose d'aucune surface existante.`,
              });
              hasError = true;
            }

            const typologieValue = row['Typologie'];
            if (typologieValue && !validateTypologie(typologieValue)) {
              msg_error.push({
                id: i,
                msg: `Ligne ${i + 1} : "Typologie" doit être un ID numérique (ex: 1, 2, 3). Valeur: "${typologieValue}"`,
              });
              hasError = true;
            }

            const vueValue = row['Vue'];
            if (vueValue && !validateVue(vueValue)) {
              msg_error.push({
                id: i,
                msg: `Ligne ${i + 1} : "Vue" doit être un ID numérique (ex: 1, 2, 3). Valeur: "${vueValue}"`,
              });
              hasError = true;
            }

            const typeBienValue = row['Type bien'];
            if (typeBienValue && !validateTypeBien(typeBienValue)) {
              msg_error.push({
                id: i,
                msg: `Ligne ${i + 1} : "Type bien" doit être un ID numérique (ex: 1, 2, 3). Valeur: "${typeBienValue}"`,
              });
              hasError = true;
            }

            const etageValue = row['Etage'];
            if (etageValue && !validateEtage(etageValue)) {
              msg_error.push({
                id: i,
                msg: `Ligne ${i + 1} : "Etage" invalide (ex: RDC, 1er étage, 2ème étage). Valeur: "${etageValue}"`,
              });
              hasError = true;
            }
          }

          if (hasError || msg_error.length > 0) {
            setBackendErrors(msg_error);
            setDisabled_var(true);
          } else {
            sendDataToBackend(rows);
            setDisabled_var(false);
          }
        } else {
          setBackendErrors([
            { id: 1, msg: 'Le fichier est vide. Veuillez renseigner les colonnes.' },
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
    if (hasBlocs && hasImmeubles) {
      fileName = 'exemplaire_blocs_immeubles.xlsx';
    } else if (hasBlocs) {
      fileName = 'exemplaire_blocs.xlsx';
    } else if (hasImmeubles) {
      fileName = 'exemplaire_immeubles.xlsx';
    } else if (hasTranches && !hasBlocs && !hasImmeubles) {
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

  // Type bien handlers
  const handleTypeBienChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...inputs];
    onChangeValue[index][name] = value;
    setInputs(onChangeValue);
    if (backendErrors_tp && value.trim() !== '') {
      setBackendErrors_tp(null);
    }
  };

  const handleDeleteTypeBienInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
  };

  const handleAddTypeBienInput = () => {
    setInputs([...inputs, { type: '' }]);
  };

  const validateTypeBienInputs = () => {
    const emptyInputs = inputs.filter(
      (input) => !input.type || input.type.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmitTypeBien = () => {
    if (!validateTypeBienInputs()) {
      setBackendErrors_tp('Veuillez remplir tous les types de biens avant de enregistrer.');
      return;
    }
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
      setBackendErrors_tp('Veuillez corriger les doublons présents dans la liste.');
      return;
    }
    setBackendErrors_tp(null);
    setLoading((prev) => ({ ...prev, form: true }));
    const formData = new FormData();
    formData.append('donneesTypeBien', JSON.stringify(inputs));
    formData.append('projet_id', selectedProjet?.id);
    axios
      .post(`${APIURL.ROOTV1}/store_multiple_type_biens`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      .then((res) => {
        setTypesBiens(res.data.type_biens);
        setDisabled_var(false);
        if (res.status === 200) {
          toast.success('Types des Biens créés avec succès');
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
          toast.error("Une erreur s'est produite lors de la soumission du formulaire.");
        }
      })
      .finally(() => setLoading((prev) => ({ ...prev, form: false })));
  };

  // Typologie handlers
  const handleTypologieChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...typologiesInputs];
    onChangeValue[index][name] = value;
    setTypologiesInputs(onChangeValue);
    if (typologiesBackendErrors && value.trim() !== '') {
      setTypologiesBackendErrors(null);
    }
  };

  const handleDeleteTypologieInput = (index) => {
    const newArray = [...typologiesInputs];
    newArray.splice(index, 1);
    setTypologiesInputs(newArray);
  };

  const handleAddTypologieInput = () => {
    setTypologiesInputs([...typologiesInputs, { typologie: '' }]);
  };

  const validateTypologieInputs = () => {
    const emptyInputs = typologiesInputs.filter(
      (input) => !input.typologie || input.typologie.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmitTypologie = () => {
    if (!validateTypologieInputs()) {
      setTypologiesBackendErrors('Veuillez remplir toutes les typologies avant de enregistrer.');
      return;
    }
    const dupli = [];
    const seenTypes = new Set();
    typologiesInputs.forEach((input) => {
      const typologie = input.typologie?.toLowerCase().trim();
      if (!typologie) return;
      if (seenTypes.has(typologie)) {
        if (!dupli.some((d) => d.typologie?.toLowerCase().trim() === typologie)) {
          dupli.push(input);
        }
      } else {
        seenTypes.add(typologie);
      }
    });
    if (dupli.length > 0) {
      setTypologiesBackendErrors('Veuillez corriger les doublons présents dans la liste.');
      return;
    }
    setTypologiesBackendErrors(null);
    setTypologiesLoading(true);
    const formData = new FormData();
    formData.append('donneesTypologie', JSON.stringify(typologiesInputs));
    formData.append('projet_id', selectedProjet?.id);
    axios
      .post(`${APIURL.ROOTV1}/store_multiple_typologies`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      .then((res) => {
        setTypologies(res.data.typologies);
        setDisabled_var(false);
        if (res.status === 200) {
          toast.success('Typologies créées avec succès');
          setTypologiesInputs([{ typologie: '' }]);
        } else if (res.status === 422) {
          setTypologiesBackendErrors(res.data.errors);
          setTimeout(() => setTypologiesBackendErrors(null), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response?.status === 422) {
          setTypologiesBackendErrors(response.data.errors);
          setTimeout(() => setTypologiesBackendErrors(null), 5000);
        } else {
          toast.error("Une erreur s'est produite lors de la soumission du formulaire.");
        }
      })
      .finally(() => setTypologiesLoading(false));
  };

  // Vue handlers
  const handleVueChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...vuesInputs];
    onChangeValue[index][name] = value;
    setVuesInputs(onChangeValue);
    if (vuesBackendErrors && value.trim() !== '') {
      setVuesBackendErrors(null);
    }
  };

  const handleDeleteVueInput = (index) => {
    const newArray = [...vuesInputs];
    newArray.splice(index, 1);
    setVuesInputs(newArray);
  };

  const handleAddVueInput = () => {
    setVuesInputs([...vuesInputs, { vue: '' }]);
  };

  const validateVueInputs = () => {
    const emptyInputs = vuesInputs.filter(
      (input) => !input.vue || input.vue.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmitVue = () => {
    if (!validateVueInputs()) {
      setVuesBackendErrors('Veuillez remplir toutes les vues avant de enregistrer.');
      return;
    }
    const dupli = [];
    const seenTypes = new Set();
    vuesInputs.forEach((input) => {
      const vue = input.vue?.toLowerCase().trim();
      if (!vue) return;
      if (seenTypes.has(vue)) {
        if (!dupli.some((d) => d.vue?.toLowerCase().trim() === vue)) {
          dupli.push(input);
        }
      } else {
        seenTypes.add(vue);
      }
    });
    if (dupli.length > 0) {
      setVuesBackendErrors('Veuillez corriger les doublons présents dans la liste.');
      return;
    }
    setVuesBackendErrors(null);
    setVuesLoading(true);
    const formData = new FormData();
    formData.append('donneesVue', JSON.stringify(vuesInputs));
    formData.append('projet_id', selectedProjet?.id);
    axios
      .post(`${APIURL.ROOTV1}/store_multiple_vues`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      .then((res) => {
        setVues(res.data.vues);
        setDisabled_var(false);
        if (res.status === 200) {
          toast.success('Vues créées avec succès');
          setVuesInputs([{ vue: '' }]);
        } else if (res.status === 422) {
          setVuesBackendErrors(res.data.errors);
          setTimeout(() => setVuesBackendErrors(null), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response?.status === 422) {
          setVuesBackendErrors(response.data.errors);
          setTimeout(() => setVuesBackendErrors(null), 5000);
        } else {
          toast.error("Une erreur s'est produite lors de la soumission du formulaire.");
        }
      })
      .finally(() => setVuesLoading(false));
  };

  const isSubmitDisabled = () => {
    const noTypesBiens = Object.keys(selectedProjet?.types_bien || {}).length === 0 && type_biens.length === 0;
    const trancheRequiredButNotSelected = hasTranches && !selectedTranche && !tranche_id_get;
    return disabled_var || noTypesBiens || trancheRequiredButNotSelected;
  };

  const areAllTypesFilled = validateTypeBienInputs();
  const areAllTypologiesFilled = validateTypologieInputs();
  const areAllVuesFilled = validateVueInputs();

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
            <button onClick={handleDialogToggle} className="text-white hover:text-gray-200 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Model Excel Info */}
        <div className="flex items-center justify-between bg-blue-100 border border-blue-300 rounded mx-6 mt-2 px-4 py-3 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-800">
            <p className="font-bold">📄 Modèle Excel :</p>
            <p className="text-sm">Utilisez ce fichier comme référence pour le format d{"'"}importation.</p>
          </div>
          <Button1 variant="contained" size="small" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleFileClick}>
            Télécharger le modèle
          </Button1>
        </div>

        {/* Content */}
        <div className="bg-blue-50 px-10 py-8">
          <form onSubmit={onSubmit_file} className="flex flex-col items-center w-full max-w-3xl mx-auto gap-6">
            {hasTranches && (
              <>
                {tranches?.length > 0 ? (
                  <InputSelect
                    label="Tranche"
                    options={tranches.map((t) => ({ label: t.nom, value: t.id }))}
                    value={selectedTranche?.value}
                    onChange={(option) => { setSelectedTranche(option); }}
                    error={null}
                    required
                  />
                ) : (
                  <>
                    {!tranche_id_get ? (
                      <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded w-full">
                        <p className="text-center">
                          Merci d{"'"}ajouter une tranche en cliquant sur le lien suivant{' '}
                          <a href={`/tranches/ajouter?projet=${selectedProjet?.id}`} className="text-red-600 underline">Lien</a>
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}

            {/* Info Alert */}
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded w-full">
              <p className="text-center">Merci de renseigner les colonnes avec les attributs correspondants.</p>
            </div>

            {/* Types des Biens Section */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">Types des Biens:</p>
              {(typeBiens && typeBiens.length > 0) || type_biens.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white">
                    <tr><th className="px-4 py-2">Type de Bien</th><th className="px-4 py-2">ID à renseigner</th></tr>
                  </thead>
                  <tbody className="bg-blue-100">
                    {typeBiens && typeBiens.length > 0 && typeBiens.map((typeBien, index) => (
                      <tr key={typeBien.id || index} className="border-b"><td className="px-4 py-2">{typeBien.type}</td><td className="px-4 py-2">{typeBien.id}</td></tr>
                    ))}
                    {type_biens.map((typeBien, index) => (
                      <tr key={typeBien.id || index} className="border-b"><td className="px-4 py-2">{typeBien.type}</td><td className="px-4 py-2">{typeBien.id}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p className="text-center">Veuillez ajouter les types de biens pour ce projet.</p>
                  </div>
                  {inputs.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mt-4 w-full">
                      <label className="text-blue-800 whitespace-nowrap">Type : {index + 1} <span className="text-red-500 ml-1">*</span></label>
                      <TextField label="" name="type" type="text" value={item.type} control={false} errors={{}} backendErrors={null} onChange={(e) => handleTypeBienChange(e, index)} width="w-full" placeholder={`Entrez le type de bien ${index + 1}`} />
                      {inputs.length > 1 && <button type="button" onClick={() => handleDeleteTypeBienInput(index)} className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"><Trash2 size={20} /></button>}
                      {index === inputs.length - 1 && <button type="button" onClick={handleAddTypeBienInput} className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"><PlusSquare size={20} /></button>}
                    </div>
                  ))}
                  {backendErrors_tp && <div className="bg-red-50 border border-red-200 rounded p-3 mt-4"><p className="text-red-600 font-medium">{backendErrors_tp}</p></div>}
                  <div className="flex justify-end mt-4 w-full">
                    <Button1 type="button" variant="contained" onClick={handleSubmitTypeBien} disabled={loading.form || !areAllTypesFilled} className={`${loading.form || !areAllTypesFilled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                      {loading.form ? 'Enregistrement...' : 'Enregistrer'}
                    </Button1>
                  </div>
                </>
              )}
            </div>

            {/* Typologies Section */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">Typologies:</p>
              {(typologies_get && typologies_get.length > 0) || typologies.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white"><tr><th className="px-4 py-2">Typologie</th><th className="px-4 py-2">ID à renseigner</th></tr></thead>
                  <tbody className="bg-blue-100">
                    {typologies_get && typologies_get.length > 0 && typologies_get.map((typologie, index) => (
                      <tr key={typologie.id || index} className="border-b"><td className="px-4 py-2">{typologie.typologie}</td><td className="px-4 py-2">{typologie.id}</td></tr>
                    ))}
                    {typologies.map((typologie, index) => (
                      <tr key={typologie.id || index} className="border-b"><td className="px-4 py-2">{typologie.typologie}</td><td className="px-4 py-2">{typologie.id}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4"><p className="text-center">Veuillez ajouter les typologies pour ce projet.</p></div>
                  {typologiesInputs.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mt-4 w-full">
                      <label className="text-blue-800 whitespace-nowrap">Typologie : {index + 1}</label>
                      <TextField label="" name="typologie" type="text" value={item.typologie} control={false} errors={{}} backendErrors={null} onChange={(e) => handleTypologieChange(e, index)} width="w-full" placeholder={`Entrez la typologie ${index + 1}`} />
                      {typologiesInputs.length > 1 && <button type="button" onClick={() => handleDeleteTypologieInput(index)} className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"><Trash2 size={20} /></button>}
                      {index === typologiesInputs.length - 1 && <button type="button" onClick={handleAddTypologieInput} className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"><PlusSquare size={20} /></button>}
                    </div>
                  ))}
                  {typologiesBackendErrors && <div className="bg-red-50 border border-red-200 rounded p-3 mt-4"><p className="text-red-600 font-medium">{typologiesBackendErrors}</p></div>}
                  <div className="flex justify-end mt-4 w-full">
                    <Button1 type="button" variant="contained" onClick={handleSubmitTypologie} disabled={typologiesLoading || !areAllTypologiesFilled} className={`${typologiesLoading || !areAllTypologiesFilled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                      {typologiesLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button1>
                  </div>
                </>
              )}
            </div>

            {/* Vues Section */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">Vues:</p>
              {(vues_get && vues_get.length > 0) || vues.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white"><tr><th className="px-4 py-2">Vue</th><th className="px-4 py-2">ID à renseigner</th></tr></thead>
                  <tbody className="bg-blue-100">
                    {vues_get && vues_get.length > 0 && vues_get.map((vue, index) => (
                      <tr key={vue.id || index} className="border-b"><td className="px-4 py-2">{vue.vue}</td><td className="px-4 py-2">{vue.id}</td></tr>
                    ))}
                    {vues.map((vue, index) => (
                      <tr key={vue.id || index} className="border-b"><td className="px-4 py-2">{vue.vue}</td><td className="px-4 py-2">{vue.id}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4"><p className="text-center">Veuillez ajouter les vues pour ce projet.</p></div>
                  {vuesInputs.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mt-4 w-full">
                      <label className="text-blue-800 whitespace-nowrap">Vue : {index + 1}</label>
                      <TextField label="" name="vue" type="text" value={item.vue} control={false} errors={{}} backendErrors={null} onChange={(e) => handleVueChange(e, index)} width="w-full" placeholder={`Entrez la vue ${index + 1}`} />
                      {vuesInputs.length > 1 && <button type="button" onClick={() => handleDeleteVueInput(index)} className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"><Trash2 size={20} /></button>}
                      {index === vuesInputs.length - 1 && <button type="button" onClick={handleAddVueInput} className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"><PlusSquare size={20} /></button>}
                    </div>
                  ))}
                  {vuesBackendErrors && <div className="bg-red-50 border border-red-200 rounded p-3 mt-4"><p className="text-red-600 font-medium">{vuesBackendErrors}</p></div>}
                  <div className="flex justify-end mt-4 w-full">
                    <Button1 type="button" variant="contained" onClick={handleSubmitVue} disabled={vuesLoading || !areAllVuesFilled} className={`${vuesLoading || !areAllVuesFilled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                      {vuesLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button1>
                  </div>
                </>
              )}
            </div>

            {/* Orientations Guide Table */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">Orientations:</p>
              <table className="min-w-full bg-white rounded shadow text-sm text-left">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="px-4 py-2">Orientation</th>
                    <th className="px-4 py-2">Code à renseigner dans le fichier</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-100">
                  {orientationList.map((orientation) => (
                    <tr key={orientation.code} className="border-b">
                      <td className="px-4 py-2">{orientation.label}</td>
                      <td className="px-4 py-2">{orientation.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* Etages Section */}
            {max_etages > 0 && (
              <>
                <div className="w-full">
                  <p className="text-indigo-700 font-semibold mb-2">Étages:</p>
                  <table className="min-w-full bg-white rounded shadow text-sm text-left">
                    <thead className="bg-blue-500 text-white">
                      <tr><th className="px-4 py-2">Étage</th><th className="px-4 py-2">Valeur à renseigner</th></tr>
                    </thead>
                    <tbody className="bg-blue-100">
                      <tr className="border-b"><td className="px-4 py-2">0</td><td className="px-4 py-2">RDC</td></tr>
                      {Array.from({ length: max_etages }, (_, i) => i + 1).map((floor) => (
                        <tr key={floor}><td className="px-4 py-2">{floor}</td><td className="px-4 py-2">{floor === 1 ? '1er étage' : `${floor}ème étage`}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr className="w-full border-t border-gray-300 my-4" />
              </>
            )}

            {/* Calculs automatiques table */}
            <div className="w-full">
              <p className="text-indigo-700 font-semibold mb-2">Calculs automatiques:</p>
              <table className="min-w-full bg-white rounded shadow text-sm text-left">
                <thead className="bg-amber-500 text-white">
                  <tr><th className="px-4 py-2">Colonne</th><th className="px-4 py-2">Calcul automatique si vide</th></tr>
                </thead>
                <tbody className="bg-amber-50">
                  <tr className="border-b border-amber-200"><td className="px-4 py-2 font-medium">Superficie balcon calculée</td><td className="px-4 py-2">Superficie balcon ÷ 2</td></tr>
                  <tr className="border-b border-amber-200"><td className="px-4 py-2 font-medium">Superficie jardin calculée</td><td className="px-4 py-2">Superficie jardin ÷ 2</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Superficie terrasse calculée</td><td className="px-4 py-2">Superficie terrasse ÷ 2</td></tr>
                </tbody>
              </table>
            </div>

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* File Input Section */}
            <div className="w-full">
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                  ${file ? 'bg-green-50 border-green-500' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleFileSelect} />
                <div className="flex flex-col items-center justify-center gap-3">
                  <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                  {file ? (
                    <div className="relative w-full text-center">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-lg font-medium text-green-700">Fichier sélectionné</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleClearFile(); }} className="text-red-500 hover:text-red-700 transition-colors" title="Supprimer le fichier"><X size={20} /></button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                      <p className="text-xs text-gray-500">Cliquez ou glissez-déposez pour changer de fichier</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-gray-700">{isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Excel ici'}</p>
                      <p className="text-sm text-gray-500">ou cliquez pour parcourir</p>
                      <p className="text-xs text-gray-400 mt-2">Formats acceptés : .xlsx, .xls</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {backendErrors && backendErrors.length > 0 && (
              <div className="text-red-500 w-full bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold mb-2">Erreurs détectées:</p>
                {backendErrors.map((err, i) => (<p key={i} className="text-sm">• {err.msg}</p>))}
              </div>
            )}

            <div className="flex gap-4 justify-end w-full mt-6">
              <Button1 type="submit" variant="contained" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitDisabled()}>Importer</Button1>
              <Button1 type="button" variant="outlined" color="secondary" onClick={handleDialogToggle}>Annuler</Button1>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}