'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, useAnimate, stagger } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Hero() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date('2025-08-30T00:00:00');
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRSVPClick = async () => {
    setIsLoading(true);

    // Animate elements out sequentially
    await animate([
      // Fade out RSVP button first
      ['.rsvp-button', { opacity: 0, y: 20 }, { duration: 0.2 }],
      
      // Animate out countdown items with stagger
      ['.countdown-item', 
        { opacity: 0, y: -30 }, 
        { duration: 0.3, delay: stagger(0.1) }
      ],
      
      // Fade out date text
      ['.date-text', { opacity: 0, y: -20 }, { duration: 0.3 }],
      
      // Fade out names
      ['.names', { opacity: 0, y: -20 }, { duration: 0.3 }],
      
      // Finally fade out the background
      ['.hero-overlay', { opacity: 0 }, { duration: 0.5 }],
      ['.hero-image', { opacity: 0 }, { duration: 0.5 }],
    ]);

    // Navigate to RSVP page
    router.push('/rsvp');
  };

  return (
    <motion.div 
      ref={scope}
      className="relative w-full h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* Hero Image with overlay */}
      <div className="absolute inset-0">
        <motion.div
          className="hero-image absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Image
            src="/HeroImage.png"
            alt="Ralph and Odette's Engagement"
            fill
            className="object-cover"
            priority
            quality={100}
            sizes="100vw"
            placeholder="empty"
          />
        </motion.div>
        <motion.div 
          className="hero-overlay absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </div>
      
      {/* Text content */}
      <motion.div 
        className="relative z-10 text-center text-white w-full max-w-4xl px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h1 
          className="names text-4xl sm:text-6xl md:text-7xl font-bold mb-2 font-serif tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="block">Ralph & Odette</span>
        </motion.h1>

        <motion.p 
          className="date-text text-lg sm:text-xl mb-6 font-light tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          August 30, 2025 • Rustic Gardens
        </motion.p>
        
        {/* Countdown Timer */}
        <motion.div 
          className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sec' }
          ].map((item, index) => (
            <motion.div 
              key={item.label}
              className="countdown-item relative group bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4
                       border border-sky-200/20 transition-all duration-300
                       hover:bg-sky-100/20 hover:border-sky-200/40 hover:scale-105
                       hover:shadow-[0_0_15px_rgba(186,230,253,0.3)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
            >
              <div className="text-2xl sm:text-4xl font-bold mb-1 group-hover:text-sky-100
                            transition-all duration-300">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-sky-100/80
                            group-hover:text-sky-100">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RSVP Button */}
        <motion.button 
          onClick={handleRSVPClick}
          disabled={isLoading}
          className={`rsvp-button relative overflow-hidden group px-8 py-3 rounded-full 
                     text-sm sm:text-base font-semibold tracking-wider
                     transition-all duration-300 transform
                     bg-gradient-to-r from-sky-400/90 to-sky-500/90
                     hover:from-sky-400 hover:to-sky-500
                     hover:scale-105 hover:shadow-[0_0_20px_rgba(186,230,253,0.4)]
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 text-white">
            {isLoading ? 'Loading...' : 'RSVP NOW'}
          </span>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 