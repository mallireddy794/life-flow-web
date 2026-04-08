import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#030213] flex flex-col items-center justify-center z-[9999]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.2, 1],
          opacity: 1,
        }}
        transition={{ 
          duration: 1.2,
          ease: "easeOut",
          times: [0, 0.7, 1]
        }}
        className="relative"
      >
        {/* Animated Background Rings */}
        <motion.div 
          animate={{ 
            scale: [1, 2],
            opacity: [0.3, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute inset-0 bg-red-600 rounded-full blur-xl"
        />
        
        {/* Logo Icon */}
        <div className="bg-red-600 p-8 rounded-[2.5rem] shadow-2xl shadow-red-900/50 relative z-10">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>
      </motion.div>

      {/* App Name Animation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-black text-white tracking-tighter">
          Life<span className="text-red-600">Flow</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium tracking-widest text-xs uppercase">
          AI-Powered Blood Donation
        </p>
      </motion.div>

      {/* Modern Loading Bar */}
      <div className="absolute bottom-20 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent w-full"
        />
      </div>
    </div>
  );
}
