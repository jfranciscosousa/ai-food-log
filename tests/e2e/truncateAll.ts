import { Prisma, PrismaClient } from "@prisma/client";

// This only works for postgres!
export async function truncateAll() {
  const client = new PrismaClient();
  const tables = getTables();
  const commands = tables.map((table) => truncateTable(client, table));

  await Promise.all(commands);

  await client.$disconnect();
}

export function truncateTable(client: PrismaClient, table: string) {
  // Use DELETE instead of TRUNCATE to avoid permission issues
  // Note: This is slower but works with restricted database users
  return client.$executeRawUnsafe(`DELETE FROM "${table}"`);
}

function getTables() {
  return Prisma.dmmf.datamodel.models.map((model) => {
    return model.dbName || model.name;
  });
}
