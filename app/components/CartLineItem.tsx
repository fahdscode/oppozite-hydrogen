import type { CartLineUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import type { CartLayout } from '~/components/CartMain';
import { CartForm, Image, type OptimisticCartLine, Money } from '@shopify/hydrogen';
import { useVariantUrl } from '~/lib/variants';
import { Link } from 'react-router';
// import {ProductPrice} from './ProductPrice'; 
import { useAside } from './Aside';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import { motion } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const { id, merchandise } = line;
  const { product, title, image, selectedOptions } = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const { close } = useAside();

  return (
    <motion.li
      key={id}
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4"
    >
      {/* Image */}
      <div className="w-24 h-32 bg-muted overflow-hidden flex-shrink-0 relative border border-border/10">
        {image ? (
          <Image
            alt={title}
            aspectRatio="3/4"
            data={image}
            loading="lazy"
            width={100}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={() => {
                if (layout === 'aside') {
                  close();
                }
              }}
              className="font-medium text-sm hover:underline line-clamp-2"
            >
              {product.title}
            </Link>
            <div className="text-xs text-muted-foreground">
              {selectedOptions.map((option) => option.value).join(' / ')}
            </div>
          </div>
          <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity */}
          <CartLineQuantity line={line} />

          {/* Price */}
          <div className="font-medium text-sm">
            <Money data={line.cost.totalAmount} />
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({ line }: { line: CartLine }) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const { id: lineId, quantity, isOptimistic } = line;
  const maxQuantity = 2; // Max items per variant
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number(Math.min(maxQuantity, quantity + 1).toFixed(0));
  const isAtMax = quantity >= maxQuantity;

  return (
    <div className="flex items-center border border-border h-8">
      <CartLineUpdateButton lines={[{ id: lineId, quantity: prevQuantity }]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Minus className="w-3 h-3" />
        </button>
      </CartLineUpdateButton>

      <span className="w-8 text-center text-sm font-medium">{quantity}</span>

      <CartLineUpdateButton lines={[{ id: lineId, quantity: nextQuantity }]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic || isAtMax}
          className={`w-8 h-full flex items-center justify-center transition-colors ${isAtMax ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'} disabled:opacity-50 disabled:hover:bg-transparent`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds }}
    >
      <button
        disabled={disabled}
        type="submit"
        className="p-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-sm"
        aria-label="Remove"
      >
        <X className="w-4 h-4" />
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{ lines }}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
