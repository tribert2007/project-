import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";

interface MentorProfile {
  id: string;
  user_id: string;
  full_name: string;
  expertise: string[];
  hourly_rate: number;
  years_experience: number | null;
  rating: number | null;
  bio: string | null;
  availability: string | null;
}

const FindAssist = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const { data: mentorProfiles } = await supabase
      .from("mentor_profiles")
      .select("*, profiles!inner(full_name)");

    if (mentorProfiles) {
      const formatted = mentorProfiles.map((mp: any) => ({
        id: mp.id,
        user_id: mp.user_id,
        full_name: mp.profiles.full_name,
        expertise: mp.expertise,
        hourly_rate: mp.hourly_rate,
        years_experience: mp.years_experience,
        rating: mp.rating,
        bio: mp.bio,
        availability: mp.availability,
      }));
      setMentors(formatted);
    }
    setLoading(false);
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
      <h1 className="text-3xl font-bold text-foreground mb-6">Find Assist - Jobs & Mentors</h1>
      <p className="text-muted-foreground mb-6">Connect with experienced mentors and find job opportunities</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{mentor.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{mentor.full_name}</CardTitle>
                  {mentor.rating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{mentor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              {mentor.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                  <div className="font-semibold text-primary">${mentor.hourly_rate}/hr</div>
                  {mentor.years_experience && (
                    <div className="text-muted-foreground">{mentor.years_experience} yrs exp</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => startChat(mentor.user_id)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {mentors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No mentors available yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FindAssist;
