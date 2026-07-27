import React from 'react';

export interface DragAndDrop {
  /** Whether a drag is currently over the field (drives the highlight). */
  active: boolean;
  onDragEnter: React.DragEventHandler;
  onDragOver: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}

interface DragConfig {
  disabled: boolean;
  onFiles: (files: readonly File[]) => void;
  setActive: (active: boolean) => void;
}

// Each handler is built by its own factory: a logical line inside a closure
// still counts toward the enclosing function, so one builder holding all three
// would blow the per-function budget.

// `preventDefault` on drag-over is what makes the element a drop target at all;
// without it the browser navigates away to the dropped file. A disabled field
// still cancels the default so the page is not replaced, but never highlights.
function makeDragOver(config: DragConfig): React.DragEventHandler {
  return (event): void => {
    event.preventDefault();
    config.setActive(!config.disabled);
  };
}

// Dragging across a child fires `dragleave` on the way in; ignoring leaves whose
// destination is still inside the field stops the highlight flickering.
function makeDragLeave(config: DragConfig): React.DragEventHandler {
  return (event): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      config.setActive(false);
    }
  };
}

function makeDrop(config: DragConfig): React.DragEventHandler {
  return (event): void => {
    event.preventDefault();
    config.setActive(false);
    // A drag carrying no files — selected text, a link, an image from another
    // tab — still fires `drop`. Publishing that empty list would wipe the
    // consumer's selection, which no native file input ever does.
    const dropped: File[] = Array.from(event.dataTransfer.files);
    if (!config.disabled && dropped.length > 0) {
      config.onFiles(dropped);
    }
  };
}

/**
 * Drag-and-drop is a pointer-only convenience layered over the keyboard-operable
 * native input, never a replacement for it. Dropped files go through the same
 * validation as picked ones, so the drop path cannot bypass the type/size rules
 * the `accept` attribute enforces for the picker.
 */
export function useDragAndDrop(
  disabled: boolean,
  onFiles: (files: readonly File[]) => void
): DragAndDrop {
  const [active, setActive] = React.useState<boolean>(false);
  const config: DragConfig = { disabled, onFiles, setActive };
  const onDragOver: React.DragEventHandler = makeDragOver(config);

  return {
    active,
    onDragEnter: onDragOver,
    onDragOver,
    onDragLeave: makeDragLeave(config),
    onDrop: makeDrop(config),
  };
}
