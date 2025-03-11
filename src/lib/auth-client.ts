import { env } from "@/env";
import { oneTapClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      autoSelect: false,
      context: "signin",
      promptOptions: {
        baseDelay: 60000,
        maxAttempts: 2,
      },
    }),
  ],
});
