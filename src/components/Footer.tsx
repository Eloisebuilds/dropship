import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <p className="font-[Montserrat] font-bold text-[20px] mb-4">FAVORITEMS</p>
            <p className="font-[Roboto] text-[14px] text-[#6B7280] max-w-[320px] leading-[19.6px]">
              Clean smarter with FavorItems. Performance cleaning tools built to last. No compromises.
            </p>
          </div>

          <div>
            <p className="font-[Roboto] font-bold text-[14px] mb-4">Shop</p>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-white transition-colors">
                Mop
              </Link>
              <Link href="/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-white transition-colors">
                Replacement Pads
              </Link>
              <Link href="/products" className="font-[Roboto] text-[14px] text-[#6B7280] hover:text-white transition-colors">
                Accessories
              </Link>
            </div>
          </div>

          <div>
            <p className="font-[Roboto] font-bold text-[14px] mb-4">Help</p>
            <div className="flex flex-col gap-2">
              <span className="font-[Roboto] text-[14px] text-[#6B7280]">Shipping</span>
              <span className="font-[Roboto] text-[14px] text-[#6B7280]">Returns</span>
              <span className="font-[Roboto] text-[14px] text-[#6B7280]">Contact</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#333] mt-12 pt-8">
          <p className="font-[Roboto] text-[12px] text-[#6B7280]">
            &copy; {new Date().getFullYear()} FavorItems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
