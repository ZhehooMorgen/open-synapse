import z from "zod";
import type { IAiSdk, NextAction } from "./AiSdk";
import prompts from "./prompts";

interface FinalAnswer {
  answer: string;
  steps: string[];
}

enum NodeStatus {
  Accepted = "accepted",
  Rejected = "rejected",
  Finalized = "finalized",
}

interface ReasonNode {
  context: string;
  conclusion: string;
  result: NodeStatus;
}

const DEFAULT_MAX_ITERATION = 16;

export class NPSolver {
  constructor(
    private sdk: IAiSdk,
    private maxIteration: number = DEFAULT_MAX_ITERATION,
    private logger = console,
  ) {}

  async solve(question: string): Promise<FinalAnswer> {
    let iteration = 0;
    const nodes: ReasonNode[] = [];

    while (iteration < this.maxIteration) {
      this.logger.log(`----- Iteration ${iteration + 1}/${this.maxIteration}`);
      const node = await this.reason(question, nodes, iteration);
      nodes.push(node);

      this.logger.log("\n\n");

      if (node.result === NodeStatus.Finalized) {
        break;
      }

      iteration++;
    }

    return {
      answer: await this.generateFinalAnswer(question, nodes),
      steps: nodes.map(
        (n) =>
          `Context:\n${n.context}\nConclusion:\n${n.conclusion}\nResult: ${n.result}`,
      ),
    };
  }

  async reason(
    question: string,
    previousNodes: ReasonNode[],
    iteration: number,
  ): Promise<ReasonNode> {
    const context = buildReasonContext(question, previousNodes);

    const heuristics = await this.heuristic(context, question, iteration);
    const conclusion = await this.answer(
      context,
      question,
      heuristics,
      iteration,
    );
    const result = await this.evaluate(
      context,
      question,
      heuristics,
      conclusion,
      iteration,
    );
    return await this.summarizeNode(
      context,
      question,
      heuristics,
      conclusion,
      result,
      iteration,
    );
  }

