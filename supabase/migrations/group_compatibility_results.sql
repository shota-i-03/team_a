-- Group compatibility results table
CREATE TABLE IF NOT EXISTS public.group_compatibility_results (
    group_id TEXT NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    average_degree INTEGER NOT NULL,
    best_pair JSONB NOT NULL,
    worst_pair JSONB NOT NULL,
    analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (group_id)
);

-- Add RLS policies
ALTER TABLE public.group_compatibility_results ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read group compatibility results
CREATE POLICY "Authenticated users can read group compatibility results" 
    ON public.group_compatibility_results
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.group_members WHERE group_id = group_compatibility_results.group_id
        )
    );

-- Allow service role to manage all records
CREATE POLICY "Service role can manage group compatibility results" 
    ON public.group_compatibility_results
    USING (auth.role() = 'service_role') 
    WITH CHECK (auth.role() = 'service_role');
