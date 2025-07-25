"use client";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import LoadingSpin from "@/components/LoadingSpin";

export default function Modal_Historique_rel_rdv({
  onClose,
  rows_histo_rel_rdv,
  loading_h_rel,
}) {
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "RELANCE":
        return "text-[#666CFF] font-semibold";
      case "RDV":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  const getTraitementBadgeStyle = (type_traite) => {
    const styles = {
      "En Attente": "text-orange-500",
      Automatique: "text-green-600",
      Manuelle: "text-[#666CFF]",
      "Nouvelle relance manuelle": "text-[#A52A2A]",
      "Nouveau rdv manuel": "text-[#7B473D]",
      "Ancienne Relance": "text-[#2F4F4F]",
      "Ancien Rdv": "text-[#2F4F4F]",
    };
    return styles[type_traite] || "text-gray-600";
  };

  const Row_rel = ({ row }) => {
    const [open_r, setOpen_r] = useState(false);
    const isExpandable = [
      "En Attente",
      "Ancienne Relance",
      "Ancien Rdv",
    ].includes(row.type_traite);

    return (
      <>
        <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
          <td className="px-4 py-3 text-center">
            {isExpandable && (
              <button
                aria-label={open_r ? "collapse row" : "expand row"}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setOpen_r(!open_r)}
              >
                {open_r ? (
                  <ChevronUpIcon size={18} className="text-gray-600" />
                ) : (
                  <ChevronDownIcon size={18} className="text-gray-600" />
                )}
              </button>
            )}
          </td>

          <td className="px-4 py-3 text-center font-medium">{row.etape}</td>
          <td
            className={`px-4 py-3 text-center ${getTypeBadgeStyle(row.type)}`}
          >
            {row.type}
          </td>
          <td className="px-4 py-3 text-center">{row.responsable}</td>
          <td
            className={`px-4 py-3 text-center ${getTraitementBadgeStyle(
              row.type_traite
            )}`}
          >
            {row.type_traite}
          </td>
          <td className="px-4 py-3 text-center">{row.responsable_traite}</td>
          <td className="px-4 py-3 text-center font-medium">
            {row.date_traite}
          </td>
          <td className="px-4 py-3 text-center">{row.commentaire}</td>
        </tr>

        {isExpandable && (
          <tr className="border-b">
            <td colSpan={8} className="p-0 bg-gray-50">
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  open_r ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="p-4">
                  <h6 className="text-md font-semibold mb-3 !text-gray-700 flex items-center">
                    <span className="w-1.5 h-5 bg-blue-600 rounded-sm mr-2"></span>
                    Détails supplémentaires
                  </h6>
                  <div className="overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-blue-50">
                        <tr>
                          {row.type === "Relance" ? (
                            <>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Mode Relance
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Date de Relance
                              </th>
                            </>
                          ) : (
                            <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                              RDV
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          {row.type === "Relance" ? (
                            <>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.mode_relance || "-"}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.date_relance || "-"}
                              </td>
                            </>
                          ) : (
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {row.rdv || "-"}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  if (loading_h_rel) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Historique Relance/Rendez-Vous
          </h1>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors duration-200"
            aria-label="Fermer"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr style={{ background: "#bfdbfe" }}>
                  <th scope="col" className="px-4 py-3 w-12"></th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-70 uppercase tracking-wider"
                  >
                    VISITE
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    TYPE
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    RESPONSABLE
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    TYPE TRAITEMENT
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    RESPONSABLE TRAITEMENT
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    DATE TRAITEMENT
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium !text-gray-700 uppercase tracking-wider"
                  >
                    COMMENTAIRE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows_histo_rel_rdv.map((row, index) => (
                  <Row_rel key={row.id || `row-${index}`} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
