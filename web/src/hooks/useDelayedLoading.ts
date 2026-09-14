import { useEffect, useState } from "react";

// Route data usually resolves fast enough that showing a loading skeleton
// immediately just reads as a flash of an empty/placeholder box. Waiting a
// beat before showing it means fast loads (the common case) render straight
// to real content, while genuinely slow ones still get a loading state.
export function useDelayedLoading(loading: boolean, delayMs = 350) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [loading, delayMs]);

  return loading && show;
}
