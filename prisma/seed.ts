import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Credential" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Asset" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Order" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Strategy" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Wallet" CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Tradeflow" CASCADE;');

  const assetTheter = await prisma.asset.create({
    data: {
      name: 'TheterUSD',
      symbol: 'USDT',
      isActive: true,
    },
  });

  const assetBTC = await prisma.asset.create({
    data: {
      name: 'Bitcoin',
      symbol: 'BTCUSDT',
      isActive: true,
    },
  });

  const assetEthereum = await prisma.asset.create({
    data: {
      name: 'Ethereum',
      symbol: 'ETHUSDT',
      isActive: true,
    },
  });
  const assetBinance = await prisma.asset.create({
    data: {
      name: 'Binance Coin',
      symbol: 'BNBUSDT',
      isActive: true,
    },
  });
  const assetSolana = await prisma.asset.create({
    data: {
      name: 'Solana',
      symbol: 'SOLUSDT',
      isActive: true,
    },
  });

  const userRichard = await prisma.user.create({
    data: {
      name: 'Richard',
      lastName: 'Guedes',
      email: 'richard@teste.com',
      password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK', //admin@123
      phone: '11999999999',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    },
  });

  const credentialsRichard = await prisma.credential.create({
    data: {
      userId: userRichard.id,
      apiKey:
        'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
      secretKey:
        'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
      isActive: true,
    },
  });

  await prisma.wallet.create({data: {assetId: assetTheter.id,userId: userRichard.id,quantity: "1000",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({data: {assetId: assetBTC.id,userId: userRichard.id,quantity: "0",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({ data: {assetId: assetEthereum.id,userId: userRichard.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetBinance.id,userId: userRichard.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetSolana.id,userId: userRichard.id,quantity: "0",isFavorite: true,isActive: true}});

  const userFlavio = await prisma.user.create({
    data: {
      name: 'Flavio',
      lastName: 'Domingues',
      email: 'flavio@teste.com',
      password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK', //admin@123
      phone: '11999999991',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    },
  });

  const credentialsFlavio = await prisma.credential.create({
    data: {
      userId: userFlavio.id,
      apiKey:
        'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
      secretKey:
        'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
      isActive: true,
    },
  });

  await prisma.wallet.create({data: {assetId: assetTheter.id,userId: userFlavio.id,quantity: "1000",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({data: {assetId: assetBTC.id,userId: userFlavio.id,quantity: "0",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({ data: {assetId: assetEthereum.id,userId: userFlavio.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetBinance.id,userId: userFlavio.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetSolana.id,userId: userFlavio.id,quantity: "0",isFavorite: true,isActive: true}});

  const userAlberto = await prisma.user.create({
    data: {
      name: 'Alberto',
      lastName: 'Ribeiro',
      email: 'alberto@teste.com',
      password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK', //admin@123
      phone: '11999999992',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    },
  });

  const credentialsAlberto = await prisma.credential.create({
    data: {
      userId: userAlberto.id,
      apiKey:
        'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
      secretKey:
        'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
      isActive: true,
    },
  });

  await prisma.wallet.create({data: {assetId: assetTheter.id,userId: userAlberto.id,quantity: "1000",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({data: {assetId: assetBTC.id,userId: userAlberto.id,quantity: "0",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({ data: {assetId: assetEthereum.id,userId: userAlberto.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetBinance.id,userId: userAlberto.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetSolana.id,userId: userAlberto.id,quantity: "0",isFavorite: true,isActive: true}});

  const userAlessandra = await prisma.user.create({
    data: {
      name: 'Alessandra',
      lastName: 'Sanches',
      email: 'alessandra@teste.com',
      password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK', //admin@123
      phone: '11999999993',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    },
  });

  const credentialsAlessandra = await prisma.credential.create({
    data: {
      userId: userAlessandra.id,
      apiKey:
        'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
      secretKey:
        'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
      isActive: true,
    },
  });

  await prisma.wallet.create({data: {assetId: assetTheter.id,userId: userAlessandra.id,quantity: "1000",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({data: {assetId: assetBTC.id,userId: userAlessandra.id,quantity: "0",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({ data: {assetId: assetEthereum.id,userId: userAlessandra.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetBinance.id,userId: userAlessandra.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetSolana.id,userId: userAlessandra.id,quantity: "0",isFavorite: true,isActive: true}});

  const userCaio = await prisma.user.create({
    data: {
      name: 'Caio',
      lastName: 'Caio',
      email: 'caio@teste.com',
      password: '$2b$10$4eqlLF63XHgcdy30QOpS..e32H3dSmzvwqLOIE.S2fN8yd93hGxTK', //admin@123
      phone: '11999999994',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    },
  });

  const credentialsCaio = await prisma.credential.create({
    data: {
      userId: userCaio.id,
      apiKey:
        'kHww0CYVKcjnTQzGVFcej977jKX0cvM2xD1J0Tdg4Zrin9bc8LNEqVu5cwWMyqiU',
      secretKey:
        'dyQD711IPSLNvKTQkYzB7I8IIs0c3kYWXEarYW7Y8GlHrxfffJIT8LXmybMjM9yT',
      isActive: true,
    },
  });

  await prisma.wallet.create({data: {assetId: assetTheter.id,userId: userCaio.id,quantity: "1000",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({data: {assetId: assetBTC.id,userId: userCaio.id,quantity: "0",isFavorite: true,isActive: true,}});
  await prisma.wallet.create({ data: {assetId: assetEthereum.id,userId: userCaio.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetBinance.id,userId: userCaio.id,quantity: "0",isFavorite: true,isActive: true}});
  await prisma.wallet.create({ data: {assetId: assetSolana.id,userId: userCaio.id,quantity: "0",isFavorite: true,isActive: true}});



  console.log('Seed completed!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
