"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiClient } from "../api/client.ts";
import type { ApiProfile } from "../api/contracts.ts";
import { AccountRepository } from "./account-repository.ts";

export type ProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: ApiProfile }
  | { status: "error"; message: string };

/** Loads GET /auth/me/profile once and lets callers replace it after an edit. */
export function useProfile() {
  const repository = useMemo(() => new AccountRepository({ client: new ApiClient() }), []);
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    repository
      .getProfile()
      .then((profile) => {
        if (active) setState({ status: "ready", profile });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: "error", message: error instanceof Error ? error.message : "" });
      });
    return () => {
      active = false;
    };
  }, [attempt, repository]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);
  const replace = useCallback((profile: ApiProfile) => setState({ status: "ready", profile }), []);

  return { repository, state, reload, replace };
}
