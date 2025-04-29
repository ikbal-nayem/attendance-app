import Toast, { ToastProps } from '@/components/Toast';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface ToastContextProps {
  showToast: (options: Omit<ToastProps, 'isVisible' | 'onHide'>) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastProps | null>(null);

  const showToast = useCallback(
    (options: Omit<ToastProps, 'isVisible' | 'onHide'>) => {
      setToastConfig({ ...options, isVisible: true, onHide: hideToast });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastConfig((prev: ToastProps | null) => {
      if (prev?.isVisible) {
        return { ...prev, isVisible: false };
      }
      setToastConfig(null);
      return null;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && <Toast {...toastConfig} onHide={hideToast} />}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
