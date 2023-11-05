import { withAuth } from 'next-auth/middleware';

export default withAuth(function middleware(req) {}, {
  callbacks: {
    authorized({ token }) {
      if (token?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && token?.name === 'mbaharip') {
        return true;
      } else {
        return false;
      }
    },
  },
  pages: {
    signIn: '/admin',
  },
});

export const config = { matcher: ['/admin/:path*'] };
