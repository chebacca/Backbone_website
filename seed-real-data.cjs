/**
 * 🌱 Seed Real Data Script
 * 
 * Creates the actual data structure needed for the streamlined architecture
 * to work with real Firestore data (no fallbacks).
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

const ORGANIZATION_DATA = {
  'example-corp-org': {
    name: 'Example Corp',
    tier: 'ENTERPRISE',
    description: 'Enterprise organization for testing',
    settings: {
      features: ['team_management', 'advanced_analytics', 'api_access'],
      limits: {
        maxUsers: 100,
        maxProjects: 50,
        storageGB: 1000
      }
    },
    status: 'ACTIVE',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  'basic-org': {
    name: 'Basic Organization',
    tier: 'BASIC',
    description: 'Basic tier organization',
    settings: {
      features: ['basic_features'],
      limits: {
        maxUsers: 5,
        maxProjects: 5,
        storageGB: 10
      }
    },
    status: 'ACTIVE',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  'pro-org': {
    name: 'Professional Organization',
    tier: 'PROFESSIONAL', 
    description: 'Professional tier organization',
    settings: {
      features: ['team_management', 'analytics'],
      limits: {
        maxUsers: 25,
        maxProjects: 25,
        storageGB: 100
      }
    },
    status: 'ACTIVE',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
};

const SUBSCRIPTION_DATA = {
  'example-corp-org': {
    organizationId: 'example-corp-org',
    status: 'ACTIVE',
    plan: {
      tier: 'ENTERPRISE',
      seats: 10,
      pricePerSeat: 1980, // $19.80 in cents
      billingCycle: 'monthly'
    },
    payment: {
      stripeSubscriptionId: 'sub_enterprise_123',
      stripeCustomerId: 'cus_enterprise_123',
      method: 'card',
      lastFour: '4242',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  'basic-org': {
    organizationId: 'basic-org',
    status: 'ACTIVE',
    plan: {
      tier: 'BASIC',
      seats: 3,
      pricePerSeat: 380, // $3.80 in cents
      billingCycle: 'monthly'
    },
    payment: {
      stripeSubscriptionId: 'sub_basic_123',
      stripeCustomerId: 'cus_basic_123',
      method: 'card',
      lastFour: '1234',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  'pro-org': {
    organizationId: 'pro-org',
    status: 'ACTIVE',
    plan: {
      tier: 'PROFESSIONAL',
      seats: 5,
      pricePerSeat: 980, // $9.80 in cents
      billingCycle: 'monthly'
    },
    payment: {
      stripeSubscriptionId: 'sub_pro_123',
      stripeCustomerId: 'cus_pro_123',
      method: 'card',
      lastFour: '5678',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
};

const USER_DATA = {
  '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2': { // enterprise.user@example.com
    email: 'enterprise.user@example.com',
    name: 'Enterprise User',
    firstName: 'Enterprise',
    lastName: 'User',
    userType: 'ACCOUNT_OWNER',
    role: 'OWNER',
    organizationId: 'example-corp-org',
    status: 'ACTIVE',
    permissions: ['CREATE_PROJECTS', 'MANAGE_TEAM', 'BILLING_ACCESS'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
};

const PROJECT_DATA = [
  {
    name: 'Enterprise Project Alpha',
    description: 'Main enterprise project for testing',
    organizationId: 'example-corp-org',
    status: 'ACTIVE',
    visibility: 'organization',
    teamAssignments: [
      {
        userId: '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2',
        role: 'PROJECT_OWNER',
        permissions: ['READ', 'WRITE', 'ADMIN']
      }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now()
  },
  {
    name: 'Enterprise Project Beta',
    description: 'Secondary enterprise project',
    organizationId: 'example-corp-org',
    status: 'ACTIVE',
    visibility: 'organization',
    teamAssignments: [
      {
        userId: '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2',
        role: 'PROJECT_OWNER',
        permissions: ['READ', 'WRITE', 'ADMIN']
      }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now()
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    // 1. Seed Organizations
    console.log('📁 Seeding organizations...');
    for (const [orgId, orgData] of Object.entries(ORGANIZATION_DATA)) {
      await db.collection('organizations').doc(orgId).set(orgData);
      console.log(`✅ Created organization: ${orgData.name}`);
    }

    // 2. Seed Subscriptions
    console.log('💳 Seeding subscriptions...');
    for (const [orgId, subData] of Object.entries(SUBSCRIPTION_DATA)) {
      await db.collection('subscriptions').add(subData);
      console.log(`✅ Created subscription for: ${orgId}`);
    }

    // 3. Update User Data
    console.log('👤 Updating user data...');
    for (const [userId, userData] of Object.entries(USER_DATA)) {
      await db.collection('users').doc(userId).set(userData, { merge: true });
      console.log(`✅ Updated user: ${userData.email}`);
    }

    // 4. Seed Projects
    console.log('📊 Seeding projects...');
    for (const projectData of PROJECT_DATA) {
      await db.collection('projects').add(projectData);
      console.log(`✅ Created project: ${projectData.name}`);
    }

    console.log('🎉 Data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Organizations: ${Object.keys(ORGANIZATION_DATA).length}`);
    console.log(`- Subscriptions: ${Object.keys(SUBSCRIPTION_DATA).length}`);
    console.log(`- Users updated: ${Object.keys(USER_DATA).length}`);
    console.log(`- Projects: ${PROJECT_DATA.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
