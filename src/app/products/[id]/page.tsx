"use client";

import { useParams } from "next/navigation";
import { product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (product.id !== params.id) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="font-[Montserrat] font-bold text-[24px] text-black mb-4">Product not found</h1>
        <Link href="/products" className="font-[Roboto] text-[14px] font-bold text-black underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, "One Size", "Standard");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const faqs = [
    { q: "Can it be used on hardwood floors?", a: "Yes. The soft microfiber pad is safe on all sealed hardwood floors, as well as tile, laminate, vinyl, and marble." },
    { q: "Can I use my own cleaning solution?", a: "Absolutely. The built-in reservoir lets you fill with any floor-safe cleaning solution of your choice." },
    { q: "Is the microfiber pad machine washable?", a: "Yes. The chenille pad is fully machine washable. We recommend a gentle cycle with cold water for best longevity." },
    { q: "How often should I replace the pad?", a: "With regular use and proper washing, the pad lasts 3–6 months. Replacement pads are also available." },
    { q: "Can it clean under furniture?", a: "Yes. The low-profile design and 135 cm handle let the mop head slide effortlessly under beds, sofas, and cabinets." },
  ];

  return (
    <div>
      {/* ── HERO: Product + Buy Box ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 font-[Roboto] text-[14px] text-[#6B7280] hover:text-black transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div>
            <div className="aspect-[4/5] bg-[#F3F4F6] rounded-[8px] overflow-hidden mb-3">
              <img
                src={product.gallery[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-[72px] h-[72px] rounded-[4px] overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-black" : "border-[#E5E7EB] hover:border-[#6B7280]"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Buy Box */}
          <div className="flex flex-col">
            {product.badge && (
              <span className="self-start font-[Roboto] font-bold text-[12px] text-white bg-black rounded-[4px] px-3 py-1 mb-4">
                {product.badge}
              </span>
            )}
            <p className="font-[Roboto] text-[12px] text-[#6B7280] mb-2">{product.category}</p>
            <h1 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-2">
              {product.name}
            </h1>
            <p className="font-[Anton] text-[20px] text-[#6B7280] mb-4">
              {product.tagline}
            </p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-[Roboto] font-bold text-[24px] text-black">${product.price.toFixed(2)}</span>
              <span className="font-[Roboto] text-[16px] text-[#6B7280] line-through">${product.originalPrice.toFixed(2)}</span>
              <span className="font-[Roboto] font-bold text-[12px] text-[#B91C1C]">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </div>

            <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px] mb-6">
              {product.description}
            </p>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                "360° Flexible Head",
                "Wet & Dry Cleaning",
                "Ultra-Absorbent Pad",
                "Self-Cleaning System",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="font-[Roboto] text-[14px] text-black">{b}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleAdd}
              className="w-full h-[48px] bg-black text-white font-[Roboto] font-bold text-[14px] rounded-[4px] hover:bg-[#6B7280] transition-colors"
            >
              {added ? "Added to Cart ✓" : "Add to Cart — $39.95"}
            </button>

            <div className="flex items-center gap-6 mt-4">
              {["Free Shipping", "30-Day Returns", "Secure Checkout"].map((t) => (
                <span key={t} className="font-[Roboto] text-[12px] text-[#6B7280] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: Clean Smarter ── */}
      <section className="bg-[#F3F4F6] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-3 tracking-wide uppercase">Why FavorItems</p>
          <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-3">
            Clean Smarter. Not Harder.
          </h2>
          <p className="font-[Roboto] text-[14px] text-[#6B7280] mb-10 max-w-[480px] mx-auto leading-[19.6px]">
            The 360° Microfiber Floor Mop is engineered to make floor cleaning faster, easier, and more effective.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[800px] mx-auto">
            {[
              { icon: "🔄", label: "360° Flexible Head" },
              { icon: "💧", label: "Wet & Dry Cleaning" },
              { icon: "🧹", label: "Ultra-Absorbent Microfiber" },
              { icon: "📐", label: "Reaches Every Corner" },
            ].map((b) => (
              <div key={b.label} className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col items-center gap-3">
                <span className="text-[28px]">{b.icon}</span>
                <span className="font-[Roboto] font-bold text-[14px] text-black text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: One Mop. Every Mess. ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-3">
              One Mop. Every Mess.
            </h2>
            <p className="font-[Anton] text-[20px] text-[#6B7280]">
              Wet &amp; Dry Cleaning In A Single Pass
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* Dry */}
            <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white">
              <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-4 uppercase tracking-wide">Dry Cleaning</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Dust", desc: "Traps fine particles with static cling" },
                  { name: "Hair", desc: "Chenille fibers grab pet and human hair" },
                  { name: "Crumbs", desc: "Picks up debris in a single sweep" },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#2563EB] mt-[6px] shrink-0" />
                    <div>
                      <p className="font-[Roboto] font-bold text-[14px] text-black">{item.name}</p>
                      <p className="font-[Roboto] text-[12px] text-[#6B7280]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wet */}
            <div className="border border-[#E5E7EB] rounded-[8px] p-6 bg-white">
              <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-4 uppercase tracking-wide">Wet Cleaning</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Water", desc: "Absorbs spills in seconds" },
                  { name: "Coffee", desc: "Lifts stains without streaking" },
                  { name: "Spills", desc: "Handles liquid messes with ease" },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#2563EB] mt-[6px] shrink-0" />
                    <div>
                      <p className="font-[Roboto] font-bold text-[14px] text-black">{item.name}</p>
                      <p className="font-[Roboto] text-[12px] text-[#6B7280]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Built-In Cleaner Tank ── */}
      <section className="bg-[#F3F4F6] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="aspect-[4/3] bg-white rounded-[8px] overflow-hidden border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80"
              alt="Built-in cleaner tank"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-3 uppercase tracking-wide">Integrated Design</p>
            <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-3">
              Built-In Cleaner Tank
            </h2>
            <p className="font-[Anton] text-[18px] text-[#6B7280] mb-4">
              Add Your Favorite Cleaning Solution
            </p>
            <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px]">
              The built-in reservoir lets you spray cleaning solution directly onto the floor as you mop. No more carrying a separate spray bottle — just fill, press, and clean for a fresher, deeper result.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Self-Cleaning System ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-3 uppercase tracking-wide">Hands-Free</p>
            <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-2">
              Self-Cleaning System
            </h2>
            <p className="font-[Anton] text-[18px] text-[#6B7280] mb-6">
              Self-Cleaning. Hands-Free.
            </p>
            <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px] mb-6">
              Removes dirt and excess water with every pass through the wringing bucket. Your hands stay clean while the mop does the work.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                "No Touching Dirty Water",
                "Removes Trapped Dirt",
                "Faster Cleaning",
                "Reusable Pad",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="font-[Roboto] text-[14px] text-black">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2 aspect-[4/3] bg-[#F3F4F6] rounded-[8px] overflow-hidden border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
              alt="Self-cleaning mop system"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Ultra Absorbent Chenille Pad ── */}
      <section className="bg-[#F3F4F6] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="aspect-[4/3] bg-white rounded-[8px] overflow-hidden border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80"
              alt="Chenille microfiber pad"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-3 uppercase tracking-wide">Premium Material</p>
            <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-2">
              Ultra Absorbent Chenille Pad
            </h2>
            <p className="font-[Anton] text-[18px] text-[#6B7280] mb-6">
              Leaves Floors Dry In Seconds
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Absorbs Water Fast",
                "Streak-Free Finish",
                "Traps Dirt & Hair",
                "Safe On All Floors",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="font-[Roboto] text-[14px] text-black">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Low Profile Design ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-3 uppercase tracking-wide">Reach Everywhere</p>
            <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-3">
              Low Profile Design
            </h2>
            <p className="font-[Anton] text-[18px] text-[#6B7280] mb-4">
              Cleans Where Others Can&apos;t
            </p>
            <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px]">
              The slim, angled head and 135 cm handle let you reach deep under beds, sofas, cabinets, and other furniture — no bending, no moving heavy items.
            </p>
          </div>
          <div className="order-1 md:order-2 aspect-[4/3] bg-[#F3F4F6] rounded-[8px] overflow-hidden border border-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80"
              alt="Low profile mop cleaning under furniture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Specifications ── */}
      <section className="bg-[#F3F4F6] py-16 md:py-20">
        <div className="max-w-[600px] mx-auto px-4 md:px-6">
          <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-8 text-center">
            Specifications
          </h2>
          <div className="border border-[#E5E7EB] rounded-[8px] bg-white overflow-hidden">
            {[
              { label: "Handle Length", value: "135 cm" },
              { label: "Cleaning Head", value: "45 × 12 cm" },
              { label: "Material", value: "PP Plastic + Chenille + Stainless Steel" },
              { label: "Weight", value: "Less than 2 kg" },
            ].map((spec, i) => (
              <div
                key={spec.label}
                className={`flex justify-between items-center px-6 py-4 ${
                  i < 3 ? "border-b border-[#E5E7EB]" : ""
                }`}
              >
                <span className="font-[Roboto] text-[14px] text-[#6B7280]">{spec.label}</span>
                <span className="font-[Roboto] font-bold text-[14px] text-black">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: What's Included ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[600px] mx-auto px-4 md:px-6">
          <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-8 text-center">
            What&apos;s Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { qty: "1 ×", name: "Mop", desc: "Handle + rotating head" },
              { qty: "1 ×", name: "Chenille Cleaning Pad", desc: "Machine washable" },
              { qty: "1 ×", name: "Wringing Bucket", desc: "Self-cleaning system" },
            ].map((item) => (
              <div key={item.name} className="border border-[#E5E7EB] rounded-[8px] p-5 bg-white text-center">
                <p className="font-[Roboto] font-bold text-[12px] text-[#2563EB] mb-2">{item.qty}</p>
                <p className="font-[Montserrat] font-bold text-[17px] text-black mb-1">{item.name}</p>
                <p className="font-[Roboto] text-[12px] text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FAQ ── */}
      <section className="bg-[#F3F4F6] py-16 md:py-20">
        <div className="max-w-[700px] mx-auto px-4 md:px-6">
          <h2 className="font-[Montserrat] font-bold text-[28px] md:text-[30px] text-black mb-8 text-center">
            FAQ
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-[8px] bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-[Roboto] text-[14px] font-bold text-black pr-4">{faq.q}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="font-[Roboto] text-[14px] text-[#6B7280] leading-[19.6px]">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-black py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <h2 className="font-[Anton] text-[28px] md:text-[36px] text-white mb-4">
            READY TO CLEAN SMARTER?
          </h2>
          <p className="font-[Roboto] text-[16px] text-[#6B7280] mb-8 max-w-[480px] mx-auto leading-[24px]">
            Join thousands who&apos;ve already made the switch. Free shipping, 30-day returns.
          </p>
          <button
            onClick={() => {
              handleAdd();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-block bg-white text-black font-[Roboto] font-bold text-[14px] rounded-[4px] px-8 py-3 hover:bg-[#E5E7EB] transition-colors"
          >
            Add to Cart — $39.95
          </button>
        </div>
      </section>
    </div>
  );
}
