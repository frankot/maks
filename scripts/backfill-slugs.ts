import { PrismaClient } from '../src/app/generated/prisma';

const prisma = new PrismaClient();

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function columnExists(): Promise<boolean> {
  try {
    // Use information_schema to check for slug column (case-insensitive table name)
    const result: Array<{ column_name: string }> = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE lower(table_name) = 'product' AND column_name = 'slug'
      LIMIT 1
    `;
    return Array.isArray(result) && result.length > 0;
  } catch (err) {
    console.error('Error checking for slug column:', err);
    return false;
  }
}

async function main() {
  console.log('Starting slug backfill...');

  const exists = await columnExists();
  if (!exists) {
    console.error(
      'Column `slug` not found on `Product`. Please run the migration to add the `slug` column before running this script.'
    );
    process.exit(1);
  }

  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  console.log(`Found ${products.length} products`);

  const used = new Set<string>();
  // collect existing slugs
  for (const p of products) {
    if (p.slug) used.add(p.slug);
  }

  let updated = 0;

  for (const p of products) {
    if (p.slug && String(p.slug).trim() !== '') continue; // already has slug

    const base = p.name ? generateSlug(p.name) : generateSlug(p.id);
    let candidate = base || p.id;
    let counter = 1;

    while (used.has(candidate)) {
      candidate = `${base}-${counter}`;
      counter++;
    }

    try {
      await prisma.product.update({ where: { id: p.id }, data: { slug: candidate } as any });
      used.add(candidate);
      updated++;
      console.log(`Backfilled slug for ${p.id} -> ${candidate}`);
    } catch (err) {
      console.error(`Failed updating product ${p.id}:`, err);
    }
  }

  console.log(`Backfill complete. Updated ${updated} products.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  prisma.$disconnect().finally(() => process.exit(1));
});
