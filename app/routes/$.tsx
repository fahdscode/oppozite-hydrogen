import { motion } from 'framer-motion';
import { Link } from 'react-router';
import type { Route } from './+types/$';

export async function loader({ request }: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">
          Error 404
        </p>
        <h1 className="font-display text-[clamp(8rem,30vw,22rem)] leading-none text-white">
          LOST
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-gray-400 text-lg tracking-wide max-w-sm mx-auto mt-4 mb-10"
        >
          This page doesn't exist. But your style does.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-block border border-white text-white px-10 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-200"
          >
            Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-block bg-white text-black px-10 py-3 text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors duration-200"
          >
            Shop Now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
