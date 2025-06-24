import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TraiterCommissionForm({ ID, userName, montantInitial, accessToken, onClose, refreshData }) {
  const [inputs, setInputs] = useState([]) // données des commissions cumulées
  const [checkedItemsCumul, setCheckedItemsCumul] = useState({})
  const [totalMontantSelected, setTotalMontantSelected] = useState(0)
  const [montantCommissionNow, setMontantCommissionNow] = useState(montantInitial || 0)
  const [montantCommissionNowNonEdit, setMontantCommissionNowNonEdit] = useState(montantInitial || 0)
  const [totalMontantFinale, setTotalMontantFinale] = useState(montantInitial || 0)
  const [totalCommissionCumulEtNow, setTotalCommissionCumulEtNow] = useState(0)
  const [modePaiement, setModePaiement] = useState('complet')
  const [dateTraitement, setDateTraitement] = useState('')
  const [errors, setErrors] = useState(null)
  const [disabledVar, setDisabledVar] = useState(false)

  // Charger les commissions cumulées (à appeler au montage ou à l'ouverture)
  const fetchCumuleCommission = async (us_id, montant_now) => {
    try {
      const response = await axios.get(`/cummulles_commissions/${us_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const data = response.data
      setInputs(data.cummules_commission || [])

      // Initialiser les checkboxes à false
      const initialChecked = {}
      (data.cummules_commission || []).forEach(item => {
        initialChecked[item.id] = false
      })
      setCheckedItemsCumul(initialChecked)

      // Calculer la somme
      const somme = (data.cummules_commission || []).reduce((acc, item) => acc + item.montant, 0)
      setTotalCommissionCumulEtNow(somme + montant_now)
    } catch (error) {
      console.error('Erreur fetch commissions cumulées:', error)
    }
  }

  // Gérer le changement des checkboxes
  const handleCheckboxChange = (id, montant) => {
    setCheckedItemsCumul(prev => {
      const newChecked = { ...prev, [id]: !prev[id] }
      const selectedMontants = inputs.reduce((acc, item) => acc + (newChecked[item.id] ? item.montant : 0), 0)
      setTotalMontantSelected(selectedMontants)
      const somme = selectedMontants + montantCommissionNowNonEdit
      setTotalMontantFinale(somme)

      if (modePaiement === 'moitie') {
        setMontantCommissionNow(somme / 2)
      } else {
        setMontantCommissionNow(somme)
      }
      return newChecked
    })
  }

  // Changer le mode de paiement
  const handleChangeModePaiement = e => {
    setModePaiement(e.target.value)
    if (e.target.value === 'moitie') {
      setMontantCommissionNow(totalMontantFinale / 2)
    } else {
      setMontantCommissionNow(totalMontantFinale)
    }
  }

  // Soumettre le formulaire
  const onSubmitTraiter = async e => {
    e.preventDefault()
    setDisabledVar(true)
    setErrors(null)

    try {
      const formData = new FormData()
      formData.append('projet_id', JSON.parse(localStorage.getItem('selectedProjet'))?.id || '')
      formData.append('checkedItemsCumul', JSON.stringify(checkedItemsCumul))
      formData.append('total_commission_cumul_et_now', totalCommissionCumulEtNow)
      formData.append('montant', montantCommissionNow)
      formData.append('mode_paiement', modePaiement)
      formData.append('date_traitement', dateTraitement)

      const res = await axios.post(`/traiter_commission/${ID}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (res.status === 200) {
        toast.success('Commission traitée avec succès')
        onClose()
        if (refreshData) refreshData()
      } else if (res.status === 422) {
        setErrors(res.data.response?.data?.errors || { form: ['Erreur de validation'] })
      }
    } catch (error) {
      setErrors({ form: ['Erreur lors de la soumission'] })
      console.error(error)
    } finally {
      setDisabledVar(false)
    }
  }

  // Charger les commissions cumulées au premier rendu
  React.useEffect(() => {
    if (ID) fetchCumuleCommission(ID, montantInitial)
  }, [ID, montantInitial])

  return (
    <div className="p-6 bg-white rounded shadow max-w-lg mx-auto">
      <h2 className="text-center text-2xl font-bold mb-6 text-purple-700">Traiter une Commission</h2>

      <form onSubmit={onSubmitTraiter} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Commercial :</label>
          <input
            type="text"
            value={userName}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {inputs.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-2 py-1">Montant Cumulé</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map(item => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="px-2 py-1">{item.montant}</td>
                    <td className="px-2 py-1">
                      <input
                        type="checkbox"
                        checked={checkedItemsCumul[item.id] || false}
                        onChange={() => handleCheckboxChange(item.id, item.montant)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">Montant :</label>
          <input
            type="text"
            value={montantCommissionNow}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Mode Remboursement :</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode_paiement"
                value="moitie"
                checked={modePaiement === 'moitie'}
                onChange={handleChangeModePaiement}
                required
                className="cursor-pointer"
              />
              <span>Moitié</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode_paiement"
                value="complet"
                checked={modePaiement === 'complet'}
                onChange={handleChangeModePaiement}
                required
                className="cursor-pointer"
              />
              <span>Complet</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Date Traitement :</label>
          <input
            type="date"
            value={dateTraitement}
            onChange={e => setDateTraitement(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {errors && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {Object.keys(errors).map(key =>
              errors[key].map((msg, idx) => <p key={`${key}-${idx}`}>{msg}</p>)
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={disabledVar}
            className={`px-4 py-2 rounded text-white ${
              disabledVar ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
