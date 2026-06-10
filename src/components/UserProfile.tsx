/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  Save, 
  Clock, 
  ChevronRight, 
  UtensilsCrossed, 
  UserCheck, 
  AlertCircle, 
  BadgeCheck, 
  Plus 
} from 'lucide-react';
import { Language, User, Order } from '../types';

interface UserProfileProps {
  language: Language;
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
  orderHistory: Order[];
  onBackToShopping: () => void;
  onTrackOrder: (order: Order) => void;
  onAdvanceStatus?: (orderId: string) => void;
  onConfirmReceipt?: (orderId: string) => void;
}

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', nameHy: 'Շեֆ Հրուշակագործ Анна', nameEn: 'Master Chef Anna' },
  { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', nameHy: 'Քաղցրասեր Կարեն', nameEn: 'Gourmet Karen' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', nameHy: 'Թագուհի Աննա', nameEn: 'Sweet Queen Lily' },
  { url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', nameHy: 'Անատոլի Կարո', nameEn: 'Director Karo' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', nameHy: 'Շեֆ Մարիամ', nameEn: 'Pastry Mary' }
];

export default function UserProfile({
  language,
  currentUser,
  onUpdateUser,
  orderHistory,
  onBackToShopping,
  onTrackOrder,
  onAdvanceStatus,
  onConfirmReceipt,
}: UserProfileProps) {
  
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0].url);
  
  // Custom interactive errors with indicators
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 animate-bounce">
          <UserIcon className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950 mb-4">
          {language === 'hy' ? 'Օգտատիրոջ կառավարում' : 'User Session Profile'}
        </h2>
        <p className="text-stone-605 text-[15px] max-w-md mx-auto mb-8">
          {language === 'hy' 
            ? 'Խնդրում ենք նախապես մուտք գործել կամ գրանցվել համակարգում՝ Ձեր անձնական տվյալներն ու պատվերները կառավարելու համար։' 
            : 'Please authorize on-site using the Sign-In button located in the top navigation menu to access profile controls.'}
        </p>
        <button
          onClick={onBackToShopping}
          className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm py-3.5 px-8 rounded-xl transition duration-200 transform active:scale-95"
        >
          {language === 'hy' ? 'Հետ դեպի Կատալոգ' : 'Return to Catalog'}
        </button>
      </div>
    );
  }

  // Live validator
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: { [key: string]: string } = {};

    if (fullName.trim().length < 3) {
      tempErrors.fullName = language === 'hy' 
        ? 'Անուն Ազգանունը պետք է պարունակի առնվազն 3 տառ։' 
        : 'Full name must contain at least 3 characters.';
    }

    if (!email.includes('@') || email.length < 5) {
      tempErrors.email = language === 'hy' 
        ? 'Խնդրում ենք նշել վավեր էլ․ փոստի հասցե (օր․՝ mail@example.com)։' 
        : 'Please enter a valid email address with @ domain structure.';
    }

    // Armenian or regular mobile phone support
    const cleanerPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (cleanerPhone.length < 9) {
      tempErrors.phone = language === 'hy' 
        ? 'Հեռախոսահամարը պետք է լինի առնվազն 9 թվանշան։' 
        : 'Phone number must be at least 9 digits long.';
    }

    if (address.trim().length < 8) {
      tempErrors.address = language === 'hy' 
        ? 'Հասցեն պետք է լինի հստակ և մանրամասն (առնվազն 8 տառ):' 
        : 'Detailed delivery address must be at least 8 characters long.';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      setSuccessMsg('');
      
      // Auto dismiss errors
      setTimeout(() => setErrors({}), 5050);
      return;
    }

    setErrors({});
    
    // Save updated session reference
    onUpdateUser({
      ...currentUser,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      avatar: selectedAvatar,
    });

    setSuccessMsg(language === 'hy' ? 'Ձեր պրոֆիլի տվյալները հաջողությամբ թարմացվեցին 🔒' : 'Your account profiles updated securely! 🔒');
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // Stats calculation
  const totalAmountSpent = orderHistory.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeOrdersCount = orderHistory.filter(o => o.status !== 'delivered' || !o.confirmedReceipt).length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="user-profile-view-div">
      
      {/* Route Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-6 mb-10 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-rose-600 font-extrabold block mb-1">
            {language === 'hy' ? 'Օգտատիրոջ Էջ' : 'Secure Account Area'}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-rose-500" />
            <span>{language === 'hy' ? 'Կարգավորումներ և Պատվերներ' : 'Profile Settings & History'}</span>
          </h2>
        </div>
        <button
          onClick={onBackToShopping}
          className="bg-stone-50 hover:bg-stone-105 border border-stone-200 text-stone-700 font-extrabold text-[13px] sm:text-sm py-2.5 px-6 rounded-xl transition transform active:scale-95 cursor-pointer shadow-xs"
        >
          {language === 'hy' ? '← Հետ դեպի Խանութ' : '← Back to Boutique'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT DETAILS AND AVATARS - 5 slots */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-stone-900 text-white font-mono text-[9px] uppercase px-4 py-1.5 rounded-bl-2xl font-bold tracking-widest">
            {language === 'hy' ? 'Մուտքը` Հաստատված' : 'Verified Session'}
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-2">
            {language === 'hy' ? 'Անձնական Տվյալներ' : 'Account Details'}
          </h3>
          <p className="text-stone-400 text-xs mb-6">
            {language === 'hy' 
              ? 'Թարմացրեք Ձեր հասցեն և տվյալները՝ արագ առաքումներ իրականացնելու համար։' 
              : 'Modify shipping endpoints, billing profile names or change custom avatars.'}
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Display validation message */}
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2"
                >
                  <BadgeCheck className="w-5 h-5 flex-shrink-0 text-green-600 animate-bounce" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Preset Avatars */}
            <div>
              <label className="block text-stone-600 font-extrabold text-xs uppercase mb-2">
                {language === 'hy' ? 'Ընտրեք Ձեր Ավատարը' : 'Choose Sweet Avatar'}
              </label>
              <div className="flex flex-wrap gap-2.5 py-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-full p-0.5 border-2 transition transform hover:scale-105 cursor-pointer ${
                      selectedAvatar === av.url ? 'border-rose-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={language === 'hy' ? av.nameHy : av.nameEn}
                  >
                    <img 
                      src={av.url} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {selectedAvatar === av.url && (
                      <span className="absolute -bottom-1 -right-1 bg-rose-600 text-[8px] text-white p-0.5 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* In Name Form */}
            <div>
              <label className="block text-stone-705 font-bold text-[13px] sm:text-sm mb-1.5">
                {language === 'hy' ? 'Անուն Ազգանուն' : 'Full Inscription Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl py-3 px-4 text-xs sm:text-sm text-stone-850 outline-none focus:bg-white focus:ring-1 transition ${
                    errors.fullName ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:ring-rose-200 focus:border-rose-450'
                  }`}
                  placeholder="Աննա Հարությունյան"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* In Email Form */}
            <div>
              <label className="block text-stone-705 font-bold text-[13px] sm:text-sm mb-1.5">
                {language === 'hy' ? 'Էլ․ Փոստ' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  title={language === 'hy' ? 'Էլ․ փոստը հնարավոր չէ փոխել' : 'Email identification cannot be modified after registration'}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3 px-4 text-xs sm:text-sm text-stone-500 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-stone-400 text-[10px] mt-1">
                {language === 'hy' ? 'Էլեկտրոնային փոստի հասցեն չի կարող փոփոխվել գրանցվելուց հետո։' : 'Primary registration email acts as unique security key and remains constant.'}
              </p>
            </div>

            {/* In Phone Form */}
            <div>
              <label className="block text-stone-705 font-bold text-[13px] sm:text-sm mb-1.5">
                {language === 'hy' ? 'Հեռախոսահամար' : 'Secure Contact Phone'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl py-3 px-4 text-xs sm:text-sm text-stone-850 outline-none focus:bg-white focus:ring-1 transition ${
                    errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:ring-rose-200 focus:border-rose-450'
                  }`}
                  placeholder="+374 91 223344"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                </p>
              )}
            </div>

            {/* In Address Form */}
            <div>
              <label className="block text-stone-705 font-bold text-[13px] sm:text-sm mb-1.5">
                {language === 'hy' ? 'Default Առաքման Հասցե' : 'Default Delivery Address'}
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full bg-stone-50 border rounded-xl py-3 px-4 text-xs sm:text-sm text-stone-850 outline-none focus:bg-white focus:ring-1 transition resize-none ${
                    errors.address ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:ring-rose-200 focus:border-rose-450'
                  }`}
                  placeholder="ք. Երևան, Աբովյան փողոց 12, բն. 14"
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl shadow-md transition duration-200 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{language === 'hy' ? 'Պահպանել Փոփոխությունները' : 'Confirm & Save Account'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: STATISTICS & ORDERS LIST - 7 slots */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Quick Stats Grid bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="bg-white border border-stone-200 p-4 rounded-2.5xl flex flex-col justify-between sm:flex-row sm:items-center sm:space-x-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mb-2 sm:mb-0">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">
                  {language === 'hy' ? 'Ընդհանուր' : 'Purchased'}
                </span>
                <span className="text-md sm:text-lg font-black text-stone-900 leading-none block mt-1">
                  {orderHistory.length} {language === 'hy' ? 'Պատվեր' : 'Orders'}
                </span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-stone-200 p-4 rounded-2.5xl flex flex-col justify-between sm:flex-row sm:items-center sm:space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mb-2 sm:mb-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">
                  {language === 'hy' ? 'Ծախսված Գումար' : 'Total Spent'}
                </span>
                <span className="text-md sm:text-lg font-black text-rose-600 leading-none block mt-1">
                  {totalAmountSpent.toLocaleString()} {language === 'hy' ? '֏' : 'AMD'}
                </span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-stone-200 p-4 rounded-2.5xl flex flex-col justify-between sm:flex-row sm:items-center sm:space-x-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mb-2 sm:mb-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">
                  {language === 'hy' ? 'Ակտիվ Պատվեր' : 'Active Queue'}
                </span>
                <span className="text-md sm:text-lg font-black text-stone-950 leading-none block mt-1">
                  {activeOrdersCount} {language === 'hy' ? 'Ակտիվ' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Stat 4: Bonus Points Balance */}
            <div className="bg-stone-900 text-white p-4 rounded-2.5xl flex flex-col justify-between sm:flex-row sm:items-center sm:space-x-4 border border-stone-850 shadow-sm relative overflow-hidden">
              <span className="absolute -top-6 -right-6 w-12 h-12 bg-rose-500/10 rounded-full blur-md pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-350 shrink-0 mb-2 sm:mb-0 relative z-10">
                <Sparkles className="w-4.5 h-4.5 text-yellow-300 animate-spin-slow" />
              </div>
              <div className="flex-1 relative z-10">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">
                  {language === 'hy' ? 'Բոնուսային Հաշիվ' : 'Bonus Balance'}
                </span>
                <span className="text-md sm:text-lg font-serif font-black text-yellow-300 leading-none block mt-1">
                  {(currentUser.bonusBalance || 0).toLocaleString()} ֏
                </span>
              </div>
            </div>
          </div>

          {/* First Order Promo Code Promotion Banner */}
          {orderHistory.length === 0 && (
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="absolute top-0 right-0 p-3">
                <Sparkles className="w-5 h-5 text-rose-400/80 rotate-12" />
              </div>
              <div className="space-y-1.5">
                <span className="bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {language === 'hy' ? 'Նոր Գրանցման Պատվեր' : 'Welcome Offer'}
                </span>
                <h4 className="text-sm sm:text-md font-serif font-black text-stone-900">
                  {language === 'hy' ? '10% Զեղչ Ձեր առաջին պատվերի վրա 🎁' : '10% Discount on Your First Order! 🎁'}
                </h4>
                <p className="text-[11px] text-stone-500 max-w-sm leading-normal">
                  {language === 'hy' 
                    ? 'Որպես նոր գրանցված հաճախորդ՝ օգտագործեք այս կոդը ձեր առաջին գնման ժամանակ:' 
                    : 'As a newly registered customer, use this exclusive promo code during your first order checkout.'}
                </p>
              </div>
              <div className="flex flex-col items-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="text-[9px] font-mono font-bold text-amber-600 tracking-widest uppercase mb-1">PROMO CODE</span>
                <span className="bg-white border-2 border-dashed border-rose-300 px-5 py-2.5 rounded-2xl font-mono text-sm sm:text-lg font-black text-rose-600 select-all tracking-wide shadow-xs">
                  WELCOME10
                </span>
              </div>
            </div>
          )}

          {/* Orders Sections Panel Container */}
          <div className="space-y-6">
            
            {/* SECTION 1: ACTIVE APPROVED ORDERS */}
            <div className="bg-white border-2 border-stone-200/95 p-6 sm:p-8 rounded-3xl shadow-sm">
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base sm:text-lg font-serif font-black text-stone-950">
                  {language === 'hy' ? 'Հաստատված Ակտիվ Պատվերներ' : 'Approved Active Orders'}
                </h3>
              </div>
              <p className="text-stone-500 text-[13.5px] mb-6">
                {language === 'hy' 
                  ? 'Այստեղ կարող եք տեսնել Ձեր ընթացիկ պատվերների պատրաստման և առաքման իրական վիճակը (Tracker):' 
                  : 'Monitor the live baking progress and delivery coordinates of your active cake orders.'}
              </p>

              {orderHistory.filter(o => o.status !== 'delivered' || !o.confirmedReceipt).length === 0 ? (
                <div className="border border-dashed border-stone-200 py-10 rounded-2.5xl text-center bg-stone-50/50">
                  <span className="text-3xl block mb-2">🧁</span>
                  <p className="text-stone-550 font-serif font-bold text-[13.5px]">
                    {language === 'hy' ? 'Չկան ակտիվ ընթացիկ պատվերներ' : 'No active orders in progress'}
                  </p>
                  <p className="text-stone-400 text-[11px] mt-1 max-w-xs mx-auto">
                    {language === 'hy' ? 'Նոր պատվեր գրանցելուց հետո այն կհայտնվի այստեղ՝ իրական ժամանակում թրեքինգի համար:' : 'Add standard desserts or custom orders to view live tracker state.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 select-none scrollbar-custom">
                  {orderHistory.filter(o => o.status !== 'delivered' || !o.confirmedReceipt).map((order) => {
                    const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                    
                    const statusColors = {
                      placed: 'bg-amber-100 text-amber-900 border-amber-300',
                      baking: 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse',
                      delivering: 'bg-indigo-100 text-indigo-900 border-indigo-300 animate-pulse',
                      delivered: 'bg-green-100 text-green-900 border-green-300'
                    };

                    const statusNamesHy = {
                      placed: 'Պատվիրված է',
                      baking: 'Թխվում է սրահում',
                      delivering: 'Մեքենան ճանապարհին է',
                      delivered: 'Առաքված է'
                    };

                    const statusNamesEn = {
                      placed: 'Received & Approved',
                      baking: 'Baking in Kitchen',
                      delivering: 'Out for Delivery',
                      delivered: 'Successfully Handed'
                    };

                    return (
                      <div 
                        key={order.id} 
                        className="border-2 border-stone-150 hover:border-rose-300 bg-stone-50/40 p-5 rounded-2.5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition duration-300"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 py-0.5 px-2 rounded-lg">
                              #{order.id}
                            </span>
                            <span className="text-stone-400 text-[11px] font-mono font-bold">
                              {order.date}
                            </span>
                          </div>
                          <p className="text-stone-800 text-[14px] font-black">
                            {itemsCount} {language === 'hy' ? 'քաղցրավենիք' : 'gourmet treats'} • {' '}
                            <span className="text-rose-600">{order.totalAmount.toLocaleString()} ֏</span>
                          </p>
                          <p className="text-stone-500 text-[12px] max-w-xs truncate font-medium">
                            {language === 'hy' ? '📍 Հասցե` ' : '📍 Address: '} {order.deliveryAddress}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Track badge */}
                          <span className={`text-[11px] font-black uppercase py-1.5 px-3.5 border-2 rounded-xl shadow-xs ${statusColors[order.status]}`}>
                            {language === 'hy' ? statusNamesHy[order.status] : statusNamesEn[order.status]}
                          </span>

                          {/* Sim advance triggers */}
                          {onAdvanceStatus && (
                            <button
                              onClick={() => onAdvanceStatus(order.id)}
                              className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[10.5px] px-3 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                              title={language === 'hy' ? 'Սիմուլատոր՝ առաջխաղացնել փուլը' : 'Simulator: Advance stage'}
                            >
                              {language === 'hy' ? 'Փուլ +' : 'Next Stage'}
                            </button>
                          )}

                          {/* Live Map Click */}
                          <button
                            onClick={() => onTrackOrder(order)}
                            className="bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200 font-extrabold text-[12px] py-2 px-4 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{language === 'hy' ? 'Քարտեզ' : 'Track Map'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Confirm receipt button if delivered or available to confirm */}
                          {onConfirmReceipt && (
                            <button
                              onClick={() => onConfirmReceipt(order.id)}
                              className="bg-green-600 hover:bg-green-500 text-white font-extrabold text-[12px] py-2 px-4 rounded-xl transition cursor-pointer hover:shadow-md transform active:scale-95 text-center flex items-center justify-center"
                              title={language === 'hy' ? 'Հաստատել պատվերի ստացումը' : 'Confirm order receipt'}
                            >
                              {order.status === 'delivered' ? (
                                <span>{language === 'hy' ? 'Հաստատել Ստացումը' : 'Confirm'}</span>
                              ) : (
                                <span>{language === 'hy' ? 'Հաստատել' : 'Confirm'}</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: DELIVERED SOUVENIR MEMORIES HISTORY */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 select-none pointer-events-none text-right">
                <span className="text-6xl text-rose-300">🌸</span>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">💝</span>
                <h3 className="text-base sm:text-lg font-serif font-black text-stone-950">
                  {language === 'hy' ? 'Ավարտված Պատվերների Հուշ-Պատմություն' : 'Delivered Keepsake Memories'}
                </h3>
              </div>
              <p className="text-stone-400 text-xs mb-6">
                {language === 'hy' 
                  ? 'Առաքված պատվերները մնում են այստեղ որպես քաղցր հուշեր՝ Ձեր նախորդ համեղ տոնակատարություններից։' 
                  : 'Delivered feasts preserved indefinitely as nostalgic visual souvenirs of your sweet gatherings.'}
              </p>

              {orderHistory.filter(o => o.status === 'delivered' && o.confirmedReceipt).length === 0 ? (
                <div className="border border-dashed border-stone-200 py-10 rounded-2xl text-center">
                  <span className="text-2xl block mb-2">📜</span>
                  <p className="text-stone-400 text-xs">
                    {language === 'hy' ? 'Դեռևս չկան ավարտված հուշ-պատվերներ' : 'No previous delivered souvenirs found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 select-none scrollbar-custom">
                  {orderHistory.filter(o => o.status === 'delivered' && o.confirmedReceipt).map((order) => {
                    const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <div 
                        key={order.id} 
                        className="bg-amber-50/30 border border-amber-100 hover:bg-amber-50/50 p-5 rounded-2.5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition duration-300 relative border-l-4 border-l-orange-400"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/80 py-0.5 px-2 rounded-lg">
                              #{order.id}
                            </span>
                            <span className="text-stone-400 text-[11px] font-mono">
                              {order.date}
                            </span>
                          </div>
                          
                          <p className="text-stone-900 text-[13.5px] font-serif font-bold italic">
                            «{language === 'hy' ? `${itemsCount} համեղ քաղցրավենիք` : `${itemsCount} sweet delicacies`}»
                          </p>

                          {/* Sweet Souvenir Tag Letter */}
                          <div className="bg-white/80 border border-amber-100 p-2.5 rounded-xl max-w-md">
                            <span className="text-[10.5px] font-bold text-amber-800 block uppercase tracking-wide">
                              💌 {language === 'hy' ? 'Քաղցր Հուշ հաճախորդին` ' : 'Bakery Memorial Note: '}
                            </span>
                            <p className="text-[11.5px] text-stone-605 italic leading-relaxed mt-0.5">
                              {language === 'hy' 
                                ? 'Շնորհակալություն, որ վստահում եք Ձեր տոնական օրերի քաղցրությունը մեզ։ Թող այս հուշը մնա որպես սիրո և ջերմության փոքրիկ վկայություն։' 
                                : 'Thank you for choosing our organic bakery to sweeten your beautiful memory. May this souvenir remain as a keepsake of warm times.'}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-center sm:text-right">
                          <span className="text-amber-600 text-xs font-mono font-black block">
                            {order.totalAmount.toLocaleString()} ֏
                          </span>
                          <span className="inline-flex items-center space-x-1.5 bg-orange-100/60 text-orange-850 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase mt-2 border border-orange-200">
                            <span>🌟 {language === 'hy' ? 'Պատմություն' : 'Keepsake Log'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
