import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Landing from "@/pages/Shared/Landing";
import Register from "./pages/Auth/Register";
import SignIn from "@/pages/Auth/SignIn";
import AdminDashboard from "@/pages/Admin/Dashboard";
import DoctorDashboard from "@/pages/Doctor/Dashboard";
import PatientDashboard from "@/pages/Patient/Dashboard";
import AdminPanel from "@/pages/Admin/AdminPanel";
import Profile from "@/pages/Shared/Profile";
import Onboarding from "@/pages/Auth/Onboarding";
import PatientMedications from "@/pages/Patient/Medications";
import PatientHealthMetrics from "@/pages/Patient/HealthMetrics";
import PatientCarePlans from "@/pages/Patient/CarePlans";
import PatientAppointments from "@/pages/Patient/Appointments";
import PatientAlerts from "@/pages/Patient/Alerts";
import Reports from "@/pages/Admin/Reports";
import ManageUsers from "@/pages/Admin/ManageUsers";
import DoctorPatients from "@/pages/Doctor/Patients";
import DoctorCarePlans from "@/pages/Doctor/CarePlans";
import NotFound from "./pages/Shared/not-found";
import DoctorAlerts from "@/pages/Doctor/Alerts";
import React from "react";
import { UserRole } from "@/types";
import DoctorAppointments from "@/pages/Doctor/Appointments";
import DoctorMedications from "@/pages/Doctor/Medications";
import { useToast } from "@/hooks/use-toast";
import DoctorPatientDetails from "@/pages/Doctor/PatientDetails";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  createdAt?: string;
  role?: UserRole;
};

function Router() {
  const { isAuthenticated, isLoading, user, error } = useAuth() as {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
    error: any;
  };
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to /signin if error is 401 and not on /register
  React.useEffect(() => {
    if (
      error &&
      error.message &&
      error.message.toLowerCase().includes("401") &&
      location !== "/register"
    ) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please sign in again.",
        // Optionally, you can add a variant or action here
      });
      setLocation("/signin");
    }
  }, [error, location, setLocation, toast]);

  // Redirect authenticated users to their appropriate dashboard only if they're on the root path
  React.useEffect(() => {
    if (isAuthenticated && user && location === "/") {
      if (user.role === 'admin') {
        setLocation("/admin/dashboard");
      } else if (user.role === 'doctor') {
        setLocation("/doctor/dashboard");
      } else if (user.role === 'patient') {
        setLocation("/patient/dashboard");
      }
    }
  }, [isAuthenticated, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <span className="text-lg font-bold text-navy-primary">Loading Chronicare...</span>
        </div>
      </div>
    );
  }

  // Check if user needs onboarding (new user without profile data)
  const needsOnboarding = isAuthenticated && user && (!user?.phone || !user?.dateOfBirth);
  
  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated && !needsOnboarding && <Navigation />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/register" component={Register} />
            <Route path="/signin" component={SignIn} />
          </>
        ) : needsOnboarding ? (
          <Route path="*" component={Onboarding} />
        ) : (
          <>
            {/* Role-based dashboard routes */}
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/doctor/dashboard" component={DoctorDashboard} />
            <Route path="/patient/dashboard" component={PatientDashboard} />
            
            {/* Shared routes */}
            <Route path="/profile" component={Profile} />
            <Route path="/onboarding" component={Onboarding} />
            
            {/* Patient routes */}
            <Route path="/patient/medications" component={PatientMedications} />
            <Route path="/patient/health-metrics" component={PatientHealthMetrics} />
            <Route path="/patient/care-plans" component={PatientCarePlans} />
            <Route path="/patient/appointments" component={PatientAppointments} />
            <Route path="/patient/alerts" component={PatientAlerts} />
            
            {/* Doctor routes */}
            <Route path="/doctor/patients" component={DoctorPatients} />
            <Route path="/doctor/patients/:id" component={DoctorPatientDetails} />
            <Route path="/doctor/medications" component={DoctorMedications} />
            <Route path="/doctor/care-plans" component={DoctorCarePlans} />
            <Route path="/doctor/alerts" component={DoctorAlerts} />
            {/* Add doctor appointments route */}
            <Route path="/doctor/appointments" component={DoctorAppointments} />
            
            {/* Admin routes */}
            <Route path="/reports" component={Reports} />
            <Route path="/admin/users" component={ManageUsers} />
            <Route path="/admin" component={AdminPanel} />
            
            {/* Default redirect for authenticated users */}
            <Route path="/" component={Landing} />
            
            {/* TODO: Implement /settings page with real API integration (e.g., /api/settings) */}
            {/* <Route path="/settings" component={SettingsPage} /> */}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
