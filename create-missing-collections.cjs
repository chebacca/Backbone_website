const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function createMissingCollections() {
  console.log('🔧 CREATING MISSING COLLECTIONS');
  console.log('===============================');
  
  try {
    // 1. Create project_datasets collection (links projects to datasets)
    console.log('\n1️⃣ Creating project_datasets collection...');
    
    const projects = await db.collection('projects')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`Found ${projects.size} projects to create dataset links for`);
    
    let datasetLinkCount = 0;
    for (const projectDoc of projects.docs) {
      const projectData = projectDoc.data();
      
      // Create a sample dataset link for each project
      const datasetLink = {
        projectId: projectDoc.id,
        datasetId: `dataset-${projectDoc.id}-sample`,
        organizationId: 'default-org',
        assignedAt: new Date().toISOString(),
        assignedBy: 'system',
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('project_datasets').add(datasetLink);
      datasetLinkCount++;
      
      console.log(`   ✅ Created dataset link for project: ${projectData.name}`);
    }
    
    // 2. Create datasets collection
    console.log('\n2️⃣ Creating datasets collection...');
    
    const sampleDatasets = [
      {
        id: 'dataset-sample-1',
        name: 'Sample Dataset 1',
        description: 'Sample dataset for testing',
        organizationId: 'default-org',
        projectIds: [],
        size: 1024000,
        fileCount: 10,
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'dataset-sample-2',
        name: 'Sample Dataset 2',
        description: 'Another sample dataset',
        organizationId: 'default-org',
        projectIds: [],
        size: 2048000,
        fileCount: 25,
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];
    
    for (const dataset of sampleDatasets) {
      await db.collection('datasets').doc(dataset.id).set(dataset);
      console.log(`   ✅ Created dataset: ${dataset.name}`);
    }
    
    // 3. Create any other missing collections that might be queried
    console.log('\n3️⃣ Creating other missing collections...');
    
    // Sessions
    const sampleSession = {
      id: 'session-sample-1',
      name: 'Sample Session',
      organizationId: 'default-org',
      projectId: projects.docs[0]?.id || 'default-project',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('sessions').doc(sampleSession.id).set(sampleSession);
    console.log(`   ✅ Created sample session`);
    
    // Session Elements
    const sampleSessionElement = {
      id: 'element-sample-1',
      sessionId: sampleSession.id,
      organizationId: 'default-org',
      type: 'video',
      name: 'Sample Element',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('sessionElements').doc(sampleSessionElement.id).set(sampleSessionElement);
    console.log(`   ✅ Created sample session element`);
    
    // Workflows
    const sampleWorkflow = {
      id: 'workflow-sample-1',
      name: 'Sample Workflow',
      organizationId: 'default-org',
      projectId: projects.docs[0]?.id || 'default-project',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('workflows').doc(sampleWorkflow.id).set(sampleWorkflow);
    console.log(`   ✅ Created sample workflow`);
    
    console.log('\n🎉 MISSING COLLECTIONS CREATED');
    console.log('==============================');
    console.log(`✅ Created ${datasetLinkCount} project-dataset links`);
    console.log('✅ Created 2 sample datasets');
    console.log('✅ Created sample session, elements, and workflow');
    console.log('✅ All collections should now be accessible without permission errors');
    
  } catch (error) {
    console.error('❌ Error creating missing collections:', error);
  }
  
  process.exit(0);
}

createMissingCollections().catch(console.error);
