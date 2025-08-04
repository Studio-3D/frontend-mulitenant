'use client';
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { GeneralInfoStep } from './steps/GeneralInfoStep';
import { GeneralParametersStep } from './steps/GeneralParametersStep';
import { StepIndicator } from './StepIndicator';
import toast from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';

// Validation schemas for each step
const step1Validation = Yup.object().shape({
  projectType: Yup.string().required('Project type is required'),
  composition: Yup.object().shape({
    bien: Yup.object().shape({
      enabled: Yup.boolean(),
      value: Yup.number().when('enabled', {
        is: true,
        then: Yup.number().min(1, 'Must be at least 1').required('Required'),
      }),
    }),
  }),
});

const step2Validation = Yup.object().shape({
  projectInfo: Yup.object().shape({
    nomProjet: Yup.string().required('Project name is required'),
    codeProjet: Yup.string().required('Project code is required'),
    surfaceTerrain: Yup.number().min(0, 'Must be positive'),
    prixAcquisition: Yup.number().min(0, 'Must be positive'),
  }),
});

const step3Validation = Yup.object().shape({
  parameters: Yup.object().shape({
    utilisateursAcces: Yup.array()
      .min(1, 'At least one user must have access')
      .required('Required'),
  }),
});

// Combine all validations
const validationSchema = [step1Validation, step2Validation, step3Validation];

export const MultiStepForm = () => {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const initialValues = {
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
  };

  const steps = [
    { id: 1, name: 'Type de projet et Composition' },
    { id: 2, name: 'Information general' },
    { id: 3, name: 'Parametres generaux' },
  ];

  const next = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const accessToken = token || localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error('User not authenticated');
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${APIURL.PROJETS}`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      toast.success('Project added successfully');
      resetForm();
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to submit the form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-h-[89vh]">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Ajouter un projets
      </h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema[currentStep - 1]}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form>
            <StepIndicator steps={steps} currentStep={currentStep} />
            
            <div className="mt-8">
              {currentStep === 1 && (
                <ProjectTypeStep
                  formData={values}
                  updateFormData={setFieldValue}
                  onNext={next}
                  errors={errors}
                  touched={touched}
                />
              )}
              
              {currentStep === 2 && (
                <GeneralInfoStep
                  formData={values}
                  updateFormData={setFieldValue}
                  onNext={next}
                  onPrevious={prev}
                  errors={errors}
                  touched={touched}
                />
              )}
              
              {currentStep === 3 && (
                <GeneralParametersStep
                  formData={values}
                  updateFormData={setFieldValue}
                  onPrevious={prev}
                  isSubmitting={isSubmitting}
                  errors={errors}
                  touched={touched}
                />
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};