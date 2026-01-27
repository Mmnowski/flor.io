import { useCallback, useState } from 'react';

/**
 * Simple boolean toggle hook
 * Provides state and callbacks for toggling a boolean value
 *
 * @param initialState - Initial boolean value (default: false)
 * @returns Object with state and control methods
 *
 * @example
 * const { state, toggle, setTrue, setFalse } = useToggle();
 * // state: boolean
 * // toggle(): void - toggles state
 * // setTrue(): void - sets state to true
 * // setFalse(): void - sets state to false
 */
export function useToggle(initialState = false): {
  state: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
} {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return { state, toggle, setTrue, setFalse };
}
