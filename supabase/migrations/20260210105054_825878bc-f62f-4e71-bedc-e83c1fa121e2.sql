
-- =============================================
-- lingoReado Database Schema
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CLASSES TABLE
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '📚',
  code TEXT NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 3. CLASS_MEMBERS TABLE
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- 4. ACTIVITIES TABLE
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 5. SUBMISSIONS TABLE
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_audio_url TEXT,
  score INTEGER,
  corrections JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 6. JOURNAL_ENTRIES TABLE
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student_in_class(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE class_id = p_class_id AND student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
-- Teachers can see profiles of students in their classes
CREATE POLICY "Teachers can view class students" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    WHERE cm.student_id = profiles.id AND c.teacher_id = auth.uid()
  )
);

-- CLASSES
CREATE POLICY "Teachers can view own classes" ON public.classes FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Students can view joined classes" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members WHERE class_id = classes.id AND student_id = auth.uid())
);
CREATE POLICY "Teachers can create classes" ON public.classes FOR INSERT WITH CHECK (
  teacher_id = auth.uid() AND public.get_user_role() = 'teacher'
);
CREATE POLICY "Teachers can update own classes" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own classes" ON public.classes FOR DELETE USING (teacher_id = auth.uid());

-- CLASS_MEMBERS
CREATE POLICY "Teachers can view class members" ON public.class_members FOR SELECT USING (
  public.is_teacher_of_class(class_id)
);
CREATE POLICY "Students can view own memberships" ON public.class_members FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can join classes" ON public.class_members FOR INSERT WITH CHECK (
  student_id = auth.uid() AND public.get_user_role() = 'student'
);
CREATE POLICY "Teachers can remove class members" ON public.class_members FOR DELETE USING (
  public.is_teacher_of_class(class_id)
);

-- ACTIVITIES
CREATE POLICY "Teachers can view own class activities" ON public.activities FOR SELECT USING (
  public.is_teacher_of_class(class_id)
);
CREATE POLICY "Students can view class activities" ON public.activities FOR SELECT USING (
  public.is_student_in_class(class_id)
);
CREATE POLICY "Teachers can create activities" ON public.activities FOR INSERT WITH CHECK (
  created_by = auth.uid() AND public.is_teacher_of_class(class_id)
);
CREATE POLICY "Teachers can update activities" ON public.activities FOR UPDATE USING (
  public.is_teacher_of_class(class_id)
);
CREATE POLICY "Teachers can delete activities" ON public.activities FOR DELETE USING (
  public.is_teacher_of_class(class_id)
);

-- SUBMISSIONS
CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view student submissions" ON public.submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.classes c ON c.id = a.class_id
    WHERE a.id = submissions.activity_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT WITH CHECK (
  student_id = auth.uid()
);
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE USING (
  student_id = auth.uid()
);

-- JOURNAL_ENTRIES
CREATE POLICY "Students can view own journal" ON public.journal_entries FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view class journal" ON public.journal_entries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.activities a ON a.id = s.activity_id
    JOIN public.classes c ON c.id = a.class_id
    WHERE s.id = journal_entries.submission_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students can create journal entries" ON public.journal_entries FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can add comments" ON public.journal_entries FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.activities a ON a.id = s.activity_id
    JOIN public.classes c ON c.id = a.class_id
    WHERE s.id = journal_entries.submission_id AND c.teacher_id = auth.uid()
  )
);

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE: Audio bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', false);

CREATE POLICY "Users can upload own audio" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own audio" ON storage.objects FOR SELECT
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Teachers can view student audio" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio' AND
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.student_id = (storage.foldername(name))[1]::uuid AND c.teacher_id = auth.uid()
    )
  );

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
