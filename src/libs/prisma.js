"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../../generated/prisma");
exports.prisma = new prisma_1.PrismaClient({
    log: ['query'],
});
async function main() {
    // ... you will write your Prisma Client queries here
}
main()
    .then(async () => {
    await exports.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await exports.prisma.$disconnect();
    process.exit(1);
});
