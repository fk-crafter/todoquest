"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const { isOnboarded, level, xp } = session.user;
      const isNewUser = level <= 1 && xp === 0;

      if (isOnboarded === false && isNewUser && pathname !== "/onboarding") {
        router.push("/onboarding");
      }
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}
