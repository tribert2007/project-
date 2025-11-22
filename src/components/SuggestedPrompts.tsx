import { Button } from "@/components/ui/button";
import { Lightbulb, Code, Sparkles, BookOpen } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: Lightbulb,
    text: "Explain quantum computing in simple terms",
  },
  {
    icon: Code,
    text: "Help me debug this React component",
  },
  {
    icon: Sparkles,
    text: "Generate creative ideas for my startup",
  },
  {
    icon: BookOpen,
    text: "Summarize the latest AI research trends",
  },
];

export const SuggestedPrompts = ({ onSelect }: SuggestedPromptsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 py-6">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <Button
            key={index}
            variant="outline"
            className="h-auto justify-start gap-3 rounded-xl border-border bg-card p-4 text-left hover:bg-accent hover:border-primary transition-all duration-200"
            onClick={() => onSelect(prompt.text)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai-gradient">
              <Icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-foreground">{prompt.text}</span>
          </Button>
        );
      })}
    </div>
  );
};
