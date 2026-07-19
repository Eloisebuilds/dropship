import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative w-full h-[520px] md:h-[640px] bg-black flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80"
          alt="Clean home floor"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#111111CC]" />
        <div className="relative z-10 text-center px-4 max-w-[700px]">
          <p className="font-[Roboto] font-bold text-[12px] text-white/70 mb-4 tracking-wide">
            BEST SELLER
          </p>
          <h1 className="font-[Montserrat] font-bold text-[36px] md:text-[48px] leading-[1.1] text-white mb-6">
            CLEAN SMARTER. NOT HARDER.
          </h1>
          <p className="font-[Roboto] text-[16px] text-white/80 mb-8 leading-[24px] max-w-[480px] mx-auto">
            The 360° Microfiber Floor Mop. Wet &amp; dry cleaning, self-cleaning system, and a built-in tank — all in one tool.
          </p>
          <Link
            href="/products/mop-001"
            className="inline-block bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#E5E7EB] transition-colors"
          >
            Shop Now — $39.95
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "360° Flexible Head",
              desc: "Rotating mop head reaches every corner, under furniture, and along baseboards with ease.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              ),
            },
            {
              title: "Free Shipping",
              desc: "Fast, tracked delivery on all orders. No minimums, no hidden fees.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="6" width="15" height="12" rx="1" />
                  <path d="M16 10h4l3 3v5h-7V10z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
            },
            {
              title: "30-Day Returns",
              desc: "Not satisfied? Send it back within 30 days, no questions asked.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.title} className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-[Montserrat] font-bold text-[17px] text-black mb-2">{f.title}</h3>
              <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <h2 className="font-[Anton] text-[28px] md:text-[36px] text-white mb-4">
            GEAR UP. SHOW UP.
          </h2>
          <p className="font-[Roboto] text-[16px] text-[#6B7280] mb-8 max-w-[480px] mx-auto leading-[24px]">
            One product. Zero excuses. Start cleaning smarter today.
          </p>
          <Link
            href="/products/mop-001"
            className="inline-block bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#E5E7EB] transition-colors"
          >
            View Product
          </Link>
        </div>
      </section>
    </div>
  );
}
