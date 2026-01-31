import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "test@ebuy.com";
  const newPassword = "123456";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`Password for ${email} has been reset to: ${newPassword}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
