import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { billingService } from "@/services/billingService";

interface PlanFeature {
    name: string;
    starter: boolean | string;
    pro: boolean | string;
}

const features: PlanFeature[] = [
    { name: "Connected Platforms", starter: "3", pro: "10" },
    { name: "Campaigns", starter: "10", pro: "Unlimited" },
    { name: "Posts per Month", starter: "50", pro: "Unlimited" },
    { name: "Scheduled Publishing", starter: false, pro: true },
    { name: "Campaign Analytics", starter: "Basic", pro: "Advanced" },
    { name: "Team Members", starter: false, pro: true },
    { name: "Support", starter: "Standard", pro: "Priority" },
];

export default function Plans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Realtime Listener
    useEffect(() => {
        if (!userId) return;

        const channel = billingService.subscribeToSubscriptionChanges(userId, (newSub) => {
            console.log("Realtime Update:", newSub);
            setSubscription(newSub);

            if (newSub.status === 'active') {
                toast({
                    title: "Subscription Active!",
                    description: "Premium features unlocked.",
                    className: "bg-green-500 text-white"
                });
            }
        });

        return () => {
            channel.unsubscribe();
        }
    }, [userId]);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const fetchedPlans = await billingService.getPlans();
            setPlans(fetchedPlans || []);

            const currentSub = await billingService.getCurrentSubscription();
            setSubscription(currentSub);

        } catch (error) {
            console.error(error);
        }
    };

    // Helper to load Razorpay script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (plan: any) => {
        setLoading(true);
        try {
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast({ title: "Error", description: "Razorpay SDK failed to load", variant: "destructive" });
                return;
            }

            // 2. Create Pending Sub & Get Order ID
            const res = await billingService.purchasePlan(plan.id, plan.price);

            // 3. Open Razorpay Checkout
            const options = {
                key: res.orderData.key_id,
                amount: res.orderData.amount,
                currency: res.orderData.currency,
                name: "AdSync Pro",
                description: `Subscription for ${plan.name}`,
                order_id: res.orderData.order_id,
                handler: function (response: any) {
                    console.log("Payment Success:", response);
                    // In a real app, webhook handles everything.
                    // But we can show a 'Processing' state here.
                    toast({
                        title: "Payment Successful",
                        description: "Verifying your subscription...",
                        className: "bg-blue-500 text-white"
                    });
                },
                prefill: {
                    name: "User Name", // Ideally fetch from profile
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: { color: "#3399cc" }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

            // @ts-ignore
            setSubscription({ ...subscription, status: 'pending', plan_id: res.subscription.plan_id });

            toast({
                title: "Payment Initiated",
                description: "Complete payment in the popup.",
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Purchase Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const isPlanActive = (planId: string) => {
        return subscription?.status === 'active' && subscription?.plan_id === planId;
    }

    const isPending = subscription?.status === 'pending';
    const hasActiveSub = subscription?.status === 'active';

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Subscription Plans</h1>
                    <p className="text-muted-foreground">Select a plan to unlock premium features.</p>
                </div>

                {isPending && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-sm">
                        <p className="font-bold">Payment Pending Verification</p>
                        <p>We have received your request. Admin is verifying your payment. Screen will update automatically.</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {plans.map((plan) => {
                        const active = isPlanActive(plan.id);
                        const isPro = plan.name === 'Pro';

                        return (
                            <Card key={plan.id} className={`relative border-2 ${active ? 'border-primary shadow-lg' : 'border-border'}`}>
                                {active && (
                                    <Badge className="absolute top-4 right-4 bg-green-500">Active</Badge>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{plan.name}</span>
                                        <span className="text-3xl font-bold">${plan.price}</span>
                                    </CardTitle>
                                    <CardDescription>{isPro ? "For Power Users" : "For Beginners"}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        onClick={() => handlePurchase(plan)}
                                        disabled={loading || active || isPending}
                                        className="w-full"
                                        variant={active ? "outline" : "default"}
                                    >
                                        {active ? "Current Plan" : (isPending ? "Pending Approval..." : `Purchase ${plan.name}`)}
                                    </Button>

                                    <div className="text-sm space-y-2">
                                        {plan.features && Array.isArray(plan.features) && plan.features.map((f: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Feature Comparison */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-6 bg-muted/50 border-b">
                        <h3 className="font-semibold text-lg">Compare Features</h3>
                    </div>
                    <div className="p-0">
                        <div className="grid grid-cols-3 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
                            <div>Feature</div>
                            <div className="text-center">Starter</div>
                            <div className="text-center text-primary">Pro</div>
                        </div>
                        {features.map((feature, i) => (
                            <div key={i} className={`grid grid-cols-3 gap-4 p-4 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}`}>
                                <div className="font-medium">{feature.name}</div>
                                <div className="text-center">
                                    {typeof feature.starter === 'boolean' ? (
                                        feature.starter ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                    ) : feature.starter}
                                </div>
                                <div className="text-center font-semibold">
                                    {typeof feature.pro === 'boolean' ? (
                                        feature.pro ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                                    ) : feature.pro}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

