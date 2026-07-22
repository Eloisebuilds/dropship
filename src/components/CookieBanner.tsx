"use client";

import { useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("cookie-accepted");
    }
    return false;
  });

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie-accepted", "true");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#111111CC] backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-[Roboto] text-[14px] text-white leading-[19.6px] max-w-[600px]">
          We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-4 py-2 hover:bg-[#E5E7EB] transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
