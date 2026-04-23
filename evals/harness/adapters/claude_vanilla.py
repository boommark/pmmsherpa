"""
Adapter: Claude Opus 4.6 vanilla (no tools)

Tests the "it's just the base model doing the work" baseline.
"""

from anthropic import AsyncAnthropic


async def run_claude_vanilla(prompt: str, config: dict) -> dict:
    api_key = config.get("anthropic", {}).get("api_key", "")
    model = config.get("anthropic", {}).get("model", "claude-opus-4-6")

    client = AsyncAnthropic(api_key=api_key)

    response = await client.messages.create(
        model=model,
        max_tokens=2000,
        system=(
            "You are a product marketing advisor. Provide specific, "
            "actionable advice grounded in PMM frameworks and best practices."
        ),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    response_text = ""
    for block in response.content:
        if block.type == "text":
            response_text += block.text

    return {
        "response": response_text,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "metadata": {
            "model": model,
            "stop_reason": response.stop_reason,
        },
    }
