import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, MessageSquare, Award } from "lucide-react";

type UserRole = "student" | "job_giver" | "mentor";

interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "student":
        return "Student";
      case "job_giver":
        return "Job Giver";
      case "mentor":
        return "Mentor";
      default:
        return role;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-muted-foreground">
          {getRoleLabel(profile?.role || "student")} Dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get instant help with career advice, interview prep, and more
            </CardDescription>
          </CardContent>
        </Card>

        {profile?.role === "student" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Mentors</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with experienced mentors to guide your career
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Messages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View your conversations with mentors and employers
                </CardDescription>
              </CardContent>
            </Card>
          </>
        )}

        {profile?.role === "job_giver" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Browse Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Discover talented students ready to join your team
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Messages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Communicate with students you're interested in
                </CardDescription>
              </CardContent>
            </Card>
          </>
        )}

        {profile?.role === "mentor" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>My Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View and manage your mentorship sessions
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Messages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat with your students and manage appointments
                </CardDescription>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
