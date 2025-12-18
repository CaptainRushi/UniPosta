import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!session) return <Navigate to="/login" replace />;

    return <>{children}</>;
}
