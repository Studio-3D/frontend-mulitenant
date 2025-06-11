"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import VueTable from "./VueTable";
import VueFilter from "./VueFilter";
import VueForm from "./VueForm";

export default function VuesPage() {
  const [action, setAction] = useState(null);
  const [vueId, setVueId] = useState(null);
  const [vues, setVues] = useState([]);
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
    setVueId(idParam || null);

    // Load data if we're on the main page
    if (!actionParam) {
      fetchVues();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchVues = async (filters = {}) => {
    if (!selectedProjet) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(APIURL.VUES, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          projet_id: selectedProjet.id,
          ...filters,
        },
      });

      setVues(response.data.vues || []);
    } catch (error) {
      console.error("Error fetching vues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchVues(values);
  };

  const handleAction = (actionType, row) => {
    if (actionType === "edit") {
      router.push(`/administration/vues?action=edit&id=${row}`);
    } else if (actionType === "delete") {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace("/administration/vues");
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }


  // Show form for add/edit actions
  if (action === "add" || action === "edit") {
    return (
      <VueForm
        id={action === "edit" ? vueId : null}
        onComplete={handleFormComplete}
      />
    );
  }

  // Main view with table
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="VUES"
        itemLabel={rowToDelete?.vue}
        entityId={rowToDelete?.id}
        data={vues}
        onDeleted={() => fetchVues(filterParams)} // <- ici
      />
      <VueTable
        data={vues}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push("/administration/vues?action=add")}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchVues(filterParams)}
      />
    </div>
  );
}
