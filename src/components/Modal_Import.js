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
  //        `${RESOURCE_URL.DOCS}/${selectedSociete.raison_sociale_concatene}_${selectedSociete.id}/reclamations/exemple.xlsx`,

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

  const onSubmit_file = (e) => {
    e.preventDefault();

    // setDisabled_var(true)
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

          // Convert the sheet to JSON format
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          console.log(jsonData);
          sendDataToBackend(jsonData);
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error importing file:', error);
      }
    }
  };

  const sendDataToBackend = async (jsonData) => {
    if (file == null) {
      toast.error('Le fichier est requis');
      return;
    }

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

      <div className="p-4 w-[600px]">
        <form
          onSubmit={(e) => onSubmit_file(e)}
          className="mt-4 mx-auto w-full max-w-[360px] flex flex-col items-center"
        >
          {/* Row for Input and Printer */}
          <div className="flex items-center space-x-2 w-full">
            {/* File Input */}
            <input
              type="file"
              id="file-input"
              accept=".xlsx"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
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

          <div className="w-full">
            {backendErrors != null && (
              <p className="!text-red-600 text-sm mb-2">{backendErrors}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading.form}
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
