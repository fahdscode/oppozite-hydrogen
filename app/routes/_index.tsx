import { Await, useLoaderData, type MetaFunction } from 'react-router';
import { Suspense } from 'react';
import type { Route } from './+types/_index';
import { Hero } from '~/components/home/Hero';
import { Marquee } from '~/components/home/Marquee';
import { FeaturedProducts } from '~/components/home/FeaturedProducts';
import { Lookbook } from '~/components/home/Lookbook';
import { StatementSection } from '~/components/home/StatementSection';
import { VideoManifesto } from '~/components/home/VideoManifesto';

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
  const { collection } = await storefront.query(NEW_DROPS_QUERY, {
    variables: { handle: 'new-drops' },
  });

  return {
    newDrops: collection,
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
      <Hero />
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
      <VideoManifesto />
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
