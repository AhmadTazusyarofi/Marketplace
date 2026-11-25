import { apiFetch, setAuthToken } from "@/lib/apiClient";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

export type AppRole = "buyer" | "seller" | "admin";

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: AppRole[];
};

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    avatarUrl: string,
    role: "buyer" | "seller",
    storeName?: string,
    storeLocation?: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token"),
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = async () => {
    const res = await apiFetch<{ user: AppUser }>("/api/auth/me");
    setUser(res.user);
  };

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    avatarUrl: string,
    role: "buyer" | "seller",
    storeName?: string,
    storeLocation?: string,
  ): Promise<{ error: Error | null }> => {
    try {
      const payload: {
        email: string;
        password: string;
        fullName: string;
        phone: string;
        avatarUrl: string;
        role: "buyer" | "seller";
        storeName?: string;
        storeLocation?: string;
      } = {
        email,
        password,
        fullName,
        phone,
        avatarUrl,
        role,
      };

      if (role === "seller") {
        const sn = storeName?.trim();
        if (sn) payload.storeName = sn;

        const sl = storeLocation?.trim();
        if (sl) payload.storeLocation = sl;
      }

      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { error: null };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error : new Error("Register failed"),
      };
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    try {
      const res = await apiFetch<{ token: string; user: AppUser }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return { error: null };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error : new Error("Login failed"),
      };
    }
  };

  const setSession = async (nextToken: string) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    await refreshUser();
  };

  const signOut = async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setSession,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
