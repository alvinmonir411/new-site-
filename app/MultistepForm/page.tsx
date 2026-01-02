"use client";

import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Step1_Vehicle from "../src/components/formSteps/Step1_Vehicle";
import Step2_Type from "../src/components/formSteps/Step2_Type";
import Step3_Location from "../src/components/formSteps/Step3_Location";
import Step4_Date from "../src/components/formSteps/Step4_Date";
/* ✅ Step 5 কম্পোনেন্টটি ইমপোর্ট করা হলো */
import Step5_ReviewAndAccept from "../src/components/formSteps/Step5_ReviewAndAccept";
import Stepper from "../src/components/Stepper";
import { createCheckoutSession } from "../action";

/* ✅ RENAMED TYPE */
export interface CheckoutFormData {
  registrationNumber: string;
  registrationLocation: string;
  vehicleType: string;
  cleanAirZone: string;
  paymentDate: string;
  selectedDates: string[];
  email: string;
  acceptTerms: boolean;
  country: string;
}

/* ✅ DEFAULT VALUES FIXED */
const defaultValues: CheckoutFormData = {
  registrationNumber: "",
  registrationLocation: "UK",
  vehicleType: "Car",
  cleanAirZone: "Bristol",
  paymentDate: "",
  selectedDates: [],
  email: "",
  acceptTerms: false,
  country: "UK",
};

const totalSteps = 5; // ✅ যেহেতু Step 6 নেই, তাই এটি 5 হবে।

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const methods = useForm<CheckoutFormData>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    methods.setValue("paymentDate", new Date().toISOString().substring(0, 10));
  }, [methods]);

  const formData = methods.watch();

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!data.acceptTerms) {
      alert("Please accept terms before payment");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If it's an array (like selectedDates), append each value
        value.forEach((v) => formDataToSend.append(key, v));
      } else {
        formDataToSend.append(key, String(value));
      }
    });

    try {
      const result = await createCheckoutSession(formDataToSend);
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("canceled") === "true") {
        setCanceled(true);
        setCurrentStep(5);
      }
    }
  }, []);

  const renderStep = () => {
    if (canceled) {
      return (
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Payment Canceled
          </h2>

          <button
            onClick={() => {
              setCanceled(false);
              setCurrentStep(5);
            }}
            className="bg-[#00b875] text-white px-8 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <Step1_Vehicle onNext={handleNext} />;
      case 2:
        return <Step2_Type onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3_Location onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4_Date onNext={handleNext} onBack={handleBack} />;
      case 5:
        return (
          /* ✅ Step 5 এ এখন নতুন কম্পোনেন্ট রেন্ডার করা হলো */
          <Step5_ReviewAndAccept
            onBack={handleBack}
            onSubmit={methods.handleSubmit(onSubmit)}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 pt-10">
           {" "}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow">
                <Stepper currentStep={currentStep} />       {" "}
        <FormProvider {...methods}>{renderStep()}</FormProvider>     {" "}
      </div>
         {" "}
    </div>
  );
};

export default MultiStepForm;
