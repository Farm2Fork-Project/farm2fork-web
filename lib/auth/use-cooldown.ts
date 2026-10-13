"use client";

import { useCallback, useEffect, useState } from "react";

/** Counts down whole seconds after `start()`; used to space out "resend" clicks. */
export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, active: remaining > 0, start };
}
