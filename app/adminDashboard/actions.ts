"use server";

import { cookies } from "next/headers";

export async function verifyPassword(formData: FormData) {
    const password = formData.get("password") as string;
    const CORRECT_PASSWORD = "13663"; // Hardcoded simple password as requested

    if (password === CORRECT_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });
        return { success: true };
    } else {
        return { success: false, error: "Incorrect password" };
    }
}
