'use client';
import React from 'react';
import { Info } from 'lucide-react';
import { type_dst_dp, lien_parentes } from '@/configs/enum';

export function Desistement_Au_Profit({ formData, desisteur_dp_proche_co }) {
  // Get the type label from your enum
  const typeLabel = type_dst_dp[formData.type_dp]?.label || '';

  // Get the lien parente label from your enum
  const lienParenteLabel = formData.lien_parente
    ? lien_parentes[formData.lien_parente]?.label
    : '';

  const totalPercentage =
    desisteur_dp_proche_co?.reduce((sum, desisteur) => {
      return sum + (parseFloat(desisteur.pourcentage) || 0);
    }, 0) || 0;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
     
      {/* Top Row - Type and Parenté */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-white p-4 rounded-lg shadow-xs border border-gray-100">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-indigo-600">
            Type Désistement
          </label>
          <div className="px-3 py-2 bg-indigo-50 rounded-md text-indigo-800 font-medium">
            {typeLabel}
          </div>
        </div>

        {(formData.type_dp == 1 || formData.type_dp == 3) && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-indigo-600">
              Lien de Parenté
            </label>
            <div className="px-3 py-2 bg-indigo-50 rounded-md text-indigo-800 font-medium">
              {lienParenteLabel}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {(formData.type_dp == 1 || formData.type_dp == 2) && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Désisteurs */}
              <div className="md:col-span-5">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-indigo-700 mb-2 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                    Désisteurs
                  </h3>
                  <div className="space-y-3">
                    {desisteur_dp_proche_co?.map((desisteur, index) => (
                      <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                        <p className="font-medium text-gray-800">
                          {desisteur.nom} {desisteur.prenom}
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {desisteur.pourcentage}%
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Somme % Ajoutés */}
              <div className="md:col-span-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-1">
                    Somme % Ajoutés
                  </h3>
                  <p className="text-2xl font-bold text-blue-500">
                    {totalPercentage}%
                  </p>
                </div>
              </div>

              {formData.type_dp == 1 &&
                formData.nouvel_aquereurs_desistements?.length > 0 && (
                  <div className="md:col-span-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <h3 className="text-sm font-medium text-amber-700 mb-1">
                        Nouveaux Acquéreurs
                      </h3>
                      <p className="text-2xl font-bold text-amber-600">
                        {formData.nouvel_aquereurs_desistements.length}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Nouveaux Acquéreurs Section */}
            {formData.type_dp == 1 &&
              formData.nouvel_aquereurs_desistements?.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="mb-4 pt-4 border-t border-gray-100">
                    <h3 className="text-md font-semibold text-gray-700 flex items-center">
                      <Info className="h-5 w-5 text-blue-500 mr-2" />
                      Les Nouveaux Acquéreurs
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {formData.nouvel_aquereurs_desistements.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                            {/* CIN */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                CIN
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.cin}
                              </p>
                            </div>

                            {/* Nom */}
                            <div className="md:col-span-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Nom
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.nom}
                              </p>
                            </div>

                            {/* Prénom */}
                            <div className="md:col-span-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Prénom
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.prenom}
                              </p>
                            </div>

                            {/* Téléphone */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Téléphone
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.telephone}
                              </p>
                            </div>

                            {/* Pourcentage */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Pourcentage
                              </p>
                              <p className="font-medium text-blue-500">
                                {item.pourcentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Au Profit de Section */}
            {formData.type_dp == 2 &&
              formData.aquereurs_profits?.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="mb-4 pt-4 border-t border-gray-100">
                    <h3 className="text-md font-semibold text-gray-700 flex items-center">
                      <Info className="h-5 w-5 text-green-500 mr-2" />
                      Au Profit de
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.aquereurs_profits?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-green-50 p-4 rounded-lg border border-green-100"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.aquereur.client.nom}{' '}
                              {item.aquereur.client.prenom}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.aquereur.client.cin}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            {item.pourcentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Désistement Partiel Section */}
        {formData.type_dp == 3 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Anciens Acquéreurs */}
              {formData.aquereurs_partiel?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                     Les Clients Actuels :
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {formData.aquereurs_partiel?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 p-4 rounded-lg border border-purple-100"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                          {/* Cin */}
                          <div className="md:col-span-3">
                            <p className="text-xs font-medium text-purple-600 mb-1">
                              CIN
                            </p>
                            <p className="font-medium text-gray-800">
                              {item.aquereur.client.cin}
                            </p>
                          </div>

                          {/* Nom */}
                          <div className="md:col-span-3">
                            <p className="text-xs font-medium text-purple-600 mb-1">
                              Nom
                            </p>
                            <p className="font-medium text-gray-800">
                              {item.aquereur.client.nom}
                            </p>
                          </div>

                          {/* Prénom */}
                          <div className="md:col-span-3">
                            <p className="text-xs font-medium text-purple-600 mb-1">
                              Prénom
                            </p>
                            <p className="font-medium text-gray-800">
                              {item.aquereur.client.prenom}
                            </p>
                          </div>

                          {/* Pourcentage */}
                          <div className="md:col-span-3">
                            <p className="text-xs font-medium text-purple-600 mb-1">
                              Pourcentage
                            </p>
                            <p className="font-medium text-purple-600">
                              {item.pourcentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouveaux Acquéreurs */}
              {formData.nouvel_aquereurs_desistements?.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-700 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                      Nouveaux Acquéreurs
                    </h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                      {formData.nouvel_aquereurs_desistements.length} ajoutés
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {formData.nouvel_aquereurs_desistements.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 p-4 rounded-lg border border-amber-100"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                            {/* CIN */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-amber-600 mb-1">
                                CIN
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.cin}
                              </p>
                            </div>

                            {/* Nom */}
                            <div className="md:col-span-3">
                              <p className="text-xs font-medium text-amber-600 mb-1">
                                Nom
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.nom}
                              </p>
                            </div>

                            {/* Prénom */}
                            <div className="md:col-span-3">
                              <p className="text-xs font-medium text-amber-600 mb-1">
                                Prénom
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.prenom}
                              </p>
                            </div>

                            {/* Téléphone */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-amber-600 mb-1">
                                Téléphone
                              </p>
                              <p className="font-medium text-gray-800">
                                {item.telephone}
                              </p>
                            </div>

                            {/* Pourcentage */}
                            <div className="md:col-span-2">
                              <p className="text-xs font-medium text-amber-600 mb-1">
                                Pourcentage
                              </p>
                              <p className="font-medium text-amber-600">
                                {item.pourcentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
