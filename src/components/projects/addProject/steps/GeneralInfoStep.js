import React from 'react';

export const GeneralInfoStep = ({ 
  formData, 
  updateFormData, 
  onNext, 
  onPrevious,
  errors,
  touched
}) => {
  const handleInputChange = (field, value) => {
    updateFormData(`projectInfo.${field}`, value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Information général</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nomProjet" className="block text-sm font-medium text-gray-700">
              Nom de projet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nomProjet"
              name="projectInfo.nomProjet"
              value={formData.projectInfo.nomProjet}
              onChange={(e) => handleInputChange('nomProjet', e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 ${
                errors.projectInfo?.nomProjet && touched.projectInfo?.nomProjet ? 'border-red-500' : ''
              }`}
            />
            {errors.projectInfo?.nomProjet && touched.projectInfo?.nomProjet && (
              <div className="text-red-500 text-sm mt-1">{errors.projectInfo.nomProjet}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="codeProjet" className="block text-sm font-medium text-gray-700">
              Code de projet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="codeProjet"
              name="projectInfo.codeProjet"
              value={formData.projectInfo.codeProjet}
              onChange={(e) => handleInputChange('codeProjet', e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 ${
                errors.projectInfo?.codeProjet && touched.projectInfo?.codeProjet ? 'border-red-500' : ''
              }`}
            />
            {errors.projectInfo?.codeProjet && touched.projectInfo?.codeProjet && (
              <div className="text-red-500 text-sm mt-1">{errors.projectInfo.codeProjet}</div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="adresse"
              name="projectInfo.adresse"
              value={formData.projectInfo.adresse}
              onChange={(e) => handleInputChange('adresse', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="titreFoncier" className="block text-sm font-medium text-gray-700">
              Titre de foncier
            </label>
            <input
              type="text"
              id="titreFoncier"
              name="projectInfo.titreFoncier"
              value={formData.projectInfo.titreFoncier}
              onChange={(e) => handleInputChange('titreFoncier', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="dateAutorisationConstruction" className="block text-sm font-medium text-gray-700">
              Date d'autorisation construction
            </label>
            <input
              type="date"
              id="dateAutorisationConstruction"
              name="projectInfo.dateAutorisationConstruction"
              value={formData.projectInfo.dateAutorisationConstruction}
              onChange={(e) => handleInputChange('dateAutorisationConstruction', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="datePermisHabiter" className="block text-sm font-medium text-gray-700">
              Date permis d'habiter
            </label>
            <input
              type="date"
              id="datePermisHabiter"
              name="projectInfo.datePermisHabiter"
              value={formData.projectInfo.datePermisHabiter}
              onChange={(e) => handleInputChange('datePermisHabiter', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="surfaceTerrain" className="block text-sm font-medium text-gray-700">
              Surface terrain (m²)
            </label>
            <input
              type="number"
              id="surfaceTerrain"
              name="projectInfo.surfaceTerrain"
              min="0"
              value={formData.projectInfo.surfaceTerrain}
              onChange={(e) => handleInputChange('surfaceTerrain', e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 ${
                errors.projectInfo?.surfaceTerrain && touched.projectInfo?.surfaceTerrain ? 'border-red-500' : ''
              }`}
            />
            {errors.projectInfo?.surfaceTerrain && touched.projectInfo?.surfaceTerrain && (
              <div className="text-red-500 text-sm mt-1">{errors.projectInfo.surfaceTerrain}</div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="prixAcquisition" className="block text-sm font-medium text-gray-700">
              Prix d'acquisition
            </label>
            <input
              type="number"
              id="prixAcquisition"
              name="projectInfo.prixAcquisition"
              min="0"
              value={formData.projectInfo.prixAcquisition}
              onChange={(e) => handleInputChange('prixAcquisition', e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 ${
                errors.projectInfo?.prixAcquisition && touched.projectInfo?.prixAcquisition ? 'border-red-500' : ''
              }`}
            />
            {errors.projectInfo?.prixAcquisition && touched.projectInfo?.prixAcquisition && (
              <div className="text-red-500 text-sm mt-1">{errors.projectInfo.prixAcquisition}</div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="limiteAnnulationReservation" className="block text-sm font-medium text-gray-700">
              Limite annulation réservation (jours)
            </label>
            <input
              type="number"
              id="limiteAnnulationReservation"
              name="projectInfo.limiteAnnulationReservation"
              min="0"
              value={formData.projectInfo.limiteAnnulationReservation}
              onChange={(e) => handleInputChange('limiteAnnulationReservation', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prolongationReservation" className="block text-sm font-medium text-gray-700">
              Prolongation réservation (jours)
            </label>
            <input
              type="number"
              id="prolongationReservation"
              name="projectInfo.prolongationReservation"
              min="0"
              value={formData.projectInfo.prolongationReservation}
              onChange={(e) => handleInputChange('prolongationReservation', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="nombreEtagesMaximum" className="block text-sm font-medium text-gray-700">
              Nombre d'étages maximum
            </label>
            <input
              type="number"
              id="nombreEtagesMaximum"
              name="projectInfo.nombreEtagesMaximum"
              min="0"
              value={formData.projectInfo.nombreEtagesMaximum}
              onChange={(e) => handleInputChange('nombreEtagesMaximum', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            />
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
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};