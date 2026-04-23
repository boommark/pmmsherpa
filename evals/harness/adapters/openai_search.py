"""
Adapter: GPT-5 with web search tool enabled

Tests the "just use ChatGPT with browsing" baseline.
Uses OpenAI's built-in web_search tool via the Responses API.
"""

from openai import AsyncOpenAI


async def run_openai_search(prompt: str, config: dict) -> dict:
    api_key = config.get("openai", {}).get("api_key", "")
    model = config.get("openai", {}).get("model_search", "gpt-5")

    client = AsyncOpenAI(api_key=api_key)

    # Use the Responses API with web_search tool
    response = await client.responses.create(
        model=model,
        instructions=(
            "You are a product marketing advisor. Provide specific, "
            "actionable advice grounded in PMM frameworks and best practices. "
            "Use web search when you need current market data, pricing, "
            "or competitive intelligence."
        ),
        input=prompt,
        tools=[{"type": "web_search_preview"}],
        temperature=0.7,
        max_output_tokens=2000,
    )

    # Extract text from response output items
    response_text = ""
    for item in response.output:
        if item.type == "message":
            for content_block in item.content:
                if content_block.type == "output_text":
                    response_text += content_block.text

    usage = response.usage

    return {
        "response": response_text,
        "input_tokens": usage.input_tokens if usage else 0,
        "output_tokens": usage.output_tokens if usage else 0,
        "metadata": {
            "model": model,
            "web_search_used": True,
        },
    }
