ALTER TABLE public.student_profiles 
RENAME COLUMN university TO school;

ALTER TABLE public.interview_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_requests;