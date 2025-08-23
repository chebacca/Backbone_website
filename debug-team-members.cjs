/**
 * Debug script to check team members in Firestore
 * Run with: node debug-team-members.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDhZNPdCJGkQhzZgZgZgZgZgZgZgZgZgZg",
    authDomain: "backbone-logic.firebaseapp.com",
    projectId: "backbone-logic",
    storageBucket: "backbone-logic.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefghijklmnop"
};

async function debugTeamMembers() {
    try {
        console.log('🔍 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        console.log('📊 Checking teamMembers collection...');
        
        // Get all team members
        const allTeamMembersSnapshot = await getDocs(collection(db, 'teamMembers'));
        console.log(`📋 Total team members in collection: ${allTeamMembersSnapshot.size}`);
        
        if (allTeamMembersSnapshot.size > 0) {
            console.log('\n👥 All team members:');
            allTeamMembersSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`  ${index + 1}. ID: ${doc.id}`);
                console.log(`     Name: ${data.name || 'N/A'}`);
                console.log(`     Email: ${data.email || 'N/A'}`);
                console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
                console.log(`     Org ID: ${data.orgId || 'N/A'}`);
                console.log(`     Status: ${data.status || 'N/A'}`);
                console.log(`     License Type: ${data.licenseType || 'N/A'}`);
                console.log('     ---');
            });
        }
        
        // Check for specific organization ID
        const testOrgId = 'C6L6jdoNbMs4QxcZ6IGI';
        console.log(`\n🏢 Checking for organization ID: ${testOrgId}`);
        
        try {
            const orgQuery = query(
                collection(db, 'teamMembers'),
                where('organizationId', '==', testOrgId)
            );
            const orgSnapshot = await getDocs(orgQuery);
            console.log(`   Found ${orgSnapshot.size} members with organizationId = ${testOrgId}`);
        } catch (error) {
            console.log(`   Error querying organizationId: ${error.message}`);
        }
        
        try {
            const orgIdQuery = query(
                collection(db, 'teamMembers'),
                where('orgId', '==', testOrgId)
            );
            const orgIdSnapshot = await getDocs(orgIdQuery);
            console.log(`   Found ${orgIdSnapshot.size} members with orgId = ${testOrgId}`);
        } catch (error) {
            console.log(`   Error querying orgId: ${error.message}`);
        }
        
        // Check users collection for organization info
        console.log('\n👤 Checking users collection...');
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`📋 Total users in collection: ${allUsersSnapshot.size}`);
        
        if (allUsersSnapshot.size > 0) {
            console.log('\n👤 All users with organization info:');
            allUsersSnapshot.forEach((doc, index) => {
                const data = doc.data();
                if (data.organizationId || data.orgId) {
                    console.log(`  ${index + 1}. ID: ${doc.id}`);
                    console.log(`     Email: ${data.email || 'N/A'}`);
                    console.log(`     Organization ID: ${data.organizationId || 'N/A'}`);
                    console.log(`     Org ID: ${data.orgId || 'N/A'}`);
                    console.log(`     Role: ${data.role || 'N/A'}`);
                    console.log('     ---');
                }
            });
        }
        
        console.log('\n✅ Debug complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugTeamMembers();
