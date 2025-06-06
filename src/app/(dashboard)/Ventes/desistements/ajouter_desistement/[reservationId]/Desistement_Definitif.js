import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { motif, motif_desistements } from '@/configs/enum';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup } from '@radix-ui/react-dropdown-menu';

export function Desistement_Definitif({ isEditing, formData }) {
   const { 
    control, 
    watch, 
    setValue, 
    formState: { errors }  // Destructure errors from formState
  } = useFormContext();
  const modeRemboursement = watch('modeRemboursement');
  const pourCompte = watch('pourCompte');
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      updateFormData({ [name]: files[0] });
    } else if (type === 'radio' || type === 'checkbox') {
      updateFormData({ [name]: value }); // For radios, we want the value not checked status
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      updateFormData({ [name]: files[0] });
    }
  };

  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-yellow-50 !text-yellow-800 rounded-md">
          <p className="font-medium">
            Mode Édition: Vous modifiez un désistement existant
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AutocompleteSelectComponent
          label="Motif :"
          name="motif"
          value={isEditing&&formData.motif}
          control={control}
          options={motif_desistements}
          errors={errors.motif?.message}
          required
          onChange={(value) => setValue('motif', value)}
        />
       
      </div>

      <div className="border-t border-gray-200 py-4">
        <Controller
          name="remboursement"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onChange={field.onChange}
              options={[
                'Rem.immediat',
                'Rem.Après Vente',
                'Transfert dossier',
                'Transfert et Remboursement',
              ]}
            />
          )}
        />
      </div>

      <div className="border-t border-gray-200 py-4">
        <h3 className="text-md font-medium text-indigo-600 mb-4">
          Remboursement du Client : {formData.clientName || 'nnn_1 ppp_1'}
        </h3>
        {/*<Controller
          name="dateOperation"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              label="Date de remboursement"
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              error={error?.message}
              required
            />
          )}
        />*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Date Remboursement: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateRemboursement"
                value={formData.dateRemboursement || ''}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-2">
                <CalendarIcon size={20} className="text-gray-400" />
              </span>
            </div>
          </div>
          {/*{/* Mode Remboursement 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Controller
          name="modeRemboursement"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <RadioGroup
              label="Mode Remboursement"
              value={field.value}
              onChange={field.onChange}
              options={['Chèque', 'Virement']}
              error={error?.message}
              required
            />
          )}
        />

        {modeRemboursement === 'Chèque' && (
          <Controller
            name="chequeFile"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FileInput
                label="Chèque/Reçu"
                onChange={(e) => {
                  const file = e.target.files[0];
                  field.onChange(file);
                  setValue('chequeFile', file);
                }}
                value={field.value}
                error={error?.message}
                required
              />
            )}
          />
        )}
      </div>*/}
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Mode Remboursement: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              {['Chèque', 'Virement'].map((mode) => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="modeRemboursement"
                    value={mode}
                    checked={formData.modeRemboursement === mode}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-sm !text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              N° Paiement: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numeroPaiement"
              value={formData.numeroPaiement || ''}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Chèque/Reçu:
            </label>
            <label className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm text-left !text-gray-700 cursor-pointer">
              <input
                type="file"
                name="chequeFile"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.chequeFile?.name || 'Choisir un fichier'}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Pour le Compte: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              {['lui même', 'Autre'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="pourCompte"
                    value={option}
                    checked={formData.pourCompte === option}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-sm !text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Fichier Authorisation: <span className="text-red-500">*</span>
            </label>
            <label className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm text-left !text-gray-700 cursor-pointer">
              <input
                type="file"
                name="autorisationFile"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.autorisationFile?.name || 'Choisir un fichier'}
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Ajouter Pénalité</h3>
          <label className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              name="avecPenalite"
              checked={formData.avecPenalite || false}
              onChange={(e) =>
                updateFormData({ avecPenalite: e.target.checked })
              }
              className="sr-only"
            />
            <div
              className={`block h-6 rounded-full w-12 ${
                formData.avecPenalite ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                formData.avecPenalite ? 'transform translate-x-6' : ''
              }`}
            ></div>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Ajouter Pièces Jointes</h3>
          <label className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              name="avecPiecesJointes"
              checked={formData.avecPiecesJointes || false}
              onChange={(e) =>
                updateFormData({ avecPiecesJointes: e.target.checked })
              }
              className="sr-only"
            />
            <div
              className={`block h-6 rounded-full w-12 ${
                formData.avecPiecesJointes ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                formData.avecPiecesJointes ? 'transform translate-x-6' : ''
              }`}
            ></div>
          </label>
        </div>
      </div>
    </div>
  );
}
