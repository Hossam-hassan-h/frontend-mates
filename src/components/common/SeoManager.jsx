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
        title: `${storeName} | صفحة خاصة`,
        description,
        canonicalPath: normalizedPath,
        robots: 'noindex, nofollow, noarchive',
        siteName: storeName,
      };
    }

    if (normalizedPath === ROUTE_PATHS.HOME) {
      const sameAs = [settings?.facebook, settings?.instagram].filter(Boolean);

      return {
        title: `${storeName} | خضروات وفواكه طازجة`,
        description,
        canonicalPath: '/',
        image: storeLogo,
        imageAlt: `شعار ${storeName}`,
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
        title: `المنتجات الطازجة | ${storeName}`,
        description: `تصفح منتجات ${storeName} من الخضروات والفواكه الطازجة والعروض المتاحة.`,
        canonicalPath: ROUTE_PATHS.PRODUCTS,
        image: storeLogo,
        siteName: storeName,
        robots: search ? 'noindex, follow' : 'index, follow',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `منتجات ${storeName}`,
          description,
          url: `${siteUrl}${ROUTE_PATHS.PRODUCTS}`,
          inLanguage: 'ar',
        },
      };
    }

    if (/^\/products\/[^/]+$/.test(normalizedPath)) {
      return {
        title: `تفاصيل المنتج | ${storeName}`,
        description,
        canonicalPath: normalizedPath,
        image: storeLogo,
        type: 'product',
        siteName: storeName,
      };
    }

    return {
      title: `الصفحة غير موجودة | ${storeName}`,
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
