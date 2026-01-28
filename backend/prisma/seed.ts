import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: 'Premium Wireless Headphones',
      price: 299,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      category: 'Audio',
      rating: 4.8,
      reviews: 128,
      description: 'Experience high-fidelity sound with our premium wireless headphones. Featuring active noise cancellation and 30-hour battery life.'
    },
    {
      name: 'Ergonomic Office Chair',
      price: 199,
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      category: 'Furniture',
      rating: 4.5,
      reviews: 85,
      description: 'Work in comfort with this fully adjustable ergonomic office chair. Mesh back for breathability and lumbar support.'
    },
    {
      name: 'Mechanical Gaming Keyboard',
      price: 129,
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
      category: 'Gaming',
      rating: 4.9,
      reviews: 210,
      description: 'Tactile mechanical switches and customizable RGB lighting for the ultimate gaming experience. Durable aluminum frame.'
    },
    {
      name: 'Smart Fitness Watch',
      price: 159,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      category: 'Wearables',
      rating: 4.6,
      reviews: 150,
      description: 'Track your workouts, heart rate, and sleep with precision. Water-resistant and features a vibrant OLED display.'
    },
    {
      name: 'Designer Aviator Sunglasses',
      price: 89,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
      category: 'Accessories',
      rating: 4.7,
      reviews: 92,
      description: 'Protect your eyes in style with these premium aviator sunglasses. Polarization for reduced glare.'
    },
    {
      name: 'Minimalist Urban Backpack',
      price: 79,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      category: 'Bags',
      rating: 4.4,
      reviews: 64,
      description: 'Durable and stylish backpack for your daily commute. Features a padded laptop compartment and water-resistant fabric.'
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
