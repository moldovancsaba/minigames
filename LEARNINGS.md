## Development

### TypeScript Type Extension Pattern (2025-07-16T17:00:00.000Z)

#### Pattern Overview
Implemented an extensible type pattern for session handling using TypeScript:

```typescript
interface BaseSession {
  user: User;
  expires: Date;
}

interface ExtendedSession extends BaseSession {
  customData: Record<string, unknown>;
  features: string[];
}
```

Key Benefits:
1. **Type Safety**
   - Maintains full type checking for extended fields
   - Prevents accidental field access
   - Ensures proper type inheritance

2. **Flexibility**
   - Allows for dynamic field addition
   - Maintains backward compatibility
   - Supports gradual feature rollout

3. **Development Experience**
   - Clear type hierarchy
   - IDE support for type checking
   - Easy to extend further

Best Practices:
- Always extend from a base interface
- Use specific types instead of 'any'
- Document extension points
- Keep extensions focused and cohesive

## Development

### MongoDB Unique Index and Slug Generation (2024-01-24T12:30:00.000Z)

#### Issue
Organization creation was failing due to MongoDB unique index constraint on slug field with null values.

#### Solution
1. **Slug Generation**
   - Added utility function for URL-friendly slug creation
   - Implemented automatic slug generation from organization names
   - Added uniqueness check with numeric suffixes

2. **API Route Updates**
   - Fixed method calls to use proper static class methods
   - Added proper error handling for duplicate slugs
   - Improved input validation

#### Key Learnings
- MongoDB unique indexes don't allow multiple null values
- Always handle required fields with unique constraints at both schema and API levels
- Implement proper slug generation and validation before database operations
- Use static class methods consistently across the application

### 2024-03-26T16:30:00.000Z - Build Verification Success

Verified TypeScript build with `npm run build`:
- ✓ Compiled successfully
- ✓ Linting and type checking passed
- All previous TypeScript errors resolved
- No new type issues discovered

Key Benefits:
1. **Type Safety**
   - All TypeScript errors resolved
   - Improved code reliability
   - Better development experience

2. **Build Performance**
   - Clean compilation without warnings
   - Efficient static page generation
   - Optimized production build

### 2024-03-26T14:30:00.000Z - Build Verification Failed

Attempted to verify fix with `npm run build` but encountered a syntax error:

**File**: `/components/client/projects/EditProjectButton.tsx`
**Issue**: Syntax error - Expected ',' but got '}' around line 57
**Status**: Failed

**Next Steps**:
1. Review and fix the syntax error in EditProjectButton.tsx
2. Re-run build verification after fix

# Development Learnings

## Security Update Implementation (2025-07-16T16:00:00.000Z)

### Key Findings
1. **Vulnerability Management**
   - Regular security audits are essential
   - Keep dependencies updated to latest secure versions
   - Monitor security advisories for all dependencies
   - Implement automated vulnerability scanning

2. **Input Validation**
   - Implement strict validation for all user inputs
   - Use type-safe validation patterns
   - Sanitize data before processing
   - Log validation failures for monitoring

3. **Security Measures**
   - Layer security controls for defense in depth
   - Implement rate limiting for API endpoints
   - Use proper error handling to prevent information leakage
   - Regular security testing and validation

### Best Practices
1. **Dependency Management**
   - Regular security audits
   - Automated vulnerability scanning
   - Keep dependencies updated
   - Monitor security advisories

2. **Input Protection**
   - Validate all user inputs
   - Sanitize data appropriately
   - Implement rate limiting
   - Log security events

3. **Security Monitoring**
   - Regular security testing
   - Monitor for unusual activity
   - Log security-related events
   - Review security measures regularly

## API Response Standardization (2025-07-16T14:30:00.000Z)

### Design Patterns
- **Type-Safe Response Handling**
  - Use generic type parameter for data structure
  - Consistent error handling patterns
  - Proper TypeScript inference throughout

### Implementation Details
- **Standardized Response Format**
  ```typescript
  type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string; // ISO 8601 with milliseconds
  }
  ```
  - Simplifies client-side handling
  - Enables consistent error reporting
  - Maintains proper type safety

### Key Benefits
1. **Type Safety**
   - Generic response type ensures data consistency
   - Compile-time type checking for responses
   - Prevents runtime type errors

2. **Standardization**
   - Uniform response structure
   - Consistent error handling
   - ISO 8601 timestamp standardization

3. **Developer Experience**
   - Clear API contract
   - Predictable response format
   - Easy integration with TypeScript

### Best Practices
1. **Response Formatting**
   - Always include timestamp in responses
   - Use boolean success flag
   - Keep error messages clear and concise

2. **Error Handling**
   - Return appropriate HTTP status codes
   - Include descriptive error messages
   - Add optional rate limit information

3. **Type Safety**
   - Use generics for data types
   - Maintain strict null checks
   - Validate response structure

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

### CSS/Styling Testing Results (2025-07-16T15:45:00.000Z)
- Build process successfully compiles all CSS/PostCSS files
- PostCSS integration with Tailwind CSS working correctly
- No CSS compilation errors or warnings
- Development server correctly hot-reloads style changes
- All route pages load with proper styling
- Responsive design breakpoints functioning as expected
- No conflicting style definitions found

