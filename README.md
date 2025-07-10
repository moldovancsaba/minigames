![Version](https://img.shields.io/badge/version-6.0.1-blue.svg)

_Last updated: 2025-07-05T22:00:00.000Z_

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

1. Set up MongoDB configuration:
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string (refer to `.env.example` for the format)
   - The database name will be automatically extracted from your connection string

2. Configure Authentication and User Management:
   - Add JWT_SECRET to `.env.local` for token signing
   - Configure EMAIL_SERVICE settings for magic links:
     ```env
     EMAIL_SERVICE_API_KEY=your_api_key
     EMAIL_FROM=noreply@yourdomain.com
     ```
   - Set up initial admin user:
     ```env
     ADMIN_EMAIL=admin@yourdomain.com
     ```

3. User Management and Access Control:
   - Access the user management interface at `/users` (admin only)
   - Default roles:
     - admin: Full system access including user management
     - user: Basic access with restricted permissions
   - Role management:
     - Only admins can modify user roles
     - Users must log in before accessing protected routes
     - Admin rights required for organization creation
   - Authentication State:
     - Navigation updates automatically after login
     - Role-based visibility of features
     - Secure session management with JWT tokens

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### API Response Format

All API endpoints follow a standardized response format:

```typescript
{
  success: boolean;  // Operation status
  data?: T;          // Optional response data
  error?: string;    // Error message if success is false
  timestamp: string;  // ISO 8601 with milliseconds (e.g. 2025-07-05T21:15:00.000Z)
}
```

Example successful response:
```json
{
  "success": true,
  "data": {
    "name": "Project Alpha",
    "slug": "project-alpha",
    "status": "active"
  },
  "timestamp": "2025-07-05T21:15:00.000Z"
}
```

Example error response:
```json
{
  "success": false,
  "error": "Project not found",
  "timestamp": "2025-07-05T21:15:00.000Z"
}
```

## Project Structure

```
/app
  /api             # API route handlers
    /organizations # Organization-related endpoints
    /projects      # Project-related endpoints
  /components     # React components
    /client       # Client-side components
    /server       # Server-side components
  /hooks          # Custom React hooks
  /organization   # Organization-related pages
  /projects       # Project-related pages
  /users          # User management pages

/components
  /client         # Client-side components
    /organizations # Organization-specific components
    /projects     # Project-specific components
  /shared         # Shared UI components

/lib
  /mongodb        # MongoDB models and connections
  /middleware     # Request middleware
  /errors         # Error handling utilities
  /logging        # Logging infrastructure
  database.ts     # Database configuration
  auth.ts         # Authentication utilities

/services
  /api            # API service interfaces
  /client         # Client-side services

/types            # TypeScript type definitions
/middleware       # Application middleware
/schemas          # Validation schemas
/models           # Data models
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Documentation

Refer to these documents for specific aspects of the project:

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design
- [LEARNINGS.md](LEARNINGS.md) - Development insights and decisions
- [ROADMAP.md](ROADMAP.md) - Future development plans
- [TASKLIST.md](TASKLIST.md) - Current development tasks
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Version history and changes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
