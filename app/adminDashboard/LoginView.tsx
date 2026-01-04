"use client";

import { useState } from "react";
import { verifyPassword } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginView() {
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await verifyPassword(formData);

        if (result.success) {
            router.refresh(); // Reload to let the server render the dashboard
        } else {
            // User requested redirect to / on failure
            router.push("/");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Dashboard Access</h1>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enter Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
