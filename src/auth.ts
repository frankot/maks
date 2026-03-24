import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminLogin = process.env.ADMIN_LOGIN
        const adminPasswordHash = process.env.ADMIN_PASSWORD

        if (!credentials?.login || !credentials?.password || !adminLogin || !adminPasswordHash) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          adminPasswordHash
        )

        if (credentials.login === adminLogin && passwordMatch) {
          return { id: '1', name: 'Admin', email: adminLogin }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
}

export function auth() {
  return getServerSession(authOptions)
}
