import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
})

async function main() {
  console.log('Starting customers-only seed...')

  const baseCustomers = [
    {
      email: 'anna.kowalska@example.com',
      password: '$2b$10$example_hash',
      firstName: 'Anna',
      lastName: 'Kowalska',
      phoneNumber: '+48 123 456 789',
    },
    {
      email: 'piotr.nowak@example.com',
      password: '$2b$10$example_hash',
      firstName: 'Piotr',
      lastName: 'Nowak',
      phoneNumber: '+48 987 654 321',
    },
    {
      email: 'maria.wisniewska@example.com',
      password: '$2b$10$example_hash',
      firstName: 'Maria',
      lastName: 'Wisniewska',
      phoneNumber: '+48 555 123 456',
    },
    {
      email: 'jan.kowalczyk@example.com',
      password: '$2b$10$example_hash',
      firstName: 'Jan',
      lastName: 'Kowalczyk',
      phoneNumber: '+48 666 789 123',
    },
  ]

  const placeholderCustomers = Array.from({ length: 50 }, (_, index) => {
    const customerNumber = index + 1
    const padded = String(customerNumber).padStart(3, '0')

    return {
      email: `placeholder.customer.${padded}@example.com`,
      password: null,
      firstName: `Placeholder${padded}`,
      lastName: 'Customer',
      phoneNumber: `+48 700 000 ${String(customerNumber).padStart(3, '0')}`,
    }
  })

  const allCustomers = [...baseCustomers, ...placeholderCustomers]

  const result = await prisma.user.createMany({
    data: allCustomers,
    skipDuplicates: true,
  })

  console.log('Customers attempted:', allCustomers.length)
  console.log('Customers inserted:', result.count)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
