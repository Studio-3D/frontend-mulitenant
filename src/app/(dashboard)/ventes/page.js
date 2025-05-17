"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';

export default function VentePage() {
  const router = useRouter();
  
  // Redirect to prospects page by default
  useEffect(() => {
    router.push('/ventes/reservations');
  }, [router]);
  
  return (
   <LoadingSpin />
  );
}
