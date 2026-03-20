const { PrismaClient } = require('./generated/prisma')

const prisma = new PrismaClient()

async function main() {
  await prisma.token.upsert({
    where: { id: 1 },
    update: { token: '51c7595d9c5116745064bbcfab5f2b9f48359C9D2418362110D7DE833D50C540849C3283' },
    create: { id: 1, token: '51c7595d9c5116745064bbcfab5f2b9f48359C9D2418362110D7DE833D50C540849C3283' }
  })
  console.log('Token inserido com sucesso!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
