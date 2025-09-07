#!/usr/bin/env node

/**
 * 🔍 DATASET COLLECTION ASSIGNMENT SYSTEM VALIDATION
 * 
 * This script validates the current state of the Dataset Collection Assignment system
 * by checking configuration, deployment status, and system readiness.
 */

const fs = require('fs');
const path = require('path');

class SystemValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      checks: []
    };
  }

  check(name, condition, message, isWarning = false) {
    const status = condition ? 'PASS' : (isWarning ? 'WARN' : 'FAIL');
    const icon = condition ? '✅' : (isWarning ? '⚠️' : '❌');
    
    console.log(`${icon} ${name}: ${message}`);
    
    this.results.checks.push({ name, status, message });
    
    if (condition) {
      this.results.passed++;
    } else if (isWarning) {
      this.results.warnings++;
    } else {
      this.results.failed++;
    }
  }

  async validateFileExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    this.check(
      `File: ${description}`,
      exists,
      exists ? `Found at ${filePath}` : `Missing: ${filePath}`
    );
    return exists;
  }

  async validateFileContent(filePath, searchText, description) {
    if (!fs.existsSync(filePath)) {
      this.check(`Content: ${description}`, false, `File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const hasContent = content.includes(searchText);
    
    this.check(
      `Content: ${description}`,
      hasContent,
      hasContent ? 'Content found' : `Missing expected content: ${searchText}`
    );
    
    return hasContent;
  }

  async validateDashboardCollections() {
    console.log('\n📊 Validating Dashboard Collections Configuration...');
    
    // Check DatasetCreationWizard
    await this.validateFileContent(
      'client/src/components/DatasetCreationWizard.tsx',
      'DASHBOARD_COLLECTIONS_BY_CATEGORY',
      'DatasetCreationWizard uses Dashboard collections'
    );
    
    await this.validateFileContent(
      'client/src/components/DatasetCreationWizard.tsx',
      'Core System',
      'DatasetCreationWizard has categorized collections'
    );
    
    // Check EditDatasetDialog
    await this.validateFileContent(
      'client/src/components/EditDatasetDialog.tsx',
      'DASHBOARD_COLLECTIONS_BY_CATEGORY',
      'EditDatasetDialog uses Dashboard collections'
    );
    
    await this.validateFileContent(
      'client/src/components/EditDatasetDialog.tsx',
      'Sessions & Workflows',
      'EditDatasetDialog has categorized collections'
    );
    
    // Check for old licensing collections (should be commented out)
    const wizardContent = fs.readFileSync('client/src/components/DatasetCreationWizard.tsx', 'utf8');
    const hasOldImport = wizardContent.includes('import { COLLECTIONS, firestoreCollectionManager }') && 
                        !wizardContent.includes('// import { COLLECTIONS, firestoreCollectionManager }');
    
    this.check(
      'Legacy Collections Removed',
      !hasOldImport,
      hasOldImport ? 'Old licensing collections still imported' : 'Legacy imports properly commented out'
    );
  }

  async validateServices() {
    console.log('\n🔧 Validating Services...');
    
    // Check CloudProjectIntegration
    await this.validateFileExists(
      'client/src/services/CloudProjectIntegration.ts',
      'CloudProjectIntegration Service'
    );
    
    await this.validateFileContent(
      'client/src/services/CloudProjectIntegration.ts',
      'collectionAssignment',
      'CloudProjectIntegration supports collection assignment'
    );
    
    await this.validateFileContent(
      'client/src/services/CloudProjectIntegration.ts',
      'updateDataset',
      'CloudProjectIntegration has updateDataset method'
    );
    
    // Check DatasetConflictAnalyzer
    await this.validateFileExists(
      'client/src/services/DatasetConflictAnalyzer.ts',
      'DatasetConflictAnalyzer Service'
    );
    
    await this.validateFileContent(
      'client/src/services/DatasetConflictAnalyzer.ts',
      'analyzeOrganizationDatasets',
      'DatasetConflictAnalyzer has analysis methods'
    );
  }

  async validateComponents() {
    console.log('\n🧩 Validating Components...');
    
    // Check main components exist
    await this.validateFileExists(
      'client/src/components/DatasetCreationWizard.tsx',
      'DatasetCreationWizard Component'
    );
    
    await this.validateFileExists(
      'client/src/components/EditDatasetDialog.tsx',
      'EditDatasetDialog Component'
    );
    
    await this.validateFileExists(
      'client/src/components/DashboardCloudProjectsBridge.tsx',
      'DashboardCloudProjectsBridge Component'
    );
    
    // Check for proper integration
    await this.validateFileContent(
      'client/src/components/DashboardCloudProjectsBridge.tsx',
      'EditDatasetDialog',
      'DashboardCloudProjectsBridge imports EditDatasetDialog'
    );
    
    await this.validateFileContent(
      'client/src/components/DashboardCloudProjectsBridge.tsx',
      'showEditDatasetDialog',
      'DashboardCloudProjectsBridge has edit dialog state'
    );
  }

  async validateFirebaseConfig() {
    console.log('\n🔥 Validating Firebase Configuration...');
    
    await this.validateFileExists('firebase.json', 'Firebase Configuration');
    
    if (fs.existsSync('firebase.json')) {
      const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
      
      this.check(
        'Firebase Hosting Config',
        config.hosting && Array.isArray(config.hosting),
        'Firebase hosting configuration found'
      );
      
      this.check(
        'Firebase Functions Config',
        config.functions && config.functions.source,
        'Firebase functions configuration found'
      );
      
      // Check for hosting targets
      const hasMainTarget = config.hosting.some(h => h.target === 'main');
      this.check(
        'Main Hosting Target',
        hasMainTarget,
        hasMainTarget ? 'Main hosting target configured' : 'Main hosting target missing'
      );
    }
  }

  async validateDeploymentFiles() {
    console.log('\n📦 Validating Deployment Files...');
    
    // Check if build directory exists
    const deployExists = fs.existsSync('deploy');
    this.check(
      'Deploy Directory',
      deployExists,
      deployExists ? 'Deploy directory found' : 'Deploy directory missing (run build first)',
      !deployExists // This is a warning, not a failure
    );
    
    if (deployExists) {
      const indexExists = fs.existsSync('deploy/index.html');
      this.check(
        'Built Application',
        indexExists,
        indexExists ? 'Built application found' : 'Built application missing'
      );
    }
  }

  async validateDocumentation() {
    console.log('\n📚 Validating Documentation...');
    
    // Check MPC library documentation
    const mpcFiles = [
      '../shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_MPC.md',
      '../shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_DEPLOYMENT_GUIDE.md',
      '../shared-mpc-library/DATASET_COLLECTION_ASSIGNMENT_TESTING_GUIDE.md'
    ];
    
    for (const file of mpcFiles) {
      await this.validateFileExists(file, `MPC Documentation: ${path.basename(file)}`);
    }
    
    // Check test guides
    await this.validateFileExists(
      'MANUAL_DATASET_TEST_GUIDE.md',
      'Manual Test Guide'
    );
  }

  async validateSystemIntegration() {
    console.log('\n🔗 Validating System Integration...');
    
    // Check that all components are properly connected
    const bridgeContent = fs.readFileSync('client/src/components/DashboardCloudProjectsBridge.tsx', 'utf8');
    
    this.check(
      'Dataset Creation Integration',
      bridgeContent.includes('DatasetCreationWizard') && bridgeContent.includes('showCreateDatasetWizard'),
      'Dataset creation properly integrated'
    );
    
    this.check(
      'Dataset Editing Integration',
      bridgeContent.includes('EditDatasetDialog') && bridgeContent.includes('showEditDatasetDialog'),
      'Dataset editing properly integrated'
    );
    
    this.check(
      'Dataset Insights Integration',
      bridgeContent.includes('datasetConflictAnalyzer') && bridgeContent.includes('showDatasetInsightsDialog'),
      'Dataset insights properly integrated'
    );
    
    // Check for proper imports
    this.check(
      'Service Imports',
      bridgeContent.includes('CloudProjectIntegration') && bridgeContent.includes('DatasetConflictAnalyzer'),
      'Required services properly imported'
    );
  }

  async validateCollectionCategories() {
    console.log('\n📋 Validating Collection Categories...');
    
    const wizardContent = fs.readFileSync('client/src/components/DatasetCreationWizard.tsx', 'utf8');
    
    const expectedCategories = [
      'Core System',
      'Sessions & Workflows',
      'Inventory & Equipment',
      'Timecards & Scheduling',
      'Media & Content',
      'AI & Automation',
      'Business & Licensing',
      'Production Budget Management'
    ];
    
    for (const category of expectedCategories) {
      this.check(
        `Category: ${category}`,
        wizardContent.includes(category),
        `Collection category "${category}" found`
      );
    }
    
    // Check for proper collection assignments
    const expectedCollections = [
      'users', 'teamMembers', 'organizations', 'projects',
      'sessions', 'sessionWorkflows', 'mediaFiles',
      'inventoryItems', 'timecard_entries', 'aiAgents'
    ];
    
    let foundCollections = 0;
    for (const collection of expectedCollections) {
      if (wizardContent.includes(`'${collection}'`)) {
        foundCollections++;
      }
    }
    
    this.check(
      'Dashboard Collections',
      foundCollections >= expectedCollections.length * 0.8, // At least 80% found
      `Found ${foundCollections}/${expectedCollections.length} expected Dashboard collections`
    );
  }

  printSummary() {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 SYSTEM VALIDATION PASSED!');
      console.log('✅ Dataset Collection Assignment system is properly configured');
      console.log('✅ All components and services are in place');
      console.log('✅ Dashboard collections are properly categorized');
      console.log('✅ System is ready for testing and deployment');
      
      if (this.results.warnings > 0) {
        console.log(`\n⚠️  Note: ${this.results.warnings} warnings found - these are non-critical issues`);
      }
    } else {
      console.log('\n❌ SYSTEM VALIDATION FAILED!');
      console.log('Please address the failed checks above before proceeding.');
      
      console.log('\n🔧 Failed Checks:');
      this.results.checks
        .filter(check => check.status === 'FAIL')
        .forEach((check, index) => {
          console.log(`${index + 1}. ${check.name}: ${check.message}`);
        });
    }
    
    console.log('\n📖 Next Steps:');
    if (this.results.failed === 0) {
      console.log('1. Follow the Manual Test Guide: MANUAL_DATASET_TEST_GUIDE.md');
      console.log('2. Test with "Corporate Video - Incredible Cotton Shirt" project');
      console.log('3. Validate multi-tenant data isolation');
      console.log('4. Verify collection assignment functionality');
    } else {
      console.log('1. Fix the failed validation checks');
      console.log('2. Re-run this validation script');
      console.log('3. Proceed with testing once all checks pass');
    }
  }

  async run() {
    console.log('🔍 DATASET COLLECTION ASSIGNMENT SYSTEM VALIDATION');
    console.log('='.repeat(60));
    console.log('Checking system configuration and readiness...\n');
    
    await this.validateDashboardCollections();
    await this.validateServices();
    await this.validateComponents();
    await this.validateFirebaseConfig();
    await this.validateDeploymentFiles();
    await this.validateDocumentation();
    await this.validateSystemIntegration();
    await this.validateCollectionCategories();
    
    this.printSummary();
    
    return this.results.failed === 0;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  async function main() {
    const validator = new SystemValidator();
    const success = await validator.run();
    process.exit(success ? 0 : 1);
  }
  
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = SystemValidator;
