#!/usr/bin/env node

/**
 * Simple Firebase Test Script
 * Tests Firebase configuration and hosting status
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting Simple Firebase Test...\n');

try {
  // Test 1: Firebase CLI
  console.log('🧪 Test 1: Firebase CLI Access');
  const projectInfo = execSync('firebase projects:list --json', { encoding: 'utf8' });
  const projects = JSON.parse(projectInfo);
  
  if (projects.result && projects.result.length > 0) {
    const currentProject = projects.result.find(p => p.projectId === 'backbone-logic');
    if (currentProject) {
      console.log('✅ Firebase project access verified');
      console.log(`   Project: ${currentProject.projectDisplayName}`);
      console.log(`   Project ID: ${currentProject.projectId}`);
    } else {
      console.log('❌ backbone-logic project not found');
    }
  }
  
  console.log('');
  
  // Test 2: Firebase Configuration
  console.log('🧪 Test 2: Firebase Configuration Files');
  
  const firebaseFiles = [
    '.firebaserc',
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json'
  ];
  
  firebaseFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
  
  console.log('');
  
  // Test 3: Hosting Configuration
  console.log('🧪 Test 3: Hosting Configuration');
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    if (firebaseConfig.hosting) {
      console.log('✅ Hosting configuration found');
      console.log(`   Public directory: ${firebaseConfig.hosting.public || 'Not specified'}`);
      if (firebaseConfig.hosting.rewrites) {
        console.log(`   Rewrite rules: ${firebaseConfig.hosting.rewrites.length}`);
      }
    } else {
      console.log('❌ No hosting configuration');
    }
  } catch (error) {
    console.log('❌ Error reading firebase.json:', error.message);
  }
  
  console.log('');
  
  // Test 4: Deployment Status
  console.log('🧪 Test 4: Deployment Status');
  const deployPath = '.firebase';
  if (fs.existsSync(deployPath)) {
    console.log('✅ Firebase deployment directory exists');
    const deployFiles = fs.readdirSync(deployPath);
    if (deployFiles.length > 0) {
      console.log(`   Deployment files: ${deployFiles.join(', ')}`);
    } else {
      console.log('   No deployment files found');
    }
  } else {
    console.log('⚠️  No Firebase deployment directory found');
  }
  
  console.log('');
  
  // Test 5: Package Configuration
  console.log('🧪 Test 5: Package Configuration');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Package name: ${packageJson.name}`);
    console.log(`   Type: ${packageJson.type}`);
    console.log(`   Node version: ${packageJson.engines?.node || 'Not specified'}`);
    
    if (packageJson.dependencies?.firebase) {
      console.log('✅ Firebase dependency found');
    } else {
      console.log('⚠️  Firebase dependency not found');
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
  
  console.log('\n🎉 Simple Firebase Test Complete!');
  console.log('\n🌐 Your Firebase project is configured for:');
  console.log('   https://backbone-logic.web.app');
  console.log('\n📋 Next steps:');
  console.log('   1. Open the web interface above');
  console.log('   2. Navigate to Team Management');
  console.log('   3. Test team member creation with custom passwords');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
