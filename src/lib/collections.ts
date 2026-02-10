import { prisma } from './prisma';
import type { Collection } from '@prisma/client';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getUniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name);
  let unique = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.collection.findUnique({ where: { slug: unique } });
    if (!existing) return unique;
    unique = `${base}-${counter}`;
    counter++;
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
    });
    return collection;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug },
    });
    return collection;
  } catch (error) {
    console.error('Error fetching collection by slug:', error);
    return null;
  }
}

export async function createCollection(data: { name: string; slug?: string }): Promise<Collection> {
  const slug = data.slug || (await getUniqueSlug(data.name));

  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      slug,
    },
  });

  return collection;
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    slug?: string;
  }
): Promise<Collection> {
  const collection = await prisma.collection.update({
    where: { id },
    data,
  });
  return collection;
}

export async function deleteCollection(id: string): Promise<void> {
  await prisma.collection.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
