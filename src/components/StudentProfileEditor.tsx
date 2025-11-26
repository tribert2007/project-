import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  university: z.string().max(200).optional(),
  major: z.string().max(200).optional(),
  graduation_year: z.number().min(2020).max(2040).optional().nullable(),
  gpa: z.number().min(0).max(4.0).optional().nullable(),
  skills: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  date_achieved: z.string().optional(),
  certificate_url: z.string().url().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AchievementFormData = z.infer<typeof achievementSchema>;

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date_achieved: string | null;
  certificate_url: string | null;
}

export const StudentProfileEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      university: "",
      major: "",
      graduation_year: null,
      gpa: null,
      skills: "",
      linkedin_url: "",
      portfolio_url: "",
    },
  });

  const achievementForm = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date_achieved: "",
      certificate_url: "",
    },
  });

  useEffect(() => {
    loadProfile();
    loadAchievements();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      profileForm.reset({
        bio: data.bio || "",
        university: data.university || "",
        major: data.major || "",
        graduation_year: data.graduation_year,
        gpa: data.gpa,
        skills: data.skills?.join(", ") || "",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
      });
    }
  };

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("student_id", user.id)
      .order("date_achieved", { ascending: false });

    if (data) {
      setAchievements(data);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const skillsArray = data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

      const { error } = await supabase
        .from("student_profiles")
        .upsert({
          user_id: user.id,
          bio: data.bio || null,
          university: data.university || null,
          major: data.major || null,
          graduation_year: data.graduation_year,
          gpa: data.gpa,
          skills: skillsArray,
          linkedin_url: data.linkedin_url || null,
          portfolio_url: data.portfolio_url || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAchievement = async (data: AchievementFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("achievements")
        .insert({
          student_id: user.id,
          title: data.title,
          description: data.description || null,
          date_achieved: data.date_achieved || null,
          certificate_url: data.certificate_url || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Achievement added successfully",
      });

      achievementForm.reset();
      setShowAchievementForm(false);
      loadAchievements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });

      loadAchievements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Student Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
              <CardDescription>Update your academic and professional information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about yourself" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University</FormLabel>
                          <FormControl>
                            <Input placeholder="University name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="major"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Major</FormLabel>
                          <FormControl>
                            <Input placeholder="Your major" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="graduation_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2024" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GPA</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="3.5" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="JavaScript, React, Node.js" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="portfolio_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourportfolio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Showcase your accomplishments</CardDescription>
                </div>
                <Button onClick={() => setShowAchievementForm(!showAchievementForm)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAchievementForm && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <Form {...achievementForm}>
                      <form onSubmit={achievementForm.handleSubmit(onSubmitAchievement)} className="space-y-4">
                        <FormField
                          control={achievementForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Achievement title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={achievementForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe your achievement" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={achievementForm.control}
                          name="date_achieved"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Achieved</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={achievementForm.control}
                          name="certificate_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://certificate-url.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Achievement
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAchievementForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {achievements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No achievements yet. Add your first one!</p>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">{achievement.title}</h3>
                            {achievement.description && (
                              <p className="text-muted-foreground mt-1">{achievement.description}</p>
                            )}
                            {achievement.date_achieved && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {new Date(achievement.date_achieved).toLocaleDateString()}
                              </p>
                            )}
                            {achievement.certificate_url && (
                              <a 
                                href={achievement.certificate_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary text-sm hover:underline mt-2 inline-block"
                              >
                                View Certificate
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAchievement(achievement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
