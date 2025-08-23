// Check Projects in Firestore
// This script will check what projects exist in Firestore for the enterprise.user account

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",
  authDomain: "backbone-logic.firebaseapp.com",
  projectId: "backbone-logic",
  storageBucket: "backbone-logic.firebasestorage.app",
  messagingSenderId: "749245129278",
  appId: "1:749245129278:web:dfa5647101ea160a3b276f",
  measurementId: "G-8SZRDQ4XVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Organization ID for enterprise.user
const organizationId = '24H6zaiCUycuT8ukx9Jz';

async function checkProjects() {
  console.log('Checking projects for organization ID:', organizationId);
  
  try {
    // Query projects for this organization
    const q = query(
      collection(db, 'projects'),
      where('organizationId', '==', organizationId)
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} projects:`);
    
    querySnapshot.forEach((doc) => {
      const project = doc.data();
      console.log(`- Project ID: ${doc.id}`);
      console.log(`  Name: ${project.name}`);
      console.log(`  Description: ${project.description || 'No description'}`);
      console.log(`  Status: ${project.status}`);
      console.log(`  Owner ID: ${project.ownerId}`);
      console.log(`  Organization ID: ${project.organizationId}`);
      console.log(`  Created At: ${project.createdAt?.toDate?.() || project.createdAt}`);
      console.log('---');
    });
    
    if (querySnapshot.size === 0) {
      console.log('No projects found for this organization ID.');
      console.log('Let\'s create a test project...');
      
      const projectData = {
        name: 'Enterprise Test Project',
        description: 'Test project created directly in Firestore',
        organizationId: organizationId,
        ownerId: 'l5YKvrhAD72EV2MnugbS', // enterprise.user ID
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        teamMembers: []
      };
      
      const projectRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('✅ Test project created with ID:', projectRef.id);
    }
  } catch (error) {
    console.error('Error checking projects:', error);
  }
}

// Run the function
checkProjects();