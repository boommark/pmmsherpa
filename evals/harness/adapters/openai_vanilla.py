"""
Adapter: GPT-5 vanilla (no tools, no search)
"""

from openai import AsyncOpenAI


async def run_openai_vanilla(prompt: str, config: dict) -> dict:
    api_key = config.get("openai", {}).get("api_key", "")
    model = config.get("openai", {}).get("model_vanilla", "gpt-5")

    client = AsyncOpenAI(api_key=api_key)

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a product marketing advisor. Provide specific, "
                    "actionable advice grounded in PMM frameworks and best practices."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=2000,
    )

    choice = response.choices[0]
    usage = response.usage

    return {
        "response": choice.message.content or "",
        "input_tokens": usage.prompt_tokens if usage else 0,
        "output_tokens": usage.completion_tokens if usage else 0,
        "metadata": {"model": model, "finish_reason": choice.finish_reason},
    }
