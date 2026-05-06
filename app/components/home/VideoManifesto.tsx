import { motion } from "framer-motion";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";

type ManifestoField = { value: string } | null;
type VideoRef = { reference: { sources: { url: string; mimeType: string }[] } | null } | null;
type ImageRef = { reference: { image: { url: string; altText: string | null } } | null } | null;

export type ManifestoContent = {
  overline: ManifestoField;
  heading: ManifestoField;
  body_text: ManifestoField;
  cta_text: ManifestoField;
  cta_link: ManifestoField;
  video: VideoRef;
  poster: ImageRef;
} | null;

export const VideoManifesto = ({ content }: { content: ManifestoContent }) => {
  const overline = content?.overline?.value ?? 'Define Your Era';
  const heading = content?.heading?.value ?? 'UNAPOLOGETIC';
  const bodyText = content?.body_text?.value ?? 'Fashion is the armor to survive the reality of everyday life.\nWe don\'t just sell clothes; we provide the attitude.';
  const ctaText = content?.cta_text?.value ?? 'Join The Movement';
  const ctaLink = content?.cta_link?.value ?? '/shop';
  const videoUrl = content?.video?.reference?.sources?.[0]?.url ?? '/VERT_vid.mp4';
  const posterUrl = content?.poster?.reference?.image?.url ?? '/manifesto.png';

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            if (videoRef.current) {
              videoRef.current.load();
              videoRef.current.play().catch(() => {});
            }
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video
          ref={videoRef}
          autoPlay={isVisible}
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
          poster={posterUrl}
        >
          {isVisible && <source src={videoUrl} type="video/mp4" />}
          <div className="w-full h-full bg-neutral-900" />
        </video>
      </div>

      <div className="container relative z-20 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs md:text-sm tracking-[0.4em] uppercase mb-6 block text-white/80">
            {overline}
          </span>
          <h2 className="font-display text-[10vw] leading-none mb-8 mix-blend-overlay opacity-90">
            {heading}
          </h2>
          <p className="max-w-xl mx-auto text-lg md:text-xl font-light text-white/90 mb-10 leading-relaxed whitespace-pre-line">
            {bodyText}
          </p>
          <Link
            to={ctaLink}
            className="inline-block border border-white px-10 py-4 text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            {ctaText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