### PostCSS Version Reference (2025-07-16T15:00:00.000Z)
- Current PostCSS version: 8.4.21
- Location: devDependencies in package.json
- Used for processing CSS in conjunction with Tailwind CSS
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

### API Route Type and Syntax Fixes (2024-01-09T14:30:00.000Z)

Key issues encountered in Next.js 13+ App Router API routes:

1. **Function Body Closure**
   - Issue: Missing closing braces in route handlers
   - Files affected: `/app/api/images/[id]/route.ts`
   - Solution: Ensure all handler functions have proper closure
   - Verify all code blocks are properly closed

2. **Response Nesting**
   - Issue: Extra closing parentheses in response formatting
   - Files affected: `/app/api/organizations/[id]/projects/route.ts`
   - Solution: Match each opening parenthesis with exactly one closing parenthesis
   - Format nested function calls consistently:
   ```typescript
   return NextResponse.json(
     applyCorsHeaders(
       formatApiResponse(
         data,
         errorMessage,
         statusCode,
         rateLimitInfo
       )
     )
   );
   ```

3. **Parameter Punctuation**
   - Issue: Incorrect use of semicolons instead of commas
   - Files affected: `/app/api/projects/[id]/transfer/route.ts`
   - Solution: Use commas between function parameters and object properties
   - Reserve semicolons for statement termination only

4. **Error Handling Structure**
   ```typescript
   try {
     // ... handler logic ...
   } catch (error: any) {
     console.error('Operation failed:', {
       message: error.message,
       stack: error.stack,
       timestamp: new Date().toISOString(),
       operation: 'operation_name'
     });
     return NextResponse.json(
       applyCorsHeaders(
         formatApiResponse(
           null,
           error.message || 'Operation failed',
           500,
           rateLimitInfo
         )
       )
     );
   }
   ```
   - Consistent error logging with timestamps
   - Proper error response structure
   - Type annotation for error catch clause

#### DELETE Route Handler Type Fix (2025-07-05T21:00:00.000Z)
- Issue: DELETE route handler type error in Next.js 15.3.4 for /api/images/[id]
- Fix:
  - Updated type signature from `{ params }: { params: { id: string } }` to `context: { params: { id: string } }`
  - This aligns with Next.js 15.3.4's route handler type requirements
  - Ensures proper type safety for dynamic route parameters
- Key Learning: Route handler context parameters must be properly typed to match Next.js's expected structure
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

### Webpack Cache Issues (2025-07-06T00:37:26Z)

#### Issue
- Webpack cache corruption causing build failure
- Error: `TypeError: Cannot read properties of undefined (reading 'hasStartTime')`
- Location: `.next/cache/webpack/client-development.pack.gz`

#### Solution
1. Clear Next.js cache directory:
   ```bash
   rm -rf .next/cache
   ```
2. Rebuild the project:
   ```bash
   npm run build
   ```

#### Prevention
- Clear cache when switching branches
- Clear cache after major dependency updates
- Keep Node.js and npm versions consistent

### Development Environment Verification (2024-02-13T12:00:00.000Z)

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

### File Structure Cleanup (2025-07-05T22:00:00.000Z)

Reviewed and cleaned up file structure, identifying the following categories of deleted files:

1. **Deprecated Image-Related Files**
   - `/app/api/images/[id]/*` and `/app/api/images/route.ts`
   - `/components/client/builder/ImageUploader.tsx`
   - `/scripts/clearImages.js`
   - `/types/image.ts`
   - Decision: Remove these files as the image functionality has been refactored into a new system
   - Impact: No negative effects as new image handling is in place

2. **Test and Development Files**
   - `/app/api/test-admin/route.ts`
   - `/app/api/test-org/route.ts`
   - `/app/api/test.ts`
   - `/app/test/page.tsx`
   - Decision: Remove these test files as they are no longer needed
   - Impact: No production impact as these were development-only files

3. **Builder Component Files**
   - `/app/builder/__tests__/layout.test.tsx`
   - `/app/builder/layout.tsx`
   - `/app/builder/page.tsx`
   - Decision: Remove as builder functionality has been deprecated
   - Impact: None, as this feature was never released to production

4. **Project Component Files**
   - `/components/client/projects/EditProjectButton.tsx`
   - Decision: Keep functionally but move to new location under components/client/projects/
   - Impact: Required for project editing functionality

5. **Database Files**
   - `/lib/db.ts`
   - `/lib/mongodb.ts`
   - Decision: Replace with new implementations in `/lib/database.ts` and `/lib/mongodb/`
   - Impact: Improved database handling with better organization

Actions Taken:
1. Retained and relocated EditProjectButton.tsx for continued project management
2. Removed all deprecated image-handling components and routes
3. Cleaned up test files that were only used during development
4. Removed unused builder components
5. Updated database implementations with improved structure

Key Learnings:
- Regular file structure cleanup prevents technical debt
- Document decisions and impacts for future reference
- Keep test files organized and remove unused ones
- Maintain clear separation between active and deprecated features

### Organization Deletion Testing Completion (2025-07-05T20:52:17.000Z)

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
