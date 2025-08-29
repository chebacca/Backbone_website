#!/usr/bin/env node

/**
 * Check Firestore Index Status
 * 
 * This script checks if the required composite index for the projects collection
 * has been created and what its current status is.
 */

import { execSync } from 'child_process';

async function checkIndexStatus() {
  try {
    console.log('🔍 Checking Firestore Index Status...');
    console.log('=====================================\n');
    
    // Check if Firebase CLI is available
    try {
      execSync('firebase --version', { stdio: 'pipe' });
      console.log('✅ Firebase CLI is available');
    } catch (error) {
      console.log('❌ Firebase CLI not found');
      return;
    }
    
    // Check if user is logged in
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase CLI is authenticated');
    } catch (error) {
      console.log('❌ Firebase CLI not authenticated');
      return;
    }
    
    console.log('\n📋 Checking index status for projects collection...');
    console.log('Required index: organizationId (Ascending) + createdAt (Ascending)');
    
    // Use Firebase CLI to list indexes
    try {
      console.log('\n🔍 Fetching current indexes...');
      const result = execSync('firebase firestore:indexes', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Check if our specific index exists
      if (result.includes('projects') && result.includes('organizationId') && result.includes('createdAt')) {
        console.log('\n✅ REQUIRED INDEX FOUND!');
        console.log('The projects collection index appears to exist.');
        
        // Look for the specific index we need
        const lines = result.split('\n');
        let foundSpecificIndex = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('"collectionGroup": "projects"')) {
            // Check if this index has the fields we need
            let hasOrgId = false;
            let hasCreatedAt = false;
            
            for (let j = i; j < Math.min(i + 15, lines.length); j++) {
              if (lines[j].includes('"fieldPath": "organizationId"')) hasOrgId = true;
              if (lines[j].includes('"fieldPath": "createdAt"')) hasCreatedAt = true;
            }
            
            if (hasOrgId && hasCreatedAt) {
              foundSpecificIndex = true;
              console.log('\n🎯 PERFECT MATCH FOUND!');
              console.log('This index supports: organizationId + createdAt queries');
              console.log('Your app should now work without index errors!');
              break;
            }
          }
        }
        
        if (!foundSpecificIndex) {
          console.log('\n⚠️ INDEX EXISTS BUT MAY NOT BE PERFECT MATCH');
          console.log('You have a projects index, but it may not support the exact query pattern.');
        }
        
      } else {
        console.log('\n❌ REQUIRED INDEX NOT FOUND');
        console.log('The projects collection index does not appear to exist yet.');
        console.log('You need to create it using the Firebase Console.');
      }
      
      console.log('\n📊 Full Index List:');
      console.log('===================');
      console.log(result);
      
    } catch (error) {
      console.log('\n⚠️ Could not fetch indexes via CLI. Checking via Console...');
      console.log('Please check manually at: https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes');
    }
    
    console.log('\n🔗 Direct link to check indexes:');
    console.log('https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes');
    
    console.log('\n📝 Index Status Meanings:');
    console.log('- BUILDING: Index is being created (wait 5-10 minutes)');
    console.log('- READY: Index is ready and queries will work');
    console.log('- ERROR: Index creation failed (check console for errors)');
    
  } catch (error) {
    console.error('❌ Error checking index status:', error.message);
  }
}

// Run the function
checkIndexStatus();
