import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Home, 
  User as UserIcon, 
  Pill, 
  Activity, 
  Calendar, 
  Settings, 
  LogOut,
  Users,
  Shield,
  FileText,
  Bell,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types";
import { getUserDisplayName, getUserInitials } from "@/lib/utils";

export default function Navigation() {
  const { user, logout, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "doctor": return "Doctor";
      case "patient": return "Patient";
      default: return "User";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive"; // Red for Admin
      case "doctor": return "default"; // Blue for Doctor
      case "patient": return "secondary"; // Gray for Patient
      default: return "outline";
    }
  };

  const getDashboardHref = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'patient': return '/patient/dashboard';
      default: return '/';
    }
  };

  const navigation = [
    { name: "Dashboard", href: getDashboardHref(), icon: Home, roles: ['admin', 'doctor', 'patient'] },
    { name: "Profile", href: "/profile", icon: UserIcon, roles: ['admin', 'doctor', 'patient'] },
    { name: "Medications", href: "/medications", icon: Pill, roles: ['doctor', 'patient'] },
    { name: "Health Metrics", href: "/health", icon: Activity, roles: ['doctor', 'patient'] },
    { name: "Care Plans", href: user?.role === 'doctor' ? "/doctor/care-plans" : "/care-plans", icon: Calendar, roles: ['doctor', 'patient'] },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar, roles: ['patient'] },
    { name: "Alerts", href: user?.role === 'doctor' ? "/doctor/alerts" : "/patient/alerts", icon: Bell, roles: ['doctor', 'patient'] },
    // Remove Patients for admin, keep for doctor
    ...(user?.role === 'doctor' ? [{ name: "Patients", href: "/doctor/patients", icon: Users, roles: ['doctor'] }] : []),
    { name: "Reports", href: "/reports", icon: FileText, roles: ['admin', 'doctor'] },
    { name: "Manage Users", href: "/admin/users", icon: Users, roles: ['admin'] },
    { name: "Admin Panel", href: "/admin", icon: Shield, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'patient')
  );

  // Only show patient routes if user is a patient
  const patientNavigation = [
    { name: "Dashboard", href: "/patient/dashboard", icon: Home },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Medications", href: "/patient/medications", icon: Pill },
    { name: "Health Metrics", href: "/patient/health-metrics", icon: Activity },
    { name: "Care Plans", href: "/patient/care-plans", icon: Calendar },
  ];

  // Only show doctor routes if user is a doctor
  const doctorNavigation = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Medications", href: "/doctor/medications", icon: Pill },
    { name: "Alerts", href: "/doctor/alerts", icon: Bell },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Care Plans", href: "/doctor/care-plans", icon: Calendar },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
      onError: (err) => {
        alert("Failed to log out: " + (err?.message || "Unknown error"));
      },
    });
  };

  const isActive = (href: string) => {
    // Handle dashboard routes specially
    if (href.includes('/dashboard')) {
      return location.startsWith(href);
    }
    // Handle root path
    if (href === "/" && location === "/") return true;
    // Handle other routes
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  if (!user) {
    // Minimal nav for guests
    return (
      <nav className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-primary">Chronicare</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/signin" className="text-teal-primary font-medium hover:underline">Sign In</Link>
              <Link href="/register" className="text-navy-primary font-medium hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={getDashboardHref()} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-primary">Chronicare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/*
              Role-based navigation:
              Only show patient links if user is a patient
            */}
            {user?.role === "patient"
              ? patientNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-teal-50 text-teal-primary border border-teal-200"
                          : "text-slate-600 hover:text-teal-primary hover:bg-slate-50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              : user?.role === "doctor"
              ? doctorNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-teal-50 text-teal-primary border border-teal-200"
                          : "text-slate-600 hover:text-teal-primary hover:bg-slate-50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              : filteredNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-teal-50 text-teal-primary border border-teal-200"
                          : "text-slate-600 hover:text-teal-primary hover:bg-slate-50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-teal-100 text-teal-primary">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-slate-900">
                      {getUserDisplayName(user)}
                    </span>
                    <Badge variant={getRoleBadgeVariant(user?.role || 'patient')} className="text-xs">
                      {getRoleLabel(user?.role || 'patient')}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <Badge variant={getRoleBadgeVariant(user?.role || 'patient')} className="text-xs mt-1">
                    {getRoleLabel(user?.role || 'patient')}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              {filteredNavigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-teal-50 text-teal-primary border-l-4 border-teal-primary"
                        : "text-slate-600"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}