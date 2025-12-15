import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      xp: number;
      level: number;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    xp: number;
    level: number;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    xp: number;
    level: number;
    accessToken: string;
  }
}
