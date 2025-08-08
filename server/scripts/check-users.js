#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking current users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Total users found: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });

    // Check for any old admin emails
    const oldAdminEmails = [
      'chebacca@gmail.com',
      'admin@dashboardv14.com',
      'che.bacca@dashboardv14.com'
    ];

    const foundOldAdmins = users.filter(user => 
      oldAdminEmails.includes(user.email.toLowerCase())
    );

    if (foundOldAdmins.length > 0) {
      console.log('⚠️  WARNING: Found old admin users that should be removed:');
      foundOldAdmins.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log('✅ No old admin users found - database is clean!');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
