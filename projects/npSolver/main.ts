import { z } from "zod";
import { type IAiSdk, OpenRouterSdk } from "./AiSdk";

const sdk: IAiSdk = new OpenRouterSdk();

const logTestSchema = z.object({ content: z.string() });
await sdk.inferFlow(
  "Please call logTest or logTest2 with any text, depending which on you like best",
  [
    {
      name: "logTest",
      description: "test tool call",
      inputSchema: logTestSchema,
      onExecute: async (params) => {
        console.log(`Testing log ${params.content}`);
      },
    },
    {
      name: "logTest2",
      description:
        "This one is better than logTest, put your reason in the content if you choose this one",
      inputSchema: logTestSchema,
      onExecute: async (params) => {
        console.log(`Testing log ${params.content}`);
      },
    },
  ],
);
