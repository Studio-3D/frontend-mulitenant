"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { APIURL, BASERESOURCEURL } from "@/configs/api"
import { Plus, Trash2 } from "lucide-react"
import Button from "@/components/Button";

export default function GeneralParameterForm({ state, setState, onNext, onBack, errors, loading }) {
  const [users, setUsers] = useState([])
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectAllUsers, setSelectAllUsers] = useState(false)
  const [searchUser, setSearchUser] = useState("")

  // New state for property types, views, typologies, partners
  const [newBien, setNewBien] = useState("")
  const [newVue, setNewVue] = useState("")
  const [newTypologie, setNewTypologie] = useState("")
  const [newPartner, setNewPartner] = useState({ description: "", remise: 0 })

  // Add state for mapping global to local IDs
  const [userIdMapping, setUserIdMapping] = useState({})

  useEffect(() => {
  async function fetchUsers() {
    setFetchingUsers(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await axios.get(`${APIURL.ROOT}/get_users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("API response for users:", response.data)

      const fetchedUsers = response.data.users || []

      const newUsers = fetchedUsers.map((user, index) => ({
  ...user,
  localId: index + 1, // uniquement pour clé React
}))
setUsers(newUsers)
      console.log("Created user ID mapping:", newUsers) // Affiche bien les users avec localId

    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setFetchingUsers(false)
    }
  }

  fetchUsers()
}, [])


  const handleChange = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }))
  }

 const toggleSelectAllUsers = () => {
  if (selectAllUsers) {
    setState(prev => ({ ...prev, selectedUsers: [] }))
    setSelectAllUsers(false)
  } else {
    setState(prev => ({ 
      ...prev, 
      selectedUsers: users // utilisateurs complets avec vrai id
    }))
    setSelectAllUsers(true)
  }
}


// handleUserChange
const handleUserChange = (userId) => {
  const user = users.find((u) => u.id === userId)
  const isSelected = state.selectedUsers.some((u) => u.id === userId)

  if (isSelected) {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(u => u.id !== userId),
    }))
  } else if (user) {
    setState(prev => ({
      ...prev,
      selectedUsers: [...prev.selectedUsers, user],
    }))
  }
}


  // Check if all users are selected
  useEffect(() => {
    if (users.length > 0 && state.selectedUsers.length === users.length) {
      setSelectAllUsers(true)
    } else {
      setSelectAllUsers(false)
    }
  }, [state.selectedUsers, users])

 

// isUserSelected
const isUserSelected = (userId) => {
  return state.selectedUsers.some(selectedUser => selectedUser.id === userId)
}


  // Filter users by search term
  const filteredUsers = users.filter(user => 
    `${user.name} ${user.prenom}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleAddBien = () => {
    if (!newBien.trim()) return

    setState((prev) => ({
      ...prev,
      biens: [...(prev.biens || []), { value: newBien.trim() }],
    }))
    setNewBien("")
  }

  const handleRemoveBien = (index) => {
    setState((prev) => ({
      ...prev,
      biens: prev.biens.filter((_, i) => i !== index),
    }))
  }

  // Handlers for views
  const handleAddVue = () => {
    if (!newVue.trim()) return

    setState((prev) => ({
      ...prev,
      vues: [...(prev.vues || []), { value: newVue.trim() }],
    }))
    setNewVue("")
  }

  const handleRemoveVue = (index) => {
    setState((prev) => ({
      ...prev,
      vues: prev.vues.filter((_, i) => i !== index),
    }))
  }

  // Handlers for typologies
  const handleAddTypologie = () => {
    if (!newTypologie.trim()) return

    setState((prev) => ({
      ...prev,
      typologies: [...(prev.typologies || []), { value: newTypologie.trim() }],
    }))
    setNewTypologie("")
  }

  const handleRemoveTypologie = (index) => {
    setState((prev) => ({
      ...prev,
      typologies: prev.typologies.filter((_, i) => i !== index),
    }))
  }

  // Handlers for partners
  const handleAddPartner = () => {
    if (!newPartner.description.trim()) return

    setState((prev) => ({
      ...prev,
      partenaires: [
        ...(prev.partenaires || []),
        {
          description: newPartner.description.trim(),
          remise: Number(newPartner.remise),
        },
      ],
    }))
    setNewPartner({ description: "", remise: 0 })
  }

  const handleRemovePartner = (index) => {
    setState((prev) => ({
      ...prev,
      partenaires: prev.partenaires.filter((_, i) => i !== index),
    }))
  }

  // Add a dev-mode debug panel
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <h4 className="font-semibold mb-1">Debug - ID Mapping:</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(userIdMapping).map(([originalId, localId]) => (
              <div key={originalId}>
                Original ID {originalId} → Local ID {localId}
              </div>
            ))}
          </div>

          {state.selectedUsers.length > 0 && (
            <>
              <h4 className="font-semibold mt-2 mb-1">Selected Users ({state.selectedUsers.length}):</h4>
              <div className="space-y-1">
                {state.selectedUsers.map((user) => (
                  <div key={user.id}>
                    {user.name} {user.prenom} - Original ID: {user.id}, Local ID: {user.localId || "?"}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-md">
      {/* <h2 className="text-xl font-medium mb-6">Paramètres généraux</h2>
 */}
      {/* NEW SECTION: Property Types - Now clearly marked as optional */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">
          Types de bien <span className="text-sm font-normal text-gray-500">(optionnel)</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous pourrez ajouter ou modifier des types de bien après la création du projet.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(state.biens || []).map((bien, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
              <span>{bien.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveBien(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newBien}
            onChange={(e) => setNewBien(e.target.value)}
            placeholder="Ajouter un type de bien"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddBien}
            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* NEW SECTION: Views - Now clearly marked as optional */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">
          Vues <span className="text-sm font-normal text-gray-500">(optionnel)</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous pourrez ajouter ou modifier des vues après la création du projet.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(state.vues || []).map((vue, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
              <span>{vue.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveVue(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newVue}
            onChange={(e) => setNewVue(e.target.value)}
            placeholder="Ajouter une vue"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddVue}
            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* NEW SECTION: Typologies - Now clearly marked as optional */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">
          Typologies <span className="text-sm font-normal text-gray-500">(optionnel)</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous pourrez ajouter ou modifier des typologies après la création du projet.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(state.typologies || []).map((typo, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
              <span>{typo.value}</span>
              <button
                type="button"
                onClick={() => handleRemoveTypologie(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTypologie}
            onChange={(e) => setNewTypologie(e.target.value)}
            placeholder="Ajouter une typologie"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTypologie}
            className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* NEW SECTION: Partners - Now clearly marked as optional */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">
          Partenaires <span className="text-sm font-normal text-gray-500">(optionnel)</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous pourrez ajouter ou modifier des partenaires après la création du projet.
        </p>

        <div className="space-y-3 mb-4">
          {(state.partenaires || []).map((partner, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2">
              <div>
                <span className="font-medium">{partner.description}</span>
                <span className="ml-2 text-sm text-gray-600">- Remise: {partner.remise}%</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePartner(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newPartner.description}
              onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
              placeholder="Description du partenaire"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={newPartner.remise}
                onChange={(e) => setNewPartner({ ...newPartner, remise: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddPartner}
                className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Access - Replaced with dropdown */}
      <div className="mt-8 border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Utilisateurs avec accès au projet <span className="text-red-500">*</span>
        </label>

        {fetchingUsers ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Dropdown toggle button */}
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>
                {state.selectedUsers.length > 0 
                  ? `${state.selectedUsers.length} utilisateur(s) sélectionné(s)` 
                  : "Sélectionner les utilisateurs"}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showUserDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {/* Search input */}
                <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Select all option */}
                <div className="p-2 border-b border-gray-200 sticky top-10 bg-white">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAllUsers}
                      onChange={toggleSelectAllUsers}
                      className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium">Sélectionner tout</span>
                  </label>
                </div>

                {/* User list */}
                <div className="py-1">
                  {filteredUsers.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Aucun utilisateur trouvé</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="px-2 py-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isUserSelected(user.id)}
                            onChange={() => handleUserChange(user.id)}
                            className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 block text-sm">
                            {user.name} {user.prenom}
                          </span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show selected users as tags */}
        {state.selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {state.selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                <span>{user.name} {user.prenom}</span>
                <button 
                  type="button" 
                  onClick={() => handleUserChange(user.id)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {errors?.selectedUsers && <p className="mt-1 text-sm text-red-600">{errors.selectedUsers[0]}</p>}
      </div>

      {/* <DebugPanel />
 */}
      <div className="flex justify-between pt-8">
        <Button
          type="button"
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Précédent
        </Button>
        <Button
          type="submit"
          onClick={onNext}
          disabled={loading||(state.selectedUsers.length == 0)}
          //className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Création en cours...
            </>
          ) : (
            "Créer le projet"
          )}
        </Button>
      </div>
    </div>
  )
}

