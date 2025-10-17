import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Database, User, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, initialized } = useAuth();

  // Redirect if already authenticated after init
  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      const id = setTimeout(() => {
        navigate("/overview", { replace: true });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter email and password");
      setIsLoading(false);
      return;
    }

    // Simple email validation
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Attempt login with credentials
    const success = await login(email, password);

    if (success) {
      toast.success("Welcome! Login successful");
      navigate("/overview", { replace: true });
    } else {
      // Show specific error message
      toast.error("Invalid credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-lg shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Database className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CLIP Management Portal</h1>
            <p className="text-muted-foreground text-center">
              Student Database Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <Shield className="w-4 h-4" />
            <p>All access is logged and monitored for security purposes</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
