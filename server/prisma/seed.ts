import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const maz = await prisma.person.upsert({
    where: { email: 'mazito.v2@gmail.com' },
    update: {},
    create: {
      email: 'mazito.v2@gmail.com',
      fullName: 'Mario Z',
      state: 'PENDING',
      accountId: "-"
    },
  })
  console.log({ maz })
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