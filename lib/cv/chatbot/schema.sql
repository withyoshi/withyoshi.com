-- CV Chatbot Sessions Schema (current)
-- Stores metadata per chat session; full transcripts live in Vercel Blob.

-- Fresh definition
DROP TABLE IF EXISTS cv_chat_sessions;

CREATE TABLE IF NOT EXISTS cv_chat_sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  summary TEXT NOT NULL,
  total_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  conversation_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_location JSONB NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT summary_len CHECK (char_length(summary) <= 2048)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_created_at ON cv_chat_sessions(created_at DESC);

-- Specific JSON field indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_last_activity
  ON cv_chat_sessions (((conversation_state->>'lastActivity')::bigint) DESC);

CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_total_tokens
  ON cv_chat_sessions (((total_usage->>'totalTokens')::bigint) DESC);

CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_country
  ON cv_chat_sessions ((ip_location->>'country'));

CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_user_name
  ON cv_chat_sessions ((conversation_state->>'userName'));

-- General GIN indexes for complex JSON queries (optional)
CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_conversation_state_gin
  ON cv_chat_sessions USING GIN (conversation_state);
CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_total_usage_gin
  ON cv_chat_sessions USING GIN (total_usage);
CREATE INDEX IF NOT EXISTS idx_cv_chat_sessions_ip_location_gin
  ON cv_chat_sessions USING GIN (ip_location);
