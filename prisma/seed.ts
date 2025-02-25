import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main() {

    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    await prisma.$queryRaw`TRUNCATE TABLE User;`
    await prisma.$queryRaw`TRUNCATE TABLE Credential;`
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");

   const userRichard = await prisma.user.create({
        data: {
            name: 'Richard',
            lastName: "Guedes",
            email: 'richard@teste.com',
            password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK',
            phone: '11999999999',
            levelUser: "admin",
            balance: 0,
            isActive: true
        },
    });

    const credentialsRichard = await prisma.credential.create({
        data: {
            userId: userRichard.id,
            apiKey: 'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
            secretKey: 'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
            isActive: true
        },
    });

    const userFlavio = await prisma.user.create({
        data: {
            name: 'Flavio',
            lastName: "Domingues",
            email: 'flavio@teste.com',
            password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK',
            phone: '11999999991',
            levelUser: "admin",
            balance: 0,
            isActive: true
        },
    });

    const credentialsFlavio = await prisma.credential.create({
        data: {
            userId: userFlavio.id,
            apiKey: 'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
            secretKey: 'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
            isActive: true
        },
    });

    const userAlberto = await prisma.user.create({
        data: {
            name: 'Alberto',
            lastName: "Ribeiro",
            email: 'alberto@teste.com',
            password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK',
            phone: '11999999992',
            levelUser: "admin",
            balance: 0,
            isActive: true
        },
    });

    const credentialsAlberto = await prisma.credential.create({
        data: {
            userId: userAlberto.id,
            apiKey: 'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
            secretKey: 'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
            isActive: true
        },
    });

    const userAlessandra = await prisma.user.create({
        data: {
            name: 'Alessandra',
            lastName: "Sanches",
            email: 'alessandra@teste.com',
            password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK',
            phone: '11999999993',
            levelUser: "admin",
            balance: 0,
            isActive: true
        },
    });

    const credentialsAlessandra = await prisma.credential.create({
        data: {
            userId: userAlessandra.id,
            apiKey: 'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
            secretKey: 'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
            isActive: true
        },
    });

    const userCaio = await prisma.user.create({
        data: {
            name: 'Caio',
            lastName: "Caio",
            email: 'caio@teste.com',
            password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK',
            phone: '11999999994',
            levelUser: "admin",
            balance: 0,
            isActive: true
        },
    });

    const credentialsCaio = await prisma.credential.create({
        data: {
            userId: userCaio.id,
            apiKey: 'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
            secretKey: 'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
            isActive: true
        },
    });








   

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


