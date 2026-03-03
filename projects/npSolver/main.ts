import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const result = openRouter.callModel({
  model: "deepseek/deepseek-v3.2",
  input: "What is the capital of France?",
});

// Get text (simplest pattern)
const text = await result.getText();
console.log(text);
console.log(await result.getResponse());

// const result2 = openRouter.callModel({
//   model: "deepseek/deepseek-v3.2",
//   input: "What is the previous question?",
// });

// // Get text (simplest pattern)
// const text2 = await result2.getText();
// console.log(text2);
// console.log(result2.getResponse());
