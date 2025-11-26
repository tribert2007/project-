import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user_name: string;
  other_user_role: string;
  last_message?: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const { data: convos } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (convos) {
      const conversationsWithDetails = await Promise.all(
        convos.map(async (convo) => {
          const otherUserId = convo.user1_id === user.id ? convo.user2_id : convo.user1_id;

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

    setLoading(false);
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
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Messages</h1>

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
                      <span className="text-xs text-muted-foreground capitalize">
                        {convo.other_user_role.replace("_", " ")}
                      </span>
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
  );
};

export default Messages;
