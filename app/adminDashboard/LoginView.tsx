"use client";

import { useState } from "react";
import { verifyPassword } from "./actions";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

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
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-2xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Dashboard Access</h1>
                <p className="text-gray-500 text-center mb-8 text-sm">Please enter your administrative credentials</p>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 px-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                            placeholder="••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
