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
    spanProcessors: [new LangfuseSpanProcessor()],
  });
}
