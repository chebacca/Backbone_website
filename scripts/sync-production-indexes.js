#!/usr/bin/env node

/**
 * Production Firestore Index Synchronization Tool
 * 
 * This tool takes the current production indexes and merges them with
 * the comprehensive indexes we generated from the Prisma schema,
 * ensuring no conflicts during deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production indexes from Firebase (current state)
const productionIndexes = {
  "indexes": [
    {
      "collectionGroup": "activities",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "activities",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "activities",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "audit_log",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "action",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "audit_log",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "audit_log",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "license_delivery_logs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "paymentId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "licenses",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "read",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "org_members",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "orgId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "subscriptionId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "privacy_consents",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "consentDate",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "project_participants",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "organizationId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "visibility",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "ownerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "ownerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isArchived",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "visibility",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isArchived",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "applicationMode",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "lastAccessedAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "sdk_versions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isLatest",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "platform",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "usage_analytics",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "licenseId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "usage_analytics",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "user_time_cards",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "user_time_cards",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "user_time_cards",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "user_time_cards",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "user_time_cards",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "role",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "lastActive",
          "order": "DESCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    },
    {
      "collectionGroup": "webhook_events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "processed",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "retryCount",
          "order": "ASCENDING"
        }
      ],
      "density": "SPARSE_ALL"
    }
  ],
  "fieldOverrides": []
};

class ProductionIndexSync {
  constructor() {
    this.productionIndexes = productionIndexes.indexes;
    this.generatedIndexes = [];
    this.finalIndexes = [];
  }

  async run() {
    console.log('🔄 Syncing production Firestore indexes...\n');

    try {
      // Step 1: Load generated indexes (if they exist)
      await this.loadGeneratedIndexes();

      // Step 2: Start with production indexes (these are guaranteed to work)
      this.finalIndexes = [...this.productionIndexes];
      console.log(`✅ Loaded ${this.productionIndexes.length} production indexes`);

      // Step 3: Add non-conflicting generated indexes
      await this.addNonConflictingIndexes();

      // Step 4: Write the synchronized index file
      await this.writeSynchronizedIndexes();

      console.log('\n🎉 Production index synchronization completed successfully!');
      console.log(`📊 Final index count: ${this.finalIndexes.length}`);

    } catch (error) {
      console.error('❌ Error during production index sync:', error);
      process.exit(1);
    }
  }

  async loadGeneratedIndexes() {
    const generatedPath = path.join(__dirname, 'generated-schema', 'firestore-indexes-generated.json');
    
    if (fs.existsSync(generatedPath)) {
      const generatedData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
      this.generatedIndexes = generatedData.indexes || [];
      console.log(`📥 Loaded ${this.generatedIndexes.length} generated indexes`);
    } else {
      console.log('⚠️  No generated indexes found, using production indexes only');
    }
  }

  async addNonConflictingIndexes() {
    let addedCount = 0;

    for (const generatedIndex of this.generatedIndexes) {
      if (!this.indexExists(generatedIndex)) {
        this.finalIndexes.push(generatedIndex);
        addedCount++;
      }
    }

    console.log(`➕ Added ${addedCount} new indexes from generated schema`);
  }

  indexExists(targetIndex) {
    return this.finalIndexes.some(existingIndex => 
      this.indexesMatch(existingIndex, targetIndex)
    );
  }

  indexesMatch(index1, index2) {
    if (index1.collectionGroup !== index2.collectionGroup) return false;
    if (index1.queryScope !== index2.queryScope) return false;
    if (index1.fields.length !== index2.fields.length) return false;

    for (let i = 0; i < index1.fields.length; i++) {
      const field1 = index1.fields[i];
      const field2 = index2.fields[i];
      
      if (field1.fieldPath !== field2.fieldPath || field1.order !== field2.order) {
        return false;
      }
    }

    return true;
  }

  async writeSynchronizedIndexes() {
    const outputPath = path.join(__dirname, '..', 'firestore.indexes.json');
    const backupPath = path.join(__dirname, '..', 'firestore.indexes.json.backup');

    // Create backup
    if (fs.existsSync(outputPath)) {
      fs.copyFileSync(outputPath, backupPath);
      console.log('💾 Created backup of existing indexes file');
    }

    // Write synchronized indexes
    const finalConfig = {
      indexes: this.finalIndexes,
      fieldOverrides: []
    };

    fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2));
    console.log(`✅ Wrote synchronized indexes to ${outputPath}`);

    // Write summary
    const summaryPath = path.join(__dirname, 'generated-schema', 'production-sync-summary.md');
    const summary = this.generateSummary();
    fs.writeFileSync(summaryPath, summary);
    console.log(`📋 Generated summary at ${summaryPath}`);
  }

  generateSummary() {
    return `# Production Firestore Index Synchronization Summary

## Overview
- **Production Indexes**: ${this.productionIndexes.length}
- **Generated Indexes**: ${this.generatedIndexes.length}
- **Final Indexes**: ${this.finalIndexes.length}
- **Sync Date**: ${new Date().toISOString()}

## Status
✅ **SYNCHRONIZED** - Local firestore.indexes.json now matches production state

## What Was Done
1. Loaded current production indexes (${this.productionIndexes.length} indexes)
2. Preserved all existing production indexes to prevent conflicts
3. Added ${this.finalIndexes.length - this.productionIndexes.length} new indexes from generated schema
4. Created backup of previous local file

## Next Steps
- Deploy with \`firebase deploy --only firestore:indexes\`
- No conflicts should occur as all production indexes are preserved
- New indexes will be created for enhanced schema parity

## Collections Covered
${[...new Set(this.finalIndexes.map(idx => idx.collectionGroup))].sort().map(collection => `- ${collection}`).join('\n')}
`;
  }
}

// Execute if run directly
const sync = new ProductionIndexSync();
sync.run().catch(console.error);

export default ProductionIndexSync;
