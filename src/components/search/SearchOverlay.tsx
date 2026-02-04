import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { Money } from "@shopify/hydrogen";
import { SearchFormPredictive } from "~/components/SearchFormPredictive";
import { SearchResultsPredictive } from "~/components/SearchResultsPredictive";
import { urlWithTrackingParams } from "~/lib/search";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchResultsRef = useRef<((event: ChangeEvent<HTMLInputElement>) => void) | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleQuickSearch = useCallback((value: string) => {
    setQuery(value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (fetchResultsRef.current) {
      fetchResultsRef.current({ target: { value } } as ChangeEvent<HTMLInputElement>);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[60]"
            onClick={handleClose}
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[70] bg-background border-b border-border"
          >
            <div className="container mx-auto px-4">
              {/* Search Input */}
              <SearchFormPredictive>
                {({ fetchResults, inputRef: predictiveInputRef, goToSearch }) => {
                  fetchResultsRef.current = fetchResults;
                  return (
                    <div className="flex items-center gap-4 h-20">
                      <Search className="w-6 h-6 text-muted-foreground" />
                      <input
                        ref={(node) => {
                          inputRef.current = node;
                          predictiveInputRef.current = node;
                        }}
                        type="search"
                        name="q"
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          fetchResults(event);
                        }}
                        onFocus={fetchResults}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            goToSearch();
                          }
                        }}
                        placeholder="Search products..."
                        className="flex-1 bg-transparent text-xl md:text-2xl font-light outline-none placeholder:text-muted-foreground"
                        maxLength={100}
                      />
                      <motion.button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-6 h-6" />
                      </motion.button>
                    </div>
                  );
                }}
              </SearchFormPredictive>
            </div>

            {/* Search Results */}
            <SearchResultsPredictive>
              {({ items, term, state }) => {
                const products = items?.products ?? [];
                const hasQuery = query.trim() !== "";
                const displayTerm = term.current || query;
                const showResults = hasQuery || products.length > 0 || state === "loading";

                return (
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="container mx-auto px-4 py-6 max-h-[60vh] overflow-y-auto">
                          {state === "loading" && hasQuery ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : products.length > 0 ? (
                            <>
                              <p className="text-sm text-muted-foreground mb-4">
                                {products.length} result{products.length !== 1 ? "s" : ""} for "{displayTerm}"
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {products.map((product, index) => {
                                  const image = product?.selectedOrFirstAvailableVariant?.image ?? null;
                                  const price = product?.selectedOrFirstAvailableVariant?.price ?? null;
                                  const productUrl = urlWithTrackingParams({
                                    baseUrl: `/products/${product.handle}`,
                                    trackingParams: product.trackingParameters,
                                    term: displayTerm || "",
                                  });

                                  return (
                                    <motion.div
                                      key={product.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <Link
                                        to={productUrl}
                                        onClick={handleClose}
                                        className="group block"
                                      >
                                        <div className="aspect-[3/4] bg-secondary overflow-hidden mb-3">
                                          {image?.url ? (
                                            <motion.img
                                              src={image.url}
                                              alt={image.altText ?? product.title}
                                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                              loading="lazy"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                              No Image
                                            </div>
                                          )}
                                        </div>
                                        <h3 className="text-sm font-medium group-hover:underline">
                                          {product.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {price ? <Money data={price} /> : null}
                                        </p>
                                      </Link>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </>
                          ) : hasQuery ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12"
                            >
                              <p className="text-lg text-muted-foreground mb-2">
                                No results found for "{displayTerm}"
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Try searching for something else
                              </p>
                            </motion.div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              }}
            </SearchResultsPredictive>

            {/* Quick Links when empty */}
            {query.trim() === "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-border"
              >
                <div className="container mx-auto px-4 py-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Hoodie", "Set", "Jacket", "Denim", "Pullover"].map((term) => (
                      <motion.button
                        key={term}
                        onClick={() => handleQuickSearch(term)}
                        className="px-4 py-2 border border-border text-sm hover:bg-foreground hover:text-background transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
