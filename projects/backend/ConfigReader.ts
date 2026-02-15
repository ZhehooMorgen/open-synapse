export interface IConfigReader {
  getConfig(): {
    port: number;
    databaseUrl: string;
    restatePort: number;
    restateAdminPort: number;
    restateWorkerPort: number;
  };
}

class ConfigReader implements IConfigReader {
  getConfig() {
    return {
      port: Number(process.env.PORT),
      databaseUrl: `postgresql://${process.env.pgsqlUser}:${process.env.pgsqlPassword}@localhost:${process.env.pgsqlPort}/${process.env.pgsqlDatabase}`,
      restatePort: Number(process.env.RESTATE_PORT),
      restateAdminPort: Number(process.env.RESTATE_ADMIN_PORT),
      restateWorkerPort: Number(process.env.RESTATE_WORKER_PORT),
    };
  }
}

const configReader = new ConfigReader();

export default configReader;
