-- Supabase SQL Schema for LeadLoop AI MVP

-- 1. Create Tables

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'sales_rep',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    service TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    timeline TEXT,
    intent TEXT,
    lead_score INTEGER,
    priority TEXT,
    status TEXT DEFAULT 'New',
    source TEXT,
    assigned_to UUID REFERENCES profiles(id),
    ai_summary TEXT,
    ai_confidence NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id),
    source TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id),
    assigned_to UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE,
    priority TEXT,
    status TEXT DEFAULT 'Pending',
    created_by TEXT, -- e.g., 'automation'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE review_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interaction_id UUID REFERENCES interactions(id),
    extracted_data JSONB,
    confidence NUMERIC,
    missing_fields JSONB,
    status TEXT DEFAULT 'Pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE automation_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interaction_id UUID REFERENCES interactions(id),
    lead_id UUID REFERENCES leads(id),
    trigger_type TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'Running',
    current_step TEXT,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE automation_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_run_id UUID REFERENCES automation_runs(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT DEFAULT 'Running',
    input JSONB,
    output JSONB,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    lead_id UUID REFERENCES leads(id),
    channel TEXT DEFAULT 'in-app',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create updated_at trigger for leads
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_modtime
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all (for MVP)
CREATE POLICY "Allow authenticated full access to profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to leads" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to interactions" ON interactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to review_queue" ON review_queue FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to automation_runs" ON automation_runs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to automation_steps" ON automation_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');

-- Also allow insert to leads, interactions, etc. from service role / anonymous for the webhook
-- In MVP, if the webhook uses service_role key, RLS is bypassed. If it uses anon key, we need an anon insert policy.
-- To be safe, we'll allow anon to insert to interactions and review_queue (for public form submission)
CREATE POLICY "Allow anon insert to interactions" ON interactions FOR INSERT WITH CHECK (true);

-- 4. Demo Data Setup
-- Note: Replace UUIDs with actual user UUIDs after creating users in Supabase Auth

-- INSERT INTO profiles (id, name, email, role) VALUES 
-- ('uuid-1', 'Sarah Johnson', 'sarah@leadloop.ai', 'sales_rep'),
-- ('uuid-2', 'Michael Chen', 'michael@leadloop.ai', 'sales_rep'),
-- ('uuid-3', 'Grace Williams', 'grace@leadloop.ai', 'sales_rep');

-- INSERT INTO leads (name, company, email, status, lead_score, priority) VALUES
-- ('Demo Contact', 'Demo Corp', 'demo@example.com', 'New', 85, 'High');
