import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Clock, Shield, Users, FileText } from "lucide-react";
import DemoVideoModal from "@/components/DemoVideoModal";

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    setLocation("/register");
  };

  const handleSignIn = () => {
    setLocation("/signin");
  };

  const handleWatchDemo = () => {
    setShowDemoModal(true);
  };

  const features = [
    {
      icon: Activity,
      title: "Health Data Tracking",
      description: "Monitor blood pressure, glucose levels, and activity with intuitive charts and real-time insights."
    },
    {
      icon: Clock,
      title: "Medication Reminders",
      description: "Never miss a dose with customizable reminders and adherence tracking."
    },
    {
      icon: Heart,
      title: "Personalized Care Plans",
      description: "Receive tailored recommendations that adapt to your health data and goals."
    },
    {
      icon: FileText,
      title: "Health Reports",
      description: "Generate comprehensive reports to share with healthcare providers."
    },
    {
      icon: Shield,
      title: "Device Integration",
      description: "Sync with wearables and medical devices for continuous monitoring."
    },
    {
      icon: Users,
      title: "Real-time Alerts",
      description: "Instant notifications for critical health events and emergency contacts."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-primary">Chronicare</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-teal-primary font-medium transition-colors">Features</a>
              <a href="#about" className="text-slate-600 hover:text-teal-primary font-medium transition-colors">About</a>
              <a href="#contact" className="text-slate-600 hover:text-teal-primary font-medium transition-colors">Contact</a>
              <Button onClick={handleSignIn} variant="outline" className="border-teal-primary text-teal-primary hover:bg-teal-primary hover:text-white transition-all">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-teal-primary hover:bg-teal-dark transition-all">
                Registration
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-navy-primary leading-tight">
                  Your Health, <span className="text-teal-primary">Simplified</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Take control of your health journey with personalized care plans, real-time monitoring, and intelligent insights that adapt to your unique needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-teal-primary hover:bg-teal-dark text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
                >
                  Registration
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWatchDemo}
                  className="border-2 border-teal-primary text-teal-primary hover:bg-teal-primary hover:text-white px-8 py-4 text-lg font-semibold"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>24/7 Monitoring</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-light to-white p-8 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Blood Pressure</p>
                      <p className="text-2xl font-bold text-navy-primary">120/80</p>
                      <p className="text-sm text-green-600">Normal range</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Glucose Level</p>
                      <p className="text-2xl font-bold text-navy-primary">95 mg/dL</p>
                      <p className="text-sm text-green-600">Within target</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-800">Real-time monitoring active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-primary mb-4">
              Comprehensive Health Management
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From daily tracking to emergency alerts, Chronicare provides the tools you need for proactive health management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const colors = [
                { bg: "bg-red-100", text: "text-red-600", hover: "hover:bg-red-50" },
                { bg: "bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-50" },
                { bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-50" },
                { bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-50" },
                { bg: "bg-yellow-100", text: "text-yellow-600", hover: "hover:bg-yellow-50" },
                { bg: "bg-pink-100", text: "text-pink-600", hover: "hover:bg-pink-50" },
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <Card 
                  key={index} 
                  className={`hover:shadow-xl transition-all duration-300 border-slate-200 group cursor-pointer transform hover:-translate-y-2 ${colorScheme.hover}`}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 ${colorScheme.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-7 h-7 ${colorScheme.text}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold text-navy-primary group-hover:text-teal-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-primary via-slate-800 to-navy-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-primary/10 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-teal-primary/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-teal-primary rounded-full mr-2 animate-pulse"></div>
              <span className="text-teal-primary font-semibold text-sm">Join 10,000+ Health Champions</span>
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your 
            <span className="text-transparent bg-gradient-to-r from-teal-primary to-cyan-400 bg-clip-text"> Health Journey</span>?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users taking control of their health with personalized care plans, real-time monitoring, and intelligent insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleSignIn}
              size="lg" 
              className="bg-gradient-to-r from-teal-primary to-cyan-400 hover:from-teal-dark hover:to-cyan-500 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Your Free Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleWatchDemo}
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
            >
              Watch Demo Video
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-primary" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-primary" />
              <span>Real-time Monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-teal-primary" />
              <span>Personalized Care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-teal-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Chronicare</span>
              </div>
              <p className="text-slate-300 mb-4">
                Empowering individuals to take control of their health through innovative technology and personalized care.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
            <p>&copy; 2024 Chronicare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <DemoVideoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  );
}
