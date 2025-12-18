import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isRecovery = useMemo(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    return type === "recovery";
  }, []);

  const isStrongPassword = (pwd: string) => /(?=.*[A-Za-z])(?=.*\d).{12,}/.test(pwd);
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
      const m = (err as { message?: unknown }).message;
      return typeof m === "string" ? m : "Unknown error";
    }
    return "Unknown error";
  };

  useEffect(() => {
    if (isRecovery) {
      toast({
        title: "Reset your password",
        description: "Enter a new password to finalize the reset.",
      });
    }
  }, [isRecovery, toast]);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      });
      if (error) throw error;
      toast({
        title: "Email sent",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!isStrongPassword(password)) {
        toast({
          title: "Weak password",
          description: "Use at least 12 characters with letters and numbers.",
          variant: "destructive",
        });
        return;
      }
      if (password !== confirm) {
        toast({
          title: "Passwords do not match",
          description: "Re-enter the same password in both fields.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      if (data.user) {
        toast({
          title: "Password updated",
          description: "You can now sign in with your new password.",
        });
        navigate("/login");
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card variant="glass" className="w-full max-w-md animate-scale-in relative z-10">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AdSync</span>
          </Link>
          <div>
            <CardTitle className="text-2xl">{isRecovery ? "Reset password" : "Forgot password"}</CardTitle>
            <CardDescription>
              {isRecovery ? "Enter a new password to complete the reset" : "We'll email you a reset link"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isRecovery ? (
            <form onSubmit={handleSendReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="glow" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset email"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                />
                <p className="text-xs text-muted-foreground">Use at least 12 characters with letters and numbers</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={12}
                />
              </div>
              <Button type="submit" variant="glow" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
