import { initLogger } from "braintrust";
import { registerOTel } from "@vercel/otel";
import { LangfuseSpanProcessor } from "@langfuse/otel";

export async function register() {
  initLogger({
    projectName: "PMMSherpa",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  registerOTel({
    serviceName: "pmmsherpa",
    spanProcessors: [
      // Vercel serverless: lambdas freeze before the default batched flush
      // fires, dropping spans. Immediate export trades a small per-call
      // latency cost for guaranteed delivery.
      new LangfuseSpanProcessor({ exportMode: "immediate" }),
    ],
  });
}
