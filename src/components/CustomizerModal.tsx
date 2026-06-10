/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Language, CustomCakeOptions } from '../types';
import { translations } from '../translations';
import { X, Check, Eye, Heart, Sparkles, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomizerModalProps {
  product: Product;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onAddCustomizedToCart: (product: Product, options: CustomCakeOptions, finalPrice: number) => void;
}

export default function CustomizerModal({
  product,
  language,
  isOpen,
  onClose,
  onAddCustomizedToCart,
}: CustomizerModalProps) {
  const t = translations[language];

  // Customizer state
  const [weight, setWeight] = useState<number>(1.5);
  const [sponge, setSponge] = useState<string>('Vanilla');
  const [filling, setFilling] = useState<string>('Strawberry');
  const [inscription, setInscription] = useState<string>('');
  const [candlesCount, setCandlesCount] = useState<number>(0);
  const [creamColor, setCreamColor] = useState<string>('White');
  const [topping, setTopping] = useState<string>('None');
  const [decorationStyle, setDecorationStyle] = useState<string>('Minimalist');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [sliceOpen, setSliceOpen] = useState<boolean>(true);
  const [frostingTexture, setFrostingTexture] = useState<string>('Smooth');
  const [sprinkles, setSprinkles] = useState<string>('None');
  const [hasSparkler, setHasSparkler] = useState<boolean>(false);

  // Calculate customized final price
  const [finalPrice, setFinalPrice] = useState<number>(product.price);

  // Body scroll lock when customizer modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    // 1.5kg: Base Price
    // 3.0kg: Price * 1.8
    // 5.0kg: Price * 2.8
    let priceMultiplier = 1;
    if (weight === 3) priceMultiplier = 1.8;
    else if (weight === 5) priceMultiplier = 2.8;

    // Fillings add variable values
    let extraCosts = 0;
    if (filling === 'Pistachio') extraCosts += 1500;
    if (filling === 'Chocolate Ganache') extraCosts += 800;

    // Toppings costs
    if (topping === 'Berries') extraCosts += 1000;
    else if (topping === 'GoldFlakes') extraCosts += 2000;
    else if (topping === 'ChocolateShavings') extraCosts += 800;
    else if (topping === 'Macarons') extraCosts += 1500;
    else if (topping === 'Flowers') extraCosts += 1200;

    // Decoration style costs
    if (decorationStyle === 'Borders') extraCosts += 600;
    else if (decorationStyle === 'Sparkly Glaze') extraCosts += 1500;
    else if (decorationStyle === 'Royal Vintage') extraCosts += 2200;

    // Additional high-fidelity additions costs
    if (frostingTexture === 'Swirls') extraCosts += 400; // Ribbed texture
    if (sprinkles === 'Pearls') extraCosts += 300;
    else if (sprinkles === 'Confetti') extraCosts += 300;
    else if (sprinkles === 'Stars') extraCosts += 450;
    if (hasSparkler) extraCosts += 1200; // Sparkler celebration candle

    setFinalPrice(Math.round(product.price * priceMultiplier + extraCosts));
  }, [weight, filling, topping, decorationStyle, frostingTexture, sprinkles, hasSparkler, product.price]);

  if (!isOpen) return null;

  // Options keys
  const sponges = [
    { key: 'Chocolate', hy: 'Շոկոլադե 🍫', en: 'Belgian Chocolate 🍫', descHy: 'Օրգանական կակաո', descEn: 'Fine organic cocoa' },
    { key: 'Red Velvet', hy: 'Կարմիր Վելվետ 🍰', en: 'Crimson Red Velvet 🍰', descHy: 'Նուրբ վանիլային շերտեր', descEn: 'Soft premium red velvet' },
    { key: 'Vanilla', hy: 'Վանիլային 🌼', en: 'Madagascar Vanilla 🌼', descHy: 'Մադագասկարի բնական վանիլ', descEn: 'Rich natural vanilla pods' },
    { key: 'Honey', hy: 'Մեղրով (Մեդովիկ) 🍯', en: 'Honey Medovik Base 🍯', descHy: 'Բնական մեղրով շերտեր', descEn: 'Traditional honey biscuit' },
  ];

  const fillings = [
    { key: 'Strawberry', hy: 'Ազնվամորի / Ելակ 🍓', en: 'Raspberry / Strawberry Rec 🍓', descHy: 'Թարմ հատապտղային կոնֆի', descEn: 'Fresh forest berry compote' },
    { key: 'Caramel', hy: 'Աղի Կարամել 🍯', en: 'Salted Cream Caramel 🍯', descHy: 'Մեր ձեռքով եփված կարամել', descEn: 'Home-cooked buttery caramel' },
    { key: 'Chocolate Ganache', hy: 'Շոկոլադե Գանաշ 🍫 (+800 ֏)', en: 'Chocolate Ganache 🍫 (+800 AMD)', descHy: 'Բելգիական շոկոլադե կրեմ', descEn: 'Silky rich Belgian chocolate' },
    { key: 'Pistachio', hy: 'Պրեմիում Պիստակ 🥜 (+1500 ֏)', en: 'Premium Pistachio 🥜 (+1500 AMD)', descHy: 'Իրանական բնական պիստակ', descEn: 'Natural green pistachio butter' },
    { key: 'Custard', hy: 'Նուրբ Եփովի Կրեմ 🍮', en: 'Classic Pastry Custard 🍮', descHy: 'Թեթև ֆրանսիական կրեմ', descEn: 'Velvety french pastry custard' },
  ];

  const colors = [
    { key: 'White', hex: '#FFFFFF', border: 'border-slate-300', hy: 'Ձյունաճերմակ 🤍', en: 'Snow White 🤍', descHy: 'Պատրաստված թարմ սերուցքից', descEn: 'Whipped bio cream base' },
    { key: 'Pink', hex: '#FBCFE8', border: 'border-pink-300', hy: 'Նուրբ Վարդագույն 🩷', en: 'Pastel Pink 🩷', descHy: 'Ելակի նուրբ երանգով կրեմ', descEn: 'With subtle strawberry hints' },
    { key: 'Pastel Blue', hex: '#BFDBFE', border: 'border-blue-300', hy: 'Երկնագույն 🩵', en: 'Heavenly Blue 🩵', descHy: 'Բնական կապույտ թեյի գույն', descEn: 'From natural blue tea infusion' },
    { key: 'Chocolate', hex: '#582F0E', border: 'border-amber-900', hy: 'Շոկոլադե 🤎', en: 'Fudge Brown 🤎', descHy: 'Կակոյի հարուստ համով կրեմ', descEn: 'Aromatic intense chocolate shell' },
  ];

  const toppings = [
    { key: 'None', hy: 'Առանց հավելյալ դեկորի 🍃', en: 'No extra topping 🍃', price: 0, descHy: 'Մաքուր դիզայներական ոճ', descEn: 'Clean minimalist look' },
    { key: 'Berries', hy: 'Թարմ Հատապտուղներ 🍓 (+1,000 ֏)', en: 'Fresh Forest Berries 🍓 (+1000 AMD)', price: 1000, descHy: 'Ելակ, ազնվամորի, հապալաս', descEn: 'Strawberries, raspberries, blueberries' },
    { key: 'GoldFlakes', hy: '24Կ Ուտելի Ոսկու Փաթիլներ ✨ (+2,000 ֏)', en: '24K Edible Gold Leafs ✨ (+2000 AMD)', price: 2000, descHy: 'Շատ շքեղ ոսկե երանգներ', descEn: 'Exquisite glittering luxury decoration' },
    { key: 'ChocolateShavings', hy: 'Շոկոլադե Գանգուրներ 🍫 (+800 ֏)', en: 'Belgian Chocolate Curls 🍫 (+800 AMD)', price: 800, descHy: 'Մուգ և կաթնային քերուկ', descEn: 'Fine dark chocolate curls' },
    { key: 'Macarons', hy: 'Մինի Մակարոններ 🍬 (+1,500 ֏)', en: 'Mini Pastel Macarons 🍬 (+1500 AMD)', price: 1500, descHy: 'Ֆրանսիական նուրբ թխվածքներ', descEn: 'Delicious almond pastries on top' },
    { key: 'Flowers', hy: 'Նուրբ Շաքարե Վարդեր 🌸 (+1,200 ֏)', en: 'Handcrafted Sugar Flowers 🌸 (+1200 AMD)', price: 1200, descHy: 'Կարագե կամ շաքարե վարդեր', descEn: 'Beautiful edible pastel roses' }
  ];

  const decorationStyles = [
    { key: 'Minimalist', hy: 'Ժամանակակից Մինիմալիզմ 🕊️', en: 'Modern Minimalist 🕊️', price: 0, descHy: 'Հարթ, մաքուր երեսպատում', descEn: 'Sleek premium flat coat style' },
    { key: 'Borders', hy: 'Վինտաժե Եզրագծեր 🎂 (+600 ֏)', en: 'Classic Whipped Borders 🎂 (+600 AMD)', price: 600, descHy: 'Ձեռքով պտտված աստղային կրեմ', descEn: 'Star-piped retro cream borders style' },
    { key: 'Sparkly Glaze', hy: 'Շողշողուն Հայելային Գլազուր ✨ (+1,500 ֏)', en: 'Deep Mirror Glaze ✨ (+1500 AMD)', price: 1500, descHy: 'Փայլուն շողացող արտացոլումներ', descEn: 'Glossy shimmering specular reflex glaze' },
    { key: 'Royal Vintage', hy: 'Արքայական Լանջեր և Ուլունքներ 👑 (+2,200 ֏)', en: 'Royal Lace & Vintage 👑 (+2200 AMD)', price: 2200, descHy: 'Մանրակրկիտ պալատական դիզայն', descEn: 'Intricate retro piping with silver sugar pearls' }
  ];

  // Specific visual styling for the dynamic cake display based on selections
  const getSpongeColor = () => {
    switch (sponge) {
      case 'Chocolate': return 'from-[#4B2C20] to-[#2B1B15]';
      case 'Red Velvet': return 'from-[#9F1239] to-[#701A28]';
      case 'Vanilla': return 'from-[#FEF3C7] to-[#FDE047]';
      case 'Honey': return 'from-[#D97706] to-[#B45309]';
      default: return 'from-[#FEF3C7] to-[#FDE047]';
    }
  };

  const getFillingColor = () => {
    switch (filling) {
      case 'Strawberry': return 'from-[#EF4444] to-[#BE123C]';
      case 'Caramel': return 'from-[#EAB308] to-[#CA8A04]';
      case 'Chocolate Ganache': return 'from-[#1E0F06] to-[#0A0503]';
      case 'Pistachio': return 'from-[#10B981] to-[#047857]';
      case 'Custard': return 'from-[#FEF08A] to-[#FACC15]';
      default: return 'from-[#EF4444] to-[#BE123C]';
    }
  };

  const selectedHex = colors.find(c => c.key === creamColor)?.hex || '#FFFFFF';

  const handleApply = () => {
    const selectedOptions: CustomCakeOptions = {
      weight,
      sponge,
      filling,
      inscription,
      candlesCount,
      creamColor,
      topping,
      decorationStyle,
      frostingTexture,
      sprinkles,
      hasSparkler,
    };
    onAddCustomizedToCart(product, selectedOptions, finalPrice);
    onClose();
  };

  // Helper for rendering realistic frosting side textures (Smooth, Swirls, or Naked)
  const getSideFaceStyle = () => {
    if (frostingTexture === 'Naked') {
      // Naked cake has beautiful horizontal bands where organic sponge base peaks through the thin scraped cream
      let spongeGrad = 'rgba(75,44,32,0.45)'; // Chocolate default
      if (sponge === 'Red Velvet') spongeGrad = 'rgba(159,18,57,0.45)';
      else if (sponge === 'Vanilla') spongeGrad = 'rgba(254,243,199,0.55)';
      else if (sponge === 'Honey') spongeGrad = 'rgba(217,119,6,0.45)';

      return {
        background: `repeating-linear-gradient(180deg, ${selectedHex} 0px, ${selectedHex} 5px, ${spongeGrad} 5px, ${spongeGrad} 11px, ${selectedHex} 11px, ${selectedHex} 16px)`,
        boxShadow: 'inset 0 -4px 9px rgba(0,0,0,0.14), 0 3px 5px rgba(0,0,0,0.1)',
      };
    } else if (frostingTexture === 'Swirls') {
      // Textured horizontal spatula curls
      return {
        backgroundColor: selectedHex,
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 20%, rgba(0,0,0,0.06) 40%, rgba(255,255,255,0.12) 60%, transparent 80%, rgba(0,0,0,0.08) 100%)',
        boxShadow: 'inset 0 -4px 9px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.1)',
      };
    } else {
      // Standard silky smooth frosting
      return {
        backgroundColor: selectedHex,
        boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.1)',
      };
    }
  };

  // Helper for rendering realistic sprinkles scattered around the top flat disk face of a tier
  const renderSprinklesVisual = (tierWidth: number) => {
    if (sprinkles === 'None') return null;
    
    // Determine sprinkle density
    const count = Math.max(9, Math.floor(tierWidth / 8));
    const randomPositions = Array.from({ length: count }).map((_, i) => {
      const angle = (i * (360 / count)) * (Math.PI / 180);
      const radiusX = (0.22 + (i % 3) * 0.22) * (tierWidth / 2);
      const radiusY = (0.22 + (i % 3) * 0.22) * 5; // flat top perspective
      const x = radiusX * Math.cos(angle);
      const y = radiusY * Math.sin(angle) - 1.5;
      return { x, y };
    });

    return (
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-28 overflow-visible">
        {randomPositions.map((pos, i) => {
          let sprinkleClass = '';
          let style: React.CSSProperties = {
            transform: `translate(calc(50% + ${pos.x}px), calc(50% + ${pos.y}px))`,
          };

          if (sprinkles === 'Pearls') {
            style = {
              ...style,
              backgroundImage: 'radial-gradient(circle at 1px 1px, #FFFFFF 10%, #A1A1AA 90%)',
              boxShadow: '0.5px 0.5px 1px rgba(0,0,0,0.2)',
            };
            sprinkleClass = 'w-1 h-1 rounded-full absolute top-1/2 left-0';
          } else if (sprinkles === 'Confetti') {
            const confettiColors = ['#F472B6', '#60A5FA', '#34D399', '#FB7185', '#FBBF24', '#C084FC'];
            const color = confettiColors[i % confettiColors.length];
            style = {
              ...style,
              backgroundColor: color,
              transform: `${style.transform} rotate(${i * 24}deg)`,
              boxShadow: '0.3px 0.5px 0.8px rgba(0,0,0,0.1)'
            };
            sprinkleClass = 'w-1 h-1.5 rounded-sm absolute top-1/2 left-0';
          } else if (sprinkles === 'Stars') {
            return (
              <span 
                key={i} 
                className="absolute text-[7px] text-yellow-300 font-black select-none pointer-events-none animate-pulse"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  textShadow: '0 0 2px rgba(245,158,11,0.8)'
                }}
              >
                ★
              </span>
            );
          }

          return (
            <div 
              key={i} 
              className={sprinkleClass}
              style={style}
            />
          );
        })}
      </div>
    );
  };

  // Helper for rendering realistic rich glaze syrup drips based on chosen gourmet filling
  const renderSyrupDrips = (tierWidth: number) => {
    if (filling === 'Custard') return null; // custard is standard thick inside layer, no drips
    
    // Determine syrup color and gradient matching chosen filling
    let dripGradient = 'from-rose-550 via-rose-650 to-red-800'; // defaults to strawberry
    if (filling === 'Strawberry') {
      dripGradient = 'from-red-500 via-rose-600 to-rose-800';
    } else if (filling === 'Caramel') {
      dripGradient = 'from-amber-500 via-amber-650 to-amber-800';
    } else if (filling === 'Chocolate Ganache') {
      dripGradient = 'from-[#3A1D11] via-[#24120A] to-[#120502]';
    } else if (filling === 'Pistachio') {
      dripGradient = 'from-emerald-450 via-emerald-650 to-teal-800';
    }

    // Render drips along the top front edge of the tier side
    const dripsCount = Math.max(5, Math.floor(tierWidth / 22));
    const randomHeights = [8, 14, 10, 18, 12, 7, 15, 9, 13, 11, 16, 6];

    return (
      <div className="absolute top-0 left-0 right-0 flex justify-around pointer-events-none z-20">
        {Array.from({ length: dripsCount }).map((_, i) => {
          const depth = randomHeights[i % randomHeights.length];
          return (
            <div 
              key={i} 
              className={`w-1.5 rounded-b-full bg-gradient-to-b ${dripGradient} opacity-95`}
              style={{ 
                height: `${depth}px`,
                boxShadow: '0 1.5px 2px rgba(0,0,0,0.25)',
                transform: 'translateY(-1px)'
              }}
            />
          );
        })}
        {/* Horizontal thin layer connecting the drips */}
        <div 
          className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-b ${dripGradient} opacity-95 rounded-t-sm`} 
        />
      </div>
    );
  };

  // Helper for whipped borders
  const renderWhippedBorders = (tierWidthPx: number) => {
    if (decorationStyle !== 'Borders' && decorationStyle !== 'Royal Vintage') return null;
    const count = Math.max(7, Math.floor(tierWidthPx / 10));
    return (
      <div className="absolute -bottom-[4px] left-0 right-0 flex justify-between px-0.5 pointer-events-none z-30">
        {Array.from({ length: count }).map((_, i) => (
          <span 
            key={i} 
            className="w-2.8 h-2.8 rounded-full shadow-inner shrink-0 relative flex items-center justify-center"
            style={{ 
              backgroundColor: selectedHex,
              backgroundImage: 'radial-gradient(circle at 35% 35%, #FFF, rgba(0,0,0,0.05) 90%)',
              boxShadow: 'inset -1.2px -1.2px 2px rgba(0,0,0,0.18), 0 1.5px 2px rgba(0,0,0,0.14)',
              border: creamColor === 'White' ? '0.5px solid rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {/* Edible silver beads on piped star swirls inside Royal Vintage style */}
            {decorationStyle === 'Royal Vintage' && i % 2 === 0 && (
              <span className="w-1 h-1 rounded-full absolute animate-pulse" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #FFF 10%, #DDD 60%, #999 100%)',
                boxShadow: '0.5px 0.5px 1px rgba(0,0,0,0.2)'
              }} />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Helper for royal lace overlay
  const renderRoyalLace = () => {
    if (decorationStyle !== 'Royal Vintage') return null;
    return (
      <svg className="absolute inset-x-0 bottom-1 w-full h-7 pointer-events-none z-25 opacity-95" viewBox="0 0 100 25" preserveAspectRatio="none">
        <path d="M 0,2 Q 12.5,15 25,2 Q 37.5,15 50,2 Q 62.5,15 75,2 Q 87.5,15 100,2" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="1,1" />
        <path d="M 0,6 Q 12.5,19 25,6 Q 37.5,19 50,6 Q 62.5,19 75,6 Q 87.5,19 100,6" fill="none" stroke="#facf44" strokeWidth="0.8" opacity="0.8" />
        {/* Silver sugar pearls */}
        <circle cx="12.5" cy="11" r="1.5" fill="url(#silver-grad-pearl)" />
        <circle cx="37.5" cy="11" r="1.5" fill="url(#silver-grad-pearl)" />
        <circle cx="62.5" cy="11" r="1.5" fill="url(#silver-grad-pearl)" />
        <circle cx="87.5" cy="11" r="1.5" fill="url(#silver-grad-pearl)" />
        
        <defs>
          <radialGradient id="silver-grad-pearl" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#9ca3af" />
          </radialGradient>
        </defs>
      </svg>
    );
  };

  // Helper for shiny glaze overlay
  const getGlazeOverlay = () => {
    if (decorationStyle !== 'Sparkly Glaze') return null;
    return (
      <div 
        className="absolute inset-0 pointer-events-none z-20 opacity-70 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%)',
          backgroundSize: '200% 200%',
          animation: 'shimmerGlazeAnimate 4s linear infinite'
        }}
      />
    );
  };

  // Helper for rendering high-fidelity toppings
  const renderToppingsVisual = () => {
    if (topping === 'None') return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-35 overflow-visible">
        {topping === 'Berries' && (
          <div className="absolute inset-0 flex justify-center items-center overflow-visible">
            {/* Strawberry Left */}
            <motion.div 
              initial={{ scale: 0, x: -26, y: -8, rotate: -25 }} 
              animate={{ scale: 1, x: -26, y: -8, rotate: -25 }} 
              className="absolute w-5 h-5 shadow-sm flex items-center justify-center"
            >
              {/* Strawberry Body */}
              <div className="w-full h-full bg-gradient-to-br from-rose-500 via-red-650 to-red-800 rounded-b-xl rounded-t-lg relative flex items-center justify-center">
                {/* Seed Specks */}
                <span className="absolute top-1 left-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <span className="absolute top-2.5 left-1 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-75" />
                <span className="absolute top-1.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <span className="absolute top-3 right-1 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <span className="absolute top-2 left-2.5 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-75" />
                {/* Green Crown */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full block rotate-12" />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full block -rotate-12" />
                </div>
              </div>
            </motion.div>

            {/* Strawberry Right */}
            <motion.div 
              initial={{ scale: 0, x: 22, y: -6, rotate: 15 }} 
              animate={{ scale: 1, x: 22, y: -6, rotate: 15 }} 
              className="absolute w-4.5 h-4.5 shadow-sm"
            >
              <div className="w-full h-full bg-gradient-to-br from-rose-450 via-red-500 to-red-700 rounded-b-xl rounded-t-md relative">
                <span className="absolute top-1 left-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <span className="absolute top-2 left-1 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-75" />
                <span className="absolute top-1.5 right-1 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <span className="absolute top-2.5 right-1.5 w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-70" />
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  <span className="w-1.2 h-1.2 bg-emerald-500 rounded-full block" />
                  <span className="w-1.2 h-1.2 bg-emerald-600 rounded-full block" />
                </div>
              </div>
            </motion.div>

            {/* Blueberries scattered */}
            <div className="absolute inset-0 flex justify-center items-center overflow-visible">
              {/* Blueberry 1 */}
              <div className="absolute w-2.5 h-2.5 bg-gradient-to-br from-blue-600 via-indigo-805 to-slate-900 rounded-full shadow-xs" style={{ transform: 'translate(-10px, -7px)' }}>
                <span className="absolute top-px left-px w-1 h-1 bg-indigo-400 rounded-full opacity-60" />
                <span className="absolute top-0.5 left-0.5 w-[3px] h-[3px] bg-slate-900 rounded-full border-[0.5px] border-indigo-300 opacity-80" />
              </div>
              {/* Blueberry 2 */}
              <div className="absolute w-2.5 h-2.5 bg-gradient-to-br from-blue-600 via-indigo-805 to-slate-900 rounded-full shadow-xs" style={{ transform: 'translate(12px, -9px)' }}>
                <span className="absolute top-px left-px w-1 h-1 bg-indigo-400 rounded-full opacity-60" />
                <span className="absolute top-0.5 left-0.5 w-[3px] h-[3px] bg-slate-900 rounded-full border-[0.5px] border-indigo-300 opacity-80" />
              </div>
              {/* Blueberry 3 */}
              <div className="absolute w-2 h-2 bg-gradient-to-br from-indigo-550 via-indigo-750 to-slate-900 rounded-full shadow-xs" style={{ transform: 'translate(4px, -11px)' }}>
                <span className="absolute top-px left-px w-[3px] h-[3px] bg-slate-905 rounded-full border-[0.5px] border-indigo-400 opacity-80" />
              </div>
            </div>

            {/* Raspberries */}
            <div className="absolute inset-0 flex justify-center items-center overflow-visible">
              {/* Raspberry 1 */}
              <div className="absolute w-3.5 h-3.5 bg-gradient-to-b from-rose-500 to-red-700 rounded-full shadow-xs flex flex-wrap p-[0.5px] overflow-hidden" style={{ transform: 'translate(-19px, -11px)' }}>
                {Array.from({ length: 6 }).map((_, r) => (
                  <span key={r} className="w-1 h-1 bg-rose-600 rounded-full block border-[0.2px] border-rose-450 shrink-0" />
                ))}
              </div>
              {/* Raspberry 2 */}
              <div className="absolute w-3.5 h-3.5 bg-gradient-to-b from-rose-500 to-red-750 rounded-full shadow-xs flex flex-wrap p-[0.5px] overflow-hidden" style={{ transform: 'translate(19px, -12px)' }}>
                {Array.from({ length: 6 }).map((_, r) => (
                  <span key={r} className="w-1 h-1 bg-rose-600 rounded-full block border-[0.2px] border-rose-450 shrink-0" />
                ))}
              </div>
            </div>

            {/* Elegant Fresh Mint Leaves lying flat */}
            <div className="absolute inset-0 flex justify-center items-center overflow-visible">
              <span className="absolute w-3.5 h-1.5 bg-emerald-600/90 rounded-full border border-emerald-500 shadow-xs text-[6px] text-emerald-100 flex items-center justify-center font-bold tracking-tighter" style={{ transform: 'translate(-33px, -2px) rotate(-15deg)' }}>☘️</span>
              <span className="absolute w-3.5 h-1.5 bg-emerald-600/90 rounded-full border border-emerald-500 shadow-xs text-[6px] text-emerald-100 flex items-center justify-center font-bold tracking-tighter" style={{ transform: 'translate(31px, -1px) rotate(20deg)' }}>☘️</span>
            </div>
          </div>
        )}

        {/* 24K Edible Goldflakes */}
        {topping === 'GoldFlakes' && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-visible">
            {/* Sparkly particles spread around the dynamic top area */}
            {Array.from({ length: 15 }).map((_, i) => {
              const randomX = (Math.sin(i * 1.7) * 44);
              const randomY = (Math.cos(i * 2.3) * 12) - 3;
              const size = (i % 3 === 0) ? 'w-2 h-2' : (i % 2 === 0) ? 'w-1.5 h-1.5' : 'w-1 h-1';
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.3, 0.9], y: [randomY, randomY - 3, randomY] }}
                  transition={{ repeat: Infinity, duration: 2.5 + (i % 3) * 0.5, delay: i * 0.12 }}
                  className={`absolute ${size} bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200`}
                  style={{ 
                    left: `calc(50% + ${randomX}px)`,
                    boxShadow: '0 0 7px rgba(245,158,11,0.9)',
                    borderRadius: i % 2 === 0 ? '1px' : '50%',
                    transform: `rotate(${i * 45}deg)`
                  }}
                />
              );
            })}
            {/* Center golden starburst flare */}
            <span className="absolute text-yellow-300 font-extrabold text-[13px] animate-pulse" style={{ transform: 'translateY(-13px)' }}>✨</span>
          </div>
        )}

        {/* Belgian Chocolate Curls */}
        {topping === 'ChocolateShavings' && (
          <div className="absolute inset-0 flex justify-center items-center overflow-visible">
            {Array.from({ length: 12 }).map((_, i) => {
              const rx = Math.sin(i * 1.5) * 40;
              const ry = Math.cos(i * 1.9) * 11 - 2;
              const angle = i * 45 + 15;
              const isWhiteChocolate = i % 3 === 0;
              const gradient = isWhiteChocolate 
                ? 'from-[#FFFDF5] to-[#E3DCB8]' // White chocolate curl
                : i % 2 === 0 
                  ? 'from-[#3B1E12] to-[#1E0F0A]' // Dark chocolate curl
                  : 'from-[#5C321E] to-[#402012]'; // Milk chocolate curl
              
              return (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: i * 0.04 }}
                  className={`absolute w-3.5 h-1 rounded-sm shadow-xs bg-gradient-to-b ${gradient}`}
                  style={{ 
                    left: `calc(50% + ${rx}px)`,
                    top: `calc(50% + ${ry}px)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) skewX(10deg)`,
                    boxShadow: '0 1px 1.5px rgba(0,0,0,0.15)',
                    border: isWhiteChocolate ? '0.5px solid rgba(0,0,0,0.05)' : 'none'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* French Macarons stack */}
        {topping === 'Macarons' && (
          <div className="absolute inset-0 flex justify-center items-center overflow-visible">
            {/* Macaron 1 (Lavender Pink Meringue) */}
            <motion.div 
              initial={{ scale: 0, x: -22, y: -9, rotate: -20 }}
              animate={{ scale: 1, x: -22, y: -9, rotate: -20 }}
              className="absolute flex flex-col items-center pointer-events-none"
            >
              <div className="flex flex-col items-center select-none shadow-sm filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)] scale-[0.82]">
                {/* Upper Meringue Foot shell */}
                <div className="w-6.5 h-2 bg-gradient-to-b from-[#FDA4AF] to-[#E28392] rounded-t-full border-b-[0.5px] border-rose-300" />
                {/* Ruffled airy middle foot */}
                <div className="w-[27px] h-[2px] bg-[#E11D48]/70 border-y-[0.2px] border-white/20" />
                {/* Sweet rich creamy strawberry ganache layer */}
                <div className="w-5.5 h-1 bg-white" />
                {/* Lower shell */}
                <div className="w-6.5 h-1.5 bg-gradient-to-t from-[#FDA4AF] to-[#E28392] rounded-b-full" />
              </div>
            </motion.div>

            {/* Macaron 2 (Organic Pistachio Green Meringue) */}
            <motion.div 
              initial={{ scale: 0, x: 20, y: -7, rotate: 15 }}
              animate={{ scale: 1, x: 20, y: -7, rotate: 15 }}
              className="absolute flex flex-col items-center pointer-events-none"
            >
              <div className="flex flex-col items-center select-none shadow-sm filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)] scale-[0.82]">
                <div className="w-6.5 h-2 bg-gradient-to-b from-[#A7F3D0] to-[#6EE7B7] rounded-t-full border-b-[0.5px] border-emerald-300" />
                <div className="w-[27px] h-[2px] bg-[#059669]/70 border-y-[0.2px] border-white/20" />
                <div className="w-5.5 h-1 bg-[#10B981]" />
                <div className="w-6.5 h-1.5 bg-gradient-to-t from-[#A7F3D0] to-[#6EE7B7] rounded-b-full" />
              </div>
            </motion.div>

            {/* Macaron 3 (Classic Rich Vanilla Ivory Meringue) */}
            <motion.div 
              initial={{ scale: 0, x: 0, y: -13, rotate: -3 }}
              animate={{ scale: 1, x: 0, y: -13, rotate: -3 }}
              className="absolute flex flex-col items-center pointer-events-none z-10"
            >
              <div className="flex flex-col items-center select-none shadow-md filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)] scale-[0.9]">
                <div className="w-6.5 h-2 bg-gradient-to-b from-[#FEF3C7] to-[#FCD34D] rounded-t-full border-b-[0.5px] border-amber-300" />
                <div className="w-[27px] h-[2px] bg-[#D97706]/70 border-y-[0.2px] border-white/20" />
                <div className="w-5.5 h-1 bg-white" />
                <div className="w-6.5 h-1.5 bg-gradient-to-t from-[#FEF3C7] to-[#FCD34D] rounded-b-full" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Handcrafted Sugar Rosettes */}
        {topping === 'Flowers' && (
          <div className="absolute inset-0 flex justify-center items-center overflow-visible">
            {/* Primary Big Sugar Rose */}
            <motion.div 
              initial={{ scale: 0, x: -14, y: -11, rotate: -10 }} 
              animate={{ scale: 1, x: -14, y: -11, rotate: -10 }} 
              className="absolute pointer-events-none z-10"
            >
              <div className="relative w-8 h-8 flex items-center justify-center font-sans">
                {/* Double green backing tea leaves */}
                <span className="absolute w-8 h-3.5 bg-emerald-600 rounded-full border border-emerald-555 block rotate-45 transform" style={{ transformOrigin: 'center' }} />
                <span className="absolute w-8 h-3.5 bg-emerald-600 rounded-full border border-emerald-555 block -rotate-30 transform" style={{ transformOrigin: 'center' }} />
                
                {/* 3D Rose Petals Spiral */}
                <div className="w-7 h-7 bg-gradient-to-br from-pink-300 via-rose-450 to-rose-600 rounded-full border border-pink-200 flex items-center justify-center shadow-xs">
                  {/* Outer petal layers */}
                  <div className="w-5.5 h-5.5 bg-gradient-to-br from-pink-200 to-rose-500 rounded-full border border-pink-300 flex items-center justify-center rotate-45">
                    {/* Inner petal layers */}
                    <div className="w-4 h-4 bg-gradient-to-br from-rose-100 to-rose-450 rounded-full border border-pink-250 flex items-center justify-center -rotate-12">
                      {/* Rose sweet tight core bud */}
                      <div className="w-2.5 h-2.5 bg-rose-550 rounded-full border border-rose-350 shadow-inner flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full opacity-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary companion rosebud */}
            <motion.div 
              initial={{ scale: 0, x: 13, y: -8, rotate: 18 }} 
              animate={{ scale: 1, x: 13, y: -8, rotate: 18 }} 
              className="absolute pointer-events-none"
            >
              <div className="relative w-6.5 h-6.5 flex items-center justify-center">
                <span className="absolute w-6 h-2.5 bg-emerald-700 rounded-full block rotate-12" />
                <div className="w-5.5 h-5.5 bg-gradient-to-br from-pink-250 to-rose-400 rounded-full border border-pink-150 flex items-center justify-center shadow-xs">
                  <div className="w-3.5 h-3.5 bg-gradient-to-tr from-rose-100 to-rose-550 rounded-full border border-pink-300 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-rose-650 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-3">
      {/* Dynamic Keyframes Injector */}
      <style>{`
        @keyframes swayAnimation {
          0% { transform: scale(1) rotate(-1.5deg) translateY(0); }
          50% { transform: scale(1.01) rotate(1.5deg) translateY(-2px); }
          100% { transform: scale(1) rotate(-1.5deg) translateY(0); }
        }
        @keyframes shimmerGlazeAnimate {
          0% { background-position: -200% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes pulseFlicker {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: brightness(1); }
          50% { transform: scale(1.15) rotate(2deg); filter: brightness(1.25); }
        }
        .sway-hover-box {
          animation: swayAnimation 6s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200/80 flex flex-col md:flex-row max-h-[92vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden">
        
        {/* Left Interactive Cake Visualizer Side */}
        <div className="md:w-5/12 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-200/50 p-3 sm:p-5 md:p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-stone-200 relative overflow-hidden shrink-0 h-[175px] sm:h-[220px] md:h-auto max-md:sticky max-md:top-0 max-md:z-20 max-md:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          
          {/* Visual abstract background accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100/40 rounded-full blur-2xl z-0" />
          <div className="absolute bottom-10 right-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl z-0" />

          <div className="w-full flex justify-between items-center z-10">
            <span className="bg-rose-50/90 text-rose-600 text-[10px] sm:text-xs font-black tracking-wider px-3 py-1.5 rounded-full border border-rose-100 flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-300 animate-pulse" />
              {language === 'hy' ? 'ՔԱՂՑՐ ՍԻՄՈՒԼԱՏՈՐ' : '3D CAKE BUILDER'}
            </span>

            {/* Interactive rotation control toggle */}
            <button
              type="button"
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                isRotating 
                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-605 hover:bg-stone-50'
              }`}
              title={language === 'hy' ? 'Ակտիվացնել Շարժը' : 'Toggle Sweet Sway'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline text-[9px]">{language === 'hy' ? 'Շարժ' : 'Sway'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSliceOpen(!sliceOpen)}
              className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                sliceOpen 
                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-605 hover:bg-stone-50'
              }`}
              title={language === 'hy' ? 'Բացել շերտերը / Տեսնել ներքին կառուցվածքը' : 'Toggle Slice inside view'}
            >
              <span className="text-xs">🍰</span>
              <span className="hidden sm:inline text-[9px]">{language === 'hy' ? 'Կտրվածք' : 'Slice View'}</span>
            </button>
          </div>

          <div className="my-0.5 sm:my-3 md:my-14 relative w-full flex flex-col items-center justify-center z-10">
            
            {/* Interactive Cake 3D-effect Stand & Platter */}
            <div 
              className={`scale-[0.52] sm:scale-75 md:scale-100 origin-center -my-13 sm:-my-6 md:my-0 w-64 h-64 relative flex items-center justify-center transition-all duration-300 ${
                isRotating ? 'sway-hover-box' : ''
              }`}
            >
              
              {/* Elegant Pedestal Stand and Platter */}
              <div className="absolute bottom-5 w-48 h-2.5 bg-gradient-to-r from-amber-600 via-yellow-450 to-amber-700 rounded-full shadow-lg z-0 opacity-80" />
              <div className="absolute bottom-0 w-20 h-6 bg-gradient-to-b from-yellow-350 via-amber-650 to-amber-950 rounded-b-2xl shadow-inner z-0 border-x border-amber-500/15" />
              {/* Main Platter with beautiful golden trim and radial brushed plate */}
              <div className="absolute bottom-[20px] w-52 h-4.5 bg-gradient-to-r from-[#DFBA73] via-[#FEF0D9] to-[#D5A754] border border-amber-300 rounded-2xl shadow-xl z-10">
                {/* Brushed reflection inside platter */}
                <div className="absolute inset-x-2 top-[1px] bottom-[2px] bg-gradient-to-r from-transparent via-[#FFF9F0]/60 to-transparent rounded-xl" />
              </div>

              {/* Glowing particles / sweet sparkles float animation */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-10 left-10 w-2 h-2 bg-pink-350 rounded-full animate-ping opacity-60" />
                <div className="absolute top-24 right-8 w-1.5 h-1.5 bg-yellow-405 rounded-full animate-bounce opacity-75" />
                <div className="absolute top-[40%] left-4 w-1 h-1 bg-amber-305 rounded-full animate-pulse opacity-90" />
              </div>

              {/* DYNAMIC TIERS BUILDER (Stacked using beautiful CSS relative dimensions) */}
              <div className="absolute bottom-[24px] z-20 flex flex-col items-center justify-end w-full h-[180px] pointer-events-none">
                
                {/* 1. TOP TIER (Always present, sits at the very top) */}
                <div 
                  className="relative transition-all duration-500 flex flex-col justify-end"
                  style={{ 
                    width: weight === 1.5 ? '146px' : weight === 3 ? '112px' : '92px', 
                    height: weight === 1.5 ? '56px' : '40px', 
                    zIndex: 30 
                  }}
                >
                  {/* Cylindrical Side Face */}
                  <div 
                    className="absolute inset-0 border-x border-b border-stone-200/20 transition-all duration-500"
                    style={{
                      ...getSideFaceStyle(),
                      borderRadius: '0 0 12px 12px'
                    }}
                  >
                    <div className="absolute inset-0 rounded-b-lg pointer-events-none z-15 bg-gradient-to-r from-black/12 via-transparent via-15% to-black/25 opacity-70" style={{ borderRadius: '0 0 12px 12px' }} />
                    <div className="absolute inset-x-2.5 top-0 bottom-1 pointer-events-none z-15 bg-gradient-to-r from-white/10 to-transparent via-12% opacity-50" />
                    
                    {getGlazeOverlay()}
                    {renderSyrupDrips(weight === 1.5 ? 146 : weight === 3 ? 112 : 92)}
                    {renderWhippedBorders(weight === 1.5 ? 146 : weight === 3 ? 112 : 92)}
                    {renderRoyalLace()}
                    
                    {/* Missing Slice biscuit layers exposes textured sponge structure */}
                    {sliceOpen && (
                      <div className="absolute inset-y-1 left-[25%] right-[25%] rounded bg-stone-900/5 shadow-inner overflow-hidden flex flex-col justify-between p-[1.5px] z-10 border border-black/5">
                        <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                        <div className={`w-full h-[16%] bg-gradient-to-r ${getFillingColor()} rounded-sm flex items-center justify-around opacity-95 shadow-inner`} />
                        <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                      </div>
                    )}
                  </div>
                  
                  {/* 3D Ellipse surface face represents the round top frosted flat lip */}
                  <div 
                    className="absolute -top-[5px] left-0 right-0 h-[10px] rounded-full border border-stone-250/10 z-20 transition-all duration-500 shadow-xs"
                    style={{
                      backgroundColor: selectedHex,
                      backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)'
                    }}
                  >
                    {/* Reflective specularity of mirror glaze style */}
                    {decorationStyle === 'Sparkly Glaze' && (
                      <div className="absolute inset-0.5 rounded-full bg-white/25 pointer-events-none mix-blend-overlay animate-pulse" />
                    )}
                    
                    {/* Render High-Fidelity interactive Toppings directly on top surface flat disk */}
                    {renderToppingsVisual()}
                    {renderSprinklesVisual(weight === 1.5 ? 146 : weight === 3 ? 112 : 92)}
                  </div>

                  {/* Dynamic Sparkler fireworks particle animation */}
                  {hasSparkler && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-[45] transition-all duration-300 pointer-events-none" style={{ top: '-42px' }}>
                      {/* Core intense white sparkler tip */}
                      <div className="relative w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_6px_rgba(253,224,71,1)] animate-ping" />
                      
                      {/* Animated spark particles blasting upwards and outwards */}
                      <div className="absolute -top-12 flex justify-center items-center pointer-events-none w-24 h-24">
                        {Array.from({ length: 14 }).map((_, sp) => {
                          const angleStr = `${(sp * 360) / 14}deg`;
                          const animName = `spark-emit-${sp}`;
                          return (
                            <div 
                              key={sp}
                              className="absolute w-1 h-1 bg-amber-300 rounded-full animate-ping"
                              style={{
                                animation: `${animName} 0.8s ease-out infinite`,
                                animationDelay: `${(sp % 3) * 0.12}s`,
                                transformOrigin: 'bottom center',
                              }}
                            >
                              <style>{`
                                @keyframes ${animName} {
                                  0% { transform: rotate(${angleStr}) translateY(0) scale(1.2); opacity: 1; filter: brightness(2); }
                                  70% { transform: rotate(${angleStr}) translateY(${-16 - (sp % 4) * 6}px) scale(0.7); opacity: 0.9; }
                                  100% { transform: rotate(${angleStr}) translateY(${-24 - (sp % 4) * 9}px) scale(0); opacity: 0; }
                                }
                              `}</style>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Sparkler stick */}
                      <div className="w-[1.2px] h-10 bg-gradient-to-b from-stone-400 to-stone-600 rounded-b-xs shadow-xs" style={{ transform: 'translateY(-2px)' }} />
                    </div>
                  )}

                  {/* 3D Candles Simulation stacked gracefully on top tier top surface */}
                  {candlesCount > 0 && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 flex gap-1 justify-center z-40 transition-all duration-300 animate-[bounce_0.5s_ease-out_1]"
                      style={{ 
                        top: '-20px', 
                        height: '22px'
                      }}
                    >
                      {Array.from({ length: Math.min(candlesCount, 8) }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                           {/* Flickering flame with warm light shadow */}
                          <div 
                            className="w-2.5 h-3 bg-gradient-to-b from-orange-400 via-amber-300 to-transparent rounded-full shadow-lg shadow-orange-500/60"
                            style={{ 
                              animation: 'pulseFlicker 1s ease-in-out infinite',
                              animationDelay: `${i * 0.15}s`
                            }}
                          />
                          {/* Candle wick */}
                          <div className="w-[1.2px] h-[3px] bg-stone-900" />
                          {/* Striped party candle */}
                          <div 
                            className="w-1.5 h-6 rounded-b-[2px] shadow-xs" 
                            style={{
                              backgroundImage: i % 2 === 0 
                                ? 'repeating-linear-gradient(45deg, #FF6F91, #FF6F91 2px, #FFFFFF 2px, #FFFFFF 4px)' 
                                : 'repeating-linear-gradient(45deg, #4D96FF, #4D96FF 2px, #FFFFFF 2px, #FFFFFF 4px)'
                            }}
                          />
                        </div>
                      ))}
                      {candlesCount > 8 && (
                        <span className="text-[8px] text-stone-900 font-black bg-yellow-200 border border-yellow-300 px-1 py-0.2 rounded-md self-end mb-1 shadow-xs font-mono">
                          +{candlesCount - 8}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. MIDDLE TIER (Shown only for 3kg and 5kg) */}
                {(weight === 3 || weight === 5) && (
                  <div 
                    className="relative transition-all duration-500 flex flex-col justify-end -mt-[7px]"
                    style={{ 
                      width: weight === 3 ? '154px' : '124px', 
                      height: '44px', 
                      zIndex: 20 
                    }}
                  >
                    {/* Cylindrical Side Face */}
                    <div 
                      className="absolute inset-0 border-x border-b border-stone-200/20 transition-all duration-500"
                      style={{
                        ...getSideFaceStyle(),
                        borderRadius: '0 0 14px 14px'
                      }}
                    >
                      <div className="absolute inset-0 rounded-b-xl pointer-events-none z-15 bg-gradient-to-r from-black/12 via-transparent via-15% to-black/25 opacity-70" style={{ borderRadius: '0 0 14px 14px' }} />
                      <div className="absolute inset-x-3 top-0 bottom-1 pointer-events-none z-15 bg-gradient-to-r from-white/10 to-transparent via-12% opacity-50" />
                      
                      {getGlazeOverlay()}
                      {renderSyrupDrips(weight === 3 ? 154 : 124)}
                      {renderWhippedBorders(weight === 3 ? 154 : 124)}
                      {renderRoyalLace()}

                      {sliceOpen && (
                        <div className="absolute inset-y-1 left-[20%] right-[20%] rounded bg-stone-900/5 shadow-inner overflow-hidden flex flex-col justify-between p-[1.5px] z-10 border border-black/5">
                          <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                          <div className={`w-full h-[16%] bg-gradient-to-r ${getFillingColor()} rounded-sm flex items-center justify-around opacity-95 shadow-inner`} />
                          <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                        </div>
                      )}
                    </div>
                    {/* Top 3D Ellipse face */}
                    <div 
                      className="absolute -top-[6px] left-0 right-0 h-[12px] rounded-full border border-stone-250/10 z-20 transition-all duration-500 shadow-xs"
                      style={{
                        backgroundColor: selectedHex,
                        backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)'
                      }}
                    >
                      {renderSprinklesVisual(weight === 3 ? 154 : 124)}
                    </div>
                  </div>
                )}

                {/* 3. BOTTOM TIER (Shown only for 5kg) */}
                {weight === 5 && (
                  <div 
                    className="relative transition-all duration-500 flex flex-col justify-end -mt-[7px]"
                    style={{ width: '164px', height: '48px', zIndex: 10 }}
                  >
                    {/* Cylindrical Side Face */}
                    <div 
                      className="absolute inset-0 border-x border-b border-stone-200/20 transition-all duration-500"
                      style={{
                        ...getSideFaceStyle(),
                        borderRadius: '0 0 16px 16px'
                      }}
                    >
                      {/* Cylindrical shading */}
                      <div className="absolute inset-0 rounded-b-2xl pointer-events-none z-15 bg-gradient-to-r from-black/12 via-transparent via-15% to-black/25 opacity-70" style={{ borderRadius: '0 0 16px 16px' }} />
                      <div className="absolute inset-x-3 top-0 bottom-1 pointer-events-none z-15 bg-gradient-to-r from-white/10 to-transparent via-12% opacity-50" />
                      
                      {getGlazeOverlay()}
                      {renderSyrupDrips(164)}
                      {renderWhippedBorders(164)}
                      {renderRoyalLace()}

                      {/* Expose internal sponge texture with porous detailing */}
                      {sliceOpen && (
                        <div className="absolute inset-y-1.5 left-[15%] right-[15%] rounded bg-stone-900/5 shadow-inner overflow-hidden flex flex-col justify-between p-[2px] z-10 border border-black/5">
                          <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                          <div className={`w-full h-[16%] bg-gradient-to-r ${getFillingColor()} rounded-sm flex items-center justify-around opacity-95 shadow-inner`} />
                          <div className={`w-full h-[35%] bg-gradient-to-r ${getSpongeColor()} rounded-sm relative`} style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 0.6px, transparent 0.6px)', backgroundSize: '2.5px 2.5px' }} />
                        </div>
                      )}
                    </div>
                    {/* Top flat ellipse surface of cylinder */}
                    <div 
                      className="absolute -top-[7px] left-0 right-0 h-[14px] rounded-full border border-stone-250/10 z-20 transition-all duration-500 shadow-xs"
                      style={{
                        backgroundColor: selectedHex,
                        backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.06) 100%)'
                      }}
                    >
                      {renderSprinklesVisual(164)}
                    </div>
                  </div>
                )}

              </div>

              {/* Inscription Placard Badge - Beautifully floating down front of the plate */}
              {inscription && (
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300 font-serif font-black italic text-[11px] text-amber-700 px-4 py-1.5 rounded-full shadow-lg text-center z-40 max-w-[190px] select-none break-all line-clamp-1 border-dashed">
                  ✒️ {inscription}
                </div>
              )}

            </div>

            {/* Customizer design specification summary */}
            <div className="mt-4 text-center w-full px-4 hidden md:block">
              <p className="text-xs font-serif font-black text-stone-800 tracking-wide uppercase">
                {language === 'hy' ? 'ՁԵՐ ՆԱԽԱԳԻԾԸ' : 'YOUR CAKE SPECS'}
              </p>
              
              <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                <span className="bg-white text-[10px] text-stone-605 font-bold px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs">
                  ⚖️ {weight} Kɢ
                </span>
                <span className="bg-white text-[10px] text-stone-750 font-bold px-2.5 py-1 rounded-lg border border-[#EBE3D5] shadow-xs">
                  🥮 {sponges.find(s=>s.key === sponge)?.hy.split(' ')[0] || sponge}
                </span>
                <span className="bg-white text-[10px] text-rose-600 font-bold px-2.5 py-1 rounded-lg border border-rose-100 shadow-xs">
                  🍒 {fillings.find(f=>f.key === filling)?.hy.split(' ')[0] || filling}
                </span>
              </div>
            </div>

          </div>

          <div className="w-full flex items-center justify-center gap-2 text-[11px] text-stone-605 font-bold bg-white/90 border border-stone-200 px-4 py-2 rounded-2xl shadow-xs hidden md:flex">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-heartbeat" />
            <span>{language === 'hy' ? '100% Էկոլոգիապես մաքուր հումքով' : '100% Bio & Organic Ingredients'}</span>
          </div>

        </div>

        {/* Right Configuration Panels */}
        <div className="md:w-7/12 p-5 sm:p-6 flex flex-col md:justify-between bg-white flex-1 min-h-0 md:overflow-hidden overflow-visible" id="customizer-options-panel">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-stone-100">
            <div>
              <span className="bg-amber-150 border border-amber-200 text-amber-800 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                {language === 'hy' ? 'ԱՆՀԱՏԱԿԱՆ ՁԵՎԱՎՈՐՈՒՄ' : 'EXQUISITE TAILORING'}
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-black text-stone-900 mt-1 leading-tight">
                {t.customizationTitle}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {language === 'hy' ? 'Անհատական Տորթ' : 'Custom Cake'} • {product.price.toLocaleString()} {t.amd} ({language === 'hy' ? 'բազային արժեք' : 'base price'})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50/60 transition cursor-pointer border border-transparent hover:border-rose-100"
              id="close-customizer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrolled Content Configuration Layer */}
          <div className="space-y-6 my-4 flex-none md:flex-1 pr-1 md:overflow-y-auto overflow-visible scrollbar-thin">
            
            {/* 1. Weight Choices (1.5, 3.0, 5.0) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {t.weight}
                </label>
                <span className="text-[10px] text-stone-400 font-bold font-mono">
                  {language === 'hy' ? 'Փոխում է հարկերի քանակը' : 'Determines tiers count'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[1.5, 3, 5].map((w) => {
                  const isSelected = weight === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeight(w)}
                      className={`p-3 rounded-2xl text-left border transition-all duration-300 cursor-pointer flex justify-between items-center sm:block relative ${
                        isSelected
                          ? 'bg-rose-50/40 border-rose-600 ring-1 ring-rose-450 text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200/80 hover:bg-stone-50/80 text-stone-600'
                      }`}
                      id={`weight-btn-${w}`}
                    >
                      <div>
                        <span className="text-xs font-black block tracking-wide">{w} Kɢ</span>
                        <span className="text-[9px] opacity-80 font-medium block mt-0.5 max-w-[130px] leading-tight text-stone-500">
                          {w === 1.5 ? '1 Tier (5-8 guests)' : w === 3 ? '2 Tiers (10-15 guests)' : '3 Tiers (20-30 guests)'}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sponge Base Choices */}
            <div>
              <label className="block text-[11px] font-black text-stone-700 uppercase tracking-widest mb-2">
                {t.sponge}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sponges.map((s) => {
                  const isSelected = sponge === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSponge(s.key)}
                      className={`p-2.5 px-3 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                      id={`sponge-btn-${s.key.replace(/\s+/g, '')}`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif block font-bold text-[11.5px] text-stone-800">
                          {language === 'hy' ? s.hy : s.en}
                        </span>
                        <span className="text-[9px] text-stone-400 font-normal block leading-none">
                          {language === 'hy' ? s.descHy : s.descEn}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 bg-rose-600 text-white rounded-full p-0.5 ml-2">
                          <Check className="w-2.5 h-2.5 hover:scale-110" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Gourmet Fillings */}
            <div>
              <label className="block text-[11px] font-black text-stone-750 uppercase tracking-widest mb-2">
                {t.filling}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {fillings.map((f) => {
                  const isSelected = filling === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilling(f.key)}
                      className={`p-2.5 px-3.5 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-150/80 hover:bg-stone-50 text-stone-605'
                      }`}
                      id={`filling-btn-${f.key.replace(/\s+/g, '')}`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif block font-black text-[11.5px] text-stone-850">
                          {language === 'hy' ? f.hy : f.en}
                        </span>
                        <span className="text-[9px] text-stone-400 font-normal block">
                          {language === 'hy' ? f.descHy : f.descEn}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="bg-rose-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Frosting Cream Color */}
            <div>
              <label className="block text-[11px] font-black text-stone-700 uppercase tracking-widest mb-1.5">
                {t.creamColor}
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const isSelected = creamColor === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCreamColor(c.key)}
                      className={`flex items-center space-x-2.5 p-2 pr-4 rounded-xl border text-xs transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50'
                      }`}
                      id={`color-btn-${c.key}`}
                    >
                      <span 
                        className={`w-6 h-6 rounded-lg border ${c.border} shadow-inner block transition-transform duration-300 ${isSelected ? 'scale-110 rotate-3' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-left">
                        <span className="text-stone-800 text-[10.5px] font-bold block leading-none">
                          {language === 'hy' ? c.hy : c.en}
                        </span>
                        <span className="text-[8px] text-stone-400 font-normal block mt-0.5 leading-none">
                          {language === 'hy' ? c.descHy : c.descEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4.5. Premium Designer Toppings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {language === 'hy' ? 'Դիզայներական Հավելումներ' : 'Designer Toppings'}
                </label>
                <span className="text-[9px] text-stone-400 font-bold">
                  {language === 'hy' ? 'Ընտրեք տեսողական շքեղությունը' : 'Visual excellence toppings'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {toppings.map((tItem) => {
                  const isSelected = topping === tItem.key;
                  return (
                    <button
                      key={tItem.key}
                      type="button"
                      onClick={() => setTopping(tItem.key)}
                      className={`p-2.5 px-3 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                      id={`topping-btn-${tItem.key}`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif block font-bold text-[11.5px] text-stone-800">
                          {language === 'hy' ? tItem.hy : tItem.en}
                        </span>
                        <span className="text-[9px] text-stone-400 font-normal block leading-none">
                          {language === 'hy' ? tItem.descHy : tItem.descEn}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 bg-rose-600 text-white rounded-full p-0.5 ml-2">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4.6. Premium Design Border Styles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {language === 'hy' ? 'Կառուցվածքային Ոճավորում' : 'Structural Styling'}
                </label>
                <span className="text-[9px] text-stone-400 font-bold">
                  {language === 'hy' ? 'Տորթի եզրերի և տեքստուրայի ոճավորում' : 'Piping and glaze texture'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {decorationStyles.map((dItem) => {
                  const isSelected = decorationStyle === dItem.key;
                  return (
                    <button
                      key={dItem.key}
                      type="button"
                      onClick={() => setDecorationStyle(dItem.key)}
                      className={`p-2.5 px-3 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                      id={`decStyle-btn-${dItem.key.replace(/\s+/g, '')}`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif block font-bold text-[11.5px] text-stone-800">
                          {language === 'hy' ? dItem.hy : dItem.en}
                        </span>
                        <span className="text-[9px] text-stone-400 font-normal block leading-none">
                          {language === 'hy' ? dItem.descHy : dItem.descEn}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 bg-rose-600 text-white rounded-full p-0.5 ml-2">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4.7. Frosting Finish Texture */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {language === 'hy' ? 'Կրեմի Տեքստուրա' : 'Frosting Texture'}
                </label>
                <span className="text-[9px] text-stone-400 font-bold">
                  {language === 'hy' ? 'Երեսպատման արտաքին մակերես' : 'Buttercream surface texture'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: 'Smooth', hy: 'Հարթ 🧈', en: 'Smooth 🧈', descHy: 'Դասական մանիկյուր', descEn: 'Classic clean coat', price: 0 },
                  { key: 'Swirls', hy: 'Ալիքաձև 🌀 (+400 ֏)', en: 'Ribbed Swirls 🌀 (+400 AMD)', descHy: 'Սպատուլայի ալիքներ', descEn: 'Artisan spatula swirls', price: 400 },
                  { key: 'Naked', hy: 'Կիսաբաց 🌿', en: 'Naked Cake 🌿', descHy: 'Երևացող բիսկվիտ', descEn: 'Modern rustic scraping', price: 0 }
                ].map((txt) => {
                  const isSelected = frostingTexture === txt.key;
                  return (
                    <button
                      key={txt.key}
                      type="button"
                      onClick={() => setFrostingTexture(txt.key)}
                      className={`p-2.5 px-3 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer flex flex-col justify-between h-14 ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-955 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                      id={`texture-btn-${txt.key}`}
                    >
                      <span className="font-serif block font-bold text-[11px] leading-tight">
                        {language === 'hy' ? txt.hy : txt.en}
                      </span>
                      <span className="text-[8.5px] text-stone-400 font-normal block leading-none truncate w-full">
                        {language === 'hy' ? txt.descHy : txt.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4.8. Gourmet Edible Sprinkles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {language === 'hy' ? 'Գունավոր Շաղախներ' : 'Edible Sprinkles'}
                </label>
                <span className="text-[9px] text-stone-400 font-bold">
                  {language === 'hy' ? 'Շաղ տրված ուտելի դեկոր' : 'Scattered edible toppings'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'None', hy: 'Առանց ✨', en: 'None ✨', price: 0 },
                  { key: 'Pearls', hy: 'Մարգարիտ ⚪ (+300 ֏)', en: 'Pearls ⚪ (+300 ֏)', price: 300 },
                  { key: 'Confetti', hy: 'Կոնֆետտի 🎉 (+300 ֏)', en: 'Confetti 🎉 (+300 ֏)', price: 300 },
                  { key: 'Stars', hy: 'Աստղիկներ ⭐ (+450 ֏)', en: 'Stars ⭐ (+450 ֏)', price: 450 }
                ].map((spr) => {
                  const isSelected = sprinkles === spr.key;
                  return (
                    <button
                      key={spr.key}
                      type="button"
                      onClick={() => setSprinkles(spr.key)}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-rose-50/20 border-rose-600 font-bold text-rose-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                      id={`sprinkles-btn-${spr.key}`}
                    >
                      <span className="font-serif block font-bold text-[10.5px] leading-none text-center">
                        {language === 'hy' ? spr.hy : spr.en}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4.9. Festive Sparkler Candle Toggle */}
            <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/20 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-pulse animate-duration-1000">✨</span>
                <div>
                  <h4 className="text-[11px] font-black text-amber-955 uppercase tracking-wider block leading-tight">
                    {language === 'hy' ? 'Շողշողացող Մոմ-Հրավառություն' : 'Deluxe Sparkler Candle'}
                  </h4>
                  <p className="text-[9px] text-amber-800 leading-tight block mt-0.5 max-w-[200px]">
                    {language === 'hy' 
                      ? 'Տորթի կենտրոնում հրավառության մոմ, որը շաղ է տալիս կայծեր (+1,200 ֏)' 
                      : 'Flickering golden fountain sparkler candle in center (+1200 AMD)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasSparkler(!hasSparkler)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer flex items-center relative ${
                  hasSparkler ? 'bg-amber-500' : 'bg-stone-200'
                }`}
                id="sparkler-toggle-btn"
              >
                <span 
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 block ${
                    hasSparkler ? 'translate-x-6' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            {/* 5. Custom Cursive Inscription */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {t.inscription}
                </label>
                <span className="text-[9px] text-stone-400 font-bold">
                  {inscription.length}/40 {language === 'hy' ? 'սիմվոլ' : 'chars'}
                </span>
              </div>
              <input
                type="text"
                maxLength={40}
                value={inscription}
                onChange={(e) => setInscription(e.target.value)}
                placeholder={t.inscriptionPlaceholder}
                className="block w-full px-4 py-3 border border-stone-200 rounded-2xl text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 shadow-xs font-serif italic"
                id="inscription-input"
              />
            </div>

            {/* 6. Candle Count Counter */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest">
                  {t.candlesCount}
                </label>
                <span className="text-[9px] text-stone-300 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {language === 'hy' ? 'ԱՆՎՃԱՐ' : 'FREE'}
                </span>
              </div>
              <div className="flex items-center bg-stone-50 border border-stone-150 p-3 rounded-2xl w-full sm:w-auto inline-flex">
                <div className="flex items-center space-x-3 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCandlesCount(prev => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-150 flex items-center justify-center font-black hover:bg-gray-100 text-stone-700 active:scale-90 transition-transform cursor-pointer"
                    id="candles-dec-btn"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-black w-6 text-center text-stone-850">{candlesCount}</span>
                  <button
                    type="button"
                    onClick={() => setCandlesCount(prev => Math.min(100, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-150 flex items-center justify-center font-black hover:bg-gray-100 text-stone-700 active:scale-90 transition-transform cursor-pointer"
                    id="candles-inc-btn"
                  >
                    +
                  </button>
                </div>
                <div className="ml-3">
                  <span className="text-[10px] text-stone-500 font-bold block leading-none">
                    {language === 'hy' ? 'Քաղցր մոմիկներ' : 'Party candles'}
                  </span>
                  <span className="text-[8px] text-stone-400 font-medium block mt-1">
                    {language === 'hy' ? 'Հարմար տեղադրվում է տորթի վրա' : 'Placed nicely on delivery cake'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-stone-400 block font-black uppercase tracking-widest">
                {language === 'hy' ? 'Հաշվարկված Արժեքը' : 'Configured Amount'}
              </span>
              <span className="text-md sm:text-xl font-black text-rose-600 font-mono">
                {finalPrice.toLocaleString()} {t.amd}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-750 font-black text-[11px] sm:text-xs rounded-xl transition cursor-pointer select-none"
                id="cancel-customizer-btn"
              >
                {language === 'hy' ? 'Չեղարկել' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 bg-stone-900 hover:bg-rose-600 text-white font-black text-[11px] sm:text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center gap-1"
                id="add-custom-to-cart-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>{t.addToCart}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
