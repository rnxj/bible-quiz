"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function OneTapLogin() {
  const [attempted, setAttempted] = useState(false);
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    // Only show One Tap if user is not authenticated and we've confirmed the auth state
    if (!session.isPending && !session.data && !attempted) {
      const showOneTap = async () => {
        try {
          await authClient.oneTap({
            callbackURL: "/dashboard", // Redirect to dashboard after successful login
            onPromptNotification: (notification) => {
              console.warn("One Tap prompt was dismissed or skipped", notification);
              setAttempted(true);
            },
            fetchOptions: {
              onSuccess: () => {
                // Use router to navigate without a full reload
                router.push("/dashboard");
                router.refresh();
              },
            },
          });
        } catch (error) {
          console.error("Error with One Tap authentication:", error);
          setAttempted(true);
        }
      };

      showOneTap();
    }
  }, [session, attempted, router]);

  return null;
}
