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
      // Fetch all pending organizations
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .in("account_status", ["pending_approval", "pending_verification", "suspended"])
        .order("created_at", { ascending: false });

      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to fetch organizations", details: orgsError.message }),
        };
      }

      // For each org, fetch associated users through organization_members -> client_users
      const businessesWithUsers = await Promise.all(
        (orgs || []).map(async (org) => {
          // Get organization members
          const { data: members } = await supabase
            .from("organization_members")
            .select("user_id")
            .eq("organization_id", org.id);

          // Get client_users for those member IDs
          const userIds = (members || []).map((m) => m.user_id);
          let users = [];

          if (userIds.length > 0) {
            const { data: clientUsers } = await supabase
              .from("client_users")
              .select("id, email, full_name, account_status")
              .in("id", userIds);

            users = clientUsers || [];
          }

          return {
            ...org,
            users,
          };
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ businesses: businessesWithUsers }),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { action, organizationId, reason } = body;

      if (!organizationId || !action) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Organization ID and action are required" }),
        };
      }

      // Get organization and its users
      const { data: org, error: orgFetchError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (orgFetchError || !org) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Organization not found" }),
        };
      }

      // Get members
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organizationId);

      const userIds = (members || []).map((m) => m.user_id);

      // Get client_users
      const { data: users } = await supabase
        .from("client_users")
        .select("id, email, full_name")
        .in("id", userIds);

      const newStatus = action === "approve" ? "active" : "rejected";

      // Update organization status
      const { error: orgUpdateError } = await supabase
        .from("organizations")
        .update({ account_status: newStatus })
        .eq("id", organizationId);

      if (orgUpdateError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to update organization", details: orgUpdateError.message }),
        };
      }

      // Update all users
      if (userIds.length > 0) {
        await supabase
          .from("client_users")
          .update({ account_status: newStatus })
          .in("id", userIds);
      }

      // Return success with user emails for sending notifications
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          action,
          organizationName: org.name,
          users: users || [],
          reason: reason || null,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error in business-approval:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
