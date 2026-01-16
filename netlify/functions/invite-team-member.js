// Invite Team Member
// Sends an invitation to join an organization

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { organizationId, email, role, invitedBy } = JSON.parse(event.body);

    if (!organizationId || !email || !role) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID, email, and role are required' }),
      };
    }

    // Validate role
    const validRoles = ['admin', 'developer', 'analyst', 'read_only'];
    if (!validRoles.includes(role)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid role' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is already a member
    const { data: existingUser } = await supabase
      .from('client_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'User is already a member of this organization' }),
        };
      }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email.toLowerCase())
      .is('accepted_at', null)
      .single();

    if (existingInvite) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'An invitation has already been sent to this email' }),
      };
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email: email.toLowerCase(),
        role: role,
        invited_by: invitedBy,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create invitation' }),
      };
    }

    // TODO: Send invitation email via Resend
    // const inviteUrl = `${process.env.URL}/client/accept-invite?token=${invitationToken}`;
    // await sendInvitationEmail(email, orgName, inviterName, inviteUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at,
        },
        // TODO: Remove this in production - only for testing
        invitationToken: invitationToken,
      }),
    };
  } catch (error) {
    console.error('Invite team member error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
