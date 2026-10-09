import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Clipboard copy with a self-resetting "copied" flag.
 *
 * Every tool used to redeclare this state + timeout pair; this is the single copy.
 */
export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = useCallback(async (text?: string | null) => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Clipboard write failed:', error);
      return false;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), resetMs);
    return true;
  }, [resetMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { copied, copy };
}
