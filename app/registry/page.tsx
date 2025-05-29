'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Variants } from 'framer-motion';
import { useState } from 'react';

interface RegistryItem {
  id: string;
  name: string;
  image: string;
  price: string;
  url: string;
}

const registryItems: RegistryItem[] = [
  {
    id: 'mixing-bowl',
    name: 'KitchenAid Mixing Bowl Set',
    image: '/registry/glassmixerbowl.jpg',
    price: '$79.95',
    url: 'https://www.amazon.com/dp/B07SJV84M1'
  },
  {
    id: 'bagholder',
    name: 'Wood Trashbag Holder',
    image: '/registry/trashbagholder.jpg',
    price: '$37.99',
    url: 'https://www.amazon.com/dp/B0CC1VRHVY'
  },
  {
    id: 'barkit',
    name: 'Complete Bar Tool Set',
    image: '/registry/barkit.jpg',
    price: '$28.54',
    url: 'https://www.amazon.com/dp/B08BYJ8KSR'
  },
  {
    id: 'coffeespoons',
    name: 'Coffee Spoon Set',
    image: '/registry/coffeespoons.jpg',
    price: '$6.98',
    url: 'https://www.amazon.com/dp/B091CHRKVH'
  },
  {
    id: 'plastic-container',
    name: 'Plastic Food Containers',
    image: '/registry/foodcontainers.jpg',
    price: '$20.99',
    url: 'https://www.amazon.com/dp/B0BNQ1WDBZ'
  },
  {
    id: 'digitalframe',
    name: 'Digital Picture Frame',
    image: '/registry/digitalframe.jpg',
    price: '$55.19',
    url: 'https://www.amazon.com/dp/B0CTMQGF3G'
  },
  {
    id: 'Marble Rolling Pin',
    name: 'Marble Rolling Pin',
    image: '/registry/marblerollingpin.jpg',
    price: '$22.95',
    url: 'https://www.amazon.com/dp/B0000VLPAS'
  },
  {
    id: 'porcelainpans',
    name: 'Porcelain Oven Pans',
    image: '/registry/ovendish.jpg',
    price: '$53.99',
    url: 'https://www.amazon.com/dp/B08T99DPF3'
  },
  {
    id: 'roomba',
    name: 'Roomba Robot Vacuum',
    image: '/registry/roomba.jpg',
    price: '$192.03',
    url: 'https://www.amazon.com/dp/B08SP5GYJP'
  },
  {
    id: 'glassjars',
    name: 'Glass Storage Jar Set',
    image: '/registry/glassjars.jpg',
    price: '$29.99',
    url: 'https://www.amazon.com/dp/B0B27X7HFZ'
  },
  {
    id: 'kettle',
    name: 'Electric Kettle',
    image: '/registry/electrickettle.jpg',
    price: '$21.49',
    url: 'https://www.amazon.com/dp/B07JZQ1MXT'
  },
  {
    id: 'Mixing Bowls',
    name: 'Mixing Bowls',
    image: '/registry/chefmixingbowl.jpg',
    price: '$31.99',
    url: 'https://www.amazon.com/dp/B08TH6VP1K'
  },
  {
    id: 'sealer',
    name: 'Vacuum Sealer',
    image: '/registry/vacuumsealer.jpg',
    price: '$57.87',
    url: 'https://www.amazon.com/dp/B01MXLTR09'
  },
  {
    id: 'blender',
    name: 'Ninja Blender',
    image: '/registry/blender.jpg',
    price: '$179.99',
    url: 'https://www.amazon.com/dp/B00939I7EK'
  },
  {
    id: 'cakestand',
    name: 'Wood Cake Stand',
    image: '/registry/woodcakestand.jpg',
    price: '$54.99',
    url: 'https://www.amazon.com/dp/B00PP0CKGW?colid=1MWJG37NONCMK&coliid=I2HCHM6KWYF9ZY&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'slidingmat',
    name: 'Kitchen Aid Sliding Mat',
    image: '/registry/slidingmat.jpg',
    price: '$20.39',
    url: 'https://www.amazon.com/dp/B0D2R9YGW7?colid=1MWJG37NONCMK&coliid=I8W1FFRRBWD2M&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'pastamaker',
    name: 'Pasta Maker Attachment Set',
    image: '/registry/pastamaker.jpg',
    price: '$89.99',
    url: 'https://www.amazon.com/dp/B0C6DKPPMH?colid=1MWJG37NONCMK&coliid=I24G2NYNUPNCLR&ref_=wr_ov_pt'
  },
  {
    id: 'qtipholder',
    name: 'Qtip Holder',
    image: '/registry/bathroomcontainers.jpg',
    price: '$9.99',
    url: 'https://www.amazon.com/dp/B09W9GFRW3?colid=1MWJG37NONCMK&coliid=I38PAWF2TVU0WM&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'towels',
    name: 'Linen Towels 18Pcs Set',
    image: '/registry/graytowels.jpg',
    price: '$56.99',
    url: 'https://www.amazon.com/dp/B09W9GFRW3?colid=1MWJG37NONCMK&coliid=I38PAWF2TVU0WM&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'stoneware',
    name: 'Stoneware Dinner Plate Set',
    image: '/registry/stonewareplates.jpg',
    price: '$64.99',
    url: 'https://www.amazon.com/dp/B07XKXQL79?colid=1MWJG37NONCMK&coliid=IWJQ3MY7GPVTH&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'bissell',
    name: 'Bissell Vacuum',
    image: '/registry/bissell.jpg',
    price: '$143.43',
    url: 'https://www.amazon.com/dp/B0C9V48DDZ?colid=1MWJG37NONCMK&coliid=I1OBGMRL1JKWBV&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'breadpans',
    name: 'Rectangle Bread Pans',
    image: '/registry/loafpans.jpg',
    price: '$12.99',
    url: 'https://www.amazon.com/dp/B073P52PPR?colid=1MWJG37NONCMK&coliid=I2B4NXJKTRCVTH&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'herbgarden',
    name: 'Herb Garden Stand',
    image: '/registry/herbgarden.jpg',
    price: '$110.99',
    url: 'https://www.amazon.com/dp/B01LXUGHHH?colid=1MWJG37NONCMK&coliid=I26GGQI9OS3MC2&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'dutchoven',
    name: 'Dutch Oven',
    image: '/registry/dutchoven.jpg',
    price: '$69.99',
    url: 'https://www.amazon.com/dp/B0CX4BXRY1?colid=1MWJG37NONCMK&coliid=I2W6BGFZTK93ZW&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'Duvet Cover Gray',
    name: 'Duvet Cover Gray',
    image: '/registry/graycomforter.jpg',
    price: '$36.99',
    url: 'https://www.amazon.com/dp/B0DQ7FYYGG?colid=1MWJG37NONCMK&coliid=I1BOI6IQXBLIFB&ref_=wr_ov_pt&th=1'
  },
  {
    id: 'Duvet Cover Blue',
    name: 'Duvet Cover Blue',
    image: '/registry/bluecomforterduvet.jpg',
    price: '$42.99',
    url: 'https://www.amazon.com/dp/B0DBVNGHK1?colid=1MWJG37NONCMK&coliid=I1N8DN1QYVFMUJ&ref_=wr_ov_pt'
  },
  {
    id: 'Comforter Blue',
    name: 'Comforter Blue',
    image: '/registry/bluecomforter.jpg',
    price: '$45.99',
    url: 'https://www.amazon.com/dp/B0DLGVP1HN?colid=1MWJG37NONCMK&coliid=I2JDNKN9FJIBYI&ref_=wr_ov_pt&th=1'
  },
];

export default function Registry() {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-sky-50 via-white to-sky-50 p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-sky-200/20 to-sky-300/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-yellow-200/20 to-yellow-300/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 font-serif">
            Wedding Registry 🎁
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thank you for helping us build our home together. Your presence at our wedding is the greatest gift of all, but if you wish to help us celebrate with a gift, we&apos;ve registered for a few items that would make our new home special.
          </p>
        </motion.div>

        {/* Registry Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {registryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemAnimation}
              className="group relative"
              style={{ 
                opacity: loadedImages.has(item.id) ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <a 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden
                              transition-all duration-300 transform group-hover:scale-[1.02]
                              group-hover:shadow-xl">
                  <div className="aspect-square relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onLoadingComplete={() => {
                        setLoadedImages(prev => new Set(prev).add(item.id));
                      }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-sky-500 font-semibold">
                      {item.price}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400/0 to-sky-400/0
                                group-hover:from-sky-400/10 group-hover:to-transparent
                                transition-all duration-300" />
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
