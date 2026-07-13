import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
              Products
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Browse our collection
            </p>
          </div>
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
              No Products Yet
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Add your first product through the Supabase dashboard to get
              started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow"
              >
                {product.image_url && (
                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-black dark:text-zinc-50">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
