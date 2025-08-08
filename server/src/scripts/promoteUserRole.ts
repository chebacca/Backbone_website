/*
  Promote or demote a user to a specific role.
  Usage:
    pnpm tsx src/scripts/promoteUserRole.ts --email "user@example.com" --role "SUPERADMIN"

  Notes:
  - Loads DATABASE_URL from environment automatically via dotenv
  - Valid roles: USER, ADMIN, ENTERPRISE_ADMIN, SUPERADMIN
*/

import 'dotenv/config';
import { prisma } from '../utils/prisma.js';

const validRoles = new Set(['USER', 'ADMIN', 'ENTERPRISE_ADMIN', 'SUPERADMIN']);

function parseArgs(): { email: string; role: string } {
  const args = process.argv.slice(2);
  let email = '';
  let role = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--email' || arg === '-e') && args[i + 1]) {
      email = args[i + 1];
      i++;
      continue;
    }
    if ((arg === '--role' || arg === '-r') && args[i + 1]) {
      role = args[i + 1].toUpperCase();
      i++;
      continue;
    }
  }

  if (!email || !role) {
    console.error('Usage: pnpm tsx src/scripts/promoteUserRole.ts --email "user@example.com" --role "SUPERADMIN"');
    process.exit(1);
  }

  if (!validRoles.has(role)) {
    console.error(`Invalid role: ${role}. Valid roles: ${Array.from(validRoles).join(', ')}`);
    process.exit(1);
  }

  return { email, role };
}

async function main() {
  const { email, role } = parseArgs();
  console.log(`Promoting user ${email} to role ${role}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: role as any } });
  console.log(`Updated role for ${email} from ${user.role} to ${role}.`);
}

main()
  .catch((err) => {
    console.error('Failed to update role:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


