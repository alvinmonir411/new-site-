"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Step1_Vehicle from "../src/components/formSteps/Step1_Vehicle";
import Step2_Type from "../src/components/formSteps/Step2_Type";
import Step3_Location from "../src/components/formSteps/Step3_Location";
import Step4_Date from "../src/components/formSteps/Step4_Date";
import Step5_ReviewAndAccept from "../src/components/formSteps/Step5_ReviewAndAccept";
import Stepper from "../src/components/Stepper";
import { createCheckoutSession } from "../action";

const defaultValues = {
  registrationNumber: "",
  registrationLocation: "UK",
  vehicleType: "Car",
  cleanAirZone: "Bristol",
  paymentDate: "", // Date initialized in useEffect to avoid hydration mismatch
  email: "",
  acceptTerms: false,
  country: "UK", // ✅ Changed to UK for consistency
};

const totalSteps = 6;

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const methods = useForm({
    defaultValues,
    mode: "onBlur",
  });

  // Fix hydration mismatch for date
  React.useEffect(() => {
    methods.setValue("paymentDate", new Date().toISOString().substring(0, 10));
  }, [methods]);

  const formData = methods.watch();

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: any) => {
    if (!data.acceptTerms) {
      alert("Please accept terms before payment");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formDataToSend.append(key, String(value)); // ✅ Fixed string conversion
    });

    try {
      const result = await createCheckoutSession(formDataToSend);
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      setLoading(false);
      alert("Payment initiation failed. Please try again.");
    }
  };

  // Handle cancel return & payment failed
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("canceled") === "true") {
        setCanceled(true);
        setCurrentStep(6);
      } else if (urlParams.get("payment_failed") === "true") {
        alert("Payment failed. Please try again.");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, []);

  const renderStep = () => {
    if (canceled) {
      return (
        <div className="p-10 text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">
            Payment Canceled
          </div>
          <p className="text-gray-600 mb-8">
            You can try again or go back to review your details.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setCanceled(false);
                setCurrentStep(5);
              }}
              className="bg-[#00b875] text-white px-8 py-3 rounded-lg hover:bg-green-600"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Review
            </button>
          </div>
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
          <Step5_ReviewAndAccept
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 6:
        return (
          <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Secure Payment
            </h2>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vehicle: {formData.registrationNumber || "N/A"}</span>
                  <span>{formData.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone: {formData.cleanAirZone}</span>
                  <span>{formData.registrationLocation}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t text-lg">
                  <span>Total: £14.00</span> {/* ✅ Fixed to £14.00 */}
                  <span className="text-[#00b875]">Secure Checkout</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormProvider {...methods}>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    {...methods.register("email", {
                      required: "Email is required",
                    })}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b875] focus:border-transparent"
                    placeholder="Confirm your email"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    {...methods.register("acceptTerms")}
                    className="w-4 h-4 text-[#00b875] border-gray-300 rounded focus:ring-[#00b875]"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-[#00b875] hover:underline">
                      Terms of Service
                    </a>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.acceptTerms}
                    className="flex-1 bg-[#00b875] text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Pay £14.00 Securely" // ✅ Fixed button text
                    )}
                  </button>
                </div>
              </FormProvider>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Secure payment powered by Stripe. Your card info never touches
                our servers.
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-10 text-center text-xl font-bold text-[#00b875]">
            🎉 Submission Successful! Thank you for your payment.
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        <Stepper currentStep={currentStep} />
        <FormProvider {...methods}>{renderStep()}</FormProvider>
      </div>
    </div>
  );
};

export default MultiStepForm;
