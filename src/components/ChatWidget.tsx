"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Support Request from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.open(`mailto:support@favoritems.com?subject=${subject}&body=${body}`, "_blank");
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", message: "" });
    }, 300);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#E5E7EB] w-[340px] overflow-hidden">
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-[Roboto] font-bold text-[14px]">Support Chat</p>
              <p className="font-[Roboto] text-[11px] text-white/70">We&apos;ll get back to you soon</p>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-[48px] h-[48px] bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="font-[Montserrat] font-bold text-[16px] text-black mb-1">Message Sent!</p>
                <p className="font-[Roboto] text-[13px] text-[#6B7280] mb-4">
                  Thank you for reaching out. We&apos;ll get back to you at {form.email} shortly.
                </p>
                <button
                  onClick={handleClose}
                  className="font-[Roboto] text-[13px] text-[#2563EB] font-bold hover:underline"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="font-[Roboto] text-[12px] font-bold text-black mb-1 block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full border border-[#E5E7EB] rounded-[6px] px-3 py-2 font-[Roboto] text-[13px] text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="font-[Roboto] text-[12px] font-bold text-black mb-1 block">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full border border-[#E5E7EB] rounded-[6px] px-3 py-2 font-[Roboto] text-[13px] text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="font-[Roboto] text-[12px] font-bold text-black mb-1 block">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="How can we help you?"
                    className="w-full border border-[#E5E7EB] rounded-[6px] px-3 py-2 font-[Roboto] text-[13px] text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white font-[Roboto] font-bold text-[13px] rounded-[6px] py-2.5 hover:bg-[#6B7280] transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-[56px] h-[56px] rounded-full bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center mx-auto"
        aria-label="Open support chat"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
