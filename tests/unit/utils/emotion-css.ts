export function emotionCssFor(element: HTMLElement): string {
  const emotionClass: string | undefined = Array.from(element.classList).find(
    (className: string): boolean => className.startsWith('css-')
  );
  if (!emotionClass) {
    return '';
  }
  let css: string = '';

  Array.from(document.querySelectorAll('style')).forEach((styleEl: Element): void => {
    const sheet: CSSStyleSheet | null = (styleEl as HTMLStyleElement).sheet;
    if (!sheet) {
      return;
    }
    Array.from(sheet.cssRules).forEach((rule: CSSRule): void => {
      if (rule.cssText.includes(emotionClass)) {
        css += rule.cssText;
      }
    });
  });
  return css;
}
