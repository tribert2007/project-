import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  school: string | null;
  major: string | null;
  graduation_year: number | null;
  gpa: number | null;
  skills: string[] | null;
  bio: string | null;
}

const BrowseStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const { data: studentProfiles } = await supabase
      .from("student_profiles")
      .select("*, profiles!inner(full_name)");

    if (studentProfiles) {
      const formatted = studentProfiles.map((sp: any) => ({
        id: sp.id,
        user_id: sp.user_id,
        full_name: sp.profiles.full_name,
        school: sp.school,
        major: sp.major,
        graduation_year: sp.graduation_year,
        gpa: sp.gpa,
        skills: sp.skills,
        bio: sp.bio,
      }));
      setStudents(formatted);
    }
    setLoading(false);
  };

  const viewProfile = (userId: string) => {
    navigate(`/student-profile/${userId}`);
  };

  const startChat = (userId: string) => {
    navigate(`/messages?contact=${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Browse Students</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{student.full_name}</CardTitle>
                  {student.school && (
                    <p className="text-sm text-muted-foreground truncate">{student.school}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.major && (
                <div>
                  <p className="text-sm font-medium text-foreground">{student.major}</p>
                  {student.graduation_year && (
                    <p className="text-xs text-muted-foreground">Class of {student.graduation_year}</p>
                  )}
                </div>
              )}
              {student.skills && student.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {student.skills.slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {student.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{student.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              {student.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{student.bio}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewProfile(student.user_id)}
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => startChat(student.user_id)}
                  className="flex-1 gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students registered yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrowseStudents;
