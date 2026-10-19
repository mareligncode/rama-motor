import Role from '../models/role.js';

export const ALL_PERMISSIONS = [
  // Roles & Permissions
  'roles:read',
  'roles:write',
  'roles:delete',
  // Staff management
  'staff:read',
  'staff:write',
  'staff:delete',
  // User management
  'users:read',
  'users:write',
  'users:verify_national_id',
  // Drivers & Vehicles
  'drivers:read',
  'drivers:verify',
  'drivers:write',
  'vehicles:read',
  'vehicles:write',
  // Deliveries & Dispatch
  'deliveries:read',
  'deliveries:create',
  'deliveries:dispatch',
  'deliveries:cancel',
  // Finance & Wallets
  'finance:read',
  'finance:settle',
  'finance:refund',
  // Audit & System
  'audit:read',
  'incidents:read',
  'incidents:resolve',
];

export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    description: 'Full administrative access across all operational, financial, and system modules',
    permissions: ALL_PERMISSIONS,
    status: 'active',
  },
  {
    name: 'Operations Manager',
    description: 'Manages drivers, vehicles, dispatch operations, and incident resolutions',
    permissions: [
      'staff:read',
      'users:read',
      'drivers:read',
      'drivers:verify',
      'drivers:write',
      'vehicles:read',
      'vehicles:write',
      'deliveries:read',
      'deliveries:create',
      'deliveries:dispatch',
      'deliveries:cancel',
      'incidents:read',
      'incidents:resolve',
      'audit:read',
    ],
    status: 'active',
  },
  {
    name: 'Dispatcher',
    description: 'Real-time live dispatching, order assignments, and delivery tracking monitoring',
    permissions: [
      'drivers:read',
      'vehicles:read',
      'deliveries:read',
      'deliveries:create',
      'deliveries:dispatch',
      'deliveries:cancel',
      'incidents:read',
    ],
    status: 'active',
  },
  {
    name: 'Customer Support',
    description: 'Customer and driver service support, ticket management, and review moderation',
    permissions: [
      'users:read',
      'drivers:read',
      'deliveries:read',
      'incidents:read',
      'incidents:resolve',
    ],
    status: 'active',
  },
  {
    name: 'Finance Officer',
    description: 'Handles driver settlements, cash on delivery (COD) reconciliations, and refunds',
    permissions: [
      'users:read',
      'drivers:read',
      'deliveries:read',
      'finance:read',
      'finance:settle',
      'finance:refund',
      'audit:read',
    ],
    status: 'active',
  },
  {
    name: 'Compliance & Auditor',
    description: 'View-only access for auditing transactions, driver licenses, and system audit logs',
    permissions: [
      'roles:read',
      'staff:read',
      'users:read',
      'drivers:read',
      'deliveries:read',
      'finance:read',
      'audit:read',
      'incidents:read',
    ],
    status: 'active',
  },
];

export async function seedRoles() {
  try {
    const existingCount = await Role.countDocuments();
    if (existingCount === 0) {
      await Role.insertMany(DEFAULT_ROLES);
      console.log('Seeded standard default roles successfully.');
    }
  } catch (error) {
    console.error(`[SeedRoles Error]: ${error.message}`);
  }
}
