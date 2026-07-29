/**
 * A ref whose value lives for exactly one interaction: it stays readable for
 * the remainder of the event task that set it, and is gone by the next one.
 *
 * Three of the card's mutable handles need that lifetime (Amendment A2): the
 * open intent (§4.2), the §4.6 rescue suppression, and the one-close-request
 * gate (§4.5). Each is written by the handler that starts a gesture and read
 * either by a SECOND path inside that same gesture — the browser dispatches a
 * click's or a Tab's focus events after the listener that handled it — or by
 * the layout effect of the commit a synchronous consumer makes in between. A
 * plain ref covers the write side only: a consumer that DECLINES the request
 * the value was recorded for never causes the commit that would consume it,
 * and the stale value then steers the next, unrelated interaction.
 *
 * The self-clear is queued as a TASK (a zero timeout) rather than as a
 * microtask on purpose: the HTML "clean up after running script" step performs
 * a microtask checkpoint after EVERY event listener, so a microtask clear would
 * already have run before the same gesture's focus events — and before the
 * microtask in which a concurrent-root React flushes the consumer's re-render.
 * A task-queued clear can run before neither, because both happen inside the
 * task that queued it.
 */
export interface TaskScopedRef<T> {
  /** The recorded value, or null once the task that recorded it has ended. */
  current: T | null;
  /** Records `value` for the remainder of the current task. */
  set: (value: T) => void;
  /** Drops the value now — an open request cancels a pending close gate. */
  clear: () => void;
}

/**
 * Creates one cell. The clear is queued on every `set` rather than once per
 * task: a redundant timer only re-clears an already empty cell, whereas an
 * "already scheduled" guard would add a branch no interaction can reach.
 */
export function createTaskScopedRef<T>(): TaskScopedRef<T> {
  const cell: TaskScopedRef<T> = {
    current: null,
    set: (value: T): void => {
      cell.current = value;
      setTimeout(cell.clear, 0);
    },
    clear: (): void => {
      cell.current = null;
    },
  };
  return cell;
}
