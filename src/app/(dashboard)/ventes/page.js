"use client";
import { useRouter } from 'next/navigation';
import { VentePage } from '../../../components/Vente/ventePage'

export default function page() {
  const router = useRouter();
  
  
  return (
    <div className="w-full min-h-[89vh] bg-white rounded-lg shadow-md p-4">
      <VentePage />
    </div>
  );
}
