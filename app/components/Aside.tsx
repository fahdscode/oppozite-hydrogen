import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
  side = 'right',
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  side?: 'left' | 'right';
}) {
  const { type: activeType, close } = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        { signal: abortController.signal },
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <AnimatePresence>
      {expanded && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground/40 z-50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed top-0 bottom-0 w-full max-w-sm bg-background z-50 flex flex-col shadow-2xl ${side === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border'
              }`}
          >
            <header className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-display text-2xl uppercase">{heading}</h3>
              <button
                className="p-2 hover:bg-muted transition-colors rounded-sm"
                onClick={close}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
