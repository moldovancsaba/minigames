import { NextAuthOptions } from 'next-auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { connectToDatabase, getMongoClient } from './mongodb'

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user?: User & {
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

/**
 * Configuration for NextAuth authentication system
 * Includes MongoDB adapter and session management
 */
export const authOptions: NextAuthOptions = {
adapter: MongoDBAdapter(connectToDatabase().then(() => getMongoClient())),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [], // To be configured based on requirements
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}

// Re-export next-auth types for convenience
export * from 'next-auth/jwt'
// Only export what we need
export type { Session, User } from 'next-auth'
export type { JWT } from 'next-auth/jwt'
