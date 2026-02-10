import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassView from "./pages/ClassView";
import CreateActivity from "./pages/CreateActivity";
import StudentDashboard from "./pages/StudentDashboard";
import StudentActivity from "./pages/StudentActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-primary"><p className="text-primary-foreground font-bold text-xl">Loading... 🐱</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRole && profile?.role !== allowedRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/class/:classId" element={<ProtectedRoute allowedRole="teacher"><ClassView /></ProtectedRoute>} />
            <Route path="/teacher/class/:classId/create-activity" element={<ProtectedRoute allowedRole="teacher"><CreateActivity /></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/activity/:activityId" element={<ProtectedRoute allowedRole="student"><StudentActivity /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
