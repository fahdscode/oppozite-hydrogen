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
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 scale-100">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-10 text-gray-500 hover:text-black transition-colors"
                    aria-label="Close popup"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Section */}
                <div className="hidden md:block w-full md:w-1/2 md:h-auto shrink-0">
                    <img
                        src="/images/offer-popup.png"
                        alt="Promotional Offers"
                        className="w-full h-full object-cover grayscale contrast-125 md:min-h-[600px]"
                    />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col text-center bg-white text-black">
                    {/* Offer 1 */}
                    <div className="flex-1 flex flex-col items-center justify-center border-b border-gray-200 pb-6 mb-6 mt-2 md:mt-0">
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2 md:mb-3 block">Limited Time</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-2">Buy 2<br />Get 1 Free</h2>
                        <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-6 mt-1 md:mt-2 leading-relaxed max-w-[280px] mx-auto">
                            Elevate your streetwear. Add 3 items to your cart, and the lowest priced item is on us.
                        </p>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full max-w-[250px] mx-auto bg-black text-white uppercase text-xs font-bold tracking-widest py-3 hover:bg-gray-800 transition-colors duration-200"
                        >
                            Shop Offer
                        </button>
                    </div>

                    {/* Offer 2 */}
                    <div className="flex-1 flex flex-col items-center justify-center pb-2 md:pb-0">
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2 md:mb-3 block">Special Deal</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-2">Buy 1<br />Get 1 50% Off</h2>
                        <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-6 mt-1 md:mt-2 leading-relaxed max-w-[280px] mx-auto">
                            Mix and match your favorites. Buy one item and get the second for half the price.
                        </p>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full max-w-[250px] mx-auto border-2 border-black bg-transparent text-black uppercase text-xs font-bold tracking-widest py-3 hover:bg-black hover:text-white transition-all duration-200"
                        >
                            Shop Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
