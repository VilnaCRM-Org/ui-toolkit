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
    if (pageTitle) {
      document.title = pageTitle;
    }

    if (metaDescription) {
      upsertMetaDescription(metaDescription);
    }
  }, [metaDescription, pageTitle]);

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
