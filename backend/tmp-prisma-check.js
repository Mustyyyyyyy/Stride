const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
prisma.$connect()
  .then(() => {
    console.log('connected');
    return prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
