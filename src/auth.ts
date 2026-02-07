import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const adminLogin = process.env.ADMIN_LOGIN;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials?.login === adminLogin &&
          credentials?.password === adminPassword
        ) {
          return { id: '1', name: 'Admin', email: adminLogin };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
});
