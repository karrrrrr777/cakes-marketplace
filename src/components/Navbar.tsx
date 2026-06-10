/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language, User } from '../types';
import { translations } from '../translations';
import { ShoppingCart, Search, User as UserIcon, LogOut, Sparkles, Cake } from 'lucide-react';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  currentUser: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  scrollToCatalog: () => void;
  onProfileClick?: () => void;
}

export default function Navbar({
  language,
  setLanguage,
  cartCount,
  setIsCartOpen,
  currentUser,
  onAuthClick,
  onLogout,
  searchQuery,
  setSearchQuery,
  scrollToCatalog,
  onProfileClick,
}: NavbarProps) {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="text-2.5xl font-serif font-bold text-rose-600 tracking-tight italic">
              {t.appName}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-stone-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hy' ? 'Փնտրել տորթեր, գաթա, մակարոններ․․․' : 'Search delicious cakes, gata, macarons...'}
                className="block w-full pl-12 pr-4 py-2.5 bg-stone-100 border-none rounded-full text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
              />
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Language Selector */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('hy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-200 ${
                  language === 'hy'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="lang-toggle-hy"
              >
                Հայ
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="lang-toggle-en"
              >
                Eng
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-700 hover:text-rose-600 hover:bg-stone-100 rounded-full transition-all duration-200"
              id="cart-btn"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Section */}
            {currentUser ? (
              <div 
                onClick={onProfileClick}
                className="flex items-center space-x-3 bg-stone-50 hover:bg-stone-100 py-1.5 px-3 rounded-2xl border border-stone-200 hover:border-rose-400 transition-all duration-250 cursor-pointer shadow-sm"
                title={language === 'hy' ? 'Անցնել Իմ Էջը' : 'Go to Profile Page'}
                id="navbar-profile-badge"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full border border-stone-200 shadow-xs object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left select-none">
                  <p className="text-xs font-black text-stone-850 leading-tight truncate max-w-[120px]">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-rose-500">
                    {t.profile}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Stop routing to profile first
                    onLogout();
                  }}
                  title={t.logout}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition ml-1"
                  id="navbar-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition duration-300 transform active:scale-95"
                id="login-btn"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.loginTab}</span>
              </button>
            )}

          </div>
        </div>

        {/* Search Bar for Mobile */}
        <div className="block md:hidden pb-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hy' ? 'Փնտրել քաղցրավենիք․․․' : 'Search sweets...'}
              className="block w-full pl-9 pr-3 py-2 bg-stone-100 border-none rounded-full text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-200 transition"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
