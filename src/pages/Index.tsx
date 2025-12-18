import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Sparkles, Rocket, BarChart3, Check } from "lucide-react";
import { APP_NAME, TAGLINE } from "@/lib/constants";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Adaptation",
    description: "Automatically optimize your content for each platform with intelligent AI.",
  },
  {
    icon: Rocket,
    title: "One-Click Launch",
    description: "Publish to Instagram, Facebook, X, and LinkedIn simultaneously.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description: "Track performance across all platforms in one beautiful dashboard.",
  },
];

const benefits = [
  "Save 10+ hours per week on content adaptation",
  "Increase engagement by 40% with platform-optimized content",
  "Manage all ad platforms from a single dashboard",
  "AI-generated captions and hashtags",
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-powered social media advertising</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            One post.
            <br />
            <span className="text-gradient">Everywhere.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Create once, publish everywhere. {APP_NAME} uses AI to adapt your content for each platform and launch ads across Instagram, Facebook, X, and LinkedIn from a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/signup">
              <Button variant="glow" size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to scale your ads
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop switching between platforms. Manage your entire advertising workflow in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="mb-6 inline-flex rounded-xl gradient-primary p-3 shadow-glow">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 container mx-auto px-4 py-24">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-12 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why marketers love {APP_NAME}
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-2xl blur-2xl opacity-30" />
                <div className="relative rounded-2xl border border-border bg-card p-8 shadow-card">
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-bold text-gradient">40%</div>
                    <p className="text-muted-foreground">
                      Average increase in engagement with AI-optimized content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to transform your ad workflow?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of marketers who save time and boost results with {APP_NAME}.
        </p>
        <Link to="/signup">
          <Button variant="glow" size="lg" className="text-lg px-10">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">{APP_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
