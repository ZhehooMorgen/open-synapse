// this file is used by prisma cli tool
// so do not move or delete it even if it is not imported anywhere in the codebase
import "dotenv/config";
import configReader from './ConfigReader'
import { defineConfig } from "prisma/config";

const { databaseUrl } = configReader.getConfig();

console.log("Using database URL:", databaseUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
