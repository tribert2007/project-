import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai-gradient">
        <Bot className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-chat-assistant border border-border px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
      </div>
    </div>
  );
};
