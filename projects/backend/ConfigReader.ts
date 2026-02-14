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
    const port = Number(process.env.PORT);
    const databaseUrl = `postgresql://${process.env.pgsqlUser}:${process.env.pgsqlPassword}@localhost:${process.env.pgsqlPort}/${process.env.pgsqlDatabase}`;
    const restatePort = Number(process.env.RESTATE_PORT);
    const restateAdminPort = Number(process.env.RESTATE_ADMIN_PORT);
    const restateWorkerPort = Number(process.env.RESTATE_WORKER_PORT);

    return {
      port,
      databaseUrl,
      restatePort,
      restateAdminPort,
      restateWorkerPort,
    };
  }
}

const configReader = new ConfigReader();

export default configReader;
