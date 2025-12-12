"""
Book Processor for PMM Books

Handles Markdown files with page delimiters (--- Page X ---).
Chunks by page first, then by paragraphs if needed.
Target chunk size: 1000 tokens with 150 token overlap.
"""

import re
import urllib.parse
from pathlib import Path
from typing import Optional
import tiktoken

# Token counter
ENCODER = tiktoken.get_encoding("cl100k_base")

# Chunking config
TARGET_TOKENS = 1000
OVERLAP_TOKENS = 150
MAX_TOKENS = 1200


def count_tokens(text: str) -> int:
    """Count tokens in text."""
    return len(ENCODER.encode(text))


class BookProcessor:
    """Process PMM book files into chunks."""

    def __init__(self):
        self.page_pattern = re.compile(r'^-{3,}\s*Page\s+(\d+)\s*-{3,}$', re.MULTILINE)

    def generate_amazon_url(self, title: str, author: Optional[str]) -> str:
        """Generate Amazon search URL for a book."""
        search_query = title
        if author:
            search_query += " " + author
        encoded_query = urllib.parse.quote_plus(search_query)
        return f"https://www.amazon.com/s?k={encoded_query}"

    def extract_metadata(self, content: str, filepath: Path) -> dict:
        """Extract book title and author from filename or content."""
        filename = filepath.stem

        # Try to extract author from "Book Title - Author Name" format
        if " - " in filename:
            parts = filename.rsplit(" - ", 1)
            title = parts[0].strip()
            author = parts[1].strip() if len(parts) > 1 else None
        else:
            title = filename
            author = None

        # Clean up title
        title = title.replace("_", " ").strip()

        # Generate Amazon search URL
        url = self.generate_amazon_url(title, author)

        return {
            "title": title,
            "author": author,
            "url": url,
            "tags": ["pmm-book"]
        }

    def split_by_pages(self, content: str) -> list[dict]:
        """Split content by page delimiters."""
        pages = []
        matches = list(self.page_pattern.finditer(content))

        if not matches:
            # No page markers, treat entire content as one page
            return [{"page_number": None, "content": content.strip()}]

        # Get content before first page marker
        if matches[0].start() > 0:
            pre_content = content[:matches[0].start()].strip()
            if pre_content:
                pages.append({"page_number": 0, "content": pre_content})

        # Get content for each page
        for i, match in enumerate(matches):
            page_num = int(match.group(1))
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            page_content = content[start:end].strip()

            if page_content:
                pages.append({"page_number": page_num, "content": page_content})

        return pages

    def chunk_text(self, text: str, page_number: Optional[int] = None) -> list[dict]:
        """Chunk text into target-sized pieces with overlap."""
        chunks = []

        # If text is small enough, keep as single chunk
        if count_tokens(text) <= MAX_TOKENS:
            return [{
                "content": text,
                "token_count": count_tokens(text),
                "page_number": page_number
            }]

        # Split by paragraphs first
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        current_chunk = []
        current_tokens = 0

        for para in paragraphs:
            para_tokens = count_tokens(para)

            # If single paragraph exceeds max, split by sentences
            if para_tokens > MAX_TOKENS:
                # Save current chunk first
                if current_chunk:
                    chunk_text = "\n\n".join(current_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "page_number": page_number
                    })
                    current_chunk = []
                    current_tokens = 0

                # Split large paragraph by sentences
                sentences = re.split(r'(?<=[.!?])\s+', para)
                for sent in sentences:
                    sent_tokens = count_tokens(sent)
                    if current_tokens + sent_tokens <= TARGET_TOKENS:
                        current_chunk.append(sent)
                        current_tokens += sent_tokens
                    else:
                        if current_chunk:
                            chunk_text = " ".join(current_chunk)
                            chunks.append({
                                "content": chunk_text,
                                "token_count": count_tokens(chunk_text),
                                "page_number": page_number
                            })
                        # Start new chunk with overlap
                        overlap_text = " ".join(current_chunk[-2:]) if len(current_chunk) > 1 else ""
                        current_chunk = [overlap_text, sent] if overlap_text else [sent]
                        current_tokens = count_tokens(" ".join(current_chunk))
            elif current_tokens + para_tokens <= TARGET_TOKENS:
                current_chunk.append(para)
                current_tokens += para_tokens
            else:
                # Save current chunk
                if current_chunk:
                    chunk_text = "\n\n".join(current_chunk)
                    chunks.append({
                        "content": chunk_text,
                        "token_count": count_tokens(chunk_text),
                        "page_number": page_number
                    })

                # Start new chunk with overlap from last paragraph
                if current_chunk and count_tokens(current_chunk[-1]) <= OVERLAP_TOKENS:
                    current_chunk = [current_chunk[-1], para]
                    current_tokens = count_tokens("\n\n".join(current_chunk))
                else:
                    current_chunk = [para]
                    current_tokens = para_tokens

        # Don't forget the last chunk
        if current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "token_count": count_tokens(chunk_text),
                "page_number": page_number
            })

        return chunks

    def process(self, filepath: Path) -> Optional[dict]:
        """Process a book file and return document with chunks."""
        if not filepath.exists():
            return None

        content = filepath.read_text(encoding="utf-8")
        if not content.strip():
            return None

        metadata = self.extract_metadata(content, filepath)

        # Split by pages
        pages = self.split_by_pages(content)

        # Chunk each page
        all_chunks = []
        for page in pages:
            page_chunks = self.chunk_text(page["content"], page["page_number"])
            for chunk in page_chunks:
                chunk["context_header"] = f"{metadata['title']}"
                if metadata.get("author"):
                    chunk["context_header"] += f" by {metadata['author']}"
                if chunk.get("page_number"):
                    chunk["context_header"] += f" (Page {chunk['page_number']})"
            all_chunks.extend(page_chunks)

        return {
            "title": metadata["title"],
            "author": metadata.get("author"),
            "tags": metadata.get("tags", []),
            "raw_content": content,
            "chunks": all_chunks
        }
