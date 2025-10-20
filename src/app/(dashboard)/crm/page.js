"use client";
import { useAuth } from '@/context/AuthContext';
import LoadingSpin from '@/components/LoadingSpin';
import { CRMPage } from '../../../components/CRM/CrmPage'; 

export default function CRM() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingSpin />;
  }

  return (
  <div className="w-full min-h-[89vh] bg-white rounded-lg shadow-md p-4">
    <CRMPage />;
  </div>
  )
}