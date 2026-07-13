import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-32 px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 mb-6">
            Welcome to Dropship
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Quality products at great prices. Shop our curated collection of
            trending items.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">
              Trending Products
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Discover what&apos;s popular right now
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">
              Fast Shipping
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Get your orders delivered quickly
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-zinc-50">
              Quality Assured
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Only the best products make it here
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-8 py-4 text-lg font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Browse Products →
          </Link>
        </div>
      </main>
    </div>
  );
}
