-- Add expanded_research column to messages table for persisting Perplexity web research
-- This stores the full research content, web citations, and related questions

ALTER TABLE messages ADD COLUMN IF NOT EXISTS expanded_research JSONB DEFAULT NULL;

-- Add a comment to document the expected structure
COMMENT ON COLUMN messages.expanded_research IS 'JSON object containing Perplexity web research: {content: string, webCitations: [{title, url, date?, snippet?}], relatedQuestions?: string[], researchType: "quick" | "deep"}';
