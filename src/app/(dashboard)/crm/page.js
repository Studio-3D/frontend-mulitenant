"use client";
import { useAuth } from '@/context/AuthContext';
import LoadingSpin from '@/components/LoadingSpin';
import { CRMPage } from '../../../components/CRM/CrmPage'; 

export default function CRM() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingSpin />;
  }

  return <CRMPage />;
}