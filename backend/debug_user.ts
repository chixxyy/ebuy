
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@ebuy.com'
  const user = await prisma.user.findUnique({
    where: { email },
  })
  
  if (user) {
      console.log('User found:', user)
      // Be careful not to log full hash if sensitive, but here we need to see if it looks like a bcrypt hash
      console.log('Password hash length:', user.password.length)
      console.log('Password hash start:', user.password.substring(0, 10))
  } else {
      console.log('User NOT found')
      const allUsers = await prisma.user.findMany()
      console.log('Total users:', allUsers.length)
      allUsers.forEach(u => console.log('Existing user:', u.email))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
