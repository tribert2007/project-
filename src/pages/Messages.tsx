import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user_name: string;
  other_user_role: string;
  last_message?: string;
}

interface AvailableUser {
  id: string;
  full_name: string;
  role: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    // Get current user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCurrentUserRole(profile.role);
      await loadConversations(user.id);
      await loadAvailableUsers(user.id, profile.role);
    }

    setLoading(false);
  };

  const loadConversations = async (userId: string) => {
    const { data: convos } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (convos) {
      const conversationsWithDetails = await Promise.all(
        convos.map(async (convo) => {
          const otherUserId = convo.user1_id === userId ? convo.user2_id : convo.user1_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", otherUserId)
            .single();

          const { data: lastMessage } = await supabase
            .from("chat_messages")
            .select("content")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...convo,
            other_user_name: profile?.full_name || "Unknown",
            other_user_role: profile?.role || "",
            last_message: lastMessage?.content,
          };
        })
      );

      setConversations(conversationsWithDetails);
    }
  };

  const loadAvailableUsers = async (userId: string, role: string) => {
    let query = supabase
      .from("profiles")
      .select("id, full_name, role")
      .neq("id", userId);

    // Students can see job givers and mentors
    if (role === "student") {
      query = query.in("role", ["job_giver", "mentor"]);
    }
    // Job givers and mentors can see students
    else if (role === "job_giver" || role === "mentor") {
      query = query.eq("role", "student");
    }

    const { data } = await query;

    if (data) {
      // Filter out users we already have conversations with
      const existingConversations = await supabase
        .from("chat_conversations")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      const conversationUserIds = new Set(
        existingConversations.data?.flatMap(c => [c.user1_id, c.user2_id]) || []
      );
      conversationUserIds.delete(userId);

      setAvailableUsers(data.filter(u => !conversationUserIds.has(u.id)));
    }
  };

  const viewProfile = (userId: string) => {
    navigate(`/student-profile/${userId}`);
  };

  const startConversation = async (otherUserId: string) => {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
        .maybeSingle();

      if (existing) {
        navigate(`/chat/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("chat_conversations")
        .insert({
          user1_id: currentUserId,
          user2_id: otherUserId,
        })
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

  const openConversation = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Available Users Section */}
      {availableUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">
              Start a Conversation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableUsers.map((user) => (
              <Card key={user.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {user.full_name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {user.role.replace("_", " ")}
                      </Badge>
                      <div className="flex gap-2 mt-3">
                        {user.role === "student" && currentUserRole !== "student" && (
                          <button
                            onClick={() => viewProfile(user.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            View Profile
                          </button>
                        )}
                        <button
                          onClick={() => startConversation(user.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing Conversations Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Your Conversations</h2>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <Card
                key={convo.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => openConversation(convo.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {convo.other_user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">
                          {convo.other_user_name}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {convo.other_user_role.replace("_", " ")}
                        </Badge>
                      </div>
                      {convo.last_message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {convo.last_message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
