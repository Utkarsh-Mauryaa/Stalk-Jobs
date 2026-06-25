import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  console.warn("Missing Google OAuth environment variables. Authentication will not work.")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      console.log("SignIn Callback - Account Scope:", account?.scope);
      if (account) {
        try {
          // Check if account already exists
          const existingAccount = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })

          if (existingAccount) {
            // Update the existing account with new tokens and scopes
            const updateData: {
              access_token?: string | null
              expires_at?: number | null
              scope?: string | null
              refresh_token?: string | null
            } = {
              access_token: account.access_token,
              expires_at: account.expires_at,
              scope: account.scope,
            }
            if (account.refresh_token) {
              updateData.refresh_token = account.refresh_token
            }
            await db.account.update({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: updateData,
            })
            console.log("Successfully updated existing account with new scopes");
          }
        } catch (error) {
          console.error("Failed to update account tokens:", error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.image = (token.picture as string | null) || (token.image as string | null) || null
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.sub = user.id
        token.picture = user.image
      }
      return token
    },
  },
  pages: {
    signIn: "/",
  },
  debug: true,
})
