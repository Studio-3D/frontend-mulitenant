"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { APIURL } from "@/configs/api";
import Modal from "@/components/Modal";

const BanqueModal = ({ isOpen, onClose, onSuccess, token, banque }) => {
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});

  useEffect(() => {
    if (banque) {
      setNom(banque.nom);
    } else {
      setNom("");
    }
  }, [banque]);

  const handleSubmit = async () => {
    if (!nom.trim()) {
      toast.error("Le nom de la banque est requis");
      return;
    }

    setLoading(true);
    setBackendErrors({});

    const dataToSend = new FormData();
    dataToSend.append("nom", nom);

    let url = APIURL.BANQUES;
    let method = "post";

    if (banque) {
      url = `${url}/${banque.id}`;
      method = "put";
    }

    try {
      const res = await axios({
        method,
        url,
        data: dataToSend,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let message = "Quelque chose ne va pas bien";
      if (res.status === 200) {
        message = `La banque a été ${
          banque ? "modifiée" : "ajoutée"
        } avec succès !`;
        toast.success(message);
        setNom(""); // Clear form after submission
        if (onClose) onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      const response = error.response;
      if (response?.status === 422) {
        setBackendErrors(response.data.errors || {});
        toast.error(response.data.message || "Erreur de validation.");
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error("Une erreur s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isVisible={true} onClose={onClose}>
      <div className="p-4 w-[600px]">
        <h2 className="text-xl font-semibold mb-4">
          {banque ? "Modifier la banque" : "Ajouter une banque"}
        </h2>

        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom de la banque"
          className="w-full p-2 border rounded mb-2"
        />

        {backendErrors?.nom && (
          <p className="text-red-600 text-sm mb-2">{backendErrors.nom[0]}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className={`px-4 py-2 bg-green-600 text-white rounded ${
              loading ? "opacity-50" : ""
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BanqueModal;
