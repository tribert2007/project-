-- Rename university column to school in student_profiles
ALTER TABLE public.student_profiles 
RENAME COLUMN university TO school;

-- Enable realtime for interview requests only (chat_messages already has realtime)
ALTER TABLE public.interview_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_requests;