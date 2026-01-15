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

    console.log("Adding email to waitlist:", email);

    // Insert directly into Supabase
    const { data, error } = await supabase
      .from("early_access_signups")
      .insert([
        {
          email: email.toLowerCase().trim(),
          confirmed: true,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Supabase error:", error);
      
      // Check for duplicate key error
      if (error.code === "23505" || error.message.includes("duplicate") || error.message.includes("already exists")) {
        throw new Error("duplicate");
      }
      
      throw new Error(error.message || "Failed to join waitlist");
    }

    console.log("Email registered successfully:", email, data);

    // Send welcome email via Netlify function (non-blocking)
    try {
      console.log("Sending welcome email...");
      const emailResponse = await fetch("/.netlify/functions/send-welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!emailResponse.ok) {
        console.warn("Failed to send welcome email, but signup was successful");
      } else {
        console.log("Welcome email sent successfully");
      }
    } catch (emailError) {
      // Don't fail the whole operation if email fails
      console.warn("Email sending failed:", emailError);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    throw error;
  }
};
