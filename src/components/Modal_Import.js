'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Printer, Upload, PlusSquare, Trash2, X, Loader2 } from 'lucide-react';
import Button from './Button';
import TextField from '@/components/Textfield';
import toast from 'react-hot-toast';
import { APIURL, RESOURCE_URL } from '../configs/api';
import { useAuth } from '../context/AuthContext';
import { useSociete } from '../context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';
import { fetchData_Select, fetchDataByProjet } from '@/configs/api-utils';

export default function Modal_Import({ onClose, title, route }) {
  const { selectedProjet } = useProjet();
  const projet_id = selectedProjet?.id;
  const { token, user } = useAuth();
  const { selectedSociete } = useSociete();
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  
  // Sources states (similar to type_biens)
  const [sourceInputs, setSourceInputs] = useState([{ source: '' }]);
  const [sourceList, setSourceList] = useState([]);
  const [sourceBackendErrors, setSourceBackendErrors] = useState(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceFetching, setSourceFetching] = useState(true); // Loading spinner for fetching sources
  
  // Partenaires states (similar to type_biens)
  const [partenaireInputs, setPartenaireInputs] = useState([{ description: '', remise: '' }]);
  const [partenaireList, setPartenaireList] = useState([]);
  const [partenaireBackendErrors, setPartenaireBackendErrors] = useState(null);
  const [partenaireLoading, setPartenaireLoading] = useState(false);
  const [partenaireFetching, setPartenaireFetching] = useState(true); // Loading spinner for fetching partenaires

  const [loading_auto, setLoading_auto] = useState(false);
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorRows, setErrorRows] = useState([]);
  const [disabled_var, setDisabled_var] = useState(true);

  const handleFileClick = () => {
    if (selectedSociete?.raison_sociale_concatene && selectedSociete?.id) {
      window.open(
        `${RESOURCE_URL.DOCS}/import_prospects.xlsx`,
        '_blank'
      );
    } else {
      toast.error('Société non sélectionnée');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setSourceFetching(true);
      setPartenaireFetching(true);
      
      try {
        await fetchData_Select('sources', setSources, setLoading_auto);
        await fetchDataByProjet('partenaires', setPartenaires, setLoading_auto);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setSourceFetching(false);
        setPartenaireFetching(false);
      }
    };
    
    fetchData();
  }, [selectedProjet]);

  // Source handlers
  const handleSourceChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...sourceInputs];
    onChangeValue[index][name] = value;
    setSourceInputs(onChangeValue);

    if (sourceBackendErrors && value.trim() !== '') {
      setSourceBackendErrors(null);
    }
  };

  const handleDeleteSourceInput = (index) => {
    const newArray = [...sourceInputs];
    newArray.splice(index, 1);
    setSourceInputs(newArray);
  };

  const handleAddSourceInput = () => {
    setSourceInputs([...sourceInputs, { source: '' }]);
  };

  const validateSourceInputs = () => {
    const emptyInputs = sourceInputs.filter(
      (input) => !input.source || input.source.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmitSource = () => {
    if (!validateSourceInputs()) {
      setSourceBackendErrors(
        'Veuillez remplir toutes les sources avant de enregistrer.'
      );
      return;
    }

    const dupli = [];
    const seenTypes = new Set();

    sourceInputs.forEach((input) => {
      const source = input.source?.toLowerCase().trim();
      if (!source) return;

      if (seenTypes.has(source)) {
        if (!dupli.some((d) => d.source?.toLowerCase().trim() === source)) {
          dupli.push(input);
        }
      } else {
        seenTypes.add(source);
      }
    });

    if (dupli.length > 0) {
      setSourceBackendErrors(
        'Veuillez corriger les doublons présents dans la liste.'
      );
      return;
    }

    setSourceBackendErrors(null);
    setSourceLoading(true);

    const formData = new FormData();
    formData.append('donneesSource', JSON.stringify(sourceInputs));
    formData.append('projet_id', selectedProjet?.id);

    axios
      .post(`${APIURL.ROOTV1}/store_multiple_sources`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        setSourceList(res.data.sources);
        setDisabled_var(false);

        if (res.status === 200) {
          toast.success('Sources créées avec succès');
          setSourceInputs([{ source: '' }]);
        } else if (res.status === 422) {
          setSourceBackendErrors(res.data.errors);
          setTimeout(() => setSourceBackendErrors(null), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response?.status === 422) {
          setSourceBackendErrors(response.data.errors);
          setTimeout(() => setSourceBackendErrors(null), 5000);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
        }
      })
      .finally(() => setSourceLoading(false));
  };

  // Partenaire handlers
  const handlePartenaireChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...partenaireInputs];
    onChangeValue[index][name] = value;
    setPartenaireInputs(onChangeValue);

    if (partenaireBackendErrors && value.trim() !== '') {
      setPartenaireBackendErrors(null);
    }
  };

  const handleDeletePartenaireInput = (index) => {
    const newArray = [...partenaireInputs];
    newArray.splice(index, 1);
    setPartenaireInputs(newArray);
  };

  const handleAddPartenaireInput = () => {
    setPartenaireInputs([...partenaireInputs, { description: '' }]);
  };

  const validatePartenaireInputs = () => {
    const emptyInputs = partenaireInputs.filter(
      (input) => !input.description || input.description.trim() === ''
    );
    return emptyInputs.length === 0;
  };

  const handleSubmitPartenaire = () => {
    if (!validatePartenaireInputs()) {
      setPartenaireBackendErrors(
        'Veuillez remplir toutes les descriptions de partenaires avant de enregistrer.'
      );
      return;
    }

    const dupli = [];
    const seenTypes = new Set();

    partenaireInputs.forEach((input) => {
      const description = input.description?.toLowerCase().trim();
      if (!description) return;

      if (seenTypes.has(description)) {
        if (!dupli.some((d) => d.description?.toLowerCase().trim() === description)) {
          dupli.push(input);
        }
      } else {
        seenTypes.add(description);
      }
    });

    if (dupli.length > 0) {
      setPartenaireBackendErrors(
        'Veuillez corriger les doublons présents dans la liste.'
      );
      return;
    }

    setPartenaireBackendErrors(null);
    setPartenaireLoading(true);

    const formData = new FormData();
    formData.append('donneesPartenaire', JSON.stringify(partenaireInputs));
    formData.append('projet_id', selectedProjet?.id);

    axios
      .post(`${APIURL.ROOTV1}/store_multiple_partenaires`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        setPartenaireList(res.data.partenaires);
        setDisabled_var(false);

        if (res.status === 200) {
          toast.success('Partenaires créés avec succès');
          setPartenaireInputs([{ description: ''}]);
        } else if (res.status === 422) {
          setPartenaireBackendErrors(res.data.errors);
          setTimeout(() => setPartenaireBackendErrors(null), 5000);
        }
      })
      .catch((error) => {
        const response = error.response;
        if (response?.status === 422) {
          setPartenaireBackendErrors(response.data.errors);
          setTimeout(() => setPartenaireBackendErrors(null), 5000);
        } else {
          toast.error(
            "Une erreur s'est produite lors de la soumission du formulaire."
          );
        }
      })
      .finally(() => setPartenaireLoading(false));
  };

  // Validation functions for Excel data
  const validatePhoneNumber = (phone) => {
    if (!phone) return { isValid: false, error: 'Numéro de téléphone manquant' };
    
    const phoneStr = String(phone).trim();
    const cleanPhone = phoneStr.replace(/\s+/g, '');
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    
    if (digitsOnly.length < 9) {
      return { isValid: false, error: 'Numéro trop court (min 9 chiffres)' };
    }
    
    const patterns = [
      /^(\+212|00212|212)[5-9]\d{8}$/,
      /^(\+33|0033|0)[1-9](\d{2}){4}$/,
      /^(\+1|001|1)\d{10}$/,
      /^(\+44|0044|0)[1-9]\d{9}$/,
      /^0[5-9]\d{8}$/,
      /^0[1-9](\d{2}){4}$/,
    ];
    
    const isValid = patterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Format invalide. Formats acceptés: +212, 00212, 212, 0X (Maroc), +33, 0033, 0X (France), etc.' 
      };
    }
    
    return { isValid: true, error: null };
  };

