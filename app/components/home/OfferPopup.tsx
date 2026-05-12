import { useState, useEffect } from 'react';
import { Link } from 'react-router';

type PopupField = { value: string } | null;
type ImageRef = { reference: { image: { url: string; altText: string | null } } | null } | null;
type VideoRef = { reference: { sources: { url: string; mimeType: string }[] } | { url: string } | null } | null;

export type PopupContent = {
  label: PopupField;
  offer_text: PopupField;
  description: PopupField;
  cta_text: PopupField;
  cta_link: PopupField;
  enabled: PopupField;
  delay_ms: PopupField;
  image: ImageRef;
  video: VideoRef;
} | null;

export function OfferPopup({ content }: { content: PopupContent }) {
  const enabled = content?.enabled?.value !== 'false';
  const delay = parseInt(content?.delay_ms?.value ?? '1500', 10);
  const label = content?.label?.value ?? 'Limited Time';
  const offerText = content?.offer_text?.value ?? 'Get 50% Off';
  const description = content?.description?.value ?? '50% off all items—shop local style, Limited time only!';
  const ctaText = content?.cta_text?.value ?? 'Shop Offer';
  const ctaLink = content?.cta_link?.value ?? '/collections/shop-all';
  const imageUrl = content?.image?.reference?.image?.url ?? null;
  const videoRef = content?.video?.reference as any;
  const videoUrl = videoRef?.sources?.find((s: any) => s.mimeType === 'video/mp4')?.url ?? videoRef?.url ?? null;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setIsOpen(true), delay);
    return () => clearTimeout(timer);
  }, [enabled, delay]);

  if (!enabled || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl flex flex-col transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white/80 md:bg-transparent rounded-full p-1 md:p-0 text-gray-800 hover:text-black transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Media Section */}
        <div className="w-full h-90 md:h-auto shrink-0">
          {videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src={videoUrl}
              className="w-full h-full object-cover contrast-125"
              poster={imageUrl ?? undefined}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Promotional Offers"
              className="w-full h-full object-cover contrast-125 object-center"
            />
          ) : null}
        </div>

        {/* Content Section */}
        <div className="w-full p-6 md:p-8 flex flex-col md:flex-row text-center bg-white text-black">
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2 md:mb-3 block">
              {label}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-2">
              {offerText}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-6 mt-1 md:mt-2 leading-relaxed max-w-[280px] mx-auto">
              {description}
            </p>
            <Link
              to={ctaLink}
              onClick={() => setIsOpen(false)}
              className="w-full max-w-[250px] mx-auto border-2 border-black bg-transparent text-black uppercase text-xs font-bold tracking-widest py-3 hover:bg-black hover:text-white transition-all duration-200 block"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
