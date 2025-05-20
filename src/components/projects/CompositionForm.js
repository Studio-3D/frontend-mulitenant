"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { APIURL } from "@/configs/api"
import { 
  Database, 
  Layers, 
  Building2, 
  Home, 
  Plus 
} from "lucide-react"
import Modal from "@/components/Modal"
import toast from "react-hot-toast"

export default function CompositionForm({ state, setState, onNext, errors }) {
  const [typeOptions, setTypeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [newTypeProjet, setNewTypeProjet] = useState("")
  const [addingType, setAddingType] = useState(false)
  
  // Checkbox states for toggling composition elements
  const [hasTranches, setHasTranches] = useState(state.tranches > 0)
  const [hasBlocks, setHasBlocks] = useState(state.blocks > 0)
  const [hasBuilding, setHasBuilding] = useState(state.building > 0)
  const [hasBien, setHasBien] = useState(true) // Set Bien checked by default

  // Initialize bien count if it exists in state, otherwise default to 0
  useEffect(() => {
    if (hasBien && !state.bienCount) {
      handleChange("bienCount", 0);
    }
  }, [hasBien]);

  useEffect(() => {
    // Function to fetch project types
    async function fetchTypeProjects() {
      setLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        const response = await axios.get(APIURL.TYPEPROJETS, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("Type projects response:", response.data)

        // Make sure we're correctly parsing the response
        const typesData = response.data.typeProjets || []
        setTypeOptions(typesData)
      } catch (error) {
        console.error("Error fetching project types:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTypeProjects()
  }, [])

  const handleChange = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }
  
  // Handle checkbox changes
  const handleTranchesChange = (checked) => {
    setHasTranches(checked)
    if (!checked) {
      handleChange("tranches", 0)
    }
  }
  
  const handleBlocksChange = (checked) => {
    setHasBlocks(checked)
    if (!checked) {
      handleChange("blocks", 0)
    }
  }
  
  const handleBuildingChange = (checked) => {
    setHasBuilding(checked)
    if (!checked) {
      handleChange("building", 0)
    }
  }
  
  const handleBienChange = (checked) => {
    setHasBien(checked)
    if (!checked) {
      handleChange("bienCount", 0)
    }
  }

  // Create new type projet
  const handleAddTypeProjet = async (e) => {
    e.preventDefault()
    
    if (!newTypeProjet.trim()) {
      toast.error("Veuillez entrer un type de projet")
      return
    }
    
    setAddingType(true)
    
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.post(
        APIURL.TYPEPROJETS,
        { type: newTypeProjet.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Handle successful creation
      if (response.data.typeProjet) {
        const newType = response.data.typeProjet
        setTypeOptions([...typeOptions, newType])
        
        // Automatically select the new type
        handleChange("typeId", newType.id)
        handleChange("type", newType.type)
        
        toast.success("Type de projet ajouté avec succès")
        setShowAddTypeModal(false)
        setNewTypeProjet("")
      }
    } catch (error) {
      console.error("Error creating project type:", error)
      toast.error(error.response?.data?.message || "Erreur lors de la création du type de projet")
    } finally {
      setAddingType(false)
    }
  }

  // Validate form before proceeding
  const handleFormSubmit = () => {
    if (!state.typeId) {
      return // Don't proceed if no type selected
    }
    onNext()
  }

  // Composition card component
  const CompositionCard = ({ icon, title, description, isChecked, onCheckChange, colorClass }) => (
    <div className={`border rounded-lg p-4 flex flex-col items-center transition-all duration-200 hover:shadow-md ${isChecked ? `border-${colorClass}-500` : 'border-gray-200'}`}>
      <div className={`text-4xl mb-3 ${isChecked ? `text-${colorClass}-500` : 'text-gray-400'}`}>
        {icon}
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-sm text-center text-gray-600 mb-4">{description}</p>
      <div className="mt-auto">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onCheckChange(e.target.checked)}
            className={`form-checkbox h-5 w-5 text-${colorClass}-500 rounded focus:ring-${colorClass}-500`}
          />
        </label>
      </div>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-md">
      <h2 className="text-xl font-medium mb-6">Type de projet et Composition</h2>

      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium mb-4">Type de projet</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de projet <span className="text-red-500">*</span>
              </label>

              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Chargement des types de projet...</span>
                </div>
              ) : (
                <>
                  <select
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors?.type_id ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={state.typeId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value ? Number.parseInt(e.target.value) : null
                      const selectedOption = typeOptions.find((opt) => opt.id === selectedId)
                      handleChange("typeId", selectedId)
                      handleChange("type", selectedOption ? selectedOption.type : "")
                    }}
                  >
                    <option value="">Sélectionnez un type</option>
                    {typeOptions.length > 0 ? (
                      typeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.type}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">
                        Aucun type disponible
                      </option>
                    )}
                  </select>
                  {typeOptions.length === 0 && !loading && (
                    <p className="mt-1 text-sm text-amber-600">
                      Aucun type de projet trouvé. Veuillez d'abord créer des types de projets.
                    </p>
                  )}
                </>
              )}

              {errors?.type_id && <p className="mt-1 text-sm text-red-600">{errors.type_id[0]}</p>}
            </div>
            
            {/* Add Type Project Button */}
            <button
              type="button"
              onClick={() => setShowAddTypeModal(true)}
              className="mb-0.5 h-10 px-3 py-2 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-md text-sm transition-colors"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium mb-6">Composition de projet</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Bien - Added as first card and checked by default */}
          <CompositionCard
            icon={<Home />}
            title="Bien"
            description="Ce projet se compose des biens."
            isChecked={hasBien}
            onCheckChange={handleBienChange}
            colorClass="blue"
          />
          
          {/* Tranches */}
          <CompositionCard
            icon={<Database />}
            title="Tranche"
            description="Ce projet se compose des tranches."
            isChecked={hasTranches}
            onCheckChange={handleTranchesChange}
            colorClass="green"
          />
          
          {/* Blocs */}
          <CompositionCard
            icon={<Layers />}
            title="Bloc"
            description="Ce projet se compose des blocs."
            isChecked={hasBlocks}
            onCheckChange={handleBlocksChange}
            colorClass="orange"
          />
          
          {/* Immeubles */}
          <CompositionCard
            icon={<Building2 />}
            title="Immeuble"
            description="Ce projet se compose des immeubles."
            isChecked={hasBuilding}
            onCheckChange={handleBuildingChange}
            colorClass="red"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Bien number input - show when checked */}
          {hasBien && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de biens <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={state.bienCount || ""}
                onChange={(e) => handleChange("bienCount", parseInt(e.target.value) || 0)}
                required={hasBien}
              />
            </div>
          )}
          
          {/* Tranches number input - only show when checked */}
          {hasTranches && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de tranches <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={state.tranches || ""}
                onChange={(e) => handleChange("tranches", parseInt(e.target.value) || 0)}
                required={hasTranches}
              />
            </div>
          )}
          
          {/* Blocks number input - only show when checked */}
          {hasBlocks && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de blocs <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={state.blocks || ""}
                onChange={(e) => handleChange("blocks", parseInt(e.target.value) || 0)}
                required={hasBlocks}
              />
            </div>
          )}
          
          {/* Buildings number input - only show when checked */}
          {hasBuilding && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'immeubles <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={state.building || ""}
                onChange={(e) => handleChange("building", parseInt(e.target.value) || 0)}
                required={hasBuilding}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-5">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={handleFormSubmit}
          className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            !state.typeId 
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
          disabled={!state.typeId || loading}
        >
          Suivant
        </button>
      </div>

      {/* Modal for adding new project type */}
      <Modal isVisible={showAddTypeModal} onClose={() => setShowAddTypeModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Ajouter un type de projet</h3>
          <form onSubmit={handleAddTypeProjet}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTypeProjet}
                onChange={(e) => setNewTypeProjet(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Résidentiel, Commercial, etc."
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddTypeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={addingType}
              >
                {addingType ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  "Ajouter"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

