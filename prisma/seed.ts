import {
  PrismaClient,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  AddressType,
} from "../src/app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "anna.kowalska@example.com",
        password: "$2b$10$example_hash", // In real app, this would be properly hashed
        firstName: "Anna",
        lastName: "Kowalska",
        phoneNumber: "+48 123 456 789",
      },
    }),
    prisma.user.create({
      data: {
        email: "piotr.nowak@example.com",
        password: "$2b$10$example_hash",
        firstName: "Piotr",
        lastName: "Nowak",
        phoneNumber: "+48 987 654 321",
      },
    }),
    prisma.user.create({
      data: {
        email: "maria.wisniewska@example.com",
        password: "$2b$10$example_hash",
        firstName: "Maria",
        lastName: "Wiśniewska",
        phoneNumber: "+48 555 123 456",
      },
    }),
    prisma.user.create({
      data: {
        email: "jan.kowalczyk@example.com",
        password: "$2b$10$example_hash",
        firstName: "Jan",
        lastName: "Kowalczyk",
        phoneNumber: "+48 666 789 123",
      },
    }),
  ]);

  console.log("Created users:", users.length);

  // Create Addresses
  const addresses = await Promise.all([
    // Anna's addresses
    prisma.address.create({
      data: {
        userId: users[0].id,
        street: "ul. Marszałkowska 123",
        city: "Warszawa",
        postalCode: "00-001",
        country: "Poland",
        isDefault: true,
        addressType: AddressType.BOTH,
      },
    }),
    // Piotr's addresses
    prisma.address.create({
      data: {
        userId: users[1].id,
        street: "ul. Krakowska 45",
        city: "Kraków",
        postalCode: "31-066",
        country: "Poland",
        isDefault: true,
        addressType: AddressType.BOTH,
      },
    }),
    // Maria's addresses
    prisma.address.create({
      data: {
        userId: users[2].id,
        street: "ul. Gdańska 78",
        city: "Gdańsk",
        postalCode: "80-001",
        country: "Poland",
        isDefault: true,
        addressType: AddressType.BOTH,
      },
    }),
    // Jan's addresses
    prisma.address.create({
      data: {
        userId: users[3].id,
        street: "ul. Wrocławska 91",
        city: "Wrocław",
        postalCode: "50-001",
        country: "Poland",
        isDefault: true,
        addressType: AddressType.BOTH,
      },
    }),
  ]);

  console.log("Created addresses:", addresses.length);

  // Create Jewelry Products with both PLN and EUR prices
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Diamond Solitaire Ring",
        priceInGrosz: 299900, // 2999.00 PLN
        priceInCents: 69767, // 697.67 EUR
        description:
          "Elegant 18k white gold solitaire ring with 0.5ct diamond. Perfect for engagement or special occasions.",
        imagePaths: [
          "/images/diamond-ring-1.jpg",
          "/images/diamond-ring-2.jpg",
        ],
        imagePublicIds: ["diamond-ring-1", "diamond-ring-2"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pearl Necklace",
        priceInGrosz: 89900, // 899.00 PLN
        priceInCents: 20907, // 209.07 EUR
        description:
          "Classic freshwater pearl necklace with sterling silver clasp. Timeless elegance for any outfit.",
        imagePaths: ["/images/pearl-necklace-1.jpg"],
        imagePublicIds: ["pearl-necklace-1"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Gold Hoop Earrings",
        priceInGrosz: 45900, // 459.00 PLN
        priceInCents: 10674, // 106.74 EUR
        description:
          "14k yellow gold hoop earrings with intricate pattern. Lightweight and comfortable for daily wear.",
        imagePaths: ["/images/gold-hoops-1.jpg", "/images/gold-hoops-2.jpg"],
        imagePublicIds: ["gold-hoops-1", "gold-hoops-2"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Silver Charm Bracelet",
        priceInGrosz: 32900, // 329.00 PLN
        priceInCents: 7651, // 76.51 EUR
        description:
          "Sterling silver charm bracelet with heart, star, and flower charms. Perfect gift for loved ones.",
        imagePaths: ["/images/silver-bracelet-1.jpg"],
        imagePublicIds: ["silver-bracelet-1"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Emerald Pendant",
        priceInGrosz: 189900, // 1899.00 PLN
        priceInCents: 44163, // 441.63 EUR
        description:
          "Stunning emerald pendant set in 18k white gold with diamond accents. Comes with matching chain.",
        imagePaths: [
          "/images/emerald-pendant-1.jpg",
          "/images/emerald-pendant-2.jpg",
        ],
        imagePublicIds: ["emerald-pendant-1", "emerald-pendant-2"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Rose Gold Watch",
        priceInGrosz: 129900, // 1299.00 PLN
        priceInCents: 30209, // 302.09 EUR
        description:
          "Elegant rose gold watch with mother-of-pearl dial and leather strap. Swiss movement.",
        imagePaths: ["/images/rose-gold-watch-1.jpg"],
        imagePublicIds: ["rose-gold-watch-1"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sapphire Stud Earrings",
        priceInGrosz: 79900, // 799.00 PLN
        priceInCents: 18581, // 185.81 EUR
        description:
          "Blue sapphire stud earrings in 14k white gold setting. Perfect for special occasions.",
        imagePaths: ["/images/sapphire-studs-1.jpg"],
        imagePublicIds: ["sapphire-studs-1"],
        isAvailable: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Vintage Brooch",
        priceInGrosz: 24900, // 249.00 PLN
        priceInCents: 5791, // 57.91 EUR
        description:
          "Antique-style brooch with intricate filigree work and small gemstones. Unique vintage piece.",
        imagePaths: ["/images/vintage-brooch-1.jpg"],
        imagePublicIds: ["vintage-brooch-1"],
        isAvailable: true,
      },
    }),
  ]);

  console.log("Created products:", products.length);

  // Create Orders
  const orders = await Promise.all([
    // Anna's order - Diamond Ring + Pearl Necklace
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: OrderStatus.DELIVERED,
        paymentMethod: PaymentMethod.STRIPE,
        pricePaid: 392800, // 2999 + 899 + 30 shipping
        subtotal: 389800,
        shippingCost: 3000,
        billingAddressId: addresses[0].id,
        shippingAddressId: addresses[0].id,
        createdAt: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-18T14:22:00Z"),
      },
    }),
    // Piotr's order - Gold Hoop Earrings
    prisma.order.create({
      data: {
        userId: users[1].id,
        status: OrderStatus.SHIPPED,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        pricePaid: 48900, // 459 + 30 shipping
        subtotal: 45900,
        shippingCost: 3000,
        billingAddressId: addresses[1].id,
        shippingAddressId: addresses[1].id,
        createdAt: new Date("2024-01-20T16:45:00Z"),
        updatedAt: new Date("2024-01-21T09:15:00Z"),
      },
    }),
    // Maria's order - Emerald Pendant + Silver Bracelet
    prisma.order.create({
      data: {
        userId: users[2].id,
        status: OrderStatus.PROCESSING,
        paymentMethod: PaymentMethod.STRIPE,
        pricePaid: 225800, // 1899 + 329 + 30 shipping
        subtotal: 222800,
        shippingCost: 3000,
        billingAddressId: addresses[2].id,
        shippingAddressId: addresses[2].id,
        createdAt: new Date("2024-01-22T11:20:00Z"),
        updatedAt: new Date("2024-01-22T11:20:00Z"),
      },
    }),
    // Jan's order - Rose Gold Watch
    prisma.order.create({
      data: {
        userId: users[3].id,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        pricePaid: 132900, // 1299 + 30 shipping
        subtotal: 129900,
        shippingCost: 3000,
        billingAddressId: addresses[3].id,
        shippingAddressId: addresses[3].id,
        createdAt: new Date("2024-01-23T14:10:00Z"),
        updatedAt: new Date("2024-01-23T14:10:00Z"),
      },
    }),
    // Anna's second order - Sapphire Earrings + Vintage Brooch
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: OrderStatus.CANCELLED,
        paymentMethod: PaymentMethod.STRIPE,
        pricePaid: 107800, // 799 + 249 + 30 shipping
        subtotal: 104800,
        shippingCost: 3000,
        billingAddressId: addresses[0].id,
        shippingAddressId: addresses[0].id,
        createdAt: new Date("2024-01-24T09:30:00Z"),
        updatedAt: new Date("2024-01-24T15:45:00Z"),
      },
    }),
  ]);

  console.log("Created orders:", orders.length);

  // Create Order Items using the new priceInGrosz field
  const orderItems = await Promise.all([
    // Anna's first order items
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id, // Diamond Ring
        quantity: 1,
        priceInGrosz: 299900,
        currency: "PLN",
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[1].id, // Pearl Necklace
        quantity: 1,
        priceInGrosz: 89900,
        currency: "PLN",
      },
    }),
    // Piotr's order items
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[2].id, // Gold Hoop Earrings
        quantity: 1,
        priceInGrosz: 45900,
        currency: "PLN",
      },
    }),
    // Maria's order items
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[4].id, // Emerald Pendant
        quantity: 1,
        priceInGrosz: 189900,
        currency: "PLN",
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[3].id, // Silver Bracelet
        quantity: 1,
        priceInGrosz: 32900,
        currency: "PLN",
      },
    }),
    // Jan's order items
    prisma.orderItem.create({
      data: {
        orderId: orders[3].id,
        productId: products[5].id, // Rose Gold Watch
        quantity: 1,
        priceInGrosz: 129900,
        currency: "PLN",
      },
    }),
    // Anna's second order items
    prisma.orderItem.create({
      data: {
        orderId: orders[4].id,
        productId: products[6].id, // Sapphire Earrings
        quantity: 1,
        priceInGrosz: 79900,
        currency: "PLN",
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[4].id,
        productId: products[7].id, // Vintage Brooch
        quantity: 1,
        priceInGrosz: 24900,
        currency: "PLN",
      },
    }),
  ]);

  console.log("Created order items:", orderItems.length);

  // Create Payments
  const payments = await Promise.all([
    // Anna's first order payment
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        userId: users[0].id,
        amount: 392800,
        currency: "PLN",
        status: PaymentStatus.COMPLETED,
        paymentMethodType: PaymentMethod.STRIPE,
        transactionId: "stripe_pi_1234567890",
        createdAt: new Date("2024-01-15T10:32:00Z"),
        updatedAt: new Date("2024-01-15T10:32:00Z"),
      },
    }),
    // Piotr's order payment
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        userId: users[1].id,
        amount: 48900,
        currency: "PLN",
        status: PaymentStatus.COMPLETED,
        paymentMethodType: PaymentMethod.BANK_TRANSFER,
        transactionId: "bank_transfer_987654321",
        createdAt: new Date("2024-01-20T17:00:00Z"),
        updatedAt: new Date("2024-01-20T17:00:00Z"),
      },
    }),
    // Maria's order payment
    prisma.payment.create({
      data: {
        orderId: orders[2].id,
        userId: users[2].id,
        amount: 225800,
        currency: "PLN",
        status: PaymentStatus.COMPLETED,
        paymentMethodType: PaymentMethod.STRIPE,
        transactionId: "stripe_pi_0987654321",
        createdAt: new Date("2024-01-22T11:22:00Z"),
        updatedAt: new Date("2024-01-22T11:22:00Z"),
      },
    }),
    // Jan's order payment (pending)
    prisma.payment.create({
      data: {
        orderId: orders[3].id,
        userId: users[3].id,
        amount: 132900,
        currency: "PLN",
        status: PaymentStatus.PENDING,
        paymentMethodType: PaymentMethod.BANK_TRANSFER,
        createdAt: new Date("2024-01-23T14:12:00Z"),
        updatedAt: new Date("2024-01-23T14:12:00Z"),
      },
    }),
    // Anna's second order payment (failed)
    prisma.payment.create({
      data: {
        orderId: orders[4].id,
        userId: users[0].id,
        amount: 107800,
        currency: "PLN",
        status: PaymentStatus.FAILED,
        paymentMethodType: PaymentMethod.STRIPE,
        transactionId: "stripe_pi_failed_123",
        createdAt: new Date("2024-01-24T09:32:00Z"),
        updatedAt: new Date("2024-01-24T15:45:00Z"),
      },
    }),
  ]);

  console.log("Created payments:", payments.length);

  console.log("Seed completed successfully!");
  console.log("Created:");
  console.log(`- ${users.length} users`);
  console.log(`- ${addresses.length} addresses`);
  console.log(`- ${products.length} products`);
  console.log(`- ${orders.length} orders`);
  console.log(`- ${orderItems.length} order items`);
  console.log(`- ${payments.length} payments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
