"use client";
import { Check } from 'lucide-react';

// Updated to accept both activeStep and steps in the expected format
export default function ProjectStepper({ steps, activeStep }) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= index ? "bg-blue-500 text-white" : "bg-gray-200 !text-gray-500"
              }`}
            >
              {activeStep > index ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`mt-2 text-sm ${activeStep >= index ? "text-blue-500 font-medium" : "text-gray-500"}`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{
            width: `${(activeStep / (steps.length - 1)) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
