import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface InterviewRequest {
  id: string;
  job_giver_id: string;
  student_id: string;
  message: string;
  status: string;
  created_at: string;
  job_giver_name?: string;
  job_giver_company?: string;
  student_name?: string;
}

type UserRole = "student" | "job_giver" | "mentor";

const InterviewRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<InterviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("student");

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel('interview-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_requests',
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserRole(profile.role as UserRole);

      let query = supabase.from("interview_requests").select("*");
      
      if (profile.role === "student") {
        query = query.eq("student_id", user.id);
      } else if (profile.role === "job_giver") {
        query = query.eq("job_giver_id", user.id);
      }

      const { data: requestsData } = await query.order("created_at", { ascending: false });

      if (requestsData) {
        const enrichedRequests = await Promise.all(
          requestsData.map(async (req) => {
            const { data: jobGiverProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", req.job_giver_id)
              .single();

            const { data: jobGiverCompany } = await supabase
              .from("job_giver_profiles")
              .select("company_name")
              .eq("user_id", req.job_giver_id)
              .single();

            const { data: studentProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", req.student_id)
              .single();

            return {
              ...req,
              job_giver_name: jobGiverProfile?.full_name,
              job_giver_company: jobGiverCompany?.company_name,
              student_name: studentProfile?.full_name,
            };
          })
        );

        setRequests(enrichedRequests);
      }
    }

    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("interview_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Interview request ${newStatus}`,
      });

      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Interview Requests</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No interview requests yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {userRole === "student"
                        ? `From ${request.job_giver_name || "Unknown"}`
                        : `To ${request.student_name || "Unknown"}`}
                    </CardTitle>
                    {request.job_giver_company && (
                      <CardDescription>{request.job_giver_company}</CardDescription>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{request.message}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                </p>

                {userRole === "student" && request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRequestStatus(request.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewRequests;
