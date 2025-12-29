import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const addEmailToWaitlist = async (email: string) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Call the Netlify function which handles everything:
    // - Inserting into Supabase
    // - Sending the welcome email via Resend
    const response = await fetch("/.netlify/functions/send-welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for duplicate email error
      if (response.status === 409 || data.message?.includes("already registered")) {
        throw new Error("duplicate");
      }
      throw new Error(data.message || data.error || "Failed to join waitlist");
    }

    console.log("Email registered successfully:", email);
    return { success: true, data };
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    throw error;
  }
};
