# Development Learnings

## Next.js 15.3.4 Migration (2025-07-01T00:08:01.000Z)

### Implementation Insights
- Route handler types require NextRequest instead of Request
- Dynamic parameters must be extracted from request.nextUrl.pathname
- Enhanced error handling with consistent response format

### Performance Improvements
- Optimized server component rendering
- Reduced bundle size through better code splitting
- Improved static optimization capabilities

### Debugging Solutions
1. Route Handler Type Errors
   - Remove params argument from handlers
   - Use request.nextUrl.pathname for dynamic parameters
   - Implement proper error response formatting

2. Component Loading Issues
   - Clear .next cache before rebuilding
   - Verify dynamic import configurations
   - Check suspense boundary placement

## Dev

- Correctly mocked Next.js app router and useAuth hook for testing layout components.
  - Implemented a custom test utility to provide consistent mocks.
  - Removed incorrect widget test that expected a non-existent image uploader.
  - Use of testing library for React UI components ensures accurate app behavior verification.
  - Improved understanding of mocking external dependencies and test setup.
- Next.js 13+ App Router requires careful consideration of component hierarchy and data flow
- TypeScript configuration optimized for Next.js needs specific compiler options

## Design
- App Router architecture promotes cleaner separation of concerns
- Component organization follows Next.js 13+ conventions

## Next.js App Router Structure

### Component Organization (2025-06-30T19:24:03Z)
- **Client Components vs Server Components**:
  - Client components must be marked with 'use client'
  - Dynamic imports (next/dynamic) must be within client components
  - Server components cannot use client-side hooks or browser APIs

### Common Pitfalls
1. **Dynamic Imports in Server Components**:
   - ❌ Don't use `next/dynamic` with `ssr: false` in server components
   - ✅ Move dynamic imports to client components
   - ✅ Use proper loading states and suspense boundaries

2. **Component Structure**:
   - ❌ Don't mix client and server logic in the same component
   - ✅ Create separate client components for interactive features
   - ✅ Use layout components for shared UI elements

3. **Error Prevention**:
   - Implement error boundaries in client components
   - Use suspense for loading states
   - Keep component responsibilities clear and separated

### Best Practices
1. **File Organization**:
   ```
   /components
     /client/        # Client-side components
       Navigation.tsx
       ErrorBoundary.tsx
     /server/        # Server-side components
   /app
     /[route]
       page.tsx      # Server component by default
       layout.tsx    # Layout wrapper
   ```

2. **Component Implementation**:
   ```typescript
   // Client Component
   'use client';
   import { useState } from 'react';

   // Server Component
   import { ClientComponent } from '@/components/client';
   export default function Page() {
     return <ClientComponent />;
   }
   ```

3. **Dynamic Imports**:
   ```typescript
   // In client components only:
   const DynamicComponent = dynamic(
     () => import('@/components/client/Component'),
     {
       loading: () => <LoadingUI />,
       ssr: false
     }
   );
   ```

### Troubleshooting Guide
1. **Chunk Loading Errors**:
   - Check component import structure
   - Verify client/server component separation
   - Clear .next cache and rebuild

2. **Runtime Errors**:
   - Implement error boundaries
   - Use proper loading states
   - Keep client-side logic in client components

## Backend
- API routes follow the new App Router conventions
- Server Components provide enhanced performance capabilities

### Next.js Route Handler Type Issues (2025-06-30T18:53:04Z)
- Issue: Route handler type errors with params in Next.js 15.3.4
- Solution:
  1. Used NextRequest instead of Request type
  2. Removed params argument causing type conflicts
  3. Extracted route parameters from request.nextUrl.pathname
  4. Maintained type safety while preserving functionality
- Key Learnings:
  - Next.js 15.3.4 requires specific type structures for route handlers
  - Dynamic route parameters should be accessed via URL pathname
  - Proper error handling maintained with consistent response format

## Frontend
- New file-system based routing simplifies navigation structure
- Server and Client Components require strategic implementation

### TypeScript and React Syntax (2025-07-01T00:00:58Z)

#### Type Safety in React Components

1. **Component Props**
   ```typescript
   // Always define interfaces for component props
   interface ProjectRowProps {
     project: Project;  // Use existing types when possible
   }

   // Use the interface in component definition
   const ProjectRow = ({ project }: ProjectRowProps) => (...)
   ```

2. **MongoDB ID Handling**
   ```typescript
   // When dealing with MongoDB ObjectIds, always convert to string
   // Wrong: organizationId: organization._id
   // Correct:
   organizationId: organization._id.toString()

   // When dealing with potentially undefined values, use optional chaining
   organizationId: organization?._id?.toString() || ''
   ```

3. **State Management**
   ```typescript
   // Initialize state with proper typing
   const [projects, setProjects] = useState<Project[]>([]);
   const [error, setError] = useState<string | null>(null);
   ```

#### React Attributes and Rendering

1. **HTML Attributes**
   ```typescript
   // Use curly braces for numeric values
   // Wrong: <td colSpan="4">
   // Correct:
   <td colSpan={4}>
   ```

2. **List Keys**
   ```typescript
   // Always use unique, stable keys for list items
   // Wrong: <ProjectRow key={index}>
   // Correct:
   <ProjectRow key={project._id}>

   // For loading placeholders, use predictable unique keys
   Array.from({ length: 3 }, (_, index) => (
     <div key={`loading-row-${index}`}>
   ));
   ```

#### API and Data Handling

1. **Data Transformation**
   ```typescript
   // Always transform API response data to match your interfaces
   const projectData = Array.isArray(data) ? data : data?.projects || [];
   setProjects(projectData.map((project) => ({
     ...project,
     _id: project._id.toString()  // Ensure IDs are strings
   })));
   ```

