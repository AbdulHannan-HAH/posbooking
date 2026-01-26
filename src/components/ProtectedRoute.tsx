import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'pool_staff' | 'conference_staff' | 'hotel_staff')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Show access denied instead of redirecting
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground mt-2 mb-6">
                        You don't have permission to access this page.
                        Your role is <span className="font-medium text-foreground">{user.role}</span>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // User is authenticated and has required role
    return <>{children}</>;
}