import { useLoaderData, type MetaFunction } from 'react-router';
import { getPaginationVariables, Pagination } from '@shopify/hydrogen';
import type { Route } from './+types/shop';
import { ShopifyProductCard } from '~/components/product/ShopifyProductCard';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const meta: MetaFunction = ({ data }) => {
  return [{ title: `${data?.pageTitle || 'Shop'} | Oppozite Wears` }];
};

export async function loader(args: Route.LoaderArgs) {
  const { request, context } = args;
  const { storefront } = context;
  const searchParams = new URL(request.url).searchParams;
  const handle = searchParams.get('collection');
  const variables = getPaginationVariables(request, { pageBy: 24 });

  if (handle && handle !== 'shop-all') {
    const { collection } = await storefront.query(COLLECTION_QUERY, {
      variables: { ...variables, handle },
    });
    if (!collection) {
      throw new Response('Collection Not Found', { status: 404 });
    }
    return {
      products: collection.products,
      pageTitle: collection.title,
      collectionHandle: handle,
    };
  } else {
    const { products } = await storefront.query(ALL_PRODUCTS_QUERY, {
      variables: { ...variables },
    });
    return {
      products,
      pageTitle: 'SHOP ALL',
      collectionHandle: null,
    };
  }
}

export default function Shop() {
  const { products, pageTitle, collectionHandle } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container">
          <h1 className="font-display text-6xl md:text-8xl text-center">
            {pageTitle}
          </h1>
          {collectionHandle && (
            <p className="text-center mt-4 text-background/60 tracking-widest text-sm uppercase">
              Collection
            </p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container">
          <Pagination connection={products}>
            {({ nodes, NextLink, isLoading }) => (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {nodes.map((node) => (
                    <ShopifyProductCard
                      key={node.id}
                      product={{ node }}
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
        </div>
      </section>
    </>
  );
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
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
    variants(first: 100) {
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
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const COLLECTION_QUERY = `#graphql
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
      title
      products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
