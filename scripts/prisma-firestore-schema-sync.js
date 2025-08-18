#!/usr/bin/env node

/**
 * Prisma to Firestore Schema Synchronization Tool
 * 
 * This tool analyzes your Prisma schema and generates:
 * 1. Firestore collection structures
 * 2. Required Firestore indexes
 * 3. Data mapping functions
 * 4. Schema validation rules
 * 
 * Usage: node scripts/prisma-firestore-schema-sync.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PRISMA_SCHEMA_PATH = '../../Dashboard-v14_2/apps/server/prisma/schema.prisma';
const OUTPUT_DIR = './generated-schema';
const FIRESTORE_INDEXES_PATH = './firestore.indexes.json';

class PrismaFirestoreSchemaSync {
  constructor() {
    this.prismaModels = new Map();
    this.firestoreCollections = new Map();
    this.requiredIndexes = [];
    this.mappingFunctions = [];
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔄 Starting Prisma to Firestore Schema Synchronization...\n');

    try {
      // Step 1: Parse Prisma Schema
      await this.parsePrismaSchema();
      
      // Step 2: Generate Firestore Collections
      await this.generateFirestoreCollections();
      
      // Step 3: Generate Required Indexes
      await this.generateFirestoreIndexes();
      
      // Step 4: Generate Mapping Functions
      await this.generateMappingFunctions();
      
      // Step 5: Generate Validation Rules
      await this.generateValidationRules();
      
      // Step 6: Output Results
      await this.outputResults();
      
      console.log('✅ Schema synchronization completed successfully!');
      
    } catch (error) {
      console.error('❌ Schema synchronization failed:', error);
      process.exit(1);
    }
  }

  /**
   * Parse Prisma schema file and extract models
   */
  async parsePrismaSchema() {
    console.log('📖 Parsing Prisma schema...');
    
    const schemaPath = path.resolve(__dirname, PRISMA_SCHEMA_PATH);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Prisma schema not found at: ${schemaPath}`);
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const models = this.extractModelsFromSchema(schemaContent);
    
    console.log(`   Found ${models.length} Prisma models`);
    
    models.forEach(model => {
      this.prismaModels.set(model.name, model);
    });
  }

  /**
   * Extract model definitions from Prisma schema
   */
  extractModelsFromSchema(schemaContent) {
    const models = [];
    const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      const fields = this.parseModelFields(modelBody);
      const indexes = this.parseModelIndexes(modelBody);
      const relations = this.parseModelRelations(modelBody);
      
      models.push({
        name: modelName,
        fields,
        indexes,
        relations,
        rawBody: modelBody
      });
    }

    return models;
  }

  /**
   * Parse model fields from model body
   */
  parseModelFields(modelBody) {
    const fields = [];
    const lines = modelBody.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
      
      // Parse field definition: fieldName Type @attributes
      const fieldMatch = trimmed.match(/^(\w+)\s+(\w+(?:\[\])?(?:\?)?)\s*(.*)?$/);
      if (fieldMatch) {
        const [, name, type, attributes] = fieldMatch;
        
        fields.push({
          name,
          type: this.mapPrismaTypeToFirestore(type),
          originalType: type,
          attributes: attributes || '',
          isOptional: type.includes('?'),
          isArray: type.includes('[]'),
          isRelation: this.isRelationField(type, attributes)
        });
      }
    }
    
    return fields;
  }

  /**
   * Parse model indexes
   */
  parseModelIndexes(modelBody) {
    const indexes = [];
    const indexRegex = /@@index\(\[([^\]]+)\]/g;
    let match;

    while ((match = indexRegex.exec(modelBody)) !== null) {
      const fields = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
      indexes.push({ fields });
    }

    return indexes;
  }

  /**
   * Parse model relations
   */
  parseModelRelations(modelBody) {
    const relations = [];
    const lines = modelBody.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('@relation')) {
        const fieldMatch = trimmed.match(/^(\w+)\s+(\w+(?:\[\])?(?:\?)?)/);
        if (fieldMatch) {
          relations.push({
            fieldName: fieldMatch[1],
            relatedModel: fieldMatch[2].replace(/[\[\]?]/g, ''),
            isArray: fieldMatch[2].includes('[]'),
            isOptional: fieldMatch[2].includes('?')
          });
        }
      }
    }
    
    return relations;
  }

  /**
   * Map Prisma types to Firestore types
   */
  mapPrismaTypeToFirestore(prismaType) {
    const baseType = prismaType.replace(/[\[\]?]/g, '');
    
    const typeMapping = {
      'String': 'string',
      'Int': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'DateTime': 'timestamp',
      'Json': 'object',
      'Bytes': 'blob'
    };
    
    return typeMapping[baseType] || 'reference';
  }

  /**
   * Check if field is a relation
   */
  isRelationField(type, attributes = '') {
    return attributes.includes('@relation') || 
           (!['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes'].includes(type.replace(/[\[\]?]/g, '')));
  }

  /**
   * Generate Firestore collection structures
   */
  async generateFirestoreCollections() {
    console.log('🏗️  Generating Firestore collections...');
    
    for (const [modelName, model] of this.prismaModels) {
      const collectionName = this.modelNameToCollectionName(modelName);
      
      const collection = {
        name: collectionName,
        originalModel: modelName,
        fields: {},
        subcollections: [],
        requiredIndexes: []
      };
      
      // Map fields
      for (const field of model.fields) {
        if (!field.isRelation) {
          collection.fields[field.name] = {
            type: field.type,
            required: !field.isOptional,
            isArray: field.isArray
          };
        } else if (field.isArray) {
          // One-to-many relations become subcollections
          collection.subcollections.push({
            name: field.fieldName,
            parentField: 'id',
            foreignKey: `${modelName.toLowerCase()}Id`
          });
        }
      }
      
      // Generate indexes based on Prisma indexes and common query patterns
      for (const index of model.indexes) {
        collection.requiredIndexes.push({
          fields: index.fields.map(f => ({ fieldPath: f, order: 'ASCENDING' }))
        });
      }
      
      // Add common query indexes
      if (collection.fields.userId) {
        collection.requiredIndexes.push({
          fields: [
            { fieldPath: 'userId', order: 'ASCENDING' },
            { fieldPath: 'createdAt', order: 'DESCENDING' }
          ]
        });
      }
      
      if (collection.fields.status) {
        collection.requiredIndexes.push({
          fields: [
            { fieldPath: 'status', order: 'ASCENDING' },
            { fieldPath: 'createdAt', order: 'DESCENDING' }
          ]
        });
      }
      
      this.firestoreCollections.set(collectionName, collection);
    }
    
    console.log(`   Generated ${this.firestoreCollections.size} Firestore collections`);
  }

  /**
   * Convert model name to collection name
   */
  modelNameToCollectionName(modelName) {
    // Convert PascalCase to snake_case and pluralize
    return modelName
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .substring(1) + 's';
  }

  /**
   * Generate required Firestore indexes
   */
  async generateFirestoreIndexes() {
    console.log('📊 Generating Firestore indexes...');
    
    const indexes = [];
    
    for (const [collectionName, collection] of this.firestoreCollections) {
      for (const index of collection.requiredIndexes) {
        indexes.push({
          collectionGroup: collectionName,
          queryScope: 'COLLECTION',
          fields: index.fields
        });
      }
    }
    
    this.requiredIndexes = indexes;
    console.log(`   Generated ${indexes.length} required indexes`);
  }

  /**
   * Generate mapping functions
   */
  async generateMappingFunctions() {
    console.log('🔄 Generating mapping functions...');
    
    for (const [modelName, model] of this.prismaModels) {
      const collectionName = this.modelNameToCollectionName(modelName);
      
      const mappingFunction = this.generateModelMappingFunction(modelName, model, collectionName);
      this.mappingFunctions.push(mappingFunction);
    }
    
    console.log(`   Generated ${this.mappingFunctions.length} mapping functions`);
  }

  /**
   * Generate mapping function for a specific model
   */
  generateModelMappingFunction(modelName, model, collectionName) {
    const nonRelationFields = model.fields.filter(f => !f.isRelation);
    
    return `
/**
 * Map ${modelName} from Prisma to Firestore format
 */
export function map${modelName}ToFirestore(prismaData: any): any {
  return {
    ${nonRelationFields.map(field => {
      if (field.type === 'timestamp') {
        return `${field.name}: prismaData.${field.name} ? Timestamp.fromDate(new Date(prismaData.${field.name})) : null,`;
      } else if (field.type === 'object') {
        return `${field.name}: prismaData.${field.name} || {},`;
      } else {
        return `${field.name}: prismaData.${field.name},`;
      }
    }).join('\n    ')}
    
    // Metadata
    _prismaId: prismaData.id,
    _syncedAt: Timestamp.now(),
    _version: 1
  };
}

/**
 * Map ${modelName} from Firestore to Prisma format
 */
export function map${modelName}FromFirestore(firestoreData: any): any {
  return {
    ${nonRelationFields.map(field => {
      if (field.type === 'timestamp') {
        return `${field.name}: firestoreData.${field.name}?.toDate() || null,`;
      } else {
        return `${field.name}: firestoreData.${field.name},`;
      }
    }).join('\n    ')}
  };
}`;
  }

  /**
   * Generate validation rules
   */
  async generateValidationRules() {
    console.log('✅ Generating validation rules...');
    
    // Generate Firestore security rules
    const securityRules = this.generateFirestoreSecurityRules();
    
    // Generate TypeScript validation schemas
    const validationSchemas = this.generateValidationSchemas();
    
    this.validationRules = {
      securityRules,
      validationSchemas
    };
  }

  /**
   * Generate Firestore security rules
   */
  generateFirestoreSecurityRules() {
    let rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
`;

    for (const [collectionName, collection] of this.firestoreCollections) {
      rules += `
    // ${collection.originalModel} collection
    match /${collectionName}/{documentId} {
      allow read, write: if request.auth != null;
      
      ${collection.fields.userId ? `
      // User-specific data access
      allow read, write: if request.auth.uid == resource.data.userId;
      ` : ''}
    }`;
    }

    rules += `
  }
}`;

    return rules;
  }

  /**
   * Generate TypeScript validation schemas
   */
  generateValidationSchemas() {
    let schemas = `// Generated validation schemas
import { z } from 'zod';

`;

    for (const [modelName, model] of this.prismaModels) {
      const nonRelationFields = model.fields.filter(f => !f.isRelation);
      
      schemas += `
export const ${modelName}FirestoreSchema = z.object({
${nonRelationFields.map(field => {
  let zodType = 'z.unknown()';
  
  switch (field.type) {
    case 'string':
      zodType = 'z.string()';
      break;
    case 'number':
      zodType = 'z.number()';
      break;
    case 'boolean':
      zodType = 'z.boolean()';
      break;
    case 'timestamp':
      zodType = 'z.date()';
      break;
    case 'object':
      zodType = 'z.object({}).passthrough()';
      break;
  }
  
  if (field.isOptional) {
    zodType += '.optional()';
  }
  
  if (field.isArray) {
    zodType = `z.array(${zodType})`;
  }
  
  return `  ${field.name}: ${zodType},`;
}).join('\n')}
});

export type ${modelName}Firestore = z.infer<typeof ${modelName}FirestoreSchema>;
`;
    }

    return schemas;
  }

  /**
   * Output all generated files
   */
  async outputResults() {
    console.log('📝 Writing output files...\n');
    
    // Create output directory
    const outputDir = path.resolve(__dirname, OUTPUT_DIR);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 1. Write Firestore collections schema
    const collectionsSchema = {
      collections: Array.from(this.firestoreCollections.values()),
      generatedAt: new Date().toISOString(),
      sourceSchema: PRISMA_SCHEMA_PATH
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'firestore-collections.json'),
      JSON.stringify(collectionsSchema, null, 2)
    );
    console.log('   ✅ Generated: firestore-collections.json');
    
    // 2. Write required indexes
    const indexesConfig = {
      indexes: this.requiredIndexes,
      fieldOverrides: []
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'firestore-indexes-generated.json'),
      JSON.stringify(indexesConfig, null, 2)
    );
    console.log('   ✅ Generated: firestore-indexes-generated.json');
    
    // 3. Write mapping functions
    const mappingFunctionsContent = `// Generated mapping functions
import { Timestamp } from 'firebase/firestore';

${this.mappingFunctions.join('\n\n')}
`;
    
    fs.writeFileSync(
      path.join(outputDir, 'firestore-mappings.ts'),
      mappingFunctionsContent
    );
    console.log('   ✅ Generated: firestore-mappings.ts');
    
    // 4. Write validation rules
    fs.writeFileSync(
      path.join(outputDir, 'firestore.rules'),
      this.validationRules.securityRules
    );
    console.log('   ✅ Generated: firestore.rules');
    
    fs.writeFileSync(
      path.join(outputDir, 'validation-schemas.ts'),
      this.validationRules.validationSchemas
    );
    console.log('   ✅ Generated: validation-schemas.ts');
    
    // 5. Generate summary report
    const summary = this.generateSummaryReport();
    fs.writeFileSync(
      path.join(outputDir, 'sync-summary.md'),
      summary
    );
    console.log('   ✅ Generated: sync-summary.md');
    
    console.log(`\n📁 All files generated in: ${outputDir}`);
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    return `# Prisma to Firestore Schema Sync Report

Generated: ${new Date().toISOString()}

## Summary

- **Prisma Models**: ${this.prismaModels.size}
- **Firestore Collections**: ${this.firestoreCollections.size}
- **Required Indexes**: ${this.requiredIndexes.length}
- **Mapping Functions**: ${this.mappingFunctions.length}

## Collections Generated

${Array.from(this.firestoreCollections.values()).map(collection => 
  `- **${collection.name}** (from ${collection.originalModel})
  - Fields: ${Object.keys(collection.fields).length}
  - Indexes: ${collection.requiredIndexes.length}
  - Subcollections: ${collection.subcollections.length}`
).join('\n')}

## Next Steps

1. Review generated Firestore collections in \`firestore-collections.json\`
2. Update your \`firestore.indexes.json\` with indexes from \`firestore-indexes-generated.json\`
3. Integrate mapping functions from \`firestore-mappings.ts\` into your FirestoreBridgeService
4. Deploy Firestore security rules from \`firestore.rules\`
5. Use validation schemas from \`validation-schemas.ts\` for type safety

## Important Notes

- This is an automated generation - review all outputs before using in production
- Some complex relationships may need manual adjustment
- Test all mappings thoroughly before deploying
- Consider data migration strategy for existing data
`;
  }
}

// Execute if run directly
const sync = new PrismaFirestoreSchemaSync();
sync.run().catch(console.error);

export default PrismaFirestoreSchemaSync;
