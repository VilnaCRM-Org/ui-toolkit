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

function readMetaDescription(): string | null {
  return document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
}

function restoreMetaDescription(previous: string | null): void {
  if (previous !== null) {
    upsertMetaDescription(previous);
  } else {
    document.querySelector('meta[name="description"]')?.remove();
  }
}

type MetadataSnapshot = { previousTitle: string; previousDescription: string | null };

// Empty/blank values are intentionally treated as "not provided": blanking
// document.title would fail WCAG 2.4.2 (Page Titled) and an empty meta
// description tag is undesirable. Clear these by omitting the prop, not ''.
function applyDocumentMetadata(pageTitle?: string, metaDescription?: string): MetadataSnapshot {
  const snapshot: MetadataSnapshot = {
    previousTitle: document.title,
    previousDescription: readMetaDescription(),
  };

  if (pageTitle) {
    document.title = pageTitle;
  }

  if (metaDescription) {
    upsertMetaDescription(metaDescription);
  }

  return snapshot;
}

function restoreDocumentMetadata(
  snapshot: MetadataSnapshot,
  pageTitle?: string,
  metaDescription?: string
): void {
  if (pageTitle) {
    document.title = snapshot.previousTitle;
  }

  if (metaDescription) {
    restoreMetaDescription(snapshot.previousDescription);
  }
}

// Treat blank/whitespace-only values as "not provided" so the gate never sets an
// empty document.title (WCAG 2.4.2) or a whitespace-only meta description.
function normalizeMetadataValue(value?: string): string | undefined {
  return value?.trim() || undefined;
}

function useDocumentMetadata(pageTitle?: string, metaDescription?: string): void {
  const title: string | undefined = normalizeMetadataValue(pageTitle);
  const description: string | undefined = normalizeMetadataValue(metaDescription);

  React.useEffect(() => {
    const snapshot: MetadataSnapshot = applyDocumentMetadata(title, description);

    return (): void => restoreDocumentMetadata(snapshot, title, description);
  }, [description, title]);
}

export default function Layout({
  children,
  header = null,
  footer = null,
  pageTitle,
  metaDescription,
}: Readonly<LayoutProps>): React.ReactElement {
  useDocumentMetadata(pageTitle, metaDescription);

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
