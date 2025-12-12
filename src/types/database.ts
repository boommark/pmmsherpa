export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_model: 'claude' | 'gemini';
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model_used: 'claude' | 'gemini';
  message_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: 'claude' | 'gemini' | null;
  tokens_used: number | null;
  latency_ms: number | null;
  citations: Citation[];
  is_saved: boolean;
  rating: number | null;
  created_at: string;
}

export interface Citation {
  source: string;
  source_type: 'book' | 'blog' | 'ama';
  author: string | null;
  url: string | null;
  page_number: number | null;
  section_title: string | null;
  question: string | null;
}

export interface Document {
  id: string;
  title: string;
  source_type: 'book' | 'blog' | 'ama';
  source_file: string;
  author: string | null;
  url: string | null;
  speaker_role: string | null;
  tags: string[];
  raw_content: string;
  word_count: number;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Chunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  context_header: string | null;
  page_number: number | null;
  section_title: string | null;
  question: string | null;
  embedding: number[] | null;
  created_at: string;
  embedding_updated_at: string | null;
}

export interface UsageLog {
  id: string;
  user_id: string;
  model: 'claude' | 'gemini';
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  endpoint: string;
  created_at: string;
}

export interface SavedResponse {
  id: string;
  user_id: string;
  message_id: string;
  note: string | null;
  tags: string[];
  created_at: string;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'message_count'>;
        Update: Partial<Omit<Conversation, 'id' | 'user_id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'conversation_id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'word_count'>;
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'word_count'>>;
      };
      chunks: {
        Row: Chunk;
        Insert: Omit<Chunk, 'id' | 'created_at'>;
        Update: Partial<Omit<Chunk, 'id' | 'document_id' | 'created_at'>>;
      };
      usage_logs: {
        Row: UsageLog;
        Insert: Omit<UsageLog, 'id' | 'created_at' | 'total_tokens'>;
        Update: never;
      };
      saved_responses: {
        Row: SavedResponse;
        Insert: Omit<SavedResponse, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedResponse, 'id' | 'user_id' | 'message_id' | 'created_at'>>;
      };
    };
  };
}
