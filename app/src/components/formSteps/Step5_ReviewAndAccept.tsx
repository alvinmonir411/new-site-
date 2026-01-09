"use client";

import { CheckoutFormData } from "@/app/MultistepForm/page";
import React from "react";
import { useFormContext } from "react-hook-form";

interface Step5Props {
  onBack: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  loading: boolean;
}

/* const PRICE_PER_DAY = 14; */
/* const PRICE_PER_DAY = 14; */

const Step5_ReviewAndAccept: React.FC<Step5Props> = ({
  onBack,
  onSubmit,
  loading,
}) => {
  const [pricePerDay, setPricePerDay] = React.useState(14);

  React.useEffect(() => {
    fetch("/api/settings/price")
      .then((res) => res.json())
      .then((data) => {
        if (data.amount) {
          setPricePerDay(data.amount / 100); // Convert pence to pounds
        }
      })
      .catch((err) => console.error("Failed to load price:", err));
  }, []);

  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const formData = watch();

  const totalDays = formData.selectedDates?.length || 0;
  const totalAmount = totalDays * pricePerDay;
  console.log(totalDays, totalAmount);

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Review & Confirm Payment
      </h2>

      {/* SUMMARY */}
      <div className="mb-8 border rounded-xl p-6 bg-gray-50 shadow-sm">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Your Details</h3>

        <div className="space-y-3 text-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicle Reg No:</span>
            <span className="font-semibold">{formData.registrationNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Clean Air Zone:</span>
            <span className="font-semibold">{formData.cleanAirZone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Selected Dates:</span>
            <span className="font-semibold text-[#00b875]">
              {formData.selectedDates.join(", ")}
            </span>
          </div>

          <div className="pt-4 text-2xl font-extrabold  border-t flex justify-between">
            <span>Total Payable:</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* EMAIL + TERMS */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-2">
            Payment Confirmation Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
            })}
            className="w-full p-4 border rounded-xl"
          />
          {errors.email && (
            <p className="text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register("acceptTerms", {
              required: "You must accept terms",
            })}
            className="w-5 h-5"
          />
          <span>I accept the Terms & Conditions</span>
        </label>

        {errors.acceptTerms && (
          <p className="text-red-600">{errors.acceptTerms.message}</p>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-4 border rounded-xl"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00b875] text-white font-semibold rounded-xl"
          >
            {loading
              ? "Processing..."
              : `Pay £${totalAmount.toFixed(2)} Securely`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step5_ReviewAndAccept;
