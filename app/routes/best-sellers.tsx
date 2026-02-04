import { useLoaderData, type MetaFunction } from 'react-router';
import { getPaginationVariables, Pagination } from '@shopify/hydrogen';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ShopifyProductCard } from '~/components/product/ShopifyProductCard';
import type { Route } from './+types/best-sellers';

export const meta: MetaFunction = () => {
    return [{ title: 'Best Sellers | Oppozite Wears' }];
};

export async function loader({ context, request }: Route.LoaderArgs) {
    const { storefront } = context;
    const variables = getPaginationVariables(request, { pageBy: 24 });
    const { products } = await storefront.query(BEST_SELLERS_QUERY, {
        variables: {
            ...variables,
            query: "tag:best-seller OR tag:bestseller"
        },
    });
    return { products };
}

export default function BestSellers() {
    const { products } = useLoaderData<typeof loader>();

    return (
        <>
            <section className="py-16 md:py-24 bg-foreground text-background">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-5xl md:text-7xl uppercase"
                    >
                        Best Sellers
                    </motion.h1>
                    <p className="mt-4 text-background/60 max-w-xl mx-auto">
                        Our most loved pieces. The community favorites that define the Oppozite look.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-20">
                <div className="container">
                    <Pagination connection={products}>
                        {({ nodes, NextLink, isLoading }) => (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
                                >
                                    {nodes.map((product, index) => (
                                        <ShopifyProductCard
                                            key={product.id}
                                            product={{ node: product }}
                                            index={index}
                                        />
                                    ))}
                                </motion.div>

                                {nodes.length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-xl font-medium mb-2">No best sellers found yet.</p>
                                    </div>
                                )}

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
    variants(first: 1) {
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

const BEST_SELLERS_QUERY = `#graphql
  query BestSellers(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, query: $query) {
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
