import { AuthOptions, DefaultSession, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      xp: number;
      level: number;
      gender?: string;
      isOnboarded?: boolean;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    id: string;
    xp: number;
    level: number;
    accessToken: string;
    gender?: string;
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    xp: number;
    level: number;
    accessToken: string;
    gender?: string;
    isOnboarded?: boolean;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Login failed");

          if (data && data.access_token) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              xp: data.user.xp,
              level: data.user.level,
              gender: data.user.gender,
              isOnboarded: data.user.isOnboarded,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.isOnboarded = session.user.isOnboarded;
        token.gender = session.user.gender;
        token.name = session.user.name;
        return token;
      }

      if (account && user) {
        if (
          user.accessToken &&
          !account.provider.includes("github") &&
          !account.provider.includes("google")
        ) {
          token.accessToken = user.accessToken;
          token.id = user.id;
          token.xp = user.xp;
          token.level = user.level;
          token.gender = user.gender;
          token.isOnboarded = user.isOnboarded;
        } else {
          try {
            const backendUrl =
              process.env.BACKEND_URL || "http://localhost:5001";

            const res = await fetch(`${backendUrl}/api/auth/social`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name || "Aventurier",
              }),
            });

            const data = await res.json();

            if (data && data.access_token) {
              token.accessToken = data.access_token;
              token.id = data.user.id;
              token.xp = data.user.xp;
              token.level = data.user.level;
              token.gender = data.user.gender;
              token.isOnboarded = data.user.isOnboarded;
            }
          } catch (error) {
            console.error("Erreur sync backend:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.xp = token.xp;
        session.user.level = token.level;
        session.user.gender = token.gender;
        session.user.isOnboarded = token.isOnboarded;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
