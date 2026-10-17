import { useEffect } from 'react';

const DEFAULT_SITE_NAME = 'Mates Store';
const DEFAULT_DESCRIPTION =
  'Matching outfits and clothing sets for couples, friends, and siblings at Mates Store.';

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');
}

function toAbsoluteUrl(value, siteUrl) {
  if (!value) return `${siteUrl}/favicon.svg`;

  try {
    return new URL(value, `${siteUrl}/`).href;
  } catch {
    return `${siteUrl}/favicon.svg`;
  }
}

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel, href, hreflang) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (hreflang) element.setAttribute('hreflang', hreflang);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  image,
  imageAlt,
  type = 'website',
  robots = 'index, follow',
  siteName = DEFAULT_SITE_NAME,
  structuredData,
  schemaId = 'page',
}) {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const canonicalUrl = toAbsoluteUrl(canonicalPath, siteUrl);
    const imageUrl = toAbsoluteUrl(image, siteUrl);
    const pageTitle = title || siteName;
    const pageDescription = description.trim().slice(0, 160);

    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.title = pageTitle;

    upsertMeta('name', 'description', pageDescription);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
    upsertMeta('name', 'application-name', siteName);

    upsertMeta('property', 'og:locale', 'en_US');
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', pageDescription);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', imageAlt || pageTitle);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', pageDescription);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertLink('canonical', canonicalUrl);
    upsertLink('alternate', canonicalUrl, 'ar');
    upsertLink('alternate', canonicalUrl, 'x-default');

    const selector = `script[data-seo-schema="${schemaId}"]`;
    document.head.querySelector(selector)?.remove();

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoSchema = schemaId;
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      document.head.querySelector(selector)?.remove();
    };
  }, [canonicalPath, description, image, imageAlt, robots, schemaId, siteName, structuredData, title, type]);

  return null;
}

export default Seo;
