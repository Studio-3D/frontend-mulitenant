"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CRMPage() {
  const router = useRouter();
  
  // Redirect to prospects page by default
  useEffect(() => {
    router.push('/crm/prospects');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}
