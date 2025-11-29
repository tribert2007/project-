import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [interviewMessage, setInterviewMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile) {
        setCurrentUserRole(profile.role);
      }
    }

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

  const sendInterviewRequest = async (studentId: string) => {
    if (!interviewMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSendingRequest(true);
    try {
      const { error } = await supabase
        .from("interview_requests")
        .insert({
          student_id: studentId,
          job_giver_id: currentUserId,
          message: interviewMessage.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview request sent successfully",
      });

      setInterviewMessage("");
      setSelectedStudent(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingRequest(false);
    }
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
              <div className="space-y-2">
                <div className="flex gap-2">
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
                {currentUserRole === "job_giver" && (
                  <Dialog open={selectedStudent === student.user_id} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedStudent(student.user_id)}
                        className="w-full gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Request Interview
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Interview</DialogTitle>
                        <DialogDescription>
                          Send an interview request to {student.full_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Write your message..."
                          value={interviewMessage}
                          onChange={(e) => setInterviewMessage(e.target.value)}
                          rows={5}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => sendInterviewRequest(student.user_id)}
                            disabled={sendingRequest || !interviewMessage.trim()}
                            className="flex-1"
                          >
                            Send Request
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(null);
                              setInterviewMessage("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
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
