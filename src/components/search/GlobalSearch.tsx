import { useEffect, useState } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, FileText, UserCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResults {
    campaigns: any[];
    posts: any[];
    accounts: any[];
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults>({ campaigns: [], posts: [], accounts: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults({ campaigns: [], posts: [], accounts: [] });
            return;
        }
    }, [open]);

    useEffect(() => {
        if (!query || query.trim() === "") {
            setResults({ campaigns: [], posts: [], accounts: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const searchTerm = `%${query}%`;

                // Parallel queries
                const [campaignsResult, postsResult, accountsResult] = await Promise.all([
                    supabase
                        .from("campaigns")
                        .select("id, name, status")
                        .ilike("name", searchTerm)
                        .limit(5),
                    supabase
                        .from("master_posts")
                        .select("id, caption")
                        .ilike("caption", searchTerm)
                        .limit(5),
                    supabase
                        .from("social_accounts")
                        .select("id, platform, account_name")
                        .or(`platform.ilike.${searchTerm},account_name.ilike.${searchTerm}`)
                        .limit(5),
                ]);

                setResults({
                    campaigns: campaignsResult.data || [],
                    posts: postsResult.data || [],
                    accounts: accountsResult.data || [],
                });
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, user]);

    const handleSelect = (callback: () => void) => {
        setOpen(false);
        callback();
    };

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search campaigns, posts, accounts..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!loading &&
                        results.campaigns.length === 0 &&
                        results.posts.length === 0 &&
                        results.accounts.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}

                    {results.campaigns.length > 0 && (
                        <CommandGroup heading="Campaigns">
                            {results.campaigns.map((campaign) => (
                                <CommandItem
                                    key={campaign.id}
                                    onSelect={() => handleSelect(() => navigate(`/campaigns/${campaign.id}`))}
                                >
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    <span>{campaign.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {(results.campaigns.length > 0 && (results.posts.length > 0 || results.accounts.length > 0)) && <CommandSeparator />}

                    {results.posts.length > 0 && (
                        <CommandGroup heading="Posts">
                            {results.posts.map((post) => (
                                <CommandItem
                                    key={post.id}
                                    onSelect={() => handleSelect(() => navigate(`/create?edit=${post.id}`))} // Assuming posts are editable in create page or similar
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span className="truncate">{post.caption || "Untitled Post"}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {(results.posts.length > 0 && results.accounts.length > 0) && <CommandSeparator />}

                    {results.accounts.length > 0 && (
                        <CommandGroup heading="Social Accounts">
                            {results.accounts.map((account) => (
                                <CommandItem
                                    key={account.id}
                                    onSelect={() => handleSelect(() => navigate("/settings"))} // Directing to settings/accounts
                                >
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    <span>{account.account_name} ({account.platform})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
