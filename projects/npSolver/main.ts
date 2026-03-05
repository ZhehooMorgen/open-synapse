import { type IAiSdk, OpenRouterSdk } from "./AiSdk";
import { NPSolver } from "./solver";

const sdk: IAiSdk = new OpenRouterSdk();

const question = "洗车店离我家只有50米，我应该走路去洗车店吗？";
console.log(`Question: ${question}`);

const solver = new NPSolver(sdk);

const answer = await solver.solve(question);

console.log(`Answer: ${answer.answer}`);
console.log(`Steps: ${answer.steps.join("\n---\n")}`);
