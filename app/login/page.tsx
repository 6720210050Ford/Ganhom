'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-sm text-neutral-400">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
        </div>
      }
    >
      <StandaloneAuthPage />
    </React.Suspense>
  );
}

function StandaloneAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'register'>(initialTab);
  const [showCookieNotice, setShowCookieNotice] = useState(true);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Providers status from API
  const [providersStatus, setProvidersStatus] = useState<{ facebook: boolean; line: boolean }>({
    facebook: false,
    line: false,
  });

  useEffect(() => {
    fetch('/api/auth-providers')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProvidersStatus({
            facebook: Boolean(data.facebook),
            line: Boolean(data.line),
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (urlError === 'CredentialsSignin') {
      setErrorMsg('อีเมล/เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง');
    } else if (urlError) {
      setErrorMsg('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ โปรดลองใหม่อีกครั้ง');
    }
  }, [urlError]);

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: loginIdentifier,
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('อีเมล/รหัสการล็อกอิน หรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }

      // Sync legacy cookie for compatibility
      try {
        await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email: loginIdentifier, password: loginPassword }),
        });
      } catch (err) {
        // ignore legacy cookie sync failure
      }

      setSuccessMsg('เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าแรก...');
      const destination =
        callbackUrl ||
        (loginIdentifier.trim().toLowerCase() === 'admin@tsu.ac.th' ? '/admin' : '/');

      setTimeout(() => {
        window.location.href = destination;
      }, 500);
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
    }
  }

  // Handle Register
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'การลงทะเบียนล้มเหลว');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('ลงทะเบียนสำเร็จ! กำลังนำท่านเข้าสู่ระบบ...');

      const loginRes = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });

      if (loginRes?.ok) {
        setTimeout(() => {
          window.location.href = callbackUrl || '/';
        }, 800);
      } else {
        setLoginIdentifier(regEmail);
        setMode('login');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
      setIsLoading(false);
    }
  }

  // Handle Social Login
  async function handleSocial(provider: 'facebook' | 'line' | 'google') {
    setErrorMsg('');
    if (provider === 'facebook' && !providersStatus.facebook) {
      setErrorMsg('ยังไม่ได้ตั้งค่า AUTH_FACEBOOK_ID และ AUTH_FACEBOOK_SECRET ในไฟล์ .env');
      return;
    }
    if (provider === 'line' && !providersStatus.line) {
      setErrorMsg('ยังไม่ได้ตั้งค่า AUTH_LINE_ID และ AUTH_LINE_SECRET ในไฟล์ .env');
      return;
    }

    setSocialLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: callbackUrl || '/',
      });
    } catch (err) {
      setErrorMsg(`ไม่สามารถเชื่อมต่อกับ ${provider.toUpperCase()} ได้`);
      setSocialLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col justify-between font-sans select-none">
      
      {/* 1. Top Cookie Banner (ตรงตามตัวอย่าง Huawei) */}
      {showCookieNotice && (
        <div className="w-full bg-[#f6f6f6] border-b border-neutral-200/80 px-4 py-2 text-[12px] sm:text-[13px] text-neutral-600 flex items-center justify-center relative">
          <div className="text-center">
            <span>เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณบนเว็บไซต์ของเรา </span>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              เรียนรู้เพิ่มเติม
            </a>
          </div>
          <button
            type="button"
            onClick={() => setShowCookieNotice(false)}
            className="absolute right-4 text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
            title="ปิดการแจ้งเตือน"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top Header / Brand Bar (ชิดซ้าย สะอาดตา ไม่มีแดชบาร์/เนวิเกชันทั่วไป) */}
      <header className="w-full border-b border-neutral-100 bg-white py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg sm:text-xl tracking-wider text-neutral-900 uppercase">
            GANHOM
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          กลับสู่หน้าร้าน ↗
        </Link>
      </header>

      {/* 3. Main Central Login Section (หน้าเดี่ยวตรงกลาง ไม่มี QR Code) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16 w-full">
        
        {/* Title (เหมือนตัวอย่าง: ล็อกอินด้วย HUAWEI ID) */}
        <h1 className="text-2xl sm:text-[28px] font-medium text-neutral-900 text-center tracking-tight mb-8 sm:mb-10">
          {mode === 'login' ? 'ล็อกอินด้วย GANHOM ID' : 'ลงทะเบียน GANHOM ID'}
        </h1>

        {/* Form Container (Clean Standalone Box) */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] space-y-4">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center animate-fadeIn">
              {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Phone / Email / Login ID Input */}
              <div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="โทรศัพท์/อีเมล/ID การล็อกอิน"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Password Input with eye toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="รหัสผ่าน"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Sub-link: เข้าสู่ระบบผ่าน SMS / บัญชีด่วน */}
              <div className="text-left pt-0.5">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('ฟังก์ชันเข้าสู่ระบบผ่าน SMS กำลังอยู่ในระหว่างพัฒนา');
                  }}
                  className="text-xs text-blue-600 hover:underline font-normal cursor-pointer"
                >
                  เข้าสู่ระบบผ่าน SMS
                </a>
              </div>

              {/* Main Submit Button (Coral Red Huawei Style) */}
              <button
                type="submit"
                disabled={isLoading || !loginIdentifier || !loginPassword}
                className={`w-full py-3.5 rounded-xl text-white font-medium text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 ${
                  loginIdentifier && loginPassword
                    ? 'bg-[#e06b76] hover:bg-[#d45864]'
                    : 'bg-[#e06b76]/60 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <span>เข้าสู่ระบบ</span>
                )}
              </button>

              {/* Footer Links Row (เหมือนภาพ: ลงทะเบียน | ลืมรหัสผ่านใช่หรือไม่ | ความช่วยเหลือ) */}
              <div className="flex items-center justify-center gap-2.5 pt-2 text-[12px] sm:text-[13px] text-blue-600">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="hover:underline cursor-pointer font-medium"
                >
                  ลงทะเบียน
                </button>
                <span className="text-neutral-300">|</span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน');
                  }}
                  className="hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่านใช่หรือไม่
                </a>
                <span className="text-neutral-300">|</span>
                <a
                  href="/how-to-order"
                  className="hover:underline cursor-pointer"
                >
                  ความช่วยเหลือ
                </a>
              </div>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="อีเมลสำหรับการลงทะเบียน"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน (อย่างน้อย 4 ตัวอักษร)"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                >
                  {showRegPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="ยืนยันรหัสผ่าน"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#f5f5f5] text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !regEmail || !regPassword || !regConfirmPassword}
                className={`w-full py-3.5 rounded-xl text-white font-medium text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 ${
                  regEmail && regPassword && regConfirmPassword
                    ? 'bg-[#e06b76] hover:bg-[#d45864]'
                    : 'bg-[#e06b76]/60 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <span>ลงทะเบียนบัญชีใหม่</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[12px] sm:text-[13px] text-blue-600">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="hover:underline cursor-pointer font-medium"
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}

          {/* Other Social Login Options Icons Row (ไอคอนวงกลมเหมือนตัวอย่างด้านล่าง) */}
          <div className="pt-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              {/* Facebook Circle Icon */}
              <button
                type="button"
                onClick={() => handleSocial('facebook')}
                disabled={socialLoading !== null}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-[#1877F2] transition-transform hover:scale-105 shadow-2xs cursor-pointer"
                title="เข้าสู่ระบบด้วย Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* LINE Circle Icon */}
              <button
                type="button"
                onClick={() => handleSocial('line')}
                disabled={socialLoading !== null}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-[#06C755] transition-transform hover:scale-105 shadow-2xs cursor-pointer"
                title="เข้าสู่ระบบด้วย LINE"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.035 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.573-3.844 2.573-5.991z" />
                </svg>
              </button>

              {/* Google Circle Icon (G logo like in Huawei example) */}
              <button
                type="button"
                onClick={() => handleSocial('google')}
                disabled={socialLoading !== null}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-transform hover:scale-105 shadow-2xs cursor-pointer font-serif font-bold text-base text-neutral-800"
                title="เข้าสู่ระบบด้วย Google"
              >
                G
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 4. Bottom Footer Legal Links (ตามตัวอย่าง) */}
      <footer className="w-full py-6 border-t border-neutral-100 text-center text-[11px] sm:text-[12px] text-neutral-400 space-y-1 bg-white">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="#" className="hover:underline">ข้อตกลงผู้ใช้ GANHOM ID</a>
          <span>|</span>
          <a href="#" className="hover:underline">คำชี้แจงเกี่ยวกับ GANHOM ID และความเป็นส่วนตัว</a>
          <span>|</span>
          <a href="#" className="hover:underline">คุกกี้</a>
        </div>
      </footer>

    </div>
  );
}