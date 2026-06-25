import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@simba-event.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'ADMIN',
      }
    })
    console.log('✅ Admin créé avec succès')
  } else {
    console.log('ℹ️ L\'admin existe déjà')
  }
}

main()
  .catch(e => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })