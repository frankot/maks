import { prisma } from './prisma';
import { AddressType, Prisma } from '@prisma/client';

interface AddressData {
  userId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  addressType: AddressType;
}

/**
 * Finds an existing address or creates a new one if no match is found.
 * Matches based on: userId, city, postalCode, street, and country.
 * This prevents duplicate addresses for the same user.
 */
export async function findOrCreateAddress(
  data: AddressData,
  tx?: Prisma.TransactionClient
): Promise<{ id: string }> {
  const client = tx || prisma;

  // Try to find an existing address with matching criteria
  const existingAddress = await client.address.findFirst({
    where: {
      userId: data.userId,
      city: data.city,
      postalCode: data.postalCode,
      street: data.street,
      country: data.country,
    },
  });

  if (existingAddress) {
    console.log(`♻️ Reusing existing address ${existingAddress.id}`);
    return existingAddress;
  }

  // Create new address if no match found
  const newAddress = await client.address.create({
    data,
  });

  console.log(`✨ Created new address ${newAddress.id}`);
  return newAddress;
}
