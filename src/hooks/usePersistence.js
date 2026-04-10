/**
 * usePersistence — Loads save data on mount.
 */

import { useEffect, useState } from 'react';
import { Store } from '../agents/store.js';

/**
 * @returns {{ loaded: boolean, state: Object }}
 */
export function usePersistence() {
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState(null);

  useEffect(() => {
    Store.init();
    setState(Store.getState());
    setLoaded(true);

    return Store.subscribe((s) => setState({ ...s }));
  }, []);

  return { loaded, state };
}
