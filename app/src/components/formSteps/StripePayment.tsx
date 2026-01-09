"use client";

import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

// Define the expected shape of the form data
interface FormData {
  registrationNumber: string;
  acceptTerms: boolean;
  cleanAirZone: string;
  country: string;
  email: string;
  paymentDate: string;
  registrationLocation: string;
  selectedDates: any;
  vehicleType: string;
}

interface StripePaymentProps {
  onFinalSubmit: () => void;
  onBack: () => void;
  formData: FormData;
}

const calculateCost = (data: FormData, price: number): number => {
  const datesCount = Array.isArray(data.selectedDates)
    ? data.selectedDates.length
    : 0;

  return datesCount * price;
};

export default function StripePayment({
  onFinalSubmit,
  onBack,
  formData,
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricePerDayPence, setPricePerDayPence] = useState<number>(1400); // Default 1400

  const amountInCents = calculateCost(formData, pricePerDayPence);

  // Fetch dynamic price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/settings/price");
        if (res.ok) {
          const data = await res.json();
          if (data.amount) {
            setPricePerDayPence(data.amount);
          }
        }
      } catch (error) {
        console.error("Failed to fetch price:", error);
      }
    };
    fetchPrice();
  }, []);

  // 1. Fetch the Client Secret from the server
  useEffect(() => {
    const fetchClientSecret = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountInCents,
            metadata: {
              registration: formData.registrationNumber,
              zone: formData.cleanAirZone,
              acceptTerms: formData.acceptTerms,
              country: formData.country,
              email: formData.email,
              paymentDate: formData.paymentDate,
              registrationLocation: formData.registrationLocation,
              selectedDates: formData.selectedDates,
              vehicleType: formData.vehicleType,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent on the server.");
        }

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("Server did not return a client secret.");
        }
      } catch (err) {
        console.error("Error fetching client secret:", err);
        setError("Could not initialize payment. Please try again.");
      } finally {
        setIsLoading(false);
        console.log("form", formData);
      }
    };

    if (amountInCents > 0) {
      if (pricePerDayPence !== 1400) {
        // If price has updated from default, existing amountInCents change will trigger.
        // This logic might loop if not careful, but amountInCents depends on pricePerDayPence.
        // When pricePerDayPence updates -> amountInCents updates -> useEffect triggers -> fetches client secret.
        // This is correct behavior.
        fetchClientSecret();
      } else {
        fetchClientSecret();
      }
    } else {
      setIsLoading(false);
      setError("This vehicle may be exempt, please review step 5.");
    }
  }, [amountInCents, formData, pricePerDayPence]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: paymentError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        // If you want to redirect after success, use a return_url
        // For this example, we handle success client-side by checking the result
        // return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required", // Do not redirect if possible
    });

    if (paymentError) {
      // Show error to your customer
      setError(paymentError.message || "Payment failed.");
      setIsLoading(false);
    } else {
      onFinalSubmit();
    }
    setIsLoading(false);
  };

  if (isLoading && !clientSecret) {
    return <div className="p-8 text-center">Loading payment form...</div>;
  }

  if (error && !clientSecret) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Payment: £{(amountInCents / 100).toFixed(2)}
      </h2>
      <p className="text-sm text-gray-600">
        Vehicle: <strong>{formData.registrationNumber}</strong> for <strong>{formData.cleanAirZone}
        </strong>
      </p>

      {/* The PaymentElement renders the card/bank info inputs */}
      {clientSecret && (
        <div className="border p-4 rounded-lg bg-gray-50">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      )}

      {error && <div className="text-red-500 font-medium">{error}</div>}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#00b875] text-white rounded-lg hover:bg-[#009e66] transition duration-150 disabled:opacity-50"
          disabled={!stripe || !elements || isLoading || !clientSecret}
        >
          {isLoading
            ? "Processing..."
            : `Pay £${(amountInCents / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}
