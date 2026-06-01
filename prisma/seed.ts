import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

interface SeedUser {
  email: string;
  name: string;
  role: Role;
}

async function upsertUser({ email, name, role }: SeedUser, password: string) {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { name, role, active: true },
    create: {
      email: normalizedEmail,
      name,
      role,
      active: true,
      passwordHash,
    },
  });

  // Only set the password on creation so re-seeding does not reset it.
  if (!user.passwordHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  return user;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@academy.test";
  const adminName = process.env.ADMIN_NAME ?? "Academy Admin";

  await upsertUser(
    { email: adminEmail, name: adminName, role: "ADMIN" },
    DEFAULT_PASSWORD,
  );

  // Demo accounts to make role-based testing easy in development.
  await upsertUser(
    { email: "trainer@academy.test", name: "Demo Trainer", role: "TRAINER" },
    DEFAULT_PASSWORD,
  );
  await upsertUser(
    { email: "user@academy.test", name: "Demo Member", role: "USER" },
    DEFAULT_PASSWORD,
  );

  console.log("Seed complete. Accounts:");
  console.log(`  ADMIN   ${adminEmail}`);
  console.log("  TRAINER trainer@academy.test");
  console.log("  USER    user@academy.test");
  console.log(`  Password (all): ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
