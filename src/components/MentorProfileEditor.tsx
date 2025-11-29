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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  expertise: z.string().min(1, "At least one expertise is required"),
  hourly_rate: z.number().min(0, "Rate must be positive"),
  years_experience: z.number().min(0).max(100).optional().nullable(),
  availability: z.string().max(200).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const MentorProfileEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      expertise: "",
      hourly_rate: 0,
      years_experience: null,
      availability: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setAvatarUrl(profileData.avatar_url);
    }

    const { data } = await supabase
      .from("mentor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      profileForm.reset({
        bio: data.bio || "",
        expertise: data.expertise?.join(", ") || "",
        hourly_rate: data.hourly_rate || 0,
        years_experience: data.years_experience,
        availability: data.availability || "",
      });
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const expertiseArray = data.expertise.split(",").map(s => s.trim()).filter(Boolean);

      const { error } = await supabase
        .from("mentor_profiles")
        .upsert({
          user_id: user.id,
          bio: data.bio || null,
          expertise: expertiseArray,
          hourly_rate: data.hourly_rate,
          years_experience: data.years_experience,
          availability: data.availability || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mentor profile updated successfully",
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

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Mentor Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Mentor Information</CardTitle>
          <CardDescription>Update your mentorship details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-center">
            <AvatarUpload
              userId={userId}
              currentAvatarUrl={avatarUrl}
              onUploadComplete={(url) => setAvatarUrl(url)}
            />
          </div>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell students about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expertise (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Career Guidance, Technical Skills, Leadership" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (RWF)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekdays 6PM-9PM, Weekends flexible" {...field} />
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
    </div>
  );
};
