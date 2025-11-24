import type { Category, Product, ProductStatus } from '@/app/generated/prisma';
import FeaturedProductsDynamic from './FeaturedProductsDynamic';

interface Props {
  initialCategory?: Category;
}

export default async function FeaturedProductsDynamicServer({ initialCategory }: Props) {
  const now = new Date();

  const makeProduct = (id: string, name: string, image: string, materials: string, priceInGrosz: number, category: Category): Product =>
    ({
      id,
      name,
      description: `${name} placeholder description`,
      materials: materials as unknown as never,
      priceInGrosz,
      priceInCents: Math.round(priceInGrosz / 4.35),
      imagePaths: [image],
      imagePublicIds: [],
      productStatus: 'SHOP' as ProductStatus,
      isAvailable: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
      category,
    }) as unknown as Product;

  const rings: Product[] = [
    makeProduct('ex-r1', 'Ring #1', '/ring1.png', '18k gold', 49900, 'RINGS' as Category),
    makeProduct('ex-r2', 'Ring #2', '/ring2.png', 'sterling silver', 50900, 'RINGS' as Category),
  ];

  const necklaces: Product[] = [
    makeProduct('ex-n1', 'Necklace #1', '/neck1.png', '14k gold', 55900, 'NECKLACES' as Category),
    makeProduct('ex-n2', 'Necklace #2', '/neck2.png', 'silver & crystal', 56900, 'NECKLACES' as Category),
  ];

  const earrings: Product[] = [
    makeProduct('ex-e1', 'Earring #1', '/earring1.png', 'gold vermeil', 45900, 'EARRINGS' as Category),
    makeProduct('ex-e2', 'Earring #2', '/earring2.png', 'crystal with silver base', 46900, 'EARRINGS' as Category),
  ];

  // Repeat placeholder data 3x per category to provide more content for scrolling
  const repeatProducts = (base: Product[], times: number): Product[] => {
    const out: Product[] = [];
    for (let i = 0; i < times; i++) {
      for (let j = 0; j < base.length; j++) {
        const p = base[j]!;
        out.push({ ...p, id: `${p.id}-x${i + 1}` } as Product);
      }
    }
    return out;
  };

  const categoryProducts: Record<Category, Product[]> = {
    RINGS: repeatProducts(rings, 3),
    NECKLACES: repeatProducts(necklaces, 3),
    EARRINGS: repeatProducts(earrings, 3),
  } as Record<Category, Product[]>;

  const categoryTitles: Partial<Record<Category, string>> = {
    RINGS: 'Rings',
    NECKLACES: 'Necklaces',
    EARRINGS: 'Earrings',
  };

  return (
    <FeaturedProductsDynamic
      initialCategory={initialCategory ?? ('RINGS' as Category)}
      categoryProducts={categoryProducts}
      categoryTitles={categoryTitles}
    />
  );
}
