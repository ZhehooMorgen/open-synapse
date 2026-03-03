interface FinalAnswer {
  answer: string;
  steps: string[];
}

interface ReasonNode {
  context: string;
  knowledge: string[];
  subNodes: ReasonNode[];
  conclusion: string;
}

export class NPSolver {
  constructor() {}

  async solve(question: string): Promise<FinalAnswer> {
    throw new Error("Not implemented yet");
  }

  async reason(node: ReasonNode): Promise<void> {
    throw new Error("Not implemented yet");
  }

  async evaluate(node: ReasonNode): Promise<void> {
    throw new Error("Not implemented yet");
  }
}
