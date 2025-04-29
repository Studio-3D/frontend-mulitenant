'use client';

import Button from '@/components/Button';

import { FaRegEye } from 'react-icons/fa';

export default function Modal_Propsepct_Exist({
  onClose,
  info_client_1,
  id_appel,
  id_visite,
  client_prospect,
}) {
  function handle_click_appel(appelId) {
    window.open(`/appels/${appelId}`, '_blank');
  }
  function handle_click_visite(vId) {
    window.open(`/visites/${vId}`, '_blank');
  }

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="w-full h-[60px] bg-[#5483b3] px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Information
          </h1>
        </div>
      </div>

      <div className="p-4 w-[600px] ">
        <div className="text-center space-y-4">
          {/* First Row */}
          <div>
            <h5 className="text-red-500 text-base sm:text-lg font-medium mt-0 mb-2 leading-6">
              {info_client_1}
            </h5>
          </div>

          {/* Second Row */}
          <div>
            <h5 className="text-base sm:text-lg font-medium">
              {client_prospect}
            </h5>
          </div>

          {/* Conditional: Call Made */}
          {id_appel != null && (
            <div>
              <h5 className="text-base sm:text-lg font-medium flex items-center justify-center">
                {'A Déja fait un Appel'}
                <div className="ml-2">
                  <FaRegEye
                    className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Voir détails"
                    onClick={() => handle_click_appel(id_appel)}
                  />
                </div>
              </h5>
            </div>
          )}

          {/* Conditional: Visit Made */}
          {id_visite != null && (
            <div>
              <h5 className="text-base sm:text-lg font-medium flex items-center justify-center">
                {'A Déja fait une Visite'}
                <div className="ml-2">
                  <FaRegEye
                    className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Voir détails"
                    onClick={() => handle_click_visite(id_visite)}
                  />
                </div>
              </h5>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-[10%]">
            <Button type="button" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
