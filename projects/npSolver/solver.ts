import type { IAiSdk } from "./AiSdk";

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
  ) {}

  async solve(question: string): Promise<FinalAnswer> {
    let iteration = 0;
    const nodes: ReasonNode[] = [];

    while (iteration < this.maxIteration) {
      console.log(`----- Iteration ${iteration + 1}/${this.maxIteration}`);
      const node = await this.reason(question, nodes);
      nodes.push(node);

      console.log("\n\n");

      if (node.result === NodeStatus.Finalized) {
        break;
      }

      iteration++;
    }

    return {
      answer: await this.generateFinalAnswer(nodes),
      steps: nodes.map(
        (n) =>
          `Context:\n${n.context}\nConclusion:\n${n.conclusion}\nResult: ${n.result}`,
      ),
    };
  }

  async reason(
    question: string,
    previousNodes: ReasonNode[],
  ): Promise<ReasonNode> {
    const context = buildReasonContext(question, previousNodes);

    const heuristics = await this.heuristic(context, question);
    const conclusion = await this.answer(context, question, heuristics);
    const result = await this.evaluate(
      context,
      question,
      heuristics,
      conclusion,
    );
    return await this.summarizeNode(
      context,
      question,
      heuristics,
      conclusion,
      result,
    );
  }

  async heuristic(context: string, question: string): Promise<string[]> {
    throw new Error("Not implemented");
  }

  async answer(
    context: string,
    question: string,
    heuristics: string[],
  ): Promise<string> {
    throw new Error("Not implemented");
  }

  async evaluate(
    context: string,
    question: string,
    heuristics: string[],
    conclusion: string,
  ): Promise<{
    result: NodeStatus;
    reason: string;
  }> {
    throw new Error("Not implemented");
  }

  async summarizeNode(
    context: string,
    question: string,
    heuristics: string[],
    conclusion: string,
    evaluation: { result: NodeStatus; reason: string },
  ): Promise<ReasonNode> {
    throw new Error("Not implemented");
  }

  async generateFinalAnswer(nodes: ReasonNode[]): Promise<string> {
    throw new Error("Not implemented");
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
