import { PrismaClient } from '../server/node_modules/.prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportluiz.com' },
    update: {},
    create: {
      email: 'admin@sportluiz.com',
      password: 'admin',
      subscriptionTier: 'ENTERPRISE'
    }
  });
  console.log('Seeding concluído: Usuário Administrador criado com sucesso!', admin);
}

main()
  .catch((e) => {
    console.error('Erro ao semear o banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
