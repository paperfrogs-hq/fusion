const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    if (event.httpMethod === "GET") {
      // Fetch all organizations with active status (registered clients)
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to fetch organizations", details: orgsError.message }),
        };
      }

      // For each org, fetch user count and usage stats
      const orgsWithStats = await Promise.all(
        (orgs || []).map(async (org) => {
          // Get member count
          const { count: memberCount } = await supabase
            .from("organization_members")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          // Get audio files count
          const { count: audioCount } = await supabase
            .from("user_audio_files")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          // Get verification count
          const { count: verificationCount } = await supabase
            .from("user_verification_history")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          // Get API keys count
          const { count: apiKeyCount } = await supabase
            .from("api_keys")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          return {
            ...org,
            stats: {
              members: memberCount || 0,
              audioFiles: audioCount || 0,
              verifications: verificationCount || 0,
              apiKeys: apiKeyCount || 0,
              quotaUsed: org.quota_used_current_month || 0,
              quotaLimit: org.quota_verifications_monthly || 1000,
            },
          };
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ organizations: orgsWithStats }),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { action, organizationId } = body;

      if (!organizationId || !action) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Organization ID and action are required" }),
        };
      }

      if (action === "suspend") {
        const { error } = await supabase
          .from("organizations")
          .update({ account_status: "suspended" })
          .eq("id", organizationId);

        if (error) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to suspend organization", details: error.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: "Organization suspended" }),
        };
      }

      if (action === "activate") {
        const { error } = await supabase
          .from("organizations")
          .update({ account_status: "active" })
          .eq("id", organizationId);

        if (error) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to activate organization", details: error.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: "Organization activated" }),
        };
      }

      if (action === "delete") {
        // Delete organization and all related data
        const { error } = await supabase
          .from("organizations")
          .delete()
          .eq("id", organizationId);

        if (error) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to delete organization", details: error.message }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: "Organization deleted" }),
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid action" }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error in client-management:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
