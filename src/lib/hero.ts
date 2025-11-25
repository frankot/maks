import { prisma } from './prisma';
import type { HeroContent } from '@prisma/client';

export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    // Get the most recent hero content
    const heroContent = await prisma.heroContent.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    return heroContent;
  } catch (error) {
    console.error('Error fetching hero content:', error);
    throw error;
  }
}

export async function createHeroContent(data: {
  description: string;
  imagePaths: string[];
  imagePublicIds: string[];
  href?: string;
  textHref?: string;
}): Promise<HeroContent> {
  try {
    const heroContent = await prisma.heroContent.create({
      data,
    });

    return heroContent;
  } catch (error) {
    console.error('Error creating hero content:', error);
    throw error;
  }
}

export async function updateHeroContent(
  id: string,
  data: {
    description?: string;
    imagePaths?: string[];
    imagePublicIds?: string[];
    href?: string;
    textHref?: string;
  }
): Promise<HeroContent> {
  try {
    const heroContent = await prisma.heroContent.update({
      where: { id },
      data,
    });

    return heroContent;
  } catch (error) {
    console.error('Error updating hero content:', error);
    throw error;
  }
}

export async function deleteHeroContent(id: string): Promise<void> {
  try {
    await prisma.heroContent.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting hero content:', error);
    throw error;
  }
}
