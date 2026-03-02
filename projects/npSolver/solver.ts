interface FinalAnswer {
  answer: string;
  steps: string[];
}

interface SearchNode {
  context: string;
  knowledge: string[];
  subNodes: SearchNode[];
}

export class NPSolver {
  constructor(
    private reasoner: Reasoner,
    private evaluator: Evaluator,
  ) {}

  solve(question: string): FinalAnswer {
    this.reasoner.resonate(question);
    throw new Error("Not implemented yet");
  }
}

enum ReasonResultType {
  heuristic,
  search,
  refinment,
  conclusion,
}

type ReasonResult =
  | {
      type: ReasonResultType.heuristic;
      directions: string[];
    }
  | {
      type: ReasonResultType.search;
      candidate: string;
    }
  | {
      type: ReasonResultType.refinment;
      refindedResult: string;
    }
  | {
      type: ReasonResultType.conclusion;
      conclusion: string;
    };

export class Reasoner {
  constructor() {}

  resonate(context: string): ReasonResult {
    throw new Error("Not implemented yet");
  }
}

interface EvaluationResult {}

export class Evaluator {
  constructor() {}

  evaluate(context: string): EvaluationResult {
    throw new Error("Not implemented yet");
  }
}
