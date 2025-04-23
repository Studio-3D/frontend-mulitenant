import React from 'react'

const OldVisites_Perdu_Dialog = ({
  open,
  onClose,
  oldVisites,
  handleSubmit,
  handleChange,
  showVisite,
  loading,
  checkDisabled,
  resetActions,
}) => {
  if (!open) return null

  return (
    <div className="fixefd inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg p-6 relative">
        <div className="bg-[rgb(34,148,206)] text-white px-4 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            Ce prospect a déjà des visites Perdues:
          </h2>
        </div>

        <div className="p-4 overflow-y-auto max-h-[75vh]">
          {oldVisites.length > 0 && (
            <form onSubmit={handleSubmit}>
              {oldVisites.map((x, i) => (
                <div key={i} className="mb-6 mt-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="w-full sm:w-1/4">
                      <label className="font-medium block mb-1">
                        <a
                          href="#"
                          className="text-blue-600 underline hover:no-underline"
                          onClick={() => showVisite(x.origin_id, x.v_cadre_id)}
                        >
                          Visite {i + 1}
                        </a>
                      </label>
                      <input
                        type="text"
                        name="Date"
                        value={x.date}
                        onChange={e => handleChange(e, i, null)}
                        disabled
                        className="w-full border-gray-300 rounded-md text-sm px-3 py-2 bg-gray-100"
                      />
                    </div>

                    <div className="w-full sm:w-1/3">
                      <label className="font-medium block mb-1">Frein {i + 1}</label>
                      <textarea
                        rows={3}
                        name="Frein"
                        value={x.frein}
                        onChange={e => handleChange(e, i, null)}
                        disabled
                        className="w-full border-gray-300 rounded-md text-sm px-3 py-2 bg-gray-100"
                      />
                    </div>

                    <div className="w-full sm:w-1/3">
                      <label className="font-medium block mb-1">Action {i + 1}:</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md text-sm ${
                            x.action === '1'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          onClick={() => handleChange({ target: { value: '1' } }, i, 'action')}
                        >
                          Garder
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-md text-sm ${
                            x.action === '2'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                          onClick={() => handleChange({ target: { value: '2' } }, i, 'action')}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                  <hr className="mt-4 border-gray-300" />
                </div>
              ))}

              <div className="mt-6 flex justify-end gap-4">
                {loading ? (
                  <div className="loader" />
                ) : (
                  <button
                    type="submit"
                    disabled={checkDisabled}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetActions}
                  className="border border-gray-400 px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  RÉINITIALISER
                </button>
              </div>
            </form>
          )}
        </div>

        
      </div>
    </div>
  )
}

export default OldVisites_Perdu_Dialog
