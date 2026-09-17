"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [view, setView] = useState<"banner" | "settings">("banner");

  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    functional: false,
    performance: false,
    targeting: false,
    social: false,
  });

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    setPreferences({
      necessary: true,
      functional: true,
      performance: true,
      targeting: true,
      social: true,
    });
    setShow(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setPreferences({
      necessary: true,
      functional: false,
      performance: false,
      targeting: false,
      social: false,
    });
    setShow(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
      {view === "banner" ? (
        // Main Banner View
        <div className="bg-white max-w-2xl w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="text-sm text-gray-600 mb-8 space-y-4 leading-relaxed text-center sm:text-left">
            <p>
              โปรดทราบว่าข้อมูลส่วนบุคคลของท่านอาจถูกประมวลผลเพื่อประสบการณ์การเยี่ยมชมและการใช้งานเว็บไซต์ของเรา ให้การเยี่ยมชมเว็บไซต์ของเรามีความเหมาะสมมากขึ้น และเพื่อให้เราสามารถนำเสนอฟังก์ชันบางอย่างได้ เราจึงได้ติดตั้งสิ่งที่เราเรียกว่า 'คุกกี้' ในหน้าต่าง ๆ ของเว็บไซต์
            </p>
            <p>
              ท่านสามารถปรับและตั้งค่าการใช้งานคุกกี้ให้เหมาะสมกับความต้องการของท่านบนเว็บไซต์ของเรา ท่านสามารถตั้งค่าเบราว์เซอร์เพื่อให้ท่านได้รับทราบเกี่ยวกับการตั้งค่าของคุกกี้และตัดสินใจได้ด้วยตัวเองในการยอมรับหรือปฏิเสธการใช้งานของคุกกี้
            </p>
            <p>
              ท่านสามารถเปลี่ยนการตั้งค่านี้ได้ตลอดเวลาในเว็บไซต์ของเรา ท่านสามารถดูข้อมูลเพิ่มเติมเกี่ยวกับคุกกี้ที่เราใช้บนเว็บไซต์ คลิกที่นี่
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView("settings")}
              className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors w-full sm:w-auto"
            >
              การตั้งค่าคุกกี้
            </button>
            <button
              onClick={handleRejectAll}
              className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors w-full sm:w-auto"
            >
              ปฏิเสธทั้งหมด
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors w-full sm:w-auto"
            >
              ยอมรับคุกกี้ทั้งหมด
            </button>
          </div>
        </div>
      ) : (
        // Settings Modal View
        <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-xl font-bold tracking-widest text-black">PRIVACY SETTINGS</h2>
            <button onClick={() => setShow(false)} className="text-gray-400 hover:text-black border border-gray-300 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-grow text-gray-700 bg-white">
            <h3 className="font-bold text-lg mb-4 text-black">ศูนย์การตั้งค่าความเป็นส่วนตัว</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              เมื่อท่านเข้าเยี่ยมชมเว็บไซต์ใดๆ เว็บไซต์นั้นอาจทำการจัดเก็บหรือดึงข้อมูลจากเบราว์เซอร์ของท่าน ส่วนใหญ่แล้วอยู่ในรูปแบบของคุกกี้ ข้อมูลนี้อาจเกี่ยวกับท่าน ความพึงพอใจของท่าน หรืออุปกรณ์ของท่าน และส่วนใหญ่จะถูกใช้เพื่อให้เว็บไซต์ทำงานได้ตามที่ท่านคาดหวัง ข้อมูลดังกล่าวมักจะไม่สามารถระบุตัวตนของท่านได้โดยตรง แต่สามารถมอบประสบการณ์การใช้งานบนเว็บไซต์ที่ปรับให้เป็นส่วนตัวมากขึ้นให้ท่านได้ ท่านสามารถเลือกที่จะไม่อนุญาตคุกกี้บางประเภทได้ คลิกที่ประเภทคุกกี้แต่ละประเภทเพื่อดูข้อมูลเพิ่มเติมและเปลี่ยนการตั้งค่าเริ่มต้นของเรา อย่างไรก็ตาม การบล็อกคุกกี้บางประเภทอาจส่งผลกระทบต่อประสบการณ์ของท่านในการใช้งานเว็บไซต์และบริการที่เรามีให้
            </p>

            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors mb-8"
            >
              อนุญาตทั้งหมด
            </button>
            
            <h3 className="font-bold text-md mb-2 text-black">จัดการการกำหนดลักษณะความยินยอม</h3>
            
            <div className="divide-y divide-gray-200 border-t border-gray-200">
              {/* Necessary Cookies */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
                <div className="pr-0 sm:pr-4 flex-grow">
                  <h4 className="font-bold text-sm text-black">คุกกี้ที่จำเป็น</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    คุกกี้เหล่านี้มีความจำเป็นเพื่อให้เว็บไซต์ทำงานได้และไม่สามารถปิดสวิตช์ในระบบของเราได้ โดยปกติแล้วคุกกี้เหล่านี้จะถูกตั้งค่าเพื่อตอบสนองต่อการดำเนินการของท่านซึ่งถือเป็นการขอรับบริการ เช่น การตั้งค่าความเป็นส่วนตัว การเข้าสู่ระบบ หรือการกรอกแบบฟอร์ม
                  </p>
                </div>
                <div className="text-blue-600 font-semibold text-sm shrink-0 whitespace-nowrap">
                  เปิดใช้งานตลอดเวลา
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
                <div className="pr-0 sm:pr-4 flex-grow">
                  <h4 className="font-bold text-sm text-black">คุกกี้การใช้งาน</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    คุกกี้เหล่านี้ช่วยให้เว็บไซต์สามารถให้การทำงานและปรับแต่งให้เป็นส่วนตัวได้ดียิ่งขึ้น อาจได้รับการตั้งค่าโดยเราหรือผู้ให้บริการบุคคลที่สามที่เราได้เพิ่มบริการลงในหน้าเว็บไซต์ของเรา หากท่านไม่อนุญาตคุกกี้เหล่านี้ บริการบางส่วนหรือทั้งหมดอาจทำงานไม่ถูกต้อง
                  </p>
                </div>
                <label className="shrink-0 relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.functional}
                    onChange={e => setPreferences({...preferences, functional: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                </label>
              </div>

              {/* Performance Cookies */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
                <div className="pr-0 sm:pr-4 flex-grow">
                  <h4 className="font-bold text-sm text-black">คุกกี้ประสิทธิภาพ</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    คุกกี้เหล่านี้ช่วยให้เรานับการเข้าชมและแหล่งที่มาของการเข้าชม เพื่อให้เราสามารถวัดและปรับปรุงประสิทธิภาพเว็บไซต์ของเราได้ คุกกี้เหล่านี้ช่วยให้เราทราบว่าหน้าใดได้รับความนิยมมากที่สุดและน้อยที่สุด ข้อมูลทั้งหมดที่คุกกี้เหล่านี้รวบรวมจะถูกรวมเข้าด้วยกันและไม่ระบุตัวตน
                  </p>
                </div>
                <label className="shrink-0 relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.performance}
                    onChange={e => setPreferences({...preferences, performance: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                </label>
              </div>

              {/* Targeting Cookies */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
                <div className="pr-0 sm:pr-4 flex-grow">
                  <h4 className="font-bold text-sm text-black">คุกกี้กำหนดเป้าหมาย</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    คุกกี้เหล่านี้อาจได้รับการตั้งค่าผ่านเว็บไซต์ของเราโดยพาร์ทเนอร์โฆษณาของเรา บริษัทเหล่านั้นอาจใช้คุกกี้เหล่านี้เพื่อสร้างโปรไฟล์ความสนใจของท่านและแสดงโฆษณาที่เกี่ยวข้องบนเว็บไซต์อื่นๆ หากท่านไม่อนุญาตคุกกี้เหล่านี้ ท่านจะพบโฆษณาที่ตรงเป้าหมายน้อยลง
                  </p>
                </div>
                <label className="shrink-0 relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.targeting}
                    onChange={e => setPreferences({...preferences, targeting: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button
              onClick={handleRejectAll}
              className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors w-full sm:w-auto"
            >
              ปฏิเสธทั้งหมด
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-6 py-3 bg-[#333333] hover:bg-black text-white text-sm font-medium transition-colors w-full sm:w-auto"
            >
              ยืนยันตัวเลือกของฉัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
