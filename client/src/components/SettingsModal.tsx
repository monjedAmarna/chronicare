import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSystemSettings, SystemSettings } from '@/hooks/useSystemSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, isLoading, isError, updateSettings, isUpdating } = useSystemSettings();
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setErrors({});
    }
  }, [settings]);

  const handleInputChange = (key: keyof SystemSettings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate system name
    if (!formData.system_name?.trim()) {
      newErrors.system_name = 'System name is required';
    }

    // Validate notification email
    if (formData.notification_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.notification_email)) {
      newErrors.notification_email = 'Please enter a valid email address';
    }

    // Validate numeric fields
    const numericFields = ['max_alerts_displayed', 'session_timeout_minutes', 'max_login_attempts', 'password_min_length'];
    numericFields.forEach(field => {
      const value = formData[field as keyof SystemSettings];
      if (value && (isNaN(Number(value)) || Number(value) < 1)) {
        newErrors[field] = 'Must be a positive number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    updateSettings(formData);
    onClose();
  };

  const handleCancel = () => {
    // Reset form to original settings
    if (settings) {
      setFormData(settings);
    }
    setErrors({});
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load system settings. Please try again.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            System Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="system_name">System Name *</Label>
              <Input
                id="system_name"
                value={formData.system_name || ''}
                onChange={(e) => handleInputChange('system_name', e.target.value)}
                placeholder="Enter system name"
                className={errors.system_name ? 'border-red-500' : ''}
              />
              {errors.system_name && (
                <p className="text-sm text-red-500">{errors.system_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_language">Default Language</Label>
              <Select
                value={formData.default_language || 'en'}
                onValueChange={(value) => handleInputChange('default_language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_email">Notification Email</Label>
              <Input
                id="notification_email"
                type="email"
                value={formData.notification_email || ''}
                onChange={(e) => handleInputChange('notification_email', e.target.value)}
                placeholder="alerts@example.com"
                className={errors.notification_email ? 'border-red-500' : ''}
              />
              {errors.notification_email && (
                <p className="text-sm text-red-500">{errors.notification_email}</p>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout_minutes"
                type="number"
                min="1"
                value={formData.session_timeout_minutes || ''}
                onChange={(e) => handleInputChange('session_timeout_minutes', e.target.value)}
                className={errors.session_timeout_minutes ? 'border-red-500' : ''}
              />
              {errors.session_timeout_minutes && (
                <p className="text-sm text-red-500">{errors.session_timeout_minutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
              <Input
                id="max_login_attempts"
                type="number"
                min="1"
                value={formData.max_login_attempts || ''}
                onChange={(e) => handleInputChange('max_login_attempts', e.target.value)}
                className={errors.max_login_attempts ? 'border-red-500' : ''}
              />
              {errors.max_login_attempts && (
                <p className="text-sm text-red-500">{errors.max_login_attempts}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_min_length">Minimum Password Length</Label>
              <Input
                id="password_min_length"
                type="number"
                min="6"
                value={formData.password_min_length || ''}
                onChange={(e) => handleInputChange('password_min_length', e.target.value)}
                className={errors.password_min_length ? 'border-red-500' : ''}
              />
              {errors.password_min_length && (
                <p className="text-sm text-red-500">{errors.password_min_length}</p>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Display Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="max_alerts_displayed">Max Alerts Displayed</Label>
              <Input
                id="max_alerts_displayed"
                type="number"
                min="1"
                value={formData.max_alerts_displayed || ''}
                onChange={(e) => handleInputChange('max_alerts_displayed', e.target.value)}
                className={errors.max_alerts_displayed ? 'border-red-500' : ''}
              />
              {errors.max_alerts_displayed && (
                <p className="text-sm text-red-500">{errors.max_alerts_displayed}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance_mode"
                checked={formData.maintenance_mode === 'true'}
                onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked.toString())}
              />
              <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 