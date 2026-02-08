import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassView from "./pages/ClassView";
import CreateActivity from "./pages/CreateActivity";
import StudentDashboard from "./pages/StudentDashboard";
import StudentActivity from "./pages/StudentActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/class/:classId" element={<ClassView />} />
          <Route path="/teacher/class/:classId/create-activity" element={<CreateActivity />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/activity/:activityId" element={<StudentActivity />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
