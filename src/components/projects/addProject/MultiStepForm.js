'use client';
import React, { useState } from 'react';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { GeneralInfoStep } from './steps/GeneralInfoStep';
import { GeneralParametersStep } from './steps/GeneralParametersStep';
import { StepIndicator } from './StepIndicator';

export const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: '',
    composition: {
      tranche: { enabled: false, value: 0 },
      blocs: { enabled: false, value: 0 },
      immeuble: { enabled: false, value: 0 },
      bien: { enabled: true, value: 0 },
    },
    projectInfo: {
      nomProjet: '',
      codeProjet: '',
      adresse: '',
      titreFoncier: '',
      dateAutorisationConstruction: '',
      datePermisHabiter: '',
      surfaceTerrain: '',
      prixAcquisition: '',
      limiteAnnulationReservation: '',
      prolongationReservation: '',
      nombreEtagesMaximum: '',
    },
    parameters: {
      typesDeBien: [],
      vues: [],
      typologies: [],
      partenaires: [],
      remise: '',
      utilisateursAcces: [],
    },
  });

  const steps = [
    { id: 1, name: 'Type de projet et Composition' },
    { id: 2, name: 'Information general' },
    { id: 3, name: 'Parametres generaux' },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectTypeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <GeneralInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <GeneralParametersStep
            formData={formData}
            updateFormData={updateFormData}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className=" bg-white rounded-lg shadow-md p-6 min-h-[89vh]">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Ajouter un projets
      </h1>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div className="mt-8">{renderStep()}</div>
    </div>
  );
};