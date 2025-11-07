-- Create the KV store table for the edge function
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS kv_store_a784a06a (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for prefix searches (used by getByPrefix function)
CREATE INDEX IF NOT EXISTS kv_store_a784a06a_key_prefix_idx 
  ON kv_store_a784a06a 
  USING btree (key text_pattern_ops);

-- Enable Row Level Security
ALTER TABLE kv_store_a784a06a ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role has full access" 
  ON kv_store_a784a06a
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_kv_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on update
DROP TRIGGER IF EXISTS kv_store_a784a06a_updated_at ON kv_store_a784a06a;
CREATE TRIGGER kv_store_a784a06a_updated_at
  BEFORE UPDATE ON kv_store_a784a06a
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_store_updated_at();

-- Verify the table was created
SELECT 
  'kv_store_a784a06a table created successfully!' as message,
  COUNT(*) as initial_row_count 
FROM kv_store_a784a06a;
