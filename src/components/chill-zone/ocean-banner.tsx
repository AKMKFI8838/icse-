
'use client';

import { motion } from 'framer-motion';

export function OceanBanner() {
  return (
    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden bg-blue-100 dark:bg-blue-900/50">
      {/* Sun/Moon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 right-16 w-12 h-12 bg-yellow-300 rounded-full dark:bg-gray-300"
      ></motion.div>

      {/* Boat */}
      <motion.div
        className="absolute z-10"
        style={{ bottom: '28%', left: '30%' }}
        animate={{
          y: [0, -8, 2, 0],
          rotate: [0, -2, 3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-24 h-12 bg-yellow-800 rounded-b-full"></div>
        <div 
          className="absolute w-2 h-16 bg-gray-400"
          style={{ left: 'calc(50% - 4px)', bottom: '1.5rem' }}
        ></div>
        <div 
          className="absolute w-12 h-10 bg-white"
          style={{ left: 'calc(50% + 2px)', bottom: '4rem' }}
          // clip path for sail shape
          // style={{clipPath: 'polygon(0 0, 100% 100%, 0 100%)'}}
        ></div>
      </motion.div>

      {/* Waves */}
      <div className="absolute bottom-0 left-0 w-full h-2/3">
        <motion.div
          className="absolute bottom-0 left-0 w-[200%] h-full"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 88.7\'%3E%3Cpath d=\'M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z\' fill=\'%2360a5fa\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat-x',
          }}
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[200%] h-full opacity-50"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 88.7\'%3E%3Cpath d=\'M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z\' fill=\'%233b82f6\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat-x',
          }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
