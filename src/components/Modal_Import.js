'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Printer } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';
import { APIURL, RESOURCE_URL } from '../configs/api';
import { useAuth } from '../context/AuthContext';
import { useSociete } from '../context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';

export default function Modal_Import({ onClose, title, route }) {
  const { selectedProjet } = useProjet();
  const projet_id = selectedProjet?.id;
  const { token, user } = useAuth();
  const { selectedSociete } = useSociete();

  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorRows, setErrorRows] = useState([]);

  const handleFileClick = () => {
    if (selectedSociete?.raison_sociale_concatene && selectedSociete?.id) {
      window.open(
        `${RESOURCE_URL.DOCS}/import_prospect.xlsx`,
        '_blank'
      );
    } else {
      toast.error('Société non sélectionnée');
    }
  };

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if (!phone) return { isValid: false, error: 'Numéro de téléphone manquant' };
    
    // Convert to string and remove spaces
    const phoneStr = String(phone).trim();
    
    // Remove non-digit characters but keep + if present
    const cleanPhone = phoneStr.replace(/\s+/g, '');
    
    // Check minimum length (9 digits)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      return { isValid: false, error: 'Numéro trop court (min 9 chiffres)' };
    }
    
    // Check for valid international formats
    const patterns = [
      /^(\+212|00212|212)[5-9]\d{8}$/, // Morocco
      /^(\+33|0033|0)[1-9](\d{2}){4}$/, // France
      /^(\+1|001|1)\d{10}$/, // USA/Canada
      /^(\+44|0044|0)[1-9]\d{9}$/, // UK
      /^0[5-9]\d{8}$/, // Morocco local (06, 07, etc.)
      /^0[1-9](\d{2}){4}$/, // France local
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
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and header is row 1
      const rowErrors = [];

      // Validate telephone column
      if (row.telephone) {
        const phoneValidation = validatePhoneNumber(row.telephone);
        if (!phoneValidation.isValid) {
          rowErrors.push({
            column: 'telephone',
            error: phoneValidation.error
          });
        }
      }

      // Validate telephone_num2 if present
      if (row.telephone_num2) {
        const phoneValidation2 = validatePhoneNumber(row.telephone_num2);
        if (!phoneValidation2.isValid) {
          rowErrors.push({
            column: 'telephone_num2',
            error: phoneValidation2.error
          });
        }
      }

      // Validate required fields
      if (!row.nom || String(row.nom).trim() === '') {
        rowErrors.push({
          column: 'nom',
          error: 'Le nom est requis'
        });
      }

      if (!row.prenom || String(row.prenom).trim() === '') {
        rowErrors.push({
          column: 'prenom',
          error: 'Le prénom est requis'
        });
      }

      // Validate email format if present
      if (row.email && row.email.trim() !== '') {
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

          // Validate data before sending
          const validationResult = validateExcelData(jsonData);
          
          if (validationResult.errors.length > 0) {
            setValidationErrors(validationResult.errors);
            setErrorRows(validationResult.errorRowsData);
            toast.error(`Erreurs de validation trouvées dans ${validationResult.errors.length} ligne(s)`);
            return;
          }

          // If no validation errors, send to backend
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

    axios({
      method: 'post',
      url: `${APIURL.ROOTV1}/${route}`,
      data: { jsonData, projet_id },
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setLoading({ ...loading, form: false });
        setFile(null);
        
        if (res.status === 200) {
          toast.success('Le fichier est importé avec succès');
          onClose();
          localStorage.setItem('load_data_prospect', 1);
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

  // Clear validation errors when new file is selected
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setValidationErrors([]);
    setErrorRows([]);
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      {/* Header */}
      <div className="w-full h-[90px] bg-[#231651] px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Importer des {title}
          </h1>
        </div>
      </div>

      <div className="p-4 w-full max-w-[800px]">
        <form
          onSubmit={(e) => onSubmit_file(e)}
          className="mt-4 mx-auto w-full flex flex-col items-center"
        >
          {/* Row for Input and Printer */}
          <div className="flex items-center space-x-2 w-full max-w-[600px]">
            {/* File Input */}
            <input
              type="file"
              id="file-input"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full p-2 border rounded mb-2"
            />

            {/* Printer Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="p-2"
                title="Fichier Exemplaire"
                aria-label="Clear"
                onClick={() => handleFileClick()}
              >
                <Printer className="text-blue-500 w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="w-full max-w-[600px] mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                        Colonne
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Erreur
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
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-red-800">
                          <ul className="list-disc pl-4">
                            {errorRow.errors.map((err, errIndex) => (
                              <li key={errIndex}>{err.column}</li>
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
                            <strong>Nom:</strong> {errorRow.data.nom || 'N/A'} <br />
                            <strong>Prénom:</strong> {errorRow.data.prenom || 'N/A'} <br />
                            <strong>Tél:</strong> {errorRow.data.telephone || 'N/A'} <br />
                            <strong>Tél2:</strong> {errorRow.data.telephone_num2 || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-3 text-sm text-red-600">
                <p className="font-medium">Formats téléphone acceptés:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Maroc: +2126XXXXXXXX, 002126XXXXXXXX, 2126XXXXXXXX, 06XXXXXXXX</li>
                  <li>France: +33X XX XX XX XX, 0033X XX XX XX XX, 0X XX XX XX XX</li>
                  <li>Autres pays: Formats internationaux standards (+code pays)</li>
                  <li>Minimum 9 chiffres après le code pays</li>
                </ul>
              </div>
            </div>
          )}

          <div className="w-full max-w-[600px]">
            {backendErrors != null && (
              <p className="!text-red-600 text-sm mb-2">{backendErrors}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 w-full max-w-[600px]">
            <Button type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading.form || validationErrors.length > 0}
              loading={loading.form}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}