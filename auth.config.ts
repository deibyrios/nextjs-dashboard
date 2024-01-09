import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        // If the user was in the Dashboard page, no need to redirect:
        console.log('user in Dashboard');
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // If the user was not in the Dashboard page, we will redirect the user:
        console.log('user NOT in Dashboard');
        return Response.redirect(new URL('/dashboard', nextUrl)); // redirecting the user to /dashboard after login
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
