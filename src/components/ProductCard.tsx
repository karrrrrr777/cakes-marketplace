/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { Star, Clock, ChevronRight, Sparkles } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
  onAskAI?: (product: Product) => void;
}

export default function ProductCard({
  product,
  language,
  onAddToCart,
  onCustomize,
  onAskAI,
}: ProductCardProps) {
  const t = translations[language];

  const name = language === 'hy' ? product.nameHy : product.nameEn;
  const description = language === 'hy' ? product.descriptionHy : product.descriptionEn;
  const prepTime = language === 'hy' ? product.preparationTimeHy : product.preparationTimeEn;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-100 hover:border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1" id={`product-${product.id}`}>
      {/* Product Image Area */}
      <div className="relative aspect-video sm:aspect-square overflow-hidden bg-stone-50/10">
        <img
          src={product.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Category Badge overlay */}
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md text-stone-600 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-stone-100 shadow-sm">
          {t[product.category]}
        </span>

        {/* Customizable overlay badge */}
        {product.isCustomizable && (
          <span className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            {t.customized}
          </span>
        )}
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Stars & Prep Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1 font-semibold text-amber-600 bg-amber-50/70 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
            </div>
            <div className="flex items-center space-x-1 bg-stone-100/85 px-2 py-0.5 rounded-lg text-stone-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{prepTime}</span>
            </div>
          </div>

          {/* Title Area */}
          <h3 className="font-serif text-lg font-bold text-stone-800 tracking-tight group-hover:text-rose-600 transition truncate">
            {name}
          </h3>

          {/* Description */}
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Action Button Row */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                {language === 'hy' ? 'Արժեքը' : 'Price'}
              </span>
              <span className="text-lg font-extrabold text-rose-600 font-mono">
                {product.price.toLocaleString()} {t.amd}
              </span>
            </div>

            <button
              onClick={() => onAskAI?.(product)}
              className="text-[11px] font-extrabold text-rose-600 hover:text-white flex items-center gap-1 bg-rose-50 hover:bg-rose-600 border border-rose-200/60 px-3 py-2 rounded-xl transition-all duration-300 transform active:scale-95 cursor-pointer shadow-xs"
              title="Ask AI Advisor about ingredients, sizes or allergies"
              id={`ask-ai-btn-${product.id}`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-500 fill-yellow-300" />
              <span>AI {language === 'hy' ? 'Հարցում' : 'Consult'}</span>
            </button>
          </div>

          <div className="w-full">
            {product.isCustomizable ? (
              <button
                onClick={() => onCustomize(product)}
                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-center transition duration-200 border border-stone-200"
                id={`customize-btn-${product.id}`}
              >
                <span>{t.customCakesMenu}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-stone-500" />
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-stone-900 hover:bg-rose-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition duration-200 shadow-sm text-center"
                id={`add-btn-${product.id}`}
              >
                {t.addToCart}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
