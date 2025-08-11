import React, { Fragment } from 'react';
import { CheckIcon } from 'lucide-react';

export const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep > step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : currentStep === step.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-gray-300 text-gray-300'
              }`}
            >
              {currentStep > step.id ? <CheckIcon size={18} /> : step.id}
            </div>
            <span
              className={`text-xs mt-1 ${
                currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};