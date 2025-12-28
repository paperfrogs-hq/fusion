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

    const { data, error: dbError } = await supabase
      .from("early_access_signups")
      .insert([
        {
          email: email.toLowerCase(),
          confirmed: false,
        },
      ]);

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw dbError;
    }

    console.log("Email saved successfully:", email);

    try {
      const { error: emailError } = await supabase.functions.invoke(
        "send-confirmation-email",
        {
          body: {
            email,
            confirmationUrl: `${window.location.origin}/confirm?email=${encodeURIComponent(
              email
            )}`,
          },
        }
      );

      if (emailError) {
        console.warn("Email sending failed, but signup recorded:", emailError);
      }
    } catch (emailFunctionError) {
      console.warn(
        "Email function not yet deployed, but email signup is recorded:",
        emailFunctionError
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    throw error;
  }
};
