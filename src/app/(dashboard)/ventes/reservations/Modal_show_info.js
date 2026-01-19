'use client';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Modal_show_info({ onClose, text, statut_dst, dst_id }) {
  const router = useRouter();

  // Delete user handler
  const handle_dossier_desiste_rejete = () => {
    router.push(`/ventes/desistements/corriger_desistement/${dst_id}`);
  };

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-[#111827] px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Information
          </h1>
        </div>
      </div>
      <p className="text-center text-[#878484] mt-2">{text}</p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        {statut_dst == 0 ? (
          <button
            className="font-medium px-4 py-2 rounded-lg bg-gray-200"
            onClick={onClose}
          >
            OK
          </button>
        ) : (
          <button
            className="font-medium px-4 py-2 rounded-lg bg-green-200"
            onClick={handle_dossier_desiste_rejete}
          >
            Voir Dossier
          </button>
        )}
      </div>
    </div>
  );
}