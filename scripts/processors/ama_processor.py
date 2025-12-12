"""
AMA Processor for Sharebird AMA Sessions

Handles Markdown Q&A format files.
Keeps Q&A pairs atomic where possible.
Target chunk size: 600 tokens with minimal overlap.
"""

import re
from pathlib import Path
from typing import Optional
import tiktoken

# Token counter
ENCODER = tiktoken.get_encoding("cl100k_base")

# Chunking config
TARGET_TOKENS = 600
MAX_TOKENS = 800
QA_PAIR_MAX = 500  # Try to keep Q&A pairs under this


def count_tokens(text: str) -> int:
    """Count tokens in text."""
    return len(ENCODER.encode(text))


class AMAProcessor:
    """Process Sharebird AMA sessions into chunks."""

    def __init__(self):
        # Pattern to match questions - Sharebird uses ### Q: format
        self.qa_patterns = [
            re.compile(r'^###\s*Q:\s*(.+?)(?=^###\s*Q:|\Z)', re.MULTILINE | re.DOTALL),
            re.compile(r'^#{1,3}\s*Q[:\.]?\s*(.+?)(?=^#{1,3}\s*[QA][:\.]?|\Z)', re.MULTILINE | re.DOTALL),
            re.compile(r'^\*\*Q[:\.]?\*\*\s*(.+?)(?=^\*\*[QA][:\.]?\*\*|\Z)', re.MULTILINE | re.DOTALL),
            re.compile(r'^Q[:\.]?\s*(.+?)(?=^[QA][:\.]?\s|\Z)', re.MULTILINE | re.DOTALL),
        ]
        # Patterns for Sharebird AMA format: **Speaker:** and **Role:**
        self.speaker_line_pattern = re.compile(r'^\*\*Speaker:\*\*\s*(.+?)$', re.MULTILINE)
        self.role_line_pattern = re.compile(r'^\*\*Role:\*\*\s*(.+?)$', re.MULTILINE)
        self.topic_pattern = re.compile(r'^#\s*Topic:\s*(.+?)$', re.MULTILINE)

    def extract_metadata(self, content: str, filepath: Path) -> dict:
        """Extract AMA speaker and role from content or filename."""
        speaker = None
        role = None
        topic = None

        # Try to find speaker using **Speaker:** pattern
        speaker_match = self.speaker_line_pattern.search(content)
        if speaker_match:
            speaker = speaker_match.group(1).strip()

        # Try to find role using **Role:** pattern
        role_match = self.role_line_pattern.search(content)
        if role_match:
            role = role_match.group(1).strip()

        # Try to find topic using # Topic: pattern
        topic_match = self.topic_pattern.search(content)
        if topic_match:
            topic = topic_match.group(1).strip()

        # If no speaker found, extract from filename (format: 2025-01-07-Chandra_Patel.md)
        if not speaker:
            filename = filepath.stem
            # Remove date prefix if present (YYYY-MM-DD-)
            name_part = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', filename)
            # Replace underscores with spaces
            speaker = name_part.replace("_", " ").strip()

        # Build title
        if topic:
            title = f"AMA on {topic} with {speaker}"
        else:
            title = f"AMA with {speaker}"
        if role:
            title += f", {role}"

        return {
            "title": title,
            "author": speaker,
            "speaker_role": role,
            "topic": topic,
            "tags": ["sharebird-ama", "ama"]
        }

    def split_qa_pairs(self, content: str) -> list[dict]:
        """Split content into Q&A pairs."""
        qa_pairs = []

        # Try different patterns
        for pattern in self.qa_patterns:
            matches = list(pattern.finditer(content))
            if matches:
                for match in matches:
                    qa_text = match.group(0).strip()
                    # Try to extract question text
                    q_match = re.match(r'^[#*]*\s*Q[:\.]?\s*[*]*\s*(.+?)(?:\n|\?)', qa_text, re.DOTALL)
                    question = q_match.group(1).strip() if q_match else None

                    if qa_text:
                        qa_pairs.append({
                            "question": question,
                            "content": qa_text
                        })
                break

        # If no Q&A patterns found, fall back to paragraph splitting
        if not qa_pairs:
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            for para in paragraphs:
                qa_pairs.append({"question": None, "content": para})

        return qa_pairs

    def chunk_qa_pairs(self, qa_pairs: list[dict]) -> list[dict]:
        """Combine Q&A pairs into appropriately sized chunks."""
        chunks = []
        current_chunk = []
        current_tokens = 0
        current_questions = []

        for qa in qa_pairs:
            qa_tokens = count_tokens(qa["content"])

            # If single Q&A exceeds max, it becomes its own chunk
            if qa_tokens > MAX_TOKENS:
                # Save current chunk first
                if current_chunk:
                    chunk_text = "\n\n".join(current_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "question": current_questions[0] if current_questions else None
                    })
                    current_chunk = []
                    current_tokens = 0
                    current_questions = []

                # Split large Q&A by paragraphs
                paras = [p.strip() for p in qa["content"].split("\n\n") if p.strip()]
                temp_chunk = []
                temp_tokens = 0

                for para in paras:
                    para_tokens = count_tokens(para)
                    if temp_tokens + para_tokens <= TARGET_TOKENS:
                        temp_chunk.append(para)
                        temp_tokens += para_tokens
                    else:
                        if temp_chunk:
                            chunk_text = "\n\n".join(temp_chunk)
                            chunks.append({
                                "content": chunk_text,
                                "token_count": count_tokens(chunk_text),
                                "question": qa.get("question")
                            })
                        temp_chunk = [para]
                        temp_tokens = para_tokens

                if temp_chunk:
                    chunk_text = "\n\n".join(temp_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "question": qa.get("question")
                    })

            # Try to keep Q&A pairs atomic
            elif qa_tokens <= QA_PAIR_MAX and current_tokens + qa_tokens <= TARGET_TOKENS:
                current_chunk.append(qa["content"])
                current_tokens += qa_tokens
                if qa.get("question"):
                    current_questions.append(qa["question"])

            # Start new chunk
            else:
                if current_chunk:
                    chunk_text = "\n\n".join(current_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "question": current_questions[0] if current_questions else None
                    })

                current_chunk = [qa["content"]]
                current_tokens = qa_tokens
                current_questions = [qa["question"]] if qa.get("question") else []

        # Last chunk
        if current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "token_count": count_tokens(chunk_text),
                "question": current_questions[0] if current_questions else None
            })

        return chunks

    def process(self, filepath: Path) -> Optional[dict]:
        """Process an AMA file and return document with chunks."""
        if not filepath.exists():
            return None

        content = filepath.read_text(encoding="utf-8")
        if not content.strip():
            return None

        metadata = self.extract_metadata(content, filepath)

        # Split into Q&A pairs
        qa_pairs = self.split_qa_pairs(content)

        # Chunk Q&A pairs
        all_chunks = self.chunk_qa_pairs(qa_pairs)

        # Add context headers
        for chunk in all_chunks:
            chunk["context_header"] = metadata["title"]
            if metadata.get("speaker_role"):
                chunk["context_header"] += f" ({metadata['speaker_role']})"
            chunk["context_header"] += " - Sharebird AMA"

        return {
            "title": metadata["title"],
            "author": metadata.get("author"),
            "speaker_role": metadata.get("speaker_role"),
            "tags": metadata.get("tags", []),
            "raw_content": content,
            "chunks": all_chunks
        }
