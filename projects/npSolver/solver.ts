import type { IAiSdk } from "./AiSdk";

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

  async reason(node: ReasonNode): Promise<ReasonNode> {
    throw new Error("Not implemented yet");
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
