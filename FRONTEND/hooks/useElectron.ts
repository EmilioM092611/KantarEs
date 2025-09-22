import { useEffect, useState } from 'react';

// Definir tipos para las APIs de Electron
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      showMessageBox: (options: any) => Promise<any>;
      onMenuAction: (callback: (event: any, action: string) => void) => void;
      removeMenuListener: () => void;
      platform: string;
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
      restaurant: {
        saveData: (data: any) => Promise<any>;
        loadData: () => Promise<any>;
        exportReport: (reportData: any) => Promise<any>;
      };
    };
    isElectron?: boolean;
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Verificar si estamos en Electron
    const electronAvailable = typeof window !== 'undefined' && window.electronAPI;
    setIsElectron(!!electronAvailable);

    if (electronAvailable) {
      // Obtener información de la aplicación
      window.electronAPI.getAppVersion().then(setAppVersion).catch(console.error);
      setPlatform(window.electronAPI.platform || '');

      // Configurar listeners para eventos del menú
      const handleMenuAction = (action: string) => {
        console.log('Menu action received:', action);
        // Manejar acciones del menú aquí
        switch (action) {
          case 'new':
            // Manejar acción "Nuevo"
            break;
          default:
            break;
        }
      };

      window.electronAPI.onMenuAction((event, action) => handleMenuAction(action));

      // Cleanup
      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeMenuListener();
        }
      };
    }
  }, []);

  // Funciones de utilidad
  const showDialog = async (options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
  }) => {
    if (!isElectron || !window.electronAPI) {
      // Fallback para navegador web
      alert(options.message);
      return { response: 0 };
    }

    try {
      return await window.electronAPI.showMessageBox({
        type: options.type || 'info',
        title: options.title || 'Información',
        message: options.message,
        detail: options.detail,
        buttons: options.buttons || ['OK'],
      });
    } catch (error) {
      console.error('Error showing dialog:', error);
      return { response: 0 };
    }
  };

  const saveRestaurantData = async (data: any) => {
    if (!isElectron || !window.electronAPI) {
      // Fallback para navegador - usar localStorage
      localStorage.setItem('restaurantData', JSON.stringify(data));
      return true;
    }

    try {
      return await window.electronAPI.restaurant.saveData(data);
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  const loadRestaurantData = async () => {
    if (!isElectron || !window.electronAPI) {
      // Fallback para navegador
      const saved = localStorage.getItem('restaurantData');
      return saved ? JSON.parse(saved) : null;
    }

    try {
      return await window.electronAPI.restaurant.loadData();
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  };

  const exportReport = async (reportData: any) => {
    if (!isElectron || !window.electronAPI) {
      // Fallback para navegador - descargar como JSON
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `reporte_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      return true;
    }

    try {
      return await window.electronAPI.restaurant.exportReport(reportData);
    } catch (error) {
      console.error('Error exporting report:', error);
      return false;
    }
  };

  return {
    isElectron,
    appVersion,
    platform,
    showDialog,
    saveRestaurantData,
    loadRestaurantData,
    exportReport,
  };
};