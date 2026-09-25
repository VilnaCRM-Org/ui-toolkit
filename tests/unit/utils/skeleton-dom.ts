// Stacked skeleton bars carry no role or label, and Testing Library forbids
// walking the DOM tree, so the bar count is read off the rendered markup.
export function countBars(stack: HTMLElement): number {
  return stack.innerHTML.split('<div').length - 1;
}

export function getById(container: HTMLElement, id: string): HTMLElement {
  // Skeleton primitives are decorative (no role/label); they expose a stable id only.

  const el: HTMLElement | null = container.querySelector<HTMLElement>(`#${id}`);
  if (el === null) {
    throw new Error(`Expected element #${id} to be present in the rendered skeleton`);
  }
  return el;
}
