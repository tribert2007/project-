import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedPrompts } from "@/components/SuggestedPrompts";
import { TypingIndicator } from "@/components/TypingIndicator";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "This is a demo response! To connect real AI capabilities, you can integrate with AI services using Lovable Cloud. I can help you set that up whenever you're ready!",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-gradient">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-ai-gradient shadow-lg">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Hello! How can I help you today?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Choose a suggestion below or type your own question
            </p>
            <SuggestedPrompts onSelect={handlePromptSelect} />
          </div>
        ) : (
          <div className="py-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-lg">
        <div className="container py-4">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            This is a demo interface. Connect real AI to unlock full capabilities.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
