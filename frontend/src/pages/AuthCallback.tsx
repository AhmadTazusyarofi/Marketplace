import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function AuthCallback() {
  const { setSession } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      const token = params.get("token");
      const redirectTo = params.get("redirectTo") || "/";

      if (!token) {
        toast.error("Token OAuth tidak ditemukan");
        navigate("/auth", { replace: true });
        return;
      }

      try {
        await setSession(token);
        navigate(redirectTo, { replace: true });
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Login Google gagal");
        navigate("/auth", { replace: true });
      }
    }

    void run();
  }, [navigate, params, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-sm text-muted-foreground">Memproses login...</div>
    </div>
  );
}
