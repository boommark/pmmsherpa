"""
Adapter: Jasper (PMM workflow)

Jasper's API availability depends on the plan. For 7-day trial:
- If API is available: use it directly
- If API is gated: fall back to browser-based interaction

This adapter handles the API path. If Jasper doesn't expose a usable API
on the trial plan, this system should be moved to the browser runner.

Jasper API docs: https://developers.jasper.ai/docs
"""

import httpx


async def run_jasper(prompt: str, config: dict) -> dict:
    api_key = config.get("jasper", {}).get("api_key", "")
    mode = config.get("jasper", {}).get("mode", "api")

    if mode == "browser":
        raise RuntimeError(
            "Jasper is configured for browser mode. "
            "Use run_browser.py or clipboard_fallback.py instead."
        )

    if not api_key:
        raise RuntimeError(
            "Jasper API key not set. Either set JASPER_API_KEY env var, "
            "fill in config.yaml, or switch to browser mode."
        )

    # Jasper Command API — generate content
    # Docs: https://developers.jasper.ai/reference/generate-content
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.jasper.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a product marketing advisor. Provide specific, "
                            "actionable advice grounded in PMM frameworks and best practices."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 2000,
            },
        )

        response.raise_for_status()
        data = response.json()

    # Parse response (Jasper uses OpenAI-compatible format)
    choice = data.get("choices", [{}])[0]
    message = choice.get("message", {})
    usage = data.get("usage", {})

    return {
        "response": message.get("content", ""),
        "input_tokens": usage.get("prompt_tokens", 0),
        "output_tokens": usage.get("completion_tokens", 0),
        "metadata": {
            "model": data.get("model", "jasper"),
            "finish_reason": choice.get("finish_reason"),
        },
    }
