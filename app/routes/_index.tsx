import { Await, useLoaderData, type MetaFunction } from 'react-router';
import { Suspense } from 'react';
import type { Route } from './+types/_index';
import { Hero } from '~/components/home/Hero';
import { Marquee } from '~/components/home/Marquee';
import { FeaturedProducts } from '~/components/home/FeaturedProducts';
import { Lookbook } from '~/components/home/Lookbook';
import { StatementSection } from '~/components/home/StatementSection';
import { VideoManifesto } from '~/components/home/VideoManifesto';
import { OfferPopup } from '~/components/home/OfferPopup';

export const meta: MetaFunction = () => {
  return [{ title: 'Oppozite Wears | Premium Streetwear' }];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

async function loadCriticalData({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  const [
    { collection },
    { metaobjects: heroMeta },
    { metaobjects: popupMeta },
    { metaobjects: manifestoMeta },
  ] = await Promise.all([
    storefront.query(NEW_DROPS_QUERY, { variables: { handle: 'new-drops' } }),
    storefront.query(HERO_CONTENT_QUERY),
    storefront.query(POPUP_CONTENT_QUERY),
    storefront.query(VIDEO_MANIFESTO_QUERY),
  ]);

  return {
    newDrops: collection,
    heroContent: heroMeta?.nodes?.[0] ?? null,
    popupContent: popupMeta?.nodes?.[0] ?? null,
    manifestoContent: manifestoMeta?.nodes?.[0] ?? null,
  };
}

function loadDeferredData({ context }: Route.LoaderArgs) {
  const { storefront } = context;
  const publicCollections = storefront.query(COLLECTIONS_QUERY, {
    variables: { first: 5 },
  });

  return {
    publicCollections,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const newDropsProducts = data.newDrops?.products?.edges?.map((edge: any) => edge.node) || [];

  return (
    <div className="home-page">
      <OfferPopup content={data.popupContent} />
      <Hero content={data.heroContent} />
      <Marquee />
      <FeaturedProducts products={newDropsProducts} />
      <Suspense fallback={<div className="py-20 text-center">Loading Lookbook...</div>}>
        <Await resolve={data.publicCollections}>
          {(response) => (
            <Lookbook collections={response?.collections?.edges || []} />
          )}
        </Await>
      </Suspense>
      <StatementSection />
      <VideoManifesto content={data.manifestoContent} />
    </div>
  );
}

const NEW_DROPS_QUERY = `#graphql
  query NewDrops($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: 8) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            options {
              name
              values
            }
            variants(first: 10) {
               edges {
                 node {
                   id
                   title
                   availableForSale
                   compareAtPrice {
                     amount
                     currencyCode
                   }
                   image {
                     url
                   }
                   selectedOptions {
                     name
                     value
                   }
                 }
               }
            }
          }
        }
      }
    }
  }
` as const;

const HERO_CONTENT_QUERY = `#graphql
  query HeroContent {
    metaobjects(type: "hero_content", first: 1) {
      nodes {
        overline:         field(key: "overline")   { value }
        tagline:          field(key: "tagline")    { value }
        subtitle:         field(key: "subtitle")   { value }
        cta_text:         field(key: "cta_text")   { value }
        cta_link:         field(key: "cta_link")   { value }
        background_image: field(key: "background_image") {
          reference {
            ... on MediaImage {
              image { url altText }
            }
          }
        }
        background_video: field(key: "background_video") {
          reference {
            ... on Video {
              sources { url mimeType }
            }
            ... on GenericFile {
              url
            }
          }
        }
      }
    }
  }
` as const;

const POPUP_CONTENT_QUERY = `#graphql
  query PopupContent {
    metaobjects(type: "popup_content", first: 1) {
      nodes {
        label:       field(key: "label")       { value }
        offer_text:  field(key: "offer_text")  { value }
        description: field(key: "description") { value }
        cta_text:    field(key: "cta_text")    { value }
        cta_link:    field(key: "cta_link")    { value }
        enabled:     field(key: "enabled")     { value }
        delay_ms:    field(key: "delay_ms")    { value }
        image: field(key: "image") {
          reference {
            ... on MediaImage {
              image { url altText }
            }
          }
        }
        video: field(key: "video") {
          reference {
            ... on Video {
              sources { url mimeType }
            }
            ... on GenericFile {
              url
            }
          }
        }
      }
    }
  }
` as const;

const VIDEO_MANIFESTO_QUERY = `#graphql
  query VideoManifesto {
    metaobjects(type: "video_manifesto", first: 1) {
      nodes {
        overline:  field(key: "overline")  { value }
        heading:   field(key: "heading")   { value }
        body_text: field(key: "body_text") { value }
        cta_text:  field(key: "cta_text")  { value }
        cta_link:  field(key: "cta_link")  { value }
        video: field(key: "video") {
          reference {
            ... on Video {
              sources { url mimeType }
            }
            ... on GenericFile {
              url
            }
          }
        }
        poster: field(key: "poster") {
          reference {
            ... on MediaImage {
              image { url altText }
            }
          }
        }
      }
    }
  }
` as const;

const COLLECTIONS_QUERY = `#graphql
  query Collections($country: CountryCode, $language: LanguageCode, $first: Int)
    @inContext(country: $country, language: $language) {
    collections(first: $first) {
      edges {
        node {
           id
           title
           handle
           image {
             url
             altText
           }
           products(first: 1) {
             edges {
               node {
                 images(first: 1) {
                   edges {
                     node {
                       url
                       altText
                     }
                   }
                 }
               }
             }
           }
        }
      }
    }
  }
` as const;
