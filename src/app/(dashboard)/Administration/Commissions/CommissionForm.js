"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import { useProjet } from "@/context/ProjetContext";

export default function CommissionForm({ id = null, onComplete }) {
  const router = useRouter();
  const { selectedProjet } = useProjet();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg_alert, setMsg_alert] = useState(null);

  // Form state
  const [commissionMontant, setCommissionMontant] = useState("");
  const [inputs, setInputs] = useState([{ de: "", a: "", pourcentage: "" }]);

  // Fetch existing configuration if any
  useEffect(() => {
    if (!selectedProjet) return;

    const fetchCommissionMontant = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${APIURL.ROOTV1}/commission_montant/${selectedProjet.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.commission_montant) {
          setCommissionMontant(response.data.commission_montant.montant || "");
        }
      } catch (error) {
        console.error("Error fetching commission montant:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchConfiguration = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${APIURL.ROOTV1}/configurations_commissions/${selectedProjet.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (
          response.data &&
          response.data.configurations &&
          response.data.configurations.length > 0
        ) {
          setInputs(response.data.configurations);
        }
      } catch (error) {
        console.error("Error fetching commission configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionMontant();
    fetchConfiguration();
  }, [selectedProjet]);

  const handleAddInput = () => {
    setInputs([...inputs, { de: "", a: "", pourcentage: "" }]);
  };

  const handleChange = (event, index) => {
    let { name, value } = event.target;
    let onChangeValue = [...inputs];
    onChangeValue[index][name] = value;
    setInputs(onChangeValue);

    // Validation logic similar to old frontend
    if (name === "pourcentage") {
      if (value === "0" || parseFloat(value) <= 0) {
        setMsg_alert(
          `Le pourcentage ne doit pas être égal à zéro ni être négatif à la ligne ${
            index + 1
          }`
        );
      } else if (parseFloat(value) > 100) {
        setMsg_alert(
          `Le pourcentage ne doit pas dépasser 100% à la ligne ${index + 1}`
        );
      } else {
        setMsg_alert(null);
      }
    }

    if (name === "de") {
      // Not the first interval
      if (index > 0) {
        // Check if "de" value is greater than previous "a" value
        if (parseFloat(value) <= parseFloat(inputs[index - 1].a)) {
          setMsg_alert(
            `La valeur "De" ne doit pas débuter par ${value} à la ligne ${
              index + 1
            }`
          );
        } else {
          setMsg_alert(null);
        }
      }
    }
  };

  const handleDeleteInput = (index) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
  };

  const handleMontantChange = (e) => {
    setCommissionMontant(e.target.value);
  };

  const validateForm = () => {
    // Validate intervals
    for (let i = 1; i < inputs.length; i++) {
      if (parseFloat(inputs[i].de) <= parseFloat(inputs[i - 1].a)) {
        setMsg_alert(
          `La valeur "De" ne doit pas débuter par ${inputs[i].de} à la ligne ${
            i + 1
          }`
        );
        return false;
      }
    }

    // Check if all fields are filled
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].de || !inputs[i].a || !inputs[i].pourcentage) {
        setMsg_alert(
          `Tous les champs doivent être remplis à la ligne ${i + 1}`
        );
        return false;
      }

      if (
        parseFloat(inputs[i].pourcentage) <= 0 ||
        parseFloat(inputs[i].pourcentage) > 100
      ) {
        setMsg_alert(
          `Le pourcentage doit être entre 1 et 100 à la ligne ${i + 1}`
        );
        return false;
      }
    }

    if (!commissionMontant) {
      setMsg_alert("Le montant fixe de la commission est requis");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      const formData = {
        projet_id: selectedProjet.id,
        commission_montant: commissionMontant,
        configuration: JSON.stringify(inputs), // Convert array to JSON string
      };

      // Use the correct endpoint that works with your backend
      await axios.post(APIURL.COMMISSIONSCONFIGURATIONS, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Configuration des commissions enregistrée avec succès");
      router.push("/administration/commissions"); // Changed from '/Administration' to '/Administration/Commissions'
    } catch (error) {
      console.error("Error submitting commission config:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">
        Configuration des commissions
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1"></div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant Fixe <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={commissionMontant}
                onChange={handleMontantChange}
              />
            </div>
            <div className="md:col-span-1"></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-purple-100 p-3 rounded-t-md border-l-4 border-purple-500 mb-4">
            <h3 className="font-medium text-purple-700">Configuration</h3>
          </div>

          {msg_alert && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <p className="text-amber-700">{msg_alert}</p>
            </div>
          )}

          {inputs.map((input, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4 items-end"
            >
              <div className="md:col-span-1 flex items-center justify-end h-[38px]">
                <span className="text-sm font-medium text-gray-700">
                  Configuration {index + 1}
                </span>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  De
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="de"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={input.de}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  A
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="a"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={input.a}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  name="pourcentage"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={input.pourcentage}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteInput(index)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  >
                    Supprimer
                  </button>
                )}
                {index === inputs.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddInput}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    disabled={msg_alert !== null}
                  >
                    Ajouter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t pt-4">
          <button
            type="submit"
            disabled={
              submitting || msg_alert !== null || commissionMontant === ""
            }
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
