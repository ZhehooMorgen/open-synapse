import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './prisma/client/client'
import configReader from './ConfigReader'

const { databaseUrl } = configReader.getConfig();
const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

export { prisma }