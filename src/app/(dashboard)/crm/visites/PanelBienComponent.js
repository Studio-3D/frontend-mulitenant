import React from 'react';
import AutocompleteBien from './AutocompleteBien';
import AutocompleteStatut_ModeRelance_Biens from './AutocompleteStatut_ModeRelance_Biens';
import InputField_Biens from './InputField_Biens';
import { VISITE_STATUT_FORM, VISITE_TYPE_NOTIF } from '@/configs/enum';
const BienComponent = ({
  input_biens,
  input_biens_vendu_length,
  handleinputchange,
  expanded,
  handleAccordionChange,
  biensByProjet,
  loading_bien,
  user,
  info_reservation, // Added prop for reservation info
}) => {
  return (
    <>
      {input_biens.map((x, i) => (
        <div key={`panel_bien${i + 1}`}>
          <div className="border mt-4 rounded-md shadow">
            {/* Main Accordion */}
            <button
              type="button"
              className="w-full flex justify-between items-center px-4 py-3 text-white text-base font-medium focus:outline-none"
              style={{
                background: 'rgb(35 22 81 / var(--tw-text-opacity, 1))',
              }}
              onClick={handleAccordionChange(`panel_bien${i + 1}`)}
            >
              <span>{`Bien ${input_biens_vendu_length + i + 1}`}</span>
              <span className="text-xl">
                {expanded.includes(`panel_bien${i + 1}`) ? '−' : '+'}
              </span>
            </button>
            {expanded.includes(`panel_bien${i + 1}`) && (
              <>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <AutocompleteBien
                        x={x}
                        i={i}
                        user={user}
                        biensByProjet={biensByProjet}
                        handleinputchange={handleinputchange}
                        loading={loading_bien}
                      />
                    </div>
                    <div>
                      <AutocompleteStatut_ModeRelance_Biens
                        name={'statut'}
                        label={'Statut'}
                        placeholder={'Sélectionner un statut'}
                        options={Object.values(VISITE_STATUT_FORM)}
                        value={x.statut}
                        code="code"
                        labelKey="label"
                        onChange={(e) => handleinputchange(e, i)}
                        required
                      />
                    </div>
                    {x.statut === 1 && (
                      <>
                        <div>
                          <InputField_Biens
                            label="Rendez Vous"
                            name="rdv"
                            type="datetime-local"
                            value={x.rdv}
                            onChange={(e) => handleinputchange(e, i)}
                          />
                        </div>
                        <div>
                          <AutocompleteStatut_ModeRelance_Biens
                            name={'mode_relance'}
                            label={'Mode de Relance'}
                            placeholder={'Sélectionner un Mode de Relance'}
                            options={Object.values(VISITE_TYPE_NOTIF)}
                            code="code"
                            labelKey="label"
                            value={x.mode_relance}
                            onChange={(e) => handleinputchange(e, i)}
                          />
                        </div>
                        <div>
                          <InputField_Biens
                            label="Date de relance"
                            name="date_relance"
                            type="date"
                            value={x.date_relance}
                            onChange={(e) => handleinputchange(e, i)}
                          />
                        </div>
                      </>
                    )}
                    <div className="md:col-span-3">
                      <InputField_Biens
                        label="Commentaire"
                        name="commentaire"
                        multi
                        value={x.commentaire}
                        onChange={(e) => handleinputchange(e, i)}
                      />
                    </div>
                  </div>
                </div>

                {/* Réservation Section */}
                {x.statut === 2 && x.bien_id !== null && (
                  <div className="border rounded-lg mt-4 mx-5">
                    {/* Accordion Header */}
                    <div
                      className="flex items-center justify-between px-4 py-2 cursor-pointer"
                      style={{ background: '#2f8a8bab' }}
                      onClick={() => handleAccordionChange(`panel_res${i + 1}`)}
                    >
                      <h3 className="text-white font-semibold">
                        Réservation du Bien {input_biens_vendu_length + (i + 1)}
                      </h3>
                      <span className="text-white">
                        {expanded.includes(`panel_res${i + 1}`) ? '⌃' : '⌄'}
                      </span>
                    </div>

                    {/* Accordion Content */}
                    {expanded.includes(`panel_res${i + 1}`) && (
                      <div className="p-4 space-y-4 bg-white">
                        {info_reservation && (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-center rounded">
                            {info_reservation}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <InputField_Biens
                            label="Code Réservation:"
                            name="code_reservation"
                            type="text"
                            placeholder="Code Réservation"
                            value={x.code_reservation}
                            onChange={(e) => handleinputchange(e, i)}
                            required
                          />
                          <InputField_Biens
                            label="Bien:"
                            name=""
                            type="text"
                            value={x.propriete_dite_bien}
                            disabled
                          />
                          <InputField_Biens
                            label="Prix:"
                            name=""
                            type="number"
                            value={x.prix}
                            disabled
                          />
                          <InputField_Biens
                            label="Date Réservation:"
                            name="date_reservation"
                            type="date"
                            value={x.date_reservation}
                            onChange={(e) => handleinputchange(e, i)}
                            required
                          />
                          <InputField_Biens
                            label="Commentaire:"
                            name="commentaire_res"
                            multi
                            value={x.commentaire_res}
                            onChange={(e) => handleinputchange(e, i)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

 
export default BienComponent;
