import * as restate from "@restatedev/restate-sdk/fetch";
import * as restateClient from "@restatedev/restate-sdk-clients";
import { Elysia, t } from "elysia";
import { z } from "zod";

console.log("Starting Open Synapse Backend...");

const Greeting = z.object({
  name: z.string(),
});

const GreetingResponse = z.object({
  result: z.string(),
});

const greeter = restate.service({
  name: "Greeter",
  handlers: {
    greet: restate.handlers.handler(
      {
        input: restate.serde.schema(Greeting),
        output: restate.serde.schema(GreetingResponse),
      },
      async (ctx: restate.Context, { name }) => {
        return { result: `You said hi to ${name}!` };
      },
    ),
  },
});

const workerPort = Number(process.env.restateWorkerPort);
const handler = restate.createEndpointHandler({
  services: [greeter],
});
Bun.serve({
  port: workerPort,
  fetch: handler,
});

const restatePort = Number(process.env.restatePort);
const rs = restateClient.connect({ url: `http://localhost:${restatePort}` });
const greeterClient = rs.serviceClient(greeter);

const app = new Elysia();
app.get("/", () => "Hello World!");
app.post("/greet", async (ctx) => {
  try {
    const r = await greeterClient.greet({ name: "Open Synapse" });
    return r;
  } catch (e) {
    console.error("Error calling greet:", e);
    throw e;
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port);

console.log(`Open Synapse Backend is running on port ${port}`);
