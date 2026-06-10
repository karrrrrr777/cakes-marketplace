/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, LogIn, UserPlus, Heart, Award, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Language, User } from '../types';

interface WelcomeGatewayProps {
  language: Language;
  onLoginSuccess: (user: User) => void;
  customTitle?: string;
  customSubtitle?: string;
  customHeaderBadge?: string;
}

export default function WelcomeGateway({ 
  language, 
  onLoginSuccess,
  customTitle,
  customSubtitle,
  customHeaderBadge
}: WelcomeGatewayProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Built-in trial users for quick access (trial login with 1 click)
  const demoUsers = [
    {
      fullName: "Աննա Հարությունյան",
      email: "anna@sweet.am",
      phone: "+374 91 223344",
      address: "ք. Երևան, Աբովյան փողոց 12, բն. 14",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      fullName: "Կարեն Պետրոսյան",
      email: "karen@bakery.am",
      phone: "+374 77 998877",
      address: "ք. Երևան, Կոմիտաս պողոտա 45, բն. 6",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const handleDemoClick = (user: typeof demoUsers[0]) => {
    onLoginSuccess({
      id: "u_" + Date.now(),
      ...user
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'signin') {
      if (!email || !password) {
        setErrorMessage(language === 'hy' ? 'Խնդրում ենք լրացնել բոլոր դաշտերը։' : 'Please enter your email and password.');
        return;
      }
      onLoginSuccess({
        id: "u_" + Date.now(),
        fullName: email.split('@')[0].toUpperCase(),
        email: email,
        phone: "+374 95 111222",
        address: "ք. Երևան, Մաշտոցի Պողոտա 5",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
      });
    } else {
      if (!fullName || !email || !phone || !address || !password) {
        setErrorMessage(language === 'hy' ? 'Բոլոր դաշտերը պարտադիր են գրանցման համար։' : 'All registration fields are required.');
        return;
      }
      onLoginSuccess({
        id: "u_" + Date.now(),
        fullName,
        email,
        phone,
        address,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16" id="welcome-gateway-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT BRAND SECTION */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2.5 bg-rose-50 border border-rose-100 py-2 px-5 rounded-full text-rose-600 font-extrabold text-sm shadow-sm">
            <Lock className="w-4 h-4 animate-pulse text-rose-500" />
            <span className="font-mono tracking-wider uppercase text-[11px]">
              {customHeaderBadge || (language === 'hy' ? 'Մուտքի Հավաստագրում' : 'Secure Baked Access')}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[45px] font-black text-stone-900 tracking-tight leading-normal" id="gateway-title">
            {customTitle || (language === 'hy' ? 'Բարի Գալուստ Dulce Cakes 🍰' : 'Welcome to Dulce Cakes 🍰')}
          </h1>

          <p className="text-stone-605 text-[15.5px] sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            {customSubtitle || (language === 'hy' 
              ? 'Մեր պրեմիում օրգանական տորթերի ամբողջական տեսականին ուսումնասիրելու, սեփական անհատական ձևավորումներ ստեղծելու և պատվերները իրական ժամանակում թրեք անելու համար խնդրում ենք նախապես Մուտք գործել կամ Գրանցվել։'
              : 'To browse our premium organic sweets, create custom recipes, order tailored cakes, and simulate interactive real-time transport maps, please register or sign in below.')}
          </p>

          {/* Core Sweet Promises */}
          <div className="space-y-4 pt-4 max-w-md mx-auto lg:mx-0 text-left">
            <div className="flex items-start space-x-3.5">
              <div className="bg-orange-100 p-2.5 rounded-xl shrink-0 text-orange-600 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-black text-stone-900 text-base">
                  {language === 'hy' ? 'Անվճար Առաքում Երևանում' : 'Free Carriage Yerevan'}
                </h4>
                <p className="text-stone-500 text-[13.5px] mt-0.5 leading-relaxed">
                  {language === 'hy' ? '15,000֏-ից ավելի ցանկացած պատվերի դեպքում սառնարանային մեքենայով:' : 'For orders over 15,000 AMD, delivered with temp-controlled vehicles.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="bg-pink-100 p-2.5 rounded-xl shrink-0 text-pink-600 mt-1">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-black text-stone-900 text-base">
                  {language === 'hy' ? 'Իրական Ժամանակի Քարտեզ' : 'Real-Time Track Map'}
                </h4>
                <p className="text-stone-500 text-[13.5px] mt-0.5 leading-relaxed">
                  {language === 'hy' ? 'Ակտիվ պատվերներ բաժնից կարող եք հետևել առաքման ընթացքին քարտեզի վրա:' : 'Follow custom culinary baking stages & vehicle driving in live simulation panels.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT FORM SIGNIN/SIGNUP PANEL */}
        <div className="lg:col-span-6">
          <div className="bg-white border-2 border-stone-200/95 shadow-xl rounded-3.5xl p-6 sm:p-10 relative overflow-hidden" id="auth-panel-card">
            
            {/* Embedded custom tabs */}
            <div className="flex bg-stone-105 p-1 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition relative cursor-pointer ${
                  activeTab === 'signin' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-850'
                }`}
                id="gateway-tab-signin"
              >
                <span>{language === 'hy' ? 'Մուտք Գործել' : 'Sign In'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition relative cursor-pointer ${
                  activeTab === 'signup' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-850'
                }`}
                id="gateway-tab-signup"
              >
                <span>{language === 'hy' ? 'Գրանցում' : 'Register Account'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-205 text-red-600 p-4.5 rounded-2xl text-[13.5px] font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeTab === 'signup' && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name field */}
                    <div>
                      <label className="block text-stone-700 font-extrabold text-sm mb-1.5">
                        {language === 'hy' ? 'Անուն Ազգանուն' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Աննա Հարությունյան"
                        className="w-full bg-stone-50 border border-stone-200 focus:border-rose-450 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
                      />
                    </div>

                    {/* Contact Phone field */}
                    <div>
                      <label className="block text-stone-700 font-extrabold text-sm mb-1.5">
                        {language === 'hy' ? 'Հեռախոսահամար' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+374 91 223344"
                        className="w-full bg-stone-50 border border-stone-200 focus:border-rose-450 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
                      />
                    </div>

                    {/* Delivery Address field */}
                    <div>
                      <label className="block text-stone-700 font-extrabold text-sm mb-1.5">
                        {language === 'hy' ? 'Առաքման Հասցե' : 'Delivery Address'}
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ք. Երևան, Աբովյան փողոց 20, բն. 15"
                        className="w-full bg-stone-50 border border-stone-200 focus:border-rose-450 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="block text-stone-700 font-extrabold text-sm mb-1.5">
                  {language === 'hy' ? 'Էլեկտրոնային Փոստ' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-450 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
                />
              </div>

              {/* Secret Password string */}
              <div>
                <label className="block text-stone-700 font-extrabold text-sm mb-1.5">
                  {language === 'hy' ? 'Գաղտնաբառ' : 'Secret Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-rose-450 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
                />
              </div>

              {/* Auth Button */}
              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer pt-4 pb-4"
              >
                <span>
                  {activeTab === 'signin' 
                    ? (language === 'hy' ? 'Հաստատել և Մուտք Գործել' : 'Sign In Now') 
                    : (language === 'hy' ? 'Ստեղծել Պրոֆիլ և Բացել Կայքը' : 'Create & Open Bakery')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Trial Fast Login Access links */}
            <div className="mt-8 pt-6 border-t border-stone-150 text-center">
              <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider block mb-3">
                ⚡️ {language === 'hy' ? 'ԿԱՄ ՕԳՏԱԳՈՐԾԵՔ ԱՐԱԳ ՄՈՒՏՔԸ' : 'OR CLICK ONE-TAP TRIAL ROUTE'}
              </span>
              <div className="grid grid-cols-2 gap-3">
                {demoUsers.map((user, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoClick(user)}
                    className="bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-250 py-2.5 px-3 rounded-2xl text-[12.5px] font-extrabold text-stone-700 transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="text-stone-900 leading-none">{user.fullName}</span>
                    <span className="text-[10px] text-stone-400 font-medium">({user.email.split('@')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
