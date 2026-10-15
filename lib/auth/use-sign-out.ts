"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "../api/client.ts";
import { forgetBuyerSession } from "./session-hint.ts";
import { FirebaseWebAuthRepository } from "./firebase-web-auth-repository.ts";

/** Ends the session (push token, cookie, Firebase identity) and goes to /login. */
export function useSignOut() {
  const router = useRouter();
  const auth = useMemo(() => new FirebaseWebAuthRepository({ client: new ApiClient() }), []);
  return useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // The server cookie may already be gone; the person still leaves.
    }
    forgetBuyerSession();
    router.replace("/login?signedout=1");
  }, [auth, router]);
}
