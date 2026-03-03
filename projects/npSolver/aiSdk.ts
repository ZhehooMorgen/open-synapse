import { OpenRouter, type Tool as OpenRouterTool } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;
const model = "deepseek/deepseek-v3.2";

export type Tool = OpenRouterTool;

export default class AiSdk {
  private readonly openRouter = new OpenRouter({ apiKey });

  async infer(input: string, tools: Tool[]): Promise<void> {
    const request = this.openRouter.callModel({
      model: model,
      input: input,
      tools: tools,
    });
  }
}
