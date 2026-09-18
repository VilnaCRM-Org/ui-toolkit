import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function useContentRenderer(): (content: string | React.ReactNode) => React.ReactNode {
  const { i18n } = useTranslation();
  return function renderContent(content: string | React.ReactNode): React.ReactNode {
    return typeof content === 'string' && i18n.exists(content) ? (
      <Trans i18nKey={content} />
    ) : (
      content
    );
  };
}

export function useKeyTranslator(): (value: string) => string {
  const { t, i18n } = useTranslation();
  return (value: string): string => (i18n.exists(value) ? t(value) : value);
}
