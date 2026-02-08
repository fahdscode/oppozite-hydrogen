import { redirect, useLoaderData } from 'react-router';
import type { Route } from './+types/collections.$handle';
import { getPaginationVariables, Analytics, Pagination } from '@shopify/hydrogen';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { ShopifyProductCard } from '@/components/product/ShopifyProductCard';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { Loader2 } from 'lucide-react';

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.collection.title ?? ''} Collection` }];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, params, request }: Route.LoaderArgs) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: { handle, ...paginationVariables },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection });

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="py-16 md:py-24 bg-foreground text-background mt-14">
        <div className="container text-center">
          <h1 className="font-display text-6xl md:text-8xl uppercase">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 text-background/60 max-w-xl mx-auto text-lg leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container">
          <Pagination connection={collection.products}>
            {({ nodes, NextLink, isLoading }) => (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {nodes.map((product: any, index: number) => (
                    <ShopifyProductCard
                      key={product.id}
                      product={{ node: product }}
                      index={index}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <NextLink className="px-8 py-3 bg-foreground text-background font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? 'Loading...' : 'Load More'}
                  </NextLink>
                </div>
              </>
            )}
          </Pagination>
          <Analytics.CollectionView
            data={{
              collection: {
                id: collection.id,
                handle: collection.handle,
              },
            }}
          />
        </div>
      </section>
    </>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    images(first: 5) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          compareAtPrice {
            ...MoneyProductItem
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
           price {
            ...MoneyProductItem
           }
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
