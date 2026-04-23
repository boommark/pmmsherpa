"""
Adapter: Writer.com (enterprise knowledge + content)

Writer offers an API with their Palmyra models. Free trial may have API access.
If not, switch to browser mode.

Writer API docs: https://dev.writer.com/api-guides/chat-completion
"""

import httpx


async def run_writer(prompt: str, config: dict) -> dict:
    api_key = config.get("writer", {}).get("api_key", "")
    mode = config.get("writer", {}).get("mode", "api")

    if mode == "browser":
        raise RuntimeError(
            "Writer is configured for browser mode. "
            "Use run_browser.py or clipboard_fallback.py instead."
        )

    if not api_key:
        raise RuntimeError(
            "Writer API key not set. Either set WRITER_API_KEY env var, "
            "fill in config.yaml, or switch to browser mode."
        )

    # Writer Chat Completion API
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.writer.com/v1/chat",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "palmyra-x-004",
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
                "temperature": 0.7,
            },
        )

        response.raise_for_status()
        data = response.json()

    # Writer uses OpenAI-compatible response format
    choice = data.get("choices", [{}])[0]
    message = choice.get("message", {})
    usage = data.get("usage", {})

    return {
        "response": message.get("content", ""),
        "input_tokens": usage.get("prompt_tokens", 0),
        "output_tokens": usage.get("completion_tokens", 0),
        "metadata": {
            "model": data.get("model", "palmyra"),
            "finish_reason": choice.get("finish_reason"),
        },
    }
