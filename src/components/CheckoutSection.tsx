/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem, Language, User, Order } from '../types';
import { translations } from '../translations';
import { ChevronLeft, Landmark, Send, Phone, MapPin, Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface CheckoutSectionProps {
  language: Language;
  cartItems: CartItem[];
  totalAmount: number;
  currentUser: User;
  onPlaceOrderSuccess: (order: Order, usedBonus: number, earnedBonus: number) => void;
  onCancel: () => void;
}

export default function CheckoutSection({
  language,
  cartItems,
  totalAmount,
  currentUser,
  onPlaceOrderSuccess,
  onCancel,
}: CheckoutSectionProps) {
  const t = translations[language];

  // Delivery states
  const [recipientName, setRecipientName] = useState(currentUser.fullName);
  const [recipientPhone, setRecipientPhone] = useState(currentUser.phone);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser.address);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Defaults to tomorrow
    return today.toISOString().split('T')[0];
  });
  const [deliveryTime, setDeliveryTime] = useState('14:00 - 17:00');

  // Bonus states
  const [useBonus, setUseBonus] = useState(false);
  const userBonus = currentUser.bonusBalance || 0;
  const bonusRedeemed = useBonus ? Math.min(userBonus, totalAmount) : 0;
  const finalPaymentAmount = Math.max(0, totalAmount - bonusRedeemed);
  const bonusEarned = Math.round(finalPaymentAmount * 0.003); // 0.3% bonus of final payment amount

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'idram' | 'cash'>('card');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser.fullName.toUpperCase());

  // App statuses
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');
  const [idramApproved, setIdramApproved] = useState(false);

  // Spacing helper for Credit Card Input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      setCardExpiry(value.substring(0, 2) + '/' + value.substring(2, 4));
    } else {
      setCardExpiry(value);
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCVV(e.target.value.replace(/[^0-9]/g, '').substring(0, 3));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!recipientName || !recipientPhone || !deliveryAddress || !deliveryDate || !deliveryTime) {
      setFormError(language === 'hy' ? 'Խնդրում ենք լրացնել առաքման բոլոր դաշտերը։' : 'Please fill all delivery details.');
      return;
    }

    if (finalPaymentAmount > 0) {
      if (paymentMethod === 'card') {
        if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCVV.length < 3) {
          setFormError(language === 'hy' ? 'Քարտային տվյալներն անկատար են կամ սխալ:' : 'Credit card credentials are incomplete or invalid.');
          return;
        }
      }

      if (paymentMethod === 'idram' && !idramApproved) {
        setFormError(language === 'hy' ? 'Խնդրում ենք հաստատել Իդրամ վճարումը QR կոդով:' : 'Please click on Approve Idram inside the simulator.');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate Payment delay (1.8 seconds)
    setTimeout(() => {
      const successfulOrder: Order = {
        id: "D_ORD_" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(language === 'hy' ? 'hy-AM' : 'en-US'),
        items: cartItems,
        totalAmount: finalPaymentAmount, // actual amount paid
        recipientName,
        recipientPhone,
        deliveryAddress,
        deliveryDate,
        deliveryTime,
        status: 'placed',
        paymentMethod: finalPaymentAmount === 0 ? 'cash' : paymentMethod, // bypass gateways if fully spent on points
        paymentCardInfo: (paymentMethod === 'card' && finalPaymentAmount > 0) ? { lastFour: cardNumber.substring(15) } : undefined,
        usedBonusPoints: bonusRedeemed,
        earnedBonusPoints: bonusEarned
      };

      onPlaceOrderSuccess(successfulOrder, bonusRedeemed, bonusEarned);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white border border-stone-150 rounded-3xl shadow-xl mt-6" id="checkout-section-root">
      
      {/* Back CTA */}
      <button
        onClick={onCancel}
        disabled={isProcessing}
        className="flex items-center space-x-1.5 text-stone-500 hover:text-stone-900 transition mb-6 font-bold text-xs cursor-pointer"
        id="checkout-back-btn"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t.backToHome}</span>
      </button>

      {/* Main Grid */}
      <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight mb-6">
        ✨ {t.checkoutTitle}
      </h2>

      {formError && (
        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs mb-6 font-semibold">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Delivery settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100 space-y-4">
            <h3 className="text-sm font-bold text-stone-800 border-b border-stone-100 pb-2 flex items-center space-x-2">
              <span className="w-5 h-5 bg-stone-900 rounded-full text-white text-[11px] flex items-center justify-center font-bold">1</span>
              <span>{t.stepDelivery}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.recipientName}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-stone-400 text-xs">👤</span>
                </div>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                  id="checkout-recipient-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.recipientPhone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                  id="checkout-recipient-phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.deliveryAddress}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                  id="checkout-delivery-address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.deliveryDate}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                    id="checkout-delivery-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.deliveryTime}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-stone-400" />
                  </div>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-200 h-9"
                    id="checkout-delivery-time"
                  >
                    <option value="10:00 - 13:00">10:00 - 13:00</option>
                    <option value="13:00 - 16:00">13:00 - 16:00 (Prime)</option>
                    <option value="16:00 - 19:00">16:00 - 19:00</option>
                    <option value="19:00 - 22:00">19:00 - 22:00</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

          {/* Right Side: Payment Simulation Gateways */}
          <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50/55 p-5 rounded-2xl border border-stone-100 space-y-4 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-bold text-stone-800 border-b border-stone-100 pb-2 flex items-center space-x-2">
                <span className="w-5 h-5 bg-stone-900 rounded-full text-white text-[11px] flex items-center justify-center font-bold">2</span>
                <span>{t.stepPayment}</span>
              </h3>

              {/* Luxury Bonus Points Redemption Box */}
              <div className="my-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2.5xl p-4 shadow-md border border-stone-700 flex flex-col justify-between relative overflow-hidden">
                <span className="absolute -top-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px]">⭐️</span>
                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-300">
                      {t.bonusAccount}
                    </span>
                  </div>
                  <span className="text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full text-white font-bold">
                    {t.availableBonuses}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-serif font-black text-rose-300">{userBonus.toLocaleString()}</span>
                  <span className="text-[9px] text-stone-300 font-bold">{translations[language].amd}</span>
                </div>

                {userBonus > 0 ? (
                  <label className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl transition cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useBonus}
                      onChange={(e) => setUseBonus(e.target.checked)}
                      className="mt-0.5 rounded border-stone-600 text-rose-500 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer accent-rose-500"
                    />
                    <div className="text-left">
                      <span className="text-[10px] font-bold block text-stone-100 leading-tight">
                        {t.useBonusPoints}
                      </span>
                      {useBonus && (
                        <span className="text-[9px] text-green-300 font-bold block mt-0.5">
                          -{bonusRedeemed.toLocaleString()} {t.amd}
                        </span>
                      )}
                    </div>
                  </label>
                ) : (
                  <p className="text-[10px] text-stone-400 italic leading-snug">
                    {language === 'hy' ? 'Կատարեք Ձեր առաջին գնումը և ստացեք 0,3% հետվճար (բոնուս) յուրաքանչյուր պատվերից։' : 'Place an order to start accumulating 0.3% cashback points automatically!'}
                  </p>
                )}
              </div>

              {/* Hide Payment Selectors if fully paid by Bonus */}
              {finalPaymentAmount > 0 ? (
                <>
                  {/* Payment Methods tabs selector */}
                  <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-stone-200 my-4 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                      id="pay-method-card"
                    >
                      {language === 'hy' ? 'Քարտ' : 'Card'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('idram')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                        paymentMethod === 'idram'
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      id="pay-method-idram"
                    >
                      {language === 'hy' ? 'Իդրամ' : 'Idram'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'bg-slate-700 text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      id="pay-method-cash"
                    >
                      {language === 'hy' ? 'Կանխիկ' : 'Cash'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-800/90 p-4 rounded-2xl text-xs font-semibold my-4 flex items-center space-x-2 animate-fade-in shadow-xs">
                  <span>🛡️</span>
                  <span>
                    {language === 'hy'
                      ? 'Պատվերն ամբողջությամբ կատարվելու է Բոնուսային հաշվի միջոցով։ Քարտային տվյալներ կամ վճարում չի պահանջվում։'
                      : 'This order is fully covered by your bonus points balance. No external payment required!'}
                  </span>
                </div>
              )}

              {/* CARD GATEWAY */}
              {paymentMethod === 'card' && (
                <div className="space-y-3.5 animate-fade-in">
                  
                  {/* Virtual Card Illustration Card */}
                  <div className="bg-gradient-to-r from-stone-800 to-stone-950 text-white p-5 rounded-2xl shadow-md h-36 flex flex-col justify-between relative overflow-hidden">
                    <span className="absolute -bottom-6 -right-6 w-24 h-24 bg-stone-700/30 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <span className="font-serif italic font-bold text-sm tracking-wide">Dulce Signature Gold</span>
                      <CreditCard className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                      <p className="font-mono text-xs tracking-widest text-shadow mb-1.5">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between text-[10px] opacity-75 font-mono">
                        <span className="truncate max-w-[120px]">{cardHolder || 'CARDHOLDER NAME'}</span>
                        <span>{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Input form cards */}
                  <div>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      placeholder="4321 0000 8888 9999"
                      onChange={handleCardNumberChange}
                      className="block w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-200"
                      id="card-number-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      placeholder="MM/YY"
                      onChange={handleExpiryChange}
                      className="block w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-200 text-center"
                      id="card-expiry-input"
                    />
                    <input
                      type="text"
                      maxLength={3}
                      value={cardCVV}
                      placeholder="CVV"
                      onChange={handleCVVChange}
                      className="block w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-200 text-center"
                      id="card-cvv-input"
                    />
                  </div>

                  <input
                    type="text"
                    value={cardHolder}
                    placeholder="CARD HOLDER NAME"
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="block w-full px-3 py-2 border border-stone-200 rounded-xl text-xs uppercase placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-200"
                    id="card-holder-input"
                  />
                  
                  <div className="flex items-center space-x-1.5 text-[10px] text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'hy' ? '3D Secure պաշտպանվածություն' : '3D Secure Secure Connection'}</span>
                  </div>
                </div>
              )}

              {/* IDRAM GATEWAY */}
              {paymentMethod === 'idram' && (
                <div className="bg-orange-50/70 border border-orange-100 p-4 rounded-2xl text-center space-y-3.5 z-10 animate-fade-in" id="idram-simulation-block">
                  <div className="w-24 h-24 bg-white border-2 border-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-inner relative">
                    <QrCode className="w-16 h-16 text-orange-600" />
                    <span className="absolute bottom-1 right-1 bg-orange-600 text-white text-[7px] p-0.5 rounded font-bold font-mono">idram</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">
                      {language === 'hy' ? 'Սկանավորեք IDRAM QR կոդը' : 'Scan to Approve with Idram'}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] mx-auto leading-normal">
                      {language === 'hy' 
                        ? 'Վճարումը կատարելու համար հավելվածով սկանավորեք կամ հաստատեք սիմուլյատորը:' 
                        : 'Open Idram on your mobile phone or click the bypass approval checkbox.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdramApproved(true)}
                    className={`px-4 py-2 text-[11px] font-bold rounded-xl transition cursor-pointer mx-auto block ${
                      idramApproved 
                        ? 'bg-green-600 text-white shadow' 
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow'
                    }`}
                    id="idram-approve-[mock]"
                  >
                    {idramApproved 
                      ? (language === 'hy' ? '✓ Վճարումը հաստատված է' : '✓ QR Confirmed')
                      : (language === 'hy' ? 'Հաստատել վճարումը (Սիմուլատոր)' : 'Simulate scan-to-approve')
                    }
                  </button>
                </div>
              )}

              {/* CASH GATEWAY */}
              {paymentMethod === 'cash' && (
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl animate-fade-in flex flex-col gap-2.5">
                  <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-sm mx-auto">
                    💵
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-slate-800">
                      {language === 'hy' ? 'Կանխիկ վճարում ստանալիս' : 'Payment on Delivery'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {language === 'hy' 
                        ? 'Կարող եք վճարել առաքիչին կանխիկ կամ POS տերմինալով պատվերը հանձնելիս:' 
                        : 'No upfront fees required. Simply hand over card/cash to our courier-driver.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Total display & Place Order Button */}
            <div className="pt-4 border-t border-stone-150 mt-6 space-y-3">
              {useBonus && bonusRedeemed > 0 && (
                <div className="flex justify-between items-center text-xs text-stone-500">
                  <span>{language === 'hy' ? 'Պատվերի սկզբնական գումար' : 'Original Order sum'}</span>
                  <span className="font-mono">{totalAmount.toLocaleString()} {t.amd}</span>
                </div>
              )}

              {useBonus && bonusRedeemed > 0 && (
                <div className="flex justify-between items-center text-xs text-green-600 font-bold">
                  <span>{t.bonusUsedLabel}</span>
                  <span className="font-mono">-{bonusRedeemed.toLocaleString()} {t.amd}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm border-b border-dashed border-stone-200 pb-2">
                <span className="text-stone-700 font-bold">
                  {language === 'hy' ? 'Ընդամենը վճարման' : 'Total to Pay'}
                </span>
                <span className="font-mono text-lg font-black text-rose-600">
                  {finalPaymentAmount.toLocaleString()} {t.amd}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-stone-600 font-semibold bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                <span className="flex items-center gap-1">
                  <span>✨</span>
                  <span>{t.bonusEarnedLabel}</span>
                </span>
                <span className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-lg shadow-2xs">
                  +{bonusEarned.toLocaleString()} {t.point}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-stone-900 hover:bg-stone-840 disabled:bg-stone-300 text-white font-extrabold text-xs py-3 rounded-xl shadow transition duration-200 transform enabled:active:scale-95 flex items-center justify-center space-x-2 cursor-pointer mt-2"
                id="checkout-pay-btn"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>{t.placingOrder}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.payAndOrder}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
