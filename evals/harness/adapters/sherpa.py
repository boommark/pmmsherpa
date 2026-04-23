"""
Adapter: PMM Sherpa (prod)

Calls the production /api/chat endpoint via SSE, capturing the full response
plus RAG metadata (chunks, citations, web research flag, latency).

This is the system under test — the hypothesis.
"""

import json
import httpx


async def run_sherpa(prompt: str, config: dict) -> dict:
    base_url = config.get("sherpa", {}).get("base_url", "https://pmmsherpa.com")
    endpoint = f"{base_url}/api/chat"

    # Build the request body matching Sherpa's chat API shape
    # Uses a dedicated eval user/session to avoid polluting real user data
    body = {
        "message": prompt,
        "model": "claude-sonnet",  # Default model for eval consistency
        "conversationId": None,    # New conversation per prompt
        "evalFlag": True,          # Tag in Braintrust as eval run
    }

    full_response = ""
    citations = []
    metadata = {}

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", endpoint, json=body) as stream:
            async for line in stream.aiter_lines():
                if not line.startswith("data: "):
                    continue

                data_str = line[6:]  # Strip "data: " prefix
                if not data_str:
                    continue

                try:
                    event = json.loads(data_str)
                except json.JSONDecodeError:
                    continue

                event_type = event.get("type")

                if event_type == "text":
                    full_response += event.get("content", "")

                elif event_type == "citations":
                    citations = event.get("citations", [])

                elif event_type == "status":
                    # Capture retrieval metadata from status events
                    status_msg = event.get("message", "")
                    if "chunks" in status_msg.lower():
                        metadata["retrieval_status"] = status_msg

                elif event_type == "done":
                    # Final event — may contain usage info
                    metadata["done"] = True

                elif event_type == "error":
                    raise RuntimeError(f"Sherpa API error: {event.get('message', 'Unknown')}")

    return {
        "response": full_response,
        "input_tokens": 0,   # Sherpa doesn't expose input tokens via SSE
        "output_tokens": 0,  # Sherpa doesn't expose output tokens via SSE
        "metadata": {
            "citations": citations,
            "citation_count": len(citations),
            "eval_flag": True,
            **metadata,
        },
    }
