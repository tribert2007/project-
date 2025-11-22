import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        disabled={disabled}
        className={cn(
          "min-h-[60px] max-h-[200px] resize-none rounded-2xl border-border bg-card pr-12 focus-visible:ring-primary",
          "transition-all duration-200"
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || disabled}
        className={cn(
          "absolute bottom-2 right-2 h-9 w-9 rounded-xl bg-ai-gradient hover:opacity-90 transition-opacity",
          (!input.trim() || disabled) && "opacity-50 cursor-not-allowed"
        )}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
