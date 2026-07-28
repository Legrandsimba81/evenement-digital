import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdmin() {
  const adminEmail = 'admin@simba-event.com'

  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${adminEmail}`)
      return
    }

    if (admin.isSuperAdmin === true) {
      console.log('✅ L\'utilisateur est déjà super admin.')
      return
    }

    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: { isSuperAdmin: true },
    })

    console.log(`✅ ${updated.email} est maintenant super admin.`)
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdmin()