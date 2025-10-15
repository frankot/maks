'use client';

import { useState, useEffect } from 'react';
import type { HeroContent, Product } from '@/app/generated/prisma';
import HeroPreview from './HeroPreview';
import HeroImagesManager from './HeroImagesManager';
import HeroTextEditor from './HeroTextEditor';
import FeaturedProductsManager from './FeaturedProductsManager';
import CmsLayout from './shared/CmsLayout';

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heroResponse, productsResponse, featuredResponse] = await Promise.all([
        fetch('/api/hero'),
        fetch('/api/products'),
        fetch('/api/products?featured=true'),
      ]);

      if (heroResponse.ok) {
        const heroData = await heroResponse.json();
        setHeroContent(heroData);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setAllProducts(productsData);
      }

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        setFeaturedProducts(featuredData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const preview = <HeroPreview heroContent={heroContent} featuredProducts={featuredProducts} />;

  return (
    <CmsLayout title="Edit Hero Content" preview={preview}>
      <HeroImagesManager heroContent={heroContent} onUpdate={fetchData} />
      <HeroTextEditor heroContent={heroContent} onUpdate={fetchData} />
      <FeaturedProductsManager
        allProducts={allProducts}
        featuredProducts={featuredProducts}
        setFeaturedProducts={setFeaturedProducts}
      />
    </CmsLayout>
  );
}
