import { useCallback, useEffect, useState } from 'react';

const KEY_PREFIX = 'apl-section-collapsed:';

/**
 * Persisted collapse state for a section.
 *
 * Returns [collapsed, toggle, setCollapsed].
 *
 *  - storageKey: unique id per section (e.g. 'super-stars').
 *  - defaultCollapsed: initial value before the user has set a preference.
 */
export default function useCollapsibleState(storageKey, defaultCollapsed = false) {
  const fullKey = storageKey ? `${KEY_PREFIX}${storageKey}` : null;

  const [collapsed, setCollapsed] = useState(() => {
    if (!fullKey) return defaultCollapsed;
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) return defaultCollapsed;
      return raw === 'true';
    } catch {
      return defaultCollapsed;
    }
  });

  useEffect(() => {
    if (!fullKey) return;
    try {
      localStorage.setItem(fullKey, String(collapsed));
    } catch {
      /* storage full or blocked — best-effort only */
    }
  }, [fullKey, collapsed]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  return [collapsed, toggle, setCollapsed];
}
