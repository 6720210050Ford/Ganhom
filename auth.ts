import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Line from 'next-auth/providers/line';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '@/lib/users';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [
          Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
          }),
        ]
      : []),
    ...(process.env.AUTH_LINE_ID && process.env.AUTH_LINE_SECRET
      ? [
          Line({
            clientId: process.env.AUTH_LINE_ID,
            clientSecret: process.env.AUTH_LINE_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        try {
          const user = await findUserByEmail(email);
          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: email === 'admin@tsu.ac.th' ? 'Admin Worrapon' : user.email.split('@')[0],
          };
        } catch (err) {
          console.error('Auth authorization error:', err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Auto-link OAuth users (Facebook / LINE) to local database
      if (account?.provider === 'facebook' || account?.provider === 'line') {
        const email = user.email?.trim().toLowerCase();
        if (email) {
          try {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (!existing) {
              const randomPass = Math.random().toString(36).slice(-10) + '!Aa1';
              await createUser(email, randomPass);
            }
          } catch (e) {
            console.error('OAuth auto-user registration error:', e);
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
