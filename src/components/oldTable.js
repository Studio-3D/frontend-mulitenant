"use client"
import { useState } from "react"
import Link from "next/link"
import { CiFilter, CiSearch } from "react-icons/ci"
import { FaRegEye } from "react-icons/fa"
import { FaEdit } from "react-icons/fa"
import { FaUserSlash } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import { HiChevronRight, HiChevronLeft } from "react-icons/hi"
import { FaFileExcel } from "react-icons/fa"
import DeleteUser from "../app/(dashboard)/Utilisateurs/DeleteUser"
import BlockUser from "../app/(dashboard)/Utilisateurs/BlockUser"
import Modal from "./Modal"

const Table = ({
  columns = [],
  data = [],
  onAction,
  onSearch,
  searchTerm = "",
  addButtonLink = "",
  addButtonText = "Ajouter",
  enableExport = false,
  onExport = null,
  loading = false,
  currentUser = null,
  pagination = { page: 1, pageSize: 10, total: 0 },
  onPageChange,
  onPageSizeChange,
  availableActions = ["view", "edit", "block", "delete"], // Default actions
}) => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  // Calculate pagination values
  const totalPages = pagination.total
    ? Math.ceil(pagination.total / pagination.pageSize)
    : Math.ceil(data.length / pagination.pageSize)
  const currentPage = pagination.page || 1

  // Handle action buttons
  const handleAction = (action, item) => {
    setSelectedItem(item)

    switch (action) {
      case "view":
        if (onAction) onAction("view", item.id)
        else setShowViewModal(true)
        break
      case "edit":
        if (onAction) onAction("edit", item.id)
        else setShowEditModal(true)
        break
      case "block":
        if (onAction) onAction("block", item.id)
        else setShowBlockModal(true)
        break
      case "delete":
        if (onAction) onAction("delete", item.id)
        else setShowDeleteModal(true)
        break
      default:
        if (onAction) onAction(action, item.id)
        break
    }
  }

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const size = Number.parseInt(e.target.value)
    if (onPageSizeChange) onPageSizeChange(size)
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          {/* Filter and search bar */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <CiFilter className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CiSearch className="w-5 h-5 text-gray-400" />
              </div>
              <input
                className="bg-white border border-gray-300 text-gray-600 text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                type="text"
                placeholder="Chercher ..."
                value={localSearchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {addButtonLink && (
              <Link
                href={addButtonLink}
                className="bg-teal-500 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-teal-600 transition-colors"
              >
                {addButtonText}
              </Link>
            )}

            {enableExport && (
              <button 
                className="bg-green-600 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-green-700 transition-colors flex items-center gap-1"
                onClick={onExport}
              >
                <FaFileExcel className="w-4 h-4" />
                Exporter
              </button>
            )}
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-yellow-700">
                {localSearchTerm ? "Aucun résultat pour cette recherche." : "Aucune donnée disponible."}
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={`${row.id}-${column.key}`} className="py-4 px-4 whitespace-nowrap">
                        {column.key === "nomComplet" ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                              <img
                                src={
                                  row.avatar ||
                                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" ||
                                  "/placeholder.svg"
                                }
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null
                                  e.target.src =
                                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 font-medium">{row[column.key]}</span>
                          </div>
                        ) : column.key === "status" ? (
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              row[column.key] === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {row[column.key]}
                          </span>
                        ) : column.key === "role" || column.key === "type" ? (
                          <span className="text-sm text-gray-500">{row[column.key]}</span>
                        ) : (
                          <span className="text-sm text-gray-500">{row[column.key]}</span>
                        )}
                      </td>
                    ))}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex gap-4 items-center">
                        {availableActions.includes("view") && (
                          <button
                            className="text-teal-500 hover:text-teal-700"
                            onClick={() => handleAction("view", row)}
                            title="Voir"
                          >
                            <FaRegEye className="w-4 h-4" />
                          </button>
                        )}

                        {availableActions.includes("edit") && (
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleAction("edit", row)}
                            title="Modifier"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Don't show block/delete for current user */}
                        {(!currentUser || row.id !== currentUser.id) && (
                          <>
                            {availableActions.includes("block") && (
                              <button
                                className="text-amber-500 hover:text-amber-700"
                                onClick={() => handleAction("block", row)}
                                title="Bloquer/Débloquer"
                              >
                                <FaUserSlash className="w-4 h-4" />
                              </button>
                            )}

                            {availableActions.includes("delete") && (
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleAction("delete", row)}
                                title="Supprimer"
                              >
                                <RiDeleteBin6Line className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {data.length > 0 && (
            <div className="flex justify-between items-center py-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">Lignes par page:</span>
                <select
                  className="border rounded px-2 py-1 bg-white text-sm"
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <HiChevronLeft className={`w-5 h-5 ${currentPage <= 1 ? "text-gray-300" : "text-gray-500"}`} />
                </button>

                <span className="mx-2">
                  {currentPage} sur {totalPages || 1}
                </span>

                <button
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <HiChevronRight
                    className={`w-5 h-5 ${currentPage >= totalPages ? "text-gray-300" : "text-gray-500"}`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isVisible={showViewModal} onClose={() => setShowViewModal(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Détails de l'utilisateur</h3>
          {selectedItem && (
            <div className="space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={
                      selectedItem.avatar ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" ||
                      "/placeholder.svg"
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p>
                <strong>Nom:</strong> {selectedItem.nomComplet}
              </p>
              <p>
                <strong>Email:</strong> {selectedItem.email}
              </p>
              <p>
                <strong>Téléphone:</strong> {selectedItem.telephone}
              </p>
              <p>
                <strong>Rôle:</strong> {selectedItem.role}
              </p>
              <p>
                <strong>Statut:</strong> {selectedItem.status}
              </p>
              <p>
                <strong>Société:</strong> {selectedItem.societe}
              </p>
              <p>
                <strong>Date d'ajout:</strong> {selectedItem.date}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isVisible={showBlockModal} onClose={() => setShowBlockModal(false)}>
        {selectedItem && <BlockUser user={selectedItem} onClose={() => setShowBlockModal(false)} />}
      </Modal>

      <Modal isVisible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        {selectedItem && <DeleteUser user={selectedItem} onClose={() => setShowDeleteModal(false)} />}
      </Modal>
    </>
  )
}

export default Table
