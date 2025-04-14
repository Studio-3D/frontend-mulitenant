"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoadingSpin from "../components/LoadingSpin"; // Import your loading spinner component

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If user is logged in, redirect to dashboard, otherwise to login
      if (user) {
        router.push('/Tableau-de-Bord');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpin /> {/* Use your loading spinner here */}
    </div>
  );
}
