// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ❌ Nonaktifkan dulu integrasi backend saat pengerjaan UI
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { User, Mail, Phone } from "lucide-react";

interface Profile {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();

  // ❌ Nonaktifkan dulu Auth, gunakan email demo
  // const { user } = useAuth();
  const demoEmail = "demo@ahmadcorp.test";

  // State lokal untuk UI-only
  const [profile, setProfile] = useState<Profile>({
    full_name: "Nama Demo",
    phone: "081234567890",
    avatar_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------- UI-Only bootstrapping ----------
  useEffect(
    () => {
      // ❌ Saat backend aktif:
      // if (!user) {
      //   navigate("/auth");
      //   return;
      // }
      // fetchProfile();

      // ✅ UI-only: simulasi loading fetch
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    },
    [
      /* user, navigate */
    ]
  );

  // ---------- Backend fetch (dinonaktifkan) ----------
  // const fetchProfile = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", user?.id)
  //       .single();
  //
  //     if (error) throw error;
  //     if (data) setProfile(data);
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //     toast.error("Failed to load profile");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // ❌ Backend update dinonaktifkan dulu
    // try {
    //   const { error } = await supabase
    //     .from("profiles")
    //     .update({
    //       full_name: profile.full_name,
    //       phone: profile.phone,
    //     })
    //     .eq("id", user?.id);
    //   if (error) throw error;
    //   toast.success("Profile updated successfully!");
    // } catch (error) {
    //   console.error("Error updating profile:", error);
    //   toast.error("Failed to update profile");
    // } finally {
    //   setSaving(false);
    // }

    // ✅ UI-only: simulasi sukses
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated (UI only)");
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      // value={user?.email || ""}
                      value={demoEmail}
                      disabled
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      required
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 081234567890"
                      value={profile.phone || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
