import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Mail, ExternalLink, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  school: string | null;
  major: string | null;
  graduation_year: number | null;
  gpa: number | null;
  bio: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
}

const ViewStudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadStudentProfile();
  }, [id]);

  const loadStudentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", id)
      .single();

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (profile && studentProfile) {
      setStudent({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        school: studentProfile.school,
        major: studentProfile.major,
        graduation_year: studentProfile.graduation_year,
        gpa: studentProfile.gpa,
        bio: studentProfile.bio,
        skills: studentProfile.skills,
        linkedin_url: studentProfile.linkedin_url,
        portfolio_url: studentProfile.portfolio_url,
      });
    }
    setLoading(false);
  };

  const startConversation = async () => {
    if (!id) return;

    try {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${currentUserId})`)
        .maybeSingle();

      if (existing) {
        navigate(`/chat/${existing.id}`);
        return;
      }

      const { data: newConvo, error } = await supabase
        .from("chat_conversations")
        .insert({ user1_id: currentUserId, user2_id: id })
        .select()
        .single();

      if (error) throw error;
      navigate(`/chat/${newConvo.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Student profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {student.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{student.full_name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                <span>{student.email}</span>
              </div>
              <Button onClick={startConversation} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Conversation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {student.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{student.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {student.school && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </h3>
                <p className="text-muted-foreground">{student.school}</p>
                {student.major && <p className="text-sm text-muted-foreground">{student.major}</p>}
                {student.graduation_year && (
                  <p className="text-sm text-muted-foreground">Class of {student.graduation_year}</p>
                )}
                {student.gpa && (
                  <p className="text-sm text-muted-foreground">GPA: {student.gpa}</p>
                )}
              </div>
            )}

            <div className="space-y-3">
              {student.linkedin_url && (
                <a
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              )}
              {student.portfolio_url && (
                <a
                  href={student.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Portfolio
                </a>
              )}
            </div>
          </div>

          {student.skills && student.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewStudentProfile;
