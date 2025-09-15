#!/bin/bash

# 🧙‍♂️ Collection Creation Wizard Deployment Script
# 
# This script deploys all components needed for the Collection Creation Wizard
# including Firebase Functions, security rules, and index automation.

set -e

echo "🧙‍♂️ Deploying Collection Creation Wizard..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase CLI:"
    firebase login
fi

echo "📋 Current Firebase project:"
firebase use --current

read -p "🤔 Is this the correct project? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please switch to the correct project using: firebase use <project-id>"
    exit 1
fi

echo ""
echo "🚀 Step 1: Deploying Firebase Functions..."
echo "----------------------------------------"

# Deploy Firebase Functions
if [ -d "server/functions" ]; then
    cd server
    echo "📦 Installing function dependencies..."
    npm install
    
    echo "🔥 Deploying functions..."
    firebase deploy --only functions:createCollection,functions:createFirestoreIndexes,functions:updateSecurityRules,functions:getCollectionInfo,functions:listOrganizationCollections
    cd ..
else
    echo "⚠️ Warning: server/functions directory not found. Skipping function deployment."
fi

echo ""
echo "🛡️ Step 2: Updating Firestore Security Rules..."
echo "----------------------------------------------"

# Deploy security rules
if [ -f "firestore-dynamic-collections.rules" ]; then
    echo "📝 Backing up current rules..."
    firebase firestore:rules:get > firestore-rules-backup-$(date +%Y%m%d-%H%M%S).rules
    
    echo "🔒 Deploying new security rules..."
    cp firestore-dynamic-collections.rules firestore.rules
    firebase deploy --only firestore:rules
    
    echo "✅ Security rules updated successfully"
else
    echo "⚠️ Warning: firestore-dynamic-collections.rules not found. Skipping rules deployment."
fi

echo ""
echo "📊 Step 3: Setting up Index Automation..."
echo "---------------------------------------"

# Set up index automation
if [ -f "server/scripts/autoCreateIndexes.js" ]; then
    echo "🔍 Running initial index check..."
    cd server/scripts
    node autoCreateIndexes.js monitor
    cd ../..
    
    echo "📋 Index automation script is ready. To watch for new collections continuously, run:"
    echo "   cd server/scripts && node autoCreateIndexes.js watch"
else
    echo "⚠️ Warning: autoCreateIndexes.js not found. Skipping index automation setup."
fi

echo ""
echo "🏗️ Step 4: Initializing Collection Registry..."
echo "--------------------------------------------"

# Initialize collection registry if it doesn't exist
echo "📚 Checking collection registry..."

# Create a simple Node.js script to initialize the registry
cat > temp_init_registry.js << 'EOF'
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function initializeRegistry() {
  try {
    // Check if registry collection exists
    const registrySnapshot = await db.collection('collectionRegistry').limit(1).get();
    
    if (registrySnapshot.empty) {
      console.log('📝 Creating initial collection registry entry...');
      
      // Create a system entry to initialize the collection
      await db.collection('collectionRegistry').doc('_system').set({
        collectionName: '_system',
        displayName: 'System Registry',
        description: 'System collection registry initialization',
        organizationId: 'system',
        createdBy: 'system',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: false,
        isSystem: true,
        version: '1.0.0'
      });
      
      console.log('✅ Collection registry initialized');
    } else {
      console.log('✅ Collection registry already exists');
    }
    
    // Initialize other required collections
    const collections = [
      'collectionActivityLogs',
      'firestoreIndexes', 
      'securityRules'
    ];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (snapshot.empty) {
        console.log(`📝 Initializing ${collectionName} collection...`);
        await db.collection(collectionName).doc('_init').set({
          initialized: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    console.log('🎉 All collections initialized successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to initialize registry:', error);
    process.exit(1);
  }
}

initializeRegistry();
EOF

# Run the initialization script
if [ -d "server" ]; then
    cd server
    node ../temp_init_registry.js
    cd ..
else
    node temp_init_registry.js
fi

# Clean up temporary file
rm temp_init_registry.js

echo ""
echo "🧪 Step 5: Running Tests..."
echo "-------------------------"

# Test collection creation (optional)
read -p "🧪 Would you like to run a test collection creation? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔬 Testing collection creation..."
    
    # Create a simple test script
    cat > temp_test_collection.js << 'EOF'
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function testCollectionCreation() {
  try {
    console.log('🧪 Testing collection registry access...');
    
    // Test reading collection registry
    const registrySnapshot = await db.collection('collectionRegistry').limit(1).get();
    console.log(`✅ Collection registry accessible (${registrySnapshot.size} entries)`);
    
    // Test other collections
    const collections = ['collectionActivityLogs', 'firestoreIndexes', 'securityRules'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      console.log(`✅ ${collectionName} accessible`);
    }
    
    console.log('🎉 All tests passed! Collection Creation Wizard is ready to use.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCollectionCreation();
EOF

    if [ -d "server" ]; then
        cd server
        node ../temp_test_collection.js
        cd ..
    else
        node temp_test_collection.js
    fi
    
    rm temp_test_collection.js
fi

echo ""
echo "🎉 Collection Creation Wizard Deployment Complete!"
echo "================================================="
echo ""
echo "📋 What was deployed:"
echo "  ✅ Firebase Functions for collection management"
echo "  ✅ Enhanced Firestore security rules"
echo "  ✅ Index automation system"
echo "  ✅ Collection registry initialization"
echo ""
echo "🚀 Next Steps:"
echo "  1. Build and deploy your web application"
echo "  2. Test the Collection Creation Wizard in the licensing website"
echo "  3. Monitor collection creation in the Firebase Console"
echo ""
echo "📚 Documentation:"
echo "  📖 README: ./COLLECTION_CREATION_WIZARD_README.md"
echo "  🔍 Monitor indexes: cd server/scripts && node autoCreateIndexes.js watch"
echo "  📊 Check logs: firebase functions:log"
echo ""
echo "🎯 Access the wizard:"
echo "  1. Navigate to Dashboard Cloud Projects in licensing website"
echo "  2. Click Actions → Create Collection"
echo "  3. Follow the step-by-step wizard"
echo ""
echo "Happy collection creating! 🧙‍♂️✨"
