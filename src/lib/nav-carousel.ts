import { prisma } from './prisma';
import type { NavCarouselContent } from '@prisma/client';

export async function getNavCarouselContent(): Promise<NavCarouselContent | null> {
  try {
    const content = await prisma.navCarouselContent.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return content;
  } catch (error) {
    console.error('Error fetching nav carousel content:', error);
    throw error;
  }
}

export async function createNavCarouselContent(data: {
  texts: string[];
}): Promise<NavCarouselContent> {
  try {
    const content = await prisma.navCarouselContent.create({ data });
    return content;
  } catch (error) {
    console.error('Error creating nav carousel content:', error);
    throw error;
  }
}

export async function updateNavCarouselContent(
  id: string,
  data: { texts: string[] }
): Promise<NavCarouselContent> {
  try {
    const content = await prisma.navCarouselContent.update({
      where: { id },
      data,
    });
    return content;
  } catch (error) {
    console.error('Error updating nav carousel content:', error);
    throw error;
  }
}
