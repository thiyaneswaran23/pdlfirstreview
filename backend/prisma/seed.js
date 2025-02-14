const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  
  await prisma.user.deleteMany();
  
}

main()
  .then(() => {
    console.log('All data deleted successfully.');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
