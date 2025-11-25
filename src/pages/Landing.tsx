import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Award, MessageSquare } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-gradient">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Ejo Hazaza Assist</h1>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="container py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Connect, Learn, and Grow
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rwanda's premier platform connecting students with employers and mentors. 
            Showcase your achievements, find opportunities, and accelerate your career.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Join Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Students</h3>
            <p className="text-muted-foreground">
              Showcase your academic achievements and get discovered by top employers in Rwanda
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Employers</h3>
            <p className="text-muted-foreground">
              Browse talented students, review their records, and connect directly for interviews
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Mentors</h3>
            <p className="text-muted-foreground">
              Share your expertise and help shape the next generation of professionals
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
