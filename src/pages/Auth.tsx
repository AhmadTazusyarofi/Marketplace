import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

// ——— ikon Google ———
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path d="M23.49 12.27c0-.82-.07-1.42-.22-2.04H12.24v3.71h6.43c-.13 1.04-.82 2.6-2.37 3.65l-.02.12 3.45 2.67.24.02c2.2-2.03 3.52-5.02 3.52-8.13Z" fill="#4285F4" />
    <path d="M12.24 24c3.19 0 5.86-1.05 7.81-2.86l-3.72-2.88c-1 .7-2.34 1.2-4.09 1.2-3.13 0-5.79-2.03-6.74-4.84l-.1.01-3.64 2.82-.05.1C2.65 21.3 7.1 24 12.24 24Z" fill="#34A853" />
    <path d="M5.5 14.62A7.3 7.3 0 0 1 5.1 12c0-.91.16-1.79.42-2.62l-.01-.18-3.68-2.85-.12.06A11.95 11.95 0 0 0 0 12c0 1.91.47 3.71 1.28 5.29l4.22-2.67Z" fill="#FBBC05" />
    <path d="M12.24 4.74c2.22 0 3.72.95 4.58 1.74l3.34-3.26C18.08 1.23 15.43 0 12.24 0 7.1 0 2.65 2.7 1.28 6.71l4.23 2.67c.95-2.81 3.61-4.64 6.73-4.64Z" fill="#EA4335" />
  </svg>
);

// ——— ikon Facebook ———
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.49 0-1.953.926-1.953 1.874v2.251h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073z" />
    <path fill="#fff" d="M16.5 24v-8.437h2.795l.533-3.49H16.5V9.823c0-.947.463-1.874 1.953-1.874h1.513v-2.97s-1.374-.235-2.686-.235c-2.742 0-4.533 1.661-4.533 4.668v2.66H9.7v3.49h3.047V24h3.753z" />
  </svg>
);

// ——— tombol sosial (UI only) ———
const SocialAuth = () => {
  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">atau</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => console.log("Google Sign-In clicked")}>
        <GoogleIcon />
        Lanjutkan dengan Google
      </Button>

      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => console.log("Facebook Sign-In clicked")}>
        <FacebookIcon />
        Lanjutkan dengan Facebook
      </Button>
    </div>
  );
};

const Auth = () => {
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // state form
  const [signUpData, setSignUpData] = useState({ fullName: "", email: "", password: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });

  // state show/hide password
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signUpSchema.parse(signUpData);
      setLoading(true);
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
      if (error) {
        toast({ variant: "destructive", title: "Gagal mendaftar", description: error.message });
      } else {
        toast({ title: "Pendaftaran berhasil!", description: "Akun Anda telah dibuat. Silakan login." });
        setSignUpData({ fullName: "", email: "", password: "" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Validasi gagal", description: error.errors[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signInSchema.parse(signInData);
      setLoading(true);
      const { error } = await signIn(signInData.email, signInData.password);
      if (error) {
        toast({ variant: "destructive", title: "Gagal login", description: "Email atau password salah" });
      } else {
        toast({ title: "Login berhasil!", description: "Selamat datang kembali" });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Validasi gagal", description: error.errors[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="">
              <img src={logo} alt="MarketHub" className="h-13 w-12 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Selamat Datang di <br /> AhmadCorp - Marketplace
          </CardTitle>
          <CardDescription>Masuk atau daftar untuk mulai berbelanja</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            {/* ——— Tab Masuk ——— */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={showSignInPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              {/* Social login */}
              <div className="mt-6">
                <SocialAuth />
              </div>
            </TabsContent>

            {/* ——— Tab Daftar ——— */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nama Lengkap</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={showSignUpPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar"
                  )}
                </Button>
              </form>

              {/* Social register */}
              <div className="mt-6">
                <SocialAuth />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
