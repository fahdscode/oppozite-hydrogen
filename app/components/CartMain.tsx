import { useOptimisticCart } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { CartLineItem } from '~/components/CartLineItem';
import { CartSummary } from './CartSummary';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({ layout, cart: originalCart }: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `flex flex-col h-full ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  if (!cartHasItems) {
    return <CartEmpty hidden={false} layout={layout} />;
  }

  return (
    <div className={className}>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ul className="space-y-6">
          {(cart?.lines?.nodes ?? []).map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>
      </div>
      <CartSummary cart={cart} layout={layout} />
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout = 'aside',
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const { close } = useAside();

  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-6"
    >
      <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <p className="text-lg font-medium mb-2">Your bag is empty</p>
      <p className="text-sm text-muted-foreground mb-6">
        Add some items to get started
      </p>
      <Link
        to="/collections"
        onClick={close}
        prefetch="viewport"
        className="btn-primary w-full max-w-xs"
      >
        Start Shopping
      </Link>
    </motion.div>
  );
}
