# Services Architecture

## Overview

This directory contains the service layer of the application, which handles all communication with backend services and data storage.

The services are organized following the principles of:
- **Single Responsibility Principle**: Each service handles a specific domain.
- **Separation of Concerns**: Data access is separated from business logic.
- **Dependency Injection**: Services receive their dependencies.
- **Testability**: Each component can be tested in isolation.

## Directory Structure

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

## Service Descriptions

### CloudProjectIntegration

A facade that provides backward compatibility with the original CloudProjectIntegration while delegating to the new service architecture. This allows for a gradual migration to the new architecture.

### ServiceFactory

Creates and manages service instances. It ensures that only one instance of each service exists and provides a central point for configuration.

### ProjectService

Handles all project-related operations, including:
- Getting projects
- Creating projects
- Updating projects
- Archiving/restoring projects

### DatasetService

Handles all dataset-related operations, including:
- Listing datasets
- Creating datasets
- Assigning datasets to projects
- Unassigning datasets from projects

### TeamMemberService

Handles all team member-related operations, including:
- Getting licensed team members
- Getting project team members
- Adding team members to projects
- Removing team members from projects
- Updating team member roles

### FirestoreAdapter

Abstracts Firestore operations, providing a clean interface for services to interact with Firestore. It handles:
- Document creation
- Document updates
- Document deletion
- Document queries
- Data conversion (Firestore timestamps to ISO strings)

## Usage

### Using the Facade

For backward compatibility, you can continue using the CloudProjectIntegration facade:

```typescript
import { cloudProjectIntegration } from '../services/CloudProjectIntegration';

// Use as before
const projects = await cloudProjectIntegration.getProjects();
```

### Using Specific Services

For new components, consider using the specific services directly:

```typescript
import { ServiceFactory } from '../services/ServiceFactory';

// Get service instances
const projectService = ServiceFactory.getInstance().getProjectService();
const datasetService = ServiceFactory.getInstance().getDatasetService();
const teamMemberService = ServiceFactory.getInstance().getTeamMemberService();

// Use the services
const projects = await projectService.getProjects();
const datasets = await datasetService.listDatasets();
const teamMembers = await teamMemberService.getLicensedTeamMembers();
```

## WebOnly Mode

The services support a "webonly" mode, which bypasses API calls and interacts directly with Firestore. This is useful for development and testing without a backend server.

To enable webonly mode:
- Add `?webonly=true` to the URL
- Set `webonly_mode` to `true` in localStorage
- Set `ENV.WEBONLY` to `true` in the environment

## Testing

See the `test-refactor.ts` file for examples of how to test the services.
