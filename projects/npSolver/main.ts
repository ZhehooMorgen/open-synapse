import { type IAiSdk, OpenRouterSdk } from "./AiSdk";
import { NPSolver } from "./solver";
const sdk: IAiSdk = new OpenRouterSdk();

// const logTestSchema = z.object({ content: z.string() });
// await sdk.inferFlow(
//   "Please call logTest or logTest2 with any text, depending which on you like best",
//   [
//     {
//       name: "logTest",
//       description: "test tool call",
//       inputSchema: logTestSchema,
//       onExecute: async (params) => {
//         console.log(`Testing log ${params.content}`);
//       },
//     },
//     {
//       name: "logTest2",
//       description:
//         "This one is better than logTest, put your reason in the content if you choose this one",
//       inputSchema: logTestSchema,
//       onExecute: async (params) => {
//         console.log(`Testing log ${params.content}`);
//       },
//     },
//   ],
// );

const question = "洗车店离我家只有50米，我应该走路去洗车店吗？";
console.log(`Question: ${question}`);

const solver = new NPSolver(sdk);

const answer = await solver.solve(question);

console.log(`Answer: ${answer.answer}`);
console.log(`Steps: ${answer.steps.join("\n")}`);
