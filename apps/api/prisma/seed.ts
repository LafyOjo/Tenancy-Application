import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Org',
    },
  });

  // Landlord user and membership
  await prisma.user.create({
    data: {
      email: 'landlord@example.com',
      name: 'Landlord',
      memberships: {
        create: {
          orgId: org.id,
          role: Role.landlord,
        },
      },
    },
  });

  // Tenants
  const tenantInfos = [
    { email: 'tenant1@example.com', name: 'Tenant One' },
    { email: 'tenant2@example.com', name: 'Tenant Two' },
    { email: 'tenant3@example.com', name: 'Tenant Three' },
    { email: 'tenant4@example.com', name: 'Tenant Four' },
  ];

  const tenants = [] as any[];
  for (const info of tenantInfos) {
    const user = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name,
        memberships: {
          create: {
            orgId: org.id,
            role: Role.tenant,
          },
        },
      },
      include: { memberships: true },
    });
    tenants.push(user);
  }

  // Properties and units
  const property1 = await prisma.property.create({
    data: {
      orgId: org.id,
      name: 'Property One',
      address: '123 Main St',
      units: {
        create: [
          { orgId: org.id, name: 'Unit 1A' },
          { orgId: org.id, name: 'Unit 1B' },
        ],
      },
    },
    include: { units: true },
  });

  const property2 = await prisma.property.create({
    data: {
      orgId: org.id,
      name: 'Property Two',
      address: '456 Side St',
      units: {
        create: [
          { orgId: org.id, name: 'Unit 2A' },
        ],
      },
    },
    include: { units: true },
  });

  // Households assigning tenants to units
  await prisma.household.create({
    data: {
      orgId: org.id,
      unitId: property1.units[0].id,
      members: {
        connect: [
          { id: tenants[0].memberships[0].id },
          { id: tenants[1].memberships[0].id },
        ],
      },
    },
  });

  await prisma.household.create({
    data: {
      orgId: org.id,
      unitId: property1.units[1].id,
      members: {
        connect: [{ id: tenants[2].memberships[0].id }],
      },
    },
  });

  await prisma.household.create({
    data: {
      orgId: org.id,
      unitId: property2.units[0].id,
      members: {
        connect: [{ id: tenants[3].memberships[0].id }],
      },
    },
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
