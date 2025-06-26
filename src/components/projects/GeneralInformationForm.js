"use client"

export default function GeneralInformationForm({ state, setState, onNext, onBack, errors }) {
  const handleChange = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }

  const isFormIncomplete = (state) => {
  return (
    state.nom?.trim() === "" ||
    state.code?.trim() === "" ||
    state.adresse?.trim() === "" ||
    !state.date_autorisation_construction ||
    state.surface_terrain === "" ||
    state.prix_acquisition === "" ||
    state.limite_annulation_reservation === "" ||
    state.max_etages === ""
  );
}


  return (
    
    <div className="bg-white p-6 rounded-md">
      {/* <h2 className="text-xl font-medium mb-6">Informations générales</h2> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        {/* Nom du projet */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Nom du projet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.nom ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            required
          />
          {errors?.nom && <p className="mt-1 text-sm !text-red-600">{errors.nom[0]}</p>}
        </div>

        {/* Right Column */}
        {/* Code du projet */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Code du projet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.code ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.code}
            onChange={(e) => handleChange("code", e.target.value)}
            required
          />
          {errors?.code && <p className="mt-1 text-sm !text-red-600">{errors.code[0]}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Adresse <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.adresse ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.adresse}
            onChange={(e) => handleChange("adresse", e.target.value)}
            required
          />
          {errors?.adresse && <p className="mt-1 text-sm !text-red-600">{errors.adresse[0]}</p>}
        </div>

        {/* Land Title */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">Titre foncier</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={state.titre_foncier || ""}
            onChange={(e) => handleChange("titre_foncier", e.target.value)}
          />
        </div>

        {/* Construction Authorization Date */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Date autorisation construction <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={state.date_autorisation_construction}
            onChange={(e) => handleChange("date_autorisation_construction", e.target.value)}
            required
          />
        </div>

        {/* Habitation Permit Date */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">Date permis habiter</label>
          <input
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={state.date_permis_habiter || ""}
            onChange={(e) => handleChange("date_permis_habiter", e.target.value)}
          />
        </div>

        {/* Land Surface */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Surface terrain (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.surface_terrain ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.surface_terrain}
            onChange={(e) => handleChange("surface_terrain", e.target.value)}
            required
          />
        </div>

        {/* Acquisition Price */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Prix acquisition <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.prix_acquisition ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.prix_acquisition}
            onChange={(e) => handleChange("prix_acquisition", e.target.value)}
            required
          />
        </div>

        {/* Reservation Cancellation Limit */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Limite annulation réservation (jours) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={state.limite_annulation_reservation}
            onChange={(e) => handleChange("limite_annulation_reservation", e.target.value)}
            required
          />
        </div>

        {/* Reservation Extension */}
        <div>
          <label className="block text-sm font-medium !text-gray-700 mb-1">Prolongation réservation (jours)</label>
          <input
            type="number"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={state.prolongation_reservation || ""}
            onChange={(e) => handleChange("prolongation_reservation", e.target.value)}
          />
        </div>

        {/* Max Floors - Moved to a single column at the bottom */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium !text-gray-700 mb-1">
            Nombre d'étages maximum <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors?.max_etages ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            value={state.max_etages}
            onChange={(e) => handleChange("max_etages", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-between pt-5">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium !text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isFormIncomplete(state)
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}          
          disabled={isFormIncomplete(state)}
        >
          Suivant
        </button>

      </div>
    </div>
  )
}

