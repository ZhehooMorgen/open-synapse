import { OpenRouter, tool } from "@openrouter/sdk";
import z from "zod";
import type { $ZodObject, $ZodShape, output as zodInfer } from "zod/v4/core";

const apiKey = process.env.OPENROUTER_API_KEY;
// const model = "deepseek/deepseek-v3.2";
const model = "google/gemini-3-flash-preview";
const MAX_RETRIES = 3;

export interface NextAction<T extends $ZodObject<$ZodShape>> {
  name: string;
  description: string;
  inputSchema: T;
  onExecute: (params: zodInfer<T>) => Promise<void>;
}

export interface IAiSdk {
  inferFlow(
    input: string,
    nextActions: NextAction<$ZodObject<$ZodShape>>[],
  ): Promise<void>;

  directInfer(input: string): Promise<string>;
}

export class OpenRouterSdk implements IAiSdk {
  private readonly client = new OpenRouter({ apiKey });

  async inferFlow(
    input: string,
    nextActions: NextAction<$ZodObject<$ZodShape>>[],
  ): Promise<void> {
    const tools = nextActions.map((t) =>
      tool({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        execute: false,
      }),
    );

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const result = this.client.callModel({
        model,
        input,
        tools,
      });

      let toolCalls;
      try {
        toolCalls = await result.getToolCalls();
      } catch (e) {
        console.log(
          `[AiSdk] attempt ${attempt}/${MAX_RETRIES} getToolCalls failed: ${e}`,
        );
        if (attempt === MAX_RETRIES) throw e;
        continue;
      }

      if (toolCalls.length !== 1) {
        const msg =
          "Expected exactly one tool call, but got " + toolCalls.length;
        console.log(`[AiSdk] attempt ${attempt}/${MAX_RETRIES} ${msg}`);
        if (attempt === MAX_RETRIES) throw new Error(msg);
        continue;
      }
      const toolCall = toolCalls[0]!;

      const matchingAction = nextActions.find((a) => a.name === toolCall.name);
      if (!matchingAction) {
        throw new Error(
          `No matching action found for tool call: ${toolCall.name}`,
        );
      }

      if (toolCall.arguments === undefined || toolCall.arguments === null) {
        console.log(
          `[AiSdk] attempt ${attempt}/${MAX_RETRIES} tool call arguments is null/undefined`,
        );
        if (attempt === MAX_RETRIES)
          throw new Error(
            "Tool call arguments parsing failed after all retries",
          );
        continue;
      }

      const parseResult = z.safeParse(
        matchingAction.inputSchema,
        toolCall.arguments,
      );
      if (!parseResult.success) {
        console.log(
          `[AiSdk] attempt ${attempt}/${MAX_RETRIES} schema validation failed: ${parseResult.error}`,
        );
        if (attempt === MAX_RETRIES)
          throw new Error(
            `Schema validation failed after all retries: ${parseResult.error}`,
          );
        continue;
      }

      await matchingAction.onExecute(parseResult.data);
      return;
    }
  }

  async directInfer(input: string): Promise<string> {
    const result = await this.client.callModel({
      model,
      input,
    });
    return await result.getText();
  }
}
