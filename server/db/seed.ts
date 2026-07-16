import { db } from './index.ts'
import { admins, products } from './schema.ts'
import { hashPassword } from '../utils/password.ts'

async function main() {
  console.log('Seeding database...')

  try {
    // 1. Seed Admin
    console.log('Seeding admin...')
    const hashedPassword = await hashPassword('ImaniPrima2026!')
    
    await db.insert(admins).values([
      {
        username: 'admin',
        passwordHash: hashedPassword,
        fullName: 'Super Admin',
        role: 'superadmin'
      },
      {
        username: 'admin_staff',
        passwordHash: hashedPassword,
        fullName: 'Admin Staff',
        role: 'admin'
      }
    ]).onConflictDoNothing()

    // 2. Seed Products
    console.log('Seeding products...')
    const dummyProducts = [
      {
        name: 'SC1000 Device Only',
        slug: 'sc1000-device',
        category: 'Hardware',
        description: 'Vessel tracking device using Orbcomm OGx satellite network. Features solar power and rugged IP68 enclosure. Device only, requires separate subscription.',
        price: 8500000,
        imageUrl: '/images/sc1000-device.jpg',
        imageType: 'device',
        sku: 'SC1000-DEV-001'
      },
      {
        name: 'SC1000 + 1 Year Subscription Bundle',
        slug: 'sc1000-bundle',
        category: 'Bundle',
        description: 'Complete package: SC1000 vessel tracking device with 12 months of Orbcomm OGx satellite connectivity included.',
        price: 11000000,
        imageUrl: '/images/sc1000-bundle.jpg',
        imageType: 'bundle',
        sku: 'SC1000-BND-001'
      },
      {
        name: 'Orbcomm OGx Annual Subscription',
        slug: 'sc1000-subscription',
        category: 'Subscription',
        description: '12-month satellite connectivity subscription for existing SC1000 devices. Includes access to tracking platform.',
        price: 3500000,
        imageUrl: '/images/sc1000-sub.jpg',
        imageType: 'sub',
        sku: 'SC1000-SUB-001'
      }
    ]

    await db.insert(products).values(dummyProducts).onConflictDoNothing()

    console.log('Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

main()
