/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Check, 
  GripHorizontal,
  Paperclip,
  Image as ImageIcon,
  Phone
} from "lucide-react";
import { Language, User as UserType, Product } from "../types";
import { initialProducts } from "../productsData";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  image?: string; // base64 or objectUrl to render user uploaded picture inline
  recommendedProducts?: string[]; // array of product IDs returned from Gemini
}

interface AIAdvisorProps {
  language: Language;
  currentUser: UserType | null;
  onAuthClick: () => void;
  onCustomize?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  inquiredProduct?: Product | null;
  onClearInquiredProduct?: () => void;
}

export default function AIAdvisor({ 
  language, 
  currentUser, 
  onAuthClick,
  onCustomize,
  onProductClick,
  inquiredProduct,
  onClearInquiredProduct
}: AIAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Image Upload States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);

  const t = {
    hy: {
      buttonTitle: "AI Խորհրդատու",
      chatHeader: "Dulce AI Խորհրդատու",
      chatSlogan: "Ինչպե՞ս կարող եմ Ձեզ քաղցրացնել այսօր",
      inputPlaceholder: "Հարցրեք տորթերի, ալերգենների կամ խորհուրդների մասին...",
      suggestedTitle: "Հաճախակի տրվող հարցեր՝",
      offlineMsg: "AI Ծառայությունն անցանց է",
      suggest1: "Խորհուրդ տվեք տորթ մանկական ծննդի համար 🍰",
      suggest2: "Որո՞նք են նուշով կամ առանց գլյուտենի թխվածքները 🥜",
      suggest3: "Ինչո՞վ է յուրահատուկ Միկադո տորթը 🍫",
      suggest4: "Ավանդական հայկական Գաթայի բաղադրատոմսի գաղտնիքը 🥨",
      minimizedTitle: "Բացել զրույցը",
      clearConvo: "Մաքրել զրույցը",
      attachmentTip: "Կցել նկար",
      sizeLimitError: "Նկարի չափը չպետք է գերազանցի 5MB-ը",
    },
    en: {
      buttonTitle: "AI Advisor",
      chatHeader: "Dulce AI Assistant",
      chatSlogan: "How can I sweeten your day today?",
      inputPlaceholder: "Ask about custom cakes, allergy tips, recipe ideas...",
      suggestedTitle: "Suggested Questions:",
      offlineMsg: "AI Service Offline",
      suggest1: "Recommend a cake for a kids birthday bash 🍰",
      suggest2: "Which sweets are gluten-free or contain nuts? 🥜",
      suggest3: "What makes the Royal Mikado cake special? 🍫",
      suggest4: "What is the secret behind traditional Armenian Gata? 🥨",
      minimizedTitle: "Resume Chat",
      clearConvo: "Clear Chat History",
      attachmentTip: "Attach cake picture",
      sizeLimitError: "Image size must not exceed 5MB",
    }
  }[language];

  // Initialize with initial AI greeting based on currentUser status
  useEffect(() => {
    if (messages.length === 0) {
      const greetingText = language === "hy"
        ? currentUser
          ? `Բարև Ձեզ, սիրելի ${currentUser.fullName}։ 🍰 Ես «Dulce Cakes» հրուշակարանի Ձեր անձնական AI Խորհրդատուն եմ։\n\nՔանի որ Դուք գրանցված եք և մուտք եք գործել Ձեր հաշվով (${currentUser.email}), ես կարող եմ անմիջապես օգնել Ձեզ նախագծել կամ ընտրել տորթը և նախնական գրանցել պատվեր Ձեր տվյալներով։ ✨\n\nՀարցրեք ինձ կատալոգի, բաղադրիչների մասին կամ ուղարկեք Ձեր նախընտրած տորթի նկարը 📎, որպեսզի առաջարկեմ մեր նմուշներից։`
          : "Բարև Ձեզ։ 🍰 Ես Dulce Cakes-ի Ձեր անձնական AI Խորհրդատուն եմ։ Հարցրեք ինձ մեր տեղական տորթերի, ավանդական հայկական քաղցրավենիքի կամ ալերգենների վերաբերյալ։ Ինչպե՞ս կարող եմ օգնել։ ✨\n\n*Հիշեցում: Պատվեր գրանցելու համար անհրաժեշտ է գրանցվել կայքում և պարտադիր կապվել մեզ հետ (+374 10 554433)։*"
        : currentUser
          ? `Welcome, dear ${currentUser.fullName}! 🍰 I am your personal AI Sweets Advisor at Dulce Cakes.\n\nSince you are logged in (${currentUser.email}), I can help you custom design, choose, and immediately draft layout details for your order under your account! ✨\n\nAsk me about our recipes, pricing, or attach your favorite cake design picture 📎 to receive matched sample suggestions.`
          : "Hello! 🍰 I am your personal AI Cake Advisor at Dulce Cakes. Ask me anything about our custom cake setups, traditional Armenian treats, or ingredient advice. How can I help you today? ✨\n\n*Reminder: To submit an order, you are required to sign up or log in AND make direct contact with our lounge (+374 10 554433).*";

      setMessages([
        {
          id: "welcome",
          role: "model",
          text: greetingText,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, messages.length, currentUser]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen, isMinimized, isExpanded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t.sizeLimitError);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !selectedImage) return;
    if (isLoading) return;

    // Capture files & text before clearing
    const currentText = textToSend.trim();
    const currentImage = selectedImage;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: currentText || (language === "hy" ? "[Կցված նկար]" : "[Attached Image]"),
      timestamp: new Date(),
      image: currentImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setSelectedImage(null);
    setIsLoading(true);
    setErrorStatus(null);

    // Map existing messaging state in thread to role-based blocks
    const chatHistory = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({
        role: m.role,
        text: m.text
      }));

    try {
      const response = await fetch("/api/helper/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentText || (language === "hy" ? "Վերլուծիր այս նկարը և համեմատիր մեր կատալոգի հետ:" : "Analyze this image and match it with our official catalog cakes:"),
          language: language,
          chatHistory: chatHistory,
          currentUser: currentUser, // Real current user context passed dynamically!
          image: currentImage ? currentImage.split(",")[1] : null // raw base64 data stream
        })
      });

      if (!response.ok) {
        throw new Error("Server responded with error context.");
      }

      const data = await response.json();

      // Extract recommended product IDs [PRODUCT: pX]
      const productRegex = /\[PRODUCT:\s*(p\d+)\]/gi;
      const matchedProductIds: string[] = [];
      let match;
      while ((match = productRegex.exec(data.reply)) !== null) {
        matchedProductIds.push(match[1]);
      }

      // Clean raw product tags from user-facing text
      const cleanReplyText = data.reply.replace(/\[PRODUCT:\s*p\d+\]/gi, "").trim();
      
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "model",
        text: cleanReplyText || (language === "hy" ? "Ահա մեր առաջարկած նմուշը կայքից․" : "Here is our suggested sample from the site:"),
        timestamp: new Date(),
        recommendedProducts: matchedProductIds.length > 0 ? matchedProductIds : undefined
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("Failed to fetch response:", err);
      setErrorStatus(language === "hy" ? "Կապի խափանում: Ստուգեք Ձեր ինտերնետ կապը:" : "Connection issue. Please re-check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inquiredProduct) {
      setIsOpen(true);
      setIsMinimized(false);
      
      const productName = language === 'hy' ? inquiredProduct.nameHy : inquiredProduct.nameEn;
      const question = language === 'hy'
        ? `Խնդրում եմ պատմիր ավելին «${productName}»-ի պատրաստման, բաղադրիչների, ալերգենների և առանձնահատկությունների մասին: ✨`
        : `Please tell me more about the "${productName}" - its preparation, unique ingredients, allergens, and why it is a culinary masterpiece. ✨`;
      
      handleSendMessage(question);
      onClearInquiredProduct?.();
    }
  }, [inquiredProduct, language]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClearHistory = () => {
    if (window.confirm(language === "hy" ? "Ցանկանո՞ւմ եք մաքրել զրույցների պատմությունը:" : "Are you sure you want to clear your chat history?")) {
      setMessages([]);
      setErrorStatus(null);
    }
  };

  return (
    <>
      {/* Floating Toggle trigger circle and text */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center space-x-3">
        <AnimatePresence>
          {(!isOpen && !isMinimized) && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
                setErrorStatus(null);
              }}
              className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-550 text-white font-extrabold text-xs px-5 py-4 rounded-full shadow-lg hover:shadow-rose-300/40 transition-all duration-300 transform active:scale-95 cursor-pointer"
              id="ai-helper-btn"
            >
              <Sparkles className="w-4.5 h-4.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>{t.buttonTitle}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Minimized Dock Bar */}
        <AnimatePresence>
          {isMinimized && (
            <motion.button
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              onClick={() => setIsMinimized(false)}
              className="flex items-center space-x-3 bg-stone-900 border border-stone-855 text-white px-5 py-3 rounded-full shadow-xl hover:bg-stone-800 transition cursor-pointer transform active:scale-95 group"
              id="ai-helper-minimized-btn"
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-yellow-300 fill-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </div>
              <div className="text-left text-[11px] leading-tight">
                <span className="font-extrabold block text-rose-350">{t.chatHeader}</span>
                <span className="text-[9.5px] text-stone-400 font-medium group-hover:text-stone-300 transition-colors">
                  {t.minimizedTitle} • {messages.length} հաղորդագրություն
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 rotate-180 group-hover:text-stone-300 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-out Sidebar Chat Drawer panel (Draggable on Desktop) */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            ref={dragContainerRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            
            // Frame Motion Drag Controls (Enabled on Desktop Screens only)
            drag={window.innerWidth >= 768}
            dragMomentum={false}
            dragElastic={0.06}
            dragConstraints={{
              left: 10,
              right: window.innerWidth - (isExpanded ? 700 : 470),
              top: 10,
              bottom: window.innerHeight - 600
            }}
            
            className={`fixed z-50 rounded-3xl border border-stone-200/95 shadow-2xl overflow-hidden flex flex-col bg-white
              bottom-24 left-6 
              w-[calc(100vw-32px)] sm:w-[420px] 
              ${isExpanded ? 'md:w-[680px]' : 'md:w-[450px]'}
              h-[calc(100vh-130px)] max-h-[640px] min-h-[480px]
              transition-all duration-300 ease-out`}
            id="ai-advisor-container"
          >
            {/* Draggable Header Grip Indicator (Visible on Desktop) */}
            <div className="hidden md:flex items-center justify-center bg-stone-900 border-b border-stone-850 py-1 cursor-grab active:cursor-grabbing text-stone-500 hover:text-stone-300 transition-colors shrink-0">
              <GripHorizontal className="w-5 h-3" />
            </div>

            {/* Header segment banner */}
            <div className="bg-stone-900 text-white p-4.5 flex items-center justify-between border-b border-stone-850 relative shrink-0">
              <div className="flex items-center space-x-3 select-none">
                <div className="w-10 h-10 bg-rose-600/25 rounded-full flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-inner">
                  <Sparkles className="w-5 h-5 fill-rose-500 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-serif font-bold text-[15.5px] tracking-tight">{t.chatHeader}</h3>
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-xs" />
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium">{t.chatSlogan}</p>
                </div>
              </div>

              {/* Utility actions icons stack */}
              <div className="flex items-center space-x-1">
                {/* Trash/Clear capability */}
                {messages.length > 1 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-rose-400 transition cursor-pointer"
                    title={t.clearConvo}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Desktop Expand functionality */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:block p-1.5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Minimize function */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-yellow-450 transition cursor-pointer"
                  title="Minimize chat window"
                >
                  <ChevronDown className="w-4.5 h-4.5" />
                </button>

                {/* Absolute Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-rose-500 transition cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Chat Body messages area */}
            <div className="flex-grow p-4.5 overflow-y-auto space-y-4 bg-stone-55 flex flex-col scrollbar-custom">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`flex items-start max-w-[92%] space-x-2 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                    
                    {/* Role icon badge */}
                    <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border text-xs shrink-0 select-none shadow-xs ${
                      m.role === "user" 
                        ? "bg-rose-100 border-rose-200 text-rose-700" 
                        : "bg-white border-stone-200 text-stone-600"
                    }`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble container */}
                    <div className={`group relative p-3.5 rounded-2.5xl text-[12.5px] leading-relaxed shadow-xs transition-shadow hover:shadow-sm ${
                      m.role === "user"
                        ? "bg-rose-600 text-white rounded-tr-none"
                        : "bg-white text-stone-850 rounded-tl-none border border-stone-200/90"
                    }`}>
                      {/* Inline Customer Image Display */}
                      {m.image && (
                        <div className="block rounded-xl overflow-hidden mb-2 max-w-[200px] border border-rose-205 shadow-xs bg-stone-100">
                          <img src={m.image} alt="Cake Inspiration" className="w-full h-auto object-cover max-h-48" referrerPolicy="no-referrer" />
                        </div>
                      )}

                      {/* Formatted Text */}
                      <p className="whitespace-pre-wrap select-text selection:bg-rose-200 font-medium">{m.text}</p>
                      
                      <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-100/10 md:border-stone-100/20">
                        {/* Copy button helper */}
                        <button
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className={`invisible group-hover:visible inline-flex items-center space-x-1 text-[9.5px] transition-all cursor-pointer ${
                            m.role === "user" ? "text-rose-200 hover:text-white" : "text-stone-400 hover:text-rose-600"
                          }`}
                          title="Copy text content"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 font-bold font-mono">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="font-medium text-[9px]">Copy</span>
                            </>
                          )}
                        </button>

                        <span className={`block text-[8.5px] font-mono shrink-0 select-none ${
                          m.role === "user" ? "text-rose-200" : "text-stone-400"
                        }`}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Catalog Samples (IF present on assistant message) */}
                  {m.role === "model" && m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="ml-9.5 mt-3 max-w-[92%] w-full self-start overflow-hidden">
                      <div className="flex items-center space-x-1 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">
                          {language === "hy" ? "🍰 ԱՌԱՋԱՐԿՎՈՂ ՆՄՈՒՇՆԵՐԸ ԿԱՅՔԻՑ" : "🍰 RECOMMEND SPECS FROM OUR CATALOG"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                        {initialProducts
                          .filter(p => m.recommendedProducts?.includes(p.id))
                          .map(product => {
                            const desc = language === "hy" 
                              ? product.descriptionHy 
                              : product.descriptionEn;
                            const title = language === "hy" 
                              ? product.nameHy 
                              : product.nameEn;
                            return (
                              <div 
                                key={product.id} 
                                className="bg-white rounded-2xl border border-rose-100/80 hover:border-rose-300 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                              >
                                <div>
                                  <div className="relative h-24 rounded-xl overflow-hidden mb-2 shadow-inner group overflow-hidden bg-stone-50">
                                    <img 
                                      src={product.image} 
                                      alt={title} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="absolute top-1.5 right-1.5 bg-rose-600/90 text-white text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold shadow-xs">
                                      {product.price.toLocaleString()}֏
                                    </span>
                                  </div>
                                  <h4 className="font-serif font-black text-xs text-stone-850 truncate leading-tight">
                                    {title}
                                  </h4>
                                  <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                                    {desc}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-100/50 shrink-0">
                                  <button
                                    onClick={() => onProductClick?.(product)}
                                    className="flex-grow bg-stone-100 hover:bg-stone-200 hover:text-stone-900 text-stone-700 text-[10px] font-black py-1.5 rounded-xl transition cursor-pointer text-center"
                                  >
                                    {language === "hy" ? "Տեսնել 👁️" : "View Spec 👁️"}
                                  </button>
                                  {product.isCustomizable && onCustomize && (
                                    <button
                                      onClick={() => onCustomize?.(product)}
                                      className="flex-grow bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black py-1.5 rounded-xl transition cursor-pointer text-center shadow-xs"
                                    >
                                      {language === "hy" ? "Դիզայն 🎨" : "Design 🎨"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-100 p-2.5 rounded-xl italic mt-2 leading-relaxed text-center">
                        {language === "hy" 
                          ? "Հավանեցի՞ք այս տարբերակները: Եթե ոչ, խնդրում ենք սեղմել «Կապ Զանգով» կամ զանգահարել +374 10 554433՝ Ձեր էսքիզով բացառիկ ձևավորում քննարկելու համար։" 
                          : "Do you like these options? If not, please click \"Call Lounge\" or phone +374 10 554433 to discuss a 100% bespoke order with our design chefs! ✨"}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-[80%] space-x-2">
                    <div className="w-7.5 h-7.5 rounded-full flex items-center justify-center bg-white border border-stone-200 text-stone-600 shrink-0 select-none animate-spin">
                      <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="p-3 bg-white border border-stone-150 rounded-2xl rounded-tl-none text-[11px] text-stone-500 flex items-center shadow-xs">
                      <span className="flex space-x-1.5 py-1 px-2 font-black">
                        <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Suggestion Chips helper items inside scroll flow */}
              {messages.length < 4 && !isLoading && (
                <div className="p-3 bg-stone-100/50 rounded-2.5xl border border-stone-150 space-y-2 select-none">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest block">
                    {t.suggestedTitle}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {[t.suggest1, t.suggest2, t.suggest3, t.suggest4].map((s_text, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s_text)}
                        className="text-[11.5px] text-left bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xl px-3.5 py-2 text-stone-700 hover:text-rose-700 transition font-medium cursor-pointer hover:shadow-xs active:scale-95 duration-150"
                      >
                        {s_text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error messages if any */}
              {errorStatus && (
                <div className="p-3.5 bg-rose-50 border border-rose-250 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs shadow-sm self-center shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <p className="font-medium">{errorStatus}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Strict Notice banner for orders */}
            <div className="bg-rose-50 border-t border-b border-rose-100 p-3.5 flex flex-col space-y-2 shrink-0 select-none">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[10.5px] text-stone-700 leading-normal">
                  {currentUser ? (
                    language === 'hy' ? (
                      <span>
                        Դուք <strong>մուտք եք գործել Ձեր անձնական հաշվով։</strong> AI-ն կարող է նախագծել և գրեցնել Ձեր պատվերի մանրամասները։ Այնուհետև կապ հաստատեք մեզ հետ՝ պատվերը հաստատելու համար։
                      </span>
                    ) : (
                      <span>
                        You have <strong>logged in to your account.</strong> Our AI can structure and draft details for your order. Simply place direct contact to confirm and book!
                      </span>
                    )
                  ) : (
                    language === 'hy' ? (
                      <span>
                        <strong>Պատվեր գրանցելու համար</strong> տեղեկատվությունը ստանալուց հետո պարտադիր է գրանցվել կայքում և կապվել մեզ հետ (+374 10 554433):
                      </span>
                    ) : (
                      <span>
                        <strong>To place an order</strong>, you are strictly required to register an account on our website and contact us (+374 10 554433) after receiving the details.
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 gap-2">
                {currentUser ? (
                  <span className="text-[10px] text-green-700 font-extrabold flex items-center space-x-1.5 truncate max-w-[55%]">
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                    <span className="truncate">{language === 'hy' ? 'Գրանցված է՝' : 'Logged in:'} {currentUser.fullName || currentUser.email}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAuthClick();
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all transform active:scale-95 cursor-pointer shadow-xs shrink-0"
                  >
                    {language === 'hy' ? 'Գրանցվել կայքում 👤' : 'Register Account 👤'}
                  </button>
                )}
                
                <a
                  href="tel:+37410554433"
                  className="bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all flex items-center space-x-1 shadow-xs shrink-0"
                >
                  <Phone className="w-3 h-3 text-white" />
                  <span>{language === 'hy' ? 'Կապ Զանգով' : 'Call Lounge'}</span>
                </a>
              </div>
            </div>

            {/* Input send terminal form with image upload preview block */}
            <div className="p-3.5 border-t border-stone-180 bg-white shrink-0 select-none">
              {/* Image Preview drawer if selected */}
              {selectedImage && (
                <div className="relative flex items-center bg-stone-50 border border-stone-200 p-2 rounded-xl mb-2 sm:mb-2.5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-300 bg-white shrink-0">
                    <img src={selectedImage} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1 -right-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="ml-2.5 text-left truncate">
                    <span className="text-[10.5px] font-bold text-stone-700 block truncate">
                      {language === "hy" ? "Կլցվի հաջորդ հաղորդագրության հետ" : "Attached to next message"}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">
                      {language === "hy" ? "Պատրաստ է Gemini-ի վերլուծությանը" : "Ready for Gemini analysis"}
                    </span>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center space-x-2"
              >
                {/* Hidden File input element */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Attachment paperclip trigger button */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 ${
                    selectedImage
                      ? "bg-rose-50 border-rose-350 text-rose-600"
                      : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-700"
                  }`}
                  title={t.attachmentTip}
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-grow bg-stone-50 border border-stone-205 focus:border-rose-450 focus:bg-white outline-none rounded-2xl py-2.5 px-4 text-xs text-stone-850 transition"
                  id="chat-input-text-field"
                />
                
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                  className={`p-2.5 rounded-2xl text-white transition cursor-pointer flex items-center justify-center shrink-0 shadow-sm ${
                    (inputValue.trim() || selectedImage) && !isLoading
                      ? "bg-rose-600 hover:bg-rose-550 transform active:scale-95"
                      : "bg-stone-205 text-stone-400 cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
