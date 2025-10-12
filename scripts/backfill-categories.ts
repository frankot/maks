import { PrismaClient, Category } from "../src/app/generated/prisma";

const prisma = new PrismaClient();

function inferCategory(name: string): Category {
  const n = name.toLowerCase();
  if (/ring|pierścień/.test(n)) return Category.RINGS;
  if (/necklace|naszyjnik|pendant|wisiorek/.test(n)) return Category.NECKLACES;
  if (/earring|kolczyk/.test(n)) return Category.EARRINGS;
  // Fallback: use RINGS as default to match schema default
  return Category.RINGS;
}

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const p of products) {
    // Skip if already set (in case defaults or manual edits exist)
    if (p.category) continue;
    const category = inferCategory(p.name);
    await prisma.product.update({
      where: { id: p.id },
      data: { category },
    });
    updated++;
  }

  console.log(`Backfill complete. Updated ${updated} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
