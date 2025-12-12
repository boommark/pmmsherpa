"""
Blog Processor for PMA Blog Articles

Handles Markdown files with YAML front matter.
Keeps small articles whole, splits longer ones at headers.
Target chunk size: 800 tokens with 100 token overlap.
"""

import re
import yaml
from pathlib import Path
from typing import Optional
import tiktoken

# Token counter
ENCODER = tiktoken.get_encoding("cl100k_base")

# Chunking config
TARGET_TOKENS = 800
OVERLAP_TOKENS = 100
MAX_TOKENS = 1000
SMALL_ARTICLE_THRESHOLD = 600  # Keep articles under this as single chunk


def count_tokens(text: str) -> int:
    """Count tokens in text."""
    return len(ENCODER.encode(text))


class BlogProcessor:
    """Process PMA blog articles into chunks."""

    def __init__(self):
        self.frontmatter_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
        self.header_pattern = re.compile(r'^(#{1,3})\s+(.+)$', re.MULTILINE)

    def extract_frontmatter(self, content: str) -> tuple[dict, str]:
        """Extract YAML front matter and return metadata + remaining content."""
        match = self.frontmatter_pattern.match(content)

        if not match:
            return {}, content

        try:
            metadata = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            metadata = {}

        remaining_content = content[match.end():].strip()
        return metadata, remaining_content

    def extract_metadata(self, frontmatter: dict, filepath: Path) -> dict:
        """Extract blog metadata from front matter or filename."""
        title = frontmatter.get("title") or filepath.stem.replace("-", " ").replace("_", " ").title()
        author = frontmatter.get("author") or frontmatter.get("authors")
        if isinstance(author, list):
            author = ", ".join(author)

        url = frontmatter.get("url") or frontmatter.get("link")
        tags = frontmatter.get("tags") or frontmatter.get("categories") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",")]

        # Add PMA blog tag
        if "pma-blog" not in tags:
            tags.append("pma-blog")

        return {
            "title": title,
            "author": author,
            "url": url,
            "tags": tags
        }

    def split_by_headers(self, content: str) -> list[dict]:
        """Split content by markdown headers."""
        sections = []
        matches = list(self.header_pattern.finditer(content))

        if not matches:
            return [{"section_title": None, "content": content.strip()}]

        # Content before first header
        if matches[0].start() > 0:
            pre_content = content[:matches[0].start()].strip()
            if pre_content:
                sections.append({"section_title": None, "content": pre_content})

        # Content for each section
        for i, match in enumerate(matches):
            header_level = len(match.group(1))
            section_title = match.group(2).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            section_content = content[start:end].strip()

            # Include header in content for context
            full_content = f"{'#' * header_level} {section_title}\n\n{section_content}"

            if full_content.strip():
                sections.append({
                    "section_title": section_title,
                    "content": full_content.strip()
                })

        return sections

    def chunk_text(self, text: str, section_title: Optional[str] = None) -> list[dict]:
        """Chunk text into target-sized pieces."""
        chunks = []

        # If text is small enough, keep as single chunk
        if count_tokens(text) <= MAX_TOKENS:
            return [{
                "content": text,
                "token_count": count_tokens(text),
                "section_title": section_title
            }]

        # Split by paragraphs
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        current_chunk = []
        current_tokens = 0

        for para in paragraphs:
            para_tokens = count_tokens(para)

            if current_tokens + para_tokens <= TARGET_TOKENS:
                current_chunk.append(para)
                current_tokens += para_tokens
            else:
                # Save current chunk
                if current_chunk:
                    chunk_text = "\n\n".join(current_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "section_title": section_title
                    })

                # Start new chunk with overlap
                if current_chunk and count_tokens(current_chunk[-1]) <= OVERLAP_TOKENS:
                    current_chunk = [current_chunk[-1], para]
                    current_tokens = count_tokens("\n\n".join(current_chunk))
                else:
                    current_chunk = [para]
                    current_tokens = para_tokens

        # Last chunk
        if current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "token_count": count_tokens(chunk_text),
                "section_title": section_title
            })

        return chunks

    def process(self, filepath: Path) -> Optional[dict]:
        """Process a blog file and return document with chunks."""
        if not filepath.exists():
            return None

        content = filepath.read_text(encoding="utf-8")
        if not content.strip():
            return None

        frontmatter, body = self.extract_frontmatter(content)
        metadata = self.extract_metadata(frontmatter, filepath)

        # Check if article is small enough to keep whole
        body_tokens = count_tokens(body)

        if body_tokens <= SMALL_ARTICLE_THRESHOLD:
            # Keep as single chunk
            all_chunks = [{
                "content": body,
                "token_count": body_tokens,
                "section_title": None,
                "context_header": f'"{metadata["title"]}"' + (f' by {metadata["author"]}' if metadata.get("author") else "") + " (PMA Blog)"
            }]
        else:
            # Split by headers then chunk
            sections = self.split_by_headers(body)
            all_chunks = []

            for section in sections:
                section_chunks = self.chunk_text(section["content"], section["section_title"])
                for chunk in section_chunks:
                    chunk["context_header"] = f'"{metadata["title"]}"'
                    if metadata.get("author"):
                        chunk["context_header"] += f' by {metadata["author"]}'
                    chunk["context_header"] += " (PMA Blog)"
                    if chunk.get("section_title"):
                        chunk["context_header"] += f' - {chunk["section_title"]}'
                all_chunks.extend(section_chunks)

        return {
            "title": metadata["title"],
            "author": metadata.get("author"),
            "url": metadata.get("url"),
            "tags": metadata.get("tags", []),
            "raw_content": content,
            "chunks": all_chunks
        }
