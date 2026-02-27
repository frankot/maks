import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [Category.RINGS, Category.NECKLACES, Category.EARRINGS]

function randomCategory(): Category {
  return categories[Math.floor(Math.random() * categories.length)]
}

async function main() {
  const products = await prisma.product.findMany()
  let updated = 0

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { category: randomCategory() },
    })
    updated++
  }

  console.log(`Random backfill complete. Updated ${updated} products to random categories.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
