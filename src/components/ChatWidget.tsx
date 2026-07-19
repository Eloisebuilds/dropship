"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#E5E7EB] w-[300px] overflow-hidden">
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-[Roboto] font-bold text-[14px]">FavorItems Support</p>
              <p className="font-[Roboto] text-[11px] text-white/80">Typically replies within minutes</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="bg-[#DCF8C6] rounded-[8px] px-3 py-2 mb-3 max-w-[220px]">
              <p className="font-[Roboto] text-[13px] text-black">Hi there! How can we help you with the 360° Microfiber Floor Mop?</p>
            </div>
            <a
              href="https://wa.me/1234567890?text=Hi%20FavorItems!%20I%20have%20a%20question%20about%20the%20360%C2%B0%20Microfiber%20Floor%20Mop"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#25D366] text-white font-[Roboto] font-bold text-[13px] rounded-[8px] py-2.5 hover:bg-[#1EBE57] transition-colors"
            >
              Open WhatsApp Chat
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-[56px] h-[56px] rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_24px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center mx-auto"
        aria-label="Chat with us on WhatsApp"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>
    </div>
  );
}
