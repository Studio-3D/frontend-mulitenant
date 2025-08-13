// components/filters/ProjetFilter.js

import Input from '@/components/Input'
import InputSelect from '@/components/inputSelect'
import React from 'react'

const ProjetFilter = ({ 
  tempFilters, 
  handleFilterChange, 
  resetFilters, 
  applyFilters, 
  typeProjets = [],  // Default to empty array if undefined
  loading 
}) => {
  return (
    <div className="space-y-4 rounded-lg">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Input
            label={"Nom"}
            type="text"
            placeholder="Nom..."
            value={tempFilters.nom}
            onChange={(e) => handleFilterChange("nom", e.target.value)}
            className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
          />
          <Input
            label={"Code"}
            type="text"
            placeholder="Code..."
            value={tempFilters.code}
            onChange={(e) => handleFilterChange("code", e.target.value)}
            className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
          />
          <Input
            label={"Adresse"}
            type="text"
            placeholder="Adresse..."
            value={tempFilters.adresse}
            onChange={(e) => handleFilterChange("adresse", e.target.value)}
            className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
          />
        
          <InputSelect
            label={"Type projet"}
            className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"  
            name="type"
            value={tempFilters.type}
            onChange={(selected) =>
              handleFilterChange("type", selected?.value || null)
            }
            options={typeProjets?.map(type => ({
              value: type.id,
              label: type.type
            })) || []}  // Safely handle undefined/null
            placeholder="Choisir un type..."
            isLoading={loading}
          />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date création</label>
          <input
            type="text"
            placeholder="Date création"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
            value={tempFilters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  )
}

export default ProjetFilter