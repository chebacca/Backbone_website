import { prisma } from '../src/utils/prisma.ts';
import { PasswordUtil } from '../src/utils/password.ts';

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: tsx scripts/update-user-password.ts <email> <newPassword>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    const hashed = await PasswordUtil.hash(newPassword);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    console.log(`Password updated for ${email}`);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