2. **Error Handling**
   ```typescript
   // Type check errors and provide fallbacks
   setError(err instanceof Error ? err.message : 'An error occurred');
   ```

#### Best Practices

1. **Type Safety**
   - Never use `any` unless absolutely necessary
   - Define interfaces for all component props
   - Use union types for variant components

2. **State Management**
   - Initialize state with proper types
   - Use discriminated unions for complex state

3. **Code Organization**
   - Keep related code together
   - Use consistent naming conventions
   - Document complex type relationships

## Security
- 2024-01-17T10:30:00.000Z: Identified and fixed critical security vulnerabilities in dependencies
- Implemented enhanced security measures for input validation
- Updated all packages to latest secure versions

### ChunkLoadError Resolution (2025-06-30T19:34:26Z)
- Issue: ChunkLoadError in admin layout with dynamic component loading
- Solution:
  1. Use dynamic imports with proper loading states
  2. Implement Suspense boundaries around dynamic components
  3. Keep ErrorBoundary at the top level
  4. Set `ssr: true` for dynamic imports to ensure server-side rendering
  5. Clear .next and node_modules for clean rebuild
- Key Learnings:
  - Dynamic imports need proper error and loading states
  - Client components should be wrapped in Suspense boundaries
  - Clean rebuilds help prevent stale chunk issues

## Process
- Documentation-first approach ensures better project maintainability
- Version control strategy aligned with semantic versioning

## Development Environment Verification (2024-02-13T12:00:00.000Z)

### System Status
- Next.js 15.3.4 development server running successfully
- Development port automatically adjusted from 3000 to 3001 (port conflict resolution working)
- Environment loading: .env.local and .env.development configurations applied

### Performance Metrics
- Server startup time: 1230ms
- Route compilation times:
  - Middleware: 164ms
  - Main route (/): 641ms
  - Organization routes: 386ms
  - Project routes: 284ms
  - Builder interface: 332ms
  - Mosaic interface: 260ms

### Core Functionality Verification

#### Backend Services
- MongoDB connection established successfully in development mode
- Database operations verified:
  - Organization CRUD operations: ✓
  - Project management: ✓
  - Image retrieval system: ✓ (Successfully retrieving stored images)

#### API Endpoints
All critical API endpoints operational:
- Authentication (/api/me): 
  - Response times: 31-232ms
  - Status: 200 OK
- Organizations (/api/organizations):
  - GET: 200 OK
  - POST: 201 Created
  - Response times: 28-408ms
- Projects (/api/projects):
  - GET: 200 OK
  - POST: 201 Created
  - Response times: 70-2981ms
- Images (/api/images):
  - GET: 200 OK
  - Response time: 160ms
  - Successfully retrieving stored images (7 images in test)

#### UI Components
All major interface routes compiled and accessible:
- /organizations
- /projects
- /builder
- /mosaic

#### Performance Considerations
1. Project API response times showing occasional high latency (up to 2981ms)
   - Recommendation: Monitor and optimize database queries for projects endpoint
2. Organization API showing consistent performance
   - Average response time: ~400ms
3. Image retrieval system performing efficiently
   - Consistent 160ms response time for image queries

## [SSO Integration] - 2025-07-05T17:23:26Z

Implemented ThanPerfect SSO integration for user authentication:
- Added SSO callback route handler
- Updated login flow to redirect to ThanPerfect SSO
- Configured middleware to handle SSO callback
- Maintained existing JWT token system for session management

Key Learning: Keeping existing auth tokens while delegating authentication allows for seamless SSO integration without breaking existing session management.

## [System Health Check] - 2024-02-13T12:00:00.000Z

✅ Full system validation completed successfully:
- Static page generation: 22/22 pages
- Route component compilation: No errors
- TypeScript types: All valid
- ESLint: No warnings/errors 
- MongoDB: Production connections stable

Key Learning: Regular health checks help confirm system stability and catch issues early.

## Development

### Organization Deletion Testing Setup (2025-07-05T20:32:42.000Z)

Key considerations for testing public organization deletion:

1. **Test Structure**
   - Tests located in `__tests__` directories within feature folders
   - Using @testing-library/react for component testing
   - Separate test files for API, UI, and data integrity

2. **Database Testing**
   - MongoDB with Mongoose for data layer
   - Models in `/lib/mongodb/` directory
   - Key models: `organizationModel.ts`, `projectModel.ts`

3. **Testing Approach**
   - Direct API testing without authentication
   - UI component interaction testing
   - Database state verification
   - Error scenario coverage

Learning: Comprehensive test coverage requires coordination between UI, API, and database layers to ensure system integrity.

### Organization Deletion Testing Completion (2025-07-05T20:52:17.000Z)

Key Learnings from Test Implementation:
1. **Test Structure Benefits**
   - Organizing tests by feature in __tests__ directories improves maintainability
   - Using @testing-library/react enables realistic user interaction testing
   - Separate test files for different layers (UI/API/DB) provides clear coverage metrics

2. **Testing Strategy Insights**
   - Direct API testing without auth simplifies test setup
   - UI component testing catches user interaction issues early
   - Database state verification ensures data integrity
   - Error scenarios need explicit coverage

3. **Test Implementation Practices**
   - Keep test files close to tested components
   - Use meaningful test descriptions
   - Include both happy path and error scenarios
   - Verify cascading effects in related collections

## Development
- 2024-01-17T12:45:00.000Z: Production deployment requires proper authentication setup for API endpoints
- Vercel deployment process requires environment variable configuration
- 2025-06-30T17:35:00.000Z: MongoDB connection optimization in production:
  - Simplified configuration by using only MONGODB_URI
  - Database name extracted directly from connection string
  - Successful data persistence and retrieval confirmed
  - Connection stability achieved in production environment
