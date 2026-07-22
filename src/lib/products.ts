export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  gallery: string[];
  category: string;
  badge?: string;
  cjProductId?: string;
  cjVariantId?: string;
  cjSku?: string;
  inventory?: number;
}

const hardcodedProduct: Product = {
  id: "mop-001",
  name: "360° Microfiber Floor Mop",
  tagline: "Clean Smarter. Not Harder.",
  description:
    "The 360° Microfiber Floor Mop combines a flexible rotating head, built-in cleaner tank, and self-cleaning wringing system into one lightweight tool. Designed for every floor type — hardwood, tile, laminate, and more.",
  price: 15.00,
  originalPrice: 29.95,
  image: "/7.png",
  gallery: ["/7.png"],
  category: "Home Cleaning",
  badge: "Best Seller",
};

export const product: Product = hardcodedProduct;
export const products: Product[] = [hardcodedProduct];

let cachedProducts: Product[] | null = null;

export async function fetchProducts(): Promise<Product[]> {
  if (cachedProducts) return cachedProducts;

  try {
    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
    if (!res.ok) return products;
    const data = await res.json();

    if (data.products && data.products.length > 0) {
      const mapped = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        tagline: "Clean Smarter. Not Harder.",
        description: p.description || hardcodedProduct.description,
        price: parseFloat(p.price) || hardcodedProduct.price,
        originalPrice: parseFloat(p.price) * 2 || hardcodedProduct.originalPrice,
        image: p.image_url || hardcodedProduct.image,
        gallery: [p.image_url || hardcodedProduct.image],
        category: "Home Cleaning",
        badge: "Best Seller",
        cjProductId: p.cj_product_id,
        cjVariantId: p.cj_variant_id,
        inventory: p.stock_quantity,
      }));
      cachedProducts = mapped;
      return mapped;
    }
  } catch {}
  return products;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const all = await fetchProducts();
  return all.find((p) => p.id === id) || null;
}
