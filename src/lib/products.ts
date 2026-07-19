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
}

export const product: Product = {
  id: "mop-001",
  name: "360° Microfiber Floor Mop",
  tagline: "Clean Smarter. Not Harder.",
  description:
    "The 360° Microfiber Floor Mop combines a flexible rotating head, built-in cleaner tank, and self-cleaning wringing system into one lightweight tool. Designed for every floor type — hardwood, tile, laminate, and more.",
  price: 39.95,
  originalPrice: 59.95,
  image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
  ],
  category: "Home Cleaning",
  badge: "Best Seller",
};

export const products = [product];
