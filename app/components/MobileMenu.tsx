import { useState } from 'react';
import { NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User } from 'lucide-react';
import { useAside } from '~/components/Aside';

export interface MenuItem {
    id: string;
    title: string;
    url?: string;
    items?: MenuItem[];
}

interface MobileMenuProps {
    menu: { items: MenuItem[] };
    primaryDomainUrl: string;
    publicStoreDomain: string;
    isLoggedIn?: Promise<boolean>;
}

export function MobileMenu({
    menu,
    primaryDomainUrl,
    publicStoreDomain,
}: MobileMenuProps) {
    const { close } = useAside();

    return (
        <div className="flex flex-col h-full">
            <nav className="flex-1 p-8 overflow-y-auto">
                {(menu?.items || []).map((item, index) => (
                    <MobileMenuItem
                        key={item.id}
                        item={item}
                        index={index}
                        onClose={close}
                        primaryDomainUrl={primaryDomainUrl}
                        publicStoreDomain={publicStoreDomain}
                    />
                ))}
            </nav>
            <div className="p-8 border-t border-border flex flex-col gap-3">
                <NavLink
                    to="/account/login"
                    onClick={close}
                    className="w-full btn-primary text-center flex items-center justify-center gap-2"
                >
                    Sign In
                </NavLink>
                <NavLink
                    to="/account"
                    onClick={close}
                    className="w-full btn-outline text-center flex items-center justify-center gap-2 text-black"
                >
                    My Orders
                </NavLink>
            </div>
        </div>
    );
}

function MobileMenuItem({
    item,
    index,
    onClose,
    level = 0,
    primaryDomainUrl,
    publicStoreDomain,
}: {
    item: MenuItem;
    index: number;
    onClose: () => void;
    level?: number;
    primaryDomainUrl: string;
    publicStoreDomain: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.items && item.items.length > 0;

    // Reduce size for deeper levels
    const textSizeClass =
        level === 0 ? 'text-4xl' : level === 1 ? 'text-2xl' : 'text-lg';
    const paddingLeft = level * 20;

    // URL normalization logic
    const url =
        item.url &&
            (item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(primaryDomainUrl))
            ? new URL(item.url).pathname
            : item.url;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            style={{ paddingLeft: `${paddingLeft}px` }}
        >
            {hasChildren ? (
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center justify-between w-full py-4 font-display ${textSizeClass} text-black tracking-wide hover:translate-x-2 transition-transform text-left bg-transparent border-none cursor-pointer`}
                    >
                        <span>{item.title}</span>
                        <ChevronDown
                            className={`w-6 h-6 text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                {item.items!.map((subItem, subIndex) => (
                                    <MobileMenuItem
                                        key={subItem.id}
                                        item={subItem}
                                        index={subIndex}
                                        onClose={onClose}
                                        level={level + 1}
                                        primaryDomainUrl={primaryDomainUrl}
                                        publicStoreDomain={publicStoreDomain}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <NavLink
                    to={url || '#'}
                    onClick={onClose}
                    end
                    prefetch="intent"
                    className={`block py-4 font-display ${textSizeClass} text-black tracking-wide hover:translate-x-2 transition-transform decoration-0`}
                >
                    {item.title}
                </NavLink>
            )}
        </motion.div>
    );
}
