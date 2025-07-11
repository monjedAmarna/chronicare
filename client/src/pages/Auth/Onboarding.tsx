import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { updateProfile, UserProfile } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Phone, MapPin, Calendar, Activity, AlertCircle } from "lucide-react";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    dateOfBirth: "",
    phone: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    height: undefined,
    weight: undefined,
    bloodType: "",
  });
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Redirect based on user role
      if (user?.role === 'admin') {
        setLocation("/admin/dashboard");
      } else if (user?.role === 'doctor') {
        setLocation("/doctor/dashboard");
      } else {
        setLocation("/patient/dashboard");
      }
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "height" || name === "weight" ? parseFloat(value) || undefined : value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    updateProfileMutation.mutate(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.dateOfBirth && formData.phone && formData.gender;
      case 2:
        return formData.address && formData.city && formData.state;
      case 3:
        return formData.height && formData.weight && formData.bloodType;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Complete your profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Let's get to know you better to personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Address Information"}
              {currentStep === 3 && "Health Information"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "Where are you located?"}
              {currentStep === 3 && "Basic health information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {updateProfileMutation.isError && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">
                  Failed to update profile. Please try again.
                </span>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="pl-10"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={updateProfileMutation.isPending}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-slate-700">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      className="pl-10"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-slate-700">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                      placeholder="City"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium text-slate-700">
                      State/Province
                    </label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state || ""}
                      onChange={handleInputChange}
                      placeholder="State"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium text-slate-700">
                      ZIP/Postal Code
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode || ""}
                      onChange={handleInputChange}
                      placeholder="ZIP code"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium text-slate-700">
                      Country
                    </label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country || ""}
                      onChange={handleInputChange}
                      placeholder="Country"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Health Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="height" className="text-sm font-medium text-slate-700">
                      Height (cm)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        value={formData.height || ""}
                        onChange={handleInputChange}
                        placeholder="Height in cm"
                        className="pl-10"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium text-slate-700">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight || ""}
                        onChange={handleInputChange}
                        placeholder="Weight in kg"
                        className="pl-10"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bloodType" className="text-sm font-medium text-slate-700">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={updateProfileMutation.isPending}
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || updateProfileMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || updateProfileMutation.isPending}
              >
                {currentStep === 3
                  ? updateProfileMutation.isPending
                    ? "Completing..."
                    : "Complete Setup"
                  : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}