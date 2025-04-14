'use client';
import { IoAlertCircleOutline } from "react-icons/io5";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from "@/configs/api";
import Modal from "@/components/Modal";
import { useState } from "react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  entityName,    // ex: "VUES"
  itemLabel,     // ex: "Ma Vue"
  entityId,
  data,
  onDeleted
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Token manquant !");
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${APIURL[entityName]}/${entityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Met à jour les données
      onDeleted?.(); // <- appelle fetchBanques
      toast.success(`${itemLabel} supprimé(e) avec succès`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isVisible={true} onClose={onClose}>
      <div className="w-[500px] p-4">
        <IoAlertCircleOutline className="text-[#FF4E4E] text-6xl mx-auto mt-2 mb-4" />
        <h2 className="text-xl font-semibold text-center">Confirmation de suppression</h2>
        <p className="text-center text-[#878484] mt-2">
          Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{itemLabel}</span> ?
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200"
            onClick={onClose}
          >
            Non, annuler
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-[#FF4E4E] text-white ${loading ? "opacity-50" : ""}`}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Oui, supprimer"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
