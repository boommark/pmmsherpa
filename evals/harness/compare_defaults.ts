/**
 * Compare vanilla LLM defaults against Sherpa on the voice evolution prompt.
 *
 * Runs the reference prompt from Voice Layer Evolution through vanilla GPT-4o,
 * Claude Sonnet 4.6, and Gemini 2.5 Pro with NO system prompt. Writes the
 * three outputs to evals/reports/voice-defaults/ for inclusion in the note.
 *
 * Run: npx tsx evals/harness/compare_defaults.ts
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const PROMPT =
  "I'm the first PMM hire at a Series A dev-tools startup. Our positioning statement feels flat. How should I sharpen it?";

type Result = { model: string; provider: string; output: string; error?: string };

async function runOpenAI(): Promise<Result> {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [{ role: "user", content: PROMPT }],
    });
    return {
      model: "gpt-4o",
      provider: "OpenAI",
      output: resp.choices[0]?.message?.content ?? "",
    };
  } catch (e) {
    return { model: "gpt-4o", provider: "OpenAI", output: "", error: String(e) };
  }
}

async function runAnthropic(): Promise<Result> {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_EVAL_API_KEY ?? process.env.ANTHROPIC_API_KEY,
    });
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: PROMPT }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return { model: "claude-sonnet-4-6", provider: "Anthropic", output: text };
  } catch (e) {
    return {
      model: "claude-sonnet-4-6",
      provider: "Anthropic",
      output: "",
      error: String(e),
    };
  }
}

async function runGemini(): Promise<Result> {
  try {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) return { model: "gemini-2.5-pro", provider: "Google", output: "", error: "GOOGLE_API_KEY not set" };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        generationConfig: { maxOutputTokens: 800 },
      }),
    });
    const data = (await resp.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (data.error) return { model: "gemini-2.5-pro", provider: "Google", output: "", error: data.error.message };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { model: "gemini-2.5-pro", provider: "Google", output: text };
  } catch (e) {
    return { model: "gemini-2.5-pro", provider: "Google", output: "", error: String(e) };
  }
}

async function main() {
  console.log(`Prompt: ${PROMPT}\n`);
  const [gpt, claude, gemini] = await Promise.all([runOpenAI(), runAnthropic(), runGemini()]);
  const results = [gpt, claude, gemini];

  for (const r of results) {
    console.log(`\n\n=== ${r.provider} ${r.model} ===\n`);
    if (r.error) {
      console.log(`ERROR: ${r.error}`);
    } else {
      console.log(r.output);
    }
  }

  const outDir = join(process.cwd(), "evals", "reports", "voice-defaults");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(
    join(outDir, `defaults-${stamp}.json`),
    JSON.stringify({ prompt: PROMPT, results }, null, 2)
  );
  console.log(`\n\nWrote: evals/reports/voice-defaults/defaults-${stamp}.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
