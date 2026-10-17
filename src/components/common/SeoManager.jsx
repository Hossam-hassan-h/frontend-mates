import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo, getSiteUrl } from './Seo.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { useStoreSettings } from '@/features/settings/useStoreSettings.js';
import storeLogo from '@/assets/images/Qassem logo.jpeg';
import { getText } from '@/utils/getText.js';

const PRIVATE_PREFIXES = ['/auth', '/checkout', '/wishlist', '/profile', '/dashboard', '/manager'];
const DEFAULT_DESCRIPTION =
  'Mates Store - Clothing for men, women, and matching outfits for couples.';

export function SeoManager() {
  const { pathname, search } = useLocation();
  const { data: settings } = useStoreSettings();

  const seo = useMemo(() => {
    const siteUrl = getSiteUrl();
    const storeName = getText(settings?.storeName) || 'Mates Store';
    const description = getText(settings?.shortDescription) || DEFAULT_DESCRIPTION;
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const isPrivate = PRIVATE_PREFIXES.some(
      (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    );

    if (isPrivate) {
      return {
        title: `${storeName} | Special Page`,
        description,
        canonicalPath: normalizedPath,
        robots: 'noindex, nofollow, noarchive',
        siteName: storeName,
      };
    }

    if (normalizedPath === ROUTE_PATHS.HOME) {
      const sameAs = [settings?.facebook, settings?.instagram].filter(Boolean);

      return {
        title: `${storeName} | Minimalist Clothing & Outfits`,
        description,
        canonicalPath: '/',
        image: storeLogo,
        imageAlt: `${storeName} Logo`,
        siteName: storeName,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: storeName,
            url: siteUrl,
            inLanguage: 'ar',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/products?keyword={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'GroceryStore',
            name: storeName,
            description,
            url: siteUrl,
            image: new URL(storeLogo, window.location.origin).href,
            telephone: settings?.phone || undefined,
            email: settings?.email || undefined,
            address: getText(settings?.address) || undefined,
            sameAs: sameAs.length > 0 ? sameAs : undefined,
          },
        ],
      };
    }

    if (normalizedPath === ROUTE_PATHS.PRODUCTS) {
      return {
        title: `Products | ${storeName}`,
        description: `Explore ${storeName} clothing collections, matching sets, and latest arrivals.`,
        canonicalPath: ROUTE_PATHS.PRODUCTS,
        image: storeLogo,
        siteName: storeName,
        robots: search ? 'noindex, follow' : 'index, follow',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${storeName} Products`,
          description,
          url: `${siteUrl}${ROUTE_PATHS.PRODUCTS}`,
          inLanguage: 'ar',
        },
      };
    }

    if (/^\/products\/[^/]+$/.test(normalizedPath)) {
      return {
        title: `Product Details | ${storeName}`,
        description,
        canonicalPath: normalizedPath,
        image: storeLogo,
        type: 'product',
        siteName: storeName,
      };
    }

    return {
      title: `Page Not Found | ${storeName}`,
      description,
      canonicalPath: normalizedPath,
      image: storeLogo,
      robots: 'noindex, follow',
      siteName: storeName,
    };
  }, [pathname, search, settings]);

  return <Seo {...seo} schemaId="route" />;
}

export default SeoManager;
