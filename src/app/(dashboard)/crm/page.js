"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isCommercial } from '@/configs/enum';
import LoadingSpin from '@/components/LoadingSpin';

export default function CRMPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to prospects page by default
  useEffect(() => {
    if (user) {
      // If user is commercial, redirect directly to assigned prospects view
      if (isCommercial(user.role)) {
        router.push('/crm/prospects?view=assigned');
      } else {
        // For admin/super admin, redirect to all prospects
        router.push('/crm/prospects');
      }
    }
  }, [router, user]);

  return (
   <LoadingSpin />
  );
}
