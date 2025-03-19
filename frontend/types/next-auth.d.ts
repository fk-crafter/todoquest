import NextAuth from "next-auth";

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
    token: string;
  }
}
