"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function CreateSociete() {
  const [societe, setSociete] = useState({
    raison_sociale: "",
    ice: "",
    if: "",
    rc: "",
    adresse: "",
    telephone: "",
    email: "",
    site_web: "",
    nom_contact: "",    // Added required field
    prenom_contact: ""  // Added required field
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setSociete({ ...societe, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const token = window.localStorage.getItem('accessToken');
      
      // Create the societe (this will trigger database creation)
      const response = await axios.post(
        "http://ec2-16-16-56-93.eu-north-1.compute.amazonaws.com/api/societe",
        societe,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Societe created:", response.data);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/Societes");
      }, 1500);
    } catch (err) {
      console.error("Error creating societe:", err);
      setError(err.response?.data?.message || `Une erreur est survenue: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajouter une société</h1>
        <Link href="/Societes" className="text-blue-500 hover:underline">
          Retour à la liste
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 !text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 !text-green-700 p-4 mb-4" role="alert">
          <p>Société créée avec succès! Base de données en cours de création...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="nom_contact">Nom du contact: <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="nom_contact"
              name="nom_contact"
              value={societe.nom_contact}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="prenom_contact">Prénom du contact: <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="prenom_contact"
              name="prenom_contact"
              value={societe.prenom_contact}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="raison_sociale">Raison Sociale: <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="raison_sociale"
              name="raison_sociale"
              value={societe.raison_sociale}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="ice">ICE:</label>
            <input
              type="text"
              id="ice"
              name="ice"
              value={societe.ice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="if">IF:</label>
            <input
              type="text"
              id="if"
              name="if"
              value={societe.if}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="rc">RC:</label>
            <input
              type="text"
              id="rc"
              name="rc"
              value={societe.rc}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="adresse">Adresse:</label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={societe.adresse}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="telephone">Téléphone:</label>
            <input
              type="text"
              id="telephone"
              name="telephone"
              value={societe.telephone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={societe.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block !text-gray-700 mb-2" htmlFor="site_web">Site Web:</label>
            <input
              type="text"
              id="site_web"
              name="site_web"
              value={societe.site_web}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button 
            type="submit" 
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${submitting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {submitting ? 'Création en cours...' : 'Créer la société'}
          </button>
          <Link 
            href="/Societes"
            className="px-4 py-2 bg-gray-300 !text-gray-800 rounded hover:bg-gray-400"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
