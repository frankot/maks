import { prisma } from './prisma';
import type { MarqueeContent } from '@prisma/client';

export async function getMarqueeContent(): Promise<MarqueeContent | null> {
  try {
    const content = await prisma.marqueeContent.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return content;
  } catch (error) {
    console.error('Error fetching marquee content:', error);
    throw error;
  }
}

export async function createMarqueeContent(data: {
  description: string;
  href?: string;
  textHref?: string;
}): Promise<MarqueeContent> {
  try {
    const content = await prisma.marqueeContent.create({ data });
    return content;
  } catch (error) {
    console.error('Error creating marquee content:', error);
    throw error;
  }
}

export async function updateMarqueeContent(
  id: string,
  data: {
    description?: string;
    href?: string;
    textHref?: string;
  }
): Promise<MarqueeContent> {
  try {
    const content = await prisma.marqueeContent.update({
      where: { id },
      data,
    });
    return content;
  } catch (error) {
    console.error('Error updating marquee content:', error);
    throw error;
  }
}
