-- =====================================================================
-- CAT 2027 HQ: Master Database Schema Migration
-- Migration ID: 20261116000001_cat_2027_hq_schema.sql
-- Engine: PostgreSQL 15+ (Supabase Managed DB)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'section_type') THEN
        CREATE TYPE section_type AS ENUM ('Quant', 'DILR', 'VARC', 'General');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_type') THEN
        CREATE TYPE task_status_type AS ENUM ('Not Started', 'In Progress', 'Review', 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_type') THEN
        CREATE TYPE priority_type AS ENUM ('Low', 'Medium', 'High', 'Urgent');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mistake_category_type') THEN
        CREATE TYPE mistake_category_type AS ENUM (
            'Concept gap',
            'Calculation error',
            'Misread question',
            'Time sink',
            'Wrong guess',
            'Option elimination',
            'Set selection'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'week_status_type') THEN
        CREATE TYPE week_status_type AS ENUM ('Not started', 'In progress', 'Done', 'Catch-up needed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'routine_classification_type') THEN
        CREATE TYPE routine_classification_type AS ENUM (
            'working_professional_weekday',
            'working_professional_weekend',
            'college_student_weekday',
            'custom'
        );
    END IF;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT NOT NULL DEFAULT 'CAT Aspirant',
    avatar_url TEXT,
    cat_target_year INTEGER NOT NULL DEFAULT 2027,
    prep_start_date DATE NOT NULL DEFAULT '2026-11-17',
    target_exam_date DATE NOT NULL DEFAULT '2027-11-28',
    preferred_daily_hours NUMERIC(3, 1) NOT NULL DEFAULT 3.0,
    preferred_routine routine_classification_type DEFAULT 'working_professional_weekday',
    prep_goals TEXT,
    theme_preference TEXT NOT NULL DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'system')),
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    time_format TEXT NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PREPARATION PHASES TABLE
CREATE TABLE IF NOT EXISTS public.preparation_phases (
    phase_number INTEGER PRIMARY KEY CHECK (phase_number BETWEEN 1 AND 5),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_week INTEGER NOT NULL CHECK (start_week >= 1),
    end_week INTEGER NOT NULL CHECK (end_week <= 52),
    hours_per_week_min NUMERIC(3, 1) NOT NULL,
    hours_per_week_max NUMERIC(3, 1) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WEEKLY PLANS TABLE
CREATE TABLE IF NOT EXISTS public.weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    month_label TEXT NOT NULL,
    phase_number INTEGER NOT NULL REFERENCES public.preparation_phases(phase_number),
    quant_plan TEXT NOT NULL,
    varc_plan TEXT NOT NULL,
    dilr_plan TEXT NOT NULL,
    tests_planned TEXT,
    milestone_admin TEXT,
    hours_target TEXT NOT NULL,
    status week_status_type NOT NULL DEFAULT 'Not started',
    my_notes TEXT,
    actual_hours_logged NUMERIC(4, 1) DEFAULT 0.0,
    is_buffer_week BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, week_number)
);

-- 6. TOPICS TABLE (Catalog)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section section_type NOT NULL,
    area TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    subtopics TEXT,
    plan_week TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (section, topic_name)
);

-- 7. TOPIC PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    concept_done BOOLEAN NOT NULL DEFAULT false,
    practice_done BOOLEAN NOT NULL DEFAULT false,
    pyqs_done BOOLEAN NOT NULL DEFAULT false,
    confidence_level INTEGER NOT NULL DEFAULT 1 CHECK (confidence_level BETWEEN 1 AND 5),
    revision_1_done BOOLEAN NOT NULL DEFAULT false,
    revision_2_done BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, topic_id)
);

