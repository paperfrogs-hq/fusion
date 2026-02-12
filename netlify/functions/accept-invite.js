// Accept Team Invitation
// Accepts an organization invitation and adds user to organization

const { createClient } = require('@supabase/supabase-js');

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
    const { token, userId } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invitation token is required' }),
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User must be logged in to accept invitation' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*, organizations(id, name, slug, plan_type)')
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invitation) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invitation not found or already used' }),
      };
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ error: 'Invitation has expired' }),
      };
    }

    // Get user email to verify it matches the invitation
    const { data: user, error: userError } = await supabase
      .from('client_users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Verify email matches (case-insensitive)
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'This invitation was sent to a different email address',
          invitedEmail: invitation.email
        }),
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      // Mark invitation as accepted anyway
      await supabase
        .from('organization_invitations')
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by: userId
        })
        .eq('id', invitation.id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'You are already a member of this organization',
          organization: invitation.organizations
        }),
      };
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: userId,
        role: invitation.role,
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Member insert error:', memberError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to add you to the organization' }),
      };
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Update error:', updateError);
      // Don't fail - user was added successfully
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `You have joined ${invitation.organizations?.name || 'the organization'} as ${invitation.role}`,
        organization: invitation.organizations,
        role: invitation.role
      }),
    };

  } catch (error) {
    console.error('Accept invitation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
