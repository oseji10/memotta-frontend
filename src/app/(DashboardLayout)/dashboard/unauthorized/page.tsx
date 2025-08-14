'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md mx-auto"
      >
        <h1 className="text-6xl font-extrabold text-red-600 mb-6 drop-shadow-lg">
          ⛔ 403 - Access Denied
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-xl font-medium leading-relaxed">
          😂 Oops! Looks like you tried to sneak into a restricted area. 
          Don't worry, we all get lost sometimes! You don't have permission to access this page.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-12"
      >

      </motion.div>
    </div>
  );
}