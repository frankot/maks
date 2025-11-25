import type { Category, Product, ProductStatus } from '@prisma/client';
import FeaturedProducts from './FeaturedProducts';

interface Props {
  category?: Category; // now optional, we ignore it for placeholders
  title?: string;
}

export default async function FeaturedProductsServer({ title }: Props) {
  const now = new Date();
  const titleText = title ?? 'Featured';

  // Fixed 6 example items (images from public/)
  const items: Array<{
    id: string;
    name: string;
    image: string;
    materials: string;
    priceInGrosz: number;
    priceInCents: number;
  }> = [
    {
      id: 'ex-1',
      name: 'Ring #1',
      image: '/ring1.png',
      materials: '18k gold',
      priceInGrosz: 49900,
      priceInCents: 11500,
    },
    {
      id: 'ex-2',
      name: 'Ring #2',
      image: '/ring2.png',
      materials: 'sterling silver',
      priceInGrosz: 50900,
      priceInCents: 11750,
    },
    {
      id: 'ex-3',
      name: 'Necklace #1',
      image: '/neck1.png',
      materials: '14k gold',
      priceInGrosz: 55900,
      priceInCents: 12900,
    },
    {
      id: 'ex-4',
      name: 'Necklace #2',
      image: '/neck2.png',
      materials: 'silver & crystal',
      priceInGrosz: 56900,
      priceInCents: 13150,
    },
    {
      id: 'ex-5',
      name: 'Earring #1',
      image: '/earring1.png',
      materials: 'gold vermeil',
      priceInGrosz: 45900,
      priceInCents: 10900,
    },
    {
      id: 'ex-6',
      name: 'Earring #2',
      image: '/earring2.png',
      materials: 'crystal with silver base',
      priceInGrosz: 46900,
      priceInCents: 11250,
    },
  ];

  const products: Product[] = items.map(
    (it) =>
      ({
        id: it.id,
        name: it.name,
        description: `${it.name} placeholder description`,
        materials: it.materials as unknown as never, // materials is not in generated type; ProductCard reads it optionally
        priceInGrosz: it.priceInGrosz,
        priceInCents: it.priceInCents,
        imagePaths: [it.image],
        imagePublicIds: [],
        productStatus: 'SHOP' as ProductStatus,
        isAvailable: true,
        isFeatured: false,
        createdAt: now,
        updatedAt: now,
        category: 'RINGS' as Category,
      }) as unknown as Product
  );

  return <FeaturedProducts title={titleText} products={products} />;
}
