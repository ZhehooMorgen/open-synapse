import z from "zod";
import type { IAiSdk, NextAction } from "./AiSdk";

interface FinalAnswer {
  answer: string;
  steps: string[];
}

interface ReasonNode {
  context: string;
  knowledge: string[];
  parent: ReasonNode | undefined;
  conclusion: string;
}

export class NPSolver {
  constructor(private sdk: IAiSdk) {}

  async solve(question: string): Promise<FinalAnswer> {
    const rootNode: ReasonNode = {
      context: question,
      knowledge: [],
      conclusion: "",
      parent: undefined,
    };

    const resultNode = await this.reason(rootNode);

    return {
      answer: resultNode.conclusion,
      steps: extractSteps(resultNode),
    };
  }

  reason(node: ReasonNode): Promise<ReasonNode> {
    const promise = new Promise<ReasonNode>((resolve, reject) => {
      const actions: NextAction<any>[] = [
        {
          name: "heuristic",
          description: "Use this to provide a list of Heuristic Directions",
          inputSchema: z.object({
            directions: z.array(z.string()),
          }),
          onExecute: async (params) => {
            // For each direction, create a new ReasonNode and call reason recursively
            const pendingActions: Promise<ReasonNode>[] = [];
            if (params.directions.length === 0) {
              reject(new Error("No heuristic directions provided"));
            }
            for (const direction of params.directions) {
              const childNode: ReasonNode = {
                context: direction,
                knowledge: [],
                conclusion: "",
                parent: node,
              };
              pendingActions.push(this.reason(childNode));
            }
            const results = await Promise.all(pendingActions);

            const aggregatedResult = await this.evaluate(node);
            resolve(aggregatedResult);
          },
        },
        {
          name: "answer",
          description: "Use this when you have a final answer to provide",
          inputSchema: z.object({
            answer: z.string(),
            knowledge: z.array(z.string()),
          }),
          onExecute: async (params) => {
            node.conclusion = params.answer;
          },
        },
      ];

      await this.sdk.inferFlow(node.context, actions);
    });

    return promise;
  }

  async evaluate(node: ReasonNode): Promise<void> {
    throw new Error("Not implemented yet");
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
