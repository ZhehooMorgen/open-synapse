import { OpenRouter, tool } from "@openrouter/sdk";
import type { $ZodObject, $ZodShape, output as zodInfer } from "zod/v4/core";

const apiKey = process.env.OPENROUTER_API_KEY;
const model = "deepseek/deepseek-v3.2";

export interface NextAction<T extends $ZodObject<$ZodShape>> {
  name: string;
  description: string;
  inputSchema: T;
  onExecute: (params: zodInfer<T>) => Promise<void>;
}

export default class AiSdk {
  private readonly client = new OpenRouter({ apiKey });
  async inferFlow(
    input: string,
    nextActions: NextAction<$ZodObject<$ZodShape>>[],
  ): Promise<void> {
    const sdkTools = nextActions.map((t) =>
      tool({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        execute: false,
      }),
    );

    const result = this.client.callModel({
      model,
      input,
      tools: sdkTools,
    });

    const toolCalls = await result.getToolCalls();
    if (toolCalls.length !== 1) {
      throw new Error(
        "Expected exactly one tool call, but got " + toolCalls.length,
      );
    }
    const toolCall = toolCalls[0]!;

    const matchingAction = nextActions.find((a) => a.name === toolCall.name);
    if (!matchingAction) {
      throw new Error(
        `No matching action found for tool call: ${toolCall.name}`,
      );
    }

    await matchingAction.onExecute(toolCall.arguments);
  }
}
