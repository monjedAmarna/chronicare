import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSystemSettings, updateSystemSettings, SystemSettings } from '@/api/systemSettings.api';
import { useToast } from '@/hooks/use-toast';

export const useSystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: (updatedSettings) => {
      toast({
        title: 'Settings updated successfully',
        description: 'System settings have been saved.',
      });
      
      // Update the cache with new settings
      queryClient.setQueryData(['systemSettings'], updatedSettings);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update settings',
        description: error?.message || 'An error occurred while saving settings.',
        variant: 'destructive',
      });
    },
  });

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    updateSettingsMutation.mutate(newSettings);
  };

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending
  };
}; 