import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator"; // Unused
import { Loader2, Download, CreditCard, Calendar } from "lucide-react";
import { billingService } from "@/services/billingService";
import { BillingSubscription, BillingInvoice, BillingPlan } from "@/types/billing";
import { format } from "date-fns";

export default function Billing() {
    const [subscription, setSubscription] = useState<(BillingSubscription & { billing_plans: BillingPlan }) | null>(null);
    const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const [subData, invoiceData] = await Promise.all([
                billingService.getCurrentSubscription(),
                billingService.getInvoices()
            ]);

            setSubscription(subData as any);

            if (invoiceData.data) {
                setInvoices(invoiceData.data as unknown as BillingInvoice[]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = () => {
        // Redirect to Billing Portal (Self-serve or Provider hosted)
        // For now, simple alert
        alert("This would open the User Billing Portal.");
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

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">Manage your subscription and view payment history.</p>
                </div>

                {/* Current Subscription */}
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
                                    <p className="text-sm text-muted-foreground">•••• 4242</p>
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
                                                {invoice.currency.toUpperCase()} {(invoice.amount_paid).toFixed(2)} - {invoice.status}
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
