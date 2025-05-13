import React, { useState, Fragment } from 'react'
import {
  CheckIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
} from 'lucide-react'
export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    {
      name: 'Réservation',
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: 'Acquéreurs',
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      name: 'Paiement',
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
  ]
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <Fragment key={index}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${index < currentStep ? 'bg-blue-600 border-blue-600' : index === currentStep ? 'border-blue-600' : 'border-gray-300'}`}
                >
                  {index < currentStep ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      {steps[index].icon}
                    </span>
                  )}
                </div>
                <span
                  className={`ml-3 text-lg font-medium ${index <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}
                >
                  {`0${index + 1}`} {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 mx-4 h-1 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                ></div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      {currentStep === 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Réservation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="reservation-code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code Réservation: *
              </label>
              <input
                id="reservation-code"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez un code"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bien *
              </label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date réservation: *
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="2025-05-07"
                />
                <CalendarIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix: *
              </label>
              <input
                id="price"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Commentaire:
            </label>
            <textarea
              id="comments"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez vos commentaires ici"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichiers réservation:
            </label>
            <div className="flex items-center mt-1">
              <label className="px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-700">
                  Choisir un fichier
                </span>
                <input type="file" className="sr-only" />
              </label>
              <span className="ml-3 text-sm text-gray-500">
                Aucun fichier choisi
              </span>
            </div>
          </div>
        </div>
      )}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Ajouter les clients participer à cette Réservation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="client"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Choisir un client si déjà exist *:
              </label>
              <select
                id="client"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un client</option>
                <option value="client1">Jean Dupont</option>
                <option value="client2">Marie Martin</option>
                <option value="client3">Pierre Durand</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="percentage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pourcentage: *
              </label>
              <input
                id="percentage"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100">
              <span className="text-xl font-bold">+</span>
              <UsersIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                id="sr"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sr" className="ml-2 block text-sm text-gray-700">
                Sr
              </label>
            </div>
            <div>
              <label
                htmlFor="price-main"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix: *
              </label>
              <input
                id="price-main"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="45000"
              />
            </div>
            <div>
              <label
                htmlFor="unit-price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix unitaire: *
              </label>
              <input
                id="unit-price"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix remise: *
              </label>
              <input
                id="discount"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label
                htmlFor="flat-rate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix forfaitaire: *
              </label>
              <input
                id="flat-rate"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label
                htmlFor="final-price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix final: *
              </label>
              <input
                id="final-price"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="45000"
              />
            </div>
            <div>
              <label
                htmlFor="remaining"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reste Avant: *
              </label>
              <input
                id="remaining"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label
                htmlFor="rest"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reste: *
              </label>
              <input
                id="rest"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Montant: *
              </label>
              <input
                id="amount"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Montant"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="financing"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mode Financement *:
              </label>
              <select
                id="financing"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un mode</option>
                <option value="cash">Espèces</option>
                <option value="credit">Crédit</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="payment-method"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mode paiement *:
              </label>
              <select
                id="payment-method"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un mode</option>
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="check">Chèque</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="payment-comments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Commentaire:
            </label>
            <textarea
              id="payment-comments"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez vos commentaires ici"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichiers paiement:
            </label>
            <div className="flex items-center mt-1">
              <label className="px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-700">
                  Choisir un fichier
                </span>
                <input type="file" className="sr-only" />
              </label>
              <span className="ml-3 text-sm text-gray-500">
                Aucun fichier choisi
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between mt-8">
        <button
          onClick={goToPrevStep}
          className={`px-6 py-2 rounded-md border border-gray-300 text-gray-700 ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          disabled={currentStep === 0}
        >
          Précédent
        </button>
        {currentStep === steps.length - 1 ? (
          <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Enregistrer
          </button>
        ) : (
          <button
            onClick={goToNextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Suivant
          </button>
        )}
      </div>
    </div>
  )
}
