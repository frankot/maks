import { getCollections } from '@/lib/collections'
import CollectionsBar from '../_components/CollectionsBar'
import PageWithHeroBar from '../_components/PageWithHeroBar'
import { Suspense } from 'react'
import ProductsClient from '../_components/ProductsClient'
import ProductsSkeleton from '../_components/ProductsSkeleton'

export default async function ShopPage() {
  const collections = await getCollections()

  return (
    <>
      {/* Hero + Collections Bar Wrapper */}
      <PageWithHeroBar imagePath="/shop_main.webp" imageAlt="Shop">
        <CollectionsBar collections={collections} />
      </PageWithHeroBar>

      {/* Client-rendered products list (handles collection filtering smoothly) */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsClient />
      </Suspense>
    </>
  )
}
