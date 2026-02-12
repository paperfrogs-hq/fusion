// Invite Team Member
// Sends an invitation to join an organization

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get organization name for the email
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const orgName = org?.name || 'a Fusion organization';

    // Build invitation data
    const invitationData = {
      organization_id: organizationId,
      email: email.toLowerCase(),
      role: role,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    };
    
    // Only add invited_by if provided
    if (invitedBy) {
      invitationData.invited_by = invitedBy;
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .insert(invitationData)
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

    // Send invitation email via Resend
    const inviteUrl = `https://fusion.paperfrogs.dev/client/accept-invite?token=${invitationToken}`;
    
    try {
      await resend.emails.send({
        from: 'Fusion Team <info@fusion.paperfrogs.dev>',
        to: email.toLowerCase(),
        subject: `You've been invited to join ${orgName} on Fusion`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Team Invitation</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #2d2d2d;
                  background: #f8f8f8;
                  padding: 20px;
                }
                .container { max-width: 580px; margin: 0 auto; }
                .box {
                  background: white;
                  border-radius: 8px;
                  padding: 40px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .logo {
                  font-size: 28px;
                  font-weight: 700;
                  color: #2d2d2d;
                  margin-bottom: 30px;
                }
                .logo span { color: #6366f1; }
                h1 {
                  font-size: 24px;
                  color: #2d2d2d;
                  margin-bottom: 20px;
                }
                p { margin-bottom: 16px; color: #4a4a4a; }
                .highlight {
                  background: #f0f9ff;
                  border-left: 4px solid #6366f1;
                  padding: 16px;
                  margin: 24px 0;
                  border-radius: 0 8px 8px 0;
                }
                .button {
                  display: inline-block;
                  background: #6366f1;
                  color: white;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  margin: 20px 0;
                }
                .role-badge {
                  display: inline-block;
                  background: #e0e7ff;
                  color: #4338ca;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 14px;
                  font-weight: 500;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  font-size: 13px;
                  color: #888;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="box">
                  <div class="logo">Fusion<span>.</span></div>
                  <h1>You're Invited!</h1>
                  <p>You've been invited to join <strong>${orgName}</strong> on Fusion.</p>
                  <div class="highlight">
                    <p style="margin: 0;">Your role: <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</span></p>
                  </div>
                  <p>Click the button below to accept this invitation and join the team:</p>
                  <a href="${inviteUrl}" class="button">Accept Invitation</a>
                  <p style="font-size: 14px; color: #888;">This invitation will expire in 7 days.</p>
                  <div class="footer">
                    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                    <p>The Fusion Team</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the request if email fails, invitation is still created
    }

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
