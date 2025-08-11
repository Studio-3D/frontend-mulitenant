import React, { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';

export const GeneralParametersStep = ({ formData, updateFormData, onPrevious }) => {
  const [inputValues, setInputValues] = useState({
    typesDeBien: '',
    vues: '',
    typologies: '',
    partenaires: '',
    remise: '',
  });
  
  const [selectedUser, setSelectedUser] = useState('');
  const [partenaireInputs, setPartenaireInputs] = useState({
    nom: '',
    remise: '',
  });

  // Mock users data
  const availableUsers = [
    { id: '1', name: 'Jean Dupont' },
    { id: '2', name: 'Marie Martin' },
    { id: '3', name: 'Pierre Durand' },
    { id: '4', name: 'Sophie Lefebvre' },
    { id: '5', name: 'Thomas Bernard' },
  ];

  const handleAddItem = (field) => {
    if (inputValues[field].trim()) {
      updateFormData({
        parameters: {
          ...formData.parameters,
          [field]: [...formData.parameters[field], inputValues[field].trim()],
        },
      });
      setInputValues({ ...inputValues, [field]: '' });
    }
  };

  const handleAddPartenaire = () => {
    if (partenaireInputs.nom.trim()) {
      const newPartenaire = {
        nom: partenaireInputs.nom.trim(),
        remise: partenaireInputs.remise || '0',
      };
      updateFormData({
        parameters: {
          ...formData.parameters,
          partenaires: [...formData.parameters.partenaires, newPartenaire],
        },
      });
      setPartenaireInputs({ nom: '', remise: '' });
    }
  };

  const handleRemoveItem = (field, index) => {
    updateFormData({
      parameters: {
        ...formData.parameters,
        [field]: formData.parameters[field].filter((_, i) => i !== index),
      },
    });
  };

  const handleAddUser = () => {
    if (selectedUser && !formData.parameters.utilisateursAcces.includes(selectedUser)) {
      updateFormData({
        parameters: {
          ...formData.parameters,
          utilisateursAcces: [...formData.parameters.utilisateursAcces, selectedUser],
        },
      });
      setSelectedUser('');
    }
  };

  const handleRemiseChange = (value) => {
    updateFormData({
      parameters: {
        ...formData.parameters,
        remise: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const renderParameterField = (field, label, isOptional = true) => {
    return (
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {label} {isOptional && <span className="text-gray-500 text-xs">(optionnel)</span>}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValues[field]}
            onChange={(e) => setInputValues({ ...inputValues, [field]: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          />
          <button
            type="button"
            onClick={() => handleAddItem(field)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md"
          >
            <PlusIcon size={20} />
          </button>
        </div>
        {formData.parameters[field].length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.parameters[field].map((item, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(field, index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Paramètres généraux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderParameterField('typesDeBien', 'Types de bien')}
            {renderParameterField('vues', 'Vues')}
            {renderParameterField('typologies', 'Typologies')}
          </div>
          <div>
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Partenaires <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom du partenaire"
                    value={partenaireInputs.nom}
                    onChange={(e) => setPartenaireInputs({ ...partenaireInputs, nom: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Remise %"
                    value={partenaireInputs.remise}
                    onChange={(e) => setPartenaireInputs({ ...partenaireInputs, remise: e.target.value })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPartenaire}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md"
                >
                  <PlusIcon size={20} />
                </button>
              </div>
              {formData.parameters.partenaires.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {formData.parameters.partenaires.map((partenaire, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2">
                      <div>
                        <span className="font-medium">{partenaire.nom}</span>
                        <span className="ml-2 text-sm text-gray-500">Remise: {partenaire.remise}%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('partenaires', index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Utilisateurs avec accès au projet <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                >
                  <option value="">Sélectionnez un utilisateur</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.name}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md"
                >
                  <PlusIcon size={20} />
                </button>
              </div>
              {formData.parameters.utilisateursAcces.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.parameters.utilisateursAcces.map((user, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                      <span>{user}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('utilisateursAcces', index)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Soumettre
        </button>
      </div>
    </div>
  );
};