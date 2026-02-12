import { Check, X } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const permissions = [
  { name: 'View Dashboard', owner: true, admin: true, developer: true, analyst: true, read_only: true },
  { name: 'View Verification Activity', owner: true, admin: true, developer: true, analyst: true, read_only: true },
  { name: 'View Analytics', owner: true, admin: true, developer: true, analyst: true, read_only: true },
  { name: 'Export Reports', owner: true, admin: true, developer: true, analyst: true, read_only: false },
  { name: 'Manage API Keys', owner: true, admin: true, developer: true, analyst: false, read_only: false },
  { name: 'Manage Webhooks', owner: true, admin: true, developer: true, analyst: false, read_only: false },
  { name: 'View Team Members', owner: true, admin: true, developer: true, analyst: true, read_only: true },
  { name: 'Invite Team Members', owner: true, admin: true, developer: false, analyst: false, read_only: false },
  { name: 'Remove Team Members', owner: true, admin: true, developer: false, analyst: false, read_only: false },
  { name: 'Change Member Roles', owner: true, admin: true, developer: false, analyst: false, read_only: false },
  { name: 'View Billing', owner: true, admin: true, developer: false, analyst: false, read_only: false },
  { name: 'Manage Billing', owner: true, admin: false, developer: false, analyst: false, read_only: false },
  { name: 'Organization Settings', owner: true, admin: true, developer: false, analyst: false, read_only: false },
  { name: 'Delete Organization', owner: true, admin: false, developer: false, analyst: false, read_only: false },
];

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
  return allowed ? (
    <Check className="h-5 w-5 text-green-400 mx-auto" />
  ) : (
    <X className="h-5 w-5 text-neutral-600 mx-auto" />
  );
};

export default function RolePermissionsTable() {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <div className="p-6 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-white">Role Permissions</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Overview of what each role can do in your organization
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Permission</TableHead>
              <TableHead className="text-center">Owner</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Developer</TableHead>
              <TableHead className="text-center">Analyst</TableHead>
              <TableHead className="text-center">Read Only</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell className="text-center">
                  <PermissionIcon allowed={permission.owner} />
                </TableCell>
                <TableCell className="text-center">
                  <PermissionIcon allowed={permission.admin} />
                </TableCell>
                <TableCell className="text-center">
                  <PermissionIcon allowed={permission.developer} />
                </TableCell>
                <TableCell className="text-center">
                  <PermissionIcon allowed={permission.analyst} />
                </TableCell>
                <TableCell className="text-center">
                  <PermissionIcon allowed={permission.read_only} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 bg-neutral-800 border-t border-neutral-700">
        <div className="text-sm text-neutral-400 space-y-1">
          <p><strong className="text-white">Owner:</strong> Full control including billing and organization deletion</p>
          <p><strong className="text-white">Admin:</strong> Full access except billing management</p>
          <p><strong className="text-white">Developer:</strong> Technical access for API integration and development</p>
          <p><strong className="text-white">Analyst:</strong> View and analyze data, generate reports</p>
          <p><strong className="text-white">Read Only:</strong> View-only access to all data and settings</p>
        </div>
      </div>
    </Card>
  );
}
