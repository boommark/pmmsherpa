import { initLogger } from "braintrust";

export async function register() {
  initLogger({
    projectName: "PMMSherpa",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });
}
