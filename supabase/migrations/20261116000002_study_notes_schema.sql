-- =====================================================================
-- CAT 2027 HQ: Study Notes & Q&A Knowledge Base Migration
-- Migration ID: 20261116000002_study_notes_schema.sql
-- Engine: PostgreSQL 15+ (Supabase Managed DB)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    section section_type NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('Notes', 'QA', 'Quick Ref')),
    topic TEXT NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_notes_user_section ON public.study_notes(user_id, section);
CREATE INDEX IF NOT EXISTS idx_study_notes_user_type ON public.study_notes(user_id, note_type);
CREATE INDEX IF NOT EXISTS idx_study_notes_user_pinned ON public.study_notes(user_id, is_pinned);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own study_notes') THEN
        CREATE POLICY "Users can manage own study_notes" ON public.study_notes FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;
