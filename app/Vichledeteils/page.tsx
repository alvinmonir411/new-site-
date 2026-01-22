"use client";

import { useState } from "react";

export default function VehicleDetailsPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-2">Vehicle Details</h1>

        <p className="text-sm text-gray-500 mb-6">Step {step + 1} of 5</p>

        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. AB12 CDE"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-3">
                Where is this vehicle registered?
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-green-500">
                  <input
                    type="radio"
                    name="location"
                    value="UK"
                    defaultChecked
                  />
                  <span>UK</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:border-green-500">
                  <input type="radio" name="location" value="Non-UK" />
                  <span>Non-UK</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Step 2: Vehicle Type</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your vehicle type?
              </label>

              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="UK">Car</option>
                <option value="Non-UK">Bus</option>
                <option value="Non-UK">Coach</option>
                <option value="Non-UK">Heavy Goods Vehicle</option>
                <option value="Non-UK">Minibus</option>
                <option value="Non-UK">Motorcycle</option>
                <option value="Non-UK">Van</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Step 2: Vehicle Type</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which clean air zone do you need to pay for?
              </label>

              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="UK">Bath</option>
                <option value="Non-UK">Birmingham</option>
                <option value="Non-UK">Bradford</option>
                <option value="Non-UK">Bristol</option>
                <option value="Non-UK">Greater Manchester</option>
                <option value="Non-UK">Portsmouth</option>
                <option value="Non-UK">Sheffield</option>
                <option value="Non-UK">
                  Tyneside - Newcastle and Gateshead
                </option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">

          </div>
        )}

        {/* BUTTONS */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="px-6 py-2 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
