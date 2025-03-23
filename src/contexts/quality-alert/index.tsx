import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Quality alert type
interface QualityAlert {
  id: string;
  type: 'issue' | 'expiration';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

// Context type
interface QualityAlertContextType {
  alerts: QualityAlert[];
  addAlert: (
    alert: Omit<QualityAlert, 'id' | 'timestamp' | 'resolved'>
  ) => void;
  resolveAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  unreadAlertsCount: number;
}

// Create context
const QualityAlertContext = createContext<QualityAlertContextType | undefined>(
  undefined
);

// Props type
interface QualityAlertProviderProps {
  children: ReactNode;
}

// Context provider
export const QualityAlertProvider: React.FC<QualityAlertProviderProps> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<QualityAlert[]>([
    {
      id: '1',
      type: 'issue',
      title: 'Quality Issue Detected',
      description:
        'Batch #A123 - Deterioration detected in dairy products section',
      timestamp: new Date(),
      resolved: false,
    },
    {
      id: '2',
      type: 'expiration',
      title: 'Expiration Alert',
      description: '15 items in produce section expire within 48 hours',
      timestamp: new Date(),
      resolved: false,
    },
  ]);

  // Unread alerts count
  const unreadAlertsCount = alerts.filter((alert) => !alert.resolved).length;

  // Add new alert
  const addAlert = (
    alert: Omit<QualityAlert, 'id' | 'timestamp' | 'resolved'>
  ) => {
    const newAlert: QualityAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Mark alert as resolved
  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <QualityAlertContext.Provider
      value={{
        alerts,
        addAlert,
        resolveAlert,
        deleteAlert,
        unreadAlertsCount,
      }}
    >
      {children}
    </QualityAlertContext.Provider>
  );
};

// Context hook
export const useQualityAlerts = () => {
  const context = useContext(QualityAlertContext);
  if (context === undefined) {
    throw new Error(
      'useQualityAlerts must be used within a QualityAlertProvider'
    );
  }
  return context;
};
