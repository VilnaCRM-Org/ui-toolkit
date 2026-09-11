import React from 'react';

// The cell node registry. It is a REF and never React state: DOM focus is the
// only internal state this component is allowed to hold (S3), and a re-render on
// every keystroke's focus move would fight the consumer's controlled value.
interface PinCellStore {
  nodes: (HTMLInputElement | null)[];
  /** One cached callback ref per index — a fresh one would detach and re-attach. */
  setters: Map<number, React.RefCallback<HTMLInputElement>>;
}

export interface PinCellRefs {
  /** The stable callback ref for cell `index`. */
  setCell: (index: number) => React.RefCallback<HTMLInputElement>;
  /** The ONLY focus mover in the component; a missing cell is a silent no-op. */
  focusCell: (index: number) => void;
}

function createPinCellStore(): PinCellStore {
  return { nodes: [], setters: new Map<number, React.RefCallback<HTMLInputElement>>() };
}

// Memoised per index, because React detaches and re-attaches a callback ref whose
// identity changed: an inline `node => nodes[i] = node` would null every cell out
// and re-register it on each keystroke, and a focus call landing in that window
// would find nothing.
function cellSetter(store: PinCellStore, index: number): React.RefCallback<HTMLInputElement> {
  const cached: React.RefCallback<HTMLInputElement> | undefined = store.setters.get(index);
  if (cached != null) {
    return cached;
  }
  const { nodes } = store;
  const setter: React.RefCallback<HTMLInputElement> = (node): void => {
    nodes[index] = node;
  };
  store.setters.set(index, setter);
  return setter;
}

// Focus only — the cell's own `onFocus` does the selecting, so programmatic and
// user-initiated focus behave identically. Out-of-range indices cannot happen
// through the resolvers (they clamp), but a stale cell during an unmount can, so
// the call is optional-chained rather than asserted.
function focusPinCell(store: PinCellStore, index: number): void {
  store.nodes[index]?.focus();
}

/**
 * Creates the cell registry once per component instance. The bundle identity is
 * stable, so the two callbacks are stable too and the cells never re-attach.
 */
export default function usePinCellRefs(): PinCellRefs {
  const held: React.RefObject<PinCellStore | null> = React.useRef<PinCellStore | null>(null);
  held.current ??= createPinCellStore();
  const store: PinCellStore = held.current;
  return {
    setCell: React.useCallback(
      (index: number): React.RefCallback<HTMLInputElement> => cellSetter(store, index),
      [store]
    ),
    focusCell: React.useCallback((index: number): void => focusPinCell(store, index), [store]),
  };
}
