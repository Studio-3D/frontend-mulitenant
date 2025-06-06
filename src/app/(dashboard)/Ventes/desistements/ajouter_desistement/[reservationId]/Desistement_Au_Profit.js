import React from 'react';
import { CalendarIcon, Building2Icon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { type_dst_dp } from '@/configs/enum';

export function Desistement_Au_Profit({ isEditing, formData }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors }, // Destructure errors from formState
  } = useFormContext();
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      updateFormData({ [name]: files[0] });
    } else if (type === 'radio' || type === 'checkbox') {
      updateFormData({ [name]: checked ? value : '' });
    } else {
      updateFormData({ [name]: value });
    }
  };
  return (
    <div className="p-6">
      {isEditing && (
        <div className="mb-4 p-3 bg-yellow-50 !text-yellow-800 rounded-md">
          <p className="font-medium">Mode Édition</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AutocompleteSelectComponent
          label="Type Désistement Au Profit:"
          name="type_dp"
          value={formData.type_dp}
          control={control}
          options={type_dst_dp}
          errors={errors.type_dp?.message}
          required
          onChange={(value) => setValue('type_dp', value)}
        />
      </div>
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-md font-medium text-indigo-600 mb-4">
          Détails Commerciaux
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Chiffre d'affaires prévu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Secteur d'activité <span className="text-red-500">*</span>
            </label>
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Commerce de détail</option>
              <option>Restauration</option>
              <option>Services</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
      </div>
      {/* Standard withdrawal options */}
      <div className="border-t border-gray-200 py-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="remboursement"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
              checked
            />
            <span className="ml-2 text-sm !text-gray-700">Rem.immediat</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="remboursement"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
            />
            <span className="ml-2 text-sm !text-gray-700">Rem.Après Vente</span>
          </label>
        </div>
      </div>
    </div>
  );
}
