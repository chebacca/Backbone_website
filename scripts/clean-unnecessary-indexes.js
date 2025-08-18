#!/usr/bin/env node

/**
 * Clean Unnecessary Firestore Indexes
 * 
 * This tool removes indexes that Firebase considers "not necessary"
 * because they can be handled by single field indexes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IndexCleaner {
  constructor() {
    this.indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
    this.indexes = [];
  }

  async run() {
    console.log('🧹 Cleaning unnecessary Firestore indexes...\n');

    try {
      // Step 1: Load current indexes
      await this.loadIndexes();

      // Step 2: Remove unnecessary single-field indexes
      const originalCount = this.indexes.length;
      this.removeUnnecessaryIndexes();
      const removedCount = originalCount - this.indexes.length;

      // Step 3: Save cleaned indexes
      await this.saveCleanedIndexes();

      console.log(`\n🎉 Index cleaning completed!`);
      console.log(`📊 Removed ${removedCount} unnecessary indexes`);
      console.log(`📊 Final index count: ${this.indexes.length}`);

    } catch (error) {
      console.error('❌ Error during index cleaning:', error);
      process.exit(1);
    }
  }

  async loadIndexes() {
    const data = JSON.parse(fs.readFileSync(this.indexesPath, 'utf8'));
    this.indexes = data.indexes || [];
    console.log(`📥 Loaded ${this.indexes.length} indexes`);
  }

  removeUnnecessaryIndexes() {
    // Remove single-field indexes that Firebase considers unnecessary
    this.indexes = this.indexes.filter(index => {
      // Keep multi-field indexes (these are usually necessary)
      if (index.fields.length > 1) {
        return true;
      }

      // For single-field indexes, check if they're on simple fields
      const field = index.fields[0];
      const collection = index.collectionGroup;

      // These single-field indexes are typically unnecessary:
      const unnecessaryPatterns = [
        // Simple ascending sorts on single fields
        { fieldPath: 'name', order: 'ASCENDING' },
        { fieldPath: 'category', order: 'ASCENDING' },
        { fieldPath: 'hierarchy', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'projectId', order: 'ASCENDING' },
        { fieldPath: 'sessionId', order: 'ASCENDING' },
        { fieldPath: 'roleId', order: 'ASCENDING' },
        { fieldPath: 'departmentId', order: 'ASCENDING' },
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'email', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'ASCENDING' }
      ];

      const isUnnecessary = unnecessaryPatterns.some(pattern => 
        field.fieldPath === pattern.fieldPath && field.order === pattern.order
      );

      if (isUnnecessary) {
        console.log(`🗑️  Removing unnecessary single-field index: ${collection}.${field.fieldPath} (${field.order})`);
        return false;
      }

      return true;
    });
  }

  async saveCleanedIndexes() {
    // Create backup
    const backupPath = this.indexesPath + '.pre-clean-backup';
    fs.copyFileSync(this.indexesPath, backupPath);
    console.log('💾 Created backup of indexes before cleaning');

    // Save cleaned indexes
    const cleanedConfig = {
      indexes: this.indexes,
      fieldOverrides: []
    };

    fs.writeFileSync(this.indexesPath, JSON.stringify(cleanedConfig, null, 2));
    console.log(`✅ Saved cleaned indexes to ${this.indexesPath}`);
  }
}

// Execute if run directly
const cleaner = new IndexCleaner();
cleaner.run().catch(console.error);

export default IndexCleaner;