-- 8. STUDY TASKS TABLE (JIRA style)
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weekly_plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    section section_type NOT NULL DEFAULT 'General',
    status task_status_type NOT NULL DEFAULT 'Not Started',
    priority priority_type NOT NULL DEFAULT 'Medium',
    deadline DATE,
    estimated_minutes INTEGER DEFAULT 60,
    actual_minutes INTEGER DEFAULT 0,
    is_today_focus BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MOCK TESTS TABLE
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mock_number INTEGER NOT NULL CHECK (mock_number BETWEEN 1 AND 40),
    test_date DATE,
    series_name TEXT,
    varc_attempts INTEGER DEFAULT 0,
    varc_score INTEGER DEFAULT 0,
    dilr_attempts INTEGER DEFAULT 0,
    dilr_score INTEGER DEFAULT 0,
    qa_attempts INTEGER DEFAULT 0,
    qa_score INTEGER DEFAULT 0,
    total_attempts INTEGER GENERATED ALWAYS AS (
        COALESCE(varc_attempts, 0) + COALESCE(dilr_attempts, 0) + COALESCE(qa_attempts, 0)
    ) STORED,
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(varc_score, 0) + COALESCE(dilr_score, 0) + COALESCE(qa_score, 0)
    ) STORED,
    percentile NUMERIC(5, 2),
    analysis_done BOOLEAN NOT NULL DEFAULT false,
    biggest_lesson TEXT,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, mock_number)
);

-- 10. MOCK ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.mock_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE UNIQUE,
    what_went_well TEXT,
    what_went_wrong TEXT,
    questions_skipped TEXT,
    time_management_issues TEXT,
    topics_needing_revision TEXT,
    action_plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MISTAKES TABLE
CREATE TABLE IF NOT EXISTS public.mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mistake_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT NOT NULL,
    section section_type NOT NULL,
    topic TEXT NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL,
    question_ref TEXT NOT NULL,
    mistake_type mistake_category_type NOT NULL,
    what_went_wrong TEXT NOT NULL,
    rule_for_next_time TEXT NOT NULL,
    revisit_date DATE GENERATED ALWAYS AS (mistake_date + INTERVAL '7 days') STORED,
    re_solved BOOLEAN NOT NULL DEFAULT false,
    re_solved_date DATE,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. RESOURCES & USER_RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    intended_usage TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    is_favorited BOOLEAN NOT NULL DEFAULT false,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    personal_notes TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    UNIQUE (user_id, resource_id)
);

-- 13. ROUTINE TEMPLATES & DAILY SCHEDULES
CREATE TABLE IF NOT EXISTS public.routine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classification routine_classification_type NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    target_hours NUMERIC(3, 1) NOT NULL,
    time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL DEFAULT CURRENT_DATE,
    template_id UUID REFERENCES public.routine_templates(id),
    custom_time_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_hours_completed NUMERIC(3, 1) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, schedule_date)
);

-- 14. STICKY NOTES TABLE
CREATE TABLE IF NOT EXISTS public.sticky_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT 'lavender' CHECK (color IN ('charcoal', 'lavender', 'emerald', 'amber', 'rose', 'cyan')),
    position_x NUMERIC NOT NULL DEFAULT 100.0,
    position_y NUMERIC NOT NULL DEFAULT 100.0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    linked_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    linked_task_id UUID REFERENCES public.study_tasks(id) ON DELETE SET NULL,
    linked_mock_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL,
    reminder_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PREPARATION GUIDE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.preparation_guide_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. ANALYTICAL VIEW: v_dashboard_overview
CREATE OR REPLACE VIEW public.v_dashboard_overview AS
SELECT 
    p.user_id,
    p.prep_start_date,
    p.target_exam_date,
    GREATEST(0, (p.target_exam_date - CURRENT_DATE)) AS days_remaining,
    LEAST(52, GREATEST(1, FLOOR((CURRENT_DATE - p.prep_start_date) / 7.0) + 1))::INTEGER AS current_week,
    
    COALESCE(tp_stats.total_topics, 53) AS total_topics,
    COALESCE(tp_stats.completed_topics, 0) AS completed_topics,
    COALESCE(tp_stats.in_progress_topics, 0) AS in_progress_topics,
    COALESCE(tp_stats.weak_topics_count, 0) AS weak_topics_count,
    COALESCE(tp_stats.completion_percentage, 0.0) AS overall_completion_pct,
    
    COALESCE(mt_stats.total_mocks_attempted, 0) AS total_mocks_attempted,
    mt_stats.latest_score,
    mt_stats.best_score,
    mt_stats.average_score,

    COALESCE(m_stats.pending_mistakes, 0) AS pending_mistakes,
    COALESCE(m_stats.overdue_mistakes, 0) AS overdue_mistakes
