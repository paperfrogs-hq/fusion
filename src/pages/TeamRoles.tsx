import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  Code, 
  BarChart, 
  Eye,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ClientLayout from '../components/client/ClientLayout';
import InviteMemberModal from '../components/client/InviteMemberModal';
import RolePermissionsTable from '../components/client/RolePermissionsTable';
import { getCurrentOrganization, canManageTeam } from '../lib/client-auth';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  joined_at: string;
  last_active_at?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invited_by_name: string;
  expires_at: string;
  created_at: string;
}

export default function TeamRoles() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  const org = getCurrentOrganization();
  const canManage = canManageTeam(org);

  useEffect(() => {
    loadTeamData();
  }, [org?.id]);

  const loadTeamData = async () => {
    if (!org) return;

    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch('/.netlify/functions/get-team-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: org.id }),
        }),
        fetch('/.netlify/functions/get-team-invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: org.id }),
        }),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to load team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch('/.netlify/functions/update-member-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org?.id,
          memberId,
          newRole 
        }),
      });

      if (response.ok) {
        toast.success('Role updated successfully');
        loadTeamData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch('/.netlify/functions/remove-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org?.id,
          memberId 
        }),
      });

      if (response.ok) {
        toast.success('Member removed successfully');
        loadTeamData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch('/.netlify/functions/cancel-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      if (response.ok) {
        toast.success('Invitation cancelled');
        loadTeamData();
      } else {
        toast.error('Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Cancel invitation error:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'developer': return <Code className="h-4 w-4 text-green-600" />;
      case 'analyst': return <BarChart className="h-4 w-4 text-purple-600" />;
      case 'read_only': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'developer': return 'bg-green-100 text-green-800 border-green-300';
      case 'analyst': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'read_only': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team & Roles</h1>
            <p className="text-gray-600 mt-1">
              Manage team members and their permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              {showPermissions ? 'Hide' : 'View'} Permissions
            </Button>
            {canManage && (
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </div>

        {/* Role Permissions Table */}
        {showPermissions && <RolePermissionsTable />}

        {/* Team Members */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members ({members.length})
            </h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                {canManage && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{member.full_name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`flex items-center gap-1 w-fit ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="capitalize">{member.role.replace('_', ' ')}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(member.joined_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {member.last_active_at ? formatDate(member.last_active_at) : 'Never'}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'developer')}>
                              <Code className="h-4 w-4 mr-2" />
                              Make Developer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'analyst')}>
                              <BarChart className="h-4 w-4 mr-2" />
                              Make Analyst
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'read_only')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Make Read-Only
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No team members yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Invitations ({invitations.length})
              </h2>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Expires</TableHead>
                  {canManage && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{invite.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(invite.role)}>
                        {invite.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {invite.invited_by_name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(invite.expires_at)}
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invite.id)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          organizationId={org?.id || ''}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            loadTeamData();
          }}
        />
      )}
    </ClientLayout>
  );
}
