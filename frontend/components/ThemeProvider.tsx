"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const fetchTheme = async () => {
    if (!session?.accessToken) return null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );
    return res.json();
  };

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchTheme,
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    const root = document.documentElement;

    if (user?.equippedTheme) {
      root.setAttribute("data-theme", user.equippedTheme);
    } else {
      root.removeAttribute("data-theme");
    }
  }, [user?.equippedTheme]);

  return <>{children}</>;
}
