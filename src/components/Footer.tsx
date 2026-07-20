export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <p className="font-[Montserrat] font-bold text-[20px] mb-4">FAVORITEMS</p>
            <p className="font-[Roboto] text-[14px] text-[#6B7280] max-w-[320px] leading-[19.6px]">
              Your favorite home items.
            </p>
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
