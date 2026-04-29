import { initLogger } from "braintrust";
import { registerOTel } from "@vercel/otel";
import { LangfuseSpanProcessor } from "@langfuse/otel";

// Module-level singleton so route handlers can forceFlush() it via
// waitUntil() — required on Vercel serverless because the lambda
// freezes before async OTLP exports complete.
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  exportMode: "immediate",
});

export async function register() {
  initLogger({
    projectName: "PMMSherpa",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  registerOTel({
    serviceName: "pmmsherpa",
    spanProcessors: [langfuseSpanProcessor],
  });
}
