# Troubleshooting Guide

Last Updated: 2025-06-30T19:24:03Z

## Common Issues and Solutions

### 1. Chunk Loading Errors
**Error**: `ChunkLoadError: Loading chunk app/[route]/page failed.`

**Solutions**:
1. Check Component Structure:
   ```typescript
   // ❌ Don't use in server components (page.tsx)
   const DynamicComponent = dynamic(() => import('...'), { ssr: false });

   // ✅ Move to client component
   'use client';
   const DynamicComponent = dynamic(() => import('...'), { ssr: false });
   ```

2. Clear Build Cache:
   ```bash
   rm -rf .next
   npm run build
   ```

3. Verify Import Structure:
   ```typescript
   // ✅ Server Component (page.tsx)
   import ClientComponent from '@/components/client/Component';

   // ✅ Client Component
   'use client';
   import { useState } from 'react';
   ```

### 2. Type Errors in Route Handlers
**Error**: Invalid route handler export types

**Solutions**:
1. Use Correct Parameter Types:
   ```typescript
   // ✅ Correct typing for route handlers
   export async function GET(
     request: NextRequest,
     context: { params: { id: string } }
   ) {
     const { id } = context.params;
     // ...
   }
   ```

2. Extract Dynamic Parameters:
   ```typescript
   // ✅ Extract from URL pathname
   const id = request.nextUrl.pathname.split('/').pop();
   ```

### 3. Client Component Errors
**Error**: Cannot use client-side features in server component

**Solutions**:
1. Move Client Logic:
   ```typescript
   // ✅ Create separate client component
   'use client';
   export function ClientComponent() {
     const [state, setState] = useState();
     // Client-side logic here
   }

   // ✅ Use in server component
   export default function Page() {
     return <ClientComponent />;
   }
   ```

2. Use Error Boundaries:
   ```typescript
   // ✅ Wrap client components
   <ErrorBoundary>
     <ClientComponent />
   </ErrorBoundary>
   ```

### 4. Build Process Issues

1. **Clear Cache and Dependencies**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check TypeScript Configuration**:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. **Verify Next.js Configuration**:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     // Add other config as needed
   };
   ```

## Best Practices for Error Prevention

1. **Component Organization**:
   - Keep client components in `/components/client`
   - Use server components for static content
   - Implement proper error boundaries

2. **Code Splitting**:
   - Use dynamic imports in client components
   - Implement loading states
   - Handle errors gracefully

3. **Type Safety**:
   - Use TypeScript consistently
   - Define proper interfaces
   - Validate API responses

4. **Error Handling**:
   - Implement error boundaries
   - Use consistent error formats
   - Log errors with context

## Getting Help

1. Check LEARNINGS.md for similar issues
2. Review ARCHITECTURE.md for proper patterns
3. Clear cache and rebuild
4. Check component organization
5. Verify import structure
