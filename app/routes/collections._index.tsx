import { useLoaderData, Link, type MetaFunction } from 'react-router';
import { Image, Pagination, getPaginationVariables } from '@shopify/hydrogen';
import { motion } from 'framer-motion';
import type { Route } from './+types/collections._index';

export const meta: MetaFunction = () => {
  return [{ title: 'Collections | Oppozite Wears' }];
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const { storefront } = context;
  const variables = getPaginationVariables(request, { pageBy: 10 });
  const { collections } = await storefront.query(COLLECTIONS_QUERY, {
    variables,
  });
  return { collections };
}

export default function Collections() {
  const { collections } = useLoaderData<typeof loader>();

  return (
    <>
      <section className=" mt-14">
        <div className="container text-center">
          <h1 className="font-display text-6xl md:text-8xl">
            COLLECTIONS
          </h1>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container">
          <Pagination connection={collections}>
            {({ nodes, NextLink, isLoading }) => (
              <>
                <div className="space-y-8 md:space-y-16">
                  {nodes.map((collection: any, index: number) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8 }}
                    >
                      <Link
                        to={`/shop?collection=${collection.handle}`}
                        className={`group grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                          }`}
                      >
                        <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                          <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                            {collection.image ? (
                              <Image
                                data={collection.image}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image Available
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`${index % 2 === 1 ? "md:order-1 md:text-right" : ""}`}>
                          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                            Collection {String(index + 1).padStart(2, "0")}
                          </span>
                          <h2 className="font-display text-5xl md:text-7xl mt-6 mb-4 group-hover:translate-x-4 transition-transform duration-300">
                            {collection.title}
                          </h2>
                          <p className="text-muted-foreground text-lg line-clamp-3">
                            {collection.description}
                          </p>
                          <span className="inline-block mt-6 text-sm tracking-widest uppercase border-b border-foreground pb-1">
                            Explore Collection
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {collections.pageInfo.hasNextPage && (
                  <div className="flex justify-center mt-12">
                    <NextLink className="px-8 py-3 bg-foreground text-background font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
                      {isLoading ? 'Loading...' : 'Load More'}
                    </NextLink>
                  </div>
                )}
              </>
            )}
          </Pagination>
        </div>
      </section>
    </>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        description
        handle
        image {
          url
          altText
          width
          height
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
` as const;
