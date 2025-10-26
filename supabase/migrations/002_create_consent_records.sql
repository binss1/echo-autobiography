-- Create consent_records table for PIPA compliance
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_consent_type CHECK (
    consent_type IN ('essential', 'analytics', 'marketing', 'third_party')
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON consent_records(consent_type);

-- Enable Row Level Security
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own consent records
CREATE POLICY "Users can view their own consent records"
  ON consent_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own consent records
CREATE POLICY "Users can insert their own consent records"
  ON consent_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own consent records
CREATE POLICY "Users can update their own consent records"
  ON consent_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_consent_records_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


