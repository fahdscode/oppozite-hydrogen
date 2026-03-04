import { useState, useEffect } from 'react';

export function OfferPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup after a short delay so it doesn't immediately block rendering
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative w-full max-w-2xl bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 scale-100">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-10 text-gray-500 hover:text-black transition-colors"
                    aria-label="Close popup"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                    <img
                        src="/images/offer-popup.png"
                        alt="Buy 2 Get 1 Free Promotional Offer"
                        className="w-full h-full object-cover grayscale contrast-125"
                    />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col justify-center items-center text-center bg-white text-black">
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">Limited Time</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2">Buy 2<br />Get 1 Free</h2>
                    <p className="text-sm md:text-base text-gray-500 mb-8 mt-4 leading-relaxed max-w-[250px]">
                        Elevate your streetwear collection. Add any 3 items to your cart, and the lowest priced item is on us.
                    </p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-black text-white uppercase text-sm font-bold tracking-widest py-4 px-6 hover:bg-gray-800 transition-colors duration-200"
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        </div>
    );
}
