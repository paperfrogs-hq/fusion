// src/lib/supabase-client.ts
export const addEmailToWaitlist = async (email: string) => {
  const response = await fetch('/.netlify/functions/send-welcome', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    // This catches "Email already registered" from the backend
    throw new Error(data.message || data.error || 'Failed to join waitlist');
  }

  return data;
};

/*
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sendConfirmationEmail = async (email: string) => {
  try {
    const response = await fetch("/.netlify/functions/send-welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn("Email sending failed:", error);
      return;
    }

    console.log("Confirmation email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

export const addEmailToWaitlist = async (email: string) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const { data, error: dbError } = await supabase
      .from("early_access_signups")
      .upsert([
        {
          email: email.toLowerCase(),
          confirmed: false,
        },
      ]);

    if (dbError) {
      console.error("Database upsert error:", dbError);
      throw dbError;
    }

    console.log("Email saved successfully:", email);

    // Send confirmation email via Netlify function
    await sendConfirmationEmail(email);

    return { success: true, data };
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    throw error;
  }
};
*/