import z from "zod";
import type { IAiSdk, NextAction } from "./AiSdk";
import * as prompts from "./prompts";

interface FinalAnswer {
  answer: string;
  steps: string[];
}

interface ReasonNode {
  context: string;
  parent: ReasonNode | undefined;
  conclusion: string;
}

const DEFAULT_MAX_DEPTH = 3;

export class NPSolver {
  constructor(
    private sdk: IAiSdk,
    private maxDepth: number = DEFAULT_MAX_DEPTH,
  ) {}

  async solve(question: string): Promise<FinalAnswer> {
    const rootNode: ReasonNode = {
      context: question,
      conclusion: "",
      parent: undefined,
    };

    const resultNode = await this.reason(rootNode, 0, true);

    return {
      answer: resultNode.conclusion,
      steps: extractSteps(resultNode),
    };
  }

  private async reason(
    node: ReasonNode,
    depth: number,
    isRoot: boolean,
  ): Promise<ReasonNode> {
    const systemPrompt = isRoot
      ? `${prompts.theoryPrompt}\n${prompts.rootReasoningPrompt}`
      : `${prompts.theoryPrompt}\n${prompts.reasoningPrompt}`;

    const depthInfo =
      depth >= this.maxDepth
        ? "\n\n# 深度限制\n你已经到达搜索深度的上限，你必须直接给出答案(answer)或承认此路不通(reject)，不可以再提出新的启发式方向。"
        : `\n\n# 当前搜索深度: ${depth}/${this.maxDepth}`;

    const prompt = `${systemPrompt}${depthInfo}\n\n# 问题\n${node.context}`;

    return new Promise<ReasonNode>((resolve, reject) => {
      const actions: NextAction<any>[] = [];

      // heuristic action: only available when depth < maxDepth
      if (depth < this.maxDepth) {
        actions.push({
          name: "heuristic",
          description:
            "提出多个启发式方向，将问题分解为多个独立的探索分支",
          inputSchema: z.object({
            directions: z
              .array(z.string())
              .describe("多个独立的启发式方向，每个方向是一个具体的探索思路"),
          }),
          onExecute: async (params: { directions: string[] }) => {
            if (params.directions.length === 0) {
              reject(new Error("No heuristic directions provided"));
              return;
            }

            const childNodes: ReasonNode[] = params.directions.map((dir) => ({
              context: dir,
              conclusion: "",
              parent: node,
            }));

            const results = await Promise.all(
              childNodes.map((child) => this.reason(child, depth + 1, false)),
            );

            const decided = await this.aggregateAndDecide(
              node,
              results,
              depth,
            );
            resolve(decided);
          },
        });
      }

      // answer action: provide a conclusion, then evaluate
      actions.push({
        name: "answer",
        description:
          "当你已经形成完整的问题解决思路时，给出你的结论。结论将会被评估器审查。",
        inputSchema: z.object({
          answer: z.string().describe("你的结论"),
          reasoning: z.string().describe("你的推理路径和依据"),
        }),
        onExecute: async (params: { answer: string; reasoning: string }) => {
          node.conclusion = `${params.answer}\n\n[推理依据] ${params.reasoning}`;
          const evaluated = await this.evaluate(node);
          resolve(evaluated);
        },
      });

      // reject action: this direction is not viable
      actions.push({
        name: "reject",
        description:
          "当你认为当前方向不可行时，否决此方向，并总结从中获取的知识",
        inputSchema: z.object({
          reason: z.string().describe("否决此方向的原因"),
          knowledge: z
            .array(z.string())
            .describe("从这个方向中获取的有价值的知识，供其他方向参考"),
        }),
        onExecute: async (params: { reason: string; knowledge: string[] }) => {
          node.conclusion = `[此路不通] ${params.reason}\n[已获知识] ${params.knowledge.join("; ")}`;
          resolve(node);
        },
      });

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }

  private async evaluate(node: ReasonNode): Promise<ReasonNode> {
    const prompt = `${prompts.theoryPrompt}\n${prompts.evaluationPrompt}\n\n# 待评估的候选解\n## 问题上下文\n${node.context}\n\n## 候选解\n${node.conclusion}`;

    return new Promise<ReasonNode>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "accept",
          description: "候选解通过评估，质量可接受",
          inputSchema: z.object({
            comment: z.string().describe("评估意见"),
          }),
          onExecute: async (params: { comment: string }) => {
            node.conclusion = `${node.conclusion}\n[评估通过] ${params.comment}`;
            resolve(node);
          },
        },
        {
          name: "reject",
          description: "候选解未通过评估，质量不可接受",
          inputSchema: z.object({
            reason: z.string().describe("拒绝原因"),
          }),
          onExecute: async (params: { reason: string }) => {
            node.conclusion = `${node.conclusion}\n[评估拒绝] ${params.reason}`;
            resolve(node);
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }

  private async aggregateAndDecide(
    parentNode: ReasonNode,
    childResults: ReasonNode[],
    depth: number,
  ): Promise<ReasonNode> {
    const childSummaries = childResults
      .map(
        (child, i) =>
          `## 方向 ${i + 1}\n上下文: ${child.context}\n结论: ${child.conclusion}`,
      )
      .join("\n\n");

    const prompt = `${prompts.theoryPrompt}\n${prompts.aggregateAndDecidePrompt}\n\n# 当前问题\n${parentNode.context}\n\n# 各方向的结果\n${childSummaries}`;

    return new Promise<ReasonNode>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "select",
          description: "选择一个最优的方向作为最终结果",
          inputSchema: z.object({
            selectedIndex: z
              .number()
              .describe("选中的方向编号（从0开始）"),
            reason: z.string().describe("选择此方向的原因"),
          }),
          onExecute: async (params: {
            selectedIndex: number;
            reason: string;
          }) => {
            const selected = childResults[params.selectedIndex];
            if (!selected) {
              reject(
                new Error(
                  `Invalid selection index: ${params.selectedIndex}`,
                ),
              );
              return;
            }
            selected.conclusion = `${selected.conclusion}\n[决策] 被选为最优解: ${params.reason}`;
            resolve(selected);
          },
        },
        {
          name: "synthesize",
          description:
            "整合多个方向的信息，生成新的综合上下文，递归调用推理器继续探索",
          inputSchema: z.object({
            synthesis: z
              .string()
              .describe("整合后的新上下文，将作为新一轮推理的输入"),
          }),
          onExecute: async (params: { synthesis: string }) => {
            const synthesizedNode: ReasonNode = {
              context: params.synthesis,
              conclusion: "",
              parent: parentNode,
            };
            const result = await this.reason(
              synthesizedNode,
              depth + 1,
              false,
            );
            resolve(result);
          },
        },
        {
          name: "fail",
          description:
            "所有方向都不可行，整合已有知识生成总结返回给上级",
          inputSchema: z.object({
            summary: z
              .string()
              .describe("对所有方向的知识整合和失败总结"),
          }),
          onExecute: async (params: { summary: string }) => {
            const failNode: ReasonNode = {
              context: parentNode.context,
              conclusion: `[所有方向不可行] ${params.summary}`,
              parent: parentNode,
            };
            resolve(failNode);
          },
        },
      ];

      this.sdk.inferFlow(prompt, actions).catch(reject);
    });
  }
}

function extractSteps(node: ReasonNode) {
  const steps: string[] = [];
  let currentNode: ReasonNode | undefined = node;
  while (currentNode) {
    steps.unshift(currentNode.context);
    currentNode = currentNode.parent;
  }
  return steps;
}
