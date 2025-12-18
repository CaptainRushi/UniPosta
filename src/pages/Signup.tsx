import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { APP_NAME } from "@/lib/constants";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isStrongPassword = (pwd: string) => /(?=.*[A-Za-z])(?=.*\d).{12,}/.test(pwd);
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
      const m = (err as { message?: unknown }).message;
      return typeof m === "string" ? m : "Unknown error";
    }
    return "Unknown error";
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      const isBreached = /breach|leak|pwned/i.test(msg);
      if (isBreached) {
        toast({
          title: "Password rejected",
          description: "This password appears in known breaches. Choose a different one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Unlimited ad campaigns",
    "AI-powered content adaptation",
    "Multi-platform publishing",
    "Advanced analytics",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Features Panel */}
        <div className="hidden md:flex flex-col justify-center space-y-8 animate-fade-in-left">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start creating <span className="text-gradient">amazing ads</span>
            </h2>
            <p className="text-muted-foreground">
              Join thousands of marketers who use {APP_NAME} to streamline their advertising workflow.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signup Form */}
        <Card variant="glass" className="animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">{APP_NAME}</span>
            </Link>
            <div>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Get started with your free trial</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use at least 12 characters with letters and numbers
                </p>
              </div>
              <Button type="submit" variant="glow" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
