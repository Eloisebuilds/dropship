export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: { name: string; value: string }[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Flex Performance Tee",
    description:
      "Engineered for unrestricted movement. Lightweight 4-way stretch fabric with moisture-wicking technology keeps you cool and dry through every set. Flatlock seams eliminate chafing, while the athletic cut gives a clean, modern silhouette.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#6B7280" },
      { name: "White", value: "#FFFFFF" },
    ],
  },
  {
    id: "2",
    name: "Training Compression Short",
    description:
      "Second-skin compression fit supports muscles and reduces fatigue. Internal drawcord for a secure lock-in, with zip pockets for your essentials. Designed to move with you, not against you.",
    price: 55.0,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
    category: "Bottoms",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Navy", value: "#1E3A5F" },
    ],
  },
];
