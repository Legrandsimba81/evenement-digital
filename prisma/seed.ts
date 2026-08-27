import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@simba-event.com";
  // Définissez ici votre nouveau mot de passe sécurisé
  const newPassword = "lharmjpkdqgtndfa123!#"; 
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    // Si l'administrateur n'existe pas encore, on le crée
    create: {
      email: adminEmail,
      name: "Super Admin",
      password: hashedPassword,
      role: "ADMIN",
      isSuperAdmin: true,
      emailVerified: new Date(), // ✅ Vérifié par défaut
    },
    // S'il existe déjà, on met à jour le mot de passe et la vérification d'email
    update: {
      password: hashedPassword,
      emailVerified: new Date(), // ✅ Active la vérification d'email
      isSuperAdmin: true,
      role: "ADMIN",
    },
  });

  console.log(`✅ Super Admin (${admin.email}) mis à jour avec succès !`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });