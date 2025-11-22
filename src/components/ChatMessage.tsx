import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai-gradient">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-chat-user text-primary-foreground"
            : "bg-chat-assistant text-foreground border border-border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