  async heuristic(
    context: string,
    question: string,
    iteration: number,
  ): Promise<string[]> {
    let prompt = buildStructuredPrompt({
      theory: prompts.theory,
      context,
      rolePrompt: prompts.heuristics,
      question,
      instruction: "生成启发式信息，并调用工具输出 heuristics 列表。",
    });

    if (iteration === 0) {
      prompt += prompts.firstIterationHeuristics;
    }

    return await new Promise<string[]>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "output_heuristics",
          description: "输出本轮启发式信息列表",
          inputSchema: z.object({
            heuristics: z
              .array(z.string())
              .describe("本轮启发式信息，可为空数组"),
          }),
          onExecute: async (params: { heuristics: string[] }) => {
            // this.logger.log(
            //   `Heuristics generated in iteration ${iteration + 1}:`,
            // );
            // this.logger.log(params.heuristics);
            resolve(params.heuristics);
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }

  async answer(
    context: string,
    question: string,
    heuristics: string[],
    iteration: number,
  ): Promise<string> {
    const heuristicsText =
      heuristics.length > 0
        ? heuristics.map((item, index) => `${index + 1}. ${item}`).join("\n")
        : "(空)";

    const prompt = buildStructuredPrompt({
      theory: prompts.theory,
      context: `${context}\n\n# 启发式信息\n${heuristicsText}`,
      rolePrompt: prompts.answer,
      question,
      instruction: "生成本轮回答，并调用工具输出 answer。",
    });

    return await new Promise<string>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "output_answer",
          description: "输出本轮回答",
          inputSchema: z.object({
            answer: z.string().describe("本轮回答内容"),
          }),
          onExecute: async (params: { answer: string }) => {
            // this.logger.log(`Answer generated in iteration ${iteration + 1}:`);
            // this.logger.log(params.answer);
            resolve(params.answer.trim());
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }

  async evaluate(
    context: string,
    question: string,
    heuristics: string[],
    conclusion: string,
    iteration: number,
  ): Promise<{
    result: NodeStatus;
    reason: string;
  }> {
    const heuristicsText =
      heuristics.length > 0
        ? heuristics.map((item, index) => `${index + 1}. ${item}`).join("\n")
        : "(空)";

    const prompt = buildStructuredPrompt({
      theory: prompts.theory,
      context: `${context}\n\n# 启发式信息\n${heuristicsText}\n\n# 本轮回答\n${conclusion}`,
      rolePrompt: prompts.evaluation,
      question,
      instruction: "评估本轮回答，并调用工具输出 result 与 reason。",
    });

    return await new Promise<{ result: NodeStatus; reason: string }>(
      (resolve, reject) => {
        const actions: NextAction<any>[] = [
          {
            name: "output_evaluation",
            description: "输出评估结果",
            inputSchema: z.object({
              result: z
                .enum([
                  NodeStatus.Accepted,
                  NodeStatus.Rejected,
                  NodeStatus.Finalized,
                ])
                .describe("评估状态：accepted/rejected/finalized"),
              reason: z.string().describe("评估理由"),
            }),
            onExecute: async (params: {
              result: NodeStatus;
              reason: string;
            }) => {
              // this.logger.log(
              //   `Evaluation generated in iteration ${iteration + 1}:`,
              // );
              // this.logger.log(`Result: ${params.result}`);
              // this.logger.log(`Reason: ${params.reason}`);
              resolve({
                result: params.result,
                reason: params.reason.trim(),
              });
            },
          },
        ];

        this.sdk.inferFlow(prompt, actions).catch(reject);
      },
    );
  }

  async summarizeNode(
    context: string,
    question: string,
    heuristics: string[],
    conclusion: string,
    evaluation: { result: NodeStatus; reason: string },
    iteration: number,
  ): Promise<ReasonNode> {
    if (evaluation.result === NodeStatus.Finalized) {
      return {
        context: "已得到可直接交付的最终结论",
        conclusion,
        result: NodeStatus.Finalized,
      };
    }

    const heuristicsText =
      heuristics.length > 0
        ? heuristics.map((item, index) => `${index + 1}. ${item}`).join("\n")
        : "(空)";

    const prompt = buildStructuredPrompt({
      theory: prompts.theory,
      context: `${context}\n\n# 启发式信息\n${heuristicsText}\n\n# 本轮回答\n${conclusion}\n\n# 评估结果\n状态: ${evaluation.result}\n原因: ${evaluation.reason}`,
      rolePrompt: prompts.summary,
      question,
      instruction: "总结当前步骤，并调用工具输出 summary。",
    });

    return await new Promise<ReasonNode>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "output_summary",
          description: "输出本轮总结",
          inputSchema: z.object({
            summary: z.string().describe("用于下一轮推理的精炼总结"),
          }),
          onExecute: async (params: { summary: string }) => {
            // this.logger.log(`Summary generated in iteration ${iteration + 1}:`);
            // this.logger.log(params.summary);
            resolve({
              context: params.summary.trim(),
              conclusion,
              result: evaluation.result,
            });
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }

  async generateFinalAnswer(
    question: string,
    nodes: ReasonNode[],
  ): Promise<string> {
    if (nodes.length === 0) {
      return "未生成有效推理步骤，无法给出答案。";
    }

    const lastNode = nodes[nodes.length - 1]!;

    const steps = nodes
      .map((node, index) => {
        return `\n步骤 ${index + 1}\n状态: ${node.result}\n上下文: ${node.context}\n结论: ${node.conclusion}`;
      })
      .join("\n\n");

    const prompt = buildStructuredPrompt({
      theory: prompts.theory,
      context: `# 推理步骤\n${steps}`,
      rolePrompt: prompts.finalAnswer,
      question,
      instruction: "生成最终答案，并调用工具输出 answer。",
    });

    console.log(`[NPSolver] Generating final answer with prompt:\n${prompt}`);

    return await new Promise<string>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "output_final_answer",
          description: "输出最终答案",
          inputSchema: z.object({
            answer: z.string().describe("可直接给用户的最终答案"),
          }),
          onExecute: async (params: { answer: string }) => {
            resolve(params.answer.trim());
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }
}

function buildReasonContext(
  question: string,
  previousNodes: ReasonNode[],
): string {
  const previousSteps = previousNodes
    .map((node, index) => {
      return `
Step ${index + 1}:
Context: ${node.context}
Conclusion: ${node.conclusion}
Result: ${node.result}
`;
    })
    .join("\n---\n");

  const context = `
现在，你需要解决的问题是：${question}

目前已经进行过的推理步骤如下：

---
${previousSteps}

    `;

  return context;
}

function buildStructuredPrompt(params: {
  theory: string;
  context: string;
  rolePrompt: string;
  question: string;
  instruction: string;
}): string {
  return `# theory
${params.theory}

# context
${params.context}

# role prompt
${params.rolePrompt}

现在请你对 question 进行处理。
# question
${params.question}

# 要求
${params.instruction}`;
}
