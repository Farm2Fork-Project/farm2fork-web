"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiClient } from "../api/client.ts";
import { ApiError, type ApiAuthUser, type UserRole } from "../api/contracts.ts";
import { loginPathFor, portalPathForRole } from "./role-routes.ts";
import { webSession } from "./web-session.ts";

export type PortalSession =
  | { status: "loading" }
  | { status: "ready"; user: ApiAuthUser }
  | { status: "error"; message: string; retry: () => void };

/**
 * Gate for a signed-in area. Signed out: go to /login and come back here
 * afterwards. Signed in as another role: go to that role's own portal.
 * `expected` null means any signed-in role may stay (the account pages).
 */
export function usePortalSession(expected: UserRole | null): PortalSession {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<PortalSession>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    new ApiClient()
      .request<ApiAuthUser>("/auth/me")
      .then((user) => {
        if (!active) return;
        if (expected && user.role !== expected) {
          router.replace(portalPathForRole(user.role));
          return;
        }
        webSession.save({ user });
        setState({ status: "ready", user });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          webSession.clear();
          router.replace(loginPathFor(pathname));
          return;
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "",
          retry,
        });
      });
    return () => {
      active = false;
    };
  }, [attempt, expected, pathname, retry, router]);

  return state;
}
