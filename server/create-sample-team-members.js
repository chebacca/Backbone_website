#!/usr/bin/env node

/**
 * Create Sample Team Members for Enterprise User
 * This script creates some sample team members for testing the Cloud Projects team member functionality
 */

const sampleTeamMembers = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    department: 'Engineering',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com', 
    department: 'Design',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@example.com',
    department: 'Marketing',
    licenseType: 'ENTERPRISE'
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    department: 'Sales',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@example.com',
    department: 'Engineering',
    licenseType: 'ENTERPRISE'
  }
];

async function createTeamMembers() {
  console.log('🚀 Creating sample team members for enterprise user...');
  
  // We'll use the API endpoints to create team members
  // First, we need to get the auth token and organization ID
  
  const enterpriseUserEmail = 'enterprise.user@example.com';
  console.log(`📧 Enterprise user: ${enterpriseUserEmail}`);
  
  // For now, let's just log what we would create
  console.log('📝 Sample team members to create:');
  sampleTeamMembers.forEach((member, index) => {
    console.log(`  ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.department} - ${member.licenseType}`);
  });
  
  console.log('');
  console.log('💡 To create these team members:');
  console.log('1. Login as enterprise.user@example.com');
  console.log('2. Go to Team Management page');
  console.log('3. Use the "Add Team Member" functionality');
  console.log('4. Or use the API endpoints directly');
  
  console.log('');
  console.log('🔗 API Endpoint: POST /api/team-members/bulk-create');
  console.log('📋 Payload example:');
  console.log(JSON.stringify({
    organizationId: 'ORGANIZATION_ID_HERE',
    teamMembers: sampleTeamMembers,
    sendWelcomeEmails: false
  }, null, 2));
}

createTeamMembers().catch(console.error);

