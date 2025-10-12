import { prisma } from "@/lib/prisma";

async function run() {
  const id = "smoke-test-product";

  // Cleanup if exists
  try {
    await prisma.product.delete({ where: { id } });
  } catch {}

  // Create with category RINGS
  const created = await prisma.product.create({
    data: {
      id,
      name: "Smoke Test Product",
      priceInGrosz: 12345,
      priceInCents: 2999,
      description: "Smoke test product for category field.",
      imagePaths: [],
      imagePublicIds: [],
      isAvailable: true,
      productStatus: "SHOP",
      category: "RINGS",
    },
  });
  console.log("Created:", { id: created.id, category: created.category });

  // Update category to NECKLACES
  const updated = await prisma.product.update({
    where: { id },
    data: { category: "NECKLACES" },
  });
  console.log("Updated:", { id: updated.id, category: updated.category });

  // Fetch and confirm
  const fetched = await prisma.product.findUnique({ where: { id } });
  console.log("Fetched:", { id: fetched?.id, category: fetched?.category });

  // Cleanup
  await prisma.product.delete({ where: { id } });
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error("Smoke test failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
