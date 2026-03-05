import { motion } from "framer-motion";

export const Marquee = () => {
  const text = "BUY 1 GET 1 WITH HALF PRICE — BUY 2 GET 1 FREE — EXCLUSIVE DROPS — ";
  const repeatedText = Array(4).fill(text).join("");

  return (
    <div className="bg-foreground text-background py-3 overflow-hidden border-y border-background/20">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
          className="flex whitespace-nowrap"
        >
          <span className="text-xs tracking-[0.3em] uppercase whitespace-nowrap hover:text-background/70 transition-colors cursor-default px-4">
            {repeatedText}
          </span>
          <span className="text-xs tracking-[0.3em] uppercase whitespace-nowrap hover:text-background/70 transition-colors cursor-default px-4">
            {repeatedText}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
