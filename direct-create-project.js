// Direct Create Project and Dataset
// This script will directly create a project and dataset in Firestore without using Firebase Auth

// Function to create a project and dataset
async function createProjectAndDataset() {
  try {
    // Import Firebase
    const { initializeApp } = await import('firebase/app');
    const { 
      getFirestore, 
      collection, 
      addDoc,
      serverTimestamp 
    } = await import('firebase/firestore');
    
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
    
    console.log('Creating project and dataset...');
    
    // Organization ID for enterprise.user
    const organizationId = '24H6zaiCUycuT8ukx9Jz';
    
    // Create project
    const projectData = {
      name: 'Enterprise Test Project 2025',
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
    console.log('✅ Project created with ID:', projectRef.id);
    
    // Create dataset
    const datasetData = {
      name: 'Enterprise Test Dataset 2025',
      description: 'Test dataset created directly in Firestore',
      organizationId: organizationId,
      ownerId: 'l5YKvrhAD72EV2MnugbS', // enterprise.user ID
      visibility: 'organization',
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
      size: 0,
      fileCount: 0,
      backend: 'firestore'
    };
    
    const datasetRef = await addDoc(collection(db, 'datasets'), datasetData);
    console.log('✅ Dataset created with ID:', datasetRef.id);
    
    // Create project-dataset relationship
    const projectDatasetData = {
      projectId: projectRef.id,
      datasetId: datasetRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const projectDatasetRef = await addDoc(collection(db, 'project_datasets'), projectDatasetData);
    console.log('✅ Project-Dataset relationship created with ID:', projectDatasetRef.id);
    
    return {
      projectId: projectRef.id,
      datasetId: datasetRef.id,
      projectDatasetId: projectDatasetRef.id
    };
  } catch (error) {
    console.error('❌ Error creating project and dataset:', error);
  }
}

// Run the function
createProjectAndDataset();
