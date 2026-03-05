import { type IAiSdk, OpenRouterSdk } from "./AiSdk";
import { NPSolver } from "./solver";

const sdk: IAiSdk = new OpenRouterSdk();

// const question = `
// 洗车店离我家只有50米，我应该走路去洗车吗？
// `;

const question = `
问题背景
假设你是某跨国物流企业的首席战略官。由于全球气候异常，连接欧亚的苏伊士运河因极端沙尘暴搁浅封锁，同时由于突发地质活动，巴拿马运河因水位骤降限制通行。

你的任务是：
在 72 小时内，重新规划 500 艘正在航行中的货轮（装载着易腐食品、精密电子零件和能源物资）的路径，以最小化以下三个指标的综合损失：

物资损耗成本（易腐品的时间压力）。

供应链断裂罚金（电子零件交付延迟导致的工厂停工）。

额外燃油与碳排放成本（绕行好望角或转运铁路的成本）。
`;
console.log(`Question: ${question}`);

const solver = new NPSolver(sdk);

const answer = await solver.solve(question);

console.log(`Answer: ${answer.answer}`);
// console.log(`Steps: ${answer.steps.join("\n---\n")}`);

// console.log(`Direct inference: ${await sdk.directInfer(question)}`);
