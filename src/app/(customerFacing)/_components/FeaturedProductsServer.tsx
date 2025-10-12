import type { Category, Product, ProductStatus } from "@/app/generated/prisma";
import FeaturedProducts from "./FeaturedProducts";

interface Props {
  category: Category;
  title?: string;
}

export default async function FeaturedProductsServer({ category, title }: Props) {
  const now = new Date();
  const titleText = title ?? category.toString();

  const label = category === "RINGS" ? "Ring" : category === "NECKLACES" ? "Necklace" : "Earring";

  // Use local public assets and repeat the 2 images three times to make 6 items
  const imagesByCat = {
    RINGS: ["/ring1.png", "/ring2.png"],
    NECKLACES: ["/neck1.png", "/neck2.png"],
    EARRINGS: ["/earring1.png", "/earring2.png"],
  } as const;

  const imgs = imagesByCat[category] ?? imagesByCat.RINGS;

  // Exactly 6 placeholder items per category; cycle the two images 3 times
  const products: Product[] = Array.from({ length: 6 }).map((_, i) => {
    const idx = i % imgs.length;
    return {
      id: `${category.toLowerCase()}-${i + 1}`,
      name: `${label} #${i + 1}`,
      description: `${label} placeholder description for ${titleText}.`,
      priceInGrosz: 49900 + i * 1000,
      priceInCents: 11500 + i * 250,
      imagePaths: [imgs[idx]],
      imagePublicIds: [],
      productStatus: "SHOP" as ProductStatus,
      isAvailable: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
      category,
    } as unknown as Product;
  });

  return <FeaturedProducts title={titleText} products={products} />;
}
