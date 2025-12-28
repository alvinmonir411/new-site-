// components/formSteps/Step5_ReviewAndAccept.tsx
import React from "react";
import { useFormContext } from "react-hook-form";

// 1. Define the TypeScript interface for props
interface FormData {
  registrationNumber: string;
  selectedDates: string[];
  email: string;
  acceptTerms: boolean;
}

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
  formData: FormData; // Use the defined type
}

const formatDates = (dates: string[]): string => {
  if (!dates || dates.length === 0) {
    return "No dates selected";
  }
  // Display up to the first 3 dates, then show a count for the rest
  const visibleDates = dates.slice(0, 3).join(", ");
  const remainingCount = dates.length - 3;

  if (remainingCount > 0) {
    return `${visibleDates}, and ${remainingCount} more`;
  }
  return visibleDates;
};

// 2. Convert to TypeScript component
const Step5_ReviewAndAccept: React.FC<Step5Props> = ({
  onNext,
  onBack,
  formData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext();

  // Note: Total amount should ideally be calculated on the server or based on formData.selectedDates.length
  // We keep the hardcoded value for demonstration based on the old code.
  const totalAmount = 14.0;

  const onSubmit = () => {
    console.log(formData);
    onNext();
  };

  return (
    <div className="px-10 py-6">
      <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
        Review your information
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
        {/* --- Payment Summary Block (Replaces the removal text) --- */}
        <div className="p-5 bg-green-50 border border-green-200 rounded-lg mb-8 text-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-green-700">
            Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-green-100 pb-1">
              <span className="font-medium">Vehicle Registration:</span>
              <span className="font-bold uppercase">
                {formData.registrationNumber || "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-green-100 pb-1">
              <span className="font-medium">Dates Selected:</span>
              <span className="text-right ml-4">
                {/* Display formatted list of dates */}
                {formatDates(formData.selectedDates)}
              </span>
            </div>
          </div>
        </div>
        {/* --- End Payment Summary --- */}

        {/* --- Email Field (Unchanged) --- */}
        <div className="mb-6 text-left">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#00b875] focus:border-[#00b875] transition"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
          />
          {/* Email Errors commented out, uncomment if needed */}
        </div>

        {/* --- Terms & Conditions (Unchanged) --- */}
        <div className="mb-6 text-left">
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#00b875] border-gray-300 rounded focus:ring-[#00b875] mr-3"
              {...register("acceptTerms", {
                required: "You must accept the Terms and Conditions",
              })}
            />
            I accept the{" "}
            <a
              href="#"
              className="ml-1 text-blue-600 hover:text-blue-800 underline"
            >
              Terms and Conditions
            </a>
          </label>
          {/* Terms Errors commented out, uncomment if needed */}
        </div>

        {/* --- Total Cost (Cost) --- */}
        <div className="text-right text-xl font-bold text-gray-800 mb-6">
          Total: £{totalAmount.toFixed(2)}{" "}
          {/* This displays the required 'Cost' */}
        </div>

        {/* --- Navigation Buttons (Unchanged) --- */}
        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={onBack}
            className="w-full mr-4 px-6 py-3 border-2 border-[#00b875] text-[#00b875] font-bold rounded-lg hover:bg-gray-100 transition duration-200 shadow-md"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-full ml-4 px-6 py-3 bg-[#00b875] text-white font-bold rounded-lg hover:bg-[#00995c] transition duration-200 shadow-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step5_ReviewAndAccept;