const validateExcelData = (jsonData) => {
  const errors = [];
  const errorRowsData = [];

  jsonData.forEach((row, index) => {
    const rowNumber = index + 2;
    const rowErrors = [];

    // Helper function to check if a field is empty
    const isEmpty = (value) => {
      return value === undefined || 
             value === null || 
             (typeof value === 'string' && value.trim() === '') ||
             (typeof value === 'number' && isNaN(value));
    };

    // NEW VALIDATION: Check if at least one telephone exists
    const hasTelephone = !isEmpty(row.telephone);
    const hasTelephone2 = !isEmpty(row.telephone_num2);
    
    if (!hasTelephone && !hasTelephone2) {
      rowErrors.push({
        column: 'telephone / telephone_num2',
        error: 'Au moins un numéro de téléphone (Téléphone ou Téléphone 2) est requis'
      });
    }

    // Validate source (should be numeric ID)
    const sourceValue = row.source;
    if (!isEmpty(sourceValue)) {
      if (!isNaN(parseFloat(sourceValue)) && isFinite(sourceValue)) {
        // Check if source ID exists in existing sources
        const existingSources = [...sources, ...sourceList];
        const sourceExists = existingSources.some(s => s.id === parseInt(sourceValue));
        if (!sourceExists) {
          rowErrors.push({
            column: 'source',
            error: `ID source ${sourceValue} n'existe pas`
          });
        }
      } else {
        rowErrors.push({
          column: 'source',
          error: `La colonne "Source" doit contenir un ID numérique valide (ex: 1, 2, 3). Valeur actuelle: "${sourceValue}"`
        });
      }
    }

    // Validate partenaire (should be numeric ID)
    const partenaireValue = row.partenaire;
    if (!isEmpty(partenaireValue)) {
      if (!isNaN(parseFloat(partenaireValue)) && isFinite(partenaireValue)) {
        const existingPartenaires = [...partenaires, ...partenaireList];
        const partenaireExists = existingPartenaires.some(p => p.id === parseInt(partenaireValue));
        if (!partenaireExists) {
          rowErrors.push({
            column: 'partenaire',
            error: `ID partenaire ${partenaireValue} n'existe pas`
          });
        }
      } else {
        rowErrors.push({
          column: 'partenaire',
          error: `La colonne "Partenaire" doit contenir un ID numérique valide (ex: 1, 2, 3). Valeur actuelle: "${partenaireValue}"`
        });
      }
    }

    // Validate telephone if present
    if (hasTelephone) {
      const phoneValidation = validatePhoneNumber(row.telephone);
      if (!phoneValidation.isValid) {
        rowErrors.push({
          column: 'telephone',
          error: phoneValidation.error
        });
      }
    }

    // Validate telephone_num2 if present
    if (hasTelephone2) {
      const phoneValidation2 = validatePhoneNumber(row.telephone_num2);
      if (!phoneValidation2.isValid) {
        rowErrors.push({
          column: 'telephone_num2',
          error: phoneValidation2.error
        });
      }
    }

    // Validate required fields
    if (isEmpty(row.nom)) {
      rowErrors.push({
        column: 'nom',
        error: 'Le nom est requis'
      });
    }

    if (isEmpty(row.prenom)) {
      rowErrors.push({
        column: 'prenom',
        error: 'Le prénom est requis'
      });
    }

    // Validate email format if present
    if (!isEmpty(row.email)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        rowErrors.push({
          column: 'email',
          error: 'Format email invalide'
        });
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        errors: rowErrors
      });
      
      errorRowsData.push({
        row: rowNumber,
        data: row,
        errors: rowErrors
      });
    }
  });

  return { errors, errorRowsData };
};
  const onSubmit_file = (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    console.log('File upload confirmed:', file);
    handleImportClick(file);
  };

  const handleImportClick = async (file) => {
    if (file) {
      try {
        const XLSX = await import('xlsx');
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          console.log('Parsed data:', jsonData);
      // Debug: Check each row for telephone fields
              jsonData.forEach((row, index) => {
                console.log(`Row ${index + 2}:`, {
                  telephone: row.telephone,
                  telephone_num2: row.telephone_num2,
                  telephone_type: typeof row.telephone,
                  telephone_num2_type: typeof row.telephone_num2,
                  isEmpty_telephone: row.telephone === undefined || row.telephone === null || row.telephone === '',
                  isEmpty_telephone2: row.telephone_num2 === undefined || row.telephone_num2 === null || row.telephone_num2 === ''
                });
              });
          const validationResult = validateExcelData(jsonData);
          
          if (validationResult.errors.length > 0) {
            setValidationErrors(validationResult.errors);
            setErrorRows(validationResult.errorRowsData);
            toast.error(`Erreurs de validation trouvées dans ${validationResult.errors.length} ligne(s)`);
            return;
          }

          setValidationErrors([]);
          setErrorRows([]);
          sendDataToBackend(jsonData);
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Erreur lors de la lecture du fichier');
      }
    }
  };

  const sendDataToBackend = async (jsonData) => {
    setLoading({ ...loading, form: true });
    setBackendErrors(null);
      const dataToSend = new FormData();
      dataToSend.append('projet_id', projet_id);
      dataToSend.append('jsonData', JSON.stringify(jsonData));
        if (file != null) {
          dataToSend.append('piece_jointe', file);
        }
      axios
        .post(`${APIURL.ROOTV1}/${route}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data', // This is important for FormData
          },
        })
      .then((res) => {
        setLoading({ ...loading, form: false });
        setFile(null);
        
        if (res.status === 200) {
          toast.success(
            `Import programmé avec succès, consulter l'historique des imports pour plus de détails`
          );      
          onClose();
          //localStorage.setItem('load_data_prospect', 1);
        }
      })
      .catch((error) => {
        setLoading({ ...loading, form: false });

        const response = error.response;
        if (response?.status === 422) {
          setBackendErrors(response.data.message || {});
          toast.error(response.data.message || 'Erreur de validation.');
          setTimeout(() => setBackendErrors(null), 5000);
        } else {
          toast.error("Une erreur s'est produite.");
        }
      });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setValidationErrors([]);
    setErrorRows([]);
  };

  const areAllSourcesFilled = validateSourceInputs();
  const areAllPartenairesFilled = validatePartenaireInputs();

  const isSubmitDisabled = () => {
    const noSources = sources.length === 0 && sourceList.length === 0;
    const noPartenaires = partenaires.length === 0 && partenaireList.length === 0;
    return disabled_var || noSources || noPartenaires;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-8 py-5 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-white text-xl">
              Importer des {title}
            </h1>
            <button
              onClick={onClose}
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
          <Button
            variant="contained"
            size="small"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleFileClick}
          >
            Télécharger le modèle
          </Button>
        </div>

        {/* Content */}
        <div className="bg-blue-50 px-10 py-8">
          <form
            onSubmit={onSubmit_file}
            className="flex flex-col items-center w-full max-w-3xl mx-auto gap-6"
          >
            {/* Sources Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-700 font-semibold">
                  Sources:
                </p>
                {sourceFetching && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Chargement...</span>
                  </div>
                )}
              </div>
              
              {sourceFetching ? (
                <div className="flex items-center justify-center p-8 bg-white rounded shadow">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Chargement des sources...</span>
                </div>
              ) : sources.length > 0 || sourceList.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="px-4 py-2">Source</th>
                      <th className="px-4 py-2">
                        ID à renseigner dans le fichier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-100">
                    {sources.map((source) => (
                      <tr key={source.id} className="border-b">
                        <td className="px-4 py-2">{source.source}</td>
                        <td className="px-4 py-2">{source.id}</td>
                      </tr>
                    ))}
                    {sourceList.map((source) => (
                      <tr key={source.id} className="border-b">
                        <td className="px-4 py-2">{source.source}</td>
                        <td className="px-4 py-2">{source.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p className="text-center">
                      Veuillez ajouter les sources pour ce projet.
                    </p>
                  </div>

                  {sourceInputs.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 mt-4 w-full"
                    >
                      <label className="text-blue-800 whitespace-nowrap">
                        Source : {index + 1}{' '}
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <TextField
                        label=""
                        name="source"
                        type="text"
                        value={item.source}
                        control={false}
                        errors={{}}
                        backendErrors={null}
                        onChange={(e) => handleSourceChange(e, index)}
                        width="w-full"
                        placeholder={`Entrez la source ${index + 1}`}
                      />
                      {sourceInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSourceInput(index)}
                          className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                      {index === sourceInputs.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddSourceInput}
                          className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"
                        >
                          <PlusSquare size={20} />
                        </button>
                      )}
                    </div>
                  ))}

                  {sourceBackendErrors && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                      <p className="text-red-600 font-medium">
                        {sourceBackendErrors}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4 w-full">
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleSubmitSource}
                      disabled={sourceLoading || !areAllSourcesFilled}
                      className={`${
                        sourceLoading || !areAllSourcesFilled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {sourceLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </div>
                      ) : (
                        'Enregistrer'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Partenaires Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-700 font-semibold">
                  Partenaires:
                </p>
                {partenaireFetching && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Chargement...</span>
                  </div>
                )}
              </div>
              
              {partenaireFetching ? (
                <div className="flex items-center justify-center p-8 bg-white rounded shadow">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Chargement des partenaires...</span>
                </div>
              ) : partenaires.length > 0 || partenaireList.length > 0 ? (
                <table className="min-w-full bg-white rounded shadow text-sm text-left">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="px-4 py-2">Partenaire</th>
                      <th className="px-4 py-2">
                        ID à renseigner dans le fichier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-100">
                    {partenaires.map((partenaire) => (
                      <tr key={partenaire.id} className="border-b">
                        <td className="px-4 py-2">{partenaire.description}</td>
                        <td className="px-4 py-2">{partenaire.id}</td>
                      </tr>
                    ))}
                    {partenaireList.map((partenaire) => (
                      <tr key={partenaire.id} className="border-b">
                        <td className="px-4 py-2">{partenaire.description}</td>
                        <td className="px-4 py-2">{partenaire.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <p className="text-center">
                      Veuillez ajouter les partenaires pour ce projet.
                    </p>
                  </div>

                  {partenaireInputs.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 mt-4 w-full"
                    >
                      <label className="text-blue-800 whitespace-nowrap">
                        Partenaire : {index + 1}{' '}
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <TextField
                        label=""
                        name="description"
                        type="text"
                        value={item.description}
                        control={false}
                        errors={{}}
                        backendErrors={null}
                        onChange={(e) => handlePartenaireChange(e, index)}
                        width="w-full"
                        placeholder={`Description du partenaire ${index + 1}`}
                      />
                  
                      {partenaireInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePartenaireInput(index)}
                          className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                      {index === partenaireInputs.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddPartenaireInput}
                          className="text-green-600 hover:text-green-800 p-1 flex-shrink-0"
                        >
                          <PlusSquare size={20} />
                        </button>
                      )}
                    </div>
                  ))}

                  {partenaireBackendErrors && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                      <p className="text-red-600 font-medium">
                        {partenaireBackendErrors}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4 w-full">
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleSubmitPartenaire}
                      disabled={partenaireLoading || !areAllPartenairesFilled}
                      className={`${
                        partenaireLoading || !areAllPartenairesFilled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {partenaireLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enregistrement...</span>
                        </div>
                      ) : (
                        'Enregistrer'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* File Input Section */}
            <div className="w-full">
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="file"
                  id="file-input"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="w-full p-2 border rounded mb-2"
                />
              </div>
            </div>

            {/* Validation Errors Display */}
            {/* Validation Errors Display */}
{validationErrors.length > 0 && (
  <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-lg font-semibold text-red-700 mb-2">
      Erreurs de validation ({validationErrors.length} ligne(s) avec erreurs):
    </h3>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-red-200">
        <thead className="bg-red-100">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
              Ligne
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
              Colonne(s)
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
              Erreur(s)
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
              Données
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-red-100">
          {errorRows.map((errorRow, index) => (
            <tr key={index} className="hover:bg-red-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-900">
                {errorRow.row}
              </td>
              <td className="px-4 py-2 text-sm text-red-800">
                <ul className="list-disc pl-4">
                  {errorRow.errors.map((err, errIndex) => (
                    <li key={errIndex}>
                      {err.column === 'telephone / telephone_num2' ? (
                        <span className="font-medium">Téléphone ou Téléphone 2</span>
                      ) : (
                        err.column
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-2 text-sm text-red-800">
                <ul className="list-disc pl-4">
                  {errorRow.errors.map((err, errIndex) => (
                    <li key={errIndex}>{err.error}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                <div className="truncate max-w-xs">
                  <strong>Nom:</strong> {errorRow.data.nom || ' '} <br />
                  <strong>Prénom:</strong> {errorRow.data.prenom || ''} <br />
                  <strong>Tél 1:</strong> {errorRow.data.telephone || ''} <br />
                  <strong>Tél 2:</strong> {errorRow.data.telephone_num2 || ''} <br />
                  <strong>Source ID:</strong> {errorRow.data.source || ''} <br />
                  <strong>Partenaire ID:</strong> {errorRow.data.partenaire || ''}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

            {backendErrors != null && (
              <div className="w-full">
                <p className="text-red-600 text-sm mb-2">{backendErrors}</p>
              </div>
            )}
            
            <div className="flex gap-4 justify-end w-full mt-6">
              <Button
                type="submit"
                variant="contained"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={validationErrors.length>0}
                loading={loading.form}
              >
                Importer
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={onClose}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}