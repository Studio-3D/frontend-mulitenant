"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';

export default function CRMPage() {
  const router = useRouter();
  
  // Redirect to prospects page by default
  useEffect(() => {
    router.push('/crm/prospects');
  }, [router]);
  
  return (
   <LoadingSpin />
  );
}
