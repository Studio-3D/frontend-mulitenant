import React from 'react';
import { PlusIcon } from 'lucide-react';
import format from 'date-fns/format';
import { useRouter } from 'next/navigation';

export function VisitTimeline(props) {
  const router = useRouter();
  const { activeVisit, onVisitSelect, visites_all_show, origin_id } = props;

  const handleAdd = (vId) => {
    router.push(`/crm/visites/ajouter-nouvelle-visite/${vId}`);
  };

  return (
    <div className="relative">
      {/* Line connector */}
      <div className="absolute left-8 top-[60px] bottom-8 w-0.5 bg-gradient-to-b from-blue-200 to-transparent" />

      {/* Visits container with vertical-only scroll */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto overflow-x-hidden">
        {/* Plus button - completely unchanged from original */}
        <button onClick={() => handleAdd(origin_id)} className="w-full group">
          <div className="relative flex items-center">
            <div className="relative z-10 w-16 h-16 rounded-2xl border-2 border-dashed border-blue-300 bg-white flex items-center justify-center group-hover:border-blue-400 transition-all duration-300 group-hover:scale-105">
              <PlusIcon className="h-8 w-8 !text-blue-400" />
            </div>
            <div className="ml-6">
              <span className="font-medium !text-gray-600 group-hover:text-blue-600 transition-colors">
                Nouvelle Visite
              </span>
            </div>
          </div>
        </button>

        {/* Visits list */}
        {visites_all_show.map((visit, i) => (
          <button
            key={visit.id}
            onClick={() => onVisitSelect(visit.related_show_id)}
            className="w-full group"
          >
            <div className="relative flex items-center">
              <div
                className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center
                  transition-all duration-300 group-hover:scale-105
                  ${
                    visit.related_show_id == activeVisit
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200'
                      : 'bg-white/80 backdrop-blur-sm border border-white/20 !text-gray-600 group-hover:bg-white'
                  }
                `}
              >
                <span className="text-2xl font-bold">
                  {visites_all_show.length - i}
                </span>
              </div>

              <div className="ml-6">
                <span
                  className={`font-medium transition-colors duration-300 ${
                    visit.related_show_id == activeVisit
                      ? 'text-[#2563eb]'
                      : 'text-gray-600'
                  }`}
                >
                  {'V' + (visites_all_show.length - i)}
                </span>
                <p className="text-sm !text-gray-500 mt-0.5">
                  {format(new Date(visit.created_at), 'dd/MM/yyyy')}
                </p>
              </div>

              {visit.related_show_id == activeVisit && (
                <div className="absolute -inset-x-4 -inset-y-3 border-2 border-blue-100 rounded-2xl bg-blue-50/30" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}