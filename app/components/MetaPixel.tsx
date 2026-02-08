import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Extend Window interface for Facebook Pixel
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

// Meta Pixel ID
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';

/**
 * Load the Facebook Pixel SDK script
 */
function loadFacebookPixelScript(): Promise<void> {
    return new Promise((resolve) => {
        if (document.getElementById('facebook-pixel-script')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = 'facebook-pixel-script';
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}

/**
 * Initialize Facebook Pixel
 */
function initFacebookPixel() {
    if (typeof window === 'undefined') return;

    // Create fbq function if it doesn't exist
    if (!window.fbq) {
        const fbq = function (...args: any[]) {
            if (fbq.callMethod) {
                fbq.callMethod.apply(fbq, args);
            } else {
                fbq.queue.push(args);
            }
        } as any;

        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [] as any[];

        window.fbq = fbq;
        if (!window._fbq) window._fbq = fbq;
    }

    // Initialize with Pixel ID
    if (META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_PIXEL_ID') {
        window.fbq('init', META_PIXEL_ID);

        // Load the actual script
        loadFacebookPixelScript();
    }
}

/**
 * Track a page view
 */
export function trackPageView() {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
}

/**
 * Track when a product is viewed
 */
export function trackViewContent(params: {
    content_ids: string[];
    content_name: string;
    content_type: string;
    value: number;
    currency: string;
}) {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', params);
    }
}

/**
 * Track when an item is added to cart
 */
export function trackAddToCart(params: {
    content_ids: string[];
    content_name: string;
    content_type: string;
    value: number;
    currency: string;
    quantity?: number;
}) {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart', params);
    }
}

/**
 * Track when checkout is initiated
 */
export function trackInitiateCheckout(params: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
}) {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', params);
    }
}

/**
 * Track a purchase
 */
export function trackPurchase(params: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
}) {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', params);
    }
}

/**
 * Track a custom event
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, params);
    }
}

/**
 * Meta Pixel component - initializes pixel and tracks page views
 */
export function MetaPixel() {
    const location = useLocation();

    // Initialize pixel on mount
    useEffect(() => {
        initFacebookPixel();
        // Track initial page view after a short delay to ensure script is loaded
        const timer = setTimeout(() => {
            trackPageView();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Track page views on route changes
    useEffect(() => {
        trackPageView();
    }, [location.pathname]);

    // Add noscript fallback for when JS is disabled
    return META_PIXEL_ID ? (
        <noscript>
            <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
            />
        </noscript>
    ) : null;
}

export default MetaPixel;

