import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Briefcase, Mail } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  type: "mentor";
}

interface JobGiverProfile {
  id: string;
  user_id: string;
  full_name: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  type: "job_giver";
}

type AssistProfile = MentorProfile | JobGiverProfile;

const FindAssist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AssistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobGiver, setSelectedJobGiver] = useState<string | null>(null);
  const [interviewMessage, setInterviewMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }

    // Load mentors
    const { data: mentorProfiles } = await supabase
      .from("mentor_profiles")
      .select("*, profiles!inner(full_name)");

    // Load job givers
    const { data: jobGiverProfiles } = await supabase
      .from("job_giver_profiles")
      .select("*, profiles!inner(full_name)");

    const allProfiles: AssistProfile[] = [];

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
        type: "mentor" as const,
      }));
      allProfiles.push(...formatted);
    }

    if (jobGiverProfiles) {
      const formatted = jobGiverProfiles.map((jg: any) => ({
        id: jg.id,
        user_id: jg.user_id,
        full_name: jg.profiles.full_name,
        company_name: jg.company_name,
        industry: jg.industry,
        company_size: jg.company_size,
        description: jg.description,
        type: "job_giver" as const,
      }));
      allProfiles.push(...formatted);
    }

    setProfiles(allProfiles);
    setLoading(false);
  };

  const startChat = (userId: string) => {
    navigate(`/messages?contact=${userId}`);
  };

  const sendInterviewRequest = async (jobGiverId: string) => {
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
          student_id: currentUserId,
          job_giver_id: jobGiverId,
          message: interviewMessage.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview request sent successfully",
      });

      setInterviewMessage("");
      setSelectedJobGiver(null);
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

  const mentors = profiles.filter((p) => p.type === "mentor") as MentorProfile[];
  const jobGivers = profiles.filter((p) => p.type === "job_giver") as JobGiverProfile[];

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Find Assist - Jobs & Mentors</h1>
      <p className="text-muted-foreground mb-6">Connect with experienced mentors and find job opportunities</p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All ({profiles.length})</TabsTrigger>
          <TabsTrigger value="jobs">Job Givers ({jobGivers.length})</TabsTrigger>
          <TabsTrigger value="mentors">Mentors ({mentors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{profile.full_name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {profile.type === "mentor" ? "Mentor" : "Job Giver"}
                      </Badge>
                      {profile.type === "mentor" && profile.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{profile.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {profile.type === "job_giver" && profile.company_name && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="truncate">{profile.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.type === "mentor" ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {profile.expertise.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm font-semibold text-primary">
                          ${profile.hourly_rate}/hr
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startChat(profile.user_id)}
                          className="gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {profile.industry && (
                        <Badge variant="secondary" className="text-xs">{profile.industry}</Badge>
                      )}
                      {profile.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{profile.description}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Dialog open={selectedJobGiver === profile.user_id} onOpenChange={(open) => !open && setSelectedJobGiver(null)}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedJobGiver(profile.user_id)}
                              className="flex-1 gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              Request Interview
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Interview</DialogTitle>
                              <DialogDescription>
                                Send an interview request to {profile.full_name}
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
                                  onClick={() => sendInterviewRequest(profile.user_id)}
                                  disabled={sendingRequest || !interviewMessage.trim()}
                                  className="flex-1"
                                >
                                  Send Request
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedJobGiver(null);
                                    setInterviewMessage("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          onClick={() => startChat(profile.user_id)}
                          className="flex-1 gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobGivers.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{profile.full_name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Briefcase className="h-4 w-4" />
                        <span className="truncate">{profile.company_name}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.industry && (
                    <Badge variant="secondary" className="text-xs">{profile.industry}</Badge>
                  )}
                  {profile.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Dialog open={selectedJobGiver === profile.user_id} onOpenChange={(open) => !open && setSelectedJobGiver(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJobGiver(profile.user_id)}
                          className="flex-1 gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Request Interview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Interview</DialogTitle>
                          <DialogDescription>
                            Send an interview request to {profile.full_name}
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
                              onClick={() => sendInterviewRequest(profile.user_id)}
                              disabled={sendingRequest || !interviewMessage.trim()}
                              className="flex-1"
                            >
                              Send Request
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedJobGiver(null);
                                setInterviewMessage("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      onClick={() => startChat(profile.user_id)}
                      className="flex-1 gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{profile.full_name}</CardTitle>
                      {profile.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{profile.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <div className="font-semibold text-primary">${profile.hourly_rate}/hr</div>
                      {profile.years_experience && (
                        <div className="text-muted-foreground">{profile.years_experience} yrs exp</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startChat(profile.user_id)}
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
        </TabsContent>
      </Tabs>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No job givers or mentors available yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FindAssist;
