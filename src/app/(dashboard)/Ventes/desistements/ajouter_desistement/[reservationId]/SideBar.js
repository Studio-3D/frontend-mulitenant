import React from 'react'
import { UserIcon } from 'lucide-react'
export function SideBar() {
  return (
   <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="col-span-3 grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Code Réservation:</div>
              <div className="font-medium">codee z apt</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Bien:</div>
              <div className="font-medium">Appt z</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Prix:</div>
              <div className="font-medium text-indigo-600">45000 DH</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Avances:</div>
              <div className="font-medium text-green-600">45000 DH</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date Réservation:</div>
              <div className="font-medium">22/04/2025</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Responsable:</div>
              <div className="font-medium">admin_p2 admin_p3</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Client 1:</div>
            <div className="font-medium">nnn_1 ppp_1 100%</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-l pl-4">
          <div className="bg-gray-100 rounded-full p-4 mb-3">
            <UserIcon size={32} className="text-gray-600" />
          </div>
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
            Voir Dossier
          </button>
        </div>
      </div>
    </div>
  )
}
