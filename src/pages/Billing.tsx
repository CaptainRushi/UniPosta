import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CreditCard, Calendar, Check, X } from "lucide-react";
import { billingService } from "@/services/billingService";
import { BillingSubscription, BillingInvoice, BillingPlan } from "@/types/billing";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Ensure you set this in your .env file
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

export default function Billing() {
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<(BillingSubscription & { billing_plans: BillingPlan }) | null>(null);
    const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
    const [plans, setPlans] = useState<BillingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    const features = [
        { name: "Connected Platforms", starter: "3", pro: "10" },
        { name: "Campaigns", starter: "10", pro: "Unlimited" },
        { name: "Posts per Month", starter: "50", pro: "Unlimited" },
        { name: "Scheduled Publishing", starter: false, pro: true },
        { name: "Campaign Analytics", starter: "Basic", pro: "Advanced" },
        { name: "Team Members", starter: false, pro: true },
        { name: "Support", starter: "Standard", pro: "Priority" },
    ];

    useEffect(() => {
        fetchBillingData();

        // Realtime Subscription Listener
        let channel: any;
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            channel = billingService.subscribeToSubscriptionChanges(user.id, (newSub) => {
                if (newSub.status === 'active') {
                    toast({
                        title: "Subscription Activated!",
                        description: "Your payment has been verified.",
                        variant: "default",
                    });
                    fetchBillingData(); // Refresh all data
                }
            });
        };

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const fetchBillingData = async () => {
        try {
            const [subData, invoiceData, plansData] = await Promise.all([
                billingService.getCurrentSubscription(),
                billingService.getInvoices(),
                billingService.getPlans()
            ]);

            setSubscription(subData as any);
            setPlans(plansData);

            if (invoiceData.data) {
                setInvoices(invoiceData.data as unknown as BillingInvoice[]);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error loading billing data",
                description: "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (plan: BillingPlan) => {
        if (!window.Razorpay) {
            toast({
                title: "Razorpay SDK not loaded",
                description: "Please check your internet connection",
                variant: "destructive"
            });
            return;
        }

        try {
            setPurchasing(true);
            const { orderData } = await billingService.purchasePlan(plan.id, plan.price);

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Uniposta",
                description: `Subscribe to ${plan.name}`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    try {
                        toast({
                            title: "Verifying Payment...",
                            description: "Please wait while we confirm your subscription."
                        });

                        await billingService.verifyPayment(response);

                        toast({
                            title: "Payment Successful",
                            description: `You are now subscribed to ${plan.name}!`
                        });

                        // Force specific reload of data
                        await fetchBillingData();

                    } catch (err: any) {
                        console.error(err);
                        toast({
                            title: "Verification Failed",
                            description: "Payment succeeded but verification failed. Please contact support.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    // You can prefill user details here if available
                },
                theme: {
                    color: "#0F172A"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast({
                    title: "Payment Failed",
                    description: response.error.description,
                    variant: "destructive"
                });
            });
            rzp.open();

        } catch (error: any) {
            toast({
                title: "Purchase initialization failed",
                description: error.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setPurchasing(false);
        }
    };

    const handleManageSubscription = () => {
        alert("This feature is coming soon! You can cancel by contacting support.");
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const planName = subscription?.billing_plans?.name || "Free/Starter";
    const status = subscription?.status || "active";
    const nextBillingDate = subscription?.current_period_end
        ? format(new Date(subscription.current_period_end), 'PPP')
        : "N/A";

    const isSubscribed = !!subscription;
    const isPending = subscription?.status === 'pending';

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto px-4 pb-12">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">Manage your subscription and view payment history.</p>
                </div>

                {isPending && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-sm">
                        <p className="font-bold">Payment Pending Verification</p>
                        <p>We have received your request. Admin is verifying your payment. Your plan will be active shortly.</p>
                    </div>
                )}

                {/* Current Subscription Status */}
                {isSubscribed && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Current Plan</span>
                                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                                    {status.toUpperCase()}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                You are currently on the <strong>{planName}</strong> plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Payment Method</p>
                                        <p className="text-sm text-muted-foreground">Razorpay</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <Calendar className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Next Billing Date</p>
                                        <p className="text-sm text-muted-foreground">{nextBillingDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={handleManageSubscription}>
                                    Manage Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Available Plans (Show if not subscribed or for upgrades) */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrentPlan = subscription?.plan_id === plan.id && (subscription?.status === 'active' || subscription?.status === 'pending');
                            return (
                                <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}>
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>{plan.description || "Unlock new features"}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="text-3xl font-bold mb-4">
                                            {plan.currency} {plan.price}
                                            <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-sm">
                                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={isCurrentPlan ? "outline" : "default"}
                                            onClick={() => handlePurchase(plan)}
                                            disabled={purchasing || isCurrentPlan || isPending}
                                        >
                                            {purchasing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {isCurrentPlan ? "Current Plan" : "Upgrade"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
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

                {/* Invoice History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                        <CardDescription>Download past invoices and receipts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No invoices found.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{format(new Date(invoice.created_at), 'PPP')}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {invoice.currency.toUpperCase()} {(invoice.amount_paid).toFixed(2)} - {invoice.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {invoice.invoice_pdf_url && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
