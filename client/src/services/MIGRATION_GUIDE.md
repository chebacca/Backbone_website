# CloudProjectIntegration Migration Guide

## Overview

We've refactored the `CloudProjectIntegration` service to follow better software design principles:

1. **Single Responsibility Principle**: Each service now handles a specific domain.
2. **Separation of Concerns**: Data access is separated from business logic.
3. **Dependency Injection**: Services receive their dependencies.
4. **Testability**: Each component can be tested in isolation.

## New Architecture

The new architecture consists of:

```
┌─────────────────────────┐
│CloudProjectIntegration  │  <-- Facade (Backward Compatible API)
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│   ServiceFactory        │  <-- Creates and manages service instances
└───────────┬─────────────┘
            │
┌───────────┼─────────────┐
│           │             │
▼           ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Project  │ │Dataset  │ │TeamMember│  <-- Domain-specific services
│Service  │ │Service  │ │Service  │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └─────┬─────┴─────┬─────┘
           │           │
           ▼           ▼
    ┌────────────┐ ┌───────────┐
    │FirestoreAdapter│ │API Client │  <-- Data access adapters
    └────────────┘ └───────────┘
```

## Migration Steps

### 1. Use the new CloudProjectIntegration

The new implementation maintains the same API, so in most cases, you don't need to change your code:

```typescript
// This import remains the same
import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
```

### 2. For new components, use the specific services

For new components, consider using the specific services directly:

```typescript
import { ServiceFactory } from '../services/ServiceFactory';

// In your component
const projectService = ServiceFactory.getInstance().getProjectService();
const datasetService = ServiceFactory.getInstance().getDatasetService();
const teamMemberService = ServiceFactory.getInstance().getTeamMemberService();
```

### 3. Testing

The new architecture is much more testable. You can mock the services:

```typescript
// Mock the ProjectService
jest.mock('../services/ProjectService', () => ({
  ProjectService: {
    getInstance: jest.fn().mockReturnValue({
      getProjects: jest.fn().mockResolvedValue([/* mock projects */])
    })
  }
}));
```

## Benefits of the New Architecture

1. **Maintainability**: Smaller, focused files are easier to understand and maintain.
2. **Performance**: More efficient code with less duplication.
3. **Testability**: Each component can be tested in isolation.
4. **Flexibility**: Easy to add new features or change implementation details.
5. **Readability**: Clear separation of concerns makes the code more readable.

## File Structure

```
services/
├── adapters/
│   └── FirestoreAdapter.ts         # Abstracts Firestore operations
├── base/
│   └── BaseService.ts              # Base service class and interface
├── models/
│   └── types.ts                    # Shared domain models and types
├── CloudProjectIntegration.ts      # Facade for backward compatibility
├── DatasetService.ts               # Dataset-specific operations
├── ProjectService.ts               # Project-specific operations
├── ServiceFactory.ts               # Creates and manages service instances
└── TeamMemberService.ts            # Team member-specific operations
```

## How to Switch to the New Implementation

1. Rename the old implementation:
   ```
   mv CloudProjectIntegration.ts CloudProjectIntegration.old.ts
   ```

2. Rename the new implementation:
   ```
   mv CloudProjectIntegrationNew.ts CloudProjectIntegration.ts
   ```

3. Test your application to ensure everything works as expected.

4. Once confirmed, you can remove the old implementation:
   ```
   rm CloudProjectIntegration.old.ts
   ```
