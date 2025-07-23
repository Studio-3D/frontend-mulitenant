"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { APIURL } from "@/configs/api"
import { 
  MdStorage, 
  MdOutlineViewInAr, 
  MdApartment,
  MdHome,
  MdAdd
} from "react-icons/md"
import Modal from "@/components/Modal"
import toast from "react-hot-toast"
import SelectInput from "../SelectInput"

export default function CompositionForm({ state, setState, onNext, errors, isEdit = false }) {
  const [typeOptions, setTypeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [newTypeProjet, setNewTypeProjet] = useState("")
  const [addingType, setAddingType] = useState(false)
  
  // Checkbox states for toggling composition elements
  const [hasTranches, setHasTranches] = useState(state.tranches > 0)
  const [hasBlocks, setHasBlocks] = useState(state.blocks > 0)
  const [hasBuilding, setHasBuilding] = useState(state.building > 0)
  const [hasBien, setHasBien] = useState(state.bienCount > 0 || !isEdit)

  // Initialize bien count if it exists in state, otherwise default to 0
  useEffect(() => {
    if (hasBien && !state.bienCount) {
      handleChange("bienCount", 0)
    }
  }, [hasBien])

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
      toast.error("Veuillez sélectionner un type de projet")
      return
    }
    if (hasBien && !state.bienCount) {
      toast.error("Veuillez entrer le nombre de biens")
      return
    }
    if (hasTranches && !state.tranches) {
      toast.error("Veuillez entrer le nombre de tranches")
      return
    }
    if (hasBlocks && !state.blocks) {
      toast.error("Veuillez entrer le nombre de blocs")
      return
    }
    if (hasBuilding && !state.building) {
      toast.error("Veuillez entrer le nombre d'immeubles")
      return
    }
    onNext()
  }

  // Composition card component
  const CompositionCard = ({ 
    icon, 
    title, 
    description, 
    isChecked, 
    onCheckChange, 
    colorClass,
    inputValue,
    onInputChange,
    disabled = false
  }) => (
    <div className={`border rounded-lg p-4 flex flex-col cursor-pointer items-center transition-all duration-200 hover:shadow-md ${
      isChecked ? `border-${colorClass}-500` : 'border-gray-200'
    } ${disabled ? "opacity-70" : ""}`}>
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
            onChange={(e) => !disabled && onCheckChange(e.target.checked)}
            className={`form-checkbox h-5 w-5 cursor-pointer text-${colorClass}-500 rounded focus:ring-${colorClass}-500`}
            disabled={disabled}
          />
        </label>
      </div>
      
      {isChecked && (
        <div className="w-full mt-4">
          <input
            type="number"
            min="1"
            value={inputValue || ""}
            onChange={(e) => onInputChange(parseInt(e.target.value) || 0)}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-${colorClass}-500 focus:border-${colorClass}-500`}
            placeholder={`Nombre de ${title.toLowerCase()}`}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )

  return (
   <div className="bg-white p-6 rounded-md">

      <div className=" bg-white p-6 rounded-lg">
      <h2 className="text-xl font-medium mb-6">Type de projet et Composition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SelectInput
                label="Type de projet"
                placeholder="Sélectionnez un type"
                options={loading ? [] : typeOptions.map(option => ({
                  value: option.id,
                  label: option.type
                }))}
                value={state.typeId || ""}
                onChange={(selectedId) => {
                  const selectedOption = typeOptions.find(opt => opt.id === selectedId);
                  handleChange("typeId", selectedId);
                  handleChange("type", selectedOption ? selectedOption.type : "");
                }}
                error={errors?.type_id?.[0]}
                required={true}
                disabled={isEdit || loading}
                name="type_id"
              />

              {typeOptions.length === 0 && !loading && (
                <p className="mt-1 text-sm text-amber-600">
                  Aucun type de projet trouvé. Veuillez d'abord créer des types de projets.
                </p>
              )}
            </div>
            {/* Add Type Project Button */}
            {!isEdit && (
              <button
                type="button"
                onClick={() => setShowAddTypeModal(true)}
                className=" px-4 py-1.5 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white  rounded-md transition-colors"
              >
                <div className="flex items-center justify-center">
                  <MdAdd className="h-5 w-5 mr-1" />
                  <span className="text-md font-medium">Nouveau</span>
                </div>
              </button>
            )}

          </div>
        </div>
      </div>

      <div className=" bg-white p-6 rounded-lg ">
        <h3 className="text-xl font-medium mb-4">Composition de projet</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tranches */}
          <CompositionCard
            icon={<MdStorage />}
            title="Tranche"
            description="Ce projet se compose des tranches."
            isChecked={hasTranches}
            onCheckChange={handleTranchesChange}
            colorClass="green"
            inputValue={state.tranches}
            onInputChange={(val) => handleChange("tranches", val)}
            disabled={isEdit}
          />
          
          {/* Blocs */}
          <CompositionCard
            icon={<MdOutlineViewInAr />}
            title="Bloc"
            description="Ce projet se compose des blocs."
            isChecked={hasBlocks}
            onCheckChange={handleBlocksChange}
            colorClass="orange"
            inputValue={state.blocks}
            onInputChange={(val) => handleChange("blocks", val)}
            disabled={isEdit}
          />
          
          {/* Immeubles */}
          <CompositionCard
            icon={<MdApartment />}
            title="Immeuble"
            description="Ce projet se compose des immeubles."
            isChecked={hasBuilding}
            onCheckChange={handleBuildingChange}
            colorClass="red"
            inputValue={state.building}
            onInputChange={(val) => handleChange("building", val)}
            disabled={isEdit}
          />
          
          {/* Bien */}
          <CompositionCard
            icon={<MdHome />}
            title="Bien"
            description="Ce projet se compose des biens."
            isChecked={hasBien}
            onCheckChange={handleBienChange}
            colorClass="blue"
            inputValue={state.bienCount}
            onInputChange={(val) => handleChange("bienCount", val)}
            disabled={isEdit}
          />
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
            !state.typeId || 
            (hasBien && !state.bienCount) || 
            (hasTranches && !state.tranches) || 
            (hasBlocks && !state.blocks) || 
            (hasBuilding && !state.building)
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
          disabled={
            !state.typeId || 
            (hasBien && !state.bienCount) || 
            (hasTranches && !state.tranches) || 
            (hasBlocks && !state.blocks) || 
            (hasBuilding && !state.building)
          }
        >
          Suivant
        </button>
      </div>

      {/* Modal for adding new project type */}
      <Modal isVisible={showAddTypeModal} onClose={() => setShowAddTypeModal(false)}>
        <div className="p-6 w-[600px]">
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