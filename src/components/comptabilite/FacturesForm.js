'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { useProjet } from '@/context/ProjetContext';
import { getModePaiementLabel, MODE_PAIEMENT } from '@/configs/enum';
import { Controller } from 'react-hook-form';
import Button from '../Button';

const FacturesForm = ({
  facture,
  decompteId,
  montantDecompte,
  onSave,
  onCancel,
  onFactureChange, // Add this
}) => {
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [decomptes, setDecomptes] = useState([]);
  const [banques, setBanques] = useState([]);
  const [fileFacture, setFileFacture] = useState(null);
  const [filePaiement, setFilePaiement] = useState(null);
  const [numeroUnique, setNumeroUnique] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // Create schema for form validation
  const schema = yup.object().shape({
    fournisseur_id: yup.string().required('Le fournisseur est obligatoire'),
    decompte_id: yup.string().required('Le décompte est obligatoire'),
    date_facture: yup.string().required('La date de facture est obligatoire'),
    num_facture: yup.string().required('Le numéro de facture est obligatoire'),

    taux_tva: yup.number().required('Le taux de TVA est obligatoire'),
    montant: yup.number().required('Le montant est obligatoire'),
    /* banque_id: yup.number().when('mode_paiement', {
      is: (mode) => mode && mode != 1, // Only required for certain payment modes
      then: yup.number().required('La banque est obligatoire'),
    }),*/
    date_paiement: yup.string().required('La date de paiement est obligatoire'),
    mode_paiement: yup.string().required('Le mode de paiement est obligatoire'),
    piece_jointe: yup
      .mixed()
      .test(
        'file-or-existing',
        'La pièce jointe est obligatoire',
        function (value) {
          // Access parent form values through this.parent
          const { facture, piece_jointe: existingFile } = this.parent;

          // If editing (has ID) and no new file selected, accept existing filename
          if (facture && !value && existingFile) return true;

          // Otherwise require a file
          return !!value;
        }
      ),
  });

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors: formErrors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fournisseur_id: '',
      decompte_id: decompteId || '',
      decompte_id_ancien: '',
      montant_decompte_ancien: '',
      montant_decompte: montantDecompte || '',
      numero_decompte_edit: '',
      deja_facture: 0,
      date_facture: '',
      piece_jointe: '',
      num_facture: '',
      ht: 0,
      taux_tva: null,
      tva: 0,
      retenue_garantie: 0,
      ttc: 0,
      montant: '',
      date_paiement: '',
      mode_paiement: '',
      banque_id: '',
      numero_paiement: '',
      date_echeance: '',
      pj_paiement: '',
      projet_id: selectedProjet?.id || null,
    },
  });

  // Load facture data when editing
  useEffect(() => {
    if (facture) {
      setValue('fournisseur_id', Number(facture.fournisseur_id));
      setValue('decompte_id', facture.decompte_id);
      setValue('decompte_id_ancien', facture.decompte_id);
      setValue('montant_decompte_ancien', facture.montant);
      setValue('numero_decompte_edit', facture.decompte?.numero);
      setValue('montant_decompte', facture.decompte?.montant);
      setValue(
        'deja_facture',
        facture.decompte?.factures_sum_montant - facture.montant || 0
      );
      setValue('date_facture', facture.date_facture);
      setValue('piece_jointe', facture.piece_jointe);
      setValue('num_facture', facture.num_facture);
      setValue('ht', facture.ht);
      setValue('taux_tva', facture.taux_tva);
      setValue('tva', facture.tva);
      setValue('retenue_garantie', facture.retenue_garantie);
      setValue('ttc', facture.ttc);
      setValue('montant', facture.montant);
      setValue('date_paiement', facture.date_paiement);
      setValue('mode_paiement', facture.mode_paiement);
      setValue('banque_id', Number(facture.banque_id));
      setValue('numero_paiement', facture.numero_paiement);
      setValue('date_echeance', facture.echeance);
      setValue('pj_paiement', facture.pj_paiement);
    }
  }, [facture, setValue]);

  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');

      try {
        // Fetch fournisseurs - FIX: Access the correct property in the response
        const resFournisseurs = await axios.get(
          `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/fournisseurs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedFournisseurs = resFournisseurs.data.fournisseurs || [];
        console.log('Fetched fournisseurs:', fetchedFournisseurs);
        setFournisseurs(fetchedFournisseurs);

        // Fetch decomptes
        const resDecomptes = await axios.get(
          `${APIURL.ROOT}/v1/decomptes_in_facture/${selectedProjet?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDecomptes(resDecomptes.data.decomptes || []);

        // Fetch banques
        const resBanques = await axios.get(APIURL.BANQUES, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBanques(resBanques.data.banques || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    if (selectedProjet?.id) {
      fetchData();
    }
  }, [selectedProjet]);

  // Add this useEffect to handle when decompteId is provided from parent
useEffect(() => {
  if (decompteId && decomptes.length > 0) {
    const selectedDecompte = decomptes.find(
      (d) => d.id.toString() === decompteId.toString()
    );
    
    if (selectedDecompte) {
      setValue('decompte_id', decompteId);
      setValue('montant_decompte', selectedDecompte.montant);
      setValue('deja_facture', selectedDecompte.factures_sum_montant || 0);
    }
  }
}, [decompteId, decomptes, setValue]);
  // Check if the facture number is unique
  const checkNumeroUnique = async (numero) => {
    if (!numero) return;

    try {
      const token = localStorage.getItem('accessToken');
      const id = facture ? facture.id : 0;
      const response = await axios.get(
        `${APIURL.ROOT}/v1/get_info_numero_facture_unique/${id}/${numero}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const isUnique = response.data.info_count === 0;
      setNumeroUnique(isUnique);

      if (!isUnique) {
        setAlert(
          'Le numéro que vous avez saisi appartient à une autre facture'
        );
        setDisabled(true);
      } else {
        setAlert(null);
        setDisabled(false);
      }
    } catch (err) {
      console.error('Error checking numero uniqueness:', err);
    }
  };

  // Handle file changes
  const handleFactureFileChange = (e) => {
    const file = e.target.files[0];
    setFileFacture(file);
    // Only update the value if a new file is selected
    if (file) {
      setValue('piece_jointe', file.name);
    }
  };

  const handlePaiementFileChange = (e) => {
    const file = e.target.files[0];
    setFilePaiement(file);
    // Only update the value if a new file is selected
    if (file) {
      setValue('pj_paiement', file.name);
    }
  };

  // Handle decompte selection
  const handleDecompteChange = (e) => {
    const decompteId = e.target.value;
    setValue('decompte_id', decompteId);

    const selectedDecompte = decomptes.find(
      (d) => d.id.toString() === decompteId
    );
    if (selectedDecompte) {
      setValue('montant_decompte', selectedDecompte.montant);

      // Calculate already invoiced amount
      if (facture && decompteId === facture.decompte_id.toString()) {
        // For editing: subtract the current invoice amount from total
        setValue(
          'deja_facture',
          (selectedDecompte.factures_sum_montant || 0) - facture.montant
        );
      } else {
        // For new invoices or different decompte
        setValue('deja_facture', selectedDecompte.factures_sum_montant || 0);
      }
    }
  };

  // Calculate TVA when HT or taux_tva changes
  const calculateTVA = () => {
    const ht = parseFloat(watch('ht')) || 0;
    const tauxTva = parseFloat(watch('taux_tva')) || 0;
    const retenue = parseFloat(watch('retenue_garantie')) || 0;

    const tva = ht * tauxTva;
    setValue('tva', tva);

    const ttc = ht + tva - retenue;
    setValue('ttc', ttc);
  };

  // Handle changes to fields that affect calculations
  const handleHtChange = (e) => {
    setValue('ht', parseFloat(e.target.value) || 0);
    calculateTVA();
  };

  const handleTauxTvaChange = (e) => {
    const value = e.target.value;
    // Convertir en nombre
    const taux = value === '' ? null : parseFloat(value);
    setValue('taux_tva', taux);
    calculateTVA();
  };

  const handleRetenueChange = (e) => {
    setValue('retenue_garantie', parseFloat(e.target.value) || 0);
    calculateTVA();
  };

  // Validate montant doesn't exceed limits
  const handleMontantChange = (e) => {
    const montant = parseFloat(e.target.value) || 0;
    setValue('montant', montant);

    const ttc = parseFloat(watch('ttc')) || 0;
    const montantDecompte = parseFloat(watch('montant_decompte')) || 0;

    if (montant > ttc || montant > montantDecompte) {
      setAlert(
        `Le montant saisi est supérieur au montant TTC (${ttc} DH) ou au montant du décompte (${montantDecompte} DH)`
      );
      setDisabled(true);
    } else {
      setAlert(null);
      setDisabled(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setErrors({});

    const token = localStorage.getItem('accessToken');
    const formData = new FormData();

    // Add all fields except files
    Object.keys(data).forEach((key) => {
      if (key !== 'piece_jointe' && key !== 'pj_paiement') {
        formData.append(key, data[key]);
      }
    });
    // Handle piece_jointe
    if (fileFacture) {
      formData.append('piece_jointe', fileFacture);
    } else if (facture?.piece_jointe) {
      // Send existing filename if no new file selected
      formData.append('piece_jointe', facture.piece_jointe);
    }

    // Handle pj_paiement
    if (filePaiement) {
      formData.append('pj_paiement', filePaiement);
    } else if (facture?.pj_paiement) {
      formData.append('pj_paiement', facture.pj_paiement);
    }

    // Add project ID
    if (selectedProjet?.id) {
      formData.append('projet_id', selectedProjet.id);
    } else {
      toast.error("Aucun projet n'est sélectionné");
      setLoading(false);
      return;
    }

    try {
      let url = APIURL.FACTURES;
      let method = 'post';

      if (facture) {
        url = `${url}/${facture.id}`;
        formData.append('_method', 'PATCH');
      }

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`Facture ${facture ? 'modifiée' : 'ajoutée'} avec succès`);
     // Call onSave first (closes modal and refreshes factures list)
    onSave();
    
    // If we have decompteId, call onFactureChange to refresh decompte details
    if (decompteId && onFactureChange) {
      onFactureChange();
    }
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  const modePaiement = watch('mode_paiement');
  const showBanqueFields = modePaiement && modePaiement !== '1';
  const showEcheanceField =
    showBanqueFields && modePaiement !== '5' && modePaiement !== '6';

  // Modified fournisseur dropdown section
  const renderFournisseurDropdown = () => {
    return (
      <div>
        <label className="block text-sm font-medium !text-gray-700 mb-1">
          Fournisseur <span className="text-red-500">*</span>
        </label>
        {fournisseurs.length === 0 ? (
          <select
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-100"
          >
            <option>Chargement des fournisseurs...</option>
          </select>
        ) : (
          <Controller
            name="fournisseur_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full px-3 py-2 border rounded-md ${
                  formErrors.fournisseur_id
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code} - {f.nom}
                  </option>
                ))}
              </select>
            )}
          />
        )}
        {formErrors.fournisseur_id && (
          <p className="mt-1 text-sm !text-red-500">
            {formErrors.fournisseur_id.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {facture ? 'Modifier' : 'Ajouter'} une facture
      </h2>

      {alert && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 !text-red-700">
          {alert}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Replace the Fournisseur field with our custom implementation */}
          {renderFournisseurDropdown()}

          {/* Décompte */}
         {/* Décompte */}
<div>
  <label className="block text-sm font-medium !text-gray-700 mb-1">
    Décompte <span className="text-red-500">*</span>
  </label>
  {facture && facture.decompte_id ? (
    <input
      type="text"
      value={watch('numero_decompte_edit') || ''}
      readOnly
      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
    />
  ) : decompteId ? ( // If decompteId is provided from parent
    <input
      type="text"
      value={decomptes.find(d => d.id.toString() === decompteId?.toString())?.numero || ''}
      readOnly
      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
    />
  ) : (
    <select
      {...register('decompte_id')}
      onChange={handleDecompteChange}
      className={`w-full px-3 py-2 border rounded-md ${
        formErrors.decompte_id ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Sélectionner un décompte</option>
      {decomptes.map((d) => (
        <option key={d.id} value={d.id}>
          {d.numero}
        </option>
      ))}
    </select>
  )}
  {formErrors.decompte_id && (
    <p className="mt-1 text-sm !text-red-500">
      {formErrors.decompte_id.message}
    </p>
  )}
</div>

          {/* Montant Décompte */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Montant Décompte
            </label>
            <input
              type="text"
              value={watch('montant_decompte') || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>

          {/* Déjà Facturé */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Déjà Facturé
            </label>
            <input
              type="text"
              value={watch('deja_facture') || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>

          {/* Date Facture */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Date Facture <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('date_facture')}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.date_facture ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.date_facture && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.date_facture.message}
              </p>
            )}
          </div>

          {/* N° Facture */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              N° Facture <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('num_facture')}
              onChange={(e) => {
                setValue('num_facture', e.target.value);
                checkNumeroUnique(e.target.value);
              }}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.num_facture ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.num_facture && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.num_facture.message}
              </p>
            )}
          </div>

          {/* Pièce Jointe */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Pièce Jointe{' '}
              {!facture?.piece_jointe && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              required={
                !facture?.piece_jointe || watch('piece_jointe') == ''
                  ? true
                  : false
              }
              type="file"
              onChange={handleFactureFileChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.piece_jointe ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {facture?.piece_jointe && (
              <div className="mt-2">
                <p className="text-xs !text-blue-500">
                  Fichier actuel: {facture.piece_jointe}
                </p>
                {!fileFacture && (
                  <p className="text-xs text-gray-500">
                    (Le fichier existant sera conservé)
                  </p>
                )}
              </div>
            )}
            {formErrors.piece_jointe && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.piece_jointe.message}
              </p>
            )}
          </div>

          {/* HT */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              HT <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('ht')}
              onChange={handleHtChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.ht ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.ht && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.ht.message}
              </p>
            )}
          </div>

          {/* Taux TVA */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Taux TVA <span className="text-red-500">*</span>
            </label>
            <select
              {...register('taux_tva')}
              onChange={handleTauxTvaChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.taux_tva ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un taux</option>
              <option value="0">0%</option>
              <option value="0.07">7%</option>
              <option value="0.1">10%</option>
              <option value="0.14">14%</option>
              <option value="0.2">20%</option>
            </select>
            {formErrors.taux_tva && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.taux_tva.message}
              </p>
            )}
          </div>

          {/* TVA */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              TVA
            </label>
            <input
              type="number"
              step="0.01"
              {...register('tva')}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>

          {/* Retenue de Garantie */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Retenue de Garantie
            </label>
            <input
              type="number"
              step="0.01"
              {...register('retenue_garantie')}
              onChange={handleRetenueChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* TTC */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              TTC
            </label>
            <input
              type="number"
              step="0.01"
              {...register('ttc')}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('montant')}
              onChange={handleMontantChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.montant ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.montant && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.montant.message}
              </p>
            )}
          </div>

          {/* Date Paiement */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Date Paiement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('date_paiement')}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.date_paiement ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.date_paiement && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.date_paiement.message}
              </p>
            )}
          </div>

          {/* Mode Paiement */}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Mode Paiement <span className="text-red-500">*</span>
            </label>
            <select
              {...register('mode_paiement')}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.mode_paiement ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un mode</option>
              {Object.entries(MODE_PAIEMENT).map(([key, { code, label }]) => (
                <option key={key} value={code}>
                  {label}
                </option>
              ))}
            </select>
            {formErrors.mode_paiement && (
              <p className="mt-1 text-sm !text-red-500">
                {formErrors.mode_paiement.message}
              </p>
            )}
          </div>

          {/* Conditional Fields Based on Mode Paiement */}
          {showBanqueFields && (
            <>
              {/* Banque */}
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Banque <span className="text-red-500">*</span>
                </label>
                {banques.length === 0 ? (
                  <select
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  >
                    <option>Chargement des banques...</option>
                  </select>
                ) : (
                  <Controller
                    name="banque_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        required={watch('mode_paiement') != '1' ? true : false}
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Sélectionner une banque</option>
                        {banques.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
              </div>

              {/* N° Paiement */}
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  N° Paiement <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('numero_paiement')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* PJ Paiement */}
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  PJ Paiement{' '}
                </label>
                <input
                  type="file"
                  onChange={handlePaiementFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {facture?.pj_paiement && (
                  <div className="mt-2">
                    <p className="text-xs !text-blue-500">
                      Fichier actuel: {facture.pj_paiement}
                    </p>
                    {!filePaiement && (
                      <p className="text-xs text-gray-500">
                        (Le fichier existant sera conservé)
                      </p>
                    )}
                  </div>
                )}
                {formErrors.pj_paiement && (
                  <p className="mt-1 text-sm !text-red-500">
                    {formErrors.pj_paiement.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Date Echéance (only for certain payment modes) */}
          {showEcheanceField && (
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-1">
                Date Echéance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date_echeance')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" onClick={onCancel}>   
              Annuler
            </Button>
            <Button type="submit"     disabled={loading || disabled || !numeroUnique}
>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
         
         
        </div>
      </form>
    </div>
  );
};

export default FacturesForm;
