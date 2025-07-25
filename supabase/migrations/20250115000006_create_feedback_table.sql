-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert feedback
CREATE POLICY "Allow anonymous feedback insertion" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only allow service role to read feedback
CREATE POLICY "Service role can read feedback" ON feedback
  FOR SELECT USING (auth.role() = 'service_role');

-- Only allow service role to update feedback
CREATE POLICY "Service role can update feedback" ON feedback
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_email_sent ON feedback(email_sent); 