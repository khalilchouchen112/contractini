import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useContractStatusService } from '@/hooks/use-contract-status';
import { useCompany } from '@/hooks/use-company';

interface StatusNotificationProps {
  onDismiss?: () => void;
  autoCheck?: boolean;
  checkInterval?: number; // in minutes
}

export const ContractStatusNotification: React.FC<StatusNotificationProps> = ({
  onDismiss,
  autoCheck = false,
  checkInterval = 60, // 1 hour default
}) => {
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const { getExpiringContracts, isLoadingExpiring } = useContractStatusService();
  const { company } = useCompany();

  const checkForExpiringContracts = async () => {
    try {
      // Use company-specific notification settings
      const notificationDays = company?.settings?.contractNotifications?.expiringContractDays || 7;
      const notificationsEnabled = company?.settings?.contractNotifications?.enabled ?? true;
      const dashboardNotifications = company?.settings?.contractNotifications?.dashboardNotifications ?? true;
      
      // Only show notifications if enabled in company settings
      if (!notificationsEnabled || !dashboardNotifications) {
        setShowNotification(false);
        return;
      }
      
      const expiring = await getExpiringContracts(notificationDays);
      setExpiringContracts(expiring);
      setShowNotification(expiring.length > 0);
    } catch (error) {
      console.error('Error checking for expiring contracts:', error);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      // Initial check
      checkForExpiringContracts();
      
      // Set up interval based on company reminder frequency
      const frequency = company?.settings?.contractNotifications?.reminderFrequency || 'weekly';
      let intervalMinutes = checkInterval;
      
      // Override interval based on company settings
      switch (frequency) {
        case 'daily':
          intervalMinutes = 24 * 60; // 24 hours
          break;
        case 'weekly':
          intervalMinutes = 7 * 24 * 60; // 1 week
          break;
        case 'monthly':
          intervalMinutes = 30 * 24 * 60; // 30 days
          break;
      }
      
      const interval = setInterval(
        checkForExpiringContracts,
        intervalMinutes * 60 * 1000 // Convert minutes to milliseconds
      );

      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval, company?.settings?.contractNotifications]);

  const handleDismiss = () => {
    setShowNotification(false);
    onDismiss?.();
  };

  if (!showNotification || expiringContracts.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">
        Contracts Expiring Soon
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        <div className="mt-2">
          <p className="mb-2">
            {expiringContracts.length} contract{expiringContracts.length > 1 ? 's' : ''} 
            {expiringContracts.length === 1 ? ' is' : ' are'} expiring within the next{' '}
            {company?.settings?.contractNotifications?.expiringContractDays || 7} days:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {expiringContracts.slice(0, 3).map((contract) => (
              <li key={contract._id}>
                <strong>{contract.employee?.name || 'Unknown Employee'}</strong> 
                - {contract.type} expires on {new Date(contract.endDate).toLocaleDateString()}
              </li>
            ))}
            {expiringContracts.length > 3 && (
              <li className="text-orange-600 dark:text-orange-400">
                ...and {expiringContracts.length - 3} more
              </li>
            )}
          </ul>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900"
            onClick={() => {
              // Navigate to contracts page with expiring filter
              window.location.href = '/dashboard/contracts?status=expiring';
            }}
          >
            <Clock className="h-3 w-3 mr-1" />
            View All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
            onClick={handleDismiss}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
