/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Order, Language } from '../types';
import { translations } from '../translations';
import { ChefHat, ShoppingBag, Truck, Gift, RefreshCw, Printer, AlertCircle, MapPin, Navigation, Clock, Gauge, Phone, AlertTriangle } from 'lucide-react';

interface OrderTrackerProps {
  order: Order;
  language: Language;
  onAdvanceStatus: (orderId: string) => void;
  onClose: () => void;
}

export default function OrderTracker({
  order,
  language,
  onAdvanceStatus,
  onClose,
}: OrderTrackerProps) {
  const t = translations[language];

  // Dynamic simulation values for traffic and Yerevan map routing
  const [trafficLevel, setTrafficLevel] = useState<number>(4);

  // Yerevan geocoder helper
  const addressLow = order.deliveryAddress ? order.deliveryAddress.toLowerCase() : '';
  let districtNameAndCoords = { name: 'Կենտրոն', lat: 40.1792, lng: 44.5152, baseMin: 7 };
  
  if (addressLow.includes('արաբկիր') || addressLow.includes('arabkir')) {
    districtNameAndCoords = { name: 'Արաբկիր', lat: 40.2079, lng: 44.5050, baseMin: 14 };
  } else if (addressLow.includes('աջափնյակ') || addressLow.includes('ajapnyak')) {
    districtNameAndCoords = { name: 'Աջափնյակ', lat: 40.1989, lng: 44.4756, baseMin: 18 };
  } else if (addressLow.includes('նոր նորք') || addressLow.includes('nor nork') || addressLow.includes('նորք')) {
    districtNameAndCoords = { name: 'Նոր Նորք', lat: 40.1972, lng: 44.5658, baseMin: 16 };
  } else if (addressLow.includes('մալաթիա') || addressLow.includes('malatia') || addressLow.includes('սեբաստիա')) {
    districtNameAndCoords = { name: 'Մալաթիա-Սեբաստիա', lat: 40.1738, lng: 44.4533, baseMin: 15 };
  } else if (addressLow.includes('շենգավիթ') || addressLow.includes('shengavit')) {
    districtNameAndCoords = { name: 'Շենգավիթ', lat: 40.1451, lng: 44.4851, baseMin: 14 };
  } else if (addressLow.includes('դավթաշեն') || addressLow.includes('davtashen') || addressLow.includes('դավիթաշեն')) {
    districtNameAndCoords = { name: 'Դավթաշեն', lat: 40.2217, lng: 44.4815, baseMin: 17 };
  } else if (addressLow.includes('էրեբունի') || addressLow.includes('erebuni')) {
    districtNameAndCoords = { name: 'Էրեբունի', lat: 40.1408, lng: 44.5323, baseMin: 12 };
  }

  // Choose consistent courier based on order id hash
  const couriersList = [
    { name: 'Արմեն 🛵', en: 'Armen 🛵', phone: '+374 94 99-88-77', vehicle: 'Vespa Sprint Red' },
    { name: 'Գոռ ⚡', en: 'Gor ⚡', phone: '+374 77 44-55-66', vehicle: 'Nissan Leaf Electric' },
    { name: 'Դավիթ 🏍️', en: 'David 🏍️', phone: '+374 55 12-34-56', vehicle: 'Yamaha Majesty' },
  ];
  const courierIdx = order.id ? (order.id.charCodeAt(order.id.length - 1) % couriersList.length) : 0;
  const currentCourier = couriersList[courierIdx];

  // Traffic multiplier calculations
  const multiplier = trafficLevel <= 3 ? 0.75 : trafficLevel <= 6 ? 1.25 : 1.95;
  const dynamicMinutes = Math.round(districtNameAndCoords.baseMin * multiplier);

  // Dynamic street alerts
  let trafficReport = '';
  if (language === 'hy') {
    if (trafficLevel <= 3) {
      trafficReport = 'Մայրաքաղաքի հիմնական պողոտաները (Մյասնիկյան, Բաղրամյան) լիովին ազատ են։ Առաքիչը շարժվում է առանց խոչընդոտների։';
    } else if (trafficLevel <= 6) {
      trafficReport = 'Կենտրոնում և կամուրջների հատվածներում նկատվում է միջին խտություն։ Առաքիչը շրջանցում է խցանումները։';
    } else {
      trafficReport = 'Ծանրաբեռնված երթևեկություն (Գարեգին Նժդեհ, Մյասնիկյան)։ Առաքումը կարող է փոքր-ինչ ձգձգվել։';
    }
  } else {
    if (trafficLevel <= 3) {
      trafficReport = 'Central streets of Yerevan are fully clear. Express dispatch is going smooth.';
    } else if (trafficLevel <= 6) {
      trafficReport = 'Moderate traffic density on some bridge crossings. Rerouting to prevent delay.';
    } else {
      trafficReport = 'Heavy bumper congestion on Garegin Nzhdeh and Myasnikyan streets. Slower travel pacing.';
    }
  }

  // Map status index
  const statusSteps = [
    { key: 'placed', label: t.statusPlaced, desc: t.statusPlacedDesc, icon: ShoppingBag, color: 'text-rose-500', bg: 'bg-rose-100' },
    { key: 'baking', label: t.statusBaking, desc: t.statusBakingDesc, icon: ChefHat, color: 'text-amber-500', bg: 'bg-amber-100' },
    { key: 'delivering', label: t.statusDelivering, desc: t.statusDeliveringDesc, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' },
    { key: 'delivered', label: t.statusDelivered, desc: t.statusDeliveredDesc, icon: Gift, color: 'text-green-500', bg: 'bg-green-100' }
  ];

  const currentIdx = statusSteps.findIndex(s => s.key === order.status);

  // Trigger browser print for receipt
  const handlePrint = () => {
    // Elegant printing mechanism targeting the receipt itself
    const printArea = document.getElementById('receipt-invoice-printa');
    if (!printArea) return;
    const originalContent = document.body.innerHTML;
    const printContent = printArea.innerHTML;
    
    // Inject styling for print
    document.body.innerHTML = `
      <html>
        <head>
          <title>Dulce_Sweets_Receipt_${order.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.5; color: #1f2937; }
            .font-mono { font-family: monospace; }
            .border { border: 1px solid #e5e7eb; }
            .p-4 { padding: 16px; }
            .mb-4 { margin-bottom: 16px; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 20px; }
            .text-rose-600 { color: #e11d48; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f9fafb; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    // Reload page slightly to bind original handles correctly without losing state
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white border border-stone-200 rounded-3xl shadow-xl mt-6 animate-fade-in" id={`order-tracker-${order.id}`}>
      
      {/* Header and top close button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-5 mb-6 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-850 px-3 py-1 rounded-full font-bold border border-stone-200">
            {t.orderTracker}
          </span>
          <h2 className="text-xl font-serif font-bold text-gray-800 tracking-tight mt-2">
            ID: <span className="text-stone-800 font-mono font-bold">{order.id}</span>
          </h2>
        </div>
        
        <div className="flex space-x-2">
          {/* Accelerator for mockup steps */}
          <button
            onClick={() => onAdvanceStatus(order.id)}
            className="px-3.5 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-200 transition select-none cursor-pointer"
            id={`advance-status-btn-${order.id}`}
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-stone-500" />
            <span>{t.advanceStatusBtn}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
            id="tracker-close-btn"
          >
            {language === 'hy' ? 'Կատալոգ' : 'Catalog'}
          </button>
        </div>
      </div>

      {/* Interactive Tracker Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {statusSteps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div 
              key={step.key} 
              className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-32 ${
                isActive 
                  ? 'bg-gradient-to-br from-white to-stone-50/10 border-stone-800 shadow shadow-stone-200/35' 
                  : isCompleted 
                    ? 'bg-stone-50/30 border-stone-150 text-slate-700' 
                    : 'bg-white border-stone-100 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${isCompleted ? step.bg : 'bg-gray-100'} ${isCompleted ? step.color : 'text-gray-400'}`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                {isCompleted && (
                  <span className="w-5 h-5 bg-stone-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <p className={`text-xs font-bold leading-none ${isActive ? 'text-stone-900 pb-0.5 border-b border-stone-900 inline-block' : 'text-gray-800'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 leading-normal line-clamp-2">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Delivery Map Simulator */}
      <div className="border border-stone-200 bg-stone-50/50 p-5 rounded-3xl mb-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full inline-block">
              🗺️ {language === 'hy' ? 'ԻՐԱԿԱՆ ՅԱՆԴԵՔՍ ՔԱՐՏԵԶ' : 'LIVE YANDEX MAP INTEGRATION'}
            </span>
            <h4 className="text-base font-serif font-black text-stone-900 mt-1 flex items-center gap-1.5">
              <span>{language === 'hy' ? 'Առաքման Իրական Ժամանակում Տրեկինգ' : 'Live Delivery Dispatch Route'}</span>
              <span className="text-xs text-stone-500 font-sans font-normal">({districtNameAndCoords.name})</span>
            </h4>
          </div>
          
          <div className="flex items-center space-x-2 text-[10px] bg-white border border-stone-150 py-1.5 px-3 rounded-full text-stone-700 font-bold shadow-xs">
            <span className={`w-2 h-2 rounded-full ${order.status !== 'delivered' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            <span>
              {order.status === 'placed' && (language === 'hy' ? 'Ստանձնել ենք պատվերը' : 'Order accepted')}
              {order.status === 'baking' && (language === 'hy' ? 'Թխման լիարժեք ընթացք' : 'Baking process active')}
              {order.status === 'delivering' && (language === 'hy' ? 'Առաքիչը ճանապարհին է' : 'Courier driving')}
              {order.status === 'delivered' && (language === 'hy' ? 'Բարեհաջող առաքված է' : 'Delivered successfully')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Real Yandex Map Iframe Wrapper Column */}
          <div className="lg:col-span-7 bg-white p-3 rounded-2.5xl border border-stone-200 shadow-xs flex flex-col h-[320px]">
            <div className="relative flex-1 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <iframe
                title="Yandex Traffic Map"
                src={`https://yandex.ru/map-widget/v1/?ll=${(44.5152 + districtNameAndCoords.lng) / 2},${(40.1792 + districtNameAndCoords.lat) / 2}&z=13&l=map,trf&pt=44.5152,40.1792,pm2bld~${districtNameAndCoords.lng},${districtNameAndCoords.lat},pm2rdm`}
                width="100%"
                height="100%"
                frameBorder="0"
                className="absolute inset-0 w-full h-full rounded-xl transition duration-500"
                allowFullScreen
              />
              
              {/* Floating Map Legend Indicator */}
              <div className="absolute bottom-3 left-3 bg-stone-950/90 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow border border-white/10 flex items-center gap-1.5 backdrop-blur-xs select-none">
                <span className="text-[12px]">🎂</span>
                <span>Abovyan 20/4 ➔ {districtNameAndCoords.name}</span>
              </div>
            </div>
          </div>

          {/* Traffic Jams, Speed, ETA and Courier controls */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* Live Traffic Congestion Simulation */}
            <div className="bg-white p-4.5 rounded-2.5xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-stone-500" />
                  {language === 'hy' ? 'Խցանումներ (Յանդեքս Ինդեքս)' : 'Yandex Traffic Congestion'}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                  trafficLevel <= 3 ? 'bg-green-50 text-green-700' :
                  trafficLevel <= 6 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {trafficLevel} / 10 {language === 'hy' ? 'Բալ' : 'Points'}
                </span>
              </div>

              {/* Traffic status gauge slider */}
              <div className="relative h-2 bg-gradient-to-r from-green-500 via-amber-400 to-red-500 rounded-full mb-4">
                <div 
                  className="absolute w-4 h-4 bg-white border-2 border-stone-900 rounded-full shadow top-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${(trafficLevel - 1) * 11}%` }}
                />
              </div>

              {/* Simulation buttons to toggle jams index on-the-fly */}
              <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                {[
                  { level: 2, label: 'Ազատ 🟢', labelEn: 'Clear 🟢' },
                  { level: 5, label: 'Միջին 🟡', labelEn: 'Medium 🟡' },
                  { level: 9, label: 'Խցանում 🔴', labelEn: 'Heavy 🔴' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setTrafficLevel(item.level)}
                    className={`py-2 px-1.5 rounded-xl border text-[10px] sm:text-xs font-black text-center transition cursor-pointer select-none active:scale-95 ${
                      trafficLevel === item.level
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {language === 'hy' ? item.label : item.labelEn}
                  </button>
                ))}
              </div>

              {/* Dynamic Traffic Alert Report text info box */}
              <p className="text-[11px] text-stone-500 bg-stone-50 border border-stone-150 p-2.5 rounded-xl flex items-start gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  trafficLevel >= 7 ? 'text-red-500' : 'text-amber-500'
                }`} />
                <span>{trafficReport}</span>
              </p>
            </div>

            {/* Dynamic Real-time Courier Status & ETA Info */}
            <div className="bg-white p-4.5 rounded-2.5xl border border-stone-200 shadow-xs flex-1 flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
                    {language === 'hy' ? 'ՄՈՒՏՔԱՅԻՆ ETA' : 'APPROXIMATE ETA'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-black text-rose-600">{dynamicMinutes}</span>
                    <span className="text-xs font-bold text-stone-800">{language === 'hy' ? 'րոպե' : 'minutes'}</span>
                  </div>
                </div>

                <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 shrink-0 text-center">
                  <Clock className="w-5 h-5 text-rose-500 mx-auto animate-pulse" />
                  <span className="text-[9px] font-bold text-rose-700 block mt-1">REAL-TIME</span>
                </div>
              </div>

              {/* Courier Profile details */}
              <div className="border-t border-stone-100 pt-3 mt-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-stone-100 border border-stone-200 rounded-full flex items-center justify-center text-lg select-none">
                    👨🏻‍✈️
                  </div>
                  <div>
                    <span className="text-xs font-black text-stone-900 block leading-tight">
                      {language === 'hy' ? currentCourier.name : currentCourier.en}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono block">
                      {currentCourier.vehicle}
                    </span>
                  </div>
                </div>

                <a 
                  href={`tel:${currentCourier.phone}`}
                  className="bg-stone-50 border border-stone-200 hover:border-rose-200 hover:bg-rose-50/10 px-2.5 py-1.5 rounded-xl text-stone-700 hover:text-rose-600 transition flex items-center gap-1 text-[10px] font-bold select-none cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'hy' ? 'Զանգել' : 'Call'}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice Receipt Body Container for Print/View */}
      <div className="bg-slate-50 border border-gray-200/60 p-6 rounded-3xl" id="receipt-invoice-printa">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-200 pb-5 mb-5 gap-4">
          
          <div>
            <h3 className="text-base font-serif font-bold text-gray-800">
              {t.appName}
            </h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              Premium Bakery Online Marketplace
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              📅 {language === 'hy' ? 'Ամսաթիվ' : 'Order Date'}: {order.date}
            </p>
            <p className="text-[10px] text-gray-500">
              💳 {language === 'hy' ? 'Վճարում' : 'Payment Type'}: <span className="font-bold uppercase font-mono">{order.paymentMethod}</span>
              {order.paymentCardInfo && ` (*${order.paymentCardInfo.lastFour})`}
            </p>
          </div>

          <div className="text-left md:text-right">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              {language === 'hy' ? 'ԿԱՊԻ ՏՎՅԱԼՆԵՐ' : 'RECIPIENT SPECIFICS'}
            </h4>
            <p className="text-xs text-gray-600 mt-1.5 font-bold">
              {order.recipientName}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              {order.recipientPhone}
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-[240px] leading-snug">
              📍 {order.deliveryAddress}
            </p>
            <p className="text-[10px] text-stone-800 font-bold mt-1.5 uppercase font-mono">
              🚀 {order.deliveryDate} • {order.deliveryTime}
            </p>
          </div>
        </div>

        {/* Item list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[9px]">
                <th className="py-2">{language === 'hy' ? 'Ապրանքատեսակ' : 'Sweets Product'}</th>
                <th className="py-2 text-center">{language === 'hy' ? 'Քանակ' : 'Qty'}</th>
                <th className="py-2 text-right">{language === 'hy' ? 'Միավորի արժեք' : 'Price Unit'}</th>
                <th className="py-2 text-right">{language === 'hy' ? 'Ընդամենը' : 'Price Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {order.items.map((item, i) => {
                const name = item.customizations
                  ? (language === 'hy' ? 'Անհատական Տորթ' : 'Custom Built Cake')
                  : (language === 'hy' ? item.product.nameHy : item.product.nameEn);
                return (
                  <tr key={i} className="py-2">
                    <td className="py-2.5">
                      <p className="font-bold text-gray-800">{name}</p>
                      {item.customizations ? (
                        <span className="text-[9px] text-stone-750 block mt-0.5 leading-normal max-w-[320px]">
                          ⚙️ {t.customized} ({item.customizations.weight} Kg) • {item.customizations.sponge} Sponge • {item.customizations.filling} Filling
                          {item.customizations.topping && item.customizations.topping !== 'None' && ` • Topping: ${item.customizations.topping}`}
                          {item.customizations.decorationStyle && ` • Style: ${item.customizations.decorationStyle}`}
                          {item.customizations.inscription && ` • Inscription: "${item.customizations.inscription}"`}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 italic block mt-0.5">{t.standard}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-mono font-medium">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono">{item.finalPrice.toLocaleString()} {t.amd}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-gray-800">{(item.finalPrice * item.quantity).toLocaleString()} {t.amd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total math table */}
        <div className="border-t border-gray-200 pt-3 mt-4 flex justify-end">
          <div className="w-full md:w-72 space-y-2 text-xs text-gray-650">
            <div className="flex justify-between">
              <span>{language === 'hy' ? 'Միջանկյալ' : 'Subtotal Amount'}</span>
              <span className="font-mono">{order.totalAmount > 15000 ? order.totalAmount.toLocaleString() : (order.totalAmount - (order.totalAmount > 0 ? 1000 : 0)).toLocaleString()} {t.amd}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.deliveryFee}</span>
              <span className="font-mono">{order.totalAmount > 15000 ? 'Free' : '1,000 ֏'}</span>
            </div>
            
            {order.usedBonusPoints && order.usedBonusPoints > 0 ? (
              <div className="flex justify-between text-green-600 font-bold bg-green-50/50 border border-green-100 p-1 px-2 rounded-lg">
                <span>{language === 'hy' ? 'Օգտագործված Բոնուս' : 'Points Discount'}</span>
                <span className="font-mono">-{order.usedBonusPoints.toLocaleString()} {t.amd}</span>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-extrabold text-gray-900">
              <span>{language === 'hy' ? 'Վճարված Ընդհանուր' : 'Authorized Total'}</span>
              <span className="font-mono text-rose-650">
                {Math.max(0, order.totalAmount - (order.usedBonusPoints || 0)).toLocaleString()} {t.amd}
              </span>
            </div>

            {order.earnedBonusPoints && order.earnedBonusPoints > 0 ? (
              <div className="flex justify-between text-[11px] text-stone-605 font-bold border border-dashed border-stone-200 p-1.5 px-2.5 rounded-lg bg-stone-100/50">
                <span className="flex items-center gap-1">⭐️ {language === 'hy' ? 'Կուտակված նոր բոնուս' : 'Gained Cashback'}</span>
                <span className="font-mono text-rose-500">+{order.earnedBonusPoints.toLocaleString()} {t.point}</span>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* Printing controls */}
      <div className="mt-6 pt-5 border-t border-stone-150 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-[10px] text-gray-400 flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          <span>{language === 'hy' ? 'Պահպանեք այս կտրոնը սպասարկման համար:' : 'Preserve this retail receipt for order pick-up.'}</span>
        </span>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          id="invoice-print-btn"
        >
          <Printer className="w-4 h-4" />
          <span>{t.invoiceBtn}</span>
        </button>
      </div>

    </div>
  );
}
