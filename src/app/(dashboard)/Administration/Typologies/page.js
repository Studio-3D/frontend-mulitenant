"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import { TbArrowBackUp } from "react-icons/tb";
import Link from "next/link";
import axios from "axios";
import { APIURL } from "@/configs/api";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import TypologieTable from "./TypologieTable";
import TypologieFilter from "./TypologieFilter";
import TypologieForm from "./TypologieForm";

export default function TypologiesPage() {
  const [action, setAction] = useState(null);
  const [typologieId, setTypologieId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [typologies, setTypologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get("action");
    const idParam = searchParams.get("id");

    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setTypologieId(idParam || null);

    // Load data if we're on the main page
    if (!actionParam) {
      fetchTypologies();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchTypologies = async (filters = {}) => {
    if (!selectedProjet) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(APIURL.TYPOLOGIES, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          projet_id: selectedProjet.id,
          ...filters,
        },
      });

      setTypologies(response.data.typologies || []);
    } catch (error) {
      console.error("Error fetching typologies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchTypologies(values);
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === "edit") {
      router.push(`/administration/typologies?action=edit&id=${row}`);
    } else if (actionType === "delete") {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace("/administration/typologies");
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }

  if (!selectedProjet && !action) {
    return (
      <div>Veuillez sélectionner un projet pour accéder aux typologies.</div>
    );
  }

  // Show form for add/edit actions
  if (action === "add" || action === "edit") {
    return (
      <TypologieForm
        id={action === "edit" ? typologieId : null}
        onComplete={handleFormComplete}
      />
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Typologies</h1>

      {showFilter && (
        <TypologieFilter
          onSubmit={handleFilterSubmit}
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}

      <TypologieTable
        data={typologies}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push("/administration/typologies?action=add")}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchTypologies(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="TYPOLOGIES"
        itemLabel={rowToDelete?.typologie}
        entityId={rowToDelete?.id}
        data={typologies}
        onDeleted={() => fetchTypologies(filterParams)} // <- ici
      />
    </div>
  );
}
