/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CartItem, Language, User } from '../types';
import { translations } from '../translations';
import { X, Trash2, Plus, Minus, Tag, CreditCard, ShoppingBag, Info } from 'lucide-react';

interface CartDrawerProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  currentUser: User | null;
  onAuthClick: () => void;
  promoInput: string;
  setPromoInput: (val: string) => void;
  discountPercent: number;
  promoFeedback: string;
  pasted: boolean;
  onApplyPromo: () => void;
}

export default function CartDrawer({
  language,
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currentUser,
  onAuthClick,
  promoInput,
  setPromoInput,
  discountPercent,
  promoFeedback,
  pasted,
  onApplyPromo,
}: CartDrawerProps) {
  const t = translations[language];

  // Body scroll lock on mount/unmount when drawer is open
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

  if (!isOpen) return null;

  // Calculators
  const subtotal = cartItems.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
  const deliveryFee = subtotal > 15000 ? 0 : subtotal === 0 ? 0 : 1000;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discountAmount + deliveryFee;

  const colorsHex: Record<string, string> = {
    'White': '#FFFFFF',
    'Pink': '#FBCFE8',
    'Pastel Blue': '#BFDBFE',
    'Chocolate': '#78350F'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-in relative border-l border-stone-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-serif font-bold text-stone-800">
              {t.cartTitle}
            </h2>
            <span className="bg-stone-200 text-stone-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition"
            id="close-cart-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item Cards list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 animate-pulse">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="text-stone-800 font-serif font-bold text-base">
                  {t.emptyCart}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {language === 'hy' 
                    ? 'Ավելացրեք մեր ախորժելի քաղցրավենիքները զամբյուղ՝ պատվեր ձևակերպելու համար։'
                    : 'Add our luscious sweets into the cart to construct an artisan order.'}
                </p>
              </div>
            </div>
          ) : (
            cartItems.map((item) => {
              const productName = item.customizations
                ? (language === 'hy' ? 'Անհատական Տորթ' : 'Custom Built Cake')
                : (language === 'hy' ? item.product.nameHy : item.product.nameEn);
              return (
                <div key={item.id} className="bg-stone-50 border border-stone-100/80 p-3 rounded-2xl flex gap-3 shadow-sm hover:shadow transition" id={`cart-item-${item.id}`}>
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={productName}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-stone-800 truncate">
                          {productName}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-500 transition p-0.5 rounded-md"
                          id={`del-item-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customized parameters preview */}
                      {item.customizations ? (
                        <div className="mt-1 text-[10px] text-stone-500 space-y-0.5 bg-white p-1.5 rounded-lg border border-stone-200">
                          <p className="font-semibold text-rose-600 uppercase tracking-wide text-[9px]">
                            ⚙️ {t.customized} ({item.customizations.weight} Kg)
                          </p>
                          <p>
                            🍞 {item.customizations.sponge} • 🍯 {item.customizations.filling}
                          </p>
                          {item.customizations.topping && item.customizations.topping !== 'None' && (
                            <p className="text-amber-700">
                              ✨ Topping: {
                                language === 'hy' 
                                  ? ({ Berries: 'Թարմ հատապտուղներ 🍓', GoldFlakes: 'Ուտելի ոսկու փաթիլներ ✨', ChocolateShavings: 'Շոկոլադե գանգուրներ 🍫', Macarons: 'Մակարոններ 🍬', Flowers: 'Շաքարե վարդեր 🌸' }[item.customizations.topping] || item.customizations.topping)
                                  : ({ Berries: 'Fresh Berries 🍓', GoldFlakes: 'Edible Gold ✨', ChocolateShavings: 'Chocolate Curls 🍫', Macarons: 'Mini Macarons 🍬', Flowers: 'Sugar Roses 🌸' }[item.customizations.topping] || item.customizations.topping)
                              }
                            </p>
                          )}
                          {item.customizations.decorationStyle && (
                            <p className="text-stone-750">
                              🎨 Style: {
                                language === 'hy'
                                  ? ({ Minimalist: 'Մինիմալիզմ 🕊️', Borders: 'Կրեմե եզրագծեր 🎂', 'Sparkly Glaze': 'Հայելային գլազուր ✨', 'Royal Vintage': 'Արքայական վինտաժ 👑' }[item.customizations.decorationStyle] || item.customizations.decorationStyle)
                                  : ({ Minimalist: 'Minimalist 🕊️', Borders: 'Classic Borders 🎂', 'Sparkly Glaze': 'Mirror Glaze ✨', 'Royal Vintage': 'Royal Vintage 👑' }[item.customizations.decorationStyle] || item.customizations.decorationStyle)
                              }
                            </p>
                          )}
                          {item.customizations.inscription && (
                            <p className="italic text-pink-700 font-semibold truncate leading-none mt-0.5">
                              ✍️ "{item.customizations.inscription}"
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: colorsHex[item.customizations.creamColor] || '#ffffff' }} />
                            <span>{item.customizations.creamColor}</span>
                            {item.customizations.candlesCount > 0 && (
                              <span>• 🕯️ {item.customizations.candlesCount} {language === 'hy' ? 'մոմ' : 'candles'}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic">
                          🌱 {t.standard}
                        </p>
                      )}
                    </div>

                    {/* Quantity & Unit Pricing Row */}
                    <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-stone-200/50">
                      <div className="flex items-center space-x-2.5 bg-white border border-stone-200 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md flex items-center justify-center text-xs font-bold disabled:opacity-50"
                          disabled={item.quantity <= 1}
                          id={`dec-qty-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md flex items-center justify-center text-xs font-bold"
                          id={`inc-qty-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[11px] font-extrabold text-stone-800 font-mono">
                        {(item.finalPrice * item.quantity).toLocaleString()} {t.amd}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Cart Calculations Drawer section */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
            
            {/* Promo coupon code entry */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>{language === 'hy' ? 'Առաջին պատվերի կոդ՝' : 'First order code:'}</span>
                <span className="font-bold text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded font-mono cursor-pointer hover:bg-rose-100 transition" title="Click to apply" onClick={() => setPromoInput('WELCOME10')}>
                  WELCOME10
                </span>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="WELCOME10 / SWEETARMENIA"
                    className="block w-full pl-8 pr-2 py-2 bg-white border border-stone-200 rounded-xl text-xs uppercase placeholder-stone-400 font-mono focus:outline-none focus:ring-1 focus:ring-rose-200"
                    id="promo-input"
                  />
                </div>
                <button
                  onClick={onApplyPromo}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                  id="promo-apply-btn"
                >
                  {t.applyPromo}
                </button>
              </div>
              {promoFeedback && (
                <p className={`text-[10px] font-bold ${pasted ? 'text-green-600' : 'text-rose-500'}`}>
                  {promoFeedback}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-mono font-medium">{subtotal.toLocaleString()} {t.amd}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>{language === 'hy' ? 'Զեղչ' : 'Discount'} ({discountPercent}%)</span>
                  <span className="font-mono">-{discountAmount.toLocaleString()} {t.amd}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.deliveryFee}</span>
                {deliveryFee === 0 ? (
                  <span className="text-green-600 font-extrabold uppercase text-[10px] tracking-wide">
                    {language === 'hy' ? 'Անվճար (15k֏+)' : 'Free (15k+)'}
                  </span>
                ) : (
                  <span className="font-mono">{deliveryFee.toLocaleString()} {t.amd}</span>
                )}
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-850 pt-2 border-t border-stone-200">
                <span>{language === 'hy' ? 'Ընդամենը' : 'Total Price'}</span>
                <span className="font-mono font-serif text-rose-600">{finalTotal.toLocaleString()} {t.amd}</span>
              </div>
            </div>

            {/* Checkouts button triggers */}
            {currentUser ? (
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                id="cart-checkout-btn"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.checkoutBtn}</span>
              </button>
            ) : (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100/60">
                <p className="text-[11px] text-amber-750 mb-2 font-medium flex gap-1 items-start leading-snug">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{t.loginFirst}</span>
                </p>
                <button
                  onClick={onAuthClick}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-lg transition"
                  id="checkout-login-trigger"
                >
                  {t.loginTab} / {t.registerTab}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
