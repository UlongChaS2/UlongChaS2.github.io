/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface SeoProps {
  title: string;
  description?: string;
  pathname?: string;
  type?: 'website' | 'article';
  children?: React.ReactNode;
}

function Seo({ title, description, pathname = '/', type = 'website', children }: SeoProps) {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          author
          siteUrl
        }
      }
    }
  `);

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;
  const pageTitle = defaultTitle && title !== defaultTitle ? `${title} | ${defaultTitle}` : title;
  const siteUrl = site.siteMetadata?.siteUrl?.replace(/\/$/, '') || '';
  const canonicalPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  // og:image는 절대 URL이어야 스크래퍼가 읽는다. SVG는 지원되지 않아 PNG를 쓴다.
  const ogImageUrl = `${siteUrl}/images/og-default.png`;

  return (
    <>
      <html lang="ko" />
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content={defaultTitle || title} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={site.siteMetadata?.author || ``} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      {children}
    </>
  );
}

export default Seo;
