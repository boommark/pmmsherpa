import { initLogger } from "braintrust";
import OpenAI from "openai";

const logger = initLogger({
  projectName: "PMMSherpa",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Say 'braintrust ok' and nothing else." }],
  max_tokens: 10,
});

console.log("LLM response:", res.choices[0]?.message?.content);
await logger.flush();
