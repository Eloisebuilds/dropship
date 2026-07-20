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
  price: 15.00,
  originalPrice: 29.95,
  image: "/7.png",
  gallery: ["/7.png"],
  category: "Home Cleaning",
  badge: "Best Seller",
};

export const products = [product];
