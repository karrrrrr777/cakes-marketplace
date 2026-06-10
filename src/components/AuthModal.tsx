/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { translations } from '../translations';
import { 
  X, Lock, Mail, Phone, MapPin, User as UserIcon, 
  ShieldAlert, ShieldCheck, Check, RotateCcw, ArrowLeft 
} from 'lucide-react';

interface AuthModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({
  language,
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // Dual-chanel Verification States
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [generatedEmailCode, setGeneratedEmailCode] = useState('');
  const [generatedSmsCode, setGeneratedSmsCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Live Transmission Status States
  const [emailSandboxUrl, setEmailSandboxUrl] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const [smsStatusMsg, setSmsStatusMsg] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [emailHasConfig, setEmailHasConfig] = useState(false);
  const [smsHasConfig, setSmsHasConfig] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

  // Body scroll lock on mount/unmount when modal is open
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

  // Predefined users for friction-free exploration
  const demoUsers = [
    {
      fullName: "Աննա Հարությունյան",
      email: "anna@sweet.am",
      phone: "+374 91 223344",
      address: "ք. Երևան, Աբովյան փողոց 12, բն. 14",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      bonusBalance: 1850 // pre-loaded bonus to test purchase/redemption immediately!
    },
    {
      fullName: "Կարեն Պետրոսյան",
      email: "karen@bakery.am",
      phone: "+374 77 998877",
      address: "ք. Երևան, Կոմիտաս պողոտա 45, բն. 6",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      bonusBalance: 900 // pre-loaded bonus to test purchase/redemption immediately!
    }
  ];

  // Generate random codes for SMS & Email and send physically via backend
  const generateCodes = async (customEmail?: string, customPhone?: string, customName?: string) => {
    const eCode = Math.floor(1000 + Math.random() * 9000).toString();
    const sCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    setGeneratedEmailCode(eCode);
    setGeneratedSmsCode(sCode);
    setTimer(60);
    setEmailCode('');
    setSmsCode('');
    setErrorMessage('');
    setEmailSandboxUrl('');
    setEmailStatusMsg('');
    setSmsStatusMsg('');
    setEmailHasConfig(false);
    setSmsHasConfig(false);
    setEmailSuccess(false);
    setSmsSuccess(false);
    setIsSendingCode(true);

    const targetEmail = customEmail || email;
    const targetPhone = customPhone || phone;
    const targetName = customName || fullName;

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: targetEmail,
          phone: targetPhone,
          emailCode: eCode,
          smsCode: sCode,
          fullName: targetName,
          language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle Email Status
        const emailCfg = !!data.emailStatus?.hasConfig;
        const emailOk = !!data.emailStatus?.success;
        setEmailHasConfig(emailCfg);
        setEmailSuccess(emailOk);
        
        if (data.emailStatus?.url) {
          setEmailSandboxUrl(data.emailStatus.url);
        }

        if (emailCfg) {
          if (emailOk) {
            setEmailStatusMsg(language === 'hy' 
              ? '✅ Էլ․ նամակը հաջողությամբ ուղարկվել է Ձեր էլ. հասցեին' 
              : '✅ Real verification email dispatched to your inbox!'
            );
          } else {
            setEmailStatusMsg(language === 'hy'
              ? `❌ Սխալ էլ․ փոստ ուղարկելիս. ${data.emailStatus.message || "Ստուգեք SMTP սեկրետ տվյալները:"}`
              : `❌ SMTP Dispatch error: ${data.emailStatus.message || "Verify your mail provider credentials"}`
            );
          }
        } else {
          setEmailStatusMsg(language === 'hy'
            ? '💡 Սիմուլյացիա (Auto-Fill-ը պատրաստ է)'
            : '💡 Simulated (Sandbox Auto-Fill Ready)'
          );
        }

        // Handle SMS Status
        const smsCfg = !!data.smsStatus?.hasConfig;
        const smsOk = !!data.smsStatus?.success;
        setSmsHasConfig(smsCfg);
        setSmsSuccess(smsOk);

        if (smsCfg) {
          if (smsOk) {
            setSmsStatusMsg(language === 'hy'
              ? '✅ SMS-ը հաջողությամբ ուղարկվել է Ձեր հեռախոսին'
              : '✅ Real SMS code successfully sent via Twilio!'
            );
          } else {
            setSmsStatusMsg(language === 'hy'
              ? `❌ Սխալ SMS ուղարկելիս. ${data.smsStatus.message || "Ստուգեք հեռախոսահամարը կամ Twilio սեկրետները:"}`
              : `❌ Twilio SMS error: ${data.smsStatus.message || "Check secrets balance or phone format"}`
            );
          }
        } else {
          setSmsStatusMsg(language === 'hy'
            ? '💡 Սիմուլյացիա (Auto-Fill-ը պատրաստ է)'
            : '💡 Simulated (Sandbox Auto-Fill Ready)'
          );
        }

      } else {
        setEmailStatusMsg(language === 'hy' ? '⚠️ Ռեալ փոստի սերվերը միացված չէ (Սիմուլյացիոն ռեժիմ)' : '⚠️ Real mail carrier is offline (Simulation active)');
        setSmsStatusMsg(language === 'hy' ? '⚠️ Ռեալ SMS ծառայությունը միացված չէ (Սիմուլյացիոն ռեժիմ)' : '⚠️ Real SMS service is offline (Simulation active)');
      }
    } catch (err: any) {
      console.error('Failed to dispatch verification codes:', err);
      setEmailStatusMsg(language === 'hy' ? '⚠️ Ռեալ փոստի սերվերը միացված չէ (Սիմուլյացիոն ռեժիմ)' : '⚠️ Real mail carrier is offline (Simulation active)');
      setSmsStatusMsg(language === 'hy' ? '⚠️ Ռեալ SMS ծառայությունը միացված չէ (Սիմուլյացիոն ռեժիմ)' : '⚠️ Real SMS service is offline (Simulation active)');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Timer countdown hook for verification code resending
  useEffect(() => {
    let interval: any = null;
    if (step === 'verification' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset verification states on open status change
  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setErrorMessage('');
      setSuccessAnimation(false);
      setIsVerifying(false);
      setEmailSandboxUrl('');
      setEmailStatusMsg('');
      setSmsStatusMsg('');
      setIsSendingCode(false);
    }
  }, [isOpen]);

  const handleDemoLogin = (demoUser: typeof demoUsers[0]) => {
    onLoginSuccess({
      id: "u_" + Date.now(),
      fullName: demoUser.fullName,
      email: demoUser.email,
      phone: demoUser.phone,
      address: demoUser.address,
      avatar: demoUser.avatar,
      bonusBalance: demoUser.bonusBalance
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'signin') {
      if (!email || !password) {
        setErrorMessage(language === 'hy' ? 'Խնդրում ենք լրացնել բոլոր դաշտերը։' : 'Please fill all fields.');
        return;
      }
      // Simulate sign in
      onLoginSuccess({
        id: "u_" + Date.now(),
        fullName: email.split('@')[0].toUpperCase(),
        email: email,
        phone: "+374 95 111222",
        address: "Մաշտոցի Պողոտա, Երևան",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        bonusBalance: 450
      });
      onClose();
    } else {
      if (!fullName || !email || !phone || !address || !password) {
        setErrorMessage(language === 'hy' ? 'Բոլոր դաշտերը պարտադիր են գրանցման համար։' : 'All registration fields are required.');
        return;
      }
      
      // Trigger API-driven dynamic code verification & move to step 2 code screen
      setStep('verification');
      await generateCodes(email, phone, fullName);
    }
  };

  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (emailCode !== generatedEmailCode) {
      setErrorMessage(
        language === 'hy' 
          ? 'Էլ․ փոստի հաստատման կոդը սխալ է։' 
          : 'Email verification code is incorrect.'
      );
      return;
    }

    if (smsCode !== generatedSmsCode) {
      setErrorMessage(
        language === 'hy' 
          ? 'Հեռախոսահամարի SMS հաստատման կոդը սխալ է։' 
          : 'SMS verification code is incorrect.'
      );
      return;
    }

    // Pass verification
    setIsVerifying(true);
    setSuccessAnimation(true);

    setTimeout(() => {
      onLoginSuccess({
        id: "u_" + Date.now(),
        fullName,
        email,
        phone,
        address,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        bonusBalance: 0 // brand new registry starts with 0
      });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col p-5 sm:p-6 max-h-[92vh] md:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-stone-100 shrink-0">
          <h2 className="text-xl font-serif font-bold text-stone-800">
            {step === 'verification'
              ? (language === 'hy' ? 'Երկփուլանի Հաստատում' : 'Two-Factor Activation')
              : (language === 'hy' ? 'Հաճախորդի Գրանցում' : 'Customer Registry')
            }
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition"
            id="auth-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'verification' ? (
          /* Multi-Channel Verification UI */
          <div className="flex flex-col flex-1 overflow-y-auto pr-1 mt-4 space-y-4">
            {successAnimation ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-800 text-center">
                  {language === 'hy' ? 'Վավերացումը Հաջողվեց!' : 'Verification Successful!'}
                </h3>
                <p className="text-xs text-stone-500 text-center">
                  {language === 'hy' 
                    ? 'Ձեր հաշիվը հաջողությամբ պաշտպանվեց և ստեղծվեց։' 
                    : 'Your account was successfully secured and registered.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Security shield icon banner */}
                <div className="bg-amber-50/75 rounded-2xl p-3 border border-amber-100 flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5 animate-pulse">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 leading-snug">
                      {language === 'hy' ? 'Պահանջվում է հաստատում անվտանգության համար' : 'Security Checks Required'}
                    </h4>
                    <p className="text-[10.5px] text-amber-700 mt-1 leading-relaxed">
                      {language === 'hy'
                        ? 'Ձեր հաշվի անվտանգության համար ուղարկել ենք հաստատման կոդեր։ Խնդրում ենք մուտքագրել SMS-ով և էլ․ փոստով ստացված կոդերը։'
                        : 'For your personal security, we have dispatched verification code tokens. Please enter both code pins to activate your account.'
                      }
                    </p>
                  </div>
                </div>

                {/* Real-time Transmission Status Logs */}
                <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-250/65 space-y-3 shadow-inner">
                  <h4 className="text-[10px] font-extrabold text-stone-600 uppercase tracking-widest flex items-center justify-between">
                    <span>🔌 {language === 'hy' ? 'ԻՐԱԿԱՆ ԿԱՊԻ ԿԱՐԳԱՎԻՃԱԿ' : 'REAL CARRIER CONNECTION STATUS'}</span>
                    <span className="inline-block w-2-h-2 bg-rose-500 rounded-full animate-ping" style={{ width: '6px', height: '6px' }} />
                  </h4>
                  
                  {isSendingCode ? (
                    <div className="flex items-center space-x-2.5 text-xs text-stone-600 py-2">
                      <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">{language === 'hy' ? 'Ուղարկվում են իրական կոդերը...' : 'Dispatching secure tokens to carrier channels...'}</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Email Dispatch Info Block */}
                      <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition ${
                        emailHasConfig 
                          ? (emailSuccess ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-rose-50/80 border-rose-200 text-rose-900')
                          : 'bg-stone-100/70 border-stone-200 text-stone-600'
                      }`}>
                        <div className="flex justify-between items-center font-bold mb-0.5">
                          <span className="flex items-center">
                            <span className="mr-1.5">✉️</span>
                            <span>{language === 'hy' ? 'Էլ. Փոստի Առաքում' : 'Inbox Email Delivery'}</span>
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            emailHasConfig
                              ? (emailSuccess ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800')
                              : 'bg-stone-200/80 text-stone-500'
                          }`}>
                            {emailHasConfig ? (language === 'hy' ? 'Իրական' : 'Live Real') : (language === 'hy' ? 'Սիմուլյացիա' : 'Simulation')}
                          </span>
                        </div>
                        <p className="font-medium text-[10.5px]">
                          {emailStatusMsg || (language === 'hy' ? 'Սպասում է...' : 'Idle...')}
                        </p>
                      </div>

                      {/* SMS Dispatch Info Block */}
                      <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition ${
                        smsHasConfig 
                          ? (smsSuccess ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-rose-50/80 border-rose-200 text-rose-900')
                          : 'bg-stone-100/70 border-stone-200 text-stone-600'
                      }`}>
                        <div className="flex justify-between items-center font-bold mb-0.5">
                          <span className="flex items-center">
                            <span className="mr-1.5">📱</span>
                            <span>{language === 'hy' ? 'SMS Հաղորդագրություն' : 'SMS Text Dispatch'}</span>
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            smsHasConfig
                              ? (smsSuccess ? 'bg-emerald-200/60 text-emerald-800' : 'bg-rose-200/60 text-rose-800')
                              : 'bg-stone-200/80 text-stone-500'
                          }`}>
                            {smsHasConfig ? (language === 'hy' ? 'Իրական' : 'Live Real') : (language === 'hy' ? 'Սիմուլյացիա' : 'Simulation')}
                          </span>
                        </div>
                        <p className="font-medium text-[10.5px]">
                          {smsStatusMsg || (language === 'hy' ? 'Սպասում է...' : 'Idle...')}
                        </p>
                      </div>

                      {/* Interactive Real Sandbox Link with Ethereal Sandbox details */}
                      {emailSandboxUrl && (
                        <div className="bg-amber-50 text-amber-900 px-3 py-2 rounded-xl text-[11px] font-sans border border-amber-200 space-y-1">
                          <span className="font-bold flex items-center text-amber-950">
                            📧 {language === 'hy' ? 'Իրական նամակը հաջողությամբ ստացվել է' : 'Live Temp Email Generated!'}
                          </span>
                          <p className="text-[10px] leading-relaxed text-amber-800">
                            {language === 'hy'
                              ? 'Ethereal-ի միջոցով ստեղծվել է անվճար ժամանակավոր փոստարկղ: Սեղմեք այստեղ՝ ստացված նամակի դիզայնը և կոդը կարդալու համար.'
                              : 'A live web temp-mailbox is hosting this message. Click below to inspect the design template & find your code:'
                            }
                          </p>
                          <a
                            href={emailSandboxUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block font-extrabold text-rose-700 hover:text-rose-800 underline transition mt-1 text-[11px] hover:translate-x-0.5 transform duration-200"
                          >
                            {language === 'hy' ? '👉 Բացել ստացված REAL նամակի պատուհանը' : '👉 Open temporary email inbox'}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* How to activate live delivery */}
                <details className="group bg-amber-50/40 border border-amber-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition shadow-sm">
                  <summary className="flex items-center justify-between p-3 cursor-pointer text-amber-800 select-none">
                    <span className="text-[11px] font-bold tracking-tight flex items-center space-x-1.5">
                      <span>💡</span>
                      <span>
                        {language === 'hy' 
                          ? 'Ինչպե՞ս միացնել 100% ԻՐԱԿԱՆ SMS և Էլ-նամակներ' 
                          : 'How to enable 100% REAL Live SMS & Email delivery'
                        }
                      </span>
                    </span>
                    <span className="transition duration-300 group-open:-rotate-180 text-amber-600">
                      ▼
                    </span>
                  </summary>
                  <div className="p-3 pt-0 border-t border-amber-200/60 text-[11px] text-stone-600 space-y-2 leading-relaxed bg-white font-sans">
                    <p>
                      {language === 'hy'
                        ? 'Այս կայքն ունի լիարժեք իրական կապի ծրագրային ապահովում (SMS-ների համար՝ Twilio և էլ-նամակների համար՝ SMTP): Իրական առաքումը Ձեր հեռախոսին և էլ․ փոստին ակտիվացնելու համար՝'
                        : 'This application is equipped with full-featured live carrier integrations (Twilio for cellular SMS, SMTP for inbox mail). To activate live physical delivery to your personal devices:'
                      }
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-stone-700 font-medium">
                      <li>
                        {language === 'hy'
                          ? 'Բացեք AI Studio-ի Settings (Կարգավորումներ / փոխանցիվիշ) բաժինը (վերևի աջ անկյունում):'
                          : 'Open the Settings drawer in the top-right of your AI Studio screen.'
                        }
                      </li>
                      <li>
                        {language === 'hy'
                          ? 'Անցեք Secrets / Env Variables բաժին և ավելացրեք Ձեր SMTP կամ Twilio սեկրետները:'
                          : 'Locate Secrets / Env Variables and add your real SMTP or Twilio secrets.'
                        }
                      </li>
                      <li>
                        {language === 'hy'
                          ? 'Ավելացրեք հետևյալ անուններով փոփոխականները՝'
                          : 'Name your environment keys exactly as follows:'
                        }
                        <div className="font-mono text-[9px] bg-stone-100 p-2 rounded-lg mt-1.5 space-y-0.5 text-stone-800 border border-stone-200 select-all">
                          <div>SMTP_HOST = smtp.gmail.com</div>
                          <div>SMTP_PORT = 587</div>
                          <div>SMTP_USER = your_username@gmail.com</div>
                          <div>SMTP_PASS = your_gmail_app_password</div>
                          <div>SMTP_FROM = your_from_address</div>
                          <div className="h-0.5 bg-stone-200 my-1"></div>
                          <div>TWILIO_ACCOUNT_SID = ACxxxxxxxxx</div>
                          <div>TWILIO_AUTH_TOKEN = xxxxxxxxxxx</div>
                          <div>TWILIO_PHONE_NUMBER = +1xxxxxxxxxx</div>
                        </div>
                      </li>
                    </ol>
                    <p className="text-[10px] text-stone-500 italic">
                      {language === 'hy'
                        ? 'Առանց այս բանալիների, համակարգն ավտոմատ կիրառում է անվտանգ սիմուլյացիա (Auto-Fill), որպեսզի թեստավորողները կարողանան հեշտությամբ գրանցվել առանց սեփական կապուղիները ծախսելու:'
                        : 'Without these credentials, secure Simulation (Auto-Fill) is activated so that anyone can safely trial the full-stack sign-up onboarding flows immediately.'
                      }
                    </p>
                  </div>
                </details>

                {/* Simulated notifications / Alerts box to guide user testing */}
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 space-y-2.5">
                  <p className="text-[9px] text-stone-550 font-extrabold uppercase tracking-widest text-center">
                    📡 {language === 'hy' ? 'ՍԻՄՈՒԼՅԱՑԻՈՆ live ՀԵՌԱԽՈՍ ԵՎ ՓՈՍՏԱՐԿՂ' : 'SIMULATED LIVE PHONE & EMAIL'}
                  </p>
                  
                  {/* SMS Alert */}
                  <div className="bg-stone-900 text-stone-100 p-2.5 rounded-xl text-[10.5px] space-y-1 relative overflow-hidden border border-stone-800">
                    <div className="flex justify-between items-center text-stone-400 pb-1 border-b border-stone-800/85">
                      <span className="font-mono text-[9px]">💬 SMS: {phone}</span>
                      <span className="text-[8px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">SMS Service</span>
                    </div>
                    <p className="leading-relaxed text-stone-200">
                      {language === 'hy' 
                        ? `Dulce Cakes: Ձեր SMS հաստատման կոդն է՝ ${generatedSmsCode}։ Մի՛ փոխանցեք այն ոչ ոքի։`
                        : `Dulce Cakes: Your secure SMS registration code is ${generatedSmsCode}. Do not disclose.`
                      }
                    </p>
                    <button
                      type="button"
                      onClick={() => setSmsCode(generatedSmsCode)}
                      className="absolute right-2 top-2 text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                    >
                      {language === 'hy' ? 'Տեղադրել' : 'Auto-Fill'}
                    </button>
                  </div>

                  {/* Email Alert */}
                  <div className="bg-stone-900 text-stone-100 p-2.5 rounded-xl text-[10.5px] space-y-1 relative overflow-hidden border border-stone-800">
                    <div className="flex justify-between items-center text-stone-400 pb-1 border-b border-stone-800/85">
                      <span className="font-mono text-[9px]">✉️ Email: {email}</span>
                      <span className="text-[8px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Email Bot</span>
                    </div>
                    <p className="leading-relaxed text-stone-200">
                      {language === 'hy' 
                        ? `Բարև ${fullName}։ Ձեր էլ․ փոստի հաստատման PIN կոդն է՝ ${generatedEmailCode}։`
                        : `Hello ${fullName}! Your Email activation PIN code is ${generatedEmailCode}.`
                      }
                    </p>
                    <button
                      type="button"
                      onClick={() => setEmailCode(generatedEmailCode)}
                      className="absolute right-2 top-2 text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
                    >
                      {language === 'hy' ? 'Տեղադրել' : 'Auto-Fill'}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center space-x-2 border border-red-100">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                  {/* SMS Input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex justify-between">
                      <span>{language === 'hy' ? 'SMS վավերացման կոդ (4 նիշ)' : 'SMS Verification Code (4 digits)'}</span>
                      <span className="text-stone-400 font-normal">📱 {phone}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ex: 1234"
                        className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200 tracking-wider font-bold placeholder:font-normal placeholder:tracking-normal"
                        id="auth-verification-sms-input"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex justify-between">
                      <span>{language === 'hy' ? 'Էլ․ փոստի վավերացման կոդ (4 նիշ)' : 'Email Verification PIN (4 digits)'}</span>
                      <span className="text-stone-400 font-normal">✉️ {email}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ex: 5678"
                        className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200 tracking-wider font-bold placeholder:font-normal placeholder:tracking-normal"
                        id="auth-verification-email-input"
                      />
                    </div>
                  </div>

                  {/* Submit actions */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                      id="auth-verify-submit-btn"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isVerifying 
                          ? (language === 'hy' ? 'Կատարվում է...' : 'Securing integrity...') 
                          : (language === 'hy' ? 'Հաստատել և ստեղծել հաշիվ' : 'Verify & Complete Signup')
                        }
                      </span>
                    </button>

                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => { setStep('form'); setErrorMessage(''); }}
                        className="text-stone-500 hover:text-stone-800 flex items-center space-x-1 cursor-pointer font-semibold"
                        id="auth-back-to-form-btn"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{language === 'hy' ? 'Խմբագրել տվյալները' : 'Edit details'}</span>
                      </button>

                      {timer > 0 ? (
                        <span className="text-stone-400 font-medium">
                          {language === 'hy' ? `Ուղարկել նորից (${timer}վ)` : `Resend in ${timer}s`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={generateCodes}
                          className="text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
                          id="auth-resend-codes-btn"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'hy' ? 'Ուղարկել նոր կոդեր' : 'Resend Codes'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        ) : (
          /* Form Body (Login/Signup Form Tabs) */
          <div className="flex flex-col flex-1 overflow-y-auto pr-1">
            {/* Tab Selection */}
            <div className="flex bg-stone-100/70 p-1 rounded-2xl my-4 shrink-0">
              <button
                onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'signin'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="tab-signin-btn"
              >
                {t.loginTab}
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'signup'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                id="tab-signup-btn"
              >
                {t.registerTab}
              </button>
            </div>

            {/* Rapid Demologin panel */}
            <div className="mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0">
              <p className="text-[10px] text-stone-550 font-extrabold uppercase tracking-widest text-center mb-2">
                🚀 {language === 'hy' ? 'Արագ Մուտք փորձարկելու համար' : 'One-Click Trial Access'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((du, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDemoLogin(du)}
                    className="flex items-center space-x-2 bg-white hover:bg-stone-50 border border-stone-200 p-2 rounded-xl transition text-left cursor-pointer shadow-sm group"
                    id={`demo-user-btn-${i}`}
                  >
                    <img src={du.avatar} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-bold text-stone-700 truncate group-hover:text-rose-600">
                      {du.fullName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center space-x-2 border border-red-100">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.fullName}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Աննա Հարությունյան"
                      className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                      id="auth-signup-fullname"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@sweet.am"
                    className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                    id="auth-input-email"
                  />
                </div>
              </div>

              {activeTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.phone}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+374 91 223344"
                        className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                        id="auth-signup-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.address}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ք. Երևան, Աբովյան փողոց 12"
                        className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                        id="auth-signup-address"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                    id="auth-input-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-stone-100 cursor-pointer"
                id="auth-submit-btn"
              >
                {activeTab === 'signin' ? t.loginTab : t.registerTab}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
