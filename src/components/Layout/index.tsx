import React from 'react';

type LayoutProps = {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  pageTitle?: string;
  metaDescription?: string;
};

function upsertMetaDescription(content: string): void {
  const existing: HTMLMetaElement | null = document.querySelector('meta[name="description"]');

  if (existing) {
    existing.setAttribute('content', content);
    return;
  }

  const meta: HTMLMetaElement = document.createElement('meta');
  meta.setAttribute('name', 'description');
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

export default function Layout({
  children,
  header = null,
  footer = null,
  pageTitle,
  metaDescription,
}: Readonly<LayoutProps>): React.ReactElement {
  React.useEffect(() => {
    const previousTitle: string = document.title;
    const previousDescription: string | null =
      document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;

    // Empty/blank values are intentionally treated as "not provided": blanking
    // document.title would fail WCAG 2.4.2 (Page Titled) and an empty meta
    // description tag is undesirable. Clear these by omitting the prop, not ''.
    if (pageTitle) {
      document.title = pageTitle;
    }

    if (metaDescription) {
      upsertMetaDescription(metaDescription);
    }

    return (): void => {
      if (pageTitle) {
        document.title = previousTitle;
      }

      if (metaDescription) {
        if (previousDescription !== null) {
          upsertMetaDescription(previousDescription);
        } else {
          document.querySelector('meta[name="description"]')?.remove();
        }
      }
    };
  }, [metaDescription, pageTitle]);

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
