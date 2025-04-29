import React from 'react';
import InputField_Biens from './InputField_Biens';
import AutocompleteStatut_ModeRelance_Biens from './AutocompleteStatut_ModeRelance_Biens';
import { useState } from 'react';

const PanelInteresse_vendu = ({
  input_biens_vendu,
  //handleAccordionChange,
  //expanded,
  handleChange,
  handleinputchange_bien_vendu,
  info_reservation,
  MODE_FINANCE,
  MODE_PAIEMENT,
  check_total,
  user,
  banques,
}) => {
  const [expandedVendu, setExpandedVendu] = useState([]);

  const handleAccordionChangeVendu = (panel) => {
    setExpandedVendu((prevExpanded) =>
      prevExpanded.includes(panel)
        ? prevExpanded.filter((p) => p !== panel)
        : [...prevExpanded, panel]
    );
  };
  return (
    <>
      {input_biens_vendu.map((x, j) => (
        <div
          key={`panel_bienn${j + 1}`}
          className="border mt-4 rounded-md shadow"
        >
          {/* Bien Header */}
          <button
            type="button"
            className="w-full flex justify-between items-center px-4 py-3 text-white text-base font-medium focus:outline-none"
            style={{ background: 'rgb(35 22 81 / var(--tw-text-opacity, 1))' }}
            onClick={() => handleAccordionChangeVendu(`panel_bienn${j + 1}`)}
          >
            <span>{`Bien  ${j + 1}`}</span>
            <span className="text-xl">
              {expandedVendu.includes(`panel_bienn${j + 1}`) ? '−' : '+'}
            </span>
          </button>

          {/* Accordion Content */}
          {expandedVendu.includes(`panel_bienn${j + 1}`) && (
            <>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Bien Autocomplete */}
                  <div>
                    {x.bien_id != null && (
                      <InputField_Biens
                        label="Bien"
                        name=""
                        type="text"
                        value={x.propriete_dite_bien}
                        disabled
                      />
                    )}
                  </div>
                  {/* Statut */}
                  <div>
                    <InputField_Biens
                      label="Statut"
                      name=""
                      type="text"
                      value={'Vendu'}
                      disabled
                    />
                  </div>

                  {/* Commentaire */}
                  <div className="md:col-span-3">
                    <InputField_Biens
                      label="Commentaire"
                      name="commentaire"
                      multi
                      value={x.commentaire}
                      onChange={(e) => handleinputchange_bien_vendu(e, j)}
                    />
                  </div>
                </div>
              </div>

              {/* Réservation Section */}
              {x.statut === 2 && x.bien_id != null && (
                <div className="border rounded-lg mt-4 mx-5">
                  <div
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                    style={{ background: '#2f8a8bab' }}
                    onClick={() => handleChange(`panel_ress${j + 1}`)}
                  >
                    <h3 className="text-white font-semibold">
                      Réservation du Bien {j + 1}
                    </h3>
                    <span className="text-white">
                      {expandedVendu.includes(`panel_ress${j + 1}`) ? '⌃' : '⌄'}
                    </span>
                  </div>

                  {expandedVendu.includes(`panel_ress${j + 1}`) && (
                    <div className="p-4 space-y-4 bg-white">
                      {info_reservation && (
                        <div className="bg-red-100 border-l-4 border-red-500 p-4 text-center rounded text-red-700">
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
                          onChange={(e) => handleinputchange_bien_vendu(e, j)}
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
                          onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          required
                        />
                        <InputField_Biens
                          label="Commentaire:"
                          name="commentaire_res"
                          multi
                          value={x.commentaire_res}
                          onChange={(e) => handleinputchange_bien_vendu(e, j)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paiement Section */}
              {x.statut == 2 && x.bien_id != null && (
                <div className="border rounded-lg mt-4 mx-5 mb-5">
                  <div
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                    style={{ background: '#2f8a8bab' }}
                    onClick={() => handleChange(`panel_paii${j + 1}`)}
                  >
                    <h3 className="text-white font-semibold">
                      Paiement du Bien {j + 1}
                    </h3>
                    <span className="text-white">
                      {expandedVendu.includes(`panel_paii${j + 1}`) ? '⌃' : '⌄'}
                    </span>
                  </div>

                  {expandedVendu.includes(`panel_paii${j + 1}`) && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white">
                      <div>
                        <label
                          className="flex items-center space-x-2"
                          style={{ marginTop: '30px' }}
                        >
                          <span
                            className={`text-sm font-medium ${
                              x.sr === true ? 'text-purple-600' : ''
                            }`}
                          >
                            Sr:
                          </span>
                          <input
                            type="checkbox"
                            name="sr"
                            value={x.sr}
                            checked={x.sr}
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                            className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                          />
                        </label>
                      </div>
                      <InputField_Biens
                        label="Prix :"
                        name="prix"
                        type="number"
                        value={x.prix}
                        disabled
                      />
                      <InputField_Biens
                        label="Prix Unitaire:"
                        name="prix_unitaire"
                        type="number"
                        value={x.prix_unitaire}
                        disabled
                      />
                      <InputField_Biens
                        label="Prix Remisé:"
                        name="prix_remise"
                        type="number"
                        value={x.prix_remise}
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                      />
                      <InputField_Biens
                        label="Prix Forfaitaire:"
                        name="prix_forfetaire"
                        type="number"
                        value={x.prix_forfetaire}
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                      />
                      <InputField_Biens
                        label="Prix Final:"
                        name="prix_final"
                        type="number"
                        value={check_total >= 0 && x.prix_final}
                        disabled
                      />
                      <InputField_Biens
                        label="Reste Avance:"
                        name="avance_minimale"
                        type="number"
                        value={x.avance_minimale}
                        disabled
                      />
                      <InputField_Biens
                        label="Reste:"
                        name="reste"
                        type="number"
                        value={x.reste}
                        disabled
                      />
                      <InputField_Biens
                        label="Montant:"
                        name="avance_res"
                        type="number"
                        required
                        value={x.avance_res}
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                      />
                      <AutocompleteStatut_ModeRelance_Biens
                        name="mode_financement"
                        label="Mode Financement:"
                        placeholder="Sélectionner un Mode de Financement"
                        code="code"
                        labelKey="label"
                        options={Object.values(MODE_FINANCE)}
                        value={x.mode_financement}
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                        required
                      />
                      <AutocompleteStatut_ModeRelance_Biens
                        name="mode_paiement"
                        label="Mode Paiement:"
                        placeholder="Sélectionner un Mode de Paiement"
                        options={Object.values(MODE_PAIEMENT)}
                        value={x.mode_paiement}
                        code="code"
                        labelKey="label"
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                        required
                      />
                      {/* Conditional Fields */}
                      {x.mode_paiement !== 1 && x.mode_paiement !== '' && (
                        <>
                          <AutocompleteStatut_ModeRelance_Biens
                            name={'banque_id'}
                            label={'Banque:'}
                            placeholder={'Sélectionner un Mode de Paiement'}
                            options={banques}
                            value={x.banque_id}
                            required={x.mode_paiement !== 1}
                            code="id"
                            labelKey="nom"
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          />
                          <InputField_Biens
                            label="N° Paiment:"
                            name="numero_paiement"
                            type="number"
                            required={x.mode_paiement !== 1}
                            value={x.numero_paiement}
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          />
                        </>
                      )}
                      {x.mode_paiement !== '' &&
                        x.mode_paiement !== 1 &&
                        x.mode_paiement !== 5 &&
                        x.mode_paiement !== 6 && (
                          <InputField_Biens
                            label="Date Échéance:"
                            name="echeance"
                            required={x.mode_paiement !== 1}
                            type="date"
                            value={x.echeance}
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          />
                        )}
                      {x.avance_res != '' && x.avance_res == 0 && (
                        <div>
                          <label
                            className="flex items-center space-x-2"
                            style={{ marginTop: '19px' }}
                          >
                            <span
                              className={`text-sm font-medium ${
                                x.check_montant === true
                                  ? 'text-purple-600'
                                  : ''
                              }`}
                            >
                              {' '}
                              Voulez vous Enregistrer la Réservation sans
                              montant (Prière de saisir un commentaire)
                            </span>
                            <input
                              style={{ color: 'green' }}
                              type="checkbox"
                              name="check_montant"
                              value={x.check_montant}
                              checked={x.check_montant}
                              required={x.avance_res != '' && x.avance_res == 0}
                              onChange={(e) =>
                                handleinputchange_bien_vendu(e, j)
                              }
                              className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
                            />
                          </label>
                        </div>
                      )}
                      <InputField_Biens
                        label="Commentaire:"
                        name="commentaireAvance"
                        multi
                        required={x.check_montant == true ? true : false}
                        value={x.commentaireAvance}
                        onChange={(e) => handleinputchange_bien_vendu(e, j)}
                      />
                      {user.role <= 2 && x.avance_res > 0 && (
                        <>
                          <div className="col-span-3">
                            <h2
                              className="text-lg font-medium border-b pb-2 mb-4"
                              style={{ color: '#231651' }}
                            >
                              Informations Encaissement
                            </h2>
                          </div>

                          <InputField_Biens
                            label="N° Remise:"
                            name="num_remise"
                            type="number"
                            value={x.num_remise}
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          />
                          <InputField_Biens
                            label="Date Encaissement:"
                            name="date_encaissement"
                            type="date"
                            value={x.date_encaissement}
                            onChange={(e) => handleinputchange_bien_vendu(e, j)}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default PanelInteresse_vendu;
