import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative w-full h-[520px] md:h-[640px] bg-black flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"
          alt="Athletic training"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#111111CC]" />
        <div className="relative z-10 text-center px-4 max-w-[700px]">
          <p className="font-[Roboto] font-bold text-[12px] text-white/70 mb-4 tracking-wide">
            NEW COLLECTION
          </p>
          <h1 className="font-[Montserrat] font-bold text-[36px] md:text-[48px] leading-[1.1] text-white mb-6">
            PUSH YOUR LIMITS
          </h1>
          <p className="font-[Roboto] text-[16px] text-white/80 mb-8 leading-[24px] max-w-[480px] mx-auto">
            Engineered performance gear for athletes who refuse to settle. Built to move with you.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#E5E7EB] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Performance Fabric",
              desc: "4-way stretch, moisture-wicking, and built to last through the toughest sessions.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
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
              title: "No Compromise",
              desc: "30-day returns, no questions asked. If it doesn't perform, send it back.",
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
            Two products. Zero excuses. Start building your kit today.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#E5E7EB] transition-colors"
          >
            Browse Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
