"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClient } from "../api/client.ts";
import { AccountRepository } from "../account/account-repository.ts";
import {
  FirebaseWebAuthRepository,
  type FirebaseWebAuthResult,
} from "./firebase-web-auth-repository.ts";
import { beginFirebaseOnboarding } from "./firebase-onboarding-flow.ts";
import { resolvePostLoginPath } from "./role-routes.ts";

/**
 * The one sign-in flow for every role: email, Google and the Google redirect
 * return all end in `afterResult`, which sends the person to their own portal
 * (or the `?next=` they came for), to verify their email, or on to finish
 * their profile.
 */
export function useAuthFlow({ resumeRedirect = false, onError }: { resumeRedirect?: boolean; onError?: (error: unknown) => void } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const auth = useMemo(() => new FirebaseWebAuthRepository({ client: new ApiClient() }), []);
  const account = useMemo(() => new AccountRepository({ client: new ApiClient() }), []);

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  const afterResult = useCallback(
    (result: FirebaseWebAuthResult) => {
      if (result.kind === "session") {
        router.replace(resolvePostLoginPath(result.user.role, next));
        return;
      }
      if (result.kind === "verification_required") {
        router.push(`/verify-email${nextQuery}`);
        return;
      }
      beginFirebaseOnboarding(result.email);
      router.push(`/signup?continue=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    },
    [next, nextQuery, router],
  );

  useEffect(() => {
    if (!resumeRedirect) return;
    let active = true;
    auth
      .resumeGoogleRedirect()
      .then((result) => {
        if (active && result) afterResult(result);
      })
      .catch((error) => {
        if (active) onError?.(error);
      });
    return () => {
      active = false;
    };
    // onError is intentionally not a dependency: callers pass an inline handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, afterResult, resumeRedirect]);

  return { auth, account, afterResult, next, nextQuery, router };
}
