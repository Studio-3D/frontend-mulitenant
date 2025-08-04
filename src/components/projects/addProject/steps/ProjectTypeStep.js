import React, { useState } from 'react';
import {
  PlusIcon,
  CheckIcon,
  LayersIcon,
  GridIcon,
  BuildingIcon,
  HomeIcon,
} from 'lucide-react';

export const ProjectTypeStep = ({ formData, updateFormData, onNext }) => {
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newType, setNewType] = useState('');
  const [projectTypes, setProjectTypes] = useState([
    'Type A',
    'Type B',
    'Type C',
  ]);

  const handleCompositionChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    updateFormData({
      composition: {
        ...formData.composition,
        [field]: {
          ...formData.composition[field],
          value: numValue,
        },
      },
    });
  };

  const handleCompositionToggle = (field) => {
    updateFormData({
      composition: {
        ...formData.composition,
        [field]: {
          ...formData.composition[field],
          enabled: !formData.composition[field].enabled,
        },
      },
    });
  };

  const handleAddNewType = () => {
    if (newType.trim()) {
      setProjectTypes((prev) => [...prev, newType.trim()]);
      updateFormData({
        projectType: newType.trim(),
      });
      setNewType('');
      setShowNewTypeInput(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className=" space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex flex-col mt-10">
            <label htmlFor="projectType" className="block text-lg font-medium text-gray-700 mb-1">
              Type de projet
            </label>
            {showNewTypeInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newProjectType"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="block w-[600px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                  placeholder="Nouveau type"
                />
                <button
                  type="button"
                  onClick={handleAddNewType}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTypeInput(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <select
                id="projectType"
                value={formData.projectType}
                onChange={(e) => updateFormData({ projectType: e.target.value })}
                className="block w-[600px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
              >
                <option value="">Sélectionnez un type</option>
                {projectTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>
          {!showNewTypeInput && (
            <button
              type="button"
              onClick={() => setShowNewTypeInput(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center gap-1"
            >
              <PlusIcon size={16} />
              <span>Nouveau</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800  mt-14">Composition de projet</h3>
        <div className="flex flex-wrap gap-4">
          {/* Tranche */}
          <div className={`flex-1 border rounded-md p-4  h-[30vh] ${formData.composition.tranche.enabled ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex flex-col items-center text-center mb-3">
              <LayersIcon size={32} className="text-blue-500 mb-2" />
              <h4 className="font-medium">Tranche</h4>
              <p className="text-xs text-gray-500 mt-6">Ce projet se compose des tranches</p>
            </div>
            <div className="flex items-center gap-3 mb-3 justify-center ">
              <div
                onClick={() => handleCompositionToggle('tranche')}
                className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.composition.tranche.enabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
              >
                {formData.composition.tranche.enabled && <CheckIcon size={14} className="text-white" />}
              </div>
              <label htmlFor="tranche" className="text-sm font-medium text-gray-700">
                Activer
              </label>
            </div>
            <input
              type="number"
              id="tranche"
              min="0"
              disabled={!formData.composition.tranche.enabled}
              value={formData.composition.tranche.value || ''}
              onChange={(e) => handleCompositionChange('tranche', e.target.value)}
              className="block w-full mt-6 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Blocs */}
          <div className={`flex-1 border rounded-md p-4 ${formData.composition.blocs.enabled ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex flex-col items-center text-center mb-3">
              <GridIcon size={32} className="text-blue-500 mb-2" />
              <h4 className="font-medium">Blocs</h4>
              <p className="text-xs text-gray-500 mt-6">Ce projet se compose des blocs</p>
            </div>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div
                onClick={() => handleCompositionToggle('blocs')}
                className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.composition.blocs.enabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
              >
                {formData.composition.blocs.enabled && <CheckIcon size={14} className="text-white" />}
              </div>
              <label htmlFor="blocs" className="text-sm font-medium text-gray-700">
                Activer
              </label>
            </div>
            <input
              type="number"
              id="blocs"
              min="0"
              disabled={!formData.composition.blocs.enabled}
              value={formData.composition.blocs.value || ''}
              onChange={(e) => handleCompositionChange('blocs', e.target.value)}
              className="block w-full mt-6 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Immeuble */}
          <div className={`flex-1 border rounded-md p-4 ${formData.composition.immeuble.enabled ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex flex-col items-center text-center mb-3">
              <BuildingIcon size={32} className="text-blue-500 mb-2" />
              <h4 className="font-medium">Immeuble</h4>
              <p className="text-xs text-gray-500 mt-6">Ce projet se compose des immeubles</p>
            </div>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div
                onClick={() => handleCompositionToggle('immeuble')}
                className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.composition.immeuble.enabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
              >
                {formData.composition.immeuble.enabled && <CheckIcon size={14} className="text-white" />}
              </div>
              <label htmlFor="immeuble" className="text-sm font-medium text-gray-700">
                Activer
              </label>
            </div>
            <input
              type="number"
              id="immeuble"
              min="0"
              disabled={!formData.composition.immeuble.enabled}
              value={formData.composition.immeuble.value || ''}
              onChange={(e) => handleCompositionChange('immeuble', e.target.value)}
              className="block w-full rounded-md mt-6 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Bien */}
          <div className={`flex-1 border rounded-md p-4 ${formData.composition.bien.enabled ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex flex-col items-center text-center mb-3">
              <HomeIcon size={32} className="text-blue-500 mb-2" />
              <h4 className="font-medium">Bien</h4>
              <p className="text-xs text-gray-500 mt-6">Ce projet se compose des biens</p>
            </div>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div
                onClick={() => handleCompositionToggle('bien')}
                className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${formData.composition.bien.enabled ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
              >
                {formData.composition.bien.enabled && <CheckIcon size={14} className="text-white" />}
              </div>
              <label htmlFor="bien" className="text-sm font-medium text-gray-700">
                Activer
              </label>
            </div>
            <input
              type="number"
              id="bien"
              min="0"
              disabled={!formData.composition.bien.enabled}
              value={formData.composition.bien.value || ''}
              onChange={(e) => handleCompositionChange('bien', e.target.value)}
              className="block w-full rounded-md mt-6 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};