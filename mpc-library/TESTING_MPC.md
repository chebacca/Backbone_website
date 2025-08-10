# Testing (MPC)

## Current Status
- **Testing Framework**: Not yet implemented
- **Current Approach**: Manual testing via REST clients and Postman
- **Database Testing**: Seeding scripts available for development

## Available Testing Tools

### Database Seeding
```bash
pnpm seed                    # Seed database with test data
pnpm seed:clear             # Clear all seeded data
pnpm seed:reset             # Reset and reseed database
pnpm seed:chris-mole        # Seed specific test user data
pnpm seed:enterprise-admin  # Seed enterprise admin user
pnpm seed:enterprise-multi  # Seed multi-organization data
```

### Development Testing
- **Frontend**: Vite dev server with hot reload
- **Backend**: tsx watch mode for development
- **Database**: Prisma Studio for database inspection
- **API Testing**: Postman, Insomnia, or similar REST clients

## Testing Strategy (Recommended)

### Unit Testing
- **Frontend**: React Testing Library + Jest
- **Backend**: Jest + Supertest for API testing
- **Services**: Mock external dependencies (Stripe, Resend)

### Integration Testing
- **API Endpoints**: Test complete request/response cycles
- **Database**: Test Prisma operations with test database
- **External Services**: Mock webhooks and API calls

### End-to-End Testing
- **User Flows**: Complete user journeys (signup → payment → license)
- **Admin Flows**: Administrative operations and compliance
- **Payment Flows**: Stripe integration testing

## Test Data Management

### Seeding Scripts
- **User Data**: Test users with different roles
- **Subscription Data**: Various subscription tiers and statuses
- **License Data**: Sample licenses for testing
- **Payment Data**: Test payment records
- **Compliance Data**: Audit logs and consent records

### Test Environment
- **Database**: Separate test database or schema
- **External APIs**: Stripe test mode, Resend test environment
- **Environment Variables**: Test-specific configuration

## Recommended Testing Stack

### Frontend Testing
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### Backend Testing
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@types/jest": "^29.0.0",
    "@types/supertest": "^2.0.0"
  }
}
```

## Testing Commands (Future)
```bash
pnpm test                   # Run all tests
pnpm test:unit             # Run unit tests only
pnpm test:integration      # Run integration tests only
pnpm test:e2e              # Run end-to-end tests
pnpm test:coverage         # Run tests with coverage
```

## Current Testing Workflow
1. **Development**: Use seeding scripts for test data
2. **API Testing**: Test endpoints manually with REST clients
3. **Frontend Testing**: Manual testing in browser
4. **Payment Testing**: Use Stripe test mode
5. **Email Testing**: Use Resend test environment

## Next Steps for Testing
1. Set up Jest testing framework
2. Implement unit tests for services
3. Add API endpoint testing
4. Create frontend component tests
5. Set up CI/CD testing pipeline
6. Add test coverage reporting