FROM public.profiles p
LEFT JOIN (
    SELECT 
        tp.user_id,
        COUNT(tp.id) AS total_topics,
        COUNT(tp.id) FILTER (WHERE tp.concept_done AND tp.practice_done AND tp.pyqs_done) AS completed_topics,
        COUNT(tp.id) FILTER (WHERE tp.concept_done AND NOT (tp.practice_done AND tp.pyqs_done)) AS in_progress_topics,
        COUNT(tp.id) FILTER (WHERE tp.confidence_level <= 2) AS weak_topics_count,
        ROUND(
            AVG(
                (CASE WHEN tp.concept_done THEN 25 ELSE 0 END) +
                (CASE WHEN tp.practice_done THEN 25 ELSE 0 END) +
                (CASE WHEN tp.pyqs_done THEN 25 ELSE 0 END) +
                (CASE WHEN tp.revision_1_done THEN 12.5 ELSE 0 END) +
                (CASE WHEN tp.revision_2_done THEN 12.5 ELSE 0 END)
            )::NUMERIC, 1
        ) AS completion_percentage
    FROM public.topic_progress tp
    GROUP BY tp.user_id
) tp_stats ON tp_stats.user_id = p.user_id
LEFT JOIN (
    SELECT 
        mt.user_id,
        COUNT(mt.id) AS total_mocks_attempted,
        (ARRAY_AGG(mt.total_score ORDER BY mt.test_date DESC NULLS LAST))[1] AS latest_score,
        MAX(mt.total_score) AS best_score,
        ROUND(AVG(mt.total_score)::NUMERIC, 1) AS average_score
    FROM public.mock_tests mt
    WHERE mt.is_sample = false AND mt.total_score IS NOT NULL
    GROUP BY mt.user_id
) mt_stats ON mt_stats.user_id = p.user_id
LEFT JOIN (
    SELECT 
        m.user_id,
        COUNT(m.id) FILTER (WHERE NOT m.re_solved) AS pending_mistakes,
        COUNT(m.id) FILTER (WHERE NOT m.re_solved AND m.revisit_date < CURRENT_DATE) AS overdue_mistakes
    FROM public.mistakes m
    WHERE m.is_sample = false
    GROUP BY m.user_id
) m_stats ON m_stats.user_id = p.user_id;

-- 17. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Read policies for global catalogs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on phases') THEN
        CREATE POLICY "Allow read on phases" ON public.preparation_phases FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on topics') THEN
        CREATE POLICY "Allow read on topics" ON public.topics FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on resources') THEN
        CREATE POLICY "Allow read on resources" ON public.resources FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on templates') THEN
        CREATE POLICY "Allow read on templates" ON public.routine_templates FOR SELECT TO authenticated, anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow read on prep guide') THEN
        CREATE POLICY "Allow read on prep guide" ON public.preparation_guide_sections FOR SELECT TO authenticated, anon USING (true);
    END IF;
    
    -- User-scoped policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own profiles') THEN
        CREATE POLICY "Users can manage own profiles" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own weekly_plans') THEN
        CREATE POLICY "Users can manage own weekly_plans" ON public.weekly_plans FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own topic_progress') THEN
        CREATE POLICY "Users can manage own topic_progress" ON public.topic_progress FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own study_tasks') THEN
        CREATE POLICY "Users can manage own study_tasks" ON public.study_tasks FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own mock_tests') THEN
        CREATE POLICY "Users can manage own mock_tests" ON public.mock_tests FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own mistakes') THEN
        CREATE POLICY "Users can manage own mistakes" ON public.mistakes FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own user_resources') THEN
        CREATE POLICY "Users can manage own user_resources" ON public.user_resources FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own daily_schedules') THEN
        CREATE POLICY "Users can manage own daily_schedules" ON public.daily_schedules FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own sticky_notes') THEN
        CREATE POLICY "Users can manage own sticky_notes" ON public.sticky_notes FOR ALL TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;
