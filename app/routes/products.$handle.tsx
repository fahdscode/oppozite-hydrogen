import { useState, useEffect } from "react";
import { useLoaderData, type MetaFunction, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { CartForm } from "@shopify/hydrogen";
import { ImageGallery } from "~/components/product/ImageGallery";
import { ShopifyProductCard } from "~/components/product/ShopifyProductCard";
import { getColorValue } from "~/lib/colors";
import { formatShopifyPrice } from "~/lib/shopify";
import type { Route } from "./+types/products.$handle";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.product?.title || 'Product'} | Oppozite Wears` },
    { name: "description", content: data?.product?.description || "Product details" },
  ];
};

export async function loader({ params, context }: Route.LoaderArgs) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Response("Missing handle", { status: 400 });
  }

  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: { handle },
  });

  if (!product) {
    throw new Response("Product Not Found", { status: 404 });
  }

  const { productRecommendations } = await storefront.query(RECOMMENDATIONS_QUERY, {
    variables: { productId: product.id },
  });

  return {
    product,
    relatedProducts: productRecommendations,
  };
}

export default function ProductDetail() {
  const { product, relatedProducts } = useLoaderData<typeof loader>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Initialize selected options
  useEffect(() => {
    if (product?.options) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach((option: any) => {
        if (option?.values?.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  const productImages = product.images?.edges?.map((img: any) => img?.node?.url).filter((url: any): url is string => !!url) || [];

  const getSelectedVariant = () => {
    return product.variants?.edges?.find((variant: any) => {
      return variant?.node?.selectedOptions?.every(
        (opt: any) => selectedOptions[opt.name] === opt.value
      );
    })?.node;
  };

  const selectedVariant = getSelectedVariant();
  const isAvailable = selectedVariant?.availableForSale ?? false;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isSale = selectedVariant && compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(selectedVariant.price.amount);
  const selectedImage = selectedVariant?.image?.url;

  return (
    <div className="pt-8 bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.title}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageGallery
              images={productImages}
              productName={product.title}
              layoutId={`product-image-${product.handle}`}
              selectedImage={selectedImage}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {!isAvailable && (
                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Sold Out
                </span>
              )}
              {isSale && isAvailable && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium uppercase tracking-wider">
                  Sale
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display uppercase tracking-wider mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              {selectedVariant && (
                <>
                  <span className="text-2xl font-medium">
                    {formatShopifyPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
                  </span>
                  {isSale && compareAtPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatShopifyPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Options Selection */}
            {product.options?.map((option: any) => (
              <div key={option.name} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Select {option.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((value: string) => (
                    option.name === "Color" ? (() => {
                      const isSelected = selectedOptions[option.name] === value;
                      const variantColorValue = (() => {
                        try {
                          const variant = product.variants?.edges?.find((v: any) =>
                            v?.node?.selectedOptions?.some((opt: any) => opt.name === "Color" && opt.value === value)
                          );
                          return getColorValue(value, variant?.node?.colorCode?.value);
                        } catch (e) {
                          return getColorValue(value);
                        }
                      })();

                      const backgroundColor = isSelected ? "transparent" : variantColorValue;

                      return (
                        <motion.button
                          key={value}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                          className={`h-8 rounded-full border flex items-center justify-start overflow-hidden relative ${isSelected
                            ? "ring-2 ring-offset-2 ring-foreground border-transparent pl-1"
                            : "border-border hover:border-foreground"
                            }`}
                          layout
                          initial={false}
                          animate={{
                            backgroundColor,
                            width: isSelected ? "auto" : 32,
                            paddingRight: isSelected ? 12 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 1
                          }}
                          title={value}
                        >
                          <motion.div
                            className="w-6 h-6 rounded-full flex-shrink-0 m-1"
                            layout
                            style={{ backgroundColor: variantColorValue }}
                          />
                          <div className="flex overflow-hidden">
                            <AnimatePresence mode="popLayout" initial={false}>
                              {isSelected && (
                                <motion.span
                                  key="text"
                                  initial={{ opacity: 0, width: 0, marginRight: 0 }}
                                  animate={{ opacity: 1, width: "auto", marginRight: 0 }}
                                  exit={{ opacity: 0, width: 0, marginRight: 0 }}
                                  className="text-xs font-medium uppercase whitespace-nowrap"
                                >
                                  {value}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.button>
                      );
                    })() : (
                      <motion.button
                        key={value}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                        className={`min-w-[48px] h-12 px-4 border-2 font-medium transition-all ${selectedOptions[option.name] === value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {value}
                      </motion.button>
                    )
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-sm font-medium uppercase tracking-wider mb-3 block">
                Quantity
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <motion.button
                    onClick={() => {
                      const limit = selectedVariant?.quantityAvailable ?? Infinity;
                      setQuantity(Math.min(limit, quantity + 1));
                    }}
                    disabled={quantity >= (selectedVariant?.quantityAvailable ?? Infinity)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            {selectedVariant && (
              <CartForm
                route="/cart"
                inputs={{
                  lines: [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                    },
                  ],
                }}
                action={CartForm.ACTIONS.LinesAdd}
              >
                {(fetcher: any) => (
                  <>
                    <motion.button
                      disabled={!isAvailable || fetcher.state !== "idle"}
                      className={`w-full py-4 font-medium uppercase tracking-wider transition-all ${!isAvailable
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-foreground text-background hover:bg-foreground/90"
                        }`}
                      whileHover={isAvailable ? { scale: 1.02 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      type="submit"
                    >
                      {fetcher.state !== "idle" ? "Adding..." : (!isAvailable ? "Sold Out" : "Add to Bag")}
                    </motion.button>
                  </>
                )}
              </CartForm>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-16 md:py-24 border-t border-border">
          <div className="container">
            <h2 className="font-display text-4xl md:text-5xl text-center mb-12">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((prod: any, index: number) => (
                <ShopifyProductCard
                  key={prod.id}
                  product={{ node: prod }}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    options {
      name
      values
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
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
          colorCode: metafield(namespace: "custom", key: "color_code") {
            value
          }
        }
      }
    }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

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

const RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
       ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
