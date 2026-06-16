import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking Job model fields...')
  // @ts-ignore - checking if it exists at runtime
  const droids = Object.keys(prisma.job);
  console.log('Job model available methods:', droids)
  
  // We can't easily check fields without a query, but we can check the DMMF
  // @ts-ignore
  const fields = prisma._dmmf.modelMap.Job.fields.map(f => f.name)
  console.log('Job fields in DMMF:', fields)
  
  if (fields.includes('threadId')) {
    console.log('SUCCESS: threadId is present in Prisma Client')
  } else {
    console.log('FAILURE: threadId is MISSING from Prisma Client')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
