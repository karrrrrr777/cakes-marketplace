/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


// BAREV APEEE

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Language, User, Order, CustomCakeOptions } from './types';
import { translations } from './translations';
import { initialProducts } from './productsData';
import { testimonials } from './dataTestimonials';

// Components
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CustomizerModal from './components/CustomizerModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutSection from './components/CheckoutSection';
import OrderTracker from './components/OrderTracker';
import AIAdvisor from './components/AIAdvisor';
import UserProfile from './components/UserProfile';
import WelcomeGateway from './components/WelcomeGateway';

// Icons
import { Cake, Sparkles, Filter, ShieldCheck, Truck, Clock, Heart, Award, ArrowUp, ShoppingBag, Stars } from 'lucide-react';

export default function App() {
  // Sync states with localStorage
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('dulce_language') as Language) || 'hy';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dulce_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dulce_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dulce_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic Testimonials
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('dulce_testimonials');
    return saved ? JSON.parse(saved) : testimonials;
  });

  // State managers for review submission form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewProduct, setReviewProduct] = useState('p1');

  // UI state managers
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cakes' | 'armenian_sweets' | 'pastries' | 'cupcakes'>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [selectedReviewRating, setSelectedReviewRating] = useState<number | 'all'>('all');
  
  // Customizer states
  const [activeCustomizerProduct, setActiveCustomizerProduct] = useState<Product | null>(null);
  const [inquiredProduct, setInquiredProduct] = useState<Product | null>(null);

  // Screen routers
  const [activeView, setActiveView] = useState<'marketplace' | 'checkout' | 'tracker' | 'profile'>('marketplace');
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<Order | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Lifted Promo states
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoFeedback, setPromoFeedback] = useState('');
  const [pasted, setPasted] = useState(false);

  // Refs
  const catalogRef = useRef<HTMLDivElement>(null);

  // Save states
  useEffect(() => {
    localStorage.setItem('dulce_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dulce_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dulce_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dulce_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dulce_orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('dulce_testimonials', JSON.stringify(liveTestimonials));
  }, [liveTestimonials]);

  // Submit dynamic client review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const selectedProd = initialProducts.find(p => p.id === reviewProduct);
    const prodNameHy = selectedProd ? selectedProd.nameHy : "Քաղցրավենիք";
    const prodNameEn = selectedProd ? selectedProd.nameEn : "Sweet Treat";

    const newRev = {
      id: `rev_${Date.now()}`,
      rating: reviewRating,
      nameHy: reviewName.trim() || (currentUser ? currentUser.fullName : "Անանուն հաճախորդ"),
      nameEn: reviewName.trim() || (currentUser ? currentUser.fullName : "Guest Customer"),
      locationHy: currentUser?.address || "Երևան, Հայաստան",
      locationEn: currentUser?.address || "Yerevan, Armenia",
      commentHy: reviewComment,
      commentEn: reviewComment,
      productNameHy: prodNameHy,
      productNameEn: prodNameEn,
      avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
    };

    setLiveTestimonials(prev => [newRev, ...prev]);
    setReviewComment('');
    setReviewName('');
    showToast(language === 'hy' ? 'Կարծիքը հաջողությամբ ավելացվեց:' : 'Review submitted successfully!');
  };

  const t = translations[language];

  // Show generic toast
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id && !item.customizations);
    if (existing) {
      setCart(prev => prev.map(item => 
        item.product.id === product.id && !item.customizations
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        id: `std_${product.id}`,
        product,
        quantity: 1,
        finalPrice: product.price
      }]);
    }
    showToast(language === 'hy' ? `«${product.nameHy}»-ն ավելացվեց զամբյուղ` : `Added ${product.nameEn} to cart`);
  };

  const handleAddCustomizedToCart = (product: Product, options: CustomCakeOptions, calculatedPrice: number) => {
    // Generate unique composite ID for the customization
    const customId = `custom_${product.id}_${Date.now()}`;
    setCart(prev => [...prev, {
      id: customId,
      product,
      quantity: 1,
      customizations: options,
      finalPrice: calculatedPrice
    }]);
    showToast(language === 'hy' ? 'Ձեր անհատական ձևավորմամբ տորթն ավելացվեց զամբյուղ' : 'Your designed cake was added to cart');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast(language === 'hy' ? 'Ապրանքը հեռացվեց զամբյուղից' : 'Item removed from cart', 'info');
  };

  // Global promo code application logic
  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoFeedback(language === 'hy' ? 'Մուտքագրեք պրոմո կոդ' : 'Enter a promo code');
      setDiscountPercent(0);
      setAppliedPromo('');
      setPasted(false);
      return;
    }

    if (code === 'SWEETARMENIA') {
      setDiscountPercent(10);
      setAppliedPromo('SWEETARMENIA');
      setPromoFeedback(language === 'hy' ? 'Կիրառված է 10% զեղչ կոդով! 🎉' : 'Applied 10% discount! 🎉');
      setPasted(true);
    } else if (code === 'HYBREAD') {
      setDiscountPercent(15);
      setAppliedPromo('HYBREAD');
      setPromoFeedback(language === 'hy' ? 'Կիրառված է 15% զեղչ կոդով! 🎉' : 'Applied 15% discount! 🎉');
      setPasted(true);
    } else if (code === 'WELCOME10') {
      if (!currentUser) {
        setPromoFeedback(language === 'hy' ? 'Մուտք գործեք կամ գրանցվեք կայքում՝ այս կոդը կիրառելու համար:' : 'Please register or log in first to apply this code!');
        setDiscountPercent(0);
        setAppliedPromo('');
        setPasted(false);
      } else if (orderHistory.length > 0) {
        setPromoFeedback(language === 'hy' ? 'Այս պրոմո կոդը միայն Ձեր առաջին պատվերի համար է:' : 'This promo code is only available for your first order!');
        setDiscountPercent(0);
        setAppliedPromo('');
        setPasted(false);
      } else {
        setDiscountPercent(10);
        setAppliedPromo('WELCOME10');
        setPromoFeedback(language === 'hy' ? 'Կիրառված է 10% զեղչ Ձեր առաջին պատվերի համար! 🎉' : 'Applied 10% discount for your first order! 🎉');
        setPasted(true);
      }
    } else {
      setPromoFeedback(language === 'hy' ? 'Անվավեր պրոմո կոդ' : 'Invalid promo code');
      setDiscountPercent(0);
      setAppliedPromo('');
      setPasted(false);
    }
  };

  // Auth operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    
    // Check if they are eligible for WELCOME10 (meaning zero total orders)
    const isFirstTime = orderHistory.length === 0;
    if (isFirstTime) {
      setPromoInput('WELCOME10');
      setDiscountPercent(10);
      setAppliedPromo('WELCOME10');
      setPromoFeedback(language === 'hy'
        ? 'Հրաշալի է: Որպես նոր օգտատեր, WELCOME10 կոդով 10% զեղչն ավտոմատ կիրառվեց Ձեր առաջին պատվերի վրա! 🎁'
        : 'Awesome! As a new member, WELCOME10 10% discount has been pre-applied to your first order! 🎁'
      );
      setPasted(true);
      showToast(
        language === 'hy' 
          ? `Բարի գալուստ, ${user.fullName}! 10% զեղչը կիրառված է:` 
          : `Welcome, ${user.fullName}! 10% first-order discount applied.`,
        'success'
      );
    } else {
      showToast(language === 'hy' ? `Բարի գալուստ, ${user.fullName}!` : `Welcome back, ${user.fullName}!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setPromoInput('');
    setDiscountPercent(0);
    setAppliedPromo('');
    setPromoFeedback('');
    setPasted(false);
    setActiveView('marketplace');
    setActiveTrackedOrder(null);
    showToast(language === 'hy' ? 'Դուք դուրս եկաք համակարգից:' : 'Logged out successfully', 'info');
  };

  // Checkout transitions
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setActiveView('checkout');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrderSuccess = (order: Order, usedBonus: number = 0, earnedBonus: number = 0) => {
    setOrderHistory(prev => [order, ...prev]);
    setCart([]); // Clean out cart
    setActiveTrackedOrder(order);
    setActiveView('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update current user's bonusBalance dynamically
    if (currentUser) {
      const currentBalance = currentUser.bonusBalance || 0;
      const nextBalance = Math.max(0, currentBalance - usedBonus + earnedBonus);
      const updatedUser = {
        ...currentUser,
        bonusBalance: nextBalance
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('dulce_user', JSON.stringify(updatedUser));

      if (usedBonus > 0 && earnedBonus > 0) {
        showToast(
          language === 'hy'
            ? `Պատվերը գրանցվեց: Օգտագործվեց ${usedBonus} բոնուս և կուտակվեց +${earnedBonus} նոր բոնուս!`
            : `Order placed! Used ${usedBonus} pts and earned +${earnedBonus} new bonus pts!`,
          'success'
        );
      } else if (earnedBonus > 0) {
        showToast(
          language === 'hy'
            ? `Պատվերը գրանցվեց: Ձեր հաշվին կուտակվեց +${earnedBonus} բոնուսային միավոր (0.3%):`
            : `Order placed! Earned +${earnedBonus} cashback points (0.3%):`,
          'success'
        );
      } else {
        showToast(language === 'hy' ? 'Պատվերը հաջողությամբ գրանցվեց!' : 'Order submitted successfully!');
      }
    } else {
      showToast(language === 'hy' ? 'Պատվերը հաջողությամբ գրանցվեց!' : 'Order submitted successfully!');
    }

    // Reset promo states on successful first order placement
    setPromoInput('');
    setDiscountPercent(0);
    setAppliedPromo('');
    setPromoFeedback('');
    setPasted(false);
  };

  // Tracker operations
  const handleAdvanceStatus = (orderId: string) => {
    const statuses: Order['status'][] = ['placed', 'baking', 'delivering', 'delivered'];
    setOrderHistory(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextIdx = (statuses.indexOf(o.status) + 1) % statuses.length;
        const updated = { ...o, status: statuses[nextIdx] };
        if (activeTrackedOrder?.id === orderId) {
          setActiveTrackedOrder(updated);
        }
        return updated;
      }
      return o;
    }));
    showToast(language === 'hy' ? 'Կարգավիճակը թարմացվեց (Սիմուլատոր)' : 'Status advanced (Simulated)');
  };

  const handleConfirmReceipt = (orderId: string) => {
    setOrderHistory(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, confirmedReceipt: true };
      }
      return o;
    }));
    showToast(language === 'hy' ? 'Պատվերի ստացումը հաջողությամբ հաստատվեց 🌟' : 'Order receipt confirmed successfully! 🌟');
  };

  // Local product query logic
  const filteredProducts = initialProducts.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.nameHy.toLowerCase().includes(query) || 
                          p.nameEn.toLowerCase().includes(query) || 
                          p.descriptionHy.toLowerCase().includes(query) ||
                          p.descriptionEn.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchesDietary = true;
    if (selectedDietary === 'gluten_free') {
      matchesDietary = p.id === 'p8';
    } else if (selectedDietary === 'nut_free') {
      matchesDietary = p.id !== 'p5' && p.id !== 'p7';
    } else if (selectedDietary === 'eggless') {
      matchesDietary = p.id === 'p9' || p.id === 'p6';
    }

    return matchesSearch && matchesCategory && matchesDietary;
  });

  // Hot customizable triggers from banners
  const triggerCustomizerForPopular = () => {
    const redVelvet = initialProducts.find(p => p.id === 'p2');
    if (redVelvet) {
      setActiveCustomizerProduct(redVelvet);
    }
  };

  const subtotalPrice = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const latestActiveOrder = orderHistory.find(o => o.status !== 'delivered' || !o.confirmedReceipt);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-stone-800 selection:bg-rose-200">
      
      {/* Navbar segment */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        setIsCartOpen={setIsCartOpen}
        currentUser={currentUser}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (activeView !== 'marketplace') {
            setActiveView('marketplace');
          }
        }}
        scrollToCatalog={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onProfileClick={() => {
          setActiveView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Layout Area */}
      <main className="flex-grow pb-16">
        
        {/* Animated Views */}
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: MARKETPLACE LANDING AND BENTO PANELS */}
          {activeView === 'marketplace' && (
            <motion.div
              key="marketplace-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Banner Showcase component */}
              <section className="relative bg-white overflow-hidden py-12 sm:py-20 border-b border-stone-200">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-12 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                  
                  {/* Banner Descriptions */}
                  <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center space-x-2 bg-stone-150/90 border border-stone-200 py-1.5 px-4 rounded-full text-stone-700 text-xs font-bold shadow-sm">
                      <Stars className="w-4 h-4 text-stone-500 animate-pulse" />
                      <span>{language === 'hy' ? '100% Պրեմիում և Թարմ Բաղադրիչներ' : '100% Organic, Preservative Free'}</span>
                    </div>

                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-black text-stone-900 tracking-tight leading-normal">
                      {t.heroTitle}
                    </h1>

                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                      {t.heroDesc}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                      <button
                        onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs py-3.5 px-7 rounded-xl shadow-sm transition transform active:scale-95"
                        id="hero-explore-btn"
                      >
                        {t.exploreCatalog}
                      </button>
                      
                      <button
                        onClick={triggerCustomizerForPopular}
                        className="bg-white hover:bg-stone-55 border border-stone-200 text-stone-700 font-extrabold text-xs py-3.5 px-7 rounded-xl shadow-sm transition transform active:scale-95 flex items-center justify-center gap-1.5"
                        id="hero-custom-btn"
                      >
                        <Sparkles className="w-4 h-4 text-stone-550 fill-stone-100" />
                        <span>{t.customOrderBtn}</span>
                      </button>
                    </div>

                    {/* Features row */}
                    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-200 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                      <div>
                        <span className="text-stone-800 font-bold block text-sm sm:text-base font-serif">1+ {t.hours}</span>
                        <span className="text-[10px] text-stone-400 font-medium">{language === 'hy' ? 'Արագ պատրաստում' : 'Fast Prep'}</span>
                      </div>
                      <div>
                        <span className="text-stone-800 font-bold block text-sm sm:text-base font-serif">10k+ ֏</span>
                        <span className="text-[10px] text-stone-400 font-medium">{language === 'hy' ? 'Անվճար առաքում' : 'Free Delivery'}</span>
                      </div>
                      <div>
                        <span className="text-stone-800 font-bold block text-sm sm:text-base font-serif">5.0 ★</span>
                        <span className="text-[10px] text-stone-400 font-medium">{language === 'hy' ? 'Հազարավոր կարծիքներ' : 'Client Rating'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated Banner Image Render block */}
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="relative w-full max-w-md p-2 bg-white rounded-3xl border border-stone-200 shadow-sm transition duration-500 group">
                      <div className="relative overflow-hidden rounded-2xl aspect-square sm:aspect-video lg:aspect-square">
                        <img
                          src="/src/assets/images/luxury_cake_banner_1779740820562.png"
                          alt="Luxury cake banner"
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-5">
                          <p className="text-white font-serif font-bold text-base leading-snug">
                            {language === 'hy' ? 'Անհատական նախագծման Տորթեր' : 'Custom Built Feasts'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>



              {/* Sweets Catalog Header with categories */}
              <section ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                  <div>
                    <span className="font-mono text-xs uppercase text-rose-600 font-bold block mb-1">
                      {t.categories}
                    </span>
                    <h2 className="text-2xl sm:text-3.5xl font-serif font-bold text-stone-900 leading-tight">
                      {t.popularProducts}
                    </h2>
                  </div>

                  {/* Multi-category select filters */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', hy: 'Բոլորը', en: 'All Sweets', icon: Filter },
                      { key: 'cakes', hy: t.cakes, en: 'Classic Cakes', icon: Cake },
                      { key: 'armenian_sweets', hy: 'Հայկական Թխվածք', en: 'Armenian Legacy', icon: Stars },
                      { key: 'pastries', hy: 'Մակարոններ & Էկլերներ', en: 'French Patisserie', icon: Award },
                      { key: 'cupcakes', hy: t.cupcakes, en: 'Sweet Cupcakes', icon: CupcakeDummy }
                    ].map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setSelectedCategory(cat.key as any)}
                          className={`flex items-center space-x-1.5 px-4.5 py-2 rounded-full text-xs font-bold border transition ${
                            selectedCategory === cat.key
                              ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                              : 'bg-white hover:bg-stone-55 border-stone-200 text-stone-605'
                          }`}
                          id={`category-tab-${cat.key}`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                          <span>{language === 'hy' ? cat.hy : cat.en}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Secondary Dietary Preferences Row */}
                <div className="flex flex-wrap items-center gap-2 mb-8 bg-stone-100/60 border border-stone-200/50 p-2 sm:p-3 rounded-2xl" id="dietary-filters-panel">
                  <span className="text-[10px] sm:text-xs font-black text-stone-500 uppercase tracking-widest pl-2 pr-1 mr-1 select-none">
                    {language === 'hy' ? 'Դիետիկ / Ալերգեններ՝' : 'Dietary & Allergies:'}
                  </span>
                  {[
                    { key: 'all', hy: 'Բոլորը 🍰', en: 'All Recipes 🍰' },
                    { key: 'gluten_free', hy: 'Առանց Գլյուտենի 🌾', en: 'Gluten-Free 🌾' },
                    { key: 'nut_free', hy: 'Առանց Ընկույզի 🥜', en: 'Nut-Free 🥜' },
                    { key: 'eggless', hy: 'Առանց Ձվի 🥚', en: 'Eggless / Vegan 🥚' }
                  ].map(diet => (
                    <button
                      key={diet.key}
                      onClick={() => setSelectedDietary(diet.key)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedDietary === diet.key
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs scale-102 font-black'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-850'
                      }`}
                      id={`dietary-filter-${diet.key}`}
                    >
                      {language === 'hy' ? diet.hy : diet.en}
                    </button>
                  ))}
                </div>

                {/* Grid Products Cards display loop */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-stone-50 border border-dashed border-stone-200 rounded-3xl p-12 text-center h-80 flex flex-col justify-center items-center">
                    <p className="text-stone-800 font-serif font-bold text-lg mb-2">
                      {language === 'hy' ? 'Ոչինչ չի գտնվել' : 'No sweets matching the terms'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {language === 'hy' ? 'Ձեր որոնման տերմիններով քաղցրավենիք չգտնվեց: Փորձեք այլ բառափունջ:' : 'Try looking for general cakes, gata, or makaron.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        language={language}
                        onAddToCart={handleAddToCart}
                        onCustomize={(product) => { setActiveCustomizerProduct(product); }}
                        onAskAI={(product) => setInquiredProduct(product)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* BREATHTAKING PROMO SECTIONS */}
              <section className="bg-stone-50 border-y border-stone-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  
                  {/* Promo image card */}
                  <div className="relative rounded-3xl overflow-hidden aspect-video shadow-sm order-last lg:order-first border border-stone-200">
                    <img 
                      src="https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800" 
                      alt="Artisan kitchen" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center p-6 text-center">
                      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl max-w-sm shadow border border-stone-200">
                        <span className="text-rose-600 font-extrabold text-[10px] tracking-widest uppercase block mb-1">
                          {language === 'hy' ? 'Հոբելյանական Առաջարկ' : 'Anniversary Promo Code'}
                        </span>
                        <h4 className="font-serif font-bold text-stone-800 text-base mb-2">
                          {language === 'hy' ? '10% ԶԵՂՉ ԱՌԱՋԻՆ ՊԱՏՎԵՐԻ ՀԱՄԱՐ' : '10% DISCOUNT ON YOUR FIRST FEAST'}
                        </h4>
                        <div className="bg-stone-55 border border-dashed border-stone-300 py-1.5 px-3 rounded-xl font-mono text-xs text-stone-800 font-extrabold select-all cursor-pointer">
                          SWEETARMENIA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promo narrative */}
                  <div className="space-y-6">
                    <span className="text-xs uppercase font-mono font-bold text-rose-500 block">
                      {language === 'hy' ? 'Ինչու ընտրել մեզ' : 'Core Patisserie Pillars'}
                    </span>
                    <h3 className="font-serif text-2.5xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {language === 'hy' 
                        ? 'Յուրաքանչյուր շերտ պատրաստված է բացառիկ խնամքով և սիրով' 
                        : 'Every Single Sheet Folded, Whipped, and Styled with Absolute Care'}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      {language === 'hy'
                        ? 'Մեր փորձառու հրուշակագործներն օգտագործում են միայն բնական կարագ, ընտրովի հայկական մեղր, բարձրորակ բելգիական շոկոլադ և թարմ հատապտուղներ։ Ոչ մի հավելում կամ արհեստական կոնսերվանտ․ միայն մաքուր համ և վաղնջական ավանդական բաղադրատոմսեր։'
                        : 'Our certified master bakers reject laboratory presets. We combine pure churning butter, exquisite unpasteurized organic Armenian mountain honey, rich single-origin dark chocolate, and locally harvested berries.'}
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start space-x-3 text-xs text-gray-700">
                        <span className="p-1 bg-green-100 text-green-700 rounded-md">✓</span>
                        <div>
                          <p className="font-bold">{language === 'hy' ? '3D Secure սիմուլացված վճարումներ' : 'Simulated Secure Transactions'}</p>
                          <p className="text-gray-400 text-[10px]">{language === 'hy' ? 'Վճարեք քարտով կամ Իդրամով վայրկյանների ընթացքում:' : 'Experience fluid card processing or scan Idram QR code mockup.'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 text-xs text-gray-700">
                        <span className="p-1 bg-green-100 text-green-700 rounded-md">✓</span>
                        <div>
                          <p className="font-bold">{language === 'hy' ? 'Քայլ առ քայլ կարգավիճակի հետևում' : 'Baking Progress Stepper'}</p>
                          <p className="text-gray-400 text-[10px]">{language === 'hy' ? 'Ականատես եղեք, թե ինչպես է տորթը թխվում և առաքվում ռեալ-թայմ քարտեզներով:' : 'Watch how chefs decorate and dispatch order in real-time stages.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* TESTIMONIALS REVIEW CONTAINER WITH BENTO SUBMISSION PANEL */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="font-mono text-xs uppercase text-rose-600 font-bold block mb-1">
                    {t.reviewsTitle}
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                    {language === 'hy' ? 'Ի՞նչ են ասում մեր սիրելի հաճախորդները' : 'Praise from our lovely customers'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Reviews List Column */}
                  <div className="lg:col-span-8 flex flex-col space-y-4">
                    
                    {/* Star Rating Filters Panel Row */}
                    <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-stone-200" id="review-stars-filter-panel">
                      <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider select-none">
                        {language === 'hy' ? 'Ֆիլտրել ըստ գնահատականի՝' : 'Filter by rating:'}
                      </span>
                      {[
                        { key: 'all', hy: 'Բոլորը 🌟', en: 'All 🌟' },
                        { key: 5, hy: '5 ★', en: '5 ★' },
                        { key: 4, hy: '4 ★', en: '4 ★' },
                        { key: 3, hy: '3 ★', en: '3 ★' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setSelectedReviewRating(item.key as any)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border transition cursor-pointer ${
                            selectedReviewRating === item.key
                              ? 'bg-amber-500 border-amber-500 text-white font-bold'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-605'
                          }`}
                          id={`review-filter-${item.key}`}
                        >
                          {language === 'hy' ? item.hy : item.en}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[600px] overflow-y-auto pr-2 scrollbar-custom">
                      <AnimatePresence>
                        {(() => {
                          const filteredTestimonials = liveTestimonials.filter(t => {
                            if (selectedReviewRating === 'all') return true;
                            return t.rating === selectedReviewRating;
                          });

                          if (filteredTestimonials.length === 0) {
                            return (
                              <div className="col-span-1 sm:col-span-2 bg-stone-50 border border-dashed border-stone-200 rounded-3xl p-10 text-center flex flex-col justify-center items-center h-48 select-none">
                                <span className="text-xl mb-1">⭐</span>
                                <p className="text-stone-700 font-bold text-xs">
                                  {language === 'hy' ? 'Այս գնահատականով կարծիք չկա' : 'No testimonials for this rating yet.'}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-1">
                                  {language === 'hy' ? 'Եղեք առաջինը և թողեք Ձեր կարծիքը' : 'Be the first to submit a custom review!'}
                                </p>
                              </div>
                            );
                          }

                          return filteredTestimonials.map((test) => {
                            const clientName = language === 'hy' ? test.nameHy : test.nameEn;
                            const clientLoc = language === 'hy' ? test.locationHy : test.locationEn;
                            const comment = language === 'hy' ? test.commentHy : test.commentEn;
                            const prodName = language === 'hy' ? test.productNameHy : test.productNameEn;

                            return (
                              <motion.div 
                                key={test.id} 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-5 rounded-2.5xl border border-stone-150 shadow-xs flex flex-col justify-between h-48 hover:shadow-xs transition"
                              >
                                <div>
                                  <div className="flex text-amber-500 gap-0.5 text-xs mb-3">
                                    {Array.from({ length: test.rating }).map((_, i) => (
                                      <span key={i}>★</span>
                                    ))}
                                    {Array.from({ length: 5 - test.rating }).map((_, i) => (
                                      <span key={i} className="text-stone-200">★</span>
                                    ))}
                                  </div>
                                  <p className="text-stone-605 text-xs italic leading-relaxed line-clamp-3">
                                    "{comment}"
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2.5 pt-3.5 border-t border-stone-100 mt-2">
                                  <img 
                                    src={test.avatar} 
                                    alt={clientName} 
                                    className="w-8.5 h-8.5 rounded-full object-cover border border-stone-150" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-stone-850 truncate">{clientName}</p>
                                    <p className="text-[9px] text-stone-400 font-medium truncate">
                                      {clientLoc} • <span className="text-rose-500 font-semibold">{prodName}</span>
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          });
                        })()}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Submission Bento Panel Column */}
                  <div className="lg:col-span-4 bg-white border border-stone-200 p-6 rounded-3xl shadow-xs">
                    <div className="mb-4">
                      <h4 className="font-serif font-bold text-stone-800 text-base">
                        {language === 'hy' ? 'Թողնել Կարծիք' : 'Write a Review'}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {language === 'hy' ? 'Կիսվեք Ձեր քաղցր փորձով մյուսների հետ' : 'Share your gourmet experience with the world'}
                      </p>
                    </div>

                    {currentUser ? (
                      <form onSubmit={handleAddReview} className="space-y-4">
                        
                        {/* Selected Product Dropdown */}
                        <div>
                          <label className="text-[10.5px] font-bold text-stone-600 block mb-1">
                            {language === 'hy' ? 'Ընտրեք Քաղցրավենիքը' : 'Select Cake / Pastry'}
                          </label>
                          <select
                            value={reviewProduct}
                            onChange={(e) => setReviewProduct(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-800 outline-none focus:bg-white focus:border-rose-450 transition"
                          >
                            {initialProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {language === 'hy' ? p.nameHy : p.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Star Rating Select */}
                        <div>
                          <label className="text-[10.5px] font-bold text-stone-600 block mb-1">
                            {language === 'hy' ? 'Գնահատական' : 'Stars Rating'}
                          </label>
                          <div className="flex gap-1.5 text-base">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className={`transition cursor-pointer ${
                                  star <= reviewRating ? 'text-amber-500 hover:scale-110' : 'text-stone-200 hover:text-amber-200'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Name */}
                        <div>
                          <label className="text-[10.5px] font-bold text-stone-600 block mb-1">
                            {language === 'hy' ? 'Ձեր Անունը (ըստ ցանկության)' : 'Your Name (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder={currentUser.fullName}
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs outline-none focus:bg-white focus:border-rose-450 transition"
                          />
                        </div>

                        {/* Comment Input */}
                        <div>
                          <label className="text-[10.5px] font-bold text-stone-600 block mb-1">
                            {language === 'hy' ? 'Ձեր Կարծիքը' : 'Your Review Comment'}
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder={language === 'hy' ? 'Ինչպե՞ս հավանեցիք համը, ձևավորումն ու առաքումը...' : 'Write your review here...'}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs outline-none focus:bg-white focus:border-rose-450 transition resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-rose-600 hover:bg-rose-550 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs transition duration-300 transform active:scale-95 cursor-pointer"
                        >
                          {language === 'hy' ? 'Հաստատել Կարծիքը' : 'Submit Review'}
                        </button>

                      </form>
                    ) : (
                      <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 text-center">
                        <span className="text-xl block mb-2">🔒</span>
                        <p className="text-stone-850 font-serif font-bold text-xs mb-1.5">
                          {language === 'hy' ? 'Մուտքը պարտադիր է' : 'Sign-In Required'}
                        </p>
                        <p className="text-[10.5px] text-stone-400 mb-4 leading-normal">
                          {language === 'hy' ? 'Խնդրում ենք նախ մուտք գործել կամ գրանցվել՝ կարծիք թողնելու համար:' : 'To post standard reviews please authenticate yourself first.'}
                        </p>
                        <button
                          onClick={() => setIsAuthOpen(true)}
                          className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[10.5px] px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          {language === 'hy' ? 'Մուտք / Գրանցում' : 'Sign In Now'}
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              </section>

            </motion.div>
          )}

          {/* VIEW 2: INTERACTIVE CHECKOUT SCREEN */}
          {activeView === 'checkout' && (
            <motion.div
              key="checkout-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              {currentUser === null ? (
                <WelcomeGateway
                  language={language}
                  onLoginSuccess={handleLoginSuccess}
                  customTitle={language === 'hy' ? 'Ձևակերպել Պատվերը 🛍️' : 'Complete Your Order 🛍️'}
                  customHeaderBadge={language === 'hy' ? 'ՊԱՏՎԵՐԻ ՊԱՀՊԱՆՈՒՄ' : 'CHECKOUT SECURED'}
                  customSubtitle={
                    language === 'hy'
                      ? 'Պատվերը հաստատելու և առաքումը սիմուլյատորի քարտեզի վրա թրեք անելու համար, խնդրում ենք մուտք գործել կամ ստեղծել նոր հաշիվ։ Այն կտևի ընդամենը 15 վայրկյան:'
                      : 'To submit your organic sweets order and track the real-time courier simulator, please login or register a customer account now. Takes only 15 seconds!'
                  }
                />
              ) : (
                <CheckoutSection
                  language={language}
                  cartItems={cart}
                  totalAmount={subtotalPrice - Math.round(subtotalPrice * (discountPercent / 100)) + (subtotalPrice > 15000 ? 0 : 1000)} // Delivery charge
                  currentUser={currentUser}
                  onPlaceOrderSuccess={handlePlaceOrderSuccess}
                  onCancel={() => {
                    setActiveView('marketplace');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </motion.div>
          )}

          {/* VIEW 3: LIVE TRACKER AND RECEIPT */}
          {activeView === 'tracker' && activeTrackedOrder && (
            <motion.div
              key="tracker-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <OrderTracker
                order={activeTrackedOrder}
                language={language}
                onAdvanceStatus={handleAdvanceStatus}
                onClose={() => {
                  setActiveView('marketplace');
                  setActiveTrackedOrder(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* VIEW 4: USER SECURE PROFILE MANAGEMENT */}
          {activeView === 'profile' && (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              {currentUser === null ? (
                <WelcomeGateway
                  language={language}
                  onLoginSuccess={handleLoginSuccess}
                  customTitle={language === 'hy' ? 'Իմ պատվերների կարգավիճակը 🗺️' : 'My Active Orders & History 🗺️'}
                  customHeaderBadge={language === 'hy' ? 'ՀԱՇՎԻ ՄՈՒՏՔ' : 'SECURE VAULT'}
                  customSubtitle={
                    language === 'hy'
                      ? 'Դիտեք Ձեր ակտիվ հաստատված պատվերների թխման ու առաքման ընթացքը, ինչպես նաև ավարտված պատվերների հուշ-պատմությունը։ Մուտք գործեք Ձեր հաշիվը:'
                      : 'Track your approved live transport stages, find delivery status of your cakes or recall your sweet historic food memoirs in your secure vault profile.'
                  }
                />
              ) : (
                <div className="space-y-6">
                  {/* Order quick tracker section (Shows only if they have active order and is on profile view) */}
                  {latestActiveOrder && (
                    <div className="mx-4 sm:mx-8 lg:mx-12 mt-6">
                      <section className="bg-stone-900 text-white py-4.5 px-4 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
                        <span className="absolute -top-1/2 left-1/3 w-80 h-80 bg-stone-800/50 rounded-full blur-2xl" />
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                          <div className="flex items-center space-x-3 text-center sm:text-left">
                            <div className="p-2 bg-white/10 rounded-xl shrink-0">
                              <ShoppingBag className="w-5 h-5 text-yellow-300 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-xs uppercase font-bold tracking-widest text-stone-400 block">
                                {language === 'hy' ? 'Ունեք ակտիվ պատվեր' : 'Active Order in Queue'}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                ID: <span className="font-mono">{latestActiveOrder.id}</span> • {language === 'hy' ? 'Կարգավիճակ' : 'Status'}: <span className="underline font-bold font-serif text-rose-450">{translations[language][`status${latestActiveOrder.status.charAt(0).toUpperCase() + latestActiveOrder.status.slice(1)}` as keyof typeof translations['hy']]}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2.5 shrink-0 self-center md:self-auto w-full md:w-auto justify-center md:justify-end">
                            <button
                              onClick={() => {
                                setActiveTrackedOrder(latestActiveOrder);
                                setActiveView('tracker');
                              }}
                              className="bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs px-5 py-2.5 rounded-lg border border-white transition shadow transform active:scale-95 cursor-pointer"
                              id="track-active-bar-btn"
                            >
                              {t.statusCheck}
                            </button>
                            <button
                              onClick={() => handleConfirmReceipt(latestActiveOrder.id)}
                              className="bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg border border-green-600 transition shadow transform active:scale-95 cursor-pointer"
                              id="confirm-receipt-bar-btn"
                              title={language === 'hy' ? 'Հաստատել պատվերի ստացումը' : 'Confirm delivery receipt'}
                            >
                              {latestActiveOrder.status === 'delivered' ? (
                                <span>{language === 'hy' ? 'Հաստատել Ստացումը' : 'Confirm Receipt'}</span>
                              ) : (
                                <span>{language === 'hy' ? 'Հաստատել' : 'Confirm'}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  <UserProfile
                    language={language}
                    currentUser={currentUser}
                    onUpdateUser={(updated) => setCurrentUser(updated)}
                    orderHistory={orderHistory}
                    onBackToShopping={() => {
                      setActiveView('marketplace');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onTrackOrder={(order) => {
                      setActiveTrackedOrder(order);
                      setActiveView('tracker');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onAdvanceStatus={handleAdvanceStatus}
                    onConfirmReceipt={handleConfirmReceipt}
                  />
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg transition transform active:scale-95 cursor-pointer z-30 opacity-90"
        title="Scroll to Top"
        id="scroll-to-top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* FOOTER SECTION */}
      <footer className="bg-stone-900 text-stone-100 py-12 border-t border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center text-rose-500 font-bold text-sm">
                🍰
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white block">
                {t.appName}
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {t.appSlogan} • {t.heroDesc.split('。')[0]}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-350 uppercase tracking-widest mb-4">
              {language === 'hy' ? 'ԿԱՏԵԳՈՐԻԱՆԵՐ' : 'SWEET STOCKS'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><button onClick={() => { setSelectedCategory('cakes'); catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">{t.cakes}</button></li>
              <li><button onClick={() => { setSelectedCategory('armenian_sweets'); catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">{t.armenian_sweets}</button></li>
              <li><button onClick={() => { setSelectedCategory('pastries'); catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">{t.pastries}</button></li>
              <li><button onClick={() => { setSelectedCategory('cupcakes'); catalogRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition cursor-pointer">{t.cupcakes}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-350 uppercase tracking-widest mb-4">
              {language === 'hy' ? 'ՓՈՐՁՆԱԿԱՆ ՊՐՈՄՈ' : 'SAMPLES COUPONS'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <span className="block font-semibold">SWEETARMENIA</span>
                <span className="text-[10px] text-stone-500">{language === 'hy' ? '10% Զեղչ տորթերի համար' : '10% off custom cakes'}</span>
              </li>
              <li>
                <span className="block font-semibold">HYBREAD</span>
                <span className="text-[10px] text-stone-500">{language === 'hy' ? '15% Զեղչ ավանդական քաղցրավենիքի համար' : '15% off traditional Armenian bread'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-350 uppercase tracking-widest mb-4">
              📍 {language === 'hy' ? 'ՀԱՍՑԵՆԵՐ' : 'OUR BAKERY HUB'}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              ք. Երևան, Աբովյան Փողոց 20/4<br />
              ք. Երևան, Մաշտոցի Պողոտա 5<br />
              <span className="block mt-2 font-mono text-[11px] text-rose-450">📞 +374 10 554433</span>
              <span className="block font-mono text-[11px] text-stone-500">✉️ support@dulcecakes.am</span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-stone-850 text-center text-[11px] text-stone-500 font-mono">
          <p>© {new Date().getFullYear()} {t.appName}. Designed & Authored with love in Armenia.</p>
        </div>
      </footer>

      {/* Floating Active Success toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 py-3.5 px-5 rounded-2xl shadow-xl flex items-center space-x-2.5 border text-xs font-extrabold bg-stone-900 border-stone-800 text-white shadow-stone-200/55"
            id="toast-notification"
          >
            <span>✨</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Back-of-House Advisor Chat Overlay */}
      <AIAdvisor
        language={language}
        currentUser={currentUser}
        onAuthClick={() => setIsAuthOpen(true)}
        onCustomize={(product) => setActiveCustomizerProduct(product)}
        onProductClick={(p) => {
          const el = document.getElementById(p.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // add active border or highlight
            el.classList.add("ring-4", "ring-rose-500", "ring-offset-2");
            setTimeout(() => {
              el.classList.remove("ring-4", "ring-rose-500", "ring-offset-2");
            }, 3000);
          }
        }}
        inquiredProduct={inquiredProduct}
        onClearInquiredProduct={() => setInquiredProduct(null)}
      />

      {/* Cart Drawer Overlay Panel */}
      <CartDrawer
        language={language}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        currentUser={currentUser}
        onAuthClick={() => { setIsCartOpen(false); setIsAuthOpen(true); }}
        promoInput={promoInput}
        setPromoInput={setPromoInput}
        discountPercent={discountPercent}
        promoFeedback={promoFeedback}
        pasted={pasted}
        onApplyPromo={handleApplyPromo}
      />

      {/* Account Registry Modal */}
      <AuthModal
        language={language}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Multi layered Customizer Modal Panel */}
      {activeCustomizerProduct && (
        <CustomizerModal
          product={activeCustomizerProduct}
          language={language}
          isOpen={activeCustomizerProduct !== null}
          onClose={() => setActiveCustomizerProduct(null)}
          onAddCustomizedToCart={handleAddCustomizedToCart}
        />
      )}

    </div>
  );
}

// Inline Custom dummy icon markers to prevent uninstalled external libraries dependencies:
function CupcakeDummy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m11 2 3 3-3 3-3-3z"/>
      <path d="M12 5v14"/>
      <path d="M14 19a4 4 0 0 1-8 0v-4c0-2.2 1.8-4 4-4s4 1.8 4 4Z"/>
      <path d="M2 15h20"/>
    </svg>
  );
}
